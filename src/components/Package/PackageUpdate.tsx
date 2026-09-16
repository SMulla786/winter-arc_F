/* eslint-disable */
import React, {useEffect, useState} from 'react';
import Select from 'react-select';
import {BiSave, BiPlus, BiMinus} from 'react-icons/bi';
import {FaArrowLeft, FaTrash} from 'react-icons/fa';
import {FormProvider, useForm} from 'react-hook-form';
import GenericButton from '../Forms/Buttons/GenericButton';
import GenericInputField from '../Forms/Input/GenericInputField';
import {
  useGetDishCategories,
  useGetDishes,
} from '@/lib/react-query/queriesAndMutations/cateror/dish';
import {
  useGetPackageById,
  useUpdatePackage,
} from '@/lib/react-query/queriesAndMutations/cateror/pakage';
import {Link, useNavigate, useParams} from '@tanstack/react-router';
import toast from 'react-hot-toast';
import {BsFillArrowLeftCircleFill} from 'react-icons/bs';

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

const PackageUpdate: React.FC = () => {
  const navigate = useNavigate();
  const {id} = useParams({strict: false}) as {id: string};

  const methods = useForm<PackageFormData>({
    defaultValues: {
      name: '',
      packageType: 'VEG',
    },
  });

  const {data: categories} = useGetDishCategories();
  const {data: dishes} = useGetDishes();
  const {data: packageData, isLoading} = useGetPackageById(id);
  const {mutateAsync: updatePackage, isPending} = useUpdatePackage(id);

  const [mockCategories, setMockCategories] = useState<
    {id: string; name: string}[]
  >([]);
  const [mockDishes, setMockDishes] = useState<
    {categoryId: string; name: string; id: string}[]
  >([]);

  const [rangePrices, setRangePrices] = useState<RangePrice[]>([
    {peopleFrom: 0, peopleTo: 0, price: 0},
  ]);
  const [mainGroups, setMainGroups] = useState<MainGroup[]>([
    {
      id: Date.now(),
      mainCategory: '',
      optional: false, // Added optional
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
  const [rangeErrors, setRangeErrors] = useState<string[]>([]);

  // Load categories & dishes
  useEffect(() => {
    if (categories?.data?.categories) {
      setMockCategories(
        categories.data.categories.map((cat: any) => ({
          id: cat.id,
          name: cat.name,
        })),
      );
    }
  }, [categories]);

  useEffect(() => {
    if (dishes?.data?.dishes) {
      setMockDishes(
        dishes.data.dishes.map((dish: any) => ({
          id: dish.id,
          name: dish.name,
          categoryId: dish.categoryId,
        })),
      );
    }
  }, [dishes]);

  // Load package data when available
  useEffect(() => {
    if (!packageData || mockDishes.length === 0 || mockCategories.length === 0)
      return;

    // Reset form fields
    methods.reset({
      name: packageData.name || '',
      packageType: packageData.packageType || 'VEG',
    });

    // Map Price Ranges
    const ranges = (packageData.range || []).map((r: any) => ({
      peopleFrom: r.from,
      peopleTo: r.to,
      price: r.price,
    }));
    setRangePrices(
      ranges.length > 0 ? ranges : [{peopleFrom: 0, peopleTo: 0, price: 0}],
    );

    // Map Main Dish Groups - FIXED: using mainDishes instead of groups
    const loadedMainGroups: MainGroup[] = (packageData.mainDishes || []).map(
      (group: any, gIdx: number) => {
        const subRows = (group.subgroup || []).map((sub: any, sIdx: number) => {
          // Extract dish IDs from the dishes array - FIXED: dishes are objects with id
          const dishIds = (sub.dishes || []).map((d: any) => d.id);

          const selectedDishes: OptionType[] = dishIds.map((dishId: string) => {
            const dish = mockDishes.find((d) => d.id === dishId);
            return {
              label: dish?.name || dishId,
              value: dishId,
            };
          });

          // Derive selected categories from selected dishes
          const categoryIds = [
            ...new Set(
              selectedDishes
                .map(
                  (d) => mockDishes.find((md) => md.id === d.value)?.categoryId,
                )
                .filter(Boolean) as string[],
            ),
          ];

          const selectedCategories: OptionType[] = categoryIds.map(
            (catId: string) => {
              const cat = mockCategories.find((c) => c.id === catId);
              return {
                label: cat?.name || catId,
                value: catId,
              };
            },
          );

          return {
            id: Date.now() + gIdx * 100 + sIdx,
            subCategory: sub.name || '',
            selectedCategories,
            dishes: selectedDishes,
            count: sub.count || 0,
            price: sub.cost || 0,
          };
        });

        return {
          id: Date.now() + gIdx,
          mainCategory: group.group || '',
          optional: group.optional || false, // Get optional from API
          count: group.count || 0,
          subRows,
        };
      },
    );

    setMainGroups(
      loadedMainGroups.length > 0
        ? loadedMainGroups
        : [
            {
              id: Date.now(),
              mainCategory: '',
              optional: false,
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
          ],
    );

    // Map Extra Dishes
    const extraByCategory = new Map<
      string,
      {dishIds: string[]; count: number; rate: number}
    >();

    (packageData.extraDishes || []).forEach((ex: any) => {
      const catId = ex.category;
      const dishId = ex.dishes?.[0]?.id || ex.dishes?.[0]?.value;

      if (!extraByCategory.has(catId)) {
        extraByCategory.set(catId, {
          dishIds: [],
          count: ex.count || 1,
          rate: ex.Rate || 0,
        });
      }

      const entry = extraByCategory.get(catId)!;
      if (dishId) {
        entry.dishIds.push(dishId);
      }
      entry.count = ex.count || entry.count;
      entry.rate = ex.Rate || entry.rate;
    });

    const loadedExtra: ExtraDishRow[] = Array.from(
      extraByCategory.entries(),
    ).map(([categoryId, data], idx) => {
      const selectedDishes: OptionType[] = data.dishIds.map(
        (dishId: string) => {
          const dish = mockDishes.find((d) => d.id === dishId);
          return {
            label: dish?.name || dishId,
            value: dishId,
          };
        },
      );

      return {
        id: Date.now() + idx,
        category: categoryId,
        dishes: selectedDishes,
        count: data.count,
        Rate: data.rate,
      };
    });

    setExtraDishRows(loadedExtra.length > 0 ? loadedExtra : []);
  }, [packageData, mockDishes, mockCategories, methods]);

  // Main Group Handlers
  const addMainGroup = () => {
    const newGroup: MainGroup = {
      id: Date.now(),
      mainCategory: '',
      optional: false,
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
        optional: group.optional, // Include optional field
        count: group.count ?? 1,
        subgroup: group.subRows
          .filter(
            (sub) => sub.dishes.length > 0 && sub.subCategory.trim() !== '',
          )
          .map((sub) => ({
            name: sub.subCategory.trim(),
            count: sub.count ?? 1,
            cost: Math.floor(sub.price ?? 0),
            dishes: sub.dishes.map((d) => d.value), // Only send dish IDs
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

    const payload = {
      name: data.name.trim(),
      packageType: data.packageType,
      range: formattedRange,
      mainDishes: mainDishesGrouped,
      extraDishes: formatExtraDishes.length > 0 ? formatExtraDishes : undefined,
    };

    try {
      await updatePackage(payload);
      navigate({to: '/packages/displaypackage'});
    } catch (error) {
      if (error.message === 'Only one main dish can not be optional') {
        toast.error('Only one main dish can not be optional');
      } else {
        console.error('Failed to update package:', error);
      }
    }
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
            {/* Main Category + Count + Optional */}
            <div className="mb-6 flex items-end gap-4">
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

              <div className="w-28">
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
                  className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                  title="Remove Main Group"
                >
                  <FaTrash size={20} />
                </button>
              )}
            </div>

            {/* Sub Rows */}
            <div className="space-y-4">
              {group.subRows.map((sub, subIndex) => (
                <div key={sub.id} className="flex items-end gap-4">
                  <div className="w-64">
                    <label className="mb-1 block text-sm font-medium dark:text-white">
                      {subIndex === 0 ? 'Sub Category Name' : ''}
                    </label>
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

                  <div className="flex-1">
                    <label className="mb-1 block text-sm font-medium dark:text-white">
                      {subIndex === 0 ? 'Dish Categories' : ''}
                    </label>
                    <Select<OptionType, true>
                      isMulti
                      options={getCategoryOptions()}
                      value={sub.selectedCategories}
                      onChange={(selected) =>
                        updateSubRow(group.id, sub.id, 'selectedCategories', [
                          ...(selected || []),
                        ])
                      }
                      placeholder="Select categories"
                      className="text-left"
                      menuPortalTarget={
                        typeof window !== 'undefined' ? document.body : null
                      }
                      menuPosition="fixed"
                      classNames={{
                        control: (state) =>
                          `border border-gray-300 bg-white text-black placeholder:text-gray-500
                         dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-gray-400 text-xs
                         ${state.isFocused ? 'border-gray-400 dark:border-slate-600' : ''}`,
                        menu: () =>
                          `bg-white text-black border border-gray-300 shadow-md
                         dark:bg-slate-800 dark:text-white dark:border-slate-700 text-xs`,
                        option: (state) =>
                          `px-3 py-2 cursor-pointer 
                         ${state.isFocused ? 'bg-gray-200 dark:bg-slate-700' : ''}
                         ${state.isSelected ? 'bg-gray-300 dark:bg-slate-900 text-black dark:text-white' : ''}`,
                        multiValue: () =>
                          `bg-gray-200 text-black dark:bg-slate-700 dark:text-white rounded-md px-2 py-1`,
                        multiValueLabel: () => `text-black dark:text-white`,
                        multiValueRemove: () =>
                          `text-black dark:text-white hover:bg-red-400 hover:text-white dark:hover:bg-red-600`,
                      }}
                      styles={{
                        menuPortal: (base) => ({...base, zIndex: 9999}),
                      }}
                      menuShouldScrollIntoView={false}
                    />
                  </div>

                  <div className="flex-1">
                    <label className="mb-1 block text-sm font-medium dark:text-white">
                      {subIndex === 0 ? 'Dishes' : ''}
                    </label>
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
                      className="text-left"
                      menuPortalTarget={
                        typeof window !== 'undefined' ? document.body : null
                      }
                      menuPosition="fixed"
                      classNames={{
                        control: (state) =>
                          `border border-gray-300 bg-white text-black placeholder:text-gray-500
                         dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-gray-400 text-xs
                         ${state.isFocused ? 'border-gray-400 dark:border-slate-600' : ''}`,
                        menu: () =>
                          `bg-white text-black border border-gray-300 shadow-md
                         dark:bg-slate-800 dark:text-white dark:border-slate-700`,
                        option: (state) =>
                          `px-3 py-2 cursor-pointer  text-xs
                         ${state.isFocused ? 'bg-gray-200 dark:bg-slate-700' : ''}
                         ${state.isSelected ? 'bg-gray-300 dark:bg-slate-900 text-black dark:text-white' : ''}`,
                        multiValue: () =>
                          `bg-gray-200 text-black dark:bg-slate-700 dark:text-white rounded-md px-2 py-1`,
                        multiValueLabel: () => `text-black dark:text-white`,
                        multiValueRemove: () =>
                          `text-black dark:text-white hover:bg-red-400 hover:text-white dark:hover:bg-red-600`,
                      }}
                      styles={{
                        menuPortal: (base) => ({...base, zIndex: 9999}),
                      }}
                      menuShouldScrollIntoView={false}
                    />
                  </div>

                  {/* Count Field */}
                  <div className="w-24">
                    <label className="mb-1 block text-sm font-medium dark:text-white">
                      {subIndex === 0 ? 'Count' : ''}
                    </label>
                    <input
                      type="number"
                      min={0}
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

                  <div className="w-32">
                    <label className="mb-1 block text-sm font-medium dark:text-white">
                      {subIndex === 0 ? 'Price (₹)' : ''}
                    </label>
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

                  <div className="flex items-center gap-2 pb-1">
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
        ))}
      </div>
    </div>
  );

  if (isLoading) return <div>Loading package...</div>;

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6 p-4">
        <Link to="/packages/displaypackage">
          <a className="mb-6 flex items-center gap-2">
            <FaArrowLeft
              size={20}
              className="text-gray-600 dark:text-gray-400"
            />
            <h2 className="text-base font-semibold text-black-2 dark:text-white">
              Update Package
            </h2>
          </a>
        </Link>

        <div className="mb-6 rounded-lg border-stroke bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-boxdark">
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
            type="button"
            onClick={() => navigate({to: '/packages/displayPackageTable'})}
            className="bg-gray-500 hover:bg-gray-600 mr-4"
          >
            Cancel
          </GenericButton>
          <GenericButton
            type="submit"
            disabled={isPending}
            className="flex items-center justify-center gap-2 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 sm:w-auto"
          >
            <BiSave className="text-lg" />
            {isPending ? 'Updating...' : 'Update Package'}
          </GenericButton>
        </div>
      </form>
    </FormProvider>
  );
};

export default PackageUpdate;
