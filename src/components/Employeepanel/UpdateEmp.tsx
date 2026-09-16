import React, {useEffect} from 'react';
import {FormProvider, useForm} from 'react-hook-form';
import GenericButton from '../Forms/Buttons/GenericButton';
import GenericInputField from '../Forms/Input/GenericInputField';
import GenericTextArea from '../Forms/TextArea/GenericTextArea';
import {
  useGetEmployeeById,
  useUpdateEmployee,
} from '@/lib/react-query/queriesAndMutations/cateror/Employee/employee';
import {createEmployeeValidationSchema} from '@/lib/validation/employeeSchema';
import {z} from 'zod';
import {useAuthContext} from '@/context/AuthContext';
import {zodResolver} from '@hookform/resolvers/zod';
import {Route} from '@/routes/_app/_employee/updateemployeee.$id';
import {useNavigate} from '@tanstack/react-router';

type FormValues = z.infer<typeof createEmployeeValidationSchema>;

const UpdateEmp = () => {
  const {user} = useAuthContext();
  const navigate = useNavigate();
  const methods = useForm<FormValues>({
    resolver: zodResolver(createEmployeeValidationSchema),
  });

  const {id} = Route.useParams();
  const {mutateAsync: updateEmp, isSuccess, isPending} = useUpdateEmployee();

  const {data: EmpData} = useGetEmployeeById(id);
  console.log('emp', EmpData);

  useEffect(() => {
    if (EmpData) {
      methods.reset({
        fullname: EmpData?.user?.fullname || '',
        email: EmpData?.user?.email || '',
        phoneNo: EmpData?.user?.phoneNumber || '',
        secondaryPhoneNo: EmpData?.user?.secondaryPhoneNumber || '',
        address: EmpData?.address || '',
        isCounter: EmpData?.isCounter ? 'true' : 'false', // Fixed: Convert boolean to string for radio buttons
        password: EmpData?.user?.password || '',
      });
    }
  }, [EmpData, methods]);

  const onSubmit = async (data: FormValues) => {
    try {
      console.log('Submitting data:', data);

      // Convert isCounter back to boolean for API
      const submitData = {
        ...data,
        isCounter: data.isCounter === 'true', // Convert string back to boolean
      };

      await updateEmp({id, data: submitData});

      if (isSuccess) {
        navigate({to: '/createemployee'});
      }
    } catch (error) {
      console.error('Error updating employee:', error);
    }
  };

  // Add form state logging for debugging
  console.log('Form errors:', methods.formState.errors);
  console.log('Form values:', methods.watch());

  return (
    <div className="space-y-4">
      {/* Back Button */}
      <div className="mb-3">
        <button
          type="button"
          className="text-xl font-bold"
          onClick={() => navigate({to: '/createemployee'})}
        >
          ← Back
        </button>
      </div>

      <FormProvider {...methods}>
        <form
          onSubmit={methods.handleSubmit(onSubmit)}
          className="space-y-8 bg-white p-8 dark:bg-black"
        >
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
                    {...methods.register('isCounter')}
                    className="border-gray-300 h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
                    defaultChecked={!EmpData?.isCounter} // Set default checked
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
                    defaultChecked={EmpData?.isCounter} // Set default checked
                  />
                  <span className="text-gray-700 dark:text-gray-300 ml-2 text-sm">
                    Yes
                  </span>
                </label>
              </div>
              {methods.formState.errors.isCounter && (
                <p className="mt-1 text-sm text-red-500">
                  {methods.formState.errors.isCounter.message}
                </p>
              )}
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
          <div className="flex justify-end space-x-4">
            <GenericButton
              type="submit"
              disabled={isPending || !methods.formState.isDirty}
            >
              {isPending ? 'Updating...' : 'Update'}
            </GenericButton>
          </div>
        </form>
      </FormProvider>
    </div>
  );
};

export default UpdateEmp;
