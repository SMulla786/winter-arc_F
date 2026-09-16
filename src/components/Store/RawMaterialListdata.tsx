/* eslint-disable  */
import {useState, useEffect} from 'react';
import GenericTable, {Column} from '@/components/Forms/Table/GenericTable';
import {Loader} from '../Loader/Loader';
import {useGetRawMaterialsCateror} from '@/lib/react-query/queriesAndMutations/cateror/dish';
import ExcelJS from 'exceljs';
import {useNavigate} from '@tanstack/react-router';
import {useAuthContext} from '@/context/AuthContext'; // Add AuthContext import

type RawMaterial = {
  id: string;
  name: string;
  categoryId: string;
  category: string;
  unit: string;
  amount: number;
  inventory: number;
};

interface RawMaterialListdataProps {
  hasEditAccess?: boolean;
}

const RawMaterialListdata: React.FC<RawMaterialListdataProps> = ({
  hasEditAccess: propHasEditAccess,
}) => {
  const {user} = useAuthContext(); // Get user context
  const restriction = user?.employeeRestriction?.storeInventory;
  const role = user?.role;

  // Use prop if provided, otherwise calculate from context
  const hasEditAccess =
    propHasEditAccess !== undefined
      ? propHasEditAccess
      : role === 'CATEROR' || restriction === 'EDIT';

  const {data: rawMaterial, isPending} = useGetRawMaterialsCateror();
  const navigate = useNavigate();

  // Group raw materials by category
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

  // Set first category as open by default
  useEffect(() => {
    if (grouped.length > 0 && !openCategoryId) {
      setOpenCategoryId(grouped[0].categoryId);
    }
  }, [grouped, openCategoryId]);

  const formatAmount = (amount: number): string => {
    const rounded = Math.round(amount * 100) / 100;

    if (rounded % 1 === 0) {
      return rounded.toString();
    }

    return rounded.toFixed(2);
  };

  // Prepare data for GenericTable
  const getTableData = () => {
    if (!openCategoryId) return [];

    const currentGroup = grouped.find(
      (group: any) => group.categoryId === openCategoryId,
    );
    if (!currentGroup) return [];

    return currentGroup.items.map((item: any) => ({
      id: item.id,
      name: item.name,
      unit: item.unit,
      amount: formatAmount(item.amount),
      inventory: formatAmount(item.inventory), // Format inventory to 2 decimal places
    }));
  };

  // Define columns for GenericTable
  const columns: Column<any>[] = [
    {header: 'Name', accessor: 'name', sortable: true},
    {header: 'Inventory', accessor: 'inventory', sortable: true},
    {header: 'Unit', accessor: 'unit', sortable: true},
    {header: 'Amount', accessor: 'amount', sortable: true},
  ];

  const handleExportRawMaterials = async () => {
    // Only allow export if user has at least VIEW access
    const canExport =
      role === 'CATEROR' || restriction === 'EDIT' || restriction === 'VIEW';
    if (!canExport) {
      alert('You do not have permission to export data');
      return;
    }

    const exportData = grouped.flatMap((group: any) =>
      group.items.map((item: any) => ({
        Name: item.name,
        Category: group.categoryName,
        NewName: null,
        Unit: item.unit,
        Amount: formatAmount(item.amount),
        Inventory: formatAmount(item.inventory), // Format inventory here too
      })),
    );

    if (exportData && exportData.length > 0) {
      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet('RawMaterial');

      // Add headers with more columns
      ws.addRow(['Name', 'Category', 'NewName', 'Unit', 'Amount', 'Inventory']);

      // Add data rows
      exportData.forEach((row) => {
        ws.addRow([
          row.Name,
          row.Category,
          row.NewName,
          row.Unit,
          row.Amount,
          row.Inventory,
        ]);
      });

      // Style the Amount and Inventory columns to show 2 decimal places
      ws.columns = [
        {header: 'Name', key: 'Name', width: 30},
        {header: 'Category', key: 'Category', width: 20},
        {header: 'NewName', key: 'NewName', width: 30},
        {header: 'Unit', key: 'Unit', width: 10},
        {
          header: 'Amount',
          key: 'Amount',
          width: 15,
        },
        {
          header: 'Inventory',
          key: 'Inventory',
          width: 15,
        },
      ];

      // Add data validation for categories
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

      // Download the file
      const buf = await wb.xlsx.writeBuffer();
      const blob = new Blob([buf], {type: 'application/octet-stream'});
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'RawMaterial.xlsx';
      link.click();
    }
  };

  const handleEdit = (item: any) => {
    navigate({to: `/update/rawMaterialCateror/${item.id}`});
  };

  if (isPending) {
    return <Loader />;
  }

  return (
    <div>
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
        <GenericTable
          data={getTableData()}
          columns={columns}
          itemsPerPage={15}
          paginationOff={true}
          searchAble
          // Restrict action buttons based on edit access
          action={hasEditAccess}
          onEdit={hasEditAccess ? handleEdit : undefined}
        />
      )}

      {/* Export button with permission check */}
      {(role === 'CATEROR' ||
        restriction === 'EDIT' ||
        restriction === 'VIEW') && (
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleExportRawMaterials}
            className="rounded bg-blue-700 px-4 py-2 text-white hover:bg-blue-800"
          >
            Export to Excel
          </button>
        </div>
      )}
    </div>
  );
};

export default RawMaterialListdata;
