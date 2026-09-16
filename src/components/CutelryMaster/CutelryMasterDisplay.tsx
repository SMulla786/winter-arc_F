/*eslint-disable*/
import GenericTable, {Column} from '@/components/Forms/Table/GenericTable';
import {useGetUtensilCategories} from '@/lib/react-query/queriesAndMutations/cateror/utensils';
import {useNavigate} from '@tanstack/react-router';
import {useState, useEffect} from 'react';
import {useDeleteUtensilCategory} from '@/lib/react-query/queriesAndMutations/cateror/utensils';
import {Loader} from '../Loader/Loader';
import {confirmAlert} from 'react-confirm-alert';
import {useAuthContext} from '@/context/AuthContext';
import * as XLSX from 'xlsx';
import {useGetCutleryCategories} from '@/lib/api/cateror/cutlerymaster';

type UtensilsCategory = {
  id: string;
  CategoryName: string;
};

type ApiCategory = {
  id: string;
  name: string; // Assuming this is the name of the category
};

const columns: Column<UtensilsCategory>[] = [
  {header: 'Category Name', accessor: 'CategoryName', sortable: true},
];

const CutelryMasterDisplay: React.FC = () => {
  const {user} = useAuthContext();
  const restriction = user?.employeeRestriction?.utensilCategoryPage;
  const role = user?.role;
  const navigate = useNavigate();
  const [utensilsCategories, setUtensilsCategories] = useState<
    UtensilsCategory[]
  >([]);

  // Fetch utensil categories using the custom hook
  const {data, isPending, isSuccess} = useGetCutleryCategories();
  console.log('data', data);

  // Delete utensil category mutation
  const {mutate: deleteUtensilCategory} = useDeleteUtensilCategory();

  // Update state when data is successfully fetched
  useEffect(() => {
    if (isSuccess && data && Array.isArray(data.data)) {
      // Map the data to match the expected format
      const formattedCategories = data?.data.map((category: ApiCategory) => ({
        id: category.id,
        CategoryName: category.name, // Assuming 'name' is the category name
      }));
      setUtensilsCategories(formattedCategories);
    }
  }, [data, isSuccess]);

  // Edit handler
  const handleEdit = (items: UtensilsCategory) => {
    navigate({
      to: `/update/cutlerycategoryCateror/${items.id}`,
    });
  };

  const handleDelete = (items: UtensilsCategory) => {
    confirmAlert({
      customUI: ({onClose}) => (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-meta-4 bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 text-black shadow-md dark:bg-meta-4 dark:text-white">
            <h2 className="mb-4 text-xl font-semibold">Confirm to delete</h2>
            <p className="mb-6">
              Are you sure you want to delete cutlery category
              <strong>{items.CategoryName}</strong>?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={async () => {
                  try {
                    await deleteUtensilCategory(items.id);

                    setUtensilsCategories((prev) =>
                      prev.filter((category) => category.id !== items.id),
                    );
                    onClose();
                  } catch (error) {
                    console.error('Error deleting category:', error);

                    onClose();
                  }
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

  const handleExportUtensilsCategory = () => {
    const exportData = utensilsCategories?.map((group: any) => ({
      OldName: group.CategoryName,
      NewName: null,
    }));

    if (exportData && exportData.length > 0) {
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Cutlery Category');

      XLSX.writeFile(wb, 'cutleryCategory.xlsx');
    }
  };

  if (isPending) {
    return <Loader />;
  }

  return (
    <>
      <GenericTable
        data={utensilsCategories}
        columns={columns}
        itemsPerPage={5}
        action={role === 'CATEROR' || restriction === 'EDIT'}
        onDelete={handleDelete}
        onEdit={handleEdit}
        title="Cutlery Category"
      />
      <div className="mt-6 flex justify-end">
        <button
          onClick={handleExportUtensilsCategory}
          className="rounded bg-blue-700 px-4 py-2 text-white hover:bg-blue-800"
        >
          Export to Excel
        </button>
      </div>
    </>
  );
};

export default CutelryMasterDisplay;
