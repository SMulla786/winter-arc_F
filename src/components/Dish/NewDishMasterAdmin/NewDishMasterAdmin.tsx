/* eslint-disable */
import {useAuthContext} from '@/context/AuthContext';
import {
  useUpdateMultipleDishRawMaterials,
  usePredictRawMaterials,
} from '@/lib/react-query/queriesAndMutations/cateror/dish';
import {dishMasterSchemaCat} from '@/lib/validation/dishSchemas';
import {zodResolver} from '@hookform/resolvers/zod';
import React, {useEffect, useState} from 'react';
import {FormProvider, useForm} from 'react-hook-form';
import toast from 'react-hot-toast';

import DishFormHeader from '@/components/MultipleDishComponents/DishFormHeader';
import FormActions from '@/components/MultipleDishComponents/FormActions';
import RawMaterialsTable from '@/components/MultipleDishComponents/RawMaterialsTable';
import {
  Column,
  Dish,
  EditColumnValues,
  FormValues,
  Option,
  Row,
} from '@/components/MultipleDishComponents/types';
import {useLocation} from '@tanstack/react-router';
import {
  useGetDishByIdAdmin,
  useGetDishCategoriesAdmin,
  useGetDishesAdmin,
  useGetRawMaterialAdmin,
  useUpdateDishAdmin,
} from '@/lib/react-query/queriesAndMutations/admin/dish';
import {useGetProcesses} from '@/lib/react-query/queriesAndMutations/admin/process';
import {useGetLanguages} from '@/lib/react-query/queriesAndMutations/admin/languages';
import AdminDishFormHeader from '@/components/AdminMultipleDishComponent/MultipleDishComponents/AdminDishFormHeader';

const NewDishMasterAdmin: React.FC = () => {
  const {user} = useAuthContext();
  const caterorid = user?.caterorId;
  const {state} = useLocation();

  const methods = useForm<FormValues>({
    resolver: zodResolver(dishMasterSchemaCat),
    defaultValues: {
      name: '',
      dishCategory: '',
      vegNonveg: 'VEG',
      description: '',
      languageId: '', // Add languageId to form values
    },
  });

  const [dishId, setDishId] = useState('');
  const [allDishes, setAllDishes] = useState<Dish[]>([]); // Store all dishes
  const [filteredDishes, setFilteredDishes] = useState<Dish[]>([]); // Store filtered dishes by language
  const [categoryOptions, setCategoryOptions] = useState<Option[]>([]);
  const [filteredCategoryOptions, setFilteredCategoryOptions] = useState<
    Option[]
  >([]); // Store filtered categories by language
  const [columns, setColumns] = useState<Column[]>([
    {id: Date.now(), people: '', kg: '', isEditing: false},
  ]);
  const [rows, setRows] = useState<Row[]>([
    {id: Date.now(), rawMaterial: '', process: '', unit: '', quantities: {}},
  ]);
  const [editColumnValues, setEditColumnValues] = useState<EditColumnValues>(
    {},
  );
  const [isUpdateMode, setIsUpdateMode] = useState(false);

  const {data: dishCategories} = useGetDishCategoriesAdmin();
  const {data: rawMaterialData} = useGetRawMaterialAdmin();
  console.log('rawMaterialData', rawMaterialData);

  const {data: processesData} = useGetProcesses();
  const {data: suggestions} = useGetDishesAdmin();

  const {data: languagesData} = useGetLanguages();
  const {data: dishData, refetch: dishDataRefetch} =
    useGetDishByIdAdmin(dishId);
  // const {
  //   mutateAsync: addMultipleDishRawMaterials,
  //   isSuccess: addSuccess,
  //   isError: addError,
  //   isPending: isAddPending,
  // } = useAddMultipleDishRawMaterials();

  const {
    mutateAsync: updateMultipleDishRawMaterials,
    isSuccess: updateRMSuccess,
    isError: updateRMError,
    isPending: isUpdateRMPending,
  } = useUpdateMultipleDishRawMaterials();

  const {
    mutate: updateDish,
    isSuccess: updateDishSuccess,
    isError: updateDishError,
    isPending: isUpdateDishPending,
  } = useUpdateDishAdmin();

  const {mutateAsync: predictRawMaterials, isPending: isPredictPending} =
    usePredictRawMaterials();

  // Watch languageId from form
  const selectedLanguage = methods.watch('languageId');

  useEffect(() => {
    if (state?.dishName) {
      setDishId(state.dishName);
      setIsUpdateMode(true);
    }
  }, [state?.dishName]);

  const processOptions =
    processesData?.processes?.map((p: {id: string; name: string}) => ({
      value: p.id,
      label: p.name,
    })) || [];

  const rawmaterialOptions =
    rawMaterialData?.data?.map(
      (m: {id: string; name: string; unit: string}) => ({
        value: m.id,
        label: m.name,
        unit: m.unit,
      }),
    ) || [];

  const languagesOptions =
    languagesData?.map((l: {id: string; code: string; name: string}) => ({
      value: l.id,
      label: l.name.toLowerCase(),
    })) || [];

  // Store all dishes when suggestions load
  useEffect(() => {
    if (suggestions?.data?.data) {
      setAllDishes(suggestions.data.data);
    }
  }, [suggestions]);

  // Filter dishes by selected language
  useEffect(() => {
    if (selectedLanguage && allDishes.length > 0) {
      const filtered = allDishes.filter(
        (dish) => dish.languageId === selectedLanguage,
      );
      setFilteredDishes(filtered);
    } else {
      setFilteredDishes([]);
    }
  }, [selectedLanguage, allDishes]);

  // Store all categories when dishCategories load
  useEffect(() => {
    if (dishCategories?.data?.data) {
      const allCategories = dishCategories.data.data.map(
        (c: {id: string; name: string; languageId: string}) => ({
          value: c.id,
          label: c.name,
          languageId: c.languageId, // Make sure languageId is included
        }),
      );
      setCategoryOptions(allCategories);
    }
  }, [dishCategories]);

  // Filter categories by selected language
  useEffect(() => {
    if (selectedLanguage && categoryOptions.length > 0) {
      const filtered = categoryOptions.filter(
        (category) => category.languageId === selectedLanguage,
      );
      setFilteredCategoryOptions(filtered);
    } else {
      setFilteredCategoryOptions([]);
    }
  }, [selectedLanguage, categoryOptions]);

  // Auto-select category when dish is selected
  useEffect(() => {
    if (dishId && filteredDishes.length > 0) {
      const selectedDish = filteredDishes.find((dish) => dish.id === dishId);
      if (selectedDish) {
        methods.setValue('dishCategory', selectedDish.categoryId);
      }
    }
  }, [dishId, filteredDishes, methods]);

  useEffect(() => {
    if (dishId) dishDataRefetch();
  }, [dishId, dishDataRefetch]);

  useEffect(() => {
    if (!dishData?.data) return;
    const data = dishData.data;

    methods.reset({
      name: data.name,
      dishCategory: String(data.categoryId),
      vegNonveg: (data.vegNonveg as 'VEG' | 'NONVEG') ?? 'VEG',
      description: data.description ?? '',
      languageId: data.languageId, // Set languageId from dish data
    });

    const uniquePeople = Array.from(
      new Set(
        data.caterorDishRawMaterialQuantities?.map((q: any) => q.people) || [],
      ),
    );
    const derivedColumns =
      uniquePeople.length > 0
        ? uniquePeople.map((people, i) => {
            const record = data.caterorDishRawMaterialQuantities.find(
              (q: any) => q.people === people,
            );
            return {
              id: Date.now() + i,
              people: people.toString(),
              kg: record?.dishKg?.toString() || '',
              isEditing: false,
            };
          })
        : [{id: Date.now(), people: '', kg: '', isEditing: false}];

    setColumns(derivedColumns);
    setIsUpdateMode(true);

    const uniqueRawMaterials = Array.from(
      new Set(
        data.caterorDishRawMaterialQuantities?.map(
          (q: any) => q.rawMaterialId,
        ) || [],
      ),
    );
    const derivedRows = uniqueRawMaterials.map((rawMaterialId, i) => {
      const quantities: {[key: number]: string} = {};
      derivedColumns.forEach((col) => {
        const qtyRec =
          data.caterorDishRawMaterialQuantities?.find(
            (q: any) =>
              q.rawMaterialId === rawMaterialId &&
              parseInt(col.people) === q.people,
          ) || {};
        quantities[col.id] = qtyRec.quantity?.toString() || '';
      });
      const sample =
        data.caterorDishRawMaterialQuantities?.find(
          (q: any) => q.rawMaterialId === rawMaterialId,
        ) || {};
      return {
        id: Date.now() + i,
        rawMaterial: rawMaterialId,
        process: sample.processId || '',
        unit: sample.rawMaterial?.unit || '',
        quantities,
      };
    });

    setRows(
      derivedRows.length > 0
        ? derivedRows
        : [
            {
              id: Date.now(),
              rawMaterial: '',
              process: '',
              unit: '',
              quantities: {},
            },
          ],
    );
  }, [dishData, methods]);

  const addColumn = () => {
    const col = {id: Date.now(), people: '', kg: '', isEditing: true};
    setColumns((p) => [...p, col]);
    setEditColumnValues((p) => ({...p, [col.id]: {people: '', kg: ''}}));
  };

  const removeColumn = (id: number) => {
    setColumns((prev) => prev.filter((c) => c.id !== id));
    setRows((prev) =>
      prev.map((r) => {
        const q = {...r.quantities};
        delete q[id];
        return {...r, quantities: q};
      }),
    );
    setEditColumnValues((p) => {
      const v = {...p};
      delete v[id];
      return v;
    });
  };

  const toggleEditColumn = (id: number, people: string, kg: string) => {
    setColumns((prev) =>
      prev.map((c) =>
        c.id === id
          ? {...c, isEditing: !c.isEditing}
          : {...c, isEditing: false},
      ),
    );
    setEditColumnValues((p) => ({...p, [id]: {people, kg}}));
  };

  const updateColumn = (id: number) => {
    const {people, kg} = editColumnValues[id] || {};
    if (!people || !kg) return toast.error('Please fill both values');

    setColumns((prev) =>
      prev.map((c) => (c.id === id ? {...c, people, kg, isEditing: false} : c)),
    );

    setEditColumnValues((p) => {
      const v = {...p};
      delete v[id];
      return v;
    });

    predictRawMaterials({
      dishId,
      people: +people,
      kg: +kg,
      price: 0,
    });
  };

  const handleQtyChange = (rowId: number, colId: number, value: string) =>
    setRows((prev) =>
      prev.map((row) =>
        row.id === rowId
          ? {...row, quantities: {...row.quantities, [colId]: value}}
          : row,
      ),
    );

  const onDishSearch = (selectedId: string) => {
    setDishId(selectedId);
    setIsUpdateMode(false);
  };

  const handleSubmit = async (formData: FormValues) => {
    try {
      const prices = columns.map((c) => ({
        people: Number(c.people),
        kg: Number(c.kg),
        rawMaterials: rows.map((r) => ({
          rawMaterialId: r.rawMaterial,
          processId: r.process,
          quantity: Number(r.quantities[c.id]),
        })),
      }));

      if (dishId) {
        await updateDish({
          id: dishId,
          data: {
            name: formData.name,
            categoryId: formData.dishCategory,
            priority: 'P1',
            vegNonveg: formData.vegNonveg,
            description: formData.description || '',
            languageId: formData.languageId, // Include languageId in update
          },
        });

        await updateMultipleDishRawMaterials({
          dishId,
          dishName: formData.name,
          dishCategoryId: formData.dishCategory,
          vegNonveg: formData.vegNonveg,
          description: formData.description || '',
          prices,
        });
      } else {
        // await addMultipleDishRawMaterials({
        //   dishName: formData.name,
        //   dishCategoryId: formData.dishCategory,
        //   vegNonveg: formData.vegNonveg,
        //   description: formData.description || '',
        //   languageId: formData.languageId || '', // Include languageId in create
        //   ...(prices &&
        //     Object.values(prices).some((p) => p.people !== 0 && p.kg !== 0) && {
        //       prices,
        //     }),
        // });
      }
    } catch (err: any) {
      console.error('API Error:', err?.response?.data || err);

      const apiError = err?.response?.data;

      if (apiError?.errors && Array.isArray(apiError.errors)) {
        apiError.errors.forEach((e: {field: string; message: string}) => {
          toast.error(e.message);
        });
      } else if (apiError?.message) {
        toast.error(apiError.message);
      } else {
        // toast.error('Operation failed!');
      }
    }
  };

  useEffect(() => {
    if (updateRMSuccess || updateDishSuccess) {
      toast.success('Dish saved successfully!');

      setDishId('');
      methods.reset({
        name: '',
        dishCategory: '',
        vegNonveg: 'VEG',
        description: '',
        languageId: selectedLanguage, // Keep the language selection
      });
      setColumns([{id: Date.now(), people: '', kg: '', isEditing: false}]);
      setRows([
        {
          id: Date.now(),
          rawMaterial: '',
          process: '',
          unit: '',
          quantities: {},
        },
      ]);
      setEditColumnValues({});
      setIsUpdateMode(false);
    }
  }, [updateRMSuccess, updateDishSuccess, methods, selectedLanguage]);

  const isBusy = isUpdateRMPending || isUpdateDishPending || isPredictPending;

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(handleSubmit)}
        className="space-y-4 bg-white p-6 dark:bg-black"
      >
        <AdminDishFormHeader
          dishes={filteredDishes} // Pass filtered dishes instead of all dishes
          dishId={dishId}
          categoryOptions={filteredCategoryOptions} // Pass filtered categories
          onDishSearch={onDishSearch}
          addColumn={addColumn}
          languagesOptions={languagesOptions}
        />

        {isPredictPending && (
          <div className="text-gray-500 dark:text-gray-300 text-center">
            Predicting raw materials…
          </div>
        )}

        <RawMaterialsTable
          columns={columns}
          rows={rows}
          rawmaterialOptions={rawmaterialOptions}
          processOptions={processOptions}
          editColumnValues={editColumnValues}
          setEditColumnValues={setEditColumnValues}
          removeColumn={removeColumn}
          toggleEditColumn={toggleEditColumn}
          updateColumn={updateColumn}
          handleQtyChange={handleQtyChange}
          setRows={setRows}
        />

        <FormActions
          handleAddRow={() =>
            setRows((r) => [
              ...r,
              {
                id: Date.now(),
                rawMaterial: '',
                process: '',
                unit: '',
                quantities: {},
              },
            ])
          }
          handleDeleteRow={() =>
            rows.length > 1 &&
            setRows((r) =>
              r.filter((row) => row.id !== rows[rows.length - 1].id),
            )
          }
          rows={rows}
          isBusy={isBusy}
          isUpdateMode={!!dishId}
        />
      </form>
    </FormProvider>
  );
};

export default NewDishMasterAdmin;
