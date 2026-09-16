import React, {useEffect} from 'react';
import {useForm, FormProvider} from 'react-hook-form';
import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';
import GenericButton from '../Forms/Buttons/GenericButton';
import GenericInputField from '../Forms/Input/GenericInputField';
import GenericTextArea from '../Forms/TextArea/GenericTextArea';
import {updateClientValidationSchema} from '@/lib/validation/clientSchemas';
import {useMatch, useNavigate} from '@tanstack/react-router';
import {
  useGetClientById,
  useUpdateClient,
} from '@/lib/react-query/queriesAndMutations/cateror/client';
import {format, parseISO} from 'date-fns';

type FormValues = z.infer<typeof updateClientValidationSchema>;

const UpdateClient: React.FC = () => {
  const navigate = useNavigate();
  /* eslint-disable */
  const {params} = useMatch('/_app/_edit/update/client/$id' as any);
  const {id = ''} = params as {id: string};

  const methods = useForm<FormValues>({
    resolver: zodResolver(updateClientValidationSchema),
  });

  const {setValue} = methods;

  // Fetch client data by ID
  const {data: client, isSuccess} = useGetClientById(id);

  // Use the update client mutation
  const {
    mutate: UpdateClient,
    isPending,
    isSuccess: isUpdateSuccess,
    isError,
    error,
  } = useUpdateClient();

  // Set form values when client data is successfully fetched
  useEffect(() => {
    if (isSuccess && client) {
      console.log('Client data:', client); // Debugging
      setValue('fullname', client.name || '');
      setValue('caste', client.caste || '');
      setValue('address', client.address || '');
      setValue('email', client.email || '');
      setValue('phoneNo', client.phoneNumber || '');
      setValue('secondaryPhoneNo', client.secondaryPhoneNumber || '');
      setValue('panNumber', client.panNumber || '');
      setValue('gstNumber', client.gstNumber || '');
      setValue('companyName', client.companyName || '');
      setValue('companyAddress', client.companyAddress || '');

      // Format birthDate (client.birthday) for input type="date"
      if (client?.birthday) {
        try {
          const formattedbirthday = format(
            parseISO(client.birthday),
            'yyyy-MM-dd',
          );
          setValue('birthday', formattedbirthday);
        } catch (e) {
          console.error('Error formatting birthDate:', e);
          setValue('birthday', '');
        }
      } else {
        setValue('birthday', '');
      }

      // Format anniversary for input type="date"
      if (client?.anniversary) {
        try {
          const formattedanniversary = format(
            parseISO(client.anniversary),
            'yyyy-MM-dd',
          );
          setValue('anniversary', formattedanniversary);
        } catch (e) {
          console.error('Error formatting anniversary:', e);
          setValue('anniversary', '');
        }
      } else {
        setValue('anniversary', '');
      }
    }
  }, [isSuccess, client, setValue]);

  // Handle form submission
  const onSubmit = (data: FormValues) => {
    console.log('Form submitted:', data);

    const updateData: Omit<FormValues, 'secondaryPhoneNo' | 'caste'> & {
      secondaryPhoneNumber?: string;
      caste?: string;
      birthday?: string; // Map to API field
      anniversary?: string;
      panNumber?: string;
      gstNumber?: string;
      companyName?: string;
      companyAddress?: string;
    } = {
      fullname: data.fullname,
      address: data.address,
      phoneNo: data.phoneNo,
      email: data.email,
      birthday: data.birthday || undefined, // Map birthDate to birthday
      anniversary: data.anniversary || undefined,
      panNumber: data.panNumber || undefined,
      gstNumber: data.gstNumber || undefined,
      companyName: data.companyName || undefined,
      companyAddress: data.companyAddress || undefined,
    };

    if (data.caste) {
      updateData.caste = data.caste;
    }
    if (data.secondaryPhoneNo) {
      updateData.secondaryPhoneNumber = data.secondaryPhoneNo;
    }

    console.log('Update data:', updateData);
    UpdateClient({
      id,
      data: updateData,
    });
    navigate({to: `/client`});
  };

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className="space-y-8 bg-white p-8 dark:bg-black"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:gap-6">
          <h1 className="col-span-12 mb-4 text-lg font-semibold">
            Update Client
          </h1>

          <div className="col-span-12 md:col-span-6">
            <GenericInputField
              name="fullname"
              label="Client Name"
              placeholder="Enter Client Name"
            />
          </div>
          <div className="col-span-12 md:col-span-6">
            <GenericInputField
              name="caste"
              label="Caste"
              placeholder="Enter Caste"
            />
          </div>
          <div className="col-span-12 md:col-span-6">
            <GenericInputField
              name="phoneNo"
              label="Phone No"
              placeholder="Enter Phone No"
            />
          </div>
          <div className="col-span-12 md:col-span-6">
            <GenericInputField
              name="secondaryPhoneNo"
              label="Secondary Phone No"
              placeholder="Enter Secondary Phone No"
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
              name="birthday"
              label="BirthDay"
              placeholder="Select Birthday"
              type="date"
            />
          </div>
          <div className="col-span-12 md:col-span-6">
            <GenericInputField
              name="anniversary"
              label="Anniversary Date"
              placeholder="Select Anniversary Date"
              type="date"
            />
          </div>
          <div className="col-span-12 md:col-span-6">
            <GenericInputField
              name="panNumber"
              label="Pan Number"
              placeholder="Enter Pan Number"
            />
          </div>

          <div className="col-span-12 md:col-span-6">
            <GenericInputField
              name="gstNumber"
              label="GST Number"
              placeholder="Enter GST Number"
            />
          </div>
          <div className="col-span-12 md:col-span-6">
            <GenericInputField
              name="companyName"
              label="Company Name"
              placeholder="Enter Company Name"
            />
          </div>
          <div className="col-span-12 md:col-span-6">
            <GenericInputField
              name="companyAddress"
              label="Company Address"
              placeholder="Enter Company Address"
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
            type="button"
            onClick={() => navigate({to: `/client`})}
          >
            Cancel
          </GenericButton>
          <GenericButton type="submit" disabled={isPending}>
            {isPending ? 'Updating...' : 'Update'}
          </GenericButton>
        </div>
      </form>
    </FormProvider>
  );
};

export default UpdateClient;
