import React from 'react';
import {useForm, FormProvider, useWatch} from 'react-hook-form';
import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';
import GenericSearchDropdown from '../Forms/SearchDropDown/GenericSearchDropdown';
import GenericInputField from '../Forms/Input/GenericInputField';
import GenericButton from '../Forms/Buttons/GenericButton';
import {incomeSchema} from '@/lib/validation/incomeSchema';
import {useAddIncomeExpense} from '@/lib/react-query/queriesAndMutations/cateror/income';
import {useAuthContext} from '@/context/AuthContext';
import {Route} from '@/routes/_app/_event/events.$id';
import {FiSave} from 'react-icons/fi';
import {Loader} from '../Loader/Loader';
import GenericDropdown from '../Forms/DropDown/GenericDropDown';

type FormValues = z.infer<typeof incomeSchema>;
type SomeComponentProps = {
  setAddNewModal: React.Dispatch<React.SetStateAction<boolean>>;
  setEditIncomeModal: React.Dispatch<React.SetStateAction<boolean>>;
};

const IncomeExpenditure: React.FC<SomeComponentProps> = ({
  setAddNewModal,
  setEditIncomeModal,
}) => {
  const {user} = useAuthContext();
  const {id: EventId} = Route.useParams();
  const methods = useForm<FormValues>({
    resolver: zodResolver(incomeSchema),
  });
  const {reset, control} = methods;
  const {mutateAsync: addIncomeExpense, isPending} = useAddIncomeExpense();

  // 👀 Watch the "status" field
  const selectedStatus = useWatch({control, name: 'status'});

  const onSubmit = async (data: FormValues) => {
    console.log('dataaaaaaaaaaaa', data);
    if (EventId) {
      const finalParticular =
        data.status === 'INCOME' && data.cashType
          ? `${data.particular} (${data.cashType})`
          : data.particular;

      await addIncomeExpense({
        ...data,
        particular: finalParticular,
        eventId: EventId,
        date: new Date(data.date ?? '').toISOString(),
        id: user?.caterorId as string,
        amount: Number(data.amount),
      });

      reset();
      setAddNewModal(false);
      setEditIncomeModal(true);
    }
  };

  if (isPending) {
    return <Loader />;
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 gap-4 bg-white p-4 shadow-sm dark:bg-boxdark md:grid-cols-12 md:gap-6">
          <h1 className="col-span-12 mb-4 bg-gray-2 p-4 text-lg font-semibold dark:bg-meta-4">
            Income/Expenditure
          </h1>

          {/* Income / Expense / Receivable / Payable */}
          <div className="col-span-12 md:col-span-6">
            <GenericSearchDropdown
              name="status"
              label="Income/Expenditure"
              options={[
                {label: 'Income', value: 'INCOME'},
                {label: 'Expense', value: 'EXPENDITURE'},
                {label: 'Recievable', value: 'RECEIVABLE'},
                {label: 'Payable', value: 'PAYABLE'},
              ]}
              defaultOption=""
            />
          </div>

          {/* Particular + CashType (only for INCOME) */}
          <div className="col-span-12 md:col-span-6">
            <div className="flex items-center gap-2">
              <GenericInputField
                name="particular"
                label="Particular"
                placeholder="Enter the Particular"
              />

              {selectedStatus === 'INCOME' && (
                <GenericDropdown
                  name="cashType"
                  label="Cash Type"
                  options={[
                    {label: 'Online', value: 'online'},
                    {label: 'Cash', value: 'cash'},
                  ]}
                  control={methods.control}
                />
              )}
            </div>
          </div>

          {/* Amount */}
          <div className="col-span-12 md:col-span-6">
            <GenericInputField
              name="amount"
              label="Amount"
              placeholder="Enter the Amount"
            />
          </div>

          {/* Date */}
          <div className="col-span-12 md:col-span-6">
            <label
              htmlFor="date"
              className="mb-2 block text-sm text-black dark:text-white"
            >
              Date
            </label>
            <input
              type="date"
              id="date"
              {...methods.register('date')}
              defaultValue={new Date().toISOString().split('T')[0]}
              className="w-full rounded-md border border-stroke px-2 py-1 focus:border-primary focus:ring-indigo-500 active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary dark:disabled:bg-black sm:text-sm"
            />
            {methods.formState.errors.date && (
              <p className="mt-1 text-sm text-red-500">
                {methods.formState.errors.date.message as string}
              </p>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end space-x-2">
          <GenericButton
            type="submit"
            disabled={isPending}
            className="flex items-center"
          >
            {isPending ? (
              <FiSave className="mr-2 animate-spin" />
            ) : (
              <FiSave className="mr-2" />
            )}
            {isPending ? 'Saving...' : 'Save'}
          </GenericButton>
        </div>
      </form>
    </FormProvider>
  );
};

export default IncomeExpenditure;
