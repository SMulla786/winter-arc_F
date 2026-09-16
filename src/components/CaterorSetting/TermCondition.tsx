import {zodResolver} from '@hookform/resolvers/zod';
import React, {useState, useEffect, useRef} from 'react';
import {useForm, FormProvider} from 'react-hook-form';
import {z} from 'zod';
import GenericButton from '../Forms/Buttons/GenericButton';
import GenericInputField from '../Forms/Input/GenericInputField';
import {useAuthContext} from '@/context/AuthContext';
import {
  useAddTermAndCondition,
  useDeleteTerms,
  useGetTerms,
} from '@/lib/react-query/queriesAndMutations/cateror/termcondition';
import GenericTable, {Column} from '../Forms/Table/GenericTable';
import {Loader} from '../Loader/Loader';
import {confirmAlert} from 'react-confirm-alert';

type TermAndCondition = {
  id: string;
  caterorId: string;
  terms: string;
};

export const termandconditionSchema = z.object({
  terms: z.string().min(1, 'Term & Condition is required'),
  caterorId: z.string().min(1, 'Cateror ID is required'),
});

export type FormValues = z.infer<typeof termandconditionSchema>;

const columns: Column<TermAndCondition>[] = [
  {header: 'Terms', accessor: 'terms', sortable: true},
];

const TermCondition: React.FC = () => {
  const [termData, setTermData] = useState<TermAndCondition[]>([]);
  const [showForm, setShowForm] = useState(false);

  const {user} = useAuthContext();
  const restriction = user?.employeeRestriction?.termConditionPage;
  const role = user?.role;
  const id = user?.caterorId ?? '';

  const {
    mutate: addTermAndCondition,
    isPending,
    isSuccess,
  } = useAddTermAndCondition();
  const {mutate: deleteTerm} = useDeleteTerms();
  const {data: termsResponse} = useGetTerms(id);

  useEffect(() => {
    if (termsResponse?.data) {
      setTermData(termsResponse.data);
    }
  }, [termsResponse]);

  const methods = useForm<FormValues>({
    resolver: zodResolver(termandconditionSchema),
    defaultValues: {terms: '', caterorId: id},
  });

  const onSubmit = (data: FormValues) => {
    addTermAndCondition(
      {terms: data.terms, caterorId: id},
      {
        onSuccess: () => {
          methods.reset();
          setShowForm(false);
        },
      },
    );
  };

  const handleDelete = (item: TermAndCondition) => {
    confirmAlert({
      customUI: ({onClose}) => (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-meta-4 bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 text-black shadow-md dark:bg-meta-4 dark:text-white">
            <h2 className="mb-4 text-xl font-semibold">Confirm to delete</h2>
            <p className="mb-6">
              Are you sure you want to delete term <strong>{item.terms}</strong>
              ?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={async () => {
                  try {
                    await deleteTerm(item.id);
                    setTermData((prev) => prev.filter((t) => t.id !== item.id));
                    onClose();
                  } catch (error) {
                    console.error('Error deleting term:', error);
                    onClose();
                  }
                }}
                className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
              >
                Yes
              </button>
              <button
                onClick={onClose}
                className="bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 rounded px-4 py-2 text-black dark:text-white"
              >
                No
              </button>
            </div>
          </div>
        </div>
      ),
    });
  };

  if (isPending) return <Loader />;

  return (
    <div className="mx-auto">
      {/* Action Buttons Outside Page Content */}
      {(role === 'CATEROR' || restriction === 'EDIT') && (
        <div className="mb-4 flex items-center justify-between">
          {/* Back button on the left */}
          <div>
            {showForm && (
              <button
                className="text-xl font-bold"
                onClick={() => setShowForm(false)}
              >
                ← Back
              </button>
            )}
          </div>

          {/* Add Term button on the right */}
          <div>
            {!showForm && (
              <GenericButton onClick={() => setShowForm(true)}>
                Add Term
              </GenericButton>
            )}
          </div>
        </div>
      )}

      {/* Page Content */}
      <div className="bg-white p-8 dark:bg-black">
        {showForm && (role === 'CATEROR' || restriction === 'EDIT') && (
          <FormProvider {...methods}>
            <form
              onSubmit={methods.handleSubmit(onSubmit)}
              className="space-y-6"
            >
              <h1 className="text-2xl font-semibold">Term & Condition</h1>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:gap-6">
                <div className="col-span-12 md:col-span-6">
                  <GenericInputField
                    name="terms"
                    label="Term & Condition"
                    placeholder="Enter the Term & Condition"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-4 pt-4">
                <GenericButton type="submit">Save</GenericButton>
              </div>
            </form>
          </FormProvider>
        )}

        {!showForm && (
          <div className="mt-2">
            <GenericTable
              title="Current Terms & Conditions"
              data={termData}
              columns={columns}
              itemsPerPage={15}
              action
              onDelete={handleDelete}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default TermCondition;
