/* eslint-disable */
import React, {useState, useEffect, useMemo} from 'react';
import {
  FormProvider,
  useForm,
  useFieldArray,
  useFormContext,
  useWatch, // <-- Added
} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {z} from 'zod';
import GenericButton from '@/components/Forms/Buttons/GenericButton';
import GenericDropdown from '@/components/Forms/DropDown/GenericDropDown';
import GenericTable, {Column} from '@/components/Forms/Table/GenericTable';
import {
  useAssignExtraVendor,
  useGetAssignExtraVendorById,
} from '@/lib/react-query/queriesAndMutations/cateror/managerpost';
import {useGetVendorManpower} from '@/lib/react-query/queriesAndMutations/cateror/vendorManpower';
import {PlusIcon} from '@heroicons/react/24/outline';
import {MdDelete} from 'react-icons/md';

// Schema without 'total' field since it's calculated
const extraVendorRowSchema = z.object({
  vendorId: z.string().min(1, 'Vendor is required'),
  count: z
    .union([
      z.number().min(1, 'Count must be at least 1'),
      z.string().transform((val) => parseInt(val, 10)),
    ])
    .refine((val) => val >= 1, 'Count must be at least 1'),
  price: z
    .union([
      z.number().min(0, 'Price ≥ 0'),
      z.string().transform((val) => parseFloat(val)),
    ])
    .refine((val) => val >= 0, 'Price must be ≥ 0')
    .default(0),
});

const extraVendorArraySchema = z.object({
  vendors: z.array(extraVendorRowSchema).default([]),
});

type ExtraVendorFormValues = {
  vendors: {
    vendorId: string;
    count: number;
    price: number;
  }[];
};

interface ExtraVendorAssignmentProps {
  subevent: any;
  subeventId: string;
}

type VendorRow = {
  id: string;
  vendorId: string;
  count: number;
  price: number;
  index: number;
};

// NormalInput remains the same
const NormalInput: React.FC<{
  name: string;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
  min?: number;
  step?: string;
}> = ({name, type = 'text', placeholder, disabled, min, step = 'any'}) => {
  const {
    register,
    formState: {errors},
  } = useFormContext();

  const error = name.split('.').reduce((acc: any, part) => acc?.[part], errors);

  return (
    <div className="relative">
      <input
        {...register(name, {
          valueAsNumber: type === 'number',
          min:
            min !== undefined
              ? {
                  value: min,
                  message:
                    min === 1
                      ? 'Count must be at least 1'
                      : 'Price must be ≥ 0',
                }
              : undefined,
        })}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        min={min}
        step={step}
        className="w-full rounded border-[1.7px] border-stroke bg-transparent px-3 py-0.5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
      />
      {error && (
        <p className="mt-1 text-xs text-red-600">
          {error.message?.toString() || 'Invalid value'}
        </p>
      )}
    </div>
  );
};

const ExtraVendorAssignment: React.FC<ExtraVendorAssignmentProps> = ({
  subevent,
  subeventId,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {mutate: assignExtraVendorMutate} = useAssignExtraVendor();
  const {data: allvendors} = useGetVendorManpower();
  const {data: assignExtraVendorData} = useGetAssignExtraVendorById(subeventId);

  const extraVendorMethods = useForm<ExtraVendorFormValues>({
    resolver: zodResolver(extraVendorArraySchema),
    defaultValues: {
      vendors: [{vendorId: '', count: 0, price: 0}], // removed total
    },
  });

  const {control} = extraVendorMethods;

  const {
    fields: vendorFields,
    append: appendVendor,
    remove: removeVendor,
  } = useFieldArray({
    control: extraVendorMethods.control,
    name: 'vendors',
  });

  const realVendors = useMemo(
    () =>
      allvendors?.map((vendor: any) => ({
        value: vendor.id,
        label: vendor.name,
      })) || [],
    [allvendors],
  );

  const tableData = useMemo((): VendorRow[] => {
    return vendorFields.map((field, index) => ({
      id: field.id,
      vendorId: (field as any).vendorId,
      count: (field as any).count,
      price: (field as any).price,
      index,
    }));
  }, [vendorFields]);

  useEffect(() => {
    if (assignExtraVendorData?.data && assignExtraVendorData.data.length > 0) {
      const vendorMap = new Map<
        string,
        {vendorId: string; count: number; price: number}
      >();

      assignExtraVendorData.data.forEach((item: any) => {
        const vid = item.manpowerVendorId;
        const qty = item.quantity || 0;
        const prc = item.price || 0;

        if (vendorMap.has(vid)) {
          const existing = vendorMap.get(vid)!;
          vendorMap.set(vid, {
            vendorId: vid,
            count: existing.count + qty,
            price: prc,
          });
        } else {
          vendorMap.set(vid, {
            vendorId: vid,
            count: qty,
            price: prc,
          });
        }
      });

      const vendorsData = Array.from(vendorMap.values());
      extraVendorMethods.reset({
        vendors:
          vendorsData.length > 0
            ? vendorsData
            : [{vendorId: '', count: 0, price: 0}],
      });
    } else {
      extraVendorMethods.reset({
        vendors: [{vendorId: '', count: 0, price: 0}],
      });
    }
  }, [subeventId, assignExtraVendorData, extraVendorMethods]);

  const onSubmitExtraVendors = () => {
    if (!subeventId) return;

    const {vendors} = extraVendorMethods.getValues();
    const vendorMap = new Map<
      string,
      {vendorId: string; count: number; price: number}
    >();

    vendors.forEach((v) => {
      const count =
        typeof v.count === 'string' ? parseInt(v.count, 10) || 0 : v.count;
      const price =
        typeof v.price === 'string' ? parseFloat(v.price) || 0 : v.price;

      if (v.vendorId && count > 0 && price >= 0) {
        if (vendorMap.has(v.vendorId)) {
          const existing = vendorMap.get(v.vendorId)!;
          vendorMap.set(v.vendorId, {
            vendorId: v.vendorId,
            count: existing.count + count,
            price: price,
          });
        } else {
          vendorMap.set(v.vendorId, {
            vendorId: v.vendorId,
            count: count,
            price: price,
          });
        }
      }
    });

    const validVendors = Array.from(vendorMap.values());
    if (validVendors.length === 0) return;

    setIsSubmitting(true);
    assignExtraVendorMutate(
      {id: subeventId, data: validVendors},
      {
        onSuccess: () => {
          extraVendorMethods.reset({
            vendors: [{vendorId: '', count: 0, price: 0}],
          });
          setIsSubmitting(false);
        },
        onError: (error) => {
          console.error(error);
          setIsSubmitting(false);
        },
      },
    );
  };

  const handleDeleteVendor = (index: number) => {
    removeVendor(index);
  };

  // Live Total Calculator Component
  const TotalCell: React.FC<{index: number}> = ({index}) => {
    const count = useWatch({
      control,
      name: `vendors.${index}.count`,
      defaultValue: 0,
    }) as number;

    const price = useWatch({
      control,
      name: `vendors.${index}.price`,
      defaultValue: 0,
    }) as number;

    const total = Number((count || 0) * (price || 0));

    return (
      <div className="flex h-full items-center">
        <span className="font-medium text-black dark:text-white">
          {' '}
          ₹ {total}
        </span>
      </div>
    );
  };

  const columns: Column<VendorRow>[] = [
    {
      header: 'Vendor Name',
      accessor: 'vendorId',
      render: (item) => (
        <GenericDropdown
          name={`vendors.${item.index}.vendorId`}
          control={extraVendorMethods.control}
          defaultOption="Select Vendor"
          options={realVendors}
          placeholder="Select vendor"
        />
      ),
    },
    {
      header: 'Count',
      accessor: 'count',
      render: (item) => (
        <NormalInput
          name={`vendors.${item.index}.count`}
          type="number"
          placeholder="0"
          min={1}
          step="1"
        />
      ),
    },
    {
      header: 'Price',
      accessor: 'price',
      render: (item) => (
        <NormalInput
          name={`vendors.${item.index}.price`}
          type="number"
          placeholder="0.00"
          min={0}
          step="0.01"
        />
      ),
    },
    {
      header: 'Total',
      accessor: 'total',
      render: (item) => <TotalCell index={item.index} />,
    },
    {
      header: 'Actions',
      accessor: 'id',
      render: (item) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleDeleteVendor(item.index)}
            className="p-1 text-graydark transition-colors dark:text-gray-2"
            title="Remove Vendor"
          >
            <MdDelete className="h-4 w-4" />
          </button>
          {item.index === vendorFields.length - 1 && (
            <button
              type="button"
              onClick={() =>
                appendVendor({
                  vendorId: '',
                  count: 0,
                  price: 0,
                })
              }
              className="p-1 text-graydark transition-colors dark:text-gray-2"
              title="Add New Vendor"
            >
              <PlusIcon className="h-4 w-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <FormProvider {...extraVendorMethods}>
      <div className="mb-2 bg-orange-100">
        <h1 className="px-4 py-1 text-lg font-semibold text-graydark dark:text-orange-900">
          Extra Vendor Assignment
        </h1>
      </div>
      <form>
        <GenericTable
          data={tableData}
          columns={columns}
          searchAble={false}
          paginationOff={true}
        />

        {vendorFields.length === 0 && (
          <div className="py-8 text-center">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              No extra vendor assignments yet. Add a vendor to get started.
            </p>
            <button
              type="button"
              onClick={() =>
                appendVendor({
                  vendorId: '',
                  count: 0,
                  price: 0,
                })
              }
              className="mt-4 rounded bg-green-500 px-4 py-2 text-white transition-colors hover:bg-green-600"
            >
              Add First Vendor
            </button>
          </div>
        )}

        <div className="mt-6 flex justify-end space-x-4">
          <GenericButton
            type="button"
            onClick={onSubmitExtraVendors}
            disabled={isSubmitting}
            className="rounded bg-blue-500 px-6 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-600 disabled:opacity-50"
          >
            {isSubmitting ? (
              <div className="flex items-center space-x-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                <span>Saving...</span>
              </div>
            ) : (
              'Save'
            )}
          </GenericButton>
        </div>
      </form>
    </FormProvider>
  );
};

export default ExtraVendorAssignment;
