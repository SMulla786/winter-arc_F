import React, {useEffect, useState} from 'react';
import {useForm, FormProvider} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import GenericInputField from '../Forms/Input/GenericInputField';
import GenericTextArea from '../Forms/TextArea/GenericTextArea';
import GenericSearchDropdown from '../Forms/SearchDropDown/GenericSearchDropdown';
import GenericButton from '../Forms/Buttons/GenericButton';

import {useGetLanguages} from '@/lib/react-query/queriesAndMutations/admin/languages';
import {
  useGetCaterorById,
  useUpdateCateror,
} from '@/lib/react-query/queriesAndMutations/admin/cateror';
import {useNavigate} from '@tanstack/react-router';

import {updatecaterorSchema} from '@/lib/validations/cateror.validation';

type FormValues = z.infer<typeof updatecaterorSchema>;

interface Props {
  id: string;
}

interface Language {
  id: string;
  name: string;
}

const UpdateCateror: React.FC<Props> = ({id}: Props) => {
  const navigate = useNavigate();

  const methods = useForm<FormValues>({
    resolver: zodResolver(updatecaterorSchema),
    mode: 'onChange', // Better UX - validates while typing
    defaultValues: {
      refId: '',
      password: '',
      extraUsers: 0,
      amount: 0,
      renewalAmount: 0,
    },
  });

  const [languageOptions, setLanguageOptions] = useState<
    {label: string; value: string}[]
  >([]);

  const {data: languages} = useGetLanguages();
  const {data: caterorData, isLoading, error} = useGetCaterorById(id);
  const {mutate: updateCateror, isPending} = useUpdateCateror();

  // Populate language dropdown
  useEffect(() => {
    if (languages) {
      const options = languages.map((lang: Language) => ({
        label: lang.name,
        value: lang.id,
      }));
      setLanguageOptions(options);
    }
  }, [languages]);

  // Reset form when data is loaded
  useEffect(() => {
    if (caterorData?.data) {
      const d = caterorData.data;

      methods.reset({
        fullname: d.fullname || '',
        phoneNumber: d.phoneNumber || '',
        address: d.address || '',
        email: d.email || '',
        plan: d.plan || '',
        extraUsers: d.extraUsers ?? 0,
        city: d.city || '',
        state: d.state || '',
        languageId: d.languageId || '', // Software Language
        dataLanguageId: d.dataLanguageId || '', // Data Language (adjust if your backend uses different key)
        amount: d.amount ?? 0,
        renewalAmount: d.renewalAmount ?? 0,
        startDate: d.startDate
          ? new Date(d.startDate).toISOString().split('T')[0]
          : '',
        expiryDate: d.expiryDate
          ? new Date(d.expiryDate).toISOString().split('T')[0]
          : '',
        username: d.username || '',
        refId: d.refId || '',
        password: '', // Don't prefill password for security
      });
    }
  }, [caterorData, methods]);

  const onSubmit = (data: FormValues) => {
    updateCateror(
      {
        id,
        data: {
          ...data,
          startDate: new Date(data.startDate).toISOString(),
          expiryDate: new Date(data.expiryDate).toISOString(),
          refId: data.refId?.trim() || undefined, // Send undefined if empty
        },
      },
      {
        onSuccess: () => {
          navigate({to: '/admin/cateror'});
        },
        onError: (err) => {
          console.error('Update failed:', err);
          // You can show toast here
        },
      },
    );
  };

  if (isLoading) return <p className="p-8">Loading cateror data...</p>;
  if (error)
    return <p className="p-8 text-red-500">Error loading cateror data</p>;

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className="space-y-8 bg-white p-8 dark:bg-black"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:gap-6">
          <h1 className="col-span-12 mb-4 text-lg font-semibold">
            Update Cateror
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
              name="phoneNumber"
              label="Phone Number"
              placeholder="Enter Phone Number"
            />
          </div>

          <div className="col-span-12">
            <GenericTextArea
              name="address"
              label="Residential Address"
              placeholder="Enter Residential Address"
            />
          </div>

          <div className="col-span-12 md:col-span-6">
            <GenericSearchDropdown
              name="state"
              label="State"
              options={[
                {label: 'Andhra Pradesh', value: 'Andhra Pradesh'},
                {label: 'Arunachal Pradesh', value: 'Arunachal Pradesh'},
                {label: 'Assam', value: 'Assam'},
                {label: 'Bihar', value: 'Bihar'},
                {label: 'Chhattisgarh', value: 'Chhattisgarh'},
                {label: 'Goa', value: 'Goa'},
                {label: 'Gujarat', value: 'Gujarat'},
                {label: 'Haryana', value: 'Haryana'},
                {label: 'Himachal Pradesh', value: 'Himachal Pradesh'},
                {label: 'Jharkhand', value: 'Jharkhand'},
                {label: 'Karnataka', value: 'Karnataka'},
                {label: 'Kerala', value: 'Kerala'},
                {label: 'Madhya Pradesh', value: 'Madhya Pradesh'},
                {label: 'Maharashtra', value: 'Maharashtra'},
                {label: 'Manipur', value: 'Manipur'},
                {label: 'Meghalaya', value: 'Meghalaya'},
                {label: 'Mizoram', value: 'Mizoram'},
                {label: 'Nagaland', value: 'Nagaland'},
                {label: 'Odisha', value: 'Odisha'},
                {label: 'Punjab', value: 'Punjab'},
                {label: 'Rajasthan', value: 'Rajasthan'},
                {label: 'Sikkim', value: 'Sikkim'},
                {label: 'Tamil Nadu', value: 'Tamil Nadu'},
                {label: 'Telangana', value: 'Telangana'},
                {label: 'Tripura', value: 'Tripura'},
                {label: 'Uttar Pradesh', value: 'Uttar Pradesh'},
                {label: 'Uttarakhand', value: 'Uttarakhand'},
                {label: 'West Bengal', value: 'West Bengal'},
                {
                  label: 'Andaman and Nicobar Islands',
                  value: 'Andaman and Nicobar Islands',
                },
                {label: 'Chandigarh', value: 'Chandigarh'},
                {
                  label: 'Dadra and Nagar Haveli and Daman and Diu',
                  value: 'Dadra and Nagar Haveli and Daman and Diu',
                },
                {label: 'Lakshadweep', value: 'Lakshadweep'},
                {label: 'Delhi', value: 'Delhi'},
                {label: 'Puducherry', value: 'Puducherry'},
              ]}
              defaultOption=""
            />
          </div>

          <div className="col-span-12 md:col-span-6">
            <GenericInputField
              name="city"
              label="City"
              placeholder="Enter City"
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
            <GenericSearchDropdown
              name="plan"
              label="Plan"
              options={[
                {label: 'FREE', value: 'FREE'},
                {label: 'BASIC', value: 'BASIC'},
                {label: 'PRO', value: 'PRO'},
                {label: 'PREMIUM', value: 'PREMIUM'},
                {label: 'ULTRAPREMIUM', value: 'ULTRAPREMIUM'},
              ]}
              defaultOption=""
            />
          </div>

          <div className="col-span-12 md:col-span-3">
            <GenericInputField
              name="extraUsers"
              label="Extra Users"
              type="number"
              placeholder="0"
            />
          </div>

          <div className="col-span-12 md:col-span-6">
            <GenericSearchDropdown
              name="languageId"
              label="Software Language"
              options={languageOptions}
              defaultOption=""
            />
          </div>

          <div className="col-span-12 md:col-span-6">
            <GenericSearchDropdown
              name="languageId"
              label="Data Language"
              options={languageOptions}
              defaultOption=""
            />
          </div>

          <div className="col-span-12 md:col-span-3">
            <GenericInputField
              name="amount"
              label="Amount"
              type="number"
              placeholder="Enter Amount"
            />
          </div>

          <div className="col-span-12 md:col-span-3">
            <GenericInputField
              name="renewalAmount"
              label="Renewal Amount"
              type="number"
              placeholder="Enter Renewal Amount"
            />
          </div>

          <div className="col-span-12 md:col-span-6">
            <GenericInputField
              name="startDate"
              label="Start Date"
              type="date"
            />
          </div>

          <div className="col-span-12 md:col-span-6">
            <GenericInputField
              name="expiryDate"
              label="Expiry Date"
              type="date"
            />
          </div>

          <div className="col-span-12 md:col-span-6">
            <GenericInputField
              name="refId"
              label="Referrer ID (Optional)"
              placeholder="Enter Referrer ID"
            />
          </div>

          <div className="col-span-12 md:col-span-6">
            <GenericInputField
              name="username"
              label="Username"
              placeholder="Enter Username"
            />
          </div>

          <div className="col-span-12 md:col-span-6">
            <GenericInputField
              name="password"
              label="Password"
              type="password"
              placeholder="Enter new Password (leave blank to keep current)"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <GenericButton type="submit" disabled={isPending}>
            {isPending ? 'Updating...' : 'Save Changes'}
          </GenericButton>
        </div>
      </form>
    </FormProvider>
  );
};

export default UpdateCateror;
