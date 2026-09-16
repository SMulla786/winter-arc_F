/* eslint-disable  */
import GenericTable, {Column} from '@/components/Forms/Table/GenericTable';
import {
  useDeleteRawMaterial,
  useGetRawMaterialCategoriesCat,
  useGetRawMaterialsCateror,
  useUpdateRawMaterialsCateror,
} from '@/lib/react-query/queriesAndMutations/cateror/dish';
import {useNavigate} from '@tanstack/react-router';
import {Loader} from '../Loader/Loader';
import {confirmAlert} from 'react-confirm-alert';
import {useEffect, useRef, useState} from 'react';
import {FiEdit} from 'react-icons/fi';
import {MdDelete} from 'react-icons/md';
import {useAuthContext} from '@/context/AuthContext';
import ExcelJS from 'exceljs';

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

const DisplayRawMaterialCateror: React.FC = () => {
  const {user} = useAuthContext();
  const restriction = user?.employeeRestriction?.rawMaterialPage;
  const role = user?.role;
  const navigate = useNavigate();
  const {data: rawMaterial, isPending} = useGetRawMaterialsCateror();
  const {
    mutate: updateRawMaterialsCateror,
    isSuccess: isUpdateSuccess,
    isError,
    error,
  } = useUpdateRawMaterialsCateror();

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
          category: item.category.name,
          unit: item.unit,
          amount: item.amount,
          inventory: item.inventory,
        }),
      )) ||
    [];

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
  console.log('grouped ', grouped);

  // const handleExportRawMaterials = () => {
  //   // Step 1: Prepare data with category
  //   const exportData = grouped.flatMap((group: any) =>
  //     group.items.map((item: any) => ({
  //       Category: group.categoryName,
  //       Name: item.name,
  //       NewName: null,
  //     })),
  //   );

  //   if (exportData && exportData.length > 0) {
  //     // Step 2: Create sheet
  //     const ws = XLSX.utils.json_to_sheet(exportData);

  //     // Step 3: Collect unique categories for dropdown
  //     const categories = grouped.map((g: any) => g.categoryName);

  //     // Step 4: Apply dropdown validation to ALL rows in Category column
  //     const range = XLSX.utils.decode_range(ws['!ref']!);
  //     const colCategory = 0;
  //     for (let R = 1; R <= range.e.r; ++R) {
  //       const cellRef = XLSX.utils.encode_cell({r: R, c: colCategory});

  //       if (!ws['!dataValidations']) ws['!dataValidations'] = [];
  //       ws['!dataValidations'].push({
  //         type: 'list',
  //         allowBlank: false,
  //         sqref: cellRef,
  //         formulas: [`"${categories.join(',')}"`], // dropdown with all categories
  //       });
  //     }

  //     // Step 5: Save Excel file
  //     const wb = XLSX.utils.book_new();
  //     XLSX.utils.book_append_sheet(wb, ws, 'Raw Materials');
  //     XLSX.writeFile(wb, 'RawMaterials.xlsx');
  //   }
  // };
  const enterPressedRef = useRef(false);

  const handleExportRawMaterials = async () => {
    const exportData = grouped.flatMap((group: any) =>
      group.items.map((item: any) => ({
        Name: item.name,
        Category: group.categoryName,
        NewName: null,
      })),
    );

    if (exportData && exportData.length > 0) {
      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet('RawMaterial');

      ws.addRow(['Name', 'Category', 'NewName']);

      exportData.forEach((row) => {
        ws.addRow([row.Name, row.Category, row.NewName]);
      });

      const categories = grouped
        .map((g: any) => g.categoryName)
        .filter(Boolean)
        .map((c: string) => c.replace(/"/g, '""'));

      const totalRows = exportData.length + 1;
      for (let row = 2; row <= totalRows; row++) {
        ws.getCell(`B${row}`).dataValidation = {
          type: 'list',
          allowBlank: true,
          formulae: [`"${categories.join(',')}"`],
        };
      }

      const buf = await wb.xlsx.writeBuffer();
      const blob = new Blob([buf], {type: 'application/octet-stream'});
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'RawMaterial.xlsx';
      link.click();
    }
  };

  const handleAmountChange = (item: RawMaterial, newAmount: string) => {
    // console.log(`Amount for ${item.name} changed to ${newAmount}`);
    // Here you can implement logic to update the amount in your state or backend
    updateRawMaterialsCateror({
      id: item.id,
      data: {
        name: item.name,
        amount: Number(newAmount),
        inventory: Number(item.inventory),
        unit: item.unit,
        categoryId: item.categoryId,
      },
    });
  };

  if (isPending) {
    return <Loader />;
  }
  return (
    <>
      <div className="bg-white p-5 py-8 dark:bg-black">
        {' '}
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
            <div className="grid w-full grid-cols-5 gap-4 bg-neutral-100 p-3 py-2 text-sm font-semibold dark:bg-meta-4">
              <span>Name</span>
              <span>Unit</span>
              <span>Amount</span>
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
                  className="grid w-full grid-cols-5 items-center gap-4 border-b border-stroke px-1 py-2 text-sm dark:border-strokedark"
                >
                  <span>{item.name}</span>
                  <span>{item.unit}</span>
                  {/* <span>{item.amount}</span> */}
                  {/* <input
                    type="number"
                    defaultValue={item.amount} // Set the default value to the original amount value={item.amount}
                    // onBlur={(e) => handleAmountChange(item, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleAmountChange(
                          item,
                          (e.target as HTMLInputElement).value,
                        );
                        (e.target as HTMLInputElement).blur();
                      }
                    }}
                    className="border-gray-300 w-[60px] rounded border px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-meta-3 dark:bg-meta-4 dark:text-white"
                  /> */}

                  <input
                    type="number"
                    defaultValue={item.amount}
                    onBlur={(e) => {
                      if (!enterPressedRef.current) {
                        handleAmountChange(item, e.target.value);
                      }
                      enterPressedRef.current = false; // reset
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        enterPressedRef.current = true;
                        handleAmountChange(
                          item,
                          (e.target as HTMLInputElement).value,
                        );
                        (e.target as HTMLInputElement).blur();
                      }
                    }}
                    className="border-gray-300 w-[60px] rounded border px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-meta-3 dark:bg-meta-4 dark:text-white"
                  />
                  <span>{item.inventory}</span>

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
            onClick={handleExportRawMaterials}
            className="rounded bg-blue-700 px-4 py-2 text-white hover:bg-blue-800"
          >
            Export to Excel
          </button>
        </div>
      </div>
    </>
  );
};

export default DisplayRawMaterialCateror;
