import React, {useEffect, useRef} from 'react';
import z from 'zod';
import {useForm, FormProvider} from 'react-hook-form';

import {rawMaterialValidationSchema} from '@/lib/validation/dishSchemas';
import {
  useAddRawMaterialCateror,
  useGetRawMaterialCategoriesCat,
} from '@/lib/react-query/queriesAndMutations/cateror/dish';
import {useAuthContext} from '@/context/AuthContext';
import GenericInputField from '@/components/Forms/Input/GenericInputField';
import GenericSearchDropdown from '@/components/Forms/SearchDropDown/GenericSearchDropdown';
import GenericButton from '@/components/Forms/Buttons/GenericButton';
import {useNavigate} from '@tanstack/react-router';
import { Loader } from 'lucide-react';

// import toast from 'react-hot-toast';

type FormValues = z.infer<typeof rawMaterialValidationSchema>;

const AddRawMaterialNew: React.FC = () => {
  const {user} = useAuthContext();
  const navigate = useNavigate();
  const methods = useForm<FormValues>({
    defaultValues: {
      name: '',
      rawMaterialCategory: '',
      unit: 'KILOGRAM',
    },
  });

  const {
    mutateAsync: addRawMaterial,
    isPending,
    isSuccess,
  } = useAddRawMaterialCateror();
  const {data: categories} = useGetRawMaterialCategoriesCat();
  const mappedCategories = categories?.data.map(
    (category: {name: string; id: string}) => ({
      label: category.name,
      value: category.id,
    }),
  );

  const onSubmit = async (data: FormValues) => {
    console.log(data);

    try {
      const res = await addRawMaterial({
        name: data.name,
        categoryId: data.rawMaterialCategory,
        unit: data.unit,
        languageId: user?.languageId as string,
        amount: Number(data.amount),
        inventory: Number(data.inventory),
      });

      methods.reset({
        name: '',
        rawMaterialCategory: '',
        unit: 'KILOGRAM',
      });
      console.log(res);
    } catch (error) {
      // Show error toast
      // toast.error('Failed to add Raw Material. Please try again.');
      console.log(error);
    }
  };

  if (isPending) {
    return <Loader />;
  }

  return (
    <FormProvider {...methods}>
      <button
        type="button"
        onClick={() => navigate({to: '/inventorydisplay'})}
        className="dark:text-gray-200 px-4 py-2 text-xl font-bold"
      >
        
      ← Back
      </button>

      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className="space-y-8 bg-white p-8 dark:bg-black"
      >
        {/* Raw Material Form */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:gap-6">
          <h1 className="col-span-12 mb-4 text-lg font-semibold">
            Raw Material
          </h1>

          <div className="col-span-12 md:col-span-6">
            <GenericInputField
              name="name"
              label="Raw Material Name"
              placeholder="Enter raw material name"
            />
          </div>
          <div className="col-span-12 md:col-span-6">
            <GenericSearchDropdown
              name="rawMaterialCategory"
              options={mappedCategories || []}
              label="Category"
            />
          </div>
          <div className="col-span-12 md:col-span-6">
            <GenericSearchDropdown
              name="unit"
              label="Unit"
              options={[
                {label: 'kg', value: 'KILOGRAM'},
                {label: 'bottle', value: 'BOTTLE'},
                {label: 'gm', value: 'GRAM'},
                {label: 'ltr', value: 'LITRE'},
                {label: 'pcs', value: 'PIECE'},
                {label: 'meter', value: 'METER'},
              ]}
            />
          </div>
          <div className="col-span-12 md:col-span-6">
            <GenericInputField
              name="amount"
              label="Amount"
              placeholder="Enter raw material amount"
            />
          </div>

          <div className="col-span-12 md:col-span-6">
            <GenericInputField
              name="inventory"
              label="Inventory"
              placeholder="Enter inventory amount"
            />
          </div>
        </div>

        {/* Form Buttons */}
        <div className="flex justify-end space-x-4">
          <GenericButton type="submit">Save</GenericButton>
          {/* <GenericResetButton type="reset">Reset</GenericResetButton> */}
        </div>
      </form>
    </FormProvider>
  );
};

export default AddRawMaterialNew;
