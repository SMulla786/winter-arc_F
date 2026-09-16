/*eslint-disable*/
import {useAuthContext} from '@/context/AuthContext';
import useColorMode from '@/hooks/useColorMode';
import {zodResolver} from '@hookform/resolvers/zod';
import React, {useEffect, useMemo, useState} from 'react';
import {
  Controller,
  FormProvider,
  useForm,
  useFieldArray,
} from 'react-hook-form';
import Select from 'react-select';
import {z} from 'zod';
import GenericButton from '../Forms/Buttons/GenericButton';
import {
  BiPlus,
  BiTrash,
  BiPackage,
  BiChevronDown,
  BiChevronUp,
  BiChevronLeft,
  BiChevronRight,
} from 'react-icons/bi';
import {
  useGetClubVendor,
  useSaveClubVendor,
  useUpdateClubVendor,
} from '@/lib/react-query/clubvendor/clubvendor';
import {useDishesWithCategories} from './foodvendorapi';
import toast from 'react-hot-toast';

/* ===================== SCHEMA ===================== */
const subpackageSchema = z.object({
  count: z.coerce.number().min(0, 'Count must be at least 0'), // Changed from min(1) to min(0)
  dishes: z.array(z.string()).min(1, 'At least one dish is required'),
  dishCategories: z.array(z.string()).optional(),
});

const packageSchema = z.object({
  name: z.string().min(1, 'Package name is required'),
  price: z.coerce.number().min(0, 'Price must be greater than or equal to 0'), // Updated message
  subpackages: z
    .array(subpackageSchema)
    .min(1, 'At least one subpackage is required'),
});

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z
    .string({required_error: 'Phone is required'})
    .min(10, {message: 'Phone number must be at least 10 characters long'})
    .max(10, {message: 'Phone number must be at most 10 characters long'})
    .regex(/^\d+$/, {message: 'Phone number must contain only numbers'}),
  address: z.string().min(1, 'Address is required'),
  email: z
    .string()
    .email('Invalid email address')
    .optional()
    .or(z.literal(''))
    .transform((val) => (val === '' ? undefined : val)),
  packages: z.array(packageSchema),
});

type FormValues = z.infer<typeof schema>;

type Props = {
  vendor?: any;
  onSuccess: () => void;
  onCancel: () => void;
};

/* ===================== COMPONENT ===================== */
const ClubVendorForm: React.FC<Props> = ({vendor, onSuccess, onCancel}) => {
  const {user} = useAuthContext();
  const [colorMode] = useColorMode();
  const {mutateAsync: add} = useSaveClubVendor();
  const {mutateAsync: update} = useUpdateClubVendor();
  const {data: dishesWithCategories} = useDishesWithCategories();
  const {data: getclubVendors, isLoading: isLoadingVendor} = useGetClubVendor(
    vendor?.id || '',
  );

  /* ===================== STATE ===================== */
  const [expandedPackages, setExpandedPackages] = useState<{
    [key: number]: boolean;
  }>({
    0: true,
  });
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  /* ===================== EFFECTS ===================== */
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  /* ===================== FORM ===================== */
  const methods = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      phone: '',
      address: '',
      email: '',
      packages: [
        {
          name: '',
          price: 0,
          subpackages: [
            {
              count: 0, // Changed from 1 to 0
              dishes: [],
              dishCategories: [],
            },
          ],
        },
      ],
    },
  });

  const {
    handleSubmit,
    reset,
    watch,
    setValue,
    control,
    register,
    formState: {errors},
  } = methods;

  const {
    fields: packageFields,
    append: appendPackage,
    remove: removePackage,
  } = useFieldArray({
    control,
    name: 'packages',
  });

  /* ===================== PACKAGE MANAGEMENT ===================== */
  const addPackage = () => {
    const newIndex = packageFields.length;
    appendPackage({
      name: '',
      price: 0,
      subpackages: [
        {
          count: 0, // Changed from 1 to 0
          dishes: [],
          dishCategories: [],
        },
      ],
    });
    setExpandedPackages((prev) => ({
      ...prev,
      [newIndex]: true,
    }));
  };

  const togglePackage = (index: number) => {
    setExpandedPackages((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const removePackageItem = (index: number) => {
    if (packageFields.length > 1) {
      removePackage(index);
      const newExpanded = {...expandedPackages};
      delete newExpanded[index];
      const updatedExpanded: {[key: number]: boolean} = {};
      Object.keys(newExpanded).forEach((key) => {
        const idx = parseInt(key);
        if (idx > index) {
          updatedExpanded[idx - 1] = newExpanded[idx];
        } else {
          updatedExpanded[idx] = newExpanded[idx];
        }
      });
      setExpandedPackages(updatedExpanded);
    }
  };

  const addSubpackage = (packageIndex: number) => {
    const currentSubpackages =
      watch(`packages.${packageIndex}.subpackages`) || [];
    setValue(`packages.${packageIndex}.subpackages`, [
      ...currentSubpackages,
      {
        count: 0, // Changed from 1 to 0
        dishes: [],
        dishCategories: [],
      },
    ]);
  };

  const removeSubpackage = (packageIndex: number, subIndex: number) => {
    const currentSubpackages =
      watch(`packages.${packageIndex}.subpackages`) || [];
    if (currentSubpackages.length > 1) {
      const updatedSubpackages = [...currentSubpackages];
      updatedSubpackages.splice(subIndex, 1);
      setValue(`packages.${packageIndex}.subpackages`, updatedSubpackages);
    }
  };

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
    const options = dishesWithCategories.flatMap((cat: any) =>
      (cat.dishes || []).map((dish: any) => ({
        label: dish.name || `Dish ${dish.id}`,
        value: dish.id,
        categoryId: cat.id,
        categoryName: cat.name,
      })),
    );
    return options;
  }, [dishesWithCategories]);

  const getFilteredDishes = (packageIndex: number, subIndex: number) => {
    const selectedCategories =
      watch(
        `packages.${packageIndex}.subpackages.${subIndex}.dishCategories`,
      ) || [];
    if (selectedCategories.length === 0) {
      return dishOptions;
    }
    return dishOptions.filter((dish) =>
      selectedCategories.includes(dish.categoryId),
    );
  };

  /* ===================== LOAD VENDOR DATA FOR EDIT ===================== */
  useEffect(() => {
    const loadVendorData = async () => {
      if (!vendor?.id) return;
      if (!dishesWithCategories || isLoadingVendor) return;

      setIsFormLoading(true);
      try {
        const vendorData = getclubVendors?.data || getclubVendors;
        if (!vendorData) {
          setIsFormLoading(false);
          return;
        }

        let packagesData = [];
        if (Array.isArray(vendorData)) {
          packagesData = vendorData;
        } else if (vendorData.data && Array.isArray(vendorData.data)) {
          packagesData = vendorData.data;
        } else {
          packagesData = vendorData.packages || vendorData.subPackages || [];
        }

        const transformedPackages = packagesData.map(
          (pkg: any, index: number) => {
            if (pkg.subPackages && Array.isArray(pkg.subPackages)) {
              const subpackages = pkg.subPackages.map((sub: any) => {
                const dishIds = (sub.dishes || []).map((dish: any) => dish.id);
                const categoryIds = sub.category?.id ? [sub.category.id] : [];
                return {
                  count: sub.count || 0, // Changed from 1 to 0
                  dishes: dishIds,
                  dishCategories: categoryIds,
                };
              });
              return {
                name: pkg.name || `Package ${index + 1}`,
                price: pkg.price || 0,
                subpackages: subpackages,
              };
            }
            return {
              name: pkg.name || `Package ${index + 1}`,
              price: pkg.price || 0,
              subpackages: [],
            };
          },
        );

        const expandedState: {[key: number]: boolean} = {};
        transformedPackages.forEach((_: any, index: number) => {
          expandedState[index] = true;
        });

        const vendorInfo = {
          name: vendor.name || vendorData.name || '',
          phone: vendor.phone || vendorData.phone || '',
          address: vendor.address || vendorData.address || '',
          email: vendor.email || vendorData.email || '',
          packages:
            transformedPackages.length > 0
              ? transformedPackages
              : [
                  {
                    name: '',
                    price: 0,
                    subpackages: [
                      {
                        count: 0, // Changed from 1 to 0
                        dishes: [],
                        dishCategories: [],
                      },
                    ],
                  },
                ],
        };

        reset(vendorInfo);
        setExpandedPackages(expandedState);
      } catch (error) {
        toast.error('Failed to load vendor data');
      } finally {
        setIsFormLoading(false);
      }
    };

    loadVendorData();
  }, [vendor, reset, dishesWithCategories, getclubVendors, isLoadingVendor]);

  /* ===================== FORM SUBMISSION ===================== */
  const onSubmit = async (data: FormValues) => {
    try {
      const emailValue = data.email?.trim() === '' ? null : data.email;
      const payload = {
        name: data.name,
        phone: data.phone,
        address: data.address,
        email: emailValue,
        isClubVendor: true,
        packages: (data.packages || []).map((pkg) => {
          const subpackages = (pkg.subpackages || []).map((sub) => {
            const subPackage: any = {
              count: sub.count || 0, // Changed from 1 to 0
            };
            if (sub.dishCategories && sub.dishCategories.length > 0) {
              subPackage.category = sub.dishCategories[0];
            }
            if (sub.dishes && sub.dishes.length > 0) {
              subPackage.dishes = sub.dishes;
            }
            return subPackage;
          });
          return {
            name: pkg.name || '',
            price: Number(pkg.price) || 0,
            subpackages: subpackages,
          };
        }),
      };

      if (payload.email === null) {
        delete payload.email;
      }

      payload.packages.forEach((pkg) => {
        if (!pkg.subpackages || !Array.isArray(pkg.subpackages)) {
          pkg.subpackages = [];
        }
      });

      if (vendor?.id) {
        await update({
          id: vendor.id,
          data: payload,
        });
      } else {
        await add(payload);
      }

      onSuccess();
    } catch (error: any) {
      if (error.response?.data?.errors) {
        error.response.data.errors.forEach((err: any) => {
          toast.error(`${err.field}: ${err.message}`);
        });
      } else {
        toast.error('Failed to save club vendor');
      }
    }
  };

  /* ===================== SELECT STYLES ===================== */
  const selectStyles = (theme: string) => {
    const isDark = theme === 'dark';
    return {
      control: (base, state) => ({
        ...base,
        minHeight: isMobile ? '36px' : '28px',
        fontSize: isMobile ? '14px' : '12px',
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
        padding: isMobile ? '2px 8px' : '0 6px',
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
        fontSize: isMobile ? '14px' : '12px',
      }),
      clearIndicator: (base, state) => ({
        ...base,
        display: state.isMulti ? 'none' : 'flex',
      }),
      indicatorsContainer: (base) => ({
        ...base,
        height: isMobile ? '36px' : '28px',
      }),
      dropdownIndicator: (base) => ({
        ...base,
        padding: isMobile ? '4px' : '2px',
      }),
      menu: (base) => ({
        ...base,
        backgroundColor: isDark ? '#1A222C' : '#FFFFFF',
        zIndex: 9999,
        fontSize: isMobile ? '14px' : '12px',
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
        fontSize: isMobile ? '14px' : '12px',
        padding: isMobile ? '8px 12px' : '4px 8px',
      }),
      placeholder: (base) => ({
        ...base,
        color: isDark ? '#8A99AF' : '#64748B',
        fontSize: isMobile ? '14px' : '12px',
      }),
      singleValue: (base) => ({
        ...base,
        color: isDark ? '#DEE4EE' : '#1C2434',
        fontSize: isMobile ? '14px' : '12px',
      }),
      multiValue: (base) => ({
        ...base,
        backgroundColor: isDark ? '#333A48' : '#EFF4FB',
        borderRadius: 4,
        padding: '0 4px',
        margin: '2px 4px',
        height: isMobile ? '24px' : '20px',
        display: 'flex',
        alignItems: 'center',
      }),
      multiValueLabel: (base) => ({
        ...base,
        color: isDark ? '#F1F5F9' : '#1C2434',
        fontSize: isMobile ? '12px' : '11px',
        padding: 0,
        lineHeight: isMobile ? '24px' : '20px',
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

  /* ===================== INPUT FIELD STYLE ===================== */
  const inputStyle = (hasError: boolean = false) =>
    `w-full rounded border-[1.5px] border-stroke bg-transparent px-3 py-2.5 sm:py-2 text-sm sm:text-base text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary ${
      hasError ? 'border-red-500' : ''
    }`;

  /* ===================== MOBILE-FRIENDLY SUBPACKAGE ROW ===================== */
  const MobileSubpackageRow = ({packageIndex, subIndex}) => {
    const subError = errors.packages?.[packageIndex]?.subpackages?.[subIndex];
    const filteredDishes = getFilteredDishes(packageIndex, subIndex);
    const countValue = watch(
      `packages.${packageIndex}.subpackages.${subIndex}.count`,
    );

    return (
      <div className="border-strokedark:border-gray-700 mb-4 rounded-lg border p-3">
        <div className="mb-3 flex items-center justify-between border-b pb-2">
          <h4 className="font-medium">Subpackage {subIndex + 1}</h4>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => addSubpackage(packageIndex)}
              className="rounded-full bg-green-50 p-1.5 text-green-600 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/40"
              title="Add subpackage"
            >
              <BiPlus size={16} />
            </button>
            {watch(`packages.${packageIndex}.subpackages`)?.length > 1 && (
              <button
                type="button"
                onClick={() => removeSubpackage(packageIndex, subIndex)}
                className="rounded-full bg-red-50 p-1.5 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40"
                title="Remove subpackage"
              >
                <BiTrash size={16} />
              </button>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium">
              Dish Categories
            </label>
            <Controller
              name={`packages.${packageIndex}.subpackages.${subIndex}.dishCategories`}
              control={control}
              render={({field}) => (
                <Select
                  {...field}
                  isMulti
                  options={dishCategoryOptions}
                  menuPortalTarget={document.body}
                  styles={{
                    ...selectStyles(colorMode || 'dark'),
                    menuPortal: (base) => ({
                      ...base,
                      zIndex: 9999,
                    }),
                  }}
                  menuPosition="fixed"
                  menuShouldScrollIntoView={false}
                  components={{
                    IndicatorSeparator: () => null,
                  }}
                  placeholder="Select categories"
                  value={dishCategoryOptions.filter((opt) =>
                    (field.value || []).includes(opt.value),
                  )}
                  onChange={(selected) => {
                    const values = selected?.map((opt: any) => opt.value) || [];
                    field.onChange(values);
                  }}
                />
              )}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Dishes</label>
            <Controller
              name={`packages.${packageIndex}.subpackages.${subIndex}.dishes`}
              control={control}
              render={({field}) => (
                <Select
                  isMulti
                  options={filteredDishes}
                  menuPortalTarget={document.body}
                  styles={{
                    ...selectStyles(colorMode || 'dark'),
                    menuPortal: (base) => ({
                      ...base,
                      zIndex: 9999,
                    }),
                  }}
                  menuPosition="fixed"
                  menuShouldScrollIntoView={false}
                  components={{
                    IndicatorSeparator: () => null,
                  }}
                  placeholder="Select dishes"
                  value={dishOptions.filter((opt) =>
                    (field.value || []).includes(opt.value),
                  )}
                  onChange={(selected) => {
                    const values = selected?.map((opt: any) => opt.value) || [];
                    field.onChange(values);
                  }}
                />
              )}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Count</label>
            <input
              {...register(
                `packages.${packageIndex}.subpackages.${subIndex}.count`,
                {
                  required: 'Count is required',
                  valueAsNumber: true,
                  min: 0,
                },
              )}
              type="number"
              min="0"
              step="1"
              placeholder="Enter count"
              defaultValue={0}
              className={`border-gray-300 dark:border-gray-600 w-full rounded border bg-transparent px-3 py-2 text-black outline-none focus:border-primary dark:text-white ${
                subError?.count ? 'border-red-500' : ''
              }`}
              onChange={(e) => {
                const value =
                  e.target.value === '' ? 0 : parseInt(e.target.value, 10);
                setValue(
                  `packages.${packageIndex}.subpackages.${subIndex}.count`,
                  value,
                  {
                    shouldValidate: true,
                    shouldDirty: true,
                  },
                );
              }}
            />
            {subError?.count && (
              <p className="mt-1 text-xs text-red-500">
                {subError.count.message}
              </p>
            )}
            <p className="text-gray-500 dark:text-gray-400 mt-1 text-xs">
              Current value: {countValue}
            </p>
          </div>
        </div>
      </div>
    );
  };

  /* ===================== UI ===================== */
  if (isFormLoading) {
    return (
      <div className="flex h-96 items-center justify-center rounded-sm border border-stroke bg-white dark:border-strokedark dark:bg-boxdark">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-gray-600 dark:text-gray-400 mt-4 text-lg font-medium">
            Loading vendor data...
          </p>
          <p className="text-gray-500 dark:text-gray-500 mt-2 text-sm">
            Please wait while we load the vendor information
          </p>
        </div>
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 rounded-sm border border-stroke bg-white px-3 pb-2 pt-4 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-4 md:px-6"
      >
        <h2 className="mb-3 text-lg font-semibold sm:text-xl">
          {vendor ? 'Edit' : 'Add'} Package Vendor
        </h2>

        {/* BASIC INFO - Responsive Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="mb-1 block text-sm font-medium">
              Vendor Name *
            </label>
            <input
              {...register('name')}
              type="text"
              placeholder="Enter vendor name"
              className={inputStyle(!!errors.name)}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Phone *</label>
            <input
              {...register('phone')}
              type="text"
              placeholder="Enter phone number"
              className={inputStyle(!!errors.phone)}
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-500">
                {errors.phone.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Email</label>
            <input
              {...register('email')}
              type="email"
              placeholder="Enter email address"
              className={inputStyle(!!errors.email)}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="sm:col-span-2 lg:col-span-1">
            <label className="mb-1 block text-sm font-medium">Address *</label>
            <input
              {...register('address')}
              type="text"
              placeholder="Enter address"
              className={inputStyle(!!errors.address)}
            />
            {errors.address && (
              <p className="mt-1 text-sm text-red-500">
                {errors.address.message}
              </p>
            )}
          </div>
        </div>

        {/* PACKAGES SECTION - Responsive Accordion */}
        <div className="dark:border-gray-700 mt-6 rounded-lg border border-stroke p-3 sm:p-4">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="flex items-center gap-2 text-lg font-semibold">
              <BiPackage className="text-lg sm:text-xl" /> Packages
            </h3>
            <button
              type="button"
              onClick={addPackage}
              className="flex w-full items-center justify-center gap-2 rounded bg-primary px-4 py-2.5 text-sm font-medium text-white transition duration-300 ease-in-out hover:bg-primary/90 sm:w-auto sm:py-2"
            >
              <BiPlus size={18} />
              Add Package
            </button>
          </div>

          <div className="space-y-4">
            {packageFields.map((field, packageIndex) => {
              const isExpanded = expandedPackages[packageIndex] || false;
              const packageError = errors.packages?.[packageIndex];
              const subpackages =
                watch(`packages.${packageIndex}.subpackages`) || [];

              return (
                <div
                  key={field.id}
                  className="dark:border-gray-600 rounded-lg border border-stroke"
                >
                  {/* Package Header - Mobile Optimized */}
                  <div className="flex items-start justify-between p-3 sm:p-4">
                    <button
                      type="button"
                      onClick={() => togglePackage(packageIndex)}
                      className="flex flex-1 items-start gap-2 text-left sm:items-center sm:gap-3"
                    >
                      <div className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                        {isExpanded ? (
                          <BiChevronUp size={20} />
                        ) : (
                          <BiChevronDown size={20} />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium sm:text-base">
                          Package {packageIndex + 1}
                          {watch(`packages.${packageIndex}.name`) && (
                            <span className="text-gray-600 dark:text-gray-400">
                              {' '}
                              - {watch(`packages.${packageIndex}.name`)}
                            </span>
                          )}
                        </h4>
                        <div className="text-gray-500 mt-1 flex flex-wrap items-center gap-2 text-xs sm:text-sm">
                          <span>Subpackages: {subpackages.length}</span>
                          <span className="hidden sm:inline">•</span>
                          <span>
                            Price: ₹
                            {watch(`packages.${packageIndex}.price`) || 0}
                          </span>
                          {packageError && (
                            <>
                              <span className="hidden sm:inline">•</span>
                              <span className="text-red-500">
                                Please fill all required fields
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </button>
                    <div className="flex items-center gap-2">
                      {packageFields.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removePackageItem(packageIndex)}
                          className="rounded-full bg-red-50 p-2 text-red-500 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40"
                          title="Remove package"
                        >
                          <BiTrash size={16} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Subpackages Content */}
                  {isExpanded && (
                    <div className="dark:border-gray-600 border-t border-stroke p-3 sm:p-4">
                      {/* Package Name and Price */}
                      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label className="mb-1 block text-sm font-medium">
                            Package Name *
                          </label>
                          <input
                            {...register(`packages.${packageIndex}.name`)}
                            type="text"
                            placeholder="Enter package name"
                            className={`${inputStyle(!!packageError?.name)} py-2`}
                          />
                          {packageError?.name && (
                            <p className="mt-1 text-sm text-red-500">
                              {packageError.name.message}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="mb-1 block text-sm font-medium">
                            Package Price *
                          </label>
                          <input
                            {...register(`packages.${packageIndex}.price`)}
                            type="number"
                            placeholder="Enter price"
                            min="0"
                            step="0.01"
                            className={`${inputStyle(!!packageError?.price)} py-2`}
                          />
                          {packageError?.price && (
                            <p className="mt-1 text-sm text-red-500">
                              {packageError.price.message}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Subpackages - Responsive Table/Cards */}
                      {subpackages.length > 0 ? (
                        <>
                          {/* Desktop Table View */}
                          <div className="hidden max-w-full overflow-x-auto md:block">
                            <table className="w-full table-auto">
                              <thead>
                                <tr className="bg-gray-2 text-left dark:bg-meta-4">
                                  <th className="min-w-[140px] px-3 py-2.5 font-medium text-black dark:text-white">
                                    Dish Category
                                  </th>
                                  <th className="min-w-[140px] px-3 py-2.5 font-medium text-black dark:text-white">
                                    Dishes
                                  </th>
                                  <th className="min-w-[100px] px-3 py-2.5 font-medium text-black dark:text-white">
                                    Count
                                  </th>
                                  <th className="min-w-[100px] px-3 py-2.5 font-medium text-black dark:text-white">
                                    Actions
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {subpackages.map((_, subIndex) => {
                                  const subError =
                                    errors.packages?.[packageIndex]
                                      ?.subpackages?.[subIndex];
                                  const filteredDishes = getFilteredDishes(
                                    packageIndex,
                                    subIndex,
                                  );
                                  const countValue = watch(
                                    `packages.${packageIndex}.subpackages.${subIndex}.count`,
                                  );

                                  return (
                                    <tr key={subIndex} className="text-sm">
                                      <td className="border-b border-[#eee] px-3 py-2 dark:border-strokedark">
                                        <div className="py-1.5">
                                          <Controller
                                            name={`packages.${packageIndex}.subpackages.${subIndex}.dishCategories`}
                                            control={control}
                                            render={({field}) => (
                                              <Select
                                                {...field}
                                                isMulti
                                                options={dishCategoryOptions}
                                                menuPortalTarget={document.body}
                                                menuPosition="fixed"
                                                menuShouldScrollIntoView={false}
                                                components={{
                                                  IndicatorSeparator: () =>
                                                    null,
                                                }}
                                                placeholder="Select categories"
                                                classNames={{
                                                  control: (state) =>
                                                    `border border-gray-300 bg-white text-black placeholder:text-gray-500
               dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-gray-400
               rounded-md px-3 py-1 min-h-[36px] text-sm
               ${state.isFocused ? 'border-blue-500 ring-1 ring-blue-500 dark:border-blue-500' : ''}
               ${state.isDisabled ? 'bg-gray-100 dark:bg-slate-900 opacity-60' : ''}`,
                                                  menu: () =>
                                                    `bg-white text-black border border-gray-300 shadow-md rounded-md mt-1
               dark:bg-slate-800 dark:text-white dark:border-slate-700`,
                                                  option: (state) =>
                                                    `px-3 py-2 cursor-pointer text-sm
               ${state.isFocused ? 'bg-gray-200 dark:bg-slate-700' : ''}
               ${state.isSelected ? 'bg-gray-300 dark:bg-slate-900 text-black dark:text-white' : ''}`,
                                                  multiValue: () =>
                                                    `bg-gray-200 text-black dark:bg-slate-700 dark:text-white rounded-md px-2 py-1 mx-1 my-0.5 flex items-center gap-1`,
                                                  multiValueLabel: () =>
                                                    `text-black dark:text-white text-sm`,
                                                  multiValueRemove: () =>
                                                    `text-black dark:text-white hover:bg-red-400 hover:text-white dark:hover:bg-red-600 rounded-md px-1`,
                                                  placeholder: () =>
                                                    `text-gray-500 dark:text-gray-400`,
                                                  input: () =>
                                                    `text-black dark:text-white text-sm`,
                                                  singleValue: () =>
                                                    `text-black dark:text-white text-sm`,
                                                  dropdownIndicator: () =>
                                                    `text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300`,
                                                  clearIndicator: () =>
                                                    `text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300`,
                                                  indicatorSeparator: () =>
                                                    `bg-gray-300 dark:bg-slate-700 mx-1`,
                                                  valueContainer: () =>
                                                    `flex flex-wrap gap-1 px-2 py-1`,
                                                }}
                                                styles={{
                                                  menuPortal: (base) => ({
                                                    ...base,
                                                    zIndex: 9999,
                                                  }),
                                                }}
                                                value={dishCategoryOptions.filter(
                                                  (opt) =>
                                                    (
                                                      field.value || []
                                                    ).includes(opt.value),
                                                )}
                                                onChange={(selected) => {
                                                  const values =
                                                    selected?.map(
                                                      (opt: any) => opt.value,
                                                    ) || [];
                                                  field.onChange(values);
                                                }}
                                              />
                                            )}
                                          />
                                        </div>
                                      </td>

                                      <td className="border-b border-[#eee] px-3 py-2 dark:border-strokedark">
                                        <div className="py-1.5">
                                          <Controller
                                            name={`packages.${packageIndex}.subpackages.${subIndex}.dishes`}
                                            control={control}
                                            render={({field}) => (
                                              <Select
                                                isMulti
                                                options={filteredDishes}
                                                menuPortalTarget={document.body}
                                                menuPosition="fixed"
                                                menuShouldScrollIntoView={false}
                                                components={{
                                                  IndicatorSeparator: () =>
                                                    null,
                                                }}
                                                placeholder="Select dishes"
                                                classNames={{
                                                  control: (state) =>
                                                    `border border-gray-300 bg-white text-black placeholder:text-gray-500
               dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-gray-400
               rounded-md px-3 py-1 min-h-[36px] text-sm
               ${state.isFocused ? 'border-blue-500 ring-1 ring-blue-500 dark:border-blue-500' : ''}
               ${state.isDisabled ? 'bg-gray-100 dark:bg-slate-900 opacity-60' : ''}`,
                                                  menu: () =>
                                                    `bg-white text-black border border-gray-300 shadow-md rounded-md mt-1
               dark:bg-slate-800 dark:text-white dark:border-slate-700`,
                                                  option: (state) =>
                                                    `px-3 py-2 cursor-pointer text-sm
               ${state.isFocused ? 'bg-gray-200 dark:bg-slate-700' : ''}
               ${state.isSelected ? 'bg-gray-300 dark:bg-slate-900 text-black dark:text-white' : ''}`,
                                                  multiValue: () =>
                                                    `bg-gray-200 text-black dark:bg-slate-700 dark:text-white rounded-md px-2 py-1 mx-1 my-0.5 flex items-center gap-1`,
                                                  multiValueLabel: () =>
                                                    `text-black dark:text-white text-sm`,
                                                  multiValueRemove: () =>
                                                    `text-black dark:text-white hover:bg-red-400 hover:text-white dark:hover:bg-red-600 rounded-md px-1`,
                                                  placeholder: () =>
                                                    `text-gray-500 dark:text-gray-400`,
                                                  input: () =>
                                                    `text-black dark:text-white text-sm`,
                                                  singleValue: () =>
                                                    `text-black dark:text-white text-sm`,
                                                  dropdownIndicator: () =>
                                                    `text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300`,
                                                  clearIndicator: () =>
                                                    `text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300`,
                                                  indicatorSeparator: () =>
                                                    `bg-gray-300 dark:bg-slate-700 mx-1`,
                                                  valueContainer: () =>
                                                    `flex flex-wrap gap-1 px-2 py-1`,
                                                }}
                                                styles={{
                                                  menuPortal: (base) => ({
                                                    ...base,
                                                    zIndex: 9999,
                                                  }),
                                                }}
                                                value={dishOptions.filter(
                                                  (opt) =>
                                                    (
                                                      field.value || []
                                                    ).includes(opt.value),
                                                )}
                                                onChange={(selected) => {
                                                  const values =
                                                    selected?.map(
                                                      (opt: any) => opt.value,
                                                    ) || [];
                                                  field.onChange(values);
                                                }}
                                              />
                                            )}
                                          />
                                        </div>
                                      </td>
                                      <td className="border-b border-[#eee] px-3 py-2 dark:border-strokedark">
                                        <div className="py-1.5">
                                          <input
                                            {...register(
                                              `packages.${packageIndex}.subpackages.${subIndex}.count`,
                                              {
                                                required: 'Count is required',
                                                valueAsNumber: true,
                                                min: 0,
                                              },
                                            )}
                                            type="number"
                                            min="0"
                                            step="1"
                                            placeholder="0"
                                            defaultValue={0}
                                            className={`${inputStyle(
                                              !!subError?.count,
                                            )} h-9`}
                                            onChange={(e) => {
                                              const value =
                                                e.target.value === ''
                                                  ? 0
                                                  : parseInt(
                                                      e.target.value,
                                                      10,
                                                    );
                                              setValue(
                                                `packages.${packageIndex}.subpackages.${subIndex}.count`,
                                                value,
                                                {
                                                  shouldValidate: true,
                                                  shouldDirty: true,
                                                },
                                              );
                                            }}
                                          />
                                          {subError?.count && (
                                            <p className="mt-1 text-xs text-red-500">
                                              {subError.count.message}
                                            </p>
                                          )}
                                        </div>
                                      </td>

                                      <td className="border-b border-[#eee] px-3 py-2 dark:border-strokedark">
                                        <div className="flex items-center space-x-2 py-1.5">
                                          <button
                                            type="button"
                                            onClick={() =>
                                              addSubpackage(packageIndex)
                                            }
                                            className="hover:bg-gray-100 rounded p-1.5 dark:hover:bg-meta-4"
                                            title="Add subpackage"
                                          >
                                            <BiPlus size={16} />
                                          </button>

                                          {subpackages.length > 1 && (
                                            <button
                                              type="button"
                                              onClick={() =>
                                                removeSubpackage(
                                                  packageIndex,
                                                  subIndex,
                                                )
                                              }
                                              className="hover:bg-gray-100 rounded p-1.5 dark:hover:bg-meta-4"
                                              title="Remove subpackage"
                                            >
                                              <BiTrash size={16} />
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

                          {/* Mobile Cards View */}
                          <div className="space-y-3 md:hidden">
                            {subpackages.map((_, subIndex) => (
                              <MobileSubpackageRow
                                key={subIndex}
                                packageIndex={packageIndex}
                                subIndex={subIndex}
                              />
                            ))}
                          </div>
                        </>
                      ) : (
                        <div className="border-strokedark:border-gray-700 flex flex-col items-center justify-center rounded border py-8">
                          <p className="text-gray-500 dark:text-gray-400 mb-4">
                            No subpackages added yet.
                          </p>
                          <button
                            type="button"
                            onClick={() => addSubpackage(packageIndex)}
                            className="flex items-center gap-2 rounded bg-primary px-4 py-2 text-sm text-white transition duration-300 ease-in-out hover:bg-primary/90"
                          >
                            <BiPlus size={18} />
                            Add First Subpackage
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {packageFields.length === 0 && (
            <div className="text-gray-500 py-8 text-center">
              No packages added yet. Click "Add Package" to create one.
            </div>
          )}
        </div>

        {/* ACTIONS - Responsive Layout */}
        <div className="flex flex-col-reverse gap-3 pt-4 sm:flex-row sm:justify-end sm:gap-4">
          <button
            type="button"
            onClick={onCancel}
            className="border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 order-2 w-full rounded-md border px-4 py-3 text-sm font-medium transition sm:order-1 sm:w-auto sm:py-2"
          >
            Cancel
          </button>
          <GenericButton
            type="submit"
            className="order-1 w-full rounded bg-primary px-6 py-3 text-sm font-medium text-white transition duration-300 ease-in-out hover:bg-primary/90 sm:order-2 sm:w-auto sm:py-2"
          >
            {vendor ? 'Update' : 'Save'}
          </GenericButton>
        </div>
      </form>
    </FormProvider>
  );
};

export default ClubVendorForm;
