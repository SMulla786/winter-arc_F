/* eslint-disable */
import GenericButton from '@/components/Forms/Buttons/GenericButton';
import GenericInputField from '@/components/Forms/Input/GenericInputField';
import GenericTable, {Column} from '@/components/Forms/Table/GenericTable';
import {useAuthContext} from '@/context/AuthContext';
import {
  useDeleteAddOnService,
  useGetAddOnServices,
  useSaveAddonService,
  useUpdateAddOnService,
} from '@/lib/react-query/queriesAndMutations/cateror/addonservice';
import {addOnServiceSchema} from '@/lib/validation/addonserviceSchema';
import {zodResolver} from '@hookform/resolvers/zod';
import {useEffect, useRef, useState} from 'react';
import {FormProvider, useForm} from 'react-hook-form';
import toast from 'react-hot-toast';
import {z} from 'zod';
import {BiPlus, BiMinus} from 'react-icons/bi';
import {useAddOnServicesDraft} from '@/context/FormContext/AddOnServicesContext';

type PriceRange = {
  peopleFrom: number;
  peopleTo: number;
  price: number;
};

const addOnServiceExtendedSchema = addOnServiceSchema
  .extend({
    pricingType: z.enum(['fixed', 'range']),
    ranges: z
      .array(
        z.object({
          peopleFrom: z.number().min(0),
          peopleTo: z.number().min(1),
          price: z.number().min(0),
        }),
      )
      .optional(),
  })
  .refine(
    (data) =>
      data.pricingType === 'range'
        ? data.ranges && data.ranges.length > 0
        : true,
    {message: 'At least one range required', path: ['ranges']},
  );

type ExtendedFormValues = z.infer<typeof addOnServiceExtendedSchema>;

const AddOnService: React.FC = () => {
  const {user} = useAuthContext();
  const restriction = user?.employeeRestriction?.addonServicePage;
  const role = user?.role;
  const adminId = user?.id ?? '';

  const [showForm, setShowForm] = useState(false);
  const [addonServiceEditId, setAddonServiceEditId] = useState<string | null>(
    null,
  );
  const [pricingType, setPricingType] = useState<'fixed' | 'range'>('fixed');
  const [rangePrices, setRangePrices] = useState<PriceRange[]>([
    {peopleFrom: 0, peopleTo: 0, price: 0},
  ]);

  // Field-specific errors
  const [fromErrors, setFromErrors] = useState<string[]>([]);
  const [toErrors, setToErrors] = useState<string[]>([]);
  const [overlapErrors, setOverlapErrors] = useState<string[]>([]);

  const methods = useForm<ExtendedFormValues>({
    resolver: zodResolver(addOnServiceExtendedSchema),
    defaultValues: {pricingType: 'fixed', ranges: []},
  });

  const {data: allAddOnServices} = useGetAddOnServices(adminId);
  const {mutateAsync: saveAddOnService, isSuccess} =
    useSaveAddonService(adminId);
  const {mutateAsync: deleteAddOnService} = useDeleteAddOnService(adminId);
  const {mutateAsync: updateAddonService} = useUpdateAddOnService(adminId);

  // Edit mode
  useEffect(() => {
    if (addonServiceEditId && allAddOnServices) {
      const service = allAddOnServices.find((s) => s.id === addonServiceEditId);
      if (service) {
        if (
          service.pricingType === 'range' &&
          service.additionalServiceRanges?.length
        ) {
          const ranges = service.additionalServiceRanges.map((r) => ({
            peopleFrom: r.peopleFrom,
            peopleTo: r.peopleTo,
            price: r.price,
          }));
          setPricingType('range');
          setRangePrices(ranges);
          methods.reset({
            name: service.name,
            price: 0,
            pricingType: 'range',
            ranges,
          });
        } else {
          setPricingType('fixed');
          setRangePrices([{peopleFrom: 0, peopleTo: 0, price: 0}]);
          methods.reset({
            name: service.name,
            price: service.price || 0,
            pricingType: 'fixed',
            ranges: [],
          });
        }
        setShowForm(true);
      }
    }
  }, [addonServiceEditId, allAddOnServices, methods]);

  // Validation
  const validateRanges = (ranges: PriceRange[]) => {
    const fromErrs: string[] = [];
    const toErrs: string[] = [];
    const overlaps: string[] = new Array(ranges.length).fill('');

    ranges.forEach((r, i) => {
      let fromMsg = '';
      let toMsg = '';

      if (r.peopleFrom < 0) fromMsg = 'Must be ≥ 0';
      if (r.peopleTo < 1) toMsg = 'Must be ≥ 1';
      if (r.peopleFrom >= r.peopleTo && r.peopleTo !== 0) {
        fromMsg = fromMsg || 'Must be < To';
        toMsg = toMsg || 'Must be > From';
      }

      fromErrs[i] = fromMsg;
      toErrs[i] = toMsg;
    });

    // Overlap check
    for (let i = 0; i < ranges.length; i++) {
      for (let j = i + 1; j < ranges.length; j++) {
        const a = ranges[i];
        const b = ranges[j];
        if (a.peopleFrom <= b.peopleTo && a.peopleTo >= b.peopleFrom) {
          overlaps[i] = 'Overlaps with another range';
          overlaps[j] = 'Overlaps with another range';
        }
      }
    }

    setFromErrors(fromErrs);
    setToErrors(toErrs);
    setOverlapErrors(overlaps);
  };

  const hasErrors =
    fromErrors.some(Boolean) ||
    toErrors.some(Boolean) ||
    overlapErrors.some(Boolean);

  const updateRangeValue = (
    index: number,
    field: keyof PriceRange,
    value: number,
  ) => {
    const updated = [...rangePrices];
    updated[index][field] = value;
    setRangePrices(updated);
    methods.setValue('ranges', updated);
    validateRanges(updated);
  };

  const addRangeRow = () => {
    const updated = [...rangePrices, {peopleFrom: 0, peopleTo: 0, price: 0}];
    setRangePrices(updated);
    methods.setValue('ranges', updated);
    validateRanges(updated);
  };

  const removeRangeRow = (index: number) => {
    if (rangePrices.length > 1) {
      const updated = rangePrices.filter((_, i) => i !== index);
      setRangePrices(updated);
      methods.setValue('ranges', updated);
      validateRanges(updated);
    }
  };

  const handlePricingTypeChange = (type: 'fixed' | 'range') => {
    setPricingType(type);
    if (type === 'range') {
      const newRanges = [{peopleFrom: 0, peopleTo: 0, price: 0}];
      setRangePrices(newRanges);
      methods.setValue('ranges', newRanges);
      validateRanges(newRanges);
    } else {
      setRangePrices([{peopleFrom: 0, peopleTo: 0, price: 0}]);
      methods.setValue('ranges', []);
      setFromErrors([]);
      setToErrors([]);
      setOverlapErrors([]);
    }
  };

  const onSubmit = async (data: ExtendedFormValues) => {
    if (pricingType === 'range' && hasErrors) {
      toast.error('Please fix range errors');
      return;
    }

    const submissionData: any = {
      name: data.name,
      pricingType: pricingType,
      price: pricingType === 'fixed' ? data.price : 0,
      ranges: pricingType === 'range' ? data.ranges : [],
    };

    try {
      if (addonServiceEditId) {
        await updateAddonService({
          id: addonServiceEditId,
          data: submissionData,
        });
        // toast.success('Updated successfully');
      } else {
        await saveAddOnService(submissionData);
        // toast.success('Created successfully');
      }

      // Reset
      methods.reset({name: '', price: 0, pricingType: 'fixed', ranges: []});
      setShowForm(false);
      setPricingType('fixed');
      setRangePrices([{peopleFrom: 0, peopleTo: 0, price: 0}]);
      setAddonServiceEditId(null);
      setFromErrors([]);
      setToErrors([]);
      setOverlapErrors([]);
    } catch (err) {
      toast.error('Something went wrong');
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this addon service?')) deleteAddOnService(id);
  };

  const handleEdit = (row: any) => {
    setAddonServiceEditId(row.id);
  };

  // Table Data - One row per service
  const tableData =
    allAddOnServices?.map((service) => {
      let rangeText = '';
      let priceText = '';

      if (service.pricingType === 'fixed') {
        rangeText = 'Fixed Price';
        priceText = `₹${service.price}`;
      } else if (service.additionalServiceRanges?.length) {
        rangeText = service.additionalServiceRanges
          .map((r: any) => `${r.peopleFrom} - ${r.peopleTo}`)
          .join('\n');
        priceText = service.additionalServiceRanges
          .map((r: any) => `₹${r.price}`)
          .join('\n');
      }

      return {
        id: service.id,
        name: service.name,
        range: rangeText,
        price: priceText,
      };
    }) || [];

  const columns: Column<any>[] = [
    {
      header: 'Name',
      accessor: 'name',
      render: (row) => <span className="font-semibold">{row.name}</span>,
    },
    {
      header: 'Range',
      accessor: 'range',
      render: (row) => (
        <div className="text-gray-700 dark:text-gray-300 whitespace-pre-line text-sm">
          {row.range}
        </div>
      ),
    },
    {
      header: 'Price',
      accessor: 'price',
      render: (row) => (
        <div className="whitespace-pre-line text-sm font-medium text-green-600 dark:text-green-400">
          {row.price}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Buttons */}
      {(role === 'CATEROR' || restriction === 'EDIT') && (
        <div className="flex items-center justify-between">
          {showForm ? (
            <button
              onClick={() => {
                setShowForm(false);
                setAddonServiceEditId(null);
                methods.reset();
                setPricingType('fixed');
                setRangePrices([{peopleFrom: 0, peopleTo: 0, price: 0}]);
                setFromErrors([]);
                setToErrors([]);
                setOverlapErrors([]);
              }}
              className="text-xl font-bold"
            >
              ← Back
            </button>
          ) : (
            <div />
          )}
          {!showForm && (
            <GenericButton onClick={() => setShowForm(true)}>
              Add Addon Service
            </GenericButton>
          )}
        </div>
      )}

      {/* Form */}
      {showForm && (role === 'CATEROR' || restriction === 'EDIT') && (
        <FormProvider {...methods}>
          <form
            onSubmit={methods.handleSubmit(onSubmit)}
            className="space-y-8 rounded-lg bg-white p-8 shadow dark:bg-black"
          >
            <h2 className="text-2xl font-bold">
              {addonServiceEditId ? 'Edit' : 'Add'} Addon Service
            </h2>

            <GenericInputField
              name="name"
              label="Service Name"
              placeholder="Enter name"
            />

            {/* Pricing Type */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Pricing Type</label>
              <div className="flex gap-8">
                {(['fixed', 'range'] as const).map((type) => (
                  <label
                    key={type}
                    className="flex cursor-pointer items-center gap-2"
                  >
                    <input
                      type="radio"
                      value={type}
                      checked={pricingType === type}
                      onChange={() => handlePricingTypeChange(type)}
                      className="h-4 w-4 text-blue-600"
                    />
                    <span className="capitalize">
                      {type === 'fixed' ? 'Fixed Price' : 'People Wise'}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Fixed Price */}
            {pricingType === 'fixed' && (
              <GenericInputField
                name="price"
                label="Price (₹)"
                type="number"
                placeholder="0"
              />
            )}

            {/* Range Pricing */}
            {pricingType === 'range' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Price Ranges</h3>
                {rangePrices.map((range, i) => (
                  <div key={i} className="relative flex items-end gap-4">
                    {/* People From */}
                    <div className="flex-1">
                      <label className="mb-1 block text-sm font-medium">
                        People From
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={range.peopleFrom}
                          onChange={(e) =>
                            updateRangeValue(
                              i,
                              'peopleFrom',
                              parseInt(e.target.value) || 0,
                            )
                          }
                          className={`w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 dark:border-strokedark dark:bg-black dark:text-white ${
                            fromErrors[i] || overlapErrors[i]
                              ? 'border-red-500 focus:ring-red-500'
                              : 'border-gray-300 focus:ring-blue-500'
                          }`}
                        />
                        {(fromErrors[i] || overlapErrors[i]) && (
                          <p className="absolute -bottom-5 left-0 text-xs text-red-500">
                            {fromErrors[i] || overlapErrors[i]}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* People To */}
                    <div className="flex-1">
                      <label className="mb-1 block text-sm font-medium">
                        People To
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={range.peopleTo}
                          onChange={(e) =>
                            updateRangeValue(
                              i,
                              'peopleTo',
                              parseInt(e.target.value) || 0,
                            )
                          }
                          className={`w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 dark:border-strokedark dark:bg-black dark:text-white ${
                            toErrors[i] || overlapErrors[i]
                              ? 'border-red-500 focus:ring-red-500'
                              : 'border-gray-300 focus:ring-blue-500'
                          }`}
                        />
                        {(toErrors[i] || overlapErrors[i]) && (
                          <p className="absolute -bottom-5 left-0 text-xs text-red-500">
                            {toErrors[i] || overlapErrors[i]}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Price */}
                    <div className="flex-1">
                      <label className="mb-1 block text-sm font-medium">
                        Price (₹)
                      </label>
                      <input
                        type="number"
                        value={range.price}
                        onChange={(e) =>
                          updateRangeValue(
                            i,
                            'price',
                            parseInt(e.target.value) || 0,
                          )
                        }
                        className="w-full rounded border border-stroke px-3 py-2 text-sm dark:border-strokedark dark:bg-black dark:text-white"
                      />
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-2 pb-6">
                      {rangePrices.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeRangeRow(i)}
                          className="text-red-600"
                        >
                          <BiMinus size={22} />
                        </button>
                      )}
                      {i === rangePrices.length - 1 && (
                        <button
                          type="button"
                          onClick={addRangeRow}
                          className="text-blue-600"
                        >
                          <BiPlus size={22} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end">
              <GenericButton type="submit">
                {addonServiceEditId ? 'Update' : 'Save'}
              </GenericButton>
            </div>
          </form>
        </FormProvider>
      )}

      {/* Table */}
      {!showForm && (
        <GenericTable
          title="Existing Addon Services"
          columns={columns}
          data={tableData}
          itemsPerPage={15}
          action={role === 'CATEROR' || restriction === 'EDIT'}
          onEdit={handleEdit}
          onDelete={(row) => handleDelete(row.id)}
        />
      )}
    </div>
  );
};

export default AddOnService;
