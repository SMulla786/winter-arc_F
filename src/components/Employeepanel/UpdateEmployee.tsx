/*eslint-disable*/
import React from 'react';
import {FormProvider, useForm} from 'react-hook-form';
import GenericButton from '../Forms/Buttons/GenericButton';
import GenericInputField from '../Forms/Input/GenericInputField';
import GenericTextArea from '../Forms/TextArea/GenericTextArea';
import {useUpdateEmployee} from '@/lib/react-query/queriesAndMutations/cateror/Employee/employee';
import {useNavigate} from '@tanstack/react-router';

const UpdateEmployee = () => {
  const methods = useForm();
  const {mutate, isSuccess} = useUpdateEmployee();
  const navigate = useNavigate();
  const onSubmit = (data: any) => {
    mutate(data);
    if (isSuccess) {
      methods.reset({
        fullname: '',
        phoneNo: '',
        secondaryPhoneNo: '',
        address: '',
      });
    }
  };
  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:gap-6">
          <h1 className="col-span-12 mb-4 text-lg font-semibold">
            Update Employee
          </h1>

          <div className="col-span-12 md:col-span-6">
            <GenericInputField
              name="fullname"
              label="Full Name"
              placeholder="Enter Full Name"
            />
          </div>

          <div className="col-span-12 md:col-span-6">
            <GenericInputField
              name="phoneNo"
              label="Phone No"
              placeholder="Enter Phone No"
              type="number"
              className="w-full rounded-md border border-stroke px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-300 dark:border-strokedark dark:bg-black"
            />
          </div>
          <div className="col-span-12 md:col-span-6">
            <GenericInputField
              name="secondaryPhoneNo"
              label="Secondary Phone No"
              placeholder="Enter Secondary Phone No"
              type="number"
              className="w-full rounded-md border border-stroke px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-300 dark:border-strokedark dark:bg-black"
            />
          </div>
          <div className="col-span-12 md:col-span-12">
            <GenericTextArea
              name="address"
              label="Address"
              placeholder="Enter Address"
            />
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

export default UpdateEmployee;
