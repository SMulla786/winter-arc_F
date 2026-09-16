/* eslint-disable */
import React, {useState, useEffect, useMemo} from 'react';
import GenericButton from '../Forms/Buttons/GenericButton';
import GenericTable from '../Forms/Table/GenericTable';
import {FaTrash} from 'react-icons/fa';
import toast from 'react-hot-toast';

import {
  useGetRawMaterialCategoriesCat,
  useGetRawMaterialsCateror,
} from '@/lib/react-query/queriesAndMutations/cateror/dish';
import {useSubmitWastage} from './storeApi';
import {useAuthContext} from '@/context/AuthContext';

interface WastageOutwardProps {
  hasEditAccess: boolean;
}
const WastageOutward: React.FC<WastageOutwardProps> = ({
  hasEditAccess: propHasEditAccess,
}) => {
  const {data: categoryData} = useGetRawMaterialCategoriesCat();
  const {data: rawMaterialData} = useGetRawMaterialsCateror();
  const {mutate: submitWastage, isSuccess} = useSubmitWastage();

  const [activeTab, setActiveTab] = useState<any>(null);
  const [wastageData, setWastageData] = useState<any[]>([]);

  const {user} = useAuthContext();
  const restriction = user?.employeeRestriction?.inwordStore;
  const role = user?.role;

  const hasEditAccess =
    propHasEditAccess !== undefined
      ? propHasEditAccess
      : role === 'CATEROR' || restriction === 'EDIT';

  // ---------- GROUP RAW MATERIALS BY CATEGORY ----------
  const groupedData = useMemo(() => {
    if (!categoryData?.data || !rawMaterialData?.data?.rawMaterials) return {};

    const grouped: any = {};
    setActiveTab(categoryData.data[0].id);
    categoryData.data.forEach((cat: any) => {
      grouped[cat.id] = {
        categoryId: cat.id,
        categoryName: cat.name,
        materials: [],
      };
    });

    rawMaterialData.data.rawMaterials.forEach((m: any) => {
      if (grouped[m.categoryId]) {
        grouped[m.categoryId].materials.push({
          id: m.id,
          name: m.name,
          unit: m.unit,
        });
      }
    });

    return grouped;
  }, [categoryData, rawMaterialData]);

  // ---------- ON INPUT CHANGE ----------
  const updateMaterialField = (
    materialId: string,
    field: string,
    value: any,
  ) => {
    setWastageData((prev) => {
      const exists = prev.find((item) => item.id === materialId);

      if (exists) {
        return prev.map((item) =>
          item.id === materialId ? {...item, [field]: value} : item,
        );
      }

      return [
        ...prev,
        {id: materialId, quantity: '', reason: '', [field]: value},
      ];
    });
  };

  // ---------- DELETE MATERIAL ----------
  const handleDelete = (id: string) => {
    setWastageData((prev) => prev.filter((item) => item.id !== id));
  };

  // ---------- SUBMIT ----------
  const handleSubmit = () => {
    const finalData = wastageData.filter(
      (item) => Number(item.quantity) > 0 && item.reason?.trim() !== '',
    );

    if (finalData.length === 0) {
      toast.error('Please add wastage quantity & reason.');
      return;
    }

    const payload = finalData.map((item) => ({
      materialId: item.id,
      quantity: Number(item.quantity),
      reason: item.reason,
    }));

    submitWastage(payload);
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success('Wastage submitted successfully!');
      setWastageData([]);
    }
  }, [isSuccess]);

  // ---------- TABLE COLUMNS ----------
  const baseColumns = [
    {header: 'Raw Material', accessor: 'name'},
    {header: 'Unit', accessor: 'unit'},
    {
      header: 'Wastage Qty',
      accessor: 'quantity',
      render: (item: any) => (
        <input
          type="number"
          min="0"
          value={item.quantity || ''}
          onChange={(e) =>
            updateMaterialField(item.id, 'quantity', e.target.value)
          }
          className="border-gray-300 w-full rounded border px-2 py-1 text-sm dark:bg-meta-4"
        />
      ),
    },
    {
      header: 'Reason',
      accessor: 'reason',
      render: (item: any) => (
        <input
          type="text"
          value={item.reason || ''}
          onChange={(e) =>
            updateMaterialField(item.id, 'reason', e.target.value)
          }
          className="border-gray-300 w-full rounded border px-2 py-1 text-sm dark:bg-meta-4"
          placeholder="Why wasted?"
        />
      ),
    },
  ];
  const actionColumn = {
    header: 'Action',
    accessor: 'action',
    render: (item: any) => (
      <button
        onClick={() => handleDelete(item.id)}
        className="text-graydark dark:text-gray"
      >
        <FaTrash />
      </button>
    ),
  };
  const tableColumns = hasEditAccess
    ? [...baseColumns, actionColumn]
    : baseColumns;

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Wastage Outward</h3>

      {/* ------- CATEGORY TABS ------- */}
      <div className="flex gap-3 overflow-x-auto border-b pb-2">
        {Object.values(groupedData).map((cat: any) => (
          <button
            key={cat.categoryId}
            className={`rounded-t px-4 py-2 ${
              activeTab === cat.categoryId
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-meta-4'
            }`}
            onClick={() => setActiveTab(cat.categoryId)}
          >
            {cat.categoryName}
          </button>
        ))}
      </div>

      {/* ------- MATERIAL TABLE PER TAB ------- */}
      {activeTab && groupedData[activeTab]?.materials?.length > 0 && (
        <GenericTable
          data={groupedData[activeTab].materials.map((m: any) => {
            const existing = wastageData.find((x) => x.id === m.id) || {};
            return {
              ...m,
              quantity: existing.quantity || '',
              reason: existing.reason || '',
            };
          })}
          columns={tableColumns}
          searchAble={false}
          itemsPerPage={50}
        />
      )}

      {/* ------- SUBMIT BUTTON ------- */}
      {hasEditAccess && (
        <div className="flex justify-end pt-4">
          <GenericButton onClick={handleSubmit}>Submit Wastage</GenericButton>
        </div>
      )}
    </div>
  );
};

export default WastageOutward;
