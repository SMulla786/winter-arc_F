/* eslint-disable */
import React, {useEffect, useState} from 'react';
import Select from 'react-select';
import {FormProvider, useForm} from 'react-hook-form';
import {useGetAllPackage} from '@/lib/react-query/package/displaypackage';
import toast from 'react-hot-toast';
import {BiPlus, BiTrash} from 'react-icons/bi';
import GenericButton from '../Forms/Buttons/GenericButton';
import GenericInputField from '../Forms/Input/GenericInputField';

type OptionType = {label: string; value: string};

interface DishRow {
  id: number;
  category?: string; // Optional for extra dishes
  dishes: OptionType[];
  count?: number;
  Rate?: number;
}

interface PackageFormData {
  price: number;
  peopleFrom: number;
  peopleTo: number;
}

interface SelectPackageEventProps {
  onPackageSelect?: (
    packageId: string | null,
    mainDishes: DishRow[],
    extraDishes: {dishId: string; cost: number}[],
  ) => void;
}

const SelectPackageEvent: React.FC<SelectPackageEventProps> = ({
  onPackageSelect,
}) => {
  const methods = useForm<PackageFormData>({
    defaultValues: {
      price: 0,
      peopleFrom: 0,
      peopleTo: 0,
    },
  });

  const {data: response, isLoading, isError, error} = useGetAllPackage();

  const {register, setValue} = methods;

  const [mockCategories, setMockCategories] = useState<
    {id: string; name: string}[]
  >([]);
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(
    null,
  );
  const [dishRows, setDishRows] = useState<DishRow[]>([]);
  const [extraDishRows, setExtraDishRows] = useState<DishRow[]>([]);

  // Notify parent component of changes
  useEffect(() => {
    const formattedExtraDishes = extraDishRows
      .filter((row) => row.dishes.length > 0)
      .map((row) => ({
        dishId: row.dishes[0].value,
        cost: row.Rate || 0,
      }));

    onPackageSelect?.(selectedPackageId, dishRows, formattedExtraDishes);
  }, [selectedPackageId, dishRows, extraDishRows, onPackageSelect]);

  // Process package data
  useEffect(() => {
    if (response && Array.isArray(response) && response.length > 0) {
      const categories: {id: string; name: string}[] = Array.from(
        new Set(
          response.flatMap((pkg: any) =>
            pkg.packageDishes.map((pd: any) => ({
              id: pd.categoryId,
              name: pd.categoryName,
            })),
          ),
        ),
      );
      setMockCategories(categories);
    } else {
      console.warn('No valid response data for categories'); // Debugging log
    }
  }, [response]);

  // Update form when package is selected
  useEffect(() => {
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
        setDishRows(mainDishes);
        setExtraDishRows(extraDishes);
        setValue('price', selectedPackage.price || 0);
        setValue('peopleFrom', selectedPackage.peopleFrom || 0);
        setValue('peopleTo', selectedPackage.peopleTo || 0);
      }
    } else {
      setDishRows([]);
      setExtraDishRows([]);
      setValue('price', 0);
      setValue('peopleFrom', 0);
      setValue('peopleTo', 0);
    }
  }, [selectedPackageId, response, setValue]);

  const handleDishChange = <K extends keyof DishRow>(
    index: number,
    field: K,
    value: DishRow[K],
    isExtra = false,
  ) => {
    const rows = isExtra ? [...extraDishRows] : [...dishRows];
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
      // Update Rate based on selected dish
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
    isExtra ? setExtraDishRows(rows) : setDishRows(rows);
  };

  const addExtraDishRow = () => {
    setExtraDishRows((prevRows) => [
      ...prevRows,
      {
        id: Date.now() + Math.random(),
        dishes: [],
        Rate: 0,
      },
    ]);
  };

  const deleteExtraDishRow = (index: number) => {
    setExtraDishRows((prevRows) => prevRows.filter((_, i) => i !== index));
  };

  const getCategoryOptions = (): OptionType[] =>
    mockCategories.map((cat) => ({
      label: cat.name,
      value: cat.id,
    }));

  const getDishOptions = (
    categoryId: string,
    isExtra: boolean,
  ): OptionType[] => {
    if (!selectedPackageId || !response) return [];
    const selectedPackage = response.find(
      (pkg: any) => pkg.id === selectedPackageId,
    );
    if (!selectedPackage) return [];

    if (isExtra) {
      // Filter out already selected extra dishes
      const selectedDishIds = extraDishRows
        .filter(
          (row, index) =>
            row.dishes.length > 0 && index !== extraDishRows.length,
        ) // Exclude current row
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

  const getPackageOptions = (): OptionType[] =>
    response?.map((pkg: any) => ({
      label: pkg.name,
      value: pkg.id,
    })) || [];

  const renderDishTable = (
    rows: DishRow[],
    isExtra: boolean,
    sectionTitle: string,
  ) => (
    <div className="rounded-md bg-white p-4 shadow-sm dark:bg-meta-4 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-gray-700 text-lg font-semibold dark:text-white">
          {sectionTitle}
        </h2>
        {isExtra && (
          <GenericButton
            onClick={addExtraDishRow}
            className="flex items-center gap-2 rounded bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700 dark:bg-green-800 dark:text-white dark:hover:bg-green-900"
          >
            <BiPlus className="text-lg" />
            Add Extra Dish
          </GenericButton>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full table-auto text-center text-sm">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
              {!isExtra && (
                <th className="px-4 py-3 font-medium">Dish Category</th>
              )}
              <th className="px-4 py-3 font-medium">Dishes</th>
              {!isExtra && <th className="px-4 py-3 font-medium">Limit</th>}
              {isExtra && <th className="px-4 py-3 font-medium">Rate</th>}
              {isExtra && <th className="px-4 py-3 font-medium">Action</th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr
                key={row.id}
                className="border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 border-b"
              >
                {!isExtra && (
                  <td className="px-4 py-3">
                    <Select<OptionType, false>
                      options={getCategoryOptions()}
                      value={
                        row.category
                          ? {
                              label:
                                mockCategories.find(
                                  (c) => c.id === row.category,
                                )?.name || '',
                              value: row.category,
                            }
                          : null
                      }
                      onChange={(option) => {
                        handleDishChange(
                          index,
                          'category',
                          option?.value || '',
                          isExtra,
                        );
                        handleDishChange(index, 'dishes', [], isExtra);
                      }}
                      className="w-full bg-white"
                      placeholder="Select Category"
                      classNames={{
                        control: (state) =>
                          `border ${state.isFocused ? 'border-blue-500' : 'border-gray-300'} shadow-sm`,
                        menu: () => 'bg-white border border-gray-300 shadow-md',
                        option: (state) =>
                          `px-3 py-2 cursor-pointer 
                          ${state.isFocused ? 'bg-gray-100' : ''}
                          ${state.isSelected ? 'bg-blue-100' : ''}`,
                      }}
                      isDisabled
                    />
                  </td>
                )}
                <td className="px-4 py-3">
                  {isExtra ? (
                    <Select<OptionType, false>
                      options={getDishOptions('', isExtra)}
                      value={row.dishes.length > 0 ? row.dishes[0] : null}
                      onChange={(selected) =>
                        handleDishChange(
                          index,
                          'dishes',
                          selected ? [selected] : [],
                          isExtra,
                        )
                      }
                      className="w-full"
                      placeholder="Select Dish"
                      classNames={{
                        control: (state) =>
                          `border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800
                          ${state.isFocused ? 'border-blue-500 shadow-sm' : ''}`,
                        menu: () =>
                          `bg-white border border-gray-300 shadow-md dark:bg-slate-800 dark:border-slate-700 dark:text-gray-200`,
                        option: (state) =>
                          `px-3 py-2 cursor-pointer 
                          ${state.isFocused ? 'bg-gray-100 dark:bg-slate-700' : ''}
                          ${state.isSelected ? 'bg-blue-100 dark:bg-blue-900' : ''}`,
                      }}
                    />
                  ) : (
                    <Select<OptionType, true>
                      isMulti
                      options={getDishOptions(row.category || '', isExtra)}
                      value={row.dishes}
                      onChange={(selected) =>
                        handleDishChange(
                          index,
                          'dishes',
                          [...(selected || [])],
                          isExtra,
                        )
                      }
                      isDisabled={!row.category}
                      className="w-full"
                      placeholder={
                        row.category ? 'Select Dishes' : 'Select Category First'
                      }
                      classNames={{
                        control: (state) =>
                          `border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800
                          ${state.isFocused ? 'border-blue-500 shadow-sm' : ''}`,
                        menu: () =>
                          `bg-white border border-gray-300 shadow-md dark:bg-slate-800 dark:border-gray-600 dark:text-gray-200`,
                        option: (state) =>
                          `px-3 py-2 cursor-pointer 
                          ${state.isFocused ? 'bg-gray-100 dark:bg-slate-700' : ''}
                          ${state.isSelected ? 'bg-blue-100 dark:bg-blue-900' : ''}`,
                      }}
                    />
                  )}
                </td>
                {!isExtra && (
                  <td className="px-4 py-3 text-center">
                    <span className="text-gray-700 dark:text-gray-200 text-sm font-medium">
                      Limit: {row.count || 1}
                    </span>
                  </td>
                )}
                {isExtra && (
                  <td className="px-4 py-3">
                    <input
                      disabled
                      type="number"
                      value={row.Rate || 0}
                      onChange={(e) =>
                        handleDishChange(
                          index,
                          'Rate',
                          parseInt(e.target.value) || 0,
                          isExtra,
                        )
                      }
                      min={0}
                      className="border-gray-300 dark:border-gray-600 dark:bg-gray-800 w-20 rounded border p-2 focus:border-blue-500 dark:text-white"
                    />
                  </td>
                )}
                {isExtra && (
                  <td className="px-4 py-3">
                    <GenericButton
                      onClick={() => deleteExtraDishRow(index)}
                      className="flex items-center gap-2 rounded bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700 dark:bg-red-800 dark:text-white dark:hover:bg-red-900"
                    >
                      <BiTrash className="text-lg" />
                      Delete
                    </GenericButton>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  if (isLoading)
    return (
      <div className="text-gray-700 dark:text-gray-200 p-6 text-center">
        Loading...
      </div>
    );
  if (isError)
    return (
      <div className="p-6 text-center text-red-600">
        Error: {error?.message || 'An error occurred'}
      </div>
    );

  return (
    <FormProvider {...methods}>
      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen p-4 sm:p-6">
        <div className="mx-auto max-w-6xl space-y-6">
          <h2 className="text-gray-700 text-2xl font-semibold dark:text-white">
            Select Package
          </h2>

          <div className="grid grid-cols-1 gap-4 rounded-md bg-white p-4 shadow-sm dark:bg-meta-4 sm:grid-cols-12 sm:p-6">
            <div className="col-span-12 sm:col-span-4">
              <label className="text-gray-700 dark:text-gray-200 mb-1 block text-sm font-medium">
                Select Package
              </label>
              <Select<OptionType, false>
                options={getPackageOptions()}
                value={
                  selectedPackageId
                    ? {
                        label:
                          response?.find(
                            (pkg: any) => pkg.id === selectedPackageId,
                          )?.name || '',
                        value: selectedPackageId,
                      }
                    : null
                }
                onChange={(option) =>
                  setSelectedPackageId(option?.value || null)
                }
                className="w-full"
                isClearable
                placeholder="Select Package"
                classNames={{
                  control: (state) =>
                    `border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white 
                    ${state.isFocused ? 'border-blue-500 dark:border-blue-600 shadow-sm' : ''}`,
                  menu: () =>
                    `bg-white border border-gray-300 shadow-md dark:bg-gray-800 dark:border-gray-600 dark:text-white`,
                  option: (state) =>
                    `px-3 py-2 cursor-pointer 
                    ${state.isFocused ? 'bg-gray-100 dark:bg-gray-700' : ''}
                    ${state.isSelected ? 'bg-blue-100 dark:bg-blue-900' : ''}`,
                }}
              />
            </div>

            <div className="col-span-12 sm:col-span-4">
              <label className="text-gray-700 dark:text-gray-200 mb-1 block text-sm font-medium">
                Package Price
              </label>
              <input
                {...register('price')}
                placeholder="Enter Price"
                className="border-gray-300 dark:border-gray-600 w-full rounded border p-2 focus:border-blue-500 dark:bg-meta-4 dark:text-white"
                type="number"
                disabled
              />
            </div>
          </div>

          {renderDishTable(dishRows, false, 'Main Dish Selection')}
          {renderDishTable(extraDishRows, true, 'Extra Dish Selection')}
        </div>
      </div>
    </FormProvider>
  );
};

export default SelectPackageEvent;
