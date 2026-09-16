/* eslint-disable */
import React, {useState, useEffect} from 'react';
import {useAuthContext} from '@/context/AuthContext';
import {
  useGetDishes,
  useGetMultpleDishes,
  useGetRawMaterialsCateror,
  useUpdateMultipleDishRawMaterials,
} from '@/lib/react-query/queriesAndMutations/cateror/dish';
import {useGetProcesses} from '@/lib/react-query/queriesAndMutations/cateror/process';
import {FormProvider, useForm} from 'react-hook-form';
import toast from 'react-hot-toast';
import {Column, Row, Dish} from '@/components/MultipleDishComponents/types';
import SearchInputWithSuggestions from '@/components/Forms/Input/GenericInputFieldList';
import GenericButton from '@/components/Forms/Buttons/GenericButton';
import {FaTrash, FaEdit, FaSave} from 'react-icons/fa';
import SearchableDropdown from '@/components/Dish/CustomDropdown/SearchableDropdown';
import {useRouter} from '@tanstack/react-router';

interface FormValues {
  selectedDishes: string[];
}

interface DishFormHeaderProps {
  dishes: Dish[];
  selectedDishes: string[];
  onDishSelect: (ids: string[]) => void;
  addColumn: () => void;
  activeDishId: string;
  updateMode: 'single' | 'all';
  setUpdateMode: (mode: 'single' | 'all') => void;
  loadData: () => void;
}

const DishFormHeader: React.FC<DishFormHeaderProps> = ({
  dishes,
  selectedDishes,
  onDishSelect,
  addColumn,
  activeDishId,
  updateMode,
  setUpdateMode,
  loadData,
}) => {
  const {resetField} = useForm<FormValues>();

  return (
    <div className="grid grid-cols-1 gap-4">
      <div className="w-full">
        <SearchInputWithSuggestions
          name="selectedDishes"
          label="Select Dishes"
          placeholder="Search or type dish names"
          suggestions={dishes}
          onDishSearch={(id: string) => {
            if (id && !selectedDishes.includes(id)) {
              onDishSelect([...selectedDishes, id]);
              resetField('selectedDishes');
            }
          }}
          defaultValue=""
          multiple
        />
      </div>
      <div className="flex items-center justify-between">
        <div className="flex gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="updateMode"
              value="single"
              checked={updateMode === 'single'}
              onChange={() => setUpdateMode('single')}
              className="mr-2"
            />
            Change in Single Dish
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="updateMode"
              value="all"
              checked={updateMode === 'all'}
              onChange={() => setUpdateMode('all')}
              className="mr-2"
            />
            Change for All Dishes
          </label>
        </div>
        <div className="flex gap-4">
          {selectedDishes.length > 0 && (
            <GenericButton type="button" onClick={loadData}>
              Load Data
            </GenericButton>
          )}
          {activeDishId && (
            <GenericButton type="button" onClick={addColumn}>
              <span className="mr-2">+</span>Column
            </GenericButton>
          )}
        </div>
      </div>
    </div>
  );
};

interface RawMaterialsTableProps {
  columns: Column[];
  rows: Row[];
  rawmaterialOptions: any[];
  processOptions: any[];
  editColumnValues: {[k: number]: {people: string; kg: string}};
  setEditColumnValues: React.Dispatch<
    React.SetStateAction<{[k: number]: {people: string; kg: string}}>
  >;
  removeColumn: (id: number) => void;
  toggleEditColumn: (id: number, people: string, kg: string) => void;
  updateColumn: (id: number) => void;
  handleQtyChange: (rowId: number, colId: number, v: string) => void;
  setRows: React.Dispatch<React.SetStateAction<Row[]>>;
  updateMode: 'single' | 'all';
  selectedDishes: string[];
  updateAllDishes: (updates: {columns: Column[]; rows: Row[]}) => void;
  updateDishDataMap: (dishId: string, columns: Column[], rows: Row[]) => void;
}

const RawMaterialsTable: React.FC<RawMaterialsTableProps> = ({
  columns,
  rows,
  rawmaterialOptions,
  processOptions,
  editColumnValues,
  setEditColumnValues,
  removeColumn,
  toggleEditColumn,
  updateColumn,
  handleQtyChange,
  setRows,
  updateMode,
  selectedDishes,
  updateAllDishes,
  updateDishDataMap,
}) => {
  const [rowToDelete, setRowToDelete] = useState<Row | null>(null);
  const [colToDelete, setColToDelete] = useState<Column | null>(null);

  const handleRowUpdate = (updatedRows: Row[]) => {
    setRows(updatedRows);
    updateDishDataMap(activeDishId, columns, updatedRows);
    if (updateMode === 'all') {
      updateAllDishes({columns, rows: updatedRows});
    }
  };

  return (
    <div className="overflow-hidden rounded border border-stroke dark:border-strokedark">
      <div className="overflow-x-auto">
        <table className="min-w-max text-left text-sm">
          <thead className="border-b border-stroke bg-gray-2 dark:border-strokedark dark:bg-meta-4">
            <tr>
              <th className="w-16 p-2"></th>
              <th className="w-60 p-2">Raw Material</th>
              <th className="w-60 p-2">Process</th>
              {columns.map((col) => (
                <th key={col.id} className="w-32 p-2 text-center">
                  <div className="flex flex-col items-center space-y-3">
                    {col.isEditing ? (
                      <>
                        <input
                          type="text"
                          placeholder="People"
                          className="w-full rounded-md border border-stroke bg-transparent px-3 py-3 text-sm text-black outline-none dark:border-form-strokedark dark:bg-form-input dark:text-white"
                          value={editColumnValues[col.id]?.people || col.people}
                          onChange={(e) =>
                            setEditColumnValues((p) => ({
                              ...p,
                              [col.id]: {...p[col.id], people: e.target.value},
                            }))
                          }
                        />
                        <input
                          type="text"
                          placeholder="Kg"
                          className="w-full rounded-md border border-stroke bg-transparent px-3 py-3 text-sm text-black outline-none dark:border-form-strokedark dark:bg-form-input dark:text-white"
                          value={editColumnValues[col.id]?.kg || col.kg}
                          onChange={(e) =>
                            setEditColumnValues((p) => ({
                              ...p,
                              [col.id]: {...p[col.id], kg: e.target.value},
                            }))
                          }
                        />
                        <button
                          type="button"
                          onClick={() => updateColumn(col.id)}
                          className="text-xs text-graydark dark:text-gray-2"
                        >
                          <FaSave className="h-3 w-3" />
                        </button>
                      </>
                    ) : (
                      <>
                        <span>{col.people || 'People'}</span>
                        <span>{col.kg || 'Kg'}</span>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setColToDelete(col)}
                            className="text-xs text-graydark dark:text-gray-2"
                          >
                            <FaTrash className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              toggleEditColumn(col.id, col.people, col.kg)
                            }
                            className="text-xs text-graydark dark:text-gray-2"
                          >
                            <FaEdit className="h-3 w-3" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows
              .slice()
              .sort((a, b) => {
                const aName =
                  rawmaterialOptions.find((o) => o.value === a.rawMaterial)
                    ?.label || '';
                const bName =
                  rawmaterialOptions.find((o) => o.value === b.rawMaterial)
                    ?.label || '';
                return aName.localeCompare(bName);
              })
              .map((row) => (
                <tr key={row.id}>
                  <td className="w-16 p-2">
                    <button
                      type="button"
                      onClick={() => setRowToDelete(row)}
                      className="text-xs text-graydark dark:text-gray-2"
                    >
                      <FaTrash className="h-3 w-3" />
                    </button>
                  </td>
                  <td className="w-60 p-2">
                    <SearchableDropdown
                      options={rawmaterialOptions}
                      value={row.rawMaterial}
                      onChange={(val) => {
                        const opt = rawmaterialOptions.find(
                          (o) => o.value === val,
                        );
                        handleRowUpdate(
                          rows.map((r) =>
                            r.id === row.id
                              ? {...r, rawMaterial: val, unit: opt?.unit || ''}
                              : r,
                          ),
                        );
                      }}
                      placeholder="Select Material"
                    />
                  </td>
                  <td className="w-60 p-2">
                    <SearchableDropdown
                      options={processOptions}
                      value={row.process}
                      onChange={(val) =>
                        handleRowUpdate(
                          rows.map((r) =>
                            r.id === row.id ? {...r, process: val} : r,
                          ),
                        )
                      }
                    />
                  </td>
                  {columns.map((col) => (
                    <td key={col.id} className="w-40 p-2 text-center">
                      <div className="relative">
                        <input
                          type="number"
                          className="w-full rounded-md border border-stroke bg-transparent px-3 py-3 pr-10 text-sm text-black outline-none dark:border-form-strokedark dark:bg-form-input dark:text-white"
                          value={parseFloat(
                            parseFloat(row.quantities[col.id] || '0').toFixed(
                              2,
                            ),
                          )}
                          placeholder="Qty"
                          onChange={(e) =>
                            handleQtyChange(row.id, col.id, e.target.value)
                          }
                        />
                        {row.unit && (
                          <span className="text-gray-500 dark:text-gray-300 absolute right-2 top-1/2 -translate-y-1/2 text-xs">
                            {row.unit}
                          </span>
                        )}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      {rowToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="border-gray-200 rounded border bg-white p-6 text-center shadow-md dark:border-strokedark dark:bg-boxdark">
            <p className="text-gray-900 dark:text-gray-100 mb-4 font-semibold">
              Are you sure you want to delete this row?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => {
                  handleRowUpdate(rows.filter((r) => r.id !== rowToDelete.id));
                  setRowToDelete(null);
                }}
                className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700 dark:hover:bg-red-500"
              >
                Yes
              </button>
              <button
                onClick={() => setRowToDelete(null)}
                className="bg-gray-300 text-gray-800 hover:bg-gray-400 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600 rounded px-4 py-2"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
      {colToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="border-gray-200 rounded border bg-white p-6 text-center shadow-md dark:border-strokedark dark:bg-boxdark">
            <p className="text-gray-900 dark:text-gray-100 mb-4 font-semibold">
              Are you sure you want to delete this column?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => {
                  removeColumn(colToDelete.id);
                  setColToDelete(null);
                }}
                className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700 dark:hover:bg-red-500"
              >
                Yes
              </button>
              <button
                onClick={() => setColToDelete(null)}
                className="bg-gray-300 text-gray-800 hover:bg-gray-400 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600 rounded px-4 py-2"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface FormActionsProps {
  handleAddRow: () => void;
  handleDeleteRow: () => void;
  rows: Row[];
  isBusy: boolean;
}

const FormActions: React.FC<FormActionsProps> = ({
  handleAddRow,
  handleDeleteRow,
  rows,
  isBusy,
}) => {
  const router = useRouter();

  const handleCancel = () => {
    router.navigate({to: '/Alldishes'});
  };

  return (
    <div className="mt-4 flex items-center justify-between gap-4">
      <div className="flex gap-4">
        <GenericButton type="button" onClick={handleCancel}>
          Cancel
        </GenericButton>
        <GenericButton type="button" onClick={handleAddRow}>
          Add Row
        </GenericButton>
      </div>
      <GenericButton type="submit" disabled={isBusy}>
        {isBusy ? 'Updating…' : 'Update'}
      </GenericButton>
    </div>
  );
};

const MultipleDishUpdate: React.FC = () => {
  const {user} = useAuthContext();
  const caterorid = user?.caterorId;
  const [selectedDishes, setSelectedDishes] = useState<string[]>([]);
  const [activeDishId, setActiveDishId] = useState<string>('');
  const [updateMode, setUpdateMode] = useState<'single' | 'all'>('single');
  const [dishDataMap, setDishDataMap] = useState<{
    [dishId: string]: {columns: Column[]; rows: Row[]};
  }>({});
  const [columns, setColumns] = useState<Column[]>([
    {id: Date.now(), people: '', kg: '', isEditing: false},
  ]);
  const [rows, setRows] = useState<Row[]>([
    {id: Date.now(), rawMaterial: '', process: '', unit: '', quantities: {}},
  ]);
  const [editColumnValues, setEditColumnValues] = useState<{
    [k: number]: {people: string; kg: string};
  }>({});

  const {data: dishesData} = useGetDishes();
  const {data: rawMaterialData} = useGetRawMaterialsCateror();
  const {data: processesData} = useGetProcesses();
  const {mutateAsync: getMultipleDishes} = useGetMultpleDishes();
  const {
    mutateAsync: updateMultipleDishRawMaterials,
    isPending: isUpdateRMPending,
    isSuccess: updateRMSuccess,
  } = useUpdateMultipleDishRawMaterials();

  const methods = useForm<FormValues>({
    defaultValues: {
      selectedDishes: [],
    },
  });

  const dishes = dishesData?.data.dishes || [];
  const rawmaterialOptions =
    rawMaterialData?.data.rawMaterials?.map(
      (m: {id: string; name: string; unit: string}) => ({
        value: m.id,
        label: m.name,
        unit: m.unit,
      }),
    ) || [];
  const processOptions =
    processesData?.data.processes?.map((p: {id: string; name: string}) => ({
      value: p.id,
      label: p.name,
    })) || [];

  const updateDishDataMap = (
    dishId: string,
    columns: Column[],
    rows: Row[],
  ) => {
    setDishDataMap((prev) => ({
      ...prev,
      [dishId]: {columns, rows},
    }));
  };

  const loadData = async () => {
    if (!caterorid || selectedDishes.length === 0) {
      toast.error('Please select at least one dish');
      return;
    }

    try {
      const response = await getMultipleDishes(selectedDishes);
      const fetchedDishes = response || [];

      const updatedMap = {...dishDataMap};
      fetchedDishes.forEach((data: any) => {
        const dishId = data.id;

        const uniquePeople = Array.from(
          new Set(
            data.caterorDishRawMaterialQuantities?.map((q: any) => q.people) ||
              [],
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
            quantities[col.id] = qtyRec.quantity?.toString() || '0';
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

        const updatedRows =
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
              ];

        updatedMap[dishId] = {columns: derivedColumns, rows: updatedRows};
      });

      setDishDataMap(updatedMap);
      if (selectedDishes.length > 0) {
        const firstDishId = selectedDishes[0];
        setActiveDishId(firstDishId);
        setColumns(updatedMap[firstDishId]?.columns || columns);
        setRows(updatedMap[firstDishId]?.rows || rows);
      }
    } catch (err) {
      toast.error('Failed to load dish data');
      console.error('Load Data Error:', err);
    }
  };

  const updateAllDishes = (updates: {columns: Column[]; rows: Row[]}) => {
    const updatedMap = {...dishDataMap};
    selectedDishes.forEach((dishId) => {
      updatedMap[dishId] = {columns: updates.columns, rows: updates.rows};
    });
    setDishDataMap(updatedMap);
  };

  const addColumn = () => {
    const col = {id: Date.now(), people: '', kg: '', isEditing: true};
    const updatedColumns = [...columns, col];
    setColumns(updatedColumns);
    updateDishDataMap(activeDishId, updatedColumns, rows);
    setEditColumnValues((p) => ({...p, [col.id]: {people: '', kg: ''}}));
    if (updateMode === 'all') {
      updateAllDishes({columns: updatedColumns, rows});
    }
  };

  const removeColumn = (id: number) => {
    const updatedColumns = columns.filter((c) => c.id !== id);
    const updatedRows = rows.map((r) => {
      const q = {...r.quantities};
      delete q[id];
      return {...r, quantities: q};
    });
    setColumns(updatedColumns);
    setRows(updatedRows);
    updateDishDataMap(activeDishId, updatedColumns, updatedRows);
    if (updateMode === 'all') {
      updateAllDishes({columns: updatedColumns, rows: updatedRows});
    }
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

    const updatedColumns = columns.map((c) =>
      c.id === id ? {...c, people, kg, isEditing: false} : c,
    );
    setColumns(updatedColumns);
    updateDishDataMap(activeDishId, updatedColumns, rows);
    setEditColumnValues((p) => {
      const v = {...p};
      delete v[id];
      return v;
    });

    if (updateMode === 'all') {
      updateAllDishes({columns: updatedColumns, rows});
    }
  };

  const handleQtyChange = (rowId: number, colId: number, value: string) => {
    const updatedRows = rows.map((row) =>
      row.id === rowId
        ? {...row, quantities: {...row.quantities, [colId]: value}}
        : row,
    );
    setRows(updatedRows);
    updateDishDataMap(activeDishId, columns, updatedRows);
    if (updateMode === 'all') {
      updateAllDishes({columns, rows: updatedRows});
    }
  };

  const handleSubmit = async (data: FormValues) => {
    if (selectedDishes.length === 0) {
      toast.error('Please select at least one dish');
      return;
    }

    try {
      for (const dishId of selectedDishes) {
        const dishData = dishDataMap[dishId] || {columns, rows};
        const prices = dishData.columns.map((c) => ({
          people: Number(c.people),
          kg: Number(c.kg),
          rawMaterials: dishData.rows
            .filter((r) => r.rawMaterial && r.process)
            .map((r) => ({
              rawMaterialId: r.rawMaterial,
              processId: r.process,
              quantity: Number(r.quantities[c.id]) || 0,
            })),
        }));

        await updateMultipleDishRawMaterials({
          dishId,
          dishName: dishes.find((d) => d.id === dishId)?.name || '',
          dishCategoryId: dishes.find((d) => d.id === dishId)?.categoryId || '',
          vegNonveg: dishes.find((d) => d.id === dishId)?.vegNonveg || 'VEG',
          description: dishes.find((d) => d.id === dishId)?.description || '',
          prices,
        });
      }
      toast.success('Dishes updated successfully!');
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
        toast.error('Operation failed!');
      }
    }
  };

  useEffect(() => {
    if (updateRMSuccess) {
      toast.success('Dishes updated successfully!');
      setSelectedDishes([]);
      setActiveDishId('');
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
      setDishDataMap({});
      methods.reset();
    }
  }, [updateRMSuccess, methods]);

  useEffect(() => {
    if (selectedDishes.length > 0 && activeDishId) {
      const dishData = dishDataMap[activeDishId] || {columns, rows};
      setColumns(dishData.columns);
      setRows(dishData.rows);
    }
  }, [activeDishId, dishDataMap]);

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(handleSubmit)}
        className="space-y-4 bg-white p-6 dark:bg-black"
      >
        <DishFormHeader
          dishes={dishes}
          selectedDishes={selectedDishes}
          onDishSelect={setSelectedDishes}
          addColumn={addColumn}
          activeDishId={activeDishId}
          updateMode={updateMode}
          setUpdateMode={setUpdateMode}
          loadData={loadData}
        />
        {selectedDishes.length > 0 && (
          <div className="flex space-x-2 border-b border-stroke dark:border-strokedark">
            {selectedDishes.map((dishId) => (
              <button
                key={dishId}
                type="button"
                className={`px-4 py-2 text-sm font-medium ${
                  activeDishId === dishId
                    ? 'border-b-2 border-primary text-primary'
                    : 'text-gray-500 dark:text-gray-300'
                }`}
                onClick={() => {
                  setActiveDishId(dishId);
                }}
              >
                {dishes.find((d) => d.id === dishId)?.name || 'Unknown Dish'}
                <button
                  type="button"
                  className="ml-2 text-xs text-red-600"
                  onClick={() => {
                    setSelectedDishes((prev) =>
                      prev.filter((id) => id !== dishId),
                    );
                    setDishDataMap((prev) => {
                      const newMap = {...prev};
                      delete newMap[dishId];
                      return newMap;
                    });
                    if (activeDishId === dishId) {
                      const nextDishId = selectedDishes.find(
                        (id) => id !== dishId,
                      );
                      setActiveDishId(nextDishId || '');
                    }
                  }}
                >
                  <FaTrash className="h-3 w-3" />
                </button>
              </button>
            ))}
          </div>
        )}
        {activeDishId && (
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
            updateMode={updateMode}
            selectedDishes={selectedDishes}
            updateAllDishes={updateAllDishes}
            updateDishDataMap={updateDishDataMap}
          />
        )}
        {activeDishId && (
          <FormActions
            handleAddRow={() => {
              const newRow = {
                id: Date.now(),
                rawMaterial: '',
                process: '',
                unit: '',
                quantities: {},
              };
              const updatedRows = [...rows, newRow];
              setRows(updatedRows);
              updateDishDataMap(activeDishId, columns, updatedRows);
              if (updateMode === 'all') {
                updateAllDishes({columns, rows: updatedRows});
              }
            }}
            handleDeleteRow={() =>
              rows.length > 1 &&
              setRows((r) => {
                const updatedRows = r.filter(
                  (row) => row.id !== rows[rows.length - 1].id,
                );
                updateDishDataMap(activeDishId, columns, updatedRows);
                if (updateMode === 'all') {
                  updateAllDishes({columns, rows: updatedRows});
                }
                return updatedRows;
              })
            }
            rows={rows}
            isBusy={isUpdateRMPending}
          />
        )}
      </form>
    </FormProvider>
  );
};

export default MultipleDishUpdate;
