/* eslint-disable */
import GenericTable, {Column} from '@/components/Forms/Table/GenericTable';
import Dish from '@/components/Dish/Dish';
import {useNavigate} from '@tanstack/react-router';
import {
  useDeleteDish,
  useGetDishCategories,
  useGetDishes,
} from '@/lib/react-query/queriesAndMutations/cateror/dish';
import {useEffect, useMemo, useState} from 'react';
import toast from 'react-hot-toast';
import {FormProvider, useForm} from 'react-hook-form';
import GenericSearchDropdown from '../Forms/SearchDropDown/GenericSearchDropdown';
import {Loader} from '../Loader/Loader';
import {confirmAlert} from 'react-confirm-alert';
import {useAuthContext} from '@/context/AuthContext';
import ExcelJS from 'exceljs';

type Dish = {
  id: string;
  name: string;
  category: string;
  hasNoRawMaterials?: boolean;
};

const DisplayDishCat: React.FC = () => {
  const {user} = useAuthContext();
  const restriction = user?.employeeRestriction?.dishPage;
  const role = user?.role;
  const navigate = useNavigate();
  const {data: DishNames, isLoading} = useGetDishes();

  const {data: dishCategories} = useGetDishCategories();
  const {mutate: deleteDish} = useDeleteDish();

  const methods = useForm<{category: string; rawMaterialFilter: string}>({
    defaultValues: {rawMaterialFilter: 'all'},
  });
  const selectedCategoryId = methods.watch('category');
  const rawMaterialFilter = methods.watch('rawMaterialFilter');

  const [dishes, setDishes] = useState<Dish[]>([]);
  const columns: Column<Dish>[] = [
    {
      header: 'Dish Name',
      accessor: 'name',
      sortable: true,
      render: (row) => (
        <span
          style={{
            // Only show red if user plan is NOT BASIC and dish has no raw materials
            color:
              user?.plan !== 'BASIC' && row.hasNoRawMaterials
                ? 'red'
                : 'inherit',
            fontWeight:
              user?.plan !== 'BASIC' && row.hasNoRawMaterials
                ? 'bold'
                : 'inherit',
          }}
        >
          {row.name}
        </span>
      ),
    },
    {header: 'Category', accessor: 'category', sortable: true},
  ];
  useEffect(() => {
    if (DishNames?.data?.dishes) {
      const mappedDishes = DishNames.data.dishes.map((dish: any) => ({
        id: dish.id,
        name: dish.name,
        category: dish.category?.name,
        categoryId: dish.category?.id,
        type: dish.vegNonveg,
        description: dish.description,
        hasNoRawMaterials: dish?.caterorDishRawMaterialQuantities?.length === 0,
      }));

      const filteredByCategory =
        selectedCategoryId && selectedCategoryId !== ''
          ? mappedDishes.filter(
              (dish) => dish.categoryId === selectedCategoryId,
            )
          : mappedDishes;

      const finalFiltered = filteredByCategory.filter((dish) => {
        if (rawMaterialFilter === 'withZero') return dish.hasNoRawMaterials;
        if (rawMaterialFilter === 'withoutZero') return !dish.hasNoRawMaterials;
        return true; // 'all'
      });

      setDishes(finalFiltered);
    }
  }, [DishNames, selectedCategoryId, rawMaterialFilter]);

  const categoryOptions = useMemo(() => {
    const unique: {[key: string]: string} = {};
    DishNames?.data?.dishes.forEach((dish: any) => {
      if (dish.category?.id && dish.category?.name) {
        unique[dish.category.id] = dish.category.name;
      }
    });
    return Object.entries(unique).map(([id, name]) => ({
      value: id,
      label: name,
    }));
  }, [DishNames]);

  const rawMaterialOptions = [
    {value: 'all', label: 'All'},
    {value: 'withZero', label: 'Dishes with No Raw Materials'},
    {value: 'withoutZero', label: 'Dishes with Raw Materials'},
  ];

  const handleEdit = async (items: Dish) => {
    await sessionStorage.setItem('dishEdit', items.name);
    await navigate({
      to: `/AddDish`,
      state: {dishName: items.id},
    });
  };

  const handleDelete = (items: Dish) => {
    confirmAlert({
      customUI: ({onClose}) => (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-meta-4 bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 text-black shadow-md dark:bg-meta-4 dark:text-white">
            <h2 className="mb-4 text-xl font-semibold">Confirm to delete</h2>
            <p className="mb-6">
              Are you sure you want to delete dish
              <strong>{items.name}</strong>?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={async () => {
                  try {
                    await deleteDish(items.id);
                    toast.success(`Dish "${items.name}" deleted successfully.`);
                    onClose();
                  } catch (error) {
                    console.error('Error deleting dish:', error);
                    toast.error(
                      'This item is linked to other records and cannot be deleted.',
                    );
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

  console.log('dishhh', dishes);
  // const handleExportDish = () => {
  //   const exportData = dishes.map((group: any) => ({
  //     Name: group.name,
  //     NewName: null,
  //   }));

  //   if (exportData && exportData.length > 0) {
  //     const ws = XLSX.utils.json_to_sheet(exportData);
  //     const wb = XLSX.utils.book_new();
  //     XLSX.utils.book_append_sheet(wb, ws, 'Dish');

  //     XLSX.writeFile(wb, 'Dish.xlsx');
  //   }
  // };

  // const handleExportDish = () => {
  //   const exportData = dishes.map((group: any) => ({
  //     Category: group.category,
  //     Name: group.name,
  //     Type: group.type,
  //     Description: group.description,
  //     NewName: null,
  //   }));

  //   if (exportData && exportData.length > 0) {
  //     // Step 2: Create sheet
  //     const ws = XLSX.utils.json_to_sheet(exportData);

  //     // Step 3: Collect unique categories for dropdown
  //     const categories = dishes.map((g: any) => g.categoryName);

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
  //     XLSX.utils.book_append_sheet(wb, ws, 'Dish');
  //     XLSX.writeFile(wb, 'dish.xlsx');
  //   }
  // };

  const handleExportDish = async () => {
    const type = ['VEG', 'NONVEG'];
    const exportData = dishes.map((group: any) => ({
      Name: group.name,
      Type: group.type,
      Description: group.description,
      Category: group.category,
      NewName: null,
    }));

    if (exportData && exportData.length > 0) {
      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet('Dishes');

      ws.addRow(['Name', 'Type', 'Description', 'Category', 'NewName']);

      exportData.forEach((row) => {
        ws.addRow([
          row.Name,
          row.Type,
          row.Description,
          row.Category,
          row.NewName,
        ]);
      });

      const categories = dishCategories?.data?.categories
        ?.map((g: any) => g.name)
        .filter(Boolean)
        .map((c: string) => c.replace(/"/g, '""'));

      const totalRows = exportData.length + 1;

      for (let row = 2; row <= totalRows; row++) {
        ws.getCell(`B${row}`).dataValidation = {
          type: 'list',
          allowBlank: true,
          formulae: [`"${type.join(',')}"`],
        };

        ws.getCell(`D${row}`).dataValidation = {
          type: 'list',
          allowBlank: true,
          formulae: [`"${categories.join(',')}"`],
        };
      }

      const buf = await wb.xlsx.writeBuffer();
      const blob = new Blob([buf], {type: 'application/octet-stream'});
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'Dishes.xlsx';
      link.click();
    }
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <FormProvider {...methods}>
      <div className="flex items-center justify-between">
        <h2 className="text-gray-900 text-xl font-bold dark:text-white">
          Dish List
        </h2>
      </div>
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <GenericSearchDropdown
          name="category"
          label="Filter by Category"
          options={categoryOptions}
        />
        <GenericSearchDropdown
          name="rawMaterialFilter"
          label="Raw Material Filter"
          options={rawMaterialOptions}
        />
      </div>
      <GenericTable
        title="All Dishes "
        data={dishes || []}
        columns={columns}
        itemsPerPage={20}
        action={role === 'CATEROR' || restriction === 'EDIT'}
        searchAble
        onEdit={handleEdit}
        onDelete={handleDelete}
        paginationOff
      />

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleExportDish}
          className="rounded bg-blue-700 px-4 py-2 text-white hover:bg-blue-800"
        >
          Export to Excel
        </button>
      </div>
    </FormProvider>
  );
};

export default DisplayDishCat;
