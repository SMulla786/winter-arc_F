import React, {useState, useEffect} from 'react';
import {FormProvider, useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {z} from 'zod';
import {caterorId} from '@/lib/contants';
import GenericInputField from '@/components/Forms/Input/GenericInputField';
import GenericButton from '@/components/Forms/Buttons/GenericButton';
import {useAddVendorManpower} from '@/lib/react-query/queriesAndMutations/cateror/vendorManpower';
import {useAuthContext} from '@/context/AuthContext';

// Zod schema
const vendorSchema = z.object({
  vendorName: z.string().min(1, 'Vendor name is required'),
  mobile: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Invalid Indian phone number format'),
  address: z.string(),
});

type FormValues = z.infer<typeof vendorSchema>;

interface VendorAddPopupProps {
  onClose: () => void;
  onVendorAdded: () => void;
}

const VendorAddPopup = ({onClose, onVendorAdded}: VendorAddPopupProps) => {
  const {user} = useAuthContext();
  const restriction = user?.employeeRestriction?.vendorPage;
  const role = user?.role;
  const {
    mutate: addVendorManpower,
    isSuccess,
    isError,
  } = useAddVendorManpower();

  const methods = useForm<FormValues>({
    resolver: zodResolver(vendorSchema),
    defaultValues: {
      vendorName: '',
      mobile: '',
      address: '',
    },
  });

  // Add useEffect to handle success state
  useEffect(() => {
    if (isSuccess) {
      onVendorAdded(); // Notify parent that vendor was added
      methods.reset(); // Reset the form
    }
  }, [isSuccess, onVendorAdded, methods]);

  const onSubmit = (data: FormValues) => {
    if (!caterorId) {
      console.error('Cateror ID is missing');
      return;
    }

    addVendorManpower({
      name: data.vendorName,
      phone: data.mobile,
      address: data.address,
      caterorId,
    });
  };

  return (
    <>
      <div className="bg-white p-8 dark:bg-black">
        {(role === 'CATEROR' || restriction === 'EDIT') && (
          <FormProvider {...methods}>
            <form
              onSubmit={methods.handleSubmit(onSubmit)}
              className="space-y-6"
            >
              <div className="mb-4 flex items-center justify-between">
                <h1 className="text-lg font-semibold">Vendor Details</h1>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:gap-6">
                <div className="col-span-12 md:col-span-6">
                  <GenericInputField
                    name="vendorName"
                    label="Vendor Name"
                    placeholder="Enter Vendor name"
                  />
                </div>
                <div className="col-span-12 md:col-span-6">
                  <GenericInputField
                    name="mobile"
                    label="Mobile Number"
                    placeholder="Enter Mobile Number"
                  />
                </div>
                <div className="col-span-12 md:col-span-6">
                  <GenericInputField
                    name="address"
                    label="Address"
                    placeholder="Enter Address"
                  />
                </div>
              </div>

              {isError && (
                <div className="text-sm text-red-500">
                  Error adding vendor. Please try again.
                </div>
              )}

              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="border-gray-300 hover:bg-gray-50 rounded-md border px-4 py-2 text-sm"
                >
                  Cancel
                </button>
                <GenericButton
                  type="submit"
                  disabled={methods.formState.isSubmitting}
                >
                  {methods.formState.isSubmitting ? 'Saving...' : 'Save Vendor'}
                </GenericButton>
              </div>
            </form>
          </FormProvider>
        )}
      </div>
    </>
  );
};

export default VendorAddPopup;
