/* eslint-disable */
import React, {useEffect, useState} from 'react';
import {useFormContext} from 'react-hook-form';
import toast from 'react-hot-toast';

import GenericButton from '@/components/Forms/Buttons/GenericButton';

import {
  useGetRawMaterialsCaterorAdmin,
  useGetProcessesAdmin,
} from '@/lib/react-query/queriesAndMutations/admin/dishes';
import RawMaterialsTableAdmin from './RawMaterialTableAdmin';
import FormActionsAdmin from './FormsActionAdmin';

type Column = {
  id: number;
  people: string;
  kg: string;
  isEditing?: boolean;
};

type Row = {
  id: number;
  rawMaterial?: string;
  process?: string;
  unit?: string;
  name?: string;
  quantities: Record<number | string, string>;
};

const NewAddRawMaterialAdmin: React.FC<{
  dishId?: string;
  languageId?: string;
}> = ({dishId, languageId}) => {
  const {setValue} = useFormContext();

  const [columns, setColumns] = useState<Column[]>([
    {id: Date.now(), people: '', kg: '', isEditing: false},
  ]);
  const [rows, setRows] = useState<Row[]>([
    {
      id: Date.now(),
      rawMaterial: '',
      process: '',
      unit: '',
      name: '',
      quantities: {},
    },
  ]);
  const [editColumnValues, setEditColumnValues] = useState<
    Record<number, {people: string; kg: string}>
  >({});

  const {data: rawMaterialData, refetch: refetchRawMaterials} =
    useGetRawMaterialsCaterorAdmin(languageId);
  const {data: processesData, refetch: refetchProcesses} =
    useGetProcessesAdmin(languageId);

  useEffect(() => {
    if (languageId) {
      refetchRawMaterials();
      refetchProcesses();
    }
  }, [languageId, refetchRawMaterials, refetchProcesses]);

  const rawmaterialOptions =
    rawMaterialData?.data?.map((m: any) => ({
      value: m.id,
      label: m.name,
      unit: m.unit,
    })) || [];

  const processOptions =
    processesData?.data?.processes?.map((p: any) => ({
      value: p.id,
      label: p.name,
    })) || [];

  // -------------------------
  // Column handlers
  // -------------------------
  const addColumn = () => {
    const col = {id: Date.now(), people: '', kg: '', isEditing: true};
    setColumns((p) => [...p, col]);
    setEditColumnValues((p) => ({...p, [col.id]: {people: '', kg: ''}}));
  };

  const removeColumn = (id: number) => {
    setColumns((prev) => prev.filter((c) => c.id !== id));
    // remove the quantity keys for that column from each row
    setRows((prev) =>
      prev.map((r) => {
        const quantities = {...r.quantities};
        delete quantities[id];
        return {...r, quantities};
      }),
    );
    setEditColumnValues((p) => {
      const v = {...p};
      delete v[id];
      return v;
    });
  };

  const startEditColumn = (id: number) => {
    const col = columns.find((c) => c.id === id);
    setColumns((prev) => prev.map((c) => ({...c, isEditing: c.id === id})));
    setEditColumnValues((p) => ({
      ...p,
      [id]: {people: col?.people ?? '', kg: col?.kg ?? ''},
    }));
  };

  const cancelEditColumn = (id: number) => {
    setColumns((prev) =>
      prev.map((c) => (c.id === id ? {...c, isEditing: false} : c)),
    );
    setEditColumnValues((p) => {
      const v = {...p};
      delete v[id];
      return v;
    });
  };

  const updateColumn = (id: number) => {
    const vals = editColumnValues[id];
    if (!vals || !vals.people || !vals.kg) {
      return toast.error('Please fill both People and Kg');
    }
    setColumns((prev) =>
      prev.map((c) =>
        c.id === id
          ? {...c, people: vals.people, kg: vals.kg, isEditing: false}
          : c,
      ),
    );
    setEditColumnValues((p) => {
      const v = {...p};
      delete v[id];
      return v;
    });
  };

  // -------------------------
  // Row handlers
  // -------------------------
  const handleQtyChange = (rowId: number, colId: number, value: string) =>
    setRows((prev) =>
      prev.map((row) =>
        row.id === rowId
          ? {...row, quantities: {...row.quantities, [colId]: value}}
          : row,
      ),
    );

  const handleRawMaterialChange = (rowId: number, value: string) =>
    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== rowId) return r;
        const found = rawmaterialOptions.find(
          (m) => String(m.value) === String(value),
        );
        return {
          ...r,
          rawMaterial: value,
          unit: found?.unit ?? '',
          name: found?.label ?? '',
        };
      }),
    );

  const handleProcessChange = (rowId: number, value: string) =>
    setRows((prev) =>
      prev.map((r) => (r.id === rowId ? {...r, process: value} : r)),
    );

  // keep parent form in sync
  useEffect(() => {
    setValue('columns', columns);
  }, [columns, setValue]);

  useEffect(() => {
    setValue('rawMaterials', rows);
  }, [rows, setValue]);

  return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-md font-semibold">Add Raw Materials</h2>
        <div className="flex gap-2">
          <GenericButton type="button" onClick={addColumn}>
            + Column
          </GenericButton>
        </div>
      </div>

      <RawMaterialsTableAdmin
        columns={columns}
        rows={rows}
        rawmaterialOptions={rawmaterialOptions}
        processOptions={processOptions}
        editColumnValues={editColumnValues}
        setEditColumnValues={setEditColumnValues}
        removeColumn={removeColumn}
        startEditColumn={startEditColumn}
        cancelEditColumn={cancelEditColumn}
        updateColumn={updateColumn}
        handleQtyChange={handleQtyChange}
        setRows={setRows}
        handleRawMaterialChange={handleRawMaterialChange}
        handleProcessChange={handleProcessChange}
      />

      <FormActionsAdmin
        handleAddRow={() =>
          setRows((r) => [
            ...r,
            {
              id: Date.now(),
              rawMaterial: '',
              process: '',
              unit: '',
              name: '',
              quantities: {},
            },
          ])
        }
        handleDeleteRow={() =>
          rows.length > 1 && setRows((r) => r.slice(0, -1))
        }
        rows={rows}
      />
    </div>
  );
};

export default NewAddRawMaterialAdmin;
