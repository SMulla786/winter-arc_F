/*eslint-disable*/
import {useEffect, useState} from 'react';
import GenericTable, {Column} from '@/components/Forms/Table/GenericTable';
import {useNavigate} from '@tanstack/react-router';
import {
  useDeleteDisposal,
  useGetDisposalCategories,
  useGetDisposals,
} from '@/lib/react-query/queriesAndMutations/cateror/disposal';
import {languageId} from '@/lib/contants';
import {Loader} from '../Loader/Loader';
import {confirmAlert} from 'react-confirm-alert';
import {FiEdit} from 'react-icons/fi';
import {MdDelete} from 'react-icons/md';
import {useAuthContext} from '@/context/AuthContext';
import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';

type Disposal = {
  id?: string;
  name: string;
  category: {name: string};
  inventory?: number;
};

// Define table columns for disposals
const columns: Column<Disposal>[] = [
  {header: 'Disposal Name', accessor: 'name', sortable: true},
  {
    header: 'Disposal Category',
    accessor: (disposal) => disposal.category.name,
    sortable: true,
  },
  {
    header: 'Inventory',
    accessor: (disposal) => disposal.inventory?.toString() || '0',
    sortable: true,
  },
];

const DisplayDisposalCat: React.FC = () => {
  const {user} = useAuthContext();
  const restriction = user?.employeeRestriction?.disposalPage;
  const role = user?.role;

  const navigate = useNavigate();
  const [disposalsData, setDisposalsData] = useState<Disposal[]>([]);

  const {mutate: deleteDisposal} = useDeleteDisposal();
  const [disposalObject, setDisposalObject] = useState<
    {name: string; id: string}[]
  >([]);

  const {data: disposalCat} = useGetDisposalCategories();

  useEffect(() => {
    if (disposalCat) {
      const oneCat = disposalCat?.data?.data?.map((each: any) => ({
        name: each.name,
        id: each.id,
      }));
      setDisposalObject(oneCat);
    }
  }, [disposalCat]);

  const {
    data: disposalsApiData,
    error,
    isLoading: isLoadingDisposals,
  } = useGetDisposals(languageId);

  const grouped = Array.isArray(disposalsApiData?.data)
    ? Object.values(
        disposalsApiData?.data?.reduce((acc: any, item: any) => {
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
    if (disposalsApiData?.data) {
      const transformedData: Disposal[] = disposalsApiData?.data.map(
        (disposal: any) => ({
          id: disposal.id ?? undefined,
          name: disposal.name || 'N/A',
          category: {name: disposal.category?.name || 'N/A'},
          inventory: disposal.inventory ?? 0, // Assuming inventory comes from API
        }),
      );
      setDisposalsData(transformedData);
    } else if (error) {
      console.error('Error fetching disposals:', error);
    }
  }, [disposalsApiData, error]);

  useEffect(() => {
    if (grouped.length > 0 && !openCategoryId) {
      setOpenCategoryId(grouped[0].categoryId);
    }
  }, [grouped, openCategoryId]);

  const handleEdit = (item: Disposal) => {
    if (item.id) {
      navigate({
        to: `/update/disposalCateror/${item.id}`,
      });
    } else {
      console.warn('Attempted to edit an item without a valid ID.');
    }
  };

  const handleDelete = (item: Disposal) => {
    confirmAlert({
      customUI: ({onClose}) => (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-meta-4 bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 text-black shadow-md dark:bg-meta-4 dark:text-white">
            <h2 className="mb-4 text-xl font-semibold">Confirm to delete</h2>
            <p className="mb-6">
              Are you sure you want to delete disposal {item.name}?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={async () => {
                  try {
                    await deleteDisposal(item.id as string);
                    setDisposalsData((prevData) =>
                      prevData.filter((disposal) => disposal.id !== item.id),
                    );
                    onClose();
                  } catch (error) {
                    console.error('Error deleting disposal:', error);
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

  const handleExportDisposals = async () => {
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
      const ws = wb.addWorksheet('Disposals');

      ws.addRow(['Category', 'Name', 'Inventory', 'NewName']);

      exportData.forEach((row) => {
        ws.addRow([row.Category, row.Name, row.Inventory, row.NewName]);
      });

      const categories = grouped
        .map((g: any) => g.categoryName)
        .filter(Boolean)
        .map((c: string) => c.replace(/"/g, '""'));

      const totalRows = exportData.length + 1;
      for (let row = 2; row <= totalRows; row++) {
        ws.getCell(`A${row}`).dataValidation = {
          type: 'list',
          allowBlank: true,
          formulae: [`"${categories.join(',')}"`],
        };
      }

      const buf = await wb.xlsx.writeBuffer();
      const blob = new Blob([buf], {type: 'application/octet-stream'});
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'Disposals.xlsx';
      link.click();
    }
  };

  if (isLoadingDisposals) {
    return <Loader />;
  }

  return (
    <div className="bg-white p-6 dark:bg-black">
      <h1 className="mb-4 text-xl font-bold">Disposals</h1>
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
            <span className="text-center">Actions</span>
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
              </div>
            ))}
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleExportDisposals}
          className="rounded bg-blue-700 px-4 py-2 text-white hover:bg-blue-800"
        >
          Export to Excel
        </button>
      </div>
    </div>
  );
};

export default DisplayDisposalCat;
