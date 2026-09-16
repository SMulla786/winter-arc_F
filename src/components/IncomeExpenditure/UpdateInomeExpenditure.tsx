import React, {useEffect} from 'react';
import {useForm, FormProvider} from 'react-hook-form';
import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';
import GenericSearchDropdown from '../Forms/SearchDropDown/GenericSearchDropdown';
import GenericInputField from '../Forms/Input/GenericInputField';
import GenericButton from '../Forms/Buttons/GenericButton';
import {updateIncomeSchema} from '@/lib/validation/incomeSchema';
import {
  useGetIncomeExpenseById,
  useUpdateIncomeExpense,
} from '@/lib/react-query/queriesAndMutations/cateror/income';
import {useNavigate, useRouter} from '@tanstack/react-router';
import {Route} from '@/routes/_app/_edit/update.$name.$id';
import {IncomeExpense} from '@/types';

type FormValues = z.infer<typeof updateIncomeSchema>;

interface props {
  id: string;
}

const UpdateInomeExpenditure: React.FC<props> = (props) => {
  const {id} = Route.useParams();
  const navigate = useNavigate();
  const router = useRouter();

  const methods = useForm<FormValues>({
    resolver: zodResolver(updateIncomeSchema),
  });

  const {reset, setValue} = methods;
  const {mutateAsync: updateIncomeExpense, isPending} =
    useUpdateIncomeExpense();
  const {data: incomeExpenseResponse, refetch} = useGetIncomeExpenseById(id);

  useEffect(() => {
    if (incomeExpenseResponse) {
      // Check if date exists and is valid
      let formattedDate = '';

      if (incomeExpenseResponse?.date) {
        try {
          const dateObj = new Date(incomeExpenseResponse.date);
          if (!isNaN(dateObj.getTime())) {
            // Format as YYYY-MM-DD for input type="date"
            const year = dateObj.getFullYear();
            const month = String(dateObj.getMonth() + 1).padStart(2, '0');
            const day = String(dateObj.getDate()).padStart(2, '0');
            formattedDate = `${year}-${month}-${day}`;
          }
        } catch (error) {
          console.error('Error parsing date:', error);
        }
      }

      // Set status based on response
      let statusValue = incomeExpenseResponse?.status;
      // Map the status if needed
      if (incomeExpenseResponse?.status === 'PAYABLE') {
        statusValue = 'EXPENDITURE';
      }

      reset({
        amount: incomeExpenseResponse?.amount || '',
        date: formattedDate, // Use formatted date or empty string
        particular: incomeExpenseResponse?.particular || '',
        status: statusValue || 'INCOME',
      });
    }
  }, [id, incomeExpenseResponse, reset]);

  const onSubmit = async (data: FormValues) => {
    try {
      // Prepare date for submission
      let isoDate = null;
      if (data.date) {
        try {
          const dateObj = new Date(data.date);
          if (!isNaN(dateObj.getTime())) {
            isoDate = dateObj.toISOString();
          }
        } catch (error) {
          console.error('Error formatting date for submission:', error);
        }
      }

      // Call the update function
      await updateIncomeExpense({
        ...data,
        id: id,
        date: isoDate, // Send null if no date, or the ISO string
        amount: data.amount ? String(Number(data.amount)) : '0',
      });

      // Refetch the updated data
      await refetch();

      // Navigate back after successful update
      router.history.back();
    } catch (error) {
      console.error('Error updating income/expenditure:', error);
      // Optionally show an error message to the user
    }
  };

  // Handle date change directly
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue('date', e.target.value, {shouldValidate: true});
  };

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className="space-y-8 bg-white p-8 dark:bg-black"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:gap-6">
          <h1 className="col-span-12 mb-4 text-lg font-semibold">
            Update Income/Expenditure
          </h1>

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
              type="number"
            />
          </div>
          <div className="col-span-12 md:col-span-6">
            <GenericInputField
              type="date"
              name="date"
              label="Date"
              placeholder="Enter the Date"
              onChange={handleDateChange}
            />
          </div>
        </div>

        {/* Form Buttons */}
        <div className="flex justify-end space-x-4">
          <GenericButton
            type="button"
            onClick={() => navigate({to: `/incomeexpenditure`})}
          >
            Cancel
          </GenericButton>
          <GenericButton type="submit" disabled={isPending}>
            {isPending ? 'Saving...' : 'Update'}
          </GenericButton>
        </div>
      </form>
    </FormProvider>
  );
};

export default UpdateInomeExpenditure;
