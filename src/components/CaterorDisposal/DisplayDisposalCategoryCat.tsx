/*eslint-disable*/
import GenericTable, {Column} from '@/components/Forms/Table/GenericTable';
import {useGetDisposalCategories} from '@/lib/react-query/queriesAndMutations/cateror/disposal';
import {useNavigate} from '@tanstack/react-router';
import {useEffect, useState} from 'react';
import {useDeleteDisposalCategory} from '@/lib/react-query/queriesAndMutations/cateror/disposal';
import {Loader} from '../Loader/Loader';
import {confirmAlert} from 'react-confirm-alert';
import {useAuthContext} from '@/context/AuthContext';
import * as XLSX from 'xlsx';
// import toast from 'react-hot-toast'; // Import toast for notifications

type DisposalCategory = {
  id: string;
  CategoryName: string;
};

type Category = {
  id: string; // or number, depending on your data structure
  name: string; // or number
};

const columns: Column<DisposalCategory>[] = [
  {header: 'Disposal Category', accessor: 'CategoryName', sortable: true},
];

const DisplayDisposalCategoryCat: React.FC = () => {
  const {user} = useAuthContext();
  const restriction = user?.employeeRestriction?.disposalCategoryPage;
  const role = user?.role;
  const navigate = useNavigate();
  const [disposalCategories, setDisposalCategories] = useState<
    DisposalCategory[]
  >([]);
  const {
    data: categoriesData,
    isLoading,
    isSuccess,
    error,
  } = useGetDisposalCategories();
  const {mutate: deleteDisposalCategory} = useDeleteDisposalCategory();

  useEffect(() => {
    if (isSuccess && categoriesData.data) {
      // Safely access nested categories
      const transformedData = categoriesData.data?.data?.map(
        (category: Category) => ({
          id: category.id,
          CategoryName: category.name,
        }),
      );
      setDisposalCategories(transformedData);
    }
  }, [isSuccess, categoriesData]);

  const handleEdit = (item: DisposalCategory) => {
    navigate({
      to: `/update/disposalcategoryCateror/${item.id}`,
    });
  };

  const handleDelete = async (item: DisposalCategory) => {
    confirmAlert({
      customUI: ({onClose}) => (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-meta-4 bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 text-black shadow-md dark:bg-meta-4 dark:text-white">
            <h2 className="mb-4 text-xl font-semibold">Confirm to delete</h2>
            <p className="mb-6">
              Are you sure you want to delete disposal category
              <strong>{item.CategoryName}</strong>?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={async () => {
                  try {
                    await deleteDisposalCategory(item.id);
                    setDisposalCategories((prev) =>
                      prev.filter((category) => category.id !== item.id),
                    );
                    onClose();
                  } catch (error) {
                    console.error('Error deleting disposal category:', error);
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

  const handleExportDisposalsCategory = () => {
    const exportData = disposalCategories?.map((group: any) => ({
      OldName: group.CategoryName,
      NewName: null,
    }));

    if (exportData && exportData.length > 0) {
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Disposal Category');

      XLSX.writeFile(wb, 'DisposalCategory.xlsx');
    }
  };

  // Function to check for related records
  const checkForRelatedRecords = async (categoryId: string) => {
    try {
      const response = await fetch(
        `/api/v1/admin/disposals?categoryId=${categoryId}`,
      );
      const data = await response.json();
      return data.length > 0; // Assuming the response returns an array of related records
    } catch (error) {
      console.error('Error checking for related records:', error);
      return false; // Default to false if there's an error
    }
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <>
      <GenericTable
        data={disposalCategories}
        columns={columns}
        itemsPerPage={15}
        action={role === 'CATEROR' || restriction === 'EDIT'}
        onDelete={handleDelete}
        onEdit={handleEdit}
        title="Disposal Categories"
      />{' '}
      <div className="mt-6 flex justify-end">
        <button
          onClick={handleExportDisposalsCategory}
          className="rounded bg-blue-700 px-4 py-2 text-white hover:bg-blue-800"
        >
          Export to Excel
        </button>
      </div>
    </>
  );
};

export default DisplayDisposalCategoryCat;
