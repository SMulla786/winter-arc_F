import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';
import {update} from 'lodash';
import React, {useEffect, useState} from 'react';
import {Form, FormProvider, useForm} from 'react-hook-form';
import {IoMdArrowRoundBack} from 'react-icons/io';
import GenericInputField from '../Forms/Input/GenericInputField';
import GenericButton from '../Forms/Buttons/GenericButton';
import {useCreateDisplayVendor} from '@/lib/react-query/queriesAndMutations/cateror/displayVendor';
import CreateVendorDisplays from './CreateVendorDisplays';

type DisplayVendorFormProps = {
  // vendor: any;
  onClose: () => void;
};

const createVendorSchema = z.object({
  vendorName: z.string().min(1, 'Vendor Name is required'),
  phone: z.string().min(1, 'Phone number is required'),
  address: z.string().optional(),
});

type postResponseProps = {
  id: string;
  name: string;
  phone: string;
  address: string;
};

type VendorFormValues = z.infer<typeof createVendorSchema>;
const DisplayVendorForm: React.FC<DisplayVendorFormProps> = ({
  // vendor,
  onClose,
}) => {
  const methods = useForm<VendorFormValues>({
    resolver: zodResolver(createVendorSchema),
    defaultValues: {
      vendorName: '',
      phone: '',
      address: '',
    },
  });

  const [postResponse, setPostResponse] = useState<postResponseProps>();
  const {reset} = methods;
  const {mutateAsync: addDisplayVendor, isPending} = useCreateDisplayVendor();

  // useEffect(()=>{
  //   reset(      vendorName=postResponse?.name,
  //   )
  // },postResponse)

  useEffect(() => {
    if (postResponse) {
      reset({
        vendorName: postResponse?.name || '',
        phone: postResponse?.phone || '',
        address: postResponse?.address || '',
      });
    }
  }, [postResponse, reset]);

  const onSubmit = async (data: VendorFormValues) => {
    console.log('Form Data:', data);
    // Handle form submission logic here
    const response = await addDisplayVendor({
      name: data.vendorName,
      phone: data.phone,
      address: data.address,
    });
    setPostResponse(response);
    console.log('RES', response);
  };
  return (
    // <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div className="rounded-sm border border-stroke bg-white px-4 pb-2 pt-4 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-6">
      <div className="mb-4 flex items-center">
        <span className="cursor-pointer px-2" onClick={onClose}>
          <IoMdArrowRoundBack />
        </span>
        <h2 className="text-xl font-bold">Create Vendor</h2>
      </div>
      <FormProvider {...methods}>
        {/* <form
          onSubmit={methods.handleSubmit((data) => {
            console.log('Form Data:', data);
            // Handle form submission logic here
          })}
          className="space-y-6"
        >
          <div className="grid grid-cols-4 gap-4 md:grid-cols-3">
          <div>
            <label className="mb-1 block font-medium">Vendor Name</label>
            <input
              type="text"
              className="border-gray-300 w-full rounded border px-3 py-2 focus:border-blue-500 focus:outline-none"
              name="vendorName"
            />
          </div>
          <div>
            <label className="mb-1 block font-medium">Phone</label>
            <input
              type="text"
              className="border-gray-300 w-full rounded border px-3 py-2 focus:border-blue-500 focus:outline-none"
              name="phone"
              // defaultValue={}
            />
          </div>
          <div>
            <label className="mb-1 block font-medium">Address</label>
            <input
              type="text"
              className="border-gray-300 w-full rounded border px-3 py-2 focus:border-blue-500 focus:outline-none"
              name="address"
              defaultValue={vendor.address || ''}
            />
          </div>
          </div>
          <button
            type="submit"
            className="rounded bg-blue-500 px-4 py-2 text-white"
          >
            Update Vendor
          </button>
        </form> */}

        <form
          onSubmit={methods.handleSubmit(onSubmit)}
          className="space-y-2 bg-white dark:bg-black"
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <GenericInputField
              name="vendorName"
              label="Vendor Name"
              placeholder="Enter vendor name"
            />

            <GenericInputField
              name="phone"
              label="Phone"
              placeholder="Enter contact number"
            />

            <GenericInputField
              name="address"
              label="Address"
              placeholder="Enter address"
            />
          </div>

          <div className="flex justify-end">
            <GenericButton type="submit">
              {isPending ? 'Creating...' : 'Create Vendor'}
            </GenericButton>
          </div>
        </form>
      </FormProvider>

      <CreateVendorDisplays onClose={onClose} postResponse={postResponse} />
    </div>
  );
};

export default DisplayVendorForm;
