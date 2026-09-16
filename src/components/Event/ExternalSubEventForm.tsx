/* eslint-disable */
import React, {useState} from 'react';
import {Controller, FormProvider, useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {z} from 'zod';
import {CreateSubEventSchema} from '@/lib/validation/eventSchema';
import {
  useGetDishCategories,
  useGetDishCategoriesExternal,
  useGetDishes,
  useGetDishesExternal,
} from '@/lib/react-query/queriesAndMutations/cateror/dish';
import {
  useCreateSubevent,
  useCreateSubeventExternal,
  useGetSubevent,
} from '@/lib/react-query/queriesAndMutations/cateror/event';
import Select from 'react-select';
import GenericInputField from '../../components/Forms/Input/GenericInputField';
import GenericTextArea from '../Forms/TextArea/GenericTextArea';
import GenericDropdown from '../Forms/DropDown/GenericDropDown';
import toast from 'react-hot-toast';
import {format} from 'date-fns';
import {BiInfoCircle, BiLoader, BiPlus, BiSave} from 'react-icons/bi';
import {Loader} from '../Loader/Loader';
import {
  useGetAllPackage,
  useGetAllPackageExternal,
} from '@/lib/react-query/package/displaypackage';
import {Route} from '@/routes/_externalform/exsubevent.$id';
import {useAuthContext} from '@/context/AuthContext';

// Custom styles for react-select to match the design aesthetic
const selectStyles = {
  control: (provided: any, state: any) => ({
    ...provided,
    backgroundColor: document.documentElement.classList.contains('dark')
      ? '#000000'
      : '#ffffff',
    borderColor: document.documentElement.classList.contains('dark')
      ? '#333333'
      : '#e2e8f0',
    borderRadius: '0.375rem',
    minHeight: '36px',
    height: '36px',
    padding: '0.25rem',
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
    boxShadow: state.isFocused ? '0 0 0 3px rgba(99, 102, 241, 0.2)' : 'none',
    '&:hover': {
      borderColor: document.documentElement.classList.contains('dark')
        ? '#4b4b4b'
        : '#6366f1',
    },
    '&:focus': {
      borderColor: '#6366f1',
      boxShadow: '0 0 0 3px rgba(99, 102, 241, 0.2)',
    },
  }),
  menu: (provided: any) => ({
    ...provided,
    backgroundColor: document.documentElement.classList.contains('dark')
      ? '#000000'
      : '#ffffff',
    borderRadius: '0.375rem',
    marginTop: '0.25rem',
    boxShadow:
      '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
    zIndex: 9999, // Add a high z-index to ensure the menu appears above other elements
  }),
  option: (provided: any, state: any) => ({
    ...provided,
    backgroundColor: state.isSelected
      ? '#6366f1'
      : state.isFocused
        ? document.documentElement.classList.contains('dark')
          ? '#1e293b'
          : '#e0e7ff'
        : document.documentElement.classList.contains('dark')
          ? '#000000'
          : '#ffffff',
    color: document.documentElement.classList.contains('dark')
      ? '#ffffff'
      : state.isSelected
        ? '#ffffff'
        : '#1e293b',
    padding: '0.5rem 1rem',
    fontSize: '0.875rem',
    cursor: 'pointer',
  }),
  multiValue: (provided: any) => ({
    ...provided,
    backgroundColor: document.documentElement.classList.contains('dark')
      ? '#1e293b'
      : '#e0e7ff',
    borderRadius: '0.375rem',
  }),
  multiValueLabel: (provided: any) => ({
    ...provided,
    color: document.documentElement.classList.contains('dark')
      ? '#ffffff'
      : '#1e293b',
    fontSize: '0.875rem',
  }),
  multiValueRemove: (provided: any) => ({
    ...provided,
    color: document.documentElement.classList.contains('dark')
      ? '#ffffff'
      : '#1e293b',
    '&:hover': {
      backgroundColor: document.documentElement.classList.contains('dark')
        ? '#374151'
        : '#c7d2fe',
      color: document.documentElement.classList.contains('dark')
        ? '#ffffff'
        : '#1e293b',
    },
  }),
  placeholder: (provided: any) => ({
    ...provided,
    color: document.documentElement.classList.contains('dark')
      ? '#9ca3af'
      : '#6b7280',
    fontSize: '0.875rem',
  }),
  singleValue: (provided: any) => ({
    ...provided,
    color: document.documentElement.classList.contains('dark')
      ? '#ffffff'
      : '#1e293b',
    fontSize: '0.875rem',
  }),
  input: (provided: any) => ({
    ...provided,
    color: document.documentElement.classList.contains('dark')
      ? '#ffffff'
      : '#1e293b',
    fontSize: '0.875rem',
  }),
  // Ensure the menu portal has a high z-index as well
  menuPortal: (provided: any) => ({
    ...provided,
    zIndex: 9999, // Add this to ensure the portal is above other elements
  }),
};

export type SubEventFormValues = z.infer<typeof CreateSubEventSchema>;

interface DishRow {
  id: number;
  category?: string;
  dishes: {label: string; value: string}[];
  count?: number;
  Rate?: number;
}

const ExternalSubEventForm: React.FC = () => {
  const {id: EventId} = Route.useParams();
  const {data: subEventResponse, isLoading: isLoadingSubEvents} =
    useGetSubevent(EventId);
  const [activeTab, setActiveTab] = useState<'create' | 'selectPackage'>(
    'create',
  );

  if (isLoadingSubEvents) {
    return <Loader />;
  }

  return (
    <div className="mx-auto">
      <div className="mt-6">
        <div className="animate-fade-in">
          {activeTab === 'create' && <CreateSubEventForm eventId={EventId} />}
          {activeTab === 'selectPackage' && (
            <SelectPackageForm eventId={EventId} />
          )}
        </div>
      </div>
    </div>
  );
};

const CreateSubEventForm: React.FC<{eventId: string}> = ({eventId}) => {
  const methods = useForm<SubEventFormValues & {universalDish: string}>({
    resolver: zodResolver(CreateSubEventSchema),
    defaultValues: {
      subEventName: '',
      date: '',
      time: '',
      dishes: {},
      universalDish: '',
      note: '',
    },
  });
  const {user} = useAuthContext();
  const {watch, setValue, getValues, handleSubmit, control} = methods;
  const {data: DishCategories} = useGetDishCategoriesExternal(user?.caterorId!);
  const {data: Dishes} = useGetDishesExternal(user?.caterorId!);
  const {mutate: createSubevent, isPending} = useCreateSubeventExternal();
  const {data: subEventResponse} = useGetSubevent(eventId);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [selectedDishes, setSelectedDishes] = useState<string[]>([]);
  const [dishTab, setDishTab] = useState<'selectDishes' | 'selectPackage'>(
    'selectDishes',
  );

  React.useEffect(() => {
    setStartDate(localStorage.getItem('startDate'));
    setEndDate(localStorage.getItem('endDate'));
  }, []);

  const generateDateOptions = (start: string | null, end: string | null) => {
    if (!start || !end) return [];
    const startDate = new Date(start);
    const endDate = new Date(end);
    const dateArray = [];
    while (startDate <= endDate) {
      dateArray.push({
        value: startDate.toISOString().split('T')[0],
        label: format(startDate, 'dd-MMM-yyyy'),
      });
      startDate.setDate(startDate.getDate() + 1);
    }
    return dateArray;
  };

  const dateOptions = generateDateOptions(startDate, endDate);

  const allDishOptions = React.useMemo(() => {
    return (
      Dishes?.data?.dishes.map((d: any) => ({
        value: d.id,
        label: d.name,
        categoryId: d.category?.id,
        categoryName: d.category?.name,
      })) || []
    );
  }, [Dishes]);

  const universalDish = watch('universalDish');

  React.useEffect(() => {
    if (!universalDish) return;
    console.log('Selected universalDish:', universalDish);
    const selectedDish = allDishOptions.find(
      (d: any) => d.value === universalDish,
    );
    if (!selectedDish) {
      console.log('No dish found for ID:', universalDish);
      return;
    }
    console.log('Selected dish:', selectedDish);
    const fieldName = `dishes.${
      selectedDish.categoryName?.replace(/\s+/g, '') || 'Uncategorized'
    }`;
    const existing = getValues(fieldName) || [];
    console.log('Existing dishes for category:', existing);
    if (!existing.some((item: any) => item.value === selectedDish.value)) {
      const newEntry = {value: selectedDish.value, label: selectedDish.label};
      setValue(fieldName, [...existing, newEntry]);
      handleDishSelect(selectedDish.categoryName || 'Uncategorized', [
        ...existing,
        newEntry,
      ]);
    }
    setValue('universalDish', '');
  }, [universalDish, allDishOptions, setValue, getValues]);

  const handleDishSelect = (categoryName: string, selectedOptions: any) => {
    const selectedDishIds =
      selectedOptions?.map((option: any) => option.value) || [];
    setSelectedDishes((prev) => [...new Set([...prev, ...selectedDishIds])]);
  };

  const renderSelectedDishes = () => {
    const categoryMap: {
      [key: string]: {label: string; value: string; cost?: number}[];
    } = {};
    if (dishTab === 'selectDishes') {
      const formDishes = getValues('dishes') || {};
      Object.entries(formDishes).forEach(([category, dishes]) => {
        categoryMap[category] = dishes as {label: string; value: string}[];
      });
    } else {
      mainDishes.forEach((row) => {
        if (row.category && row.dishes.length > 0) {
          const categoryName =
            DishCategories?.data?.categories.find(
              (cat: any) => cat.id === row.category,
            )?.name || row.category;
          categoryMap[categoryName] = [
            ...(categoryMap[categoryName] || []),
            ...row.dishes?.map((dish) => ({...dish, cost: row.Rate})),
          ];
        }
      });
      if (extraDishes.length > 0) {
        const extraDishDetails = extraDishes?.map((row) => {
          const dishInfo = Dishes?.data?.dishes.find(
            (d) => d.id === row.dishes[0]?.value,
          );
          return {
            label: dishInfo?.name || 'Unknown Dish',
            value: row.dishes[0]?.value || '',
            cost: row.Rate,
          };
        });
        categoryMap['Extra Dishes'] = [
          ...(categoryMap['Extra Dishes'] || []),
          ...extraDishDetails,
        ];
      }
    }
    return (
      <div className="mt-6 overflow-hidden rounded-md border border-stroke dark:border-strokedark">
        <div className="bg-gray-50 border-b border-stroke p-4 dark:border-strokedark">
          <h3 className="text-gray-800 font-semibold">
            Selected Dishes by Category
          </h3>
        </div>
        <div className="p-4">
          <table className="w-full text-sm">
            <thead className="text-gray-600 text-left">
              <tr>
                <th className="pb-3 font-medium">Category</th>
                <th className="pb-3 font-medium">Dishes</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(categoryMap)?.map(([category, dishes]) => (
                <tr key={category} className="border-t">
                  <td className="py-3 font-medium">{category}</td>
                  <td className="py-3">
                    {dishes?.map((dish) => dish.label).join(', ')}
                  </td>
                </tr>
              ))}
              {Object.keys(categoryMap).length === 0 && (
                <tr>
                  <td colSpan={2} className="text-gray-500 py-8 text-center">
                    No dishes selected
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const {data: response} = useGetAllPackageExternal(user?.caterorId!);
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(
    null,
  );
  const [mainDishes, setMainDishes] = useState<DishRow[]>([]);
  const [extraDishes, setExtraDishes] = useState<DishRow[]>([]);

  React.useEffect(() => {
    if (selectedPackageId && response) {
      const selectedPackage = response.find(
        (pkg: any) => pkg.id === selectedPackageId,
      );
      if (selectedPackage) {
        const mainDishes = selectedPackage.packageDishes?.map((pd: any) => ({
          id: Date.now() + Math.random(),
          category: pd.categoryId,
          dishes: [],
          count: pd.count,
        }));
        const extraDishes = selectedPackage.extraDishes?.map((ed: any) => ({
          id: Date.now() + Math.random(),
          dishes: [],
          Rate: ed.cost,
        }));
        setMainDishes(mainDishes);
        setExtraDishes(extraDishes);
      }
    } else {
      setMainDishes([]);
      setExtraDishes([]);
    }
  }, [selectedPackageId, response]);

  const getPackageOptions = () =>
    response?.map((pkg: any) => ({
      label: pkg.name,
      value: pkg.id,
    })) || [];

  const getDishOptions = (categoryId: string, isExtra: boolean) => {
    if (!selectedPackageId || !response) return [];
    const selectedPackage = response.find(
      (pkg: any) => pkg.id === selectedPackageId,
    );
    if (!selectedPackage) return [];
    if (isExtra) {
      const selectedDishIds = extraDishes
        .filter((row) => row.dishes.length > 0)
        .map((row) => row.dishes[0].value);
      return selectedPackage.extraDishes
        ?.filter((ed: any) => !selectedDishIds.includes(ed.dishId))
        .map((ed: any) => ({
          label: ed.dishName,
          value: ed.dishId,
        }));
    } else {
      const packageDish = selectedPackage.packageDishes.find(
        (pd: any) => pd.categoryId === categoryId,
      );
      return packageDish
        ? packageDish.dishes?.map((dish: any) => ({
            label: dish.dishName,
            value: dish.dishId,
          }))
        : [];
    }
  };

  const handleDishChange = (
    index: number,
    field: keyof DishRow,
    value: any,
    isExtra = false,
  ) => {
    const rows = isExtra ? [...extraDishes] : [...mainDishes];
    if (!isExtra && field === 'dishes') {
      const row = rows[index];
      const maxCount = row.count || 1;
      if (Array.isArray(value) && value.length > maxCount) {
        toast.error(
          `You can only select up to ${maxCount} dishes for this category.`,
        );
        return;
      }
    }
    if (
      isExtra &&
      field === 'dishes' &&
      Array.isArray(value) &&
      value.length > 0
    ) {
      const selectedPackage = response?.find(
        (pkg: any) => pkg.id === selectedPackageId,
      );
      const selectedDish = selectedPackage?.extraDishes.find(
        (ed: any) => ed.dishId === value[0].value,
      );
      rows[index] = {
        ...rows[index],
        dishes: value,
        Rate: selectedDish ? selectedDish.cost : 0,
      };
    } else {
      rows[index] = {...rows[index], [field]: value};
    }
    isExtra ? setExtraDishes(rows) : setMainDishes(rows);
  };

  const addExtraDishRow = () => {
    setExtraDishes((prev) => [
      ...prev,
      {id: Date.now() + Math.random(), dishes: [], Rate: 0},
    ]);
  };

  const onSubmit = (data: SubEventFormValues) => {
    const isNameAlreadyExist = subEventResponse?.data?.subEvents?.some(
      (subEvent: any) => subEvent.name === data.subEventName,
    );
    if (isNameAlreadyExist) {
      toast.error('Sub Event name already exists');
      return;
    }
    const combinedDateTime = `${data.date}T${data.time}:00+05:30`;
    const allDishIds =
      dishTab === 'selectDishes'
        ? selectedDishes
        : [
            ...mainDishes.flatMap((row) =>
              row.dishes.map((dish) => dish.value),
            ),
            ...extraDishes.map((row) => row.dishes[0]?.value).filter(Boolean),
          ];
    const formattedDishes = Array.from(new Set(allDishIds)).map((dishId) => ({
      dishId,
    }));
    const formData = {
      name: data.subEventName,
      address: data.subEventAddress || '',
      dishes: formattedDishes,
      expectedPeople: data.expectedPeople,
      time: combinedDateTime,
      date: data.date,
      eventId,
      packageId:
        dishTab === 'selectPackage'
          ? selectedPackageId || undefined
          : undefined,
      note: data.note || '',
    };

    console.log(formData);
    createSubevent(formData, {
      onSuccess: () => {
        methods.reset();
        setSelectedDishes([]);
        setSelectedPackageId(null);
        setMainDishes([]);
        setExtraDishes([]);
      },
    });
  };

  if (isPending || !Dishes?.data?.dishes) return <Loader />;

  return (
    <FormProvider {...methods}>
      <div className="overflow-hidden rounded-md bg-white p-6 shadow-md dark:bg-black">
        <div className="from-gray-50 to-gray-100 flex items-center justify-between border-b border-stroke bg-gradient-to-r p-5 dark:border-strokedark">
          <div className="flex items-center">
            <div className="mr-4 rounded-md bg-indigo-100 px-3 py-1 font-medium text-indigo-800">
              Create Subevent
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-1">
            <div className="grid grid-cols-2 gap-4">
              <GenericInputField
                name="subEventName"
                label="Subevent Name"
                placeholder="Enter Subevent Name"
                // className="w-full rounded-md border border-stroke px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-300 dark:border-strokedark dark:bg-black"
              />
              <GenericTextArea
                name="subEventAddress"
                label="Address"
                placeholder="Enter Address"
                className="w-full rounded-md border border-stroke px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-300 dark:border-strokedark dark:bg-black"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <GenericInputField
                name="expectedPeople"
                label="Expected People"
                placeholder="Enter Expected People"
                type="number"
                // className="w-full rounded-md border border-stroke px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-300 dark:border-strokedark dark:bg-black"
                min="0"
              />
              <div className="grid grid-cols-2 gap-4">
                <GenericDropdown
                  name="date"
                  label="Date"
                  options={dateOptions}
                  control={control}
                  className="w-full rounded-md border border-stroke px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-300 dark:border-strokedark dark:bg-black"
                />
                <div>
                  <label className="text-gray-700 dark:text-gray-200 mb-2 block text-sm font-medium">
                    Time
                  </label>
                  <input
                    type="time"
                    id="time"
                    value={watch('time') || ''}
                    onChange={(e) => setValue('time', e.target.value)}
                    className="w-full rounded-md border border-stroke px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-300 dark:border-strokedark dark:bg-black"
                  />
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="flex space-x-2 rounded-xl bg-white p-1.5 shadow-md dark:bg-black">
                <button
                  onClick={() => setDishTab('selectDishes')}
                  className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
                    dishTab === 'selectDishes'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-gray-700 dark:text-gray-200 dark:hover:bg-gray-700 bg-transparent hover:bg-indigo-100'
                  }`}
                  aria-selected={dishTab === 'selectDishes'}
                >
                  Select Dishes
                </button>
                <button
                  onClick={() => setDishTab('selectPackage')}
                  className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
                    dishTab === 'selectPackage'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-gray-700 dark:text-gray-200 dark:hover:bg-gray-700 bg-transparent hover:bg-indigo-100'
                  }`}
                  aria-selected={dishTab === 'selectPackage'}
                >
                  Select Package
                </button>
              </div>
              {dishTab === 'selectDishes' && (
                <div className="space-y-6">
                  <div>
                    <label className="text-gray-700 dark:text-gray-200 mb-2 block text-sm font-medium">
                      Universal Dish Selector
                    </label>
                    <Controller
                      name="universalDish"
                      control={control}
                      render={({field}) => (
                        <Select
                          options={allDishOptions.map(({value, label}) => ({
                            value,
                            label,
                          }))}
                          value={
                            allDishOptions.find(
                              (opt) => opt.value === field.value,
                            ) || null
                          }
                          onChange={(option) =>
                            field.onChange(option?.value || '')
                          }
                          className="w-full bg-black dark:bg-black"
                          styles={selectStyles}
                          placeholder="Select Dish"
                          aria-label="Universal Dish Selector"
                        />
                      )}
                    />
                  </div>
                  <div className="overflow-hidden rounded-md border border-stroke dark:border-strokedark">
                    <div className="bg-gray-50 border-b border-stroke p-4 dark:border-strokedark">
                      <h3 className="text-gray-800 font-semibold">
                        Dish Selection by Category
                      </h3>
                    </div>
                    <div className="space-y-5 p-4">
                      {DishCategories?.data?.categories?.map(
                        (category: {id: string; name: string}) => {
                          const fieldName = `dishes.${category.name.replace(/\s+/g, '')}`;
                          return (
                            <div
                              key={category.id}
                              className="flex flex-col sm:flex-row sm:items-center sm:space-x-4"
                            >
                              <label className="text-gray-700 dark:text-gray-200 mb-2 w-full text-sm font-medium sm:w-1/4">
                                {category.name}
                              </label>
                              <Controller
                                name={fieldName}
                                control={control}
                                render={({field}) => (
                                  <Select
                                    isMulti
                                    options={Dishes?.data?.dishes
                                      ?.filter(
                                        (dish: any) =>
                                          dish.categoryId === category.id,
                                      )
                                      ?.map((dish: any) => ({
                                        label: dish.name,
                                        value: dish.id,
                                      }))}
                                    value={field.value || []}
                                    onChange={(selectedOptions) => {
                                      field.onChange(selectedOptions);
                                      handleDishSelect(
                                        category.name,
                                        selectedOptions,
                                      );
                                    }}
                                    className="w-full sm:w-3/4"
                                    classNamePrefix="react-select"
                                    styles={selectStyles}
                                    aria-label={`Select dishes for ${category.name}`}
                                  />
                                )}
                              />
                            </div>
                          );
                        },
                      )}
                    </div>
                  </div>
                </div>
              )}
              {dishTab === 'selectPackage' && (
                <div className="space-y-6">
                  <div>
                    <label className="text-gray-700 dark:text-gray-200 mb-2 block text-sm font-medium">
                      Select Package
                    </label>
                    <Select
                      options={getPackageOptions()}
                      value={
                        getPackageOptions().find(
                          (opt) => opt.value === selectedPackageId,
                        ) || null
                      }
                      onChange={(option) =>
                        setSelectedPackageId(option?.value || null)
                      }
                      className="w-full"
                      isClearable
                      placeholder="Select Package"
                      styles={selectStyles}
                      aria-label="Select Package"
                      menuPortalTarget={document.body}
                    />
                  </div>
                  {selectedPackageId && (
                    <>
                      <div className="overflow-hidden rounded-md border border-stroke dark:border-strokedark">
                        <div className="bg-gray-50 border-b border-stroke p-4 dark:border-strokedark">
                          <h3 className="text-gray-800 font-semibold">
                            Main Dish Selection
                          </h3>
                        </div>
                        <div className="space-y-5 p-4">
                          {mainDishes.map((row, index) => (
                            <div
                              key={row.id}
                              className="flex flex-col sm:flex-row sm:items-center sm:space-x-4"
                            >
                              <label className="text-gray-700 dark:text-gray-200 mb-2 w-full text-sm font-medium sm:w-1/4">
                                {DishCategories?.data?.categories.find(
                                  (c) => c.id === row.category,
                                )?.name || 'Category'}
                              </label>
                              <Select
                                isMulti
                                options={getDishOptions(
                                  row.category || '',
                                  false,
                                )}
                                value={row.dishes}
                                onChange={(selected) =>
                                  handleDishChange(
                                    index,
                                    'dishes',
                                    [...(selected || [])],
                                    false,
                                  )
                                }
                                className="w-full sm:w-3/4"
                                placeholder="Select Dishes"
                                styles={selectStyles}
                                aria-label={`Select dishes for ${row.category}`}
                                menuPortalTarget={document.body}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="overflow-hidden rounded-md border border-stroke dark:border-strokedark">
                        <div className="bg-gray-50 border-b border-stroke p-4 dark:border-strokedark">
                          <h3 className="text-gray-800 font-semibold">
                            Extra Dish Selection
                          </h3>
                        </div>
                        <div className="space-y-5 p-4">
                          {extraDishes.map((row, index) => (
                            <div
                              key={row.id}
                              className="flex flex-col sm:flex-row sm:items-center sm:space-x-4"
                            >
                              <Select
                                options={getDishOptions('', true)}
                                value={row.dishes[0] || null}
                                onChange={(selected) =>
                                  handleDishChange(
                                    index,
                                    'dishes',
                                    selected ? [selected] : [],
                                    true,
                                  )
                                }
                                className="w-full sm:w-3/4"
                                placeholder="Select Extra Dish"
                                styles={selectStyles}
                                aria-label="Select extra dish"
                                menuPortalTarget={document.body}
                              />
                              <div className="relative mt-2 sm:mt-0">
                                <span className="text-gray-500 absolute left-3 top-2.5">
                                  ₹
                                </span>
                                <input
                                  type="number"
                                  value={row.Rate || 0}
                                  disabled
                                  className="w-full rounded-md border border-stroke px-3 py-2 pl-8 text-sm dark:border-strokedark dark:bg-black sm:w-1/4"
                                  aria-label="Extra dish rate"
                                />
                              </div>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={addExtraDishRow}
                            className="flex items-center justify-center rounded-md bg-amber-500 px-4 py-2 text-sm text-white hover:bg-amber-600"
                          >
                            <BiPlus size={18} className="mr-1" />
                            Add Extra Dish
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
              <GenericTextArea
                name="note"
                label="Note"
                placeholder="Enter any additional notes"
                className="w-full rounded-md border border-stroke px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-300 dark:border-strokedark dark:bg-black"
              />
              <button
                type="button"
                onClick={handleSubmit(onSubmit)}
                disabled={isPending}
                className="flex w-full items-center justify-center rounded-md bg-gradient-to-r from-green-600 to-emerald-700 py-3 font-medium text-white transition-all hover:from-green-700 hover:to-emerald-800"
              >
                {isPending ? (
                  <>
                    <svg
                      className="-ml-1 mr-3 h-5 w-5 animate-spin text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  <>
                    <BiSave className="mr-2 text-lg" />
                    Submit
                  </>
                )}
              </button>
            </div>
          </div>
          {dishTab === 'selectPackage' && renderSelectedDishes()}
        </div>
      </div>
    </FormProvider>
  );
};

const SelectPackageForm: React.FC<{eventId: string}> = ({eventId}) => {
  const methods = useForm<SubEventFormValues>({
    resolver: zodResolver(CreateSubEventSchema),
    defaultValues: {
      subEventName: '',
      date: '',
      time: '',
      dishes: {},
      note: '',
    },
  });
  const {watch, setValue, handleSubmit, control} = methods;
  const {data: response} = useGetAllPackage();

  console.log('response', response);
  const {mutate: createSubevent, isPending} = useCreateSubevent();
  const {data: subEventResponse} = useGetSubevent(eventId);
  const {data: DishCategories} = useGetDishCategories();
  const {data: Dishes} = useGetDishes();
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(
    null,
  );
  const [mainDishes, setMainDishes] = useState<DishRow[]>([]);
  const [extraDishes, setExtraDishes] = useState<DishRow[]>([]);

  React.useEffect(() => {
    setStartDate(localStorage.getItem('startDate'));
    setEndDate(localStorage.getItem('endDate'));
  }, []);

  React.useEffect(() => {
    if (selectedPackageId && response) {
      const selectedPackage = response.find(
        (pkg: any) => pkg.id === selectedPackageId,
      );
      if (selectedPackage) {
        const mainDishes = selectedPackage.packageDishes.map((pd: any) => ({
          id: Date.now() + Math.random(),
          category: pd.categoryId,
          dishes: [],
          count: pd.count,
        }));
        const extraDishes = selectedPackage.extraDishes.map((ed: any) => ({
          id: Date.now() + Math.random(),
          dishes: [],
          Rate: ed.cost,
        }));
        setMainDishes(mainDishes);
        setExtraDishes(extraDishes);
      }
    } else {
      setMainDishes([]);
      setExtraDishes([]);
    }
  }, [selectedPackageId, response]);

  const generateDateOptions = (start: string | null, end: string | null) => {
    if (!start || !end) return [];
    const startDate = new Date(start);
    const endDate = new Date(end);
    const dateArray = [];
    while (startDate <= endDate) {
      dateArray.push({
        value: startDate.toISOString().split('T')[0],
        label: format(startDate, 'dd-MMM-yyyy'),
      });
      startDate.setDate(startDate.getDate() + 1);
    }
    return dateArray;
  };

  const dateOptions = generateDateOptions(startDate, endDate);

  const getPackageOptions = () =>
    response?.map((pkg: any) => ({
      label: pkg.name,
      value: pkg.id,
    })) || [];

  const getDishOptions = (categoryId: string, isExtra: boolean) => {
    if (!selectedPackageId || !response) return [];
    const selectedPackage = response.find(
      (pkg: any) => pkg.id === selectedPackageId,
    );
    if (!selectedPackage) return [];
    if (isExtra) {
      const selectedDishIds = extraDishes
        .filter((row) => row.dishes.length > 0)
        .map((row) => row.dishes[0].value);
      return selectedPackage.extraDishes
        .filter((ed: any) => !selectedDishIds.includes(ed.dishId))
        .map((ed: any) => ({
          label: ed.dishName,
          value: ed.dishId,
        }));
    } else {
      const packageDish = selectedPackage.packageDishes.find(
        (pd: any) => pd.categoryId === categoryId,
      );
      return packageDish
        ? packageDish.dishes.map((dish: any) => ({
            label: dish.dishName,
            value: dish.dishId,
          }))
        : [];
    }
  };

  const handleDishChange = (
    index: number,
    field: keyof DishRow,
    value: any,
    isExtra = false,
  ) => {
    const rows = isExtra ? [...extraDishes] : [...mainDishes];
    if (!isExtra && field === 'dishes') {
      const row = rows[index];
      const maxCount = row.count || 1;
      if (Array.isArray(value) && value.length > maxCount) {
        toast.error(
          `You can only select up to ${maxCount} dishes for this category.`,
        );
        return;
      }
    }
    if (
      isExtra &&
      field === 'dishes' &&
      Array.isArray(value) &&
      value.length > 0
    ) {
      const selectedPackage = response?.find(
        (pkg: any) => pkg.id === selectedPackageId,
      );
      const selectedDish = selectedPackage?.extraDishes.find(
        (ed: any) => ed.dishId === value[0].value,
      );
      rows[index] = {
        ...rows[index],
        dishes: value,
        Rate: selectedDish ? selectedDish.cost : 0,
      };
    } else {
      rows[index] = {...rows[index], [field]: value};
    }
    isExtra ? setExtraDishes(rows) : setMainDishes(rows);
  };

  const addExtraDishRow = () => {
    setExtraDishes((prev) => [
      ...prev,
      {id: Date.now() + Math.random(), dishes: [], Rate: 0},
    ]);
  };

  const renderSelectedDishes = () => {
    const categoryMap: {
      [key: string]: {label: string; value: string; cost?: number}[];
    } = {};
    mainDishes.forEach((row) => {
      if (row.category && row.dishes.length > 0) {
        const categoryName =
          DishCategories?.data?.categories.find(
            (cat: any) => cat.id === row.category,
          )?.name || row.category;
        categoryMap[categoryName] = [
          ...(categoryMap[categoryName] || []),
          ...row.dishes.map((dish) => ({...dish, cost: row.Rate})),
        ];
      }
    });
    if (extraDishes.length > 0) {
      const extraDishDetails = extraDishes.map((row) => {
        const dishInfo = Dishes?.data?.dishes.find(
          (d) => d.id === row.dishes[0]?.value,
        );
        return {
          label: dishInfo?.name || 'Unknown Dish',
          value: row.dishes[0]?.value || '',
          cost: row.Rate,
        };
      });
      categoryMap['Extra Dishes'] = [
        ...(categoryMap['Extra Dishes'] || []),
        ...extraDishDetails,
      ];
    }
    return (
      <div className="mt-6 overflow-hidden rounded-md border border-stroke dark:border-strokedark">
        <div className="bg-gray-50 border-b border-stroke p-4 dark:border-strokedark">
          <h3 className="text-gray-800 font-semibold">
            Selected Dishes by Category
          </h3>
        </div>
        <div className="p-4">
          <table className="w-full text-sm">
            <thead className="text-gray-600 text-left">
              <tr>
                <th className="pb-3 font-medium">Category</th>
                <th className="pb-3 font-medium">Dishes</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(categoryMap).map(([category, dishes]) => (
                <tr key={category} className="border-t">
                  <td className="py-3 font-medium">{category}</td>
                  <td className="py-3">
                    {dishes.map((dish) => dish.label).join(', ')}
                  </td>
                </tr>
              ))}
              {Object.keys(categoryMap).length === 0 && (
                <tr>
                  <td colSpan={2} className="text-gray-500 py-8 text-center">
                    No dishes selected
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const onSubmit = (data: SubEventFormValues) => {
    const isNameAlreadyExist = subEventResponse?.data?.subEvents?.some(
      (subEvent: any) => subEvent.name === data.subEventName,
    );
    if (isNameAlreadyExist) {
      toast.error('Sub Event name already exists');
      return;
    }
    const combinedDateTime = `${data.date}T${data.time}:00+05:30`;
    const allDishIds = [
      ...mainDishes.flatMap((row) => row.dishes.map((dish) => dish.value)),
      ...extraDishes.map((row) => row.dishes[0]?.value).filter(Boolean),
    ];
    const formattedDishes = Array.from(new Set(allDishIds)).map((dishId) => ({
      dishId,
    }));
    const formData = {
      name: data.subEventName,
      address: data.subEventAddress || '',
      dishes: formattedDishes,
      expectedPeople: data.expectedPeople,
      time: combinedDateTime,
      date: data.date,
      eventId,
      packageId: selectedPackageId || undefined,
      note: data.note || '',
    };
    createSubevent(formData);
    if (!isPending) {
      methods.reset();
      setSelectedPackageId(null);
      setMainDishes([]);
      setExtraDishes([]);
    }
  };

  if (isPending) return <Loader />;

  return (
    <FormProvider {...methods}>
      <div className="overflow-hidden rounded-md bg-white shadow-md dark:bg-black">
        <div className="from-gray-50 to-gray-100 flex items-center justify-between border-b border-stroke bg-gradient-to-r p-5 dark:border-strokedark">
          <div className="flex items-center">
            <div className="mr-4 rounded-md bg-indigo-100 px-3 py-1 font-medium text-indigo-800">
              Select Package
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div className="space-y-6">
              <GenericInputField
                name="subEventName"
                label="Subevent Name"
                placeholder="Enter Subevent Name"
                className="w-full rounded-md border border-stroke px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-300 dark:border-strokedark dark:bg-black"
              />
              <GenericTextArea
                name="subEventAddress"
                label="Address"
                placeholder="Enter Address"
                className="w-full rounded-md border border-stroke px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-300 dark:border-strokedark dark:bg-black"
              />
              <GenericInputField
                name="expectedPeople"
                label="Expected People"
                placeholder="Enter Expected People"
                type="number"
                className="w-full rounded-md border border-stroke px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-300 dark:border-strokedark dark:bg-black"
                min="0"
              />
              <div className="grid grid-cols-2 gap-4">
                <GenericDropdown
                  name="date"
                  label="Date"
                  options={dateOptions}
                  control={control}
                  className="w-full rounded-md border border-stroke px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-300 dark:border-strokedark dark:bg-black"
                />
                <div>
                  <label className="text-gray-700 dark:text-gray-200 mb-2 block text-sm font-medium">
                    Time
                  </label>
                  <input
                    type="time"
                    id="time"
                    value={watch('time') || ''}
                    onChange={(e) => setValue('time', e.target.value)}
                    className="w-full rounded-md border border-stroke px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-300 dark:border-strokedark dark:bg-black"
                  />
                </div>
              </div>
              <div>
                <label className="text-gray-700 dark:text-gray-200 mb-2 block text-sm font-medium">
                  Select Package
                </label>
                <Select
                  options={getPackageOptions()}
                  value={
                    getPackageOptions().find(
                      (opt) => opt.value === selectedPackageId,
                    ) || null
                  }
                  onChange={(option) =>
                    setSelectedPackageId(option?.value || null)
                  }
                  className="w-full"
                  isClearable
                  placeholder="Select Package"
                  styles={selectStyles}
                  aria-label="Select Package"
                  menuPortalTarget={document.body}
                />
              </div>
            </div>
            <div className="space-y-6">
              {selectedPackageId && (
                <>
                  <div className="overflow-hidden rounded-md border border-stroke dark:border-strokedark">
                    <div className="bg-gray-50 border-b border-stroke p-4 dark:border-strokedark">
                      <h3 className="text-gray-800 font-semibold">
                        Main Dish Selection
                      </h3>
                    </div>
                    <div className="space-y-5 p-4">
                      {mainDishes.map((row, index) => (
                        <div
                          key={row.id}
                          className="flex flex-col sm:flex-row sm:items-center sm:space-x-4"
                        >
                          <label className="text-gray-700 dark:text-gray-200 mb-2 w-full text-sm font-medium sm:w-1/4">
                            {DishCategories?.data?.categories.find(
                              (c) => c.id === row.category,
                            )?.name || 'Category'}
                          </label>
                          <Select
                            isMulti
                            options={getDishOptions(row.category || '', false)}
                            value={row.dishes}
                            onChange={(selected) =>
                              handleDishChange(
                                index,
                                'dishes',
                                [...(selected || [])],
                                false,
                              )
                            }
                            className="w-full sm:w-3/4"
                            placeholder="Select Dishes"
                            styles={selectStyles}
                            aria-label={`Select dishes for ${row.category}`}
                            menuPortalTarget={document.body}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="overflow-hidden rounded-md border border-stroke dark:border-strokedark">
                    <div className="bg-gray-50 border-b border-stroke p-4 dark:border-strokedark">
                      <h3 className="text-gray-800 font-semibold">
                        Extra Dish Selection
                      </h3>
                    </div>
                    <div className="space-y-5 p-4">
                      {extraDishes.map((row, index) => (
                        <div
                          key={row.id}
                          className="flex flex-col sm:flex-row sm:items-center sm:space-x-4"
                        >
                          <Select
                            options={getDishOptions('', true)}
                            value={row.dishes[0] || null}
                            onChange={(selected) =>
                              handleDishChange(
                                index,
                                'dishes',
                                selected ? [selected] : [],
                                true,
                              )
                            }
                            className="w-full sm:w-3/4"
                            placeholder="Select Extra Dish"
                            styles={selectStyles}
                            aria-label="Select extra dish"
                            menuPortalTarget={document.body}
                          />
                          <div className="relative mt-2 sm:mt-0">
                            <span className="text-gray-500 absolute left-3 top-2.5">
                              ₹
                            </span>
                            <input
                              type="number"
                              value={row.Rate || 0}
                              disabled
                              className="w-full rounded-md border border-stroke px-3 py-2 pl-8 text-sm dark:border-strokedark dark:bg-black sm:w-1/4"
                              aria-label="Extra dish rate"
                            />
                          </div>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addExtraDishRow}
                        className="flex items-center justify-center rounded-md bg-amber-500 px-4 py-2 text-sm text-white hover:bg-amber-600"
                      >
                        <BiPlus size={18} className="mr-1" />
                        Add Extra Dish
                      </button>
                    </div>
                  </div>
                </>
              )}
              <GenericTextArea
                name="note"
                label="Note"
                placeholder="Enter any additional notes"
                className="w-full rounded-md border border-stroke px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-300 dark:border-strokedark dark:bg-black"
              />
              <button
                type="button"
                onClick={handleSubmit(onSubmit)}
                disabled={isPending}
                className="flex w-full items-center justify-center rounded-md bg-gradient-to-r from-green-600 to-emerald-700 py-3 font-medium text-white transition-all hover:from-green-700 hover:to-emerald-800"
              >
                {isPending ? (
                  <>
                    <svg
                      className="-ml-1 mr-3 h-5 w-5 animate-spin text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  <>
                    <BiSave className="mr-2 text-lg" />
                    Submit
                  </>
                )}
              </button>
            </div>
          </div>
          {renderSelectedDishes()}
        </div>
      </div>
    </FormProvider>
  );
};

export default ExternalSubEventForm;
