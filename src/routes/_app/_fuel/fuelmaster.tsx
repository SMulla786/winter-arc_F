/* eslint-disable */
import {createFileRoute} from '@tanstack/react-router';
import React, {useEffect, useState} from 'react';
import GenericTable, {Column} from '@/components/Forms/Table/GenericTable';
import {
  useGetFuels,
  useUpdateFuels,
} from '../../../lib/react-query/Fuelmaster/fuelmaster';
import {useAuthContext} from '@/context/AuthContext';

interface fuelmasterprop {
  hasEditAccess?: boolean;
}
export const Route = createFileRoute('/_app/_fuel/fuelmaster')({
  component: FuelMaster,
});

// ✅ Default fuels (fallback)
const DEFAULT_FUELS = [
  {id: 1, name: 'COAL', unit: 'KG', price: 0},
  {id: 2, name: 'GAS', unit: 'KG', price: 0},
];

function FuelMaster({hasEditAccess: propHasEditAccess}: fuelmasterprop) {
  const {user} = useAuthContext();
  const restriction = user?.employeeRestriction?.fuelMaster;
  const role = user?.role;

  const hasEditAccess =
    propHasEditAccess !== undefined
      ? propHasEditAccess
      : role === 'CATEROR' || restriction === 'EDIT';
  const [fuelData, setFuelData] = useState(DEFAULT_FUELS);

  const {data: fuelResponse} = useGetFuels();
  const {mutateAsync: updateFuelData} = useUpdateFuels();

  useEffect(() => {
    // 🛑 If API empty / undefined → keep defaults
    if (!fuelResponse || fuelResponse.length === 0) {
      setFuelData(DEFAULT_FUELS);
      return;
    }

    // ✅ API has data → map it
    const tempData = fuelResponse.map(
      (
        e: {
          name: string;
          price: number;
        },
        index: number,
      ) => ({
        id: index + 1,
        name: e.name,
        unit: 'KG',
        price: e.price,
      }),
    );

    setFuelData(tempData);
  }, [fuelResponse]);

  const handlePriceChange = (id: number, price: number) => {
    setFuelData((prev) =>
      prev.map((item) => (item.id === id ? {...item, price} : item)),
    );
  };

  const handleSave = () => {
    updateFuelData(fuelData.length ? fuelData : DEFAULT_FUELS);
  };

  const columns: Column<any>[] = [
    {
      header: 'Fuel Name',
      accessor: (item) => item.name,
      sortable: false,
    },
    {
      header: 'Unit',
      accessor: (item) => item.unit,
      sortable: false,
    },
    {
      header: 'Price',
      accessor: 'price',
      sortable: false,
      render: (item) => (
        <input
          type="number"
          value={item.price}
          onChange={(e) => handlePriceChange(item.id, Number(e.target.value))}
          className="w-20 rounded border border-stroke p-1 dark:border-form-strokedark dark:bg-boxdark"
        />
      ),
    },
  ];

  return (
    <div className="p-6">
      <h2 className="mb-4 text-xl font-semibold">Fuel Master</h2>

      <GenericTable
        data={fuelData}
        columns={columns}
        searchAble={false}
        action={false}
        paginationOff
        title=""
      />

      <div className="mt-4 flex justify-end">
        {(role === 'CATEROR' || restriction === 'EDIT') && (
          <button
            onClick={handleSave}
            className="hover:bg-primary-dark rounded bg-primary px-6 py-2 text-white"
          >
            Update
          </button>
        )}
      </div>
    </div>
  );
}

export default FuelMaster;
