import SubEventList from '@/components/Event/SubEventList';
import GenericButton from '@/components/Forms/Buttons/GenericButton';
import GenericInputField from '@/components/Forms/Input/GenericInputField';
import GenericTextArea from '@/components/Forms/TextArea/GenericTextArea';
import Select from '@/components/Select';
import {useCreateSubevent} from '@/lib/react-query/queriesAndMutations/cateror/event';
import {CreateSubEventSchema} from '@/lib/validation/eventSchema';
import {zodResolver} from '@hookform/resolvers/zod';
import React from 'react';
import {FormProvider, Controller, useForm} from 'react-hook-form';
import {z} from 'zod';

export type SubEventFormValues = z.infer<typeof CreateSubEventSchema>;

const ManPowerRatelist = () => {
  const methods = useForm<SubEventFormValues>({
    resolver: zodResolver(CreateSubEventSchema),
    defaultValues: {
      subEventName: '',
      date: '',
      time: '',
      dishes: {},
    },
  });

  //   const {
  //     mutate: createSubevent,
  //     isPending,
  //     isSuccess,
  //     isError,
  //   } = useCreateSubevent();

  const onSubmit = (data: SubEventFormValues) => console.log(data);
  return (
    <>
      <FormProvider {...methods}>
        <form
          onSubmit={methods.handleSubmit(onSubmit)}
          className="space-y-8 bg-white p-8 dark:bg-black"
        >
          {/* Form Title */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:gap-6">
            <h1 className="col-span-12 mb-4 text-lg font-semibold">
              Salary Page
            </h1>

            <div className="col-span-12 md:col-span-4">
              <GenericInputField
                name="manpower"
                label="Total Manpower"
                placeholder="Enter Total Manpower"
                type="number"
              />
            </div>

            <div className="col-span-12 md:col-span-4">
              <GenericInputField
                name="waiter"
                label="Waiters"
                placeholder="Enter Number of Waiters"
                type="number"
              />
            </div>

            <div className="col-span-12 md:col-span-4">
              <GenericInputField
                name="waitress"
                label="Waitresses"
                placeholder="Enter Number of Waitresses"
                type="number"
              />
            </div>

            <div className="col-span-12 md:col-span-4">
              <GenericInputField
                name="washers"
                label="Washers"
                placeholder="Enter Number of Washers"
                type="number"
              />
            </div>

            <div className="col-span-12 md:col-span-4">
              <GenericInputField
                name="cooks"
                label="Cooks"
                placeholder="Enter Number of Cooks"
                type="number"
              />
            </div>

            <div className="col-span-12 md:col-span-4">
              <GenericInputField
                name="helpers"
                label="Helpers"
                placeholder="Enter Number of Helpers"
                type="number"
              />
            </div>
          </div>

          {/* Form Buttons */}
          <div className="flex justify-end space-x-4">
            <GenericButton type="submit">
              {' '}
              Submit
              {/* {isPending ? 'Submitting...' : 'Submit'} */}
            </GenericButton>
          </div>
        </form>
      </FormProvider>
      <div className="mt-4">
        <SubEventList />
      </div>
    </>
  );
};

export default ManPowerRatelist;
