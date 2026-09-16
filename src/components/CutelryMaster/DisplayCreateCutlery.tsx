/*eslint-disable*/
import {useEffect, useState} from 'react';
import GenericTable, {Column} from '@/components/Forms/Table/GenericTable';
import {useNavigate} from '@tanstack/react-router';
import {
  useDeleteUtensil,
  useGetUtensils,
} from '@/lib/react-query/queriesAndMutations/cateror/utensils';
import {languageId} from '@/lib/contants';
import {Loader} from '../Loader/Loader';
import {confirmAlert} from 'react-confirm-alert';
import {FiEdit} from 'react-icons/fi';
import {MdDelete} from 'react-icons/md';
import {useAuthContext} from '@/context/AuthContext';
import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';
import {
  useDeleteCutlery,
  useGetCutleries,
} from '@/lib/api/cateror/cutlerymaster';

// Define the UtensilFromApi type
type UtensilFromApi = {
  id: string;
  name?: string;
  category?: {
    id: string;
    name: string;
  };
  inventory?: number; // Assuming inventory is part of the API response
};

// Define the Utensil type
type Utensil = Omit<UtensilFromApi, 'languageId'>;

// Define the table columns including Inventory
const columns: Column<Utensil>[] = [
  {header: 'Utensil Name', accessor: 'name', sortable: true},
  {
    header: 'Category',
    accessor: (utensil) => utensil.category?.name || 'N/A',
    sortable: true,
  },
  {
    header: 'Inventory',
    accessor: (utensil) => utensil.inventory?.toString() || '0',
    sortable: true,
  },
];

const DisplayCutleryCreate: React.FC = () => {
  const {user} = useAuthContext();
  const restriction = user?.employeeRestriction?.utensilPage;
  const role = user?.role;
  const navigate = useNavigate();
  const [utensilsData, setUtensilsData] = useState<Utensil[]>([]);

  const {mutate: deleteUtensil} = useDeleteCutlery();
  const {
    data: utensilsApiData,
    isPending,
    error,
  } = useGetCutleries(languageId || 'defaultLanguageId');

  const grouped = Array.isArray(utensilsApiData?.data)
    ? Object.values(
        utensilsApiData?.data?.reduce((acc: any, item: any) => {
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

  useEffect(() => {
    if (utensilsApiData?.data) {
      const transformedData: Utensil[] = utensilsApiData?.data.map(
        (utensil: UtensilFromApi) => ({
          id: utensil.id,
          name: utensil.name || 'N/A',
          category: {
            id: utensil.category?.id || 'N/A',
            name: utensil.category?.name || 'N/A',
          },
          inventory: utensil.inventory ?? 0, // Initialize inventory if missing
        }),
      );
      setUtensilsData(transformedData);
    } else if (error) {
      console.error('Error fetching utensils:', error);
    }
  }, [utensilsApiData, error]);

  const handleEdit = (item: Utensil) => {
    navigate({
      to: `/update/cutleryCateror/${item.id}`,
    });
  };

  const handleDelete = (items: Utensil) => {
    confirmAlert({
      customUI: ({onClose}) => (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-meta-4 bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 text-black shadow-md dark:bg-meta-4 dark:text-white">
            <h2 className="mb-4 text-xl font-semibold">Confirm to delete</h2>
            <p className="mb-6">
              Are you sure you want to delete cutlery{' '}
              <strong>{items.name}</strong>?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={async () => {
                  try {
                    await deleteUtensil(items.id);

                    setUtensilsData((prevData) =>
                      prevData.filter((utensil) => utensil.id !== items.id),
                    );
                    onClose();
                  } catch (error) {
                    console.error('Error deleting utensil:', error);

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

  const handleExportUtensils = async () => {
    const exportData = grouped.flatMap((group: any) =>
      group.items.map((item: any) => ({
        Category: group.categoryName,
        Name: item.name,
        Inventory: item.inventory ?? 0,
        NewName: null,
      })),
    );

    if (exportData && exportData.length > 0) {
      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet('Utensils');

      ws.addRow(['Category', 'Name', 'Inventory', 'NewName']);

      exportData.forEach((row) => {
        ws.addRow([row.Category, row.Name, row.Inventory, row.NewName]);
      });

      const categories = grouped.map((g: any) => g.categoryName);

      const totalRows = exportData.length + 1;
      for (let row = 2; row <= totalRows; row++) {
        ws.getCell(`A${row}`).dataValidation = {
          type: 'list',
          allowBlank: false,
          formulae: [`"${categories.join(',')}"`],
        };
      }

      const buf = await wb.xlsx.writeBuffer();
      const blob = new Blob([buf], {type: 'application/octet-stream'});
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'Utensils.xlsx';
      link.click();
    }
  };

  if (isPending) {
    return <Loader />;
  }

  return (
    <div className="bg-white p-6 dark:bg-black">
      <h2 className="mb-3 text-lg font-semibold">Cutlery</h2>
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
          <div className="grid w-full grid-cols-3 gap-4 bg-neutral-100 p-3 py-2 text-sm font-semibold dark:bg-meta-4">
            <span>Name</span>
            <span>Inventory</span>
            {(role === 'CATEROR' || restriction === 'EDIT') && (
              <span className="text-center">Actions</span>
            )}
          </div>

          {grouped
            ?.find((group: any) => group.categoryId === openCategoryId)
            ?.items.map((item: any) => (
              <div
                key={item.id}
                className="grid w-full grid-cols-3 items-center gap-4 border-b border-stroke px-1 py-2 text-sm dark:border-strokedark"
              >
                <span>{item.name}</span>
                <span>{item.inventory ?? 0}</span>
                {(role === 'CATEROR' || restriction === 'EDIT') && (
                  <div className="flex justify-center">
                    <button
                      className="rounded px-3 py-4"
                      onClick={() => handleEdit(item)}
                    >
                      <FiEdit className="h-5 w-5" />
                    </button>
                    <button
                      className="rounded px-3 py-4"
                      onClick={() => handleDelete(item)}
                    >
                      <MdDelete className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </div>
            ))}
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleExportUtensils}
          className="rounded bg-blue-700 px-4 py-2 text-white hover:bg-blue-800"
        >
          Export to Excel
        </button>
      </div>
    </div>
  );
};

export default DisplayCutleryCreate;
