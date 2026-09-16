/* eslint-disable */
import {useForm} from 'react-hook-form';
import {SubEventFormValues} from '../SubEvent';
import {CreateSubEventSchema} from '@/lib/validation/eventSchema';
import {zodResolver} from '@hookform/resolvers/zod';
import {useGetAllPackage} from '@/lib/react-query/package/displaypackage';
import {useCreateSubevent} from '@/lib/react-query/queriesAndMutations/cateror/event';
import {useGetSubevent} from '@/lib/react-query/queriesAndMutations/cateror/event';
import {useGetDishCategories} from '@/lib/react-query/queriesAndMutations/cateror/dish';
import {useGetDishes} from '@/lib/react-query/queriesAndMutations/cateror/dish';
import {useState} from 'react';
import {format} from 'date-fns';
import React from 'react';

interface DishRow {
  id: number;
  category?: string;
  dishes: {label: string; value: string}[];
  count?: number;
  Rate?: number;
}

const SelectPackageForm: React.FC<{eventId: string}> = ({eventId}) => {
  console.log('SelectPackageForm rendered');
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
        ?.filter((row) => row.dishes.length > 0)
        ?.map((row) => row.dishes[0].value);
      return selectedPackage.extraDishes
        ?.filter((ed: any) => !selectedDishIds.includes(ed.dishId))
        ?.map((ed: any) => ({
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

    const mappedServices = allAddOnServices?.map((service: any) => ({
      label: service.name,
      value: service.id,
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
                            className="w-full p-8 sm:w-3/4"
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
                label="Noteee"
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

export default SelectPackageForm;
