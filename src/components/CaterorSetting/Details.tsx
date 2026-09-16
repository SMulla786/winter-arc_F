import React, {useEffect, useRef} from 'react';
import {useForm, FormProvider} from 'react-hook-form';
import GenericInputField from '../Forms/Input/GenericInputField';
import GenericButton from '../Forms/Buttons/GenericButton';
import {useAddDetails} from '@/lib/react-query/queriesAndMutations/cateror/details';

export type FormValues = {
  name: string;
  email: string;
  phone: string;
  address: string;
};

const Details: React.FC = () => {
  const methods = useForm<FormValues>({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      address: '',
    },
  });

  const {handleSubmit, reset} = methods;

  const {mutateAsync: addDetails, isPending, isSuccess} = useAddDetails();

  const onSubmit = async (data: FormValues) => {
    addDetails(data);
  };

  return (
    // <div className="mx-auto mt-10 px-4 sm:px-6 lg:px-8">
    // <div className="rounded-xl border border-neutral-200 bg-white shadow-md dark:border-black dark:bg-black">
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-8 bg-white p-8 dark:bg-black"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:gap-2">
          <div className="col-span-12 md:col-span-4">
            <GenericInputField
              name="name"
              label="Name"
              placeholder="Enter your Full Name"
            />
          </div>
          <div className="col-span-12 md:col-span-4">
            <GenericInputField
              name="email"
              label="Email"
              type="email"
              placeholder="Enter Email"
            />
          </div>
          <div className="col-span-12 md:col-span-4">
            <GenericInputField
              name="phone"
              label="Phone"
              type="tel"
              placeholder="Enter Phone Number"
            />
          </div>
          <div className="col-span-12 md:col-span-4">
            <GenericInputField
              name="address"
              label="Address"
              placeholder="Enter Address"
            />
          </div>
        </div>

        <div className="flex justify-end md:col-span-2">
          <GenericButton type="submit" disabled={isPending}>
            {isPending ? 'Saving...' : 'Save'}
          </GenericButton>
        </div>
      </form>
    </FormProvider>
    // </div>
    // </div>
  );
};

export default Details;
