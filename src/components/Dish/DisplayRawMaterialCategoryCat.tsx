/*eslint-disable*/
import React from 'react';
import GenericTable, {Column} from '@/components/Forms/Table/GenericTable';
import {useNavigate} from '@tanstack/react-router';
import {
  useDeleteRawMaterialCategoryCat,
  useGetRawMaterialCategoriesCat,
} from '@/lib/react-query/queriesAndMutations/cateror/dish';
import {Loader} from '../Loader/Loader';
import {confirmAlert} from 'react-confirm-alert';
import {useAuthContext} from '@/context/AuthContext';
import * as XLSX from 'xlsx';
// import toast from 'react-hot-toast';

type RawMaterialName = {
  name: string;
  id: string;
};

const columns: Column<RawMaterialName>[] = [
  {header: 'Raw Material Category Name', accessor: 'name', sortable: true},
];

const DisplayRawMaterialCategoryCat: React.FC = () => {
  const {user} = useAuthContext();
  const restriction = user?.employeeRestriction?.rawMaterialCategoryPage;
  const role = user?.role;
  const navigate = useNavigate();

  const {mutateAsync: deleteRawMaterialCategory} =
    useDeleteRawMaterialCategoryCat();
  const {data: categories, isLoading} = useGetRawMaterialCategoriesCat();
  console.log('categoris', categories);
  console.log(categories);

  const handleEdit = (items: RawMaterialName) => {
    navigate({
      to: `/update/rawMaterialCategoryCateror/${items.id}`,
    });
  };

  const handleDelete = async (items: RawMaterialName) => {
    confirmAlert({
      customUI: ({onClose}) => (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-meta-4 bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 text-black shadow-md dark:bg-meta-4 dark:text-white">
            <h2 className="mb-4 text-xl font-semibold">Confirm to delete</h2>
            <p className="mb-6">
              Are you sure you want to delete raw material category{' '}
              <strong>{items.name}</strong>?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  deleteRawMaterialCategory(items.id, {
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

  const handleExportRawCategory = () => {
    const exportData = categories?.data.map((group: any) => ({
      OldName: group.name,
      NewName: null,
    }));

    if (exportData && exportData.length > 0) {
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Raw Material Category');

      XLSX.writeFile(wb, 'RawMaterialCategory.xlsx');
    }
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <>
      <GenericTable
        title="Raw Materail Category"
        data={categories?.data || []}
        columns={columns}
        itemsPerPage={5}
        action={restriction === 'EDIT' || role === 'CATEROR'}
        onDelete={handleDelete}
        onEdit={handleEdit}
        paginationOff
      />

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleExportRawCategory}
          className="rounded bg-blue-700 px-4 py-2 text-white hover:bg-blue-800"
        >
          Export to Excel
        </button>
      </div>
    </>
  );
};

export default DisplayRawMaterialCategoryCat;
