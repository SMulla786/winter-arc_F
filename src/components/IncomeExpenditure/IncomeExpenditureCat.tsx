import React, {useEffect, useRef} from 'react';
import {useForm, FormProvider} from 'react-hook-form';
import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';
import GenericSearchDropdown from '../Forms/SearchDropDown/GenericSearchDropdown';
import GenericInputField from '../Forms/Input/GenericInputField';
import GenericButton from '../Forms/Buttons/GenericButton';
import {incomeSchema} from '@/lib/validation/incomeSchema';
import {useAddIncomeExpense} from '@/lib/react-query/queriesAndMutations/cateror/income';
import {useAuthContext} from '@/context/AuthContext';
import {useGetAllEvents} from '@/lib/react-query/queriesAndMutations/cateror/event';
import {Loader} from '../Loader/Loader';

type FormValues = z.infer<typeof incomeSchema>;

const IncomeExpenditureCat: React.FC = () => {
  const {user} = useAuthContext();
  const methods = useForm<FormValues>({
    resolver: zodResolver(incomeSchema),
    defaultValues: {
      particular: '',
      date: new Date().toISOString().split('T')[0],
    },
  });

  //const {reset} = methods;

  const {
    mutateAsync: addIncomeExpense,
    isPending,
    isSuccess,
  } = useAddIncomeExpense();
  const {data: EventsData} = useGetAllEvents();
  const filteredEvents = EventsData?.data?.events?.map((event) => ({
    label: `${event.name} (${event.client.fullname})`,
    value: event.id,
  }));

  const {reset} = methods;

  const onSubmit = async (data: FormValues) => {
    console.log('dataaaaaaaaaa', data);
    const payload = {
      ...data,
      date: new Date(data.date).toISOString() || '',
      id: user?.caterorId as string,
      amount: Number(data.amount),
    };
    if (data.eventId) {
      await addIncomeExpense({...payload, eventId: data.eventId});
    } else {
      await addIncomeExpense(payload);
    }
    reset();
  };

  if (isPending) {
    return <Loader />;
  }
  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className="space-y-8 bg-white p-8 dark:bg-black"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:gap-6">
          <h1 className="col-span-12 mb-4 text-lg font-semibold">
            Income/Expenditure
          </h1>

          <div className="col-span-12 md:col-span-12">
            <GenericSearchDropdown
              name="eventId"
              label="Select Event"
              options={filteredEvents}
              defaultOption=""
            />
          </div>
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

          <div className="col-span-12 md:col-span-6">
            <GenericInputField
              name="particular"
              label="Particular"
              placeholder="Enter the Particular"
            />
          </div>

          <div className="col-span-12 md:col-span-6">
            <GenericInputField
              name="amount"
              label="Amount"
              placeholder="Enter the Amount"
            />
          </div>

          {/* <div className="col-span-12 md:col-span-6">
            <GenericInputField
              type="date"
              name="date"
              label="Date"
              placeholder="Enter the Date"
              className="!block w-full"
              defaultValue={new Date().toISOString().split('T')[0]}
            />
          </div> */}

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

        {/* Form Buttons */}
        <div className="flex justify-end space-x-4">
          <GenericButton type="submit" disabled={isPending}>
            {isPending ? 'Saving...' : 'Save'}
          </GenericButton>
        </div>
      </form>
    </FormProvider>
  );
};

export default IncomeExpenditureCat;
