/* eslint-disable */
import {useAuthContext} from '@/context/AuthContext';
import useColorMode from '@/hooks/useColorMode';
import {zodResolver} from '@hookform/resolvers/zod';
import React, {useEffect, useMemo} from 'react';
import {Controller, FormProvider, useForm} from 'react-hook-form';
import Select from 'react-select';
import {z} from 'zod';
import GenericButton from '../Forms/Buttons/GenericButton';
import GenericInputField from '../Forms/Input/GenericInputField';
import {
  useDishesWithCategories,
  useSaveLabourVendor,
  useUpdateLabourVendor,
} from './foodvendorapi';

/* ===================== SCHEMA ===================== */

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z
    .string({required_error: 'Phone is required'})
    .min(10, {message: 'Phone number must be at least 10 characters long'})
    .max(10, {message: 'Phone number must be at most 10 characters long'})
    .regex(/^\d+$/, {message: 'Phone number must contain only numbers'}),
  address: z.string().min(1, 'Address is required'),
  dailyCharges: z.string().min(1, 'Daily charges required'),
  transport: z.string().optional(),
  dishCategories: z.array(z.string()).optional(),
  dishes: z.array(z.string()).optional(),
});

type FormValues = z.infer<typeof schema>;

type Props = {
  vendor?: any;
  onSuccess: () => void;
  onCancel: () => void;
};

/* ===================== COMPONENT ===================== */

const LabourVendorForm: React.FC<Props> = ({vendor, onSuccess, onCancel}) => {
  const {user} = useAuthContext();
  const [colorMode] = useColorMode();
  const {mutateAsync: add} = useSaveLabourVendor();
  const {mutateAsync: update} = useUpdateLabourVendor(user?.id!);

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
    defaultValues: {
      transport: '0',
      dishCategories: [],
      dishes: [],
    },
  });

  const {handleSubmit, reset, watch, setValue, control} = methods;

  const selectedCategoryIds = watch('dishCategories') || [];

  /* ===================== FILTER DISHES ===================== */

  const filteredDishOptions = useMemo(() => {
    if (!selectedCategoryIds.length) return dishOptions;
    return dishOptions.filter((d) =>
      selectedCategoryIds.includes(d.categoryId),
    );
  }, [dishOptions, selectedCategoryIds]);

  /* ===================== RESET DISHES ON CATEGORY CHANGE ===================== */
  const isEditMode = !!vendor?.id;

  useEffect(() => {
    if (isEditMode) return;

    const currentDishes = methods.getValues('dishes') || [];

    const allowedDishIds = filteredDishOptions.map((d) => d.value);

    const stillValidDishes = currentDishes.filter((id) =>
      allowedDishIds.includes(id),
    );

    setValue('dishes', stillValidDishes);
  }, [selectedCategoryIds, filteredDishOptions, isEditMode, setValue, methods]);

  /* ===================== EDIT MODE ===================== */

  useEffect(() => {
    if (!vendor) return;

    const dishIds = vendor.foodVendorDishes?.map((fd: any) => fd.dishId) || [];

    const categoryIds = Array.from(
      new Set(
        vendor.foodVendorDishes
          ?.map((fd: any) => fd.dish?.categoryId)
          .filter(Boolean),
      ),
    );

    reset({
      name: vendor.name,
      phone: vendor.phone,
      address: vendor.address,
      dailyCharges: vendor.dailySalary?.toString() || '',
      transport: vendor.transport?.toString() || '0',
      dishCategories: categoryIds?.map((id: any) => id.toString()) || [],
      dishes: dishIds,
    });
  }, [vendor, reset]);

  /* ===================== SUBMIT ===================== */

  const onSubmit = async (data: FormValues) => {
    try {
      const payload = {
        id: vendor?.id,
        name: data.name,
        phone: data.phone,
        address: data.address,
        rawMaterialCalculation: false,
        dailySalary: Number(data.dailyCharges),
        transport: data.transport || '0',
        dishes: data.dishes?.map((dishId) => ({dishId})) || [],
      };

      if (vendor?.id) {
        await update({
          id: vendor.id,
          data: payload,
        });
      } else {
        await add(payload);
      }

      onSuccess();
    } catch {
      console.error('Failed to save labour vendor');
    }
  };

  /* ===================== STYLES ===================== */

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
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 rounded-lg bg-white p-4 shadow-md dark:bg-black"
      >
        <h2 className="text-lg font-bold">
          {vendor ? 'Edit' : 'Add'} Labour Vendor
        </h2>

        {/* BASIC INFO */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <GenericInputField
            name="name"
            label="Vendor Name"
            placeholder="Enter vendor name"
          />
          <GenericInputField
            name="phone"
            label="Phone"
            placeholder="Enter phone number"
            type="number"
          />
          <GenericInputField
            name="address"
            label="Address "
            placeholder="Enter Address"
          />
        </div>

        {/* CHARGES */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <GenericInputField
            name="dailyCharges"
            label="Daily Charges"
            type="number"
            placeholder="Enter Daily chnarges"
          />
          {/* <GenericInputField
            name="transport"
            label="Transport Charges"
            type="number"
            placeholder="Enter Transport charges"
          /> */}
        </div>

        {/* CATEGORY & DISH */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Dish Categories */}
          <Controller
            name="dishCategories"
            control={control}
            render={({field}) => (
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Dish Categories
                </label>
                <Select
                  {...field}
                  isMulti
                  options={dishCategoryOptions}
                  menuPortalTarget={document.body}
                  styles={{
                    ...selectStyles(colorMode || 'dark'),
                    menuPortal: (base) => ({...base, zIndex: 9999}),
                  }}
                  menuPosition="fixed"
                  menuShouldScrollIntoView={false}
                  components={{IndicatorSeparator: () => null}}
                  placeholder="Select categories"
                  value={dishCategoryOptions.filter((opt) =>
                    field.value?.includes(opt.value),
                  )}
                  onChange={(selected) =>
                    field.onChange(selected?.map((opt: any) => opt.value))
                  }
                />
              </div>
            )}
          />

          {/* Dishes */}
          <Controller
            name="dishes"
            control={control}
            render={({field}) => (
              <div>
                <label className="mb-1 block text-sm font-medium">Dishes</label>
                <Select
                  {...field}
                  isMulti
                  isDisabled={!selectedCategoryIds.length}
                  options={filteredDishOptions}
                  menuPortalTarget={document.body}
                  styles={{
                    ...selectStyles(colorMode || 'dark'),
                    menuPortal: (base) => ({...base, zIndex: 9999}),
                  }}
                  menuPosition="fixed"
                  menuShouldScrollIntoView={false}
                  components={{IndicatorSeparator: () => null}}
                  placeholder={
                    selectedCategoryIds.length > 0
                      ? 'Select dishes'
                      : 'Select the Categories first'
                  }
                  value={filteredDishOptions.filter((opt) =>
                    field.value?.includes(opt.value),
                  )}
                  onChange={(selected) =>
                    field.onChange(selected?.map((opt: any) => opt.value))
                  }
                />
              </div>
            )}
          />
        </div>

        {/* ACTIONS */}
        <div className="flex justify-end gap-4 pt-6">
          <button type="button" onClick={onCancel} className="btn btn-ghost">
            Cancel
          </button>
          <GenericButton type="submit" className="btn-success btn-lg">
            {vendor ? 'Update' : 'Save'}
          </GenericButton>
        </div>
      </form>
    </FormProvider>
  );
};

export default LabourVendorForm;
