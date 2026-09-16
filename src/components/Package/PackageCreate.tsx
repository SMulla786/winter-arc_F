import React, {useEffect, useState} from 'react';
import Select from 'react-select';
import {BiSave, BiPlus, BiMinus} from 'react-icons/bi';
import GenericButton from './../Forms/Buttons/GenericButton';
import GenericInputField from '../Forms/Input/GenericInputField';
import {FormProvider, useForm} from 'react-hook-form';
import {
  useGetDishCategories,
  useGetDishes,
} from '@/lib/react-query/queriesAndMutations/cateror/dish';
import {useAddPackage} from '@/lib/react-query/queriesAndMutations/cateror/pakage';
import {FaTrash} from 'react-icons/fa';
import toast from 'react-hot-toast';

type OptionType = {label: string; value: string};

interface RangePrice {
  peopleFrom: number;
  peopleTo: number;
  price: number;
}

interface PackageFormData {
  name: string;
  packageType: 'VEG' | 'NONVEG';
}

interface MainGroup {
  id: number;
  mainCategory: string;
  optional: boolean; // Added optional field
  count: number;
  subRows: SubRow[];
}

interface SubRow {
  id: number;
  subCategory: string;
  selectedCategories: OptionType[];
  dishes: OptionType[];
  count: number;
  price?: number;
}

interface ExtraDishRow {
  id: number;
  category: string;
  dishes: OptionType[];
  count?: number;
  Rate?: number;
}

interface PackageCreateProps {
  onSuccess?: () => void;
}

const PackageCreate: React.FC<PackageCreateProps> = ({onSuccess}) => {
  const methods = useForm<PackageFormData>({
    defaultValues: {
      name: '',
      packageType: 'VEG',
    },
  });

  const {data: categories} = useGetDishCategories();
  const {data: dishes} = useGetDishes();
  const {mutate: addPackage} = useAddPackage();

  const [mockCategories, setMockCategories] = useState<
    {id: string; name: string}[]
  >([]);
  const [mockDishes, setMockDishes] = useState<
    {categoryId: string; name: string; id: string}[]
  >([]);
  const [rangePrices, setRangePrices] = useState<RangePrice[]>([
    {peopleFrom: 0, peopleTo: 0, price: 0},
  ]);

  useEffect(() => {
    if (categories?.data?.categories) {
      setMockCategories(
        categories.data.categories.map((cat: {id: string; name: string}) => ({
          id: cat.id,
          name: cat.name,
        })),
      );
    }
  }, [categories]);

  useEffect(() => {
    if (dishes?.data?.dishes) {
      setMockDishes(
        dishes.data.dishes.map(
          (dish: {id: string; name: string; categoryId: string}) => ({
            name: dish.name,
            id: dish.id,
            categoryId: dish.categoryId,
          }),
        ),
      );
    }
  }, [dishes]);

  const {handleSubmit} = methods;
  const [rangeErrors, setRangeErrors] = useState<string[]>([]);

  const [mainGroups, setMainGroups] = useState<MainGroup[]>([
    {
      id: Date.now(),
      mainCategory: '',
      optional: false, // Default optional
      count: 1,
      subRows: [
        {
          id: Date.now() + 1,
          subCategory: '',
          selectedCategories: [],
          dishes: [],
          count: 1,
          price: 0,
        },
      ],
    },
  ]);

  const [extraDishRows, setExtraDishRows] = useState<ExtraDishRow[]>([
    {id: Date.now(), category: '', dishes: [], count: 1, Rate: 0},
  ]);

  // Main Group Handlers
  const addMainGroup = () => {
    const newGroup: MainGroup = {
      id: Date.now(),
      mainCategory: '',
      optional: false, // Default optional
      count: 1,
      subRows: [
        {
          id: Date.now() + 1,
          subCategory: '',
          selectedCategories: [],
          dishes: [],
          count: 1,
          price: 0,
        },
      ],
    };
    setMainGroups((prev) => [...prev, newGroup]);
  };

  const removeMainGroup = (groupId: number) => {
    setMainGroups((prev) => prev.filter((g) => g.id !== groupId));
  };

  const updateMainCategory = (groupId: number, value: string) => {
    setMainGroups((prev) =>
      prev.map((g) => (g.id === groupId ? {...g, mainCategory: value} : g)),
    );
  };

  const updateMainOptional = (groupId: number, value: boolean) => {
    setMainGroups((prev) =>
      prev.map((g) => (g.id === groupId ? {...g, optional: value} : g)),
    );
  };

  const updateMainCount = (groupId: number, value: number) => {
    setMainGroups((prev) =>
      prev.map((g) => (g.id === groupId ? {...g, count: value} : g)),
    );
  };

  // Sub Row Handlers
  const addSubRow = (groupId: number) => {
    setMainGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? {
              ...g,
              subRows: [
                ...g.subRows,
                {
                  id: Date.now(),
                  subCategory: '',
                  selectedCategories: [],
                  dishes: [],
                  count: 1,
                  price: 0,
                },
              ],
            }
          : g,
      ),
    );
  };

  const removeSubRow = (groupId: number, subId: number) => {
    setMainGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? {...g, subRows: g.subRows.filter((s) => s.id !== subId)}
          : g,
      ),
    );
  };

  const updateSubRow = <K extends keyof SubRow>(
    groupId: number,
    subId: number,
    field: K,
    value: SubRow[K],
  ) => {
    setMainGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? {
              ...g,
              subRows: g.subRows.map((s) =>
                s.id === subId ? {...s, [field]: value} : s,
              ),
            }
          : g,
      ),
    );
  };

  // Range Price Handlers
  const updateRangeValue = (
    index: number,
    field: keyof RangePrice,
    value: number,
  ) => {
    const updated = [...rangePrices];
    updated[index][field] = value;
    setRangePrices(updated);
  };

  const addRangeRow = () => {
    setRangePrices((prev) => [...prev, {peopleFrom: 0, peopleTo: 0, price: 0}]);
  };

  const removeRangeRow = (index: number) => {
    const updated = [...rangePrices];
    updated.splice(index, 1);
    setRangePrices(updated);
  };

  // Options
  const getCategoryOptions = (): OptionType[] =>
    mockCategories.map((cat) => ({
      label: cat.name,
      value: cat.id,
    }));

  const getDishOptions = (categoryIds: string[]): OptionType[] => {
    if (categoryIds.length === 0) return [];
    return mockDishes
      .filter((dish) => categoryIds.includes(dish.categoryId))
      .map((dish) => ({
        label: dish.name,
        value: dish.id,
      }));
  };

  // Extra Dishes Handlers
  const handleExtraDishChange = <K extends keyof ExtraDishRow>(
    index: number,
    field: K,
    value: ExtraDishRow[K],
  ) => {
    const rows = [...extraDishRows];
    rows[index] = {...rows[index], [field]: value};
    setExtraDishRows(rows);
  };

  const addExtraDishRow = () => {
    setExtraDishRows((prev) => [
      ...prev,
      {id: Date.now(), category: '', dishes: [], count: 1, Rate: 0},
    ]);
  };

  const removeExtraDishRow = (id: number) => {
    setExtraDishRows((prev) => prev.filter((row) => row.id !== id));
  };

  const getExtraDishOptions = (categoryId: string): OptionType[] =>
    mockDishes
      .filter((dish) => dish.categoryId === categoryId)
      .map((dish) => ({
        label: dish.name,
        value: dish.id,
      }));

  // Submit
  const onSubmit = async (data: PackageFormData) => {
    const errors: string[] = [];

    for (let i = 0; i < rangePrices.length; i++) {
      for (let j = i + 1; j < rangePrices.length; j++) {
        const r1 = rangePrices[i];
        const r2 = rangePrices[j];
        if (r1.peopleFrom <= r2.peopleTo && r1.peopleTo >= r2.peopleFrom) {
          errors[i] = `Overlaps with range ${r2.peopleFrom}-${r2.peopleTo}`;
          errors[j] = `Overlaps with range ${r1.peopleFrom}-${r1.peopleTo}`;
        }
      }
    }

    setRangeErrors(errors);
    if (errors.length > 0) return;

    const mainDishesGrouped = mainGroups
      .filter(
        (group) =>
          group.mainCategory.trim() !== '' &&
          group.subRows.some((sub) => sub.dishes.length > 0),
      )
      .map((group) => ({
        group: group.mainCategory.trim(),
        optional: group.optional, // Include optional from UI
        count: group.count ?? 1,
        subgroup: group.subRows
          .filter(
            (sub) => sub.dishes.length > 0 && sub.subCategory.trim() !== '',
          )
          .map((sub) => ({
            name: sub.subCategory.trim(),
            count: sub.count ?? 1,
            cost: Math.floor(sub.price ?? 0),
            dishes: sub.dishes.map((d) => d.value),
          })),
      }))
      .filter((group) => group.subgroup.length > 0);

    if (mainDishesGrouped.length === 0) {
      alert('Please add at least one main dish group with dishes.');
      return;
    }

    const formatExtraDishes = extraDishRows
      .filter((row) => row.category && row.dishes.length > 0)
      .map((row) => ({
        category: row.category,
        dishes: row.dishes.map((dish) => dish.value),
        count: row.count ?? 1,
        Rate: row.Rate ?? 0,
      }));

    const formattedRange = rangePrices
      .filter(
        (r) => r.peopleFrom > 0 && r.peopleTo > 0 && r.peopleFrom <= r.peopleTo,
      )
      .map((item) => ({
        from: item.peopleFrom,
        to: item.peopleTo,
        price: item.price,
      }));

    if (formattedRange.length === 0) {
      alert('Please add at least one valid price range.');
      return;
    }

    const packageData = {
      name: data.name.trim(),
      packageType: data.packageType,
      range: formattedRange,
      mainDishes: mainDishesGrouped,
      extraDishes: formatExtraDishes.length > 0 ? formatExtraDishes : undefined,
    };

    await addPackage(packageData, {
      onSuccess: () => onSuccess?.(),
      onError: (error) => {
        if (error.message === 'Only one main dish can not be optional') {
          toast.error('Only one main dish can not be optional');
        } else {
          console.error('Failed to create package:', error);
        }
      },
    });
  };

  const renderMainDishSection = () => (
    <div className="mb-6 rounded-md bg-white p-4 dark:bg-boxdark">
      <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <h2 className="text-lg font-semibold dark:text-white">
          Main Dish Selection
        </h2>
        <button
          type="button"
          onClick={addMainGroup}
          className="flex items-center justify-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          title="Add Main Category Group"
        >
          <BiPlus size={24} />
        </button>
      </div>

      <div className="space-y-8">
        {mainGroups.map((group) => (
          <div
            key={group.id}
            className="rounded-lg border border-stroke p-6 dark:border-strokedark"
          >
            {/* Main Category Name + Optional (checkbox) + Count */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-4">
              <div className="flex-1">
                <label className="mb-1 block text-sm font-medium dark:text-white">
                  Main Category Name
                </label>
                <input
                  type="text"
                  value={group.mainCategory}
                  onChange={(e) => updateMainCategory(group.id, e.target.value)}
                  placeholder="e.g., Starters, Main Course, Desserts"
                  className="w-full rounded-md border border-stroke px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-strokedark dark:bg-slate-800 dark:text-white"
                />
              </div>

              {/* Optional Checkbox */}
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={group.optional}
                    onChange={(e) =>
                      updateMainOptional(group.id, e.target.checked)
                    }
                    className="h-4 w-4 rounded border-stroke text-blue-600 focus:ring-blue-500 dark:border-strokedark"
                  />
                  <span className="text-sm font-medium dark:text-white">
                    Optional
                  </span>
                </label>
              </div>

              <div className="w-full sm:w-28">
                <label className="mb-1 block text-sm font-medium dark:text-white">
                  Count
                </label>
                <input
                  type="number"
                  min={1}
                  value={group.count}
                  onChange={(e) =>
                    updateMainCount(
                      group.id,
                      e.target.value === '' ? 1 : parseInt(e.target.value, 10),
                    )
                  }
                  className="w-full rounded-md border border-stroke px-3 py-2 text-center dark:border-strokedark dark:bg-slate-800 dark:text-white"
                />
              </div>

              {mainGroups.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeMainGroup(group.id)}
                  className="mt-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 sm:mt-0"
                  title="Remove Main Group"
                >
                  <FaTrash size={20} />
                </button>
              )}
            </div>

            {/* Sub Rows - Horizontal Scroll Container */}
            <div className="space-y-4">
              {/* Labels and Inputs in one scrollable container */}
              <div className="relative">
                {/* Horizontal scroll container for everything */}
                <div className="-mx-1 overflow-x-auto px-1">
                  <div className="min-w-max space-y-4">
                    {/* Label Row */}
                    <div className="flex min-w-max items-end gap-4">
                      <div className="w-64 flex-shrink-0">
                        <label className="mb-1 block text-sm font-medium dark:text-white">
                          Sub Category Name
                        </label>
                      </div>
                      <div className="flex-shrink-0" style={{width: '280px'}}>
                        <label className="mb-1 block text-sm font-medium dark:text-white">
                          Dish Categories
                        </label>
                      </div>
                      <div className="flex-shrink-0" style={{width: '280px'}}>
                        <label className="mb-1 block text-sm font-medium dark:text-white">
                          Dishes
                        </label>
                      </div>
                      <div className="w-24 flex-shrink-0">
                        <label className="mb-1 block text-sm font-medium dark:text-white">
                          Count
                        </label>
                      </div>
                      <div className="w-32 flex-shrink-0">
                        <label className="mb-1 block text-sm font-medium dark:text-white">
                          Price (₹)
                        </label>
                      </div>
                      <div className="flex min-w-[70px] flex-shrink-0 items-center gap-2 pb-1">
                        <span className="invisible">
                          {/* Empty space for button alignment */}
                        </span>
                      </div>
                    </div>

                    {/* Input Rows */}
                    {group.subRows.map((sub, subIndex) => (
                      <div
                        key={sub.id}
                        className="flex min-w-max items-end gap-4"
                      >
                        {/* Sub Category Name */}
                        <div className="w-64 flex-shrink-0">
                          <input
                            type="text"
                            value={sub.subCategory}
                            onChange={(e) =>
                              updateSubRow(
                                group.id,
                                sub.id,
                                'subCategory',
                                e.target.value,
                              )
                            }
                            placeholder="e.g., Veg Starters"
                            className="w-full rounded-md border border-stroke px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-strokedark dark:bg-slate-800 dark:text-white"
                          />
                        </div>

                        {/* Dish Categories */}
                        <div className="flex-shrink-0" style={{width: '280px'}}>
                          <Select<OptionType, true>
                            isMulti
                            options={getCategoryOptions()}
                            value={sub.selectedCategories}
                            onChange={(selected) =>
                              updateSubRow(
                                group.id,
                                sub.id,
                                'selectedCategories',
                                [...(selected || [])],
                              )
                            }
                            placeholder="Select categories"
                            className="min-w-[280px] text-left"
                            menuPortalTarget={
                              typeof window !== 'undefined'
                                ? document.body
                                : null
                            }
                            menuPosition="fixed"
                            classNames={{
                              control: (state) =>
                                `border border-gray-300 bg-white text-black placeholder:text-gray-500
         dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-gray-400
         rounded-md px-3 py-1 min-h-[38px]
         ${state.isFocused ? 'border-blue-500 ring-1 ring-blue-500 dark:border-blue-500' : ''}
         ${state.isDisabled ? 'bg-gray-100 dark:bg-slate-900 opacity-60' : ''}`,
                              menu: () =>
                                `bg-white text-black border border-gray-300 shadow-md rounded-md mt-1
         dark:bg-slate-800 dark:text-white dark:border-slate-700`,
                              option: (state) =>
                                `px-3 py-2 cursor-pointer 
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
                              input: () => `text-black dark:text-white`,
                              singleValue: () => `text-black dark:text-white`,
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
                              menuPortal: (base) => ({...base, zIndex: 9999}),
                            }}
                            menuShouldScrollIntoView={false}
                          />
                        </div>

                        {/* Dishes */}
                        <div className="flex-shrink-0" style={{width: '280px'}}>
                          <Select<OptionType, true>
                            isMulti
                            options={getDishOptions(
                              sub.selectedCategories.map((c) => c.value),
                            )}
                            value={sub.dishes}
                            onChange={(selected) =>
                              updateSubRow(group.id, sub.id, 'dishes', [
                                ...(selected || []),
                              ])
                            }
                            isDisabled={sub.selectedCategories.length === 0}
                            placeholder="Select dishes"
                            className="min-w-[280px] text-left"
                            menuPortalTarget={
                              typeof window !== 'undefined'
                                ? document.body
                                : null
                            }
                            menuPosition="fixed"
                            classNames={{
                              control: (state) =>
                                `border border-gray-300 bg-white text-black placeholder:text-gray-500
         dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-gray-400
         rounded-md px-3 py-1 min-h-[38px]
         ${state.isFocused ? 'border-blue-500 ring-1 ring-blue-500 dark:border-blue-500' : ''}
         ${state.isDisabled ? 'bg-gray-100 dark:bg-slate-900 opacity-60 cursor-not-allowed' : ''}`,
                              menu: () =>
                                `bg-white text-black border border-gray-300 shadow-md rounded-md mt-1
         dark:bg-slate-800 dark:text-white dark:border-slate-700`,
                              option: (state) =>
                                `px-3 py-2 cursor-pointer 
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
                              input: () => `text-black dark:text-white`,
                              singleValue: () => `text-black dark:text-white`,
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
                              menuPortal: (base) => ({...base, zIndex: 9999}),
                            }}
                            menuShouldScrollIntoView={false}
                          />
                        </div>
                        {/* Sub Row Count Field */}
                        <div className="w-24 flex-shrink-0">
                          <input
                            type="number"
                            min={1}
                            value={sub.count}
                            onChange={(e) =>
                              updateSubRow(
                                group.id,
                                sub.id,
                                'count',
                                e.target.value === ''
                                  ? 1
                                  : parseInt(e.target.value, 10),
                              )
                            }
                            className="w-full rounded-md border border-stroke px-3 py-2 text-center dark:border-strokedark dark:bg-slate-800 dark:text-white"
                          />
                        </div>

                        {/* Price */}
                        <div className="w-32 flex-shrink-0">
                          <input
                            type="number"
                            min={0}
                            step="0.01"
                            value={sub.price ?? 0}
                            onChange={(e) =>
                              updateSubRow(
                                group.id,
                                sub.id,
                                'price',
                                e.target.value === ''
                                  ? 0
                                  : parseFloat(e.target.value),
                              )
                            }
                            placeholder="0.00"
                            className="w-full rounded-md border border-stroke px-3 py-2 text-center dark:border-strokedark dark:bg-slate-800 dark:text-white"
                          />
                        </div>

                        {/* Buttons */}
                        <div className="flex min-w-[70px] flex-shrink-0 items-center gap-2 pb-1">
                          {group.subRows.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeSubRow(group.id, sub.id)}
                              className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                            >
                              <BiMinus size={20} />
                            </button>
                          )}
                          {subIndex === group.subRows.length - 1 && (
                            <button
                              type="button"
                              onClick={() => addSubRow(group.id)}
                              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                              <BiPlus size={20} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-4">
        <h2 className="mb-6 text-2xl font-semibold text-black-2 dark:text-white">
          Package Creation
        </h2>

        <div className="mb-6 rounded-lg border-stroke bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-end">
            <div className="flex-1">
              <label className="text-gray-700 dark:text-gray-200 text-md mb-1 block font-medium">
                Package Name
              </label>
              <GenericInputField
                {...methods.register('name')}
                placeholder="Enter Package Name"
                className="w-full rounded-md border border-stroke p-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-strokedark dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="text-gray-700 dark:text-gray-200 mb-1 block text-sm font-medium">
                Food Type
              </label>
              <div className="flex gap-3">
                <label className="flex cursor-pointer items-center gap-2 rounded-md border border-stroke px-4 py-2 text-sm transition hover:border-green-500 dark:border-strokedark">
                  <input
                    type="radio"
                    value="VEG"
                    {...methods.register('packageType')}
                    className="border-stroke accent-green-600 dark:border-strokedark"
                  />
                  <span className="font-medium text-green-700 dark:text-green-400">
                    Veg
                  </span>
                </label>
                <label className="flex cursor-pointer items-center gap-2 rounded-md border border-stroke px-4 py-2 text-sm transition hover:border-red-500 dark:border-strokedark">
                  <input
                    type="radio"
                    value="NONVEG"
                    {...methods.register('packageType')}
                    className="border-stroke accent-red-600 dark:border-strokedark"
                  />
                  <span className="font-medium text-red-700 dark:text-red-400">
                    Non-Veg
                  </span>
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {rangePrices.map((range, index) => (
              <div key={index} className="flex items-end gap-4">
                <div className="flex-1">
                  <label className="mb-1 block text-sm font-medium dark:text-white">
                    People From
                  </label>
                  <input
                    type="number"
                    value={range.peopleFrom}
                    onChange={(e) =>
                      updateRangeValue(
                        index,
                        'peopleFrom',
                        parseInt(e.target.value) || 0,
                      )
                    }
                    className="w-full rounded-md border border-stroke px-2 py-1 text-sm dark:border-strokedark dark:bg-slate-800 dark:text-white"
                  />
                  {rangeErrors[index] && (
                    <p className="mt-1 text-xs text-red-500">
                      {rangeErrors[index]}
                    </p>
                  )}
                </div>
                <div className="flex-1">
                  <label className="mb-1 block text-sm font-medium dark:text-white">
                    People To
                  </label>
                  <input
                    type="number"
                    value={range.peopleTo}
                    onChange={(e) =>
                      updateRangeValue(
                        index,
                        'peopleTo',
                        parseInt(e.target.value) || 0,
                      )
                    }
                    className="w-full rounded-md border border-stroke px-2 py-1 text-sm dark:border-strokedark dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div className="flex-1">
                  <label className="mb-1 block text-sm font-medium dark:text-white">
                    Price
                  </label>
                  <input
                    type="number"
                    value={range.price}
                    onChange={(e) =>
                      updateRangeValue(
                        index,
                        'price',
                        parseInt(e.target.value) || 0,
                      )
                    }
                    className="w-full rounded-md border border-stroke px-2 py-1 text-sm dark:border-strokedark dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div className="flex items-center gap-2 pb-1">
                  {rangePrices.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRangeRow(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <BiMinus size={20} />
                    </button>
                  )}
                  {index === rangePrices.length - 1 && (
                    <button
                      type="button"
                      onClick={addRangeRow}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <BiPlus size={20} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {renderMainDishSection()}

        <div className="flex justify-center sm:justify-end">
          <GenericButton
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 sm:w-auto"
          >
            <BiSave className="text-lg" />
            Save Package
          </GenericButton>
        </div>
      </form>
    </FormProvider>
  );
};

export default PackageCreate;
