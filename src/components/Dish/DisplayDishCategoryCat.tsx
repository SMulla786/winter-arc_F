/*eslint-disable*/
import React, {useEffect, useState} from 'react';
import {useNavigate} from '@tanstack/react-router';
import {
  useDeleteDishCategory,
  useGetDishCategories,
} from '@/lib/react-query/queriesAndMutations/cateror/dish';
import {Loader} from '../Loader/Loader';
import {confirmAlert} from 'react-confirm-alert';
import {useAuthContext} from '@/context/AuthContext';
import * as XLSX from 'xlsx';
import {toast} from 'react-hot-toast'; // Import toast for notifications
import {BiSave} from 'react-icons/bi'; // Icon for save button
import {TbDragDrop} from 'react-icons/tb'; // Icon for drag indicator
import {api} from '@/utils/axios'; // Import api utility
import {FiEdit} from 'react-icons/fi';
import {MdDelete} from 'react-icons/md';

type DishCategory = {
  id: string;
  name: string;
  priority?: number; // Add priority field - assume API returns it, or default to index + 1
};

const DisplayDishCategoryCat: React.FC = () => {
  const {user} = useAuthContext();
  const restriction = user?.employeeRestriction?.dishCategoryPage;
  const role = user?.role;
  const navigate = useNavigate();
  const {
    data: dishCategoriesResponse,
    isLoading: isLoadingDishCategories,
    refetch,
  } = useGetDishCategories();

  // State for ordered categories (with priority)
  const [orderedCategories, setOrderedCategories] = useState<DishCategory[]>(
    [],
  );
  const [isSaving, setIsSaving] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  // Function to update priorities via PUT API
  const updatePriorities = async (
    payload: {id: string; priority: number}[],
  ) => {
    try {
      await api.put(`/cateror/dishes/category/priority`, payload);
      toast.success('Priorities saved successfully');
      await refetch(); // Refetch to sync with backend
    } catch (error: any) {
      console.error('Failed to save priorities', error);
      toast.error(
        error?.response?.data?.message || 'Failed to save priorities',
      );
      throw error; // Re-throw for mutation handling if needed
    }
  };

  // Load and initialize ordered categories with priorities
  useEffect(() => {
    if (dishCategoriesResponse?.data?.categories) {
      const categories = dishCategoriesResponse.data
        .categories as DishCategory[];
      // If no priority in data, assign based on current order
      const withPriorities = categories.map((cat, index) => ({
        ...cat,
        priority: cat.priority || index + 1,
      }));
      // Sort by priority to maintain sequence
      withPriorities.sort((a, b) => (a.priority || 0) - (b.priority || 0));
      setOrderedCategories(withPriorities);
    }
  }, [dishCategoriesResponse]);

  // Refetch on mount or route change
  useEffect(() => {
    refetch();
  }, [refetch]);

  // Drag handlers for reordering
  const handleDragStart = (id: string) => {
    setDraggedId(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Allow drop
  };

  const handleDrop = (targetId: string) => {
    if (!draggedId || draggedId === targetId) {
      setDraggedId(null);
      return;
    }

    const updated = [...orderedCategories];
    const draggedIndex = updated.findIndex((c) => c.id === draggedId);
    const targetIndex = updated.findIndex((c) => c.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedId(null);
      return;
    }

    // Reorder array
    const [draggedItem] = updated.splice(draggedIndex, 1);
    updated.splice(targetIndex, 0, draggedItem);

    // Update priorities based on new order
    const withUpdatedPriorities = updated.map((cat, index) => ({
      ...cat,
      priority: index + 1,
    }));

    setOrderedCategories(withUpdatedPriorities);
    setDraggedId(null);
  };

  // Save priorities stepwise (send array with id and priority)
  const handleSavePriorities = async () => {
    if (orderedCategories.length === 0) {
      toast.error('No categories to save');
      return;
    }

    const payload = orderedCategories.map((cat) => ({
      id: cat.id,
      priority: cat.priority || 1,
    }));

    try {
      setIsSaving(true);
      await updatePriorities(payload);
    } catch (error) {
      // Error handled in updatePriorities
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (item: DishCategory) => {
    navigate({to: `/update/dishCategoryCateror/${item.id}`});
  };

  const {mutate: deleteDishCategory} = useDeleteDishCategory();

  const handleDelete = (item: DishCategory) => {
    confirmAlert({
      customUI: ({onClose}) => (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-meta-4 bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 text-black shadow-md dark:bg-meta-4 dark:text-white">
            <h2 className="mb-4 text-xl font-semibold">Confirm to delete</h2>
            <p className="mb-6">
              Are you sure you want to delete dish category{' '}
              <strong>{item.name}</strong>?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  deleteDishCategory(item.id, {
                    onSuccess: () => {
                      onClose();
                      refetch(); // Refetch after delete
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

  const handleExportDishCategory = () => {
    const exportData = orderedCategories.map((group) => ({
      Name: group.name,
      Priority: group.priority,
    }));

    if (exportData && exportData.length > 0) {
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Dish Category');

      XLSX.writeFile(wb, 'DishCategory.xlsx');
    }
  };

  if (isLoadingDishCategories) {
    return <Loader />;
  }

  const hasCategories =
    (dishCategoriesResponse?.data?.categories || []).length > 0;

  return (
    <div className="space-y-6">
      {/* Apply GenericTable styling */}
      <div className="rounded-sm border border-stroke bg-white px-4 pb-2 pt-4 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-6">
        <div className="max-w-full overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <div className="flex items-center justify-between">
                <h2 className="text-gray-900 text-xl font-bold dark:text-white">
                  Dish Categories
                </h2>
              </div>
              <tr className="bg-gray-2 text-left dark:bg-meta-4">
                <th className="min-w-[120px] px-3 py-2.5 font-medium text-black dark:text-white">
                  <div className="flex items-center space-x-2 text-sm">
                    <TbDragDrop className="text-gray-400 h-4 w-4" />
                    <span>Priority</span>
                  </div>
                </th>
                <th className="min-w-[120px] px-3 py-2.5 font-medium text-black dark:text-white">
                  <div className="text-sm">Dish Category Name</div>
                </th>
                {role === 'CATEROR' || restriction === 'EDIT' ? (
                  <th className="min-w-[120px] px-3 py-2.5 font-medium text-black dark:text-white">
                    <div className="text-sm">Actions</div>
                  </th>
                ) : null}
              </tr>
            </thead>
            <tbody>
              {hasCategories ? (
                orderedCategories.map((item, index) => (
                  <tr
                    key={item.id}
                    draggable
                    onDragStart={() => handleDragStart(item.id)}
                    onDragOver={handleDragOver}
                    onDrop={() => handleDrop(item.id)}
                    onDragEnter={(e) => e.preventDefault()}
                    className={`hover:bg-gray-50 dark:hover:bg-gray-700 text-sm transition-all ${
                      draggedId === item.id
                        ? 'bg-blue-50 dark:bg-blue-900/20'
                        : ''
                    }`}
                  >
                    <td className="border-b border-[#eee] px-3 py-2 dark:border-strokedark">
                      <div className="flex items-center space-x-3 py-1.5">
                        <TbDragDrop className="text-gray-400 h-4 w-4 cursor-grab" />
                        <span className="text-gray-900 font-medium dark:text-white">
                          {item.priority}
                        </span>
                      </div>
                    </td>
                    <td className="border-b border-[#eee] px-3 py-2 dark:border-strokedark">
                      <div className="text-gray-900 py-1.5 text-sm font-medium dark:text-white">
                        {item.name}
                      </div>
                    </td>
                    {role === 'CATEROR' || restriction === 'EDIT' ? (
                      <td className="border-b border-[#eee] px-3 py-2 dark:border-strokedark">
                        <div className="flex items-center space-x-2 py-1.5 sm:block sm:space-x-0 sm:space-y-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="hover:bg-gray-100 rounded p-1.5 dark:hover:bg-meta-4"
                          >
                            <FiEdit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item)}
                            className="hover:bg-gray-100 rounded p-1.5 dark:hover:bg-meta-4"
                          >
                            <MdDelete className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    ) : null}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={3}
                    className="text-gray-500 dark:text-gray-400 px-6 py-12 text-center"
                  >
                    No categories found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-end space-x-4">
        <button
          onClick={handleSavePriorities}
          disabled={isSaving || orderedCategories.length === 0}
          className="mx-1 rounded bg-primary px-6 py-1 text-white transition duration-300 ease-in-out disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span>{isSaving ? 'Saving...' : 'Save Priorities'}</span>
        </button>
      </div>
    </div>
  );
};

export default DisplayDishCategoryCat;
