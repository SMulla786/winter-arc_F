/* eslint-disable */
import {useAuthContext} from '@/context/AuthContext';
import {
  useAddMultipleDishRawMaterials,
  useUpdateMultipleDishRawMaterials,
  useGetDishById,
  useGetDishCategories,
  useGetDishes,
  useGetRawMaterialsCateror,
  usePredictRawMaterials,
  useUpdateDish,
} from '@/lib/react-query/queriesAndMutations/cateror/dish';
import {useGetProcesses} from '@/lib/react-query/queriesAndMutations/cateror/process';
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
import {useGetFoodVendor} from '@/lib/react-query/queriesAndMutations/cateror/foodvendor';

const MultipleDishAdd: React.FC = () => {
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
      outSourceVendor: '',
      unit: '',
    },
  });
  const {register, watch, setValue} = methods;

  const [shouldReload, setShouldReload] = useState(false);
  const [dishId, setDishId] = useState('');
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<Option[]>([]);
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
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingSubmit, setPendingSubmit] = useState<FormValues | null>(null);

  const {data: dishCategories} = useGetDishCategories();
  const {data: rawMaterialData} = useGetRawMaterialsCateror();
  const {data: processesData} = useGetProcesses();
  const {data: suggestions} = useGetDishes();
  const {data: dishData, refetch: dishDataRefetch} = useGetDishById(dishId);

  const {
    mutateAsync: addMultipleDishRawMaterials,
    isSuccess: addSuccess,
    isError: addError,
    isPending: isAddPending,
  } = useAddMultipleDishRawMaterials();

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
  } = useUpdateDish();

  const {mutateAsync: predictRawMaterials, isPending: isPredictPending} =
    usePredictRawMaterials();

  useEffect(() => {
    if (state?.dishName) {
      setDishId(state.dishName);
      setIsUpdateMode(true);
    }
  }, [state?.dishName]);

  const {data: allFoodVendors} = useGetFoodVendor(user?.id!);

  const vendorOptions =
    allFoodVendors?.map((v: {id: string; name: string}) => ({
      value: v.id,
      label: v.name,
    })) || [];

  const processOptions =
    processesData?.data.processes?.map((p: {id: string; name: string}) => ({
      value: p.id,
      label: p.name,
    })) || [];

  const rawmaterialOptions =
    rawMaterialData?.data.rawMaterials?.map(
      (m: {id: string; name: string; unit: string}) => ({
        value: m.id,
        label: m.name,
        unit: m.unit,
      }),
    ) || [];

  useEffect(() => {
    if (dishCategories?.data?.categories) {
      setCategoryOptions(
        dishCategories.data.categories.map((c: {id: string; name: string}) => ({
          value: c.id,
          label: c.name,
        })),
      );
    }
  }, [dishCategories]);

  useEffect(() => {
    if (suggestions?.data?.dishes) setDishes(suggestions.data.dishes);
  }, [suggestions]);

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
      unit: data.unit,
      portionSize: data.portionSize,
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

    // Update the column with the new values
    setColumns((prev) =>
      prev.map((c) => (c.id === id ? {...c, people, kg, isEditing: false} : c)),
    );

    // Clear the edit values for this column
    setEditColumnValues((p) => {
      const v = {...p};
      delete v[id];
      return v;
    });

    // Predict raw materials based on the updated column
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
            unit: formData.unit,
            portionSize: formData.portionSize,
          },
        });

        await updateMultipleDishRawMaterials({
          dishId,
          dishName: formData.name,
          dishCategoryId: formData.dishCategory,
          vegNonveg: formData.vegNonveg,
          description: formData.description || '',
          unit: formData.unit,
          portionSize: formData.portionSize,
          prices,
        });
      } else {
        await addMultipleDishRawMaterials({
          caterorid: caterorid!,
          dishName: formData.name,
          dishCategoryId: formData.dishCategory,
          vegNonveg: formData.vegNonveg,
          unit: formData.unit,
          portionSize: formData.portionSize,
          description: formData.description || '',
          ...(prices &&
            Object.values(prices).some((p) => p.people !== 0 && p.kg !== 0) && {
              prices,
            }),
        });
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

  // Handle form submission with confirmation
  const handleFormSubmit = async (formData: FormValues) => {
    // This will be called when form is submitted normally (via button click)
    if (pendingSubmit) {
      await handleSubmit(pendingSubmit);
      setPendingSubmit(null);
    } else {
      await handleSubmit(formData);
    }
  };

  // Handle Enter key press
  const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    // Check if Enter key is pressed (not Shift+Enter for multi-line inputs)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // Prevent default form submission
      
      // Get current form values
      const formData = methods.getValues();
      
      // Check if form has any data
      const hasData = formData.name || 
                     formData.dishCategory || 
                     formData.description ||
                     columns.some(col => col.people || col.kg) ||
                     rows.some(row => row.rawMaterial);
      
      if (hasData) {
        setPendingSubmit(formData);
        setShowConfirmDialog(true);
      } else {
        // If form is empty, just submit normally
        methods.handleSubmit(handleSubmit)();
      }
    }
  };

  // Confirmation dialog component
  const ConfirmationDialog = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          Confirm Save
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Do you want to save this dish? After confirmation, the form data will be cleared.
        </p>
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => {
              setShowConfirmDialog(false);
              setPendingSubmit(null);
            }}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={async () => {
              setShowConfirmDialog(false);
              if (pendingSubmit) {
                await handleSubmit(pendingSubmit);
                setPendingSubmit(null);
              }
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Save Dish
          </button>
        </div>
      </div>
    </div>
  );

  // Only reset state here, no toast
  useEffect(() => {
    if (addSuccess || updateRMSuccess || updateDishSuccess) {
      toast.success('Dish Update successfully!'); // only one toast here

      setDishId('');
      methods.reset();
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
  }, [addSuccess, updateRMSuccess, updateDishSuccess, methods]);

  const isBusy =
    isAddPending ||
    isUpdateRMPending ||
    isUpdateDishPending ||
    isPredictPending;

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(handleFormSubmit)}
        onKeyDown={handleKeyDown}
        className="space-y-4 bg-white p-6 dark:bg-black"
      >
        <DishFormHeader
          dishes={dishes}
          dishId={dishId}
          categoryOptions={categoryOptions}
          onDishSearch={onDishSearch}
          addColumn={addColumn}
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
          setColumns={setColumns}
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
      
      {showConfirmDialog && <ConfirmationDialog />}
    </FormProvider>
  );
};

export default MultipleDishAdd;