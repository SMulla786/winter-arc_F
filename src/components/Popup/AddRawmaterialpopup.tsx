/* eslint-disable */
import React from 'react';
import {useForm, FormProvider} from 'react-hook-form';
import GenericInputField from '../Forms/Input/GenericInputField';
import GenericButton from '../Forms/Buttons/GenericButton';
import GenericSearchDropdown from '../Forms/SearchDropDown/GenericSearchDropdown';
import {
  useAddRawMaterialCateror,
  useGetRawMaterialCategoriesCat,
} from '@/lib/react-query/queriesAndMutations/cateror/dish';
import {useAuthContext} from '@/context/AuthContext';
import {Loader} from '../Loader/Loader';

const AddRawmaterialpopup = ({onClose}: {onClose: () => void}) => {
  const {user} = useAuthContext();
  const methods = useForm({
    defaultValues: {
      name: '',
      rawMaterialCategory: '',
      unit: 'KILOGRAM',
      amount: 0,
      inventory: 0,
    },
  });

  const {mutateAsync: addRawMaterial, isPending} = useAddRawMaterialCateror();
  const {data: categories} = useGetRawMaterialCategoriesCat();
  const mappedCategories = categories?.data?.map((cat: any) => ({
    label: cat.name,
    value: cat.id,
  }));

  const onSubmit = async (data: any) => {
    try {
      await addRawMaterial({
        name: data.name,
        categoryId: data.rawMaterialCategory,
        unit: data.unit,
        languageId: user?.languageId as string,
        amount: Number(data.amount),
        inventory: Number(data.inventory),
      });
      methods.reset();
      onClose(); // close popup after success
    } catch (err) {
      console.error('Failed to add raw material:', err);
    }
  };

  if (isPending) return <Loader />;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative w-full max-w-md rounded-lg bg-white p-6 dark:bg-black">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 absolute right-2 top-2 dark:hover:text-white"
        >
          ✕
        </button>

        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
            <h1 className="text-lg font-semibold">Add Raw Material</h1>

            <GenericInputField
              name="name"
              label="Raw Material Name"
              placeholder="Enter name"
            />
            <GenericSearchDropdown
              name="rawMaterialCategory"
              label="Category"
              options={mappedCategories || []}
            />
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
            <GenericInputField
              name="amount"
              label="Amount"
              placeholder="Enter amount"
            />
            <GenericInputField
              name="inventory"
              label="Inventory"
              placeholder="Enter inventory"
            />

            <div className="mt-4 flex justify-end space-x-2">
              <GenericButton
                type="button"
                onClick={onClose}
                className="bg-gray-300 hover:bg-gray-400 text-black"
              >
                Cancel
              </GenericButton>
              <GenericButton type="submit">Save</GenericButton>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
};

export default AddRawmaterialpopup;
