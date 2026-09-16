import {createFileRoute} from '@tanstack/react-router';
import {z} from 'zod';
import {useForm, FormProvider} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import GenericInputField from '@/components/Forms/Input/GenericInputField';
import GenericButton from '@/components/Forms/Buttons/GenericButton';
import GenericTable, {Column} from '@/components/Forms/Table/GenericTable';
import {
  useGetExpense,
  useCreateExpense,
  useUpdateExpense,
  useDeleteExpense,
} from '@/lib/api/cateror/expense';
import {FiEdit, FiTrash2} from 'react-icons/fi';
import {useState} from 'react';
import {useAuthContext} from '@/context/AuthContext';
import AddExpenseManagement from '@/pages/AddExpense';

// ✅ Zod validation schema
const expenseSchema = z.object({
  expenseName: z.string().min(1, 'Expense name is required'),
  price: z.coerce.number().min(0, 'Price must be at least 0'),
});

type ExpenseFormType = z.infer<typeof expenseSchema>;

type ExpenseApiType = {
  id: string;
  name: string;
  price: number;
};

const ExpenseMasterForm = () => {
  const {user} = useAuthContext();
  const restriction = user?.employeeRestriction?.expenseMasterPage;
  const role = user?.role;
  const [editData, setEditData] = useState<ExpenseApiType | null>(null);

  const methods = useForm<ExpenseFormType>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      expenseName: '',
      price: 0,
    },
  });

  const {
    handleSubmit,
    formState: {isSubmitting},
    reset,
    setValue,
  } = methods;

  // React Query hooks
  const {data: expenses = [], isLoading} = useGetExpense();
  const createMutation = useCreateExpense();
  const updateMutation = useUpdateExpense();
  const deleteMutation = useDeleteExpense();

  // Submit handler
  const onSubmit = (formData: ExpenseFormType) => {
    const payload = {
      name: formData.expenseName,
      price: String(formData.price),
    };

    if (editData) {
      updateMutation.mutate(
        {
          id: editData.id,
          ...payload,
        },
        {
          onSuccess: () => {
            setEditData(null);
            reset();
          },
        },
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => reset(),
      });
    }
  };

  // Edit handler
  const handleEdit = (row: ExpenseApiType) => {
    setValue('expenseName', row.name);
    setValue('price', row.price);
    setEditData(row);
  };

  // Delete handler
  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  // Columns
  const columns: Column<ExpenseApiType>[] = [
    {
      header: 'Expense Name',
      accessor: 'name',
    },
  ];

  return (
    <div className="mx-auto mt-10 px-4 sm:px-6 lg:px-8">
      {(role === 'CATEROR' || restriction === 'EDIT') && (
        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-md dark:border-black dark:bg-black">
          <h2 className="mb-6 text-2xl font-semibold text-form-strokedark dark:text-white">
            {editData ? 'Edit Expense' : 'Add Expense'}
          </h2>

          <FormProvider {...methods}>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="grid grid-cols-1 gap-6 md:grid-cols-2"
            >
              <GenericInputField
                name="expenseName"
                label="Expense Name"
                placeholder="e.g., Stationery"
              />

              <div className="flex justify-end md:col-span-2">
                <GenericButton type="submit">
                  {editData ? 'Update Expense' : 'Save Expense'}
                </GenericButton>
              </div>
            </form>
          </FormProvider>
        </div>
      )}

      {/* Table */}
      <div className="mt-10">
        <GenericTable
          data={expenses}
          itemsPerPage={15}
          columns={columns}
          action={role === 'CATEROR' || restriction === 'EDIT'}
          onEdit={(item) => handleEdit(item)}
          onDelete={(item) => handleDelete(item.id)}
        />
      </div>
    </div>
  );
};

export const Route = createFileRoute('/_app/expensemaster')({
  component: AddExpenseManagement,
});
