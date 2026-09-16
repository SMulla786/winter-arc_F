import React, {useState, useEffect} from 'react';
import {FormProvider, useForm} from 'react-hook-form';
import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';
import GenericInputField from '../Forms/Input/GenericInputField';
import GenericButton from '../Forms/Buttons/GenericButton';
import {
  useSaveAdditionalCat,
  useGetAdditionalCats,
  useUpdateAdditionalCat,
  useDeleteAdditionalCat,
  CategoryRow,
} from '@/lib/react-query/queriesAndMutations/additionalvendor/additionalvendormutation';
import GenericTable, {Column} from '../Forms/Table/GenericTable';
import {FaArrowLeft} from 'react-icons/fa';
import {useNavigate, useRouter} from '@tanstack/react-router';

// ──────────────────────────────────────────────────────────────
// Validation
// ──────────────────────────────────────────────────────────────
const additionalCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
});
type CategoryFormValues = z.infer<typeof additionalCategorySchema>;

interface AdditionalCategoryProps {
  onCategoryAdded?: () => void;
}

// ──────────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────────
const AdditionalCategory: React.FC<AdditionalCategoryProps> = ({
  onCategoryAdded,
}) => {
  const categoryMethods = useForm<CategoryFormValues>({
    resolver: zodResolver(additionalCategorySchema),
    defaultValues: {name: ''},
  });

  const router = useRouter();
  const navigate = useNavigate();

  const {mutateAsync: saveCategory, isPending: categoryLoading} =
    useSaveAdditionalCat();
  const {mutateAsync: updateCategory, isPending: updateCategoryLoading} =
    useUpdateAdditionalCat();
  const {mutateAsync: deleteCategory, isPending: deleteCategoryLoading} =
    useDeleteAdditionalCat();

  const {
    data: categoriesData = [],
    isLoading: categoriesLoading,
    error: categoriesError,
    refetch: refetchCategories,
  } = useGetAdditionalCats();

  // ---------- editing state ----------
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isEditingForm, setIsEditingForm] = useState(false);

  // When a row is edited we copy its name into the RHF form
  const startEdit = (cat: CategoryRow) => {
    setEditingId(cat.id);
    setIsEditingForm(true);
    categoryMethods.setValue('name', cat.name);
    categoryMethods.clearErrors();
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsEditingForm(false);
    categoryMethods.reset();
  };

  // ---------- add new ----------
  const onAddSubmit = async (data: CategoryFormValues) => {
    try {
      await saveCategory(data);
      categoryMethods.reset();
      refetchCategories();
      onCategoryAdded?.();
    } catch {
      // mutation shows toast
    }
  };

  // ---------- update ----------
  const onUpdateSubmit = async (data: CategoryFormValues) => {
    if (!editingId) return;
    try {
      await updateCategory({id: editingId, name: data.name});
      cancelEdit();
      refetchCategories();
    } catch {
      // mutation shows toast
    }
  };

  // ---------- delete ----------
  const handleDelete = async (cat: CategoryRow) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      await deleteCategory(cat.id);
      refetchCategories();
    } catch {
      // mutation shows toast
    }
  };

  // ---------- table column ----------
  const columns: Column<CategoryRow>[] = [
    {
      header: 'Category Name',
      accessor: 'name',
      className: 'min-w-[200px]',
      sortable: true,
      render: (cat: CategoryRow) => <span>{cat.name}</span>,
    },
  ];

  return (
    <div className="rounded-lg bg-white p-6 shadow-md dark:bg-meta-4">
      {/* ───── Add / Edit Form (same input) ───── */}
      <div className="mb-6">
        <h3 className="mb-4 flex flex-row items-center gap-2 text-lg font-semibold">
          <FaArrowLeft
            onClick={() =>
              navigate({
                to: '/vendormanagement',
                search: {tab: 'additional'},
              })
            }
            className="cursor-pointer"
          />
          {isEditingForm ? 'Edit Category' : 'Add New Category'}
        </h3>

        <FormProvider {...categoryMethods}>
          <form
            onSubmit={categoryMethods.handleSubmit(
              isEditingForm ? onUpdateSubmit : onAddSubmit,
            )}
            className="grid grid-cols-1 items-end gap-4 md:grid-cols-12"
          >
            <div className="md:col-span-8">
              <GenericInputField
                name="name"
                label="Category Name"
                placeholder="Enter category name"
                disabled={categoryLoading || updateCategoryLoading}
              />
            </div>

            <div className="flex justify-end gap-2 md:col-span-4">
              {isEditingForm && (
                <GenericButton
                  type="button"
                  onClick={cancelEdit}
                  className="bg-gray-500 hover:bg-gray-600"
                  disabled={updateCategoryLoading}
                >
                  Cancel
                </GenericButton>
              )}

              <GenericButton
                type="submit"
                disabled={categoryLoading || updateCategoryLoading}
              >
                {isEditingForm
                  ? updateCategoryLoading
                    ? 'Saving...'
                    : 'Save'
                  : categoryLoading
                    ? 'Adding...'
                    : 'Add Category'}
              </GenericButton>
            </div>
          </form>
        </FormProvider>
      </div>

      {/* ───── Errors ───── */}
      {categoriesError && (
        <div className="mb-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
          {categoriesError.message}
        </div>
      )}

      {/* ───── Table ───── */}
      {categoriesLoading ? (
        <div className="flex h-32 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <GenericTable
          data={categoriesData}
          columns={columns}
          title="Existing Categories"
          searchAble={true}
          action={true}
          onEdit={startEdit}
          onDelete={handleDelete}
          itemsPerPage={5}
        />
      )}
    </div>
  );
};

export default AdditionalCategory;
