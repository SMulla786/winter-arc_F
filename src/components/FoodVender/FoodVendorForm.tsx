/* eslint-disable */
import {useAuthContext} from '@/context/AuthContext';
import useColorMode from '@/hooks/useColorMode';
import {zodResolver} from '@hookform/resolvers/zod';
import React, {useEffect, useMemo, useState} from 'react';
import {
  Controller,
  FormProvider,
  useFieldArray,
  useForm,
  useWatch,
} from 'react-hook-form';
import Select from 'react-select';
import {z} from 'zod';
import GenericButton from '../Forms/Buttons/GenericButton';
import {
  useDishesWithCategories,
  useSaveFoodVendor,
  useUpdateFoodVendor,
} from './foodvendorapi';
import {MdDelete, MdAdd} from 'react-icons/md';
import GenericInputField from '../Forms/Input/GenericInputField';

/* ===================== SCHEMA ===================== */

const rangeSchema = z
  .object({
    from: z
      .string()
      .min(1, 'From is required')
      .regex(/^\d+$/, 'Must be a positive number'),
    to: z
      .string()
      .min(1, 'To is required')
      .regex(/^\d+$/, 'Must be a positive number'),
  })
  .refine((data) => Number(data.from) < Number(data.to), {
    message: 'From must be less than To',
    path: ['to'],
  });

// Custom refinement to detect overlapping ranges
const rangesArraySchema = z
  .array(rangeSchema)
  .min(1, 'At least one valid range is required')
  .refine(
    (ranges) => {
      for (let i = 0; i < ranges.length; i++) {
        for (let j = i + 1; j < ranges.length; j++) {
          const aFrom = Number(ranges[i].from);
          const aTo = Number(ranges[i].to);
          const bFrom = Number(ranges[j].from);
          const bTo = Number(ranges[j].to);

          if (!(aTo < bFrom || bTo < aFrom)) {
            return false;
          }
        }
      }
      return true;
    },
    {message: 'Ranges cannot overlap'},
  );

const schema = z.object({
  name: z.string().min(1, 'Vendor name is required'),
  phone: z
    .string({required_error: 'Phone is required'})
    .min(10, {message: 'Phone number must be at least 10 characters long'})
    .max(10, {message: 'Phone number must be at most 10 characters long'})
    .regex(/^\d+$/, {message: 'Phone number must contain only numbers'}),
  address: z.string().min(1, 'Address is required'),
  transport: z.string().optional(),
  dishCategories: z.array(z.string()).optional(),
  dishes: z.array(z.string()).min(1, 'At least one dish must be selected'),
  ranges: rangesArraySchema,
  dishRates: z
    .record(
      z.record(z.string().regex(/^\d*$/, 'Rate must be a number').optional()),
    )
    .optional(),
});

type FormValues = z.infer<typeof schema>;

type Props = {
  vendor?: any;
  onSuccess: () => void;
  onCancel: () => void;
};

/* ===================== COMPONENT ===================== */

const FoodVendorForm: React.FC<Props> = ({vendor, onSuccess, onCancel}) => {
  const {user} = useAuthContext();
  const [colorMode] = useColorMode();
  const [showRateTable, setShowRateTable] = useState(false);

  const {mutateAsync: add, isSuccess} = useSaveFoodVendor();
  const {mutateAsync: update} = useUpdateFoodVendor();
  const {data: dishesWithCategories} = useDishesWithCategories();

  /* ===================== OPTIONS ===================== */

  const dishCategoryOptions = useMemo(() => {
    if (!dishesWithCategories) return [];
    return dishesWithCategories.map((cat: any) => ({
      label: cat.name,
      value: cat.id,
    }));
  }, [dishesWithCategories]);

  const dishOptions = useMemo(() => {
    if (!dishesWithCategories) return [];
    return dishesWithCategories.flatMap((cat: any) =>
      (cat.dishes || []).map((dish: any) => ({
        label: dish.name,
        value: dish.id,
        categoryId: cat.id,
      })),
    );
  }, [dishesWithCategories]);

  /* ===================== FORM ===================== */

  const methods = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    reValidateMode: 'onChange', // Ensures live re-validation
    defaultValues: {
      name: '',
      phone: '',
      address: '',
      transport: '0',
      dishCategories: [],
      dishes: [],
      ranges: [{from: '', to: ''}],
      dishRates: {},
    },
  });

  const {
    handleSubmit,
    reset,
    watch,
    setValue,
    control,
    register,
    formState: {errors, isSubmitting},
  } = methods;

  const selectedCategoryIds = watch('dishCategories') || [];
  const selectedDishes = watch('dishes') || [];
  const ranges = useWatch({
    control,
    name: 'ranges',
  });
  const isEditMode = !!vendor?.id;

  /* ===================== FIELD ARRAY ===================== */

  const {
    fields: rangeFields,
    append: addRange,
    remove: removeRange,
  } = useFieldArray({
    control,
    name: 'ranges',
  });

  useEffect(() => {
    if (rangeFields.length === 0) {
      addRange({from: '', to: ''});
    }
  }, [rangeFields.length, addRange]);

  /* ===================== FILTER DISHES ===================== */

  const filteredDishOptions = useMemo(() => {
    if (!selectedCategoryIds.length) return dishOptions;
    return dishOptions.filter((d) =>
      selectedCategoryIds.includes(d.categoryId),
    );
  }, [dishOptions, selectedCategoryIds]);

  useEffect(() => {
    if (isEditMode) return;

    const currentDishes = methods.getValues('dishes') || [];

    const allowedDishIds = filteredDishOptions.map((d) => d.value);

    const stillValidDishes = currentDishes.filter((id) =>
      allowedDishIds.includes(id),
    );

    setValue('dishes', stillValidDishes);
  }, [selectedCategoryIds, filteredDishOptions, isEditMode, setValue, methods]);

  /* ===================== SHOW RATE TABLE - LIVE WHILE TYPING ===================== */

  useEffect(() => {
    const hasDishes = selectedDishes.length > 0;
    const hasAnyCompleteRange = ranges.some(
      (r) =>
        r.from &&
        r.to &&
        /^\d+$/.test(r.from) &&
        /^\d+$/.test(r.to) &&
        Number(r.from) < Number(r.to),
    );

    setShowRateTable(hasDishes && hasAnyCompleteRange);
  }, [selectedDishes, ranges]);

  /* ===================== VALID RANGES - FOR RATE TABLE ===================== */

  const validRanges = useMemo(() => {
    return ranges
      .map((r) => ({
        from: r.from,
        to: r.to,
        fromNum: r.from ? Number(r.from) : NaN,
        toNum: r.to ? Number(r.to) : NaN,
      }))
      .filter(
        (r) =>
          r.from &&
          r.to &&
          !isNaN(r.fromNum) &&
          !isNaN(r.toNum) &&
          r.fromNum < r.toNum,
      )
      .map(({from, to}) => ({from, to}));
  }, [ranges]);

  /* ===================== OVERLAP DETECTION - LIVE WHILE TYPING ===================== */

  const overlappingIndices = useMemo(() => {
    const indices = new Set<number>();

    const candidateRanges = ranges
      .map((r, idx) => ({
        idx,
        from: r.from ? Number(r.from) : NaN,
        to: r.to ? Number(r.to) : NaN,
      }))
      .filter((r) => !isNaN(r.from) && !isNaN(r.to) && r.from < r.to);

    for (let i = 0; i < candidateRanges.length; i++) {
      for (let j = i + 1; j < candidateRanges.length; j++) {
        const a = candidateRanges[i];
        const b = candidateRanges[j];
        if (!(a.to < b.from || b.to < a.from)) {
          indices.add(a.idx);
          indices.add(b.idx);
        }
      }
    }

    return indices;
  }, [ranges]);

  /* ===================== EDIT MODE ===================== */

  useEffect(() => {
    if (!vendor || !vendor.foodVendorDishes) return;

    const dishIds = vendor.foodVendorDishes.map((item: any) => item.dishId);

    const categoryIds = Array.from(
      new Set(
        vendor.foodVendorDishes
          .map((item: any) => item.dish?.categoryId)
          .filter(Boolean),
      ),
    );

    const allRangesSet = new Set<string>();
    const allRanges: {from: string; to: string}[] = [];

    const dishRatesTemp: Record<string, Record<string, string>> = {};

    vendor.foodVendorDishes.forEach((item: any) => {
      const dishId = item.dishId;
      dishRatesTemp[dishId] = {};

      item.foodVendorRanges?.forEach((range: any) => {
        const from = range.from?.toString();
        const to = range.to?.toString();
        const rate = range.rate?.toString() || '0';
        const key = `${from}-${to}`;

        dishRatesTemp[dishId][key] = rate;

        const rangeKey = `${from}-${to}`;
        if (!allRangesSet.has(rangeKey)) {
          allRangesSet.add(rangeKey);
          allRanges.push({from, to});
        }
      });
    });

    allRanges.sort((a, b) => Number(a.from) - Number(b.from));

    reset({
      name: vendor.name || '',
      phone: vendor.phone || '',
      address: vendor.address || '',
      transport: vendor.transport?.toString() || '0',
      dishCategories: categoryIds,
      dishes: dishIds,
      ranges: allRanges.length > 0 ? allRanges : [{from: '', to: ''}],
      dishRates: dishRatesTemp,
    });

    setShowRateTable(true);
  }, [vendor, reset]);

  /* ===================== SUBMIT ===================== */

  const onSubmit = async (data: FormValues) => {
    try {
      const dishesPayload = data.dishes.map((dishId) => {
        const range = validRanges.map((r) => {
          const key = `${r.from}-${r.to}`;
          const rate = data.dishRates?.[dishId]?.[key] || '0';
          return {
            from: r.from,
            to: r.to,
            rate: rate.trim() === '' ? '0' : rate,
          };
        });

        return {
          dishId,
          range,
        };
      });

      const payload = {
        name: data.name,
        phone: data.phone,
        address: data.address,
        transport: data.transport || '0',
        rawMaterialCalculation: true,
        dishes: dishesPayload,
      };

      if (isEditMode) {
        await update({id: vendor.id, data: payload});
      } else {
        await add(payload);
      }
    } catch (error: any) {
      const errorData = error.response?.data;
      if (errorData) {
        console.error(`Failed to save food vendor: ${errorData.message}`);
      } else {
        console.error('Failed to save food vendor:', error);
      }
    }
  };

  const onError = (errors: any) => {
    console.error('Form errors:', errors);
  };

  /* ===================== SELECT STYLES ===================== */

  const selectStyles = (theme: string) => {
    const isDark = theme === 'dark';
    return {
      control: (base, state) => ({
        ...base,
        minHeight: '28px',
        backgroundColor: isDark ? '#1d2a39' : '#FFFFFF',
        borderColor: state.isFocused
          ? isDark
            ? '#3d4d60'
            : '#3C50E0'
          : isDark
            ? '#2E3A47'
            : '#E2E8F0',
        boxShadow: 'none',
        ':hover': {borderColor: isDark ? '#3d4d60' : '#3C50E0'},
        height: 'auto',
        maxHeight: 'none',
        overflow: 'visible',
      }),
      valueContainer: (base) => ({
        ...base,
        padding: '0 6px',
        height: 'auto',
        display: 'flex',
        flexWrap: 'wrap',
        maxHeight: 'none',
        overflowY: 'visible',
      }),
      input: (base) => ({
        ...base,
        margin: 0,
        padding: 0,
      }),
      clearIndicator: (base, state) => ({
        ...base,
        display: state.isMulti ? 'none' : 'flex',
      }),
      indicatorsContainer: (base) => ({
        ...base,
        height: '28px',
      }),
      dropdownIndicator: (base) => ({
        ...base,
        padding: '2px',
      }),
      menu: (base) => ({
        ...base,
        backgroundColor: isDark ? '#1A222C' : '#FFFFFF',
        zIndex: 9999,
      }),
      option: (base, state) => ({
        ...base,
        backgroundColor: state.isSelected
          ? isDark
            ? '#24303F'
            : '#EFF4FB'
          : state.isFocused
            ? isDark
              ? '#333A48'
              : '#F7F9FC'
            : isDark
              ? '#1A222C'
              : '#FFFFFF',
        color: isDark ? '#DEE4EE' : '#1C2434',
        cursor: 'pointer',
      }),
      placeholder: (base) => ({
        ...base,
        color: isDark ? '#8A99AF' : '#64748B',
      }),
      singleValue: (base) => ({
        ...base,
        color: isDark ? '#DEE4EE' : '#1C2434',
      }),
      multiValue: (base) => ({
        ...base,
        backgroundColor: isDark ? '#333A48' : '#EFF4FB',
        borderRadius: 4,
        padding: '0 4px',
        margin: '2px 4px',
        height: '20px',
        display: 'flex',
        alignItems: 'center',
      }),
      multiValueLabel: (base) => ({
        ...base,
        color: isDark ? '#F1F5F9' : '#1C2434',
        fontSize: '11px',
        padding: 0,
        lineHeight: '20px',
      }),
      multiValueRemove: (base) => ({
        ...base,
        color: isDark ? '#F5F7FD' : '#1C2434',
        padding: '0 2px',
        ':hover': {
          backgroundColor: isDark ? '#2E3A47' : '#E5E7EB',
          color: isDark ? '#FFFFFF' : '#000000',
        },
      }),
    };
  };

  /* ===================== UI ===================== */

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(onSubmit, onError)}
        className="space-y-6 rounded-lg bg-white p-4 shadow-md dark:bg-black"
      >
        <h2 className="text-lg font-bold">
          {vendor ? 'Edit' : 'Add'} Food Vendor
        </h2>

        {/* BASIC INFO */}
        <div className="grid gap-4 md:grid-cols-4">
          <GenericInputField
            name="name"
            label="Vendor Name"
            placeholder="Enter Vendor Name"
            required
          />
          <GenericInputField
            name="phone"
            label="Phone"
            placeholder="Enter Phone Number"
            type="number"
            required
          />
          <GenericInputField
            name="address"
            label="Address"
            placeholder="Enter Address"
            required
          />
          {/* <GenericInputField
            name="transport"
            label="Transport"
            type="number"
            placeholder="0"
          /> */}
        </div>

        {/* CATEGORY & DISH */}
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">
              Dish Categories
            </label>
            <Controller
              name="dishCategories"
              control={control}
              render={({field}) => (
                <Select
                  {...field}
                  isMulti
                  options={dishCategoryOptions}
                  styles={{
                    ...selectStyles(colorMode || 'dark'),
                    menuPortal: (base) => ({...base, zIndex: 9999}),
                  }}
                  placeholder="Select Categories"
                  value={dishCategoryOptions.filter((o) =>
                    field.value?.includes(o.value),
                  )}
                  onChange={(v) => field.onChange(v.map((x: any) => x.value))}
                />
              )}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Dishes</label>
            <Controller
              name="dishes"
              control={control}
              render={({field}) => (
                <Select
                  {...field}
                  isMulti
                  isDisabled={!selectedCategoryIds.length}
                  options={filteredDishOptions}
                  styles={{
                    ...selectStyles(colorMode || 'dark'),
                    menuPortal: (base) => ({...base, zIndex: 9999}),
                  }}
                  placeholder="Select Dishes"
                  value={filteredDishOptions.filter((o) =>
                    field.value?.includes(o.value),
                  )}
                  onChange={(v) => field.onChange(v.map((x: any) => x.value))}
                />
              )}
            />
            {errors.dishes && (
              <p className="mt-1 text-sm text-red-600">
                {errors.dishes.message}
              </p>
            )}
          </div>
        </div>

        {/* RANGES TABLE */}
        <div className="space-y-4">
          <h3 className="font-semibold">Ranges (From → To)</h3>
          <div className="overflow-x-auto">
            <table className="table-zebra table w-full">
              <thead className="bg-gray-2 dark:bg-graydark">
                <tr>
                  <th className="text-left">From</th>
                  <th className="text-left">To</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rangeFields.map((field, index) => {
                  const hasOverlap = overlappingIndices.has(index);
                  const rangeError = errors.ranges?.[index];

                  return (
                    <tr key={field.id}>
                      <td className="p-2">
                        <div>
                          <input
                            type="number"
                            {...register(`ranges.${index}.from`, {
                              onChange: () => {
                                methods.trigger('ranges');
                              },
                            })}
                            placeholder="0"
                            className="w-full rounded border-[1.7px] border-stroke bg-transparent px-3 text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                          />
                          {rangeError?.from && (
                            <p className="mt-1 text-xs text-red-600">
                              {rangeError.from.message}
                            </p>
                          )}
                          {hasOverlap && (
                            <p className="mt-1 text-xs text-red-600">
                              Range overlaps with another
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="p-2">
                        <div>
                          <input
                            type="number"
                            {...register(`ranges.${index}.to`, {
                              onChange: () => {
                                methods.trigger('ranges');
                              },
                            })}
                            placeholder="100"
                            className="w-full rounded border-[1.7px] border-stroke bg-transparent px-3 text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                          />
                          {rangeError?.to && (
                            <p className="mt-1 text-xs text-red-600">
                              {rangeError.to.message}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="text-center">
                        <div className="flex items-center justify-center gap-3">
                          {rangeFields.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeRange(index)}
                              className="btn btn-error btn-xs"
                            >
                              <MdDelete size={18} />
                            </button>
                          )}
                          {index === rangeFields.length - 1 && (
                            <button
                              type="button"
                              onClick={() => addRange({from: '', to: ''})}
                              className="btn btn-primary btn-xs"
                            >
                              <MdAdd size={18} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {errors.ranges?.message && overlappingIndices.size === 0 && (
            <p className="text-sm text-red-600">{errors.ranges.message}</p>
          )}
        </div>

        {/* RATE TABLE */}
        {showRateTable &&
          validRanges.length > 0 &&
          selectedDishes.length > 0 && (
            <div className="mt-8">
              <h3 className="mb-4 text-lg font-semibold">
                Dish Rates by Range
              </h3>
              <div className="overflow-x-auto">
                <table className="table-zebra table w-full">
                  <thead className="sticky top-0 z-10 bg-gray-2 dark:bg-graydark">
                    <tr>
                      <th className="px-6 py-3 text-left">Dish Name</th>
                      {validRanges.map((r, i) => (
                        <th key={i} className="min-w-32 px-6 py-3 text-center">
                          {r.from} – {r.to}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {selectedDishes.map((dishId) => {
                      const dishLabel =
                        dishOptions.find((d) => d.value === dishId)?.label ||
                        'Unknown Dish';

                      return (
                        <tr key={dishId}>
                          <td className="whitespace-nowrap px-6 py-4 font-medium">
                            {dishLabel}
                          </td>
                          {validRanges.map((r) => {
                            const key = `${r.from}-${r.to}`;
                            return (
                              <td key={key} className="px-6 py-4 text-center">
                                <Controller
                                  name={`dishRates.${dishId}.${key}`}
                                  control={control}
                                  render={({field}) => (
                                    <input
                                      {...field}
                                      type="number"
                                      placeholder="0"
                                      defaultValue=""
                                      className="input input-bordered input-sm w-24 text-center"
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        if (val === '' || /^\d*$/.test(val)) {
                                          field.onChange(val);
                                        }
                                      }}
                                      value={field.value ?? ''}
                                    />
                                  )}
                                />
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        {/* ACTIONS */}
        <div className="flex justify-end gap-4 pt-6">
          <button type="button" onClick={onCancel} className="btn btn-ghost">
            Cancel
          </button>
          <GenericButton type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : vendor ? 'Update' : 'Save'}
          </GenericButton>
        </div>
      </form>
    </FormProvider>
  );
};

export default FoodVendorForm;
