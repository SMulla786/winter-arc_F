/*eslint-disable*/
import React, {useEffect, useRef, useState} from 'react';
import {useForm, FormProvider} from 'react-hook-form';
import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';
import GenericInputField from '../Forms/Input/GenericInputField';
import GenericSearchDropdown from '../Forms/SearchDropDown/GenericSearchDropdown';
import GenericButton from '../Forms/Buttons/GenericButton';
import GenericResetButton from '../Forms/Buttons/GenericResetButton';
import {useAddDisposal} from '@/lib/react-query/queriesAndMutations/cateror/disposal';
import {useGetDisposalCategories} from '@/lib/react-query/queriesAndMutations/cateror/disposal';
import {disposalSchemaa} from '@/lib/validation/disposalSchema';
import {toast} from 'react-hot-toast';
import {Loader} from '../Loader/Loader';

// Define the Category type
type Category = {
  id: string;
  name: string;
  languageId: string;
  isActive: boolean;
};

type FetchedCategory = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  languageId: string;
};

type FormValues = z.infer<typeof disposalSchemaa>;

const DisposalCateror: React.FC = () => {
  const methods = useForm<FormValues>({
    resolver: zodResolver(disposalSchemaa),
  });

  //const {reset} = methods;
  const {mutate: addDisposal, isPending, isSuccess} = useAddDisposal();
  const {data: categoriesData} = useGetDisposalCategories();
  const [categories, setCategories] = useState<Category[]>([]);

  const {reset} = methods;

  useEffect(() => {
    if (
      categoriesData &&
      categoriesData.status &&
      categoriesData.data &&
      Array.isArray(categoriesData.data.data)
    ) {
      const options: Category[] = categoriesData.data.data.map(
        (category: FetchedCategory) => ({
          id: category.id,
          name: category.name,
          languageId: category.languageId,
          isActive: true,
        }),
      );
      setCategories(options);
    }
  }, [categoriesData]);

  const onSubmit = async (data: FormValues) => {
    const selectedCategory = categories.find(
      (category) => category.id === data.disposalCategory,
    );

    if (!selectedCategory) {
      toast.error('Category not found');
      return;
    }

    if (!selectedCategory.languageId) {
      toast.error('Missing language ID');
      return;
    }

    try {
      addDisposal({
        name: data.disposalName,
        categoryId: data.disposalCategory,
        languageId: selectedCategory.languageId,
        inventory: Number(data.inventory),
        price: Number(data.price),
        unit: data.unit,
      });

      reset(); // Reset form after successful submission
    } catch (error) {
      console.error('Error adding disposal:', error);
    }
  };

  if (isPending) {
    return <Loader />;
  }

  const error = (error: any) => {};

  const filteredCategories = categories.filter((category) => category.isActive);

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit, error)}
        className="space-y-8 bg-white p-8 dark:bg-black"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:gap-6">
          <h1 className="col-span-12 mb-4 text-lg font-semibold">Disposal</h1>

          <div className="col-span-12 md:col-span-6">
            <GenericInputField
              name="disposalName"
              label="Disposal Name"
              placeholder="Enter Disposal Name"
            />
          </div>

          <div className="col-span-12 md:col-span-6">
            <GenericSearchDropdown
              name="disposalCategory"
              label="Disposal Category"
              options={filteredCategories.map((category) => ({
                label: category.name,
                value: category.id,
              }))}
            />
          </div>
          <div className="col-span-12 md:col-span-6">
            <GenericSearchDropdown
              name="unit"
              label="Disposal Unit"
              options={[
                {label: 'PKT', value: 'PKT'},
                {label: 'PIECE', value: 'PIECE'},
                {label: 'DOZEN', value: 'DOZEN'},
                {label: 'BOX', value: 'BOX'},
                {label: 'KG', value: 'KG'},
                {label: 'LITER', value: 'LTR'},
                {label: 'ROLL', value: 'ROLL'},
                {label: 'METER', value: 'MTR'},
              ]}
            />
          </div>

          <div className="col-span-12 md:col-span-6">
            <GenericInputField
              name="inventory"
              label="Inventory"
              placeholder="Enter Inventory"
            />
          </div>
          <div className="col-span-12 md:col-span-6">
            <GenericInputField
              name="price"
              label="Price"
              placeholder="Enter price"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <GenericButton type="submit">Save</GenericButton>
          {/* <GenericResetButton type="reset">Reset</GenericResetButton> */}
        </div>
      </form>
    </FormProvider>
  );
};

export default DisposalCateror;
