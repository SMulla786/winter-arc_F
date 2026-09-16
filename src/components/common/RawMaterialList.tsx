// import React from 'react'

// const RawMaterialList = () => {
//   return (
//     <div>
//       hii
//     </div>
//   )
// }

// export default RawMaterialList

/* eslint-disable  */
import GenericTable, {Column} from '@/components/Forms/Table/GenericTable';
import {
  useDeleteRawMaterial,
  useGetRawMaterialCategoriesCat,
  useGetRawMaterialsCateror,
} from '@/lib/react-query/queriesAndMutations/cateror/dish';
import {useNavigate} from '@tanstack/react-router';
import {Loader} from '../Loader/Loader';
import {confirmAlert} from 'react-confirm-alert';
import {useEffect, useState} from 'react';
import {FiEdit} from 'react-icons/fi';
import {MdDelete} from 'react-icons/md';
// import toast from 'react-hot-toast';

type RawMaterial = {
  id: string;
  name: string;
  categoryId: string;
  category: string;
  unit: string;
  amount: number;
  inventory: number;
};

const columns: Column<RawMaterial>[] = [
  {header: 'Raw Material Name', accessor: 'name', sortable: true},
  {header: 'Raw Material Category', accessor: 'category', sortable: true},
  {header: 'Unit', accessor: 'unit', sortable: false},
  {header: 'Amount', accessor: 'amount', sortable: false},
  {header: 'Inventory', accessor: 'inventory', sortable: false},
];

const RawMaterialList: React.FC = () => {
  const navigate = useNavigate();
  const {data: rawMaterial, isPending} = useGetRawMaterialsCateror();

  console.log('====================================');
  console.log('rawMaaaaaccccterial', rawMaterial);
  console.log('====================================');

  const grouped = Array.isArray(rawMaterial?.data?.rawMaterials)
    ? Object.values(
        rawMaterial?.data?.rawMaterials?.reduce((acc: any, item: any) => {
          const categoryId = item.category?.id || 'uncategorized';
          const categoryName = item.category?.name || 'Uncategorized';

          if (!acc[categoryId]) {
            acc[categoryId] = {
              categoryId,
              categoryName,
              items: [],
            };
          }

          acc[categoryId].items.push(item);
          return acc;
        }, {}),
      )
    : [];

  const [openCategoryId, setOpenCategoryId] = useState<string | null>(null);

  useEffect(() => {
    if (grouped.length > 0 && !openCategoryId) {
      setOpenCategoryId(grouped[0].categoryId);
    }
  }, [grouped, openCategoryId]);

  const {data: rawMaterialCategory} = useGetRawMaterialCategoriesCat();
  console.log('rawMaterial_category', rawMaterialCategory);
  const rawMaterials =
    (Array.isArray(rawMaterial?.data.rawMaterials) &&
      rawMaterial?.data.rawMaterials.map(
        (item: {
          amount: any;
          category: any;
          id: string;
          name: string;
          categoryId: string;
          unit: string;
          inventory: number;
        }) => ({
          id: item.id,
          name: item.name,
          category: item.category.name, // Map category.name
          unit: item.unit,
          amount: item.amount,
          inventory: item.inventory,
        }),
      )) ||
    [];

  console.log('raw materiallasss', rawMaterials);
  const {mutateAsync: deleteRawMaterial} = useDeleteRawMaterial();

  const handleEdit = (items: RawMaterial) => {
    navigate({
      to: `/update/rawMaterialCateror/${items.id}`,
    });
  };

  const handleDelete = async (items: RawMaterial) => {
    confirmAlert({
      customUI: ({onClose}) => (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-meta-4 bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 text-black shadow-md dark:bg-meta-4 dark:text-white">
            <h2 className="mb-4 text-xl font-semibold">Confirm to delete</h2>
            <p className="mb-6">
              Are you sure you want to delete raw material{' '}
              <strong>{items.name}</strong>?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  deleteRawMaterial(items.id, {
                    onSuccess: () => {
                      onClose();
                    },
                    onError: (err) => {
                      console.error(err);
                      onClose();
                    },
                  });
                }}
                className="rounded bg-red-600 px-4 py-2 text-white transition hover:bg-red-700"
              >
                Yes
              </button>
              <button
                onClick={onClose}
                className="bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 rounded px-4 py-2 text-black transition dark:text-white"
              >
                No
              </button>
            </div>
          </div>
        </div>
      ),
    });
  };

  if (isPending) {
    return <Loader />;
  }
  return (
    <>
      <div className="bg-white p-5 py-8 dark:bg-black">
        {' '}
        <h1 className="mb-6 text-lg font-semibold">Raw Material List</h1>
        <div className="mb-6 overflow-x-auto">
          <div className="flex min-w-max flex-nowrap gap-3">
            {grouped?.map((group: any) => {
              const isSelected = openCategoryId === group.categoryId;

              return (
                <button
                  key={group.categoryId}
                  type="button"
                  onClick={() =>
                    setOpenCategoryId((prev) =>
                      prev === group.categoryId ? null : group.categoryId,
                    )
                  }
                  className={`whitespace-nowrap rounded border-b-2 px-4 py-2 text-sm transition-all duration-200 ${
                    isSelected
                      ? 'border-blue-600 bg-sky-100 text-blue-600 dark:border-blue-400 dark:bg-blue-900 dark:text-blue-400'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300 border-transparent hover:border-blue-300 hover:text-blue-500 dark:bg-meta-4 dark:text-white dark:hover:text-blue-300'
                  }`}
                >
                  {group.categoryName}
                </button>
              );
            })}
          </div>
        </div>
        {openCategoryId && (
          <div className="overflow-x-auto px-2">
            <div className="grid w-full grid-cols-4 gap-4 bg-neutral-100 p-3 py-2 text-sm font-semibold dark:bg-meta-4">
              <span>Name</span>
              <span>Unit</span>
              <span>Amount</span>
              <span>Inventory</span>
            </div>

            {grouped
              ?.find((group: any) => group.categoryId === openCategoryId)
              ?.items.map((item: any) => (
                <div
                  key={item.id}
                  className="grid w-full grid-cols-4 items-center gap-4 border-b border-stroke px-1 py-2 text-sm dark:border-strokedark"
                >
                  <span>{item.name}</span>
                  <span>{item.unit}</span>
                  <span>{item.amount}</span>
                  <span>{item.inventory}</span>
                </div>
              ))}
          </div>
        )}
      </div>
    </>
  );
};

export default RawMaterialList;
