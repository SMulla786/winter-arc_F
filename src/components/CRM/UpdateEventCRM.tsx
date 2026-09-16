/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import {FormProvider} from 'react-hook-form';
import GenericButton from '../Forms/Buttons/GenericButton';
import GenericDropdown from '../Forms/DropDown/GenericDropDown';
import GenericInputField from '../Forms/Input/GenericInputField';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {z} from 'zod';
import {eventCRM} from '@/lib/validation/crmSchema';
import {
  useUpdateEventCRM,
  useGetEventCRMData,
} from '@/lib/react-query/queriesAndMutations/cateror/CRM/crm';
import {useGetCRMData} from '@/lib/react-query/queriesAndMutations/cateror/CRM/crm';

type FormValues = z.infer<typeof eventCRM>;

const UpdateEventCRM = () => {
  const methods = useForm<FormValues>({
    resolver: zodResolver(eventCRM),
    defaultValues: {
      processId: '',
      note: '',
      followupDate: '',
    },
  });

  const {
    control,
    handleSubmit,
    formState: {isSubmitting},
  } = methods;

  const {mutate: updateEventCRM} = useUpdateEventCRM();

  // Fetch CRM processes
  const {data: apiResponse} = useGetCRMData();

  const {data: getEventCRMData} = useGetEventCRMData(
    'ae649040-a432-416a-b458-b3a4a206cecb',
  );

  const crmOptions =
    apiResponse?.data?.map((item: any) => ({
      value: item.id,
      label: item.name,
    })) ?? [];

  // Submit handler
  const onSubmit = (data: FormValues) => {
    console.log('Submitting:', data);

    updateEventCRM({
      eventId: 'ae649040-a432-416a-b458-b3a4a206cecb',
      data: {
        processId: data.processId,
        note: data.note,
        followupDate: data.followupDate,
      },
    });
  };

  return (
    <div className="dark:bg-gray-900 rounded-lg bg-white p-6 shadow">
      <h2 className="mb-6 text-xl font-semibold">Add Event CRM</h2>

      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* CRM Dropdown */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
            <GenericDropdown
              name="processId"
              control={control}
              options={crmOptions}
              placeholder="Select CRM Process"
              label="CRM Process"
            />

            {/* Note Input */}
            <GenericInputField
              name="note"
              label="Note"
              placeholder="Enter follow-up note"
            />

            <div className="col-span-2 md:col-span-6">
              <label
                htmlFor="date"
                className="mb-2 block text-sm text-black dark:text-white"
              >
                Date
              </label>
              <input
                type="date"
                id="followupDate"
                {...methods.register('followupDate')}
                defaultValue={new Date().toISOString().split('T')[0]}
                className="w-full rounded-md border border-stroke px-2 py-1 focus:border-primary focus:ring-indigo-500 active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary dark:disabled:bg-black sm:text-sm"
              />
              {methods.formState.errors.followupDate && (
                <p className="mt-1 text-sm text-red-500">
                  {methods.formState.errors.followupDate.message as string}
                </p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <GenericButton
              type="submit"
              disabled={isSubmitting}
              className="w-full md:w-auto"
            >
              {isSubmitting ? 'Submitting...' : 'Add CRM Event'}
            </GenericButton>
          </div>
        </form>
      </FormProvider>
    </div>
  );
};

export default UpdateEventCRM;
