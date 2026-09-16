/*eslint-disable*/
import React, {useEffect, useRef} from 'react';
import {FormProvider, useForm} from 'react-hook-form';
import GenericInputField from '../Forms/Input/GenericInputField';
import GenericButton from '../Forms/Buttons/GenericButton';
import GenericTextArea from '../Forms/TextArea/GenericTextArea';
import {
  useCreateEmployee,
  useGetAllEmployee,
} from '@/lib/react-query/queriesAndMutations/cateror/Employee/employee';
import {createEmployeeValidationSchema} from '@/lib/validation/employeeSchema';
import {zodResolver} from '@hookform/resolvers/zod';
import {z} from 'zod';
import {useAuthContext} from '@/context/AuthContext';
import DisplayEmployee from './DisplayEmployee';
import toast from 'react-hot-toast';
import {useGetCaterorById} from '@/lib/react-query/queriesAndMutations/cateror/dish';

type FormValues = z.infer<typeof createEmployeeValidationSchema>;

const CreateEmploye = () => {
  const {user} = useAuthContext();

  const methods = useForm<FormValues>({
    resolver: zodResolver(createEmployeeValidationSchema),
    defaultValues: {isCounter: 'false'},
  });

  const {data: caterorData} = useGetCaterorById(user?.caterorId!);
  const {data: empData} = useGetAllEmployee();
  console.log('user', user);
  console.log('emp', empData?.data?.length);

  const {mutate: CreateEmployee, isPending, isSuccess} = useCreateEmployee();
  const onSubmit = (data: FormValues) => {
    console.log('====================================');
    console.log('data', data);
    console.log('====================================');
    const plan = user?.plan?.toLowerCase();
    const extra = caterorData?.data?.extraUsers || 0;

    let baseLimit = 0;
    if (plan === 'pro') baseLimit = 1;
    else if (plan === 'premium') baseLimit = 3;
    else if (plan === 'ultrapremium') baseLimit = 5;

    const totalAllowed = baseLimit + extra;
    const current = empData?.data?.length || 0;

    if (current >= totalAllowed) {
      toast.error(
        `You can only add up to ${totalAllowed} employees with the ${user?.plan} plan. Upgrade to add more employees.`,
      );
      return;
    }
    CreateEmployee(
      {
        fullname: data.fullname,
        phoneNumber: data.phoneNo,
        username: data.phoneNo,
        email: data.email,
        password: data.password,
        secondaryPhoneNumber: data.secondaryPhoneNo,
        address: data.address,
        caterorId: user?.caterorId,
        isCounter: data.isCounter === 'true',
      },
      {
        onSuccess: () => {
          methods.reset();
        },
      },
    );
  };

  return (
    <>
      <FormProvider {...methods}>
        <form
          onSubmit={methods.handleSubmit(onSubmit)}
          className="space-y-8 bg-white p-8 dark:bg-black"
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:gap-6">
            <h1 className="col-span-12 mb-4 text-lg font-semibold">
              Create Employee
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
                name="email"
                label="Email"
                placeholder="Enter Email"
              />
            </div>
            <div className="col-span-12 md:col-span-6">
              <GenericInputField
                name="phoneNo"
                label="Phone No"
                placeholder="Enter Phone No"
                type="number"
              />
            </div>
            <div className="col-span-12 md:col-span-6">
              <GenericInputField
                name="secondaryPhoneNo"
                label="Secondary Phone No"
                placeholder="Enter Secondary Phone No"
                type="number"
              />
            </div>
            <div className="col-span-12">
              <label className="text-gray-700 dark:text-gray-300 mb-2 block text-sm font-medium">
                Is Counter Employee?
              </label>
              <div className="flex space-x-6">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="false"
                    defaultChecked
                    {...methods.register('isCounter')}
                    className="border-gray-300 h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-700 dark:text-gray-300 ml-2 text-sm">
                    No
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="true"
                    {...methods.register('isCounter')}
                    className="border-gray-300 h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-700 dark:text-gray-300 ml-2 text-sm">
                    Yes
                  </span>
                </label>
              </div>
            </div>
            <div className="col-span-12 md:col-span-6">
              <GenericInputField
                name="password"
                label="Password"
                placeholder="Enter Password"
                type="text"
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
          <div className="mt-6 flex justify-end space-x-4">
            <GenericButton type="submit" disabled={isPending}>
              {isPending ? 'Saving...' : 'Save'}
            </GenericButton>
          </div>
        </form>
      </FormProvider>
      {/* <div className="mt-6">
      <DisplayEmployee />
      </div> */}
    </>
  );
};

export default CreateEmploye;
