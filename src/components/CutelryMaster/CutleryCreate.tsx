import React, {useEffect, useRef, useState} from 'react';
import {useForm, FormProvider} from 'react-hook-form';
import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';
import GenericInputField from '../Forms/Input/GenericInputField';
import GenericSearchDropdown from '../Forms/SearchDropDown/GenericSearchDropdown';
import GenericButton from '../Forms/Buttons/GenericButton';
import GenericResetButton from '../Forms/Buttons/GenericResetButton';
import {useAddUtensil} from '@/lib/react-query/queriesAndMutations/cateror/utensils';
import {Loader} from '../Loader/Loader';
// import {useUtensilCatDraft} from '@/context/FormContext/UtensilCatContext';
import {
  useAddCutlery,
  useGetCutleryCategories,
} from '@/lib/api/cateror/cutlerymaster';
import {cutlerymasterSchema} from '@/lib/validation/utensilSchema';
import {useAuthContext} from '@/context/AuthContext';
// import {toast} from 'react-hot-toast';

// Define the Category type
type Category = {
  id: string;
  name: string;
  languageId: string; // Ensure this is included
  isActive: boolean;
};

type FetchedCategory = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  languageId: string;
};

type FormValues = z.infer<typeof cutlerymasterSchema>;

const CutleryCreate: React.FC = () => {
  const methods = useForm<FormValues>({
    resolver: zodResolver(cutlerymasterSchema),
  });

  const {mutate: addUtensil, isPending, isSuccess} = useAddCutlery();
  const {user} = useAuthContext();

  const restriction = user?.employeeRestriction?.utensilpeoplepage;
  const role = user?.role;

  const {reset, watch} = methods;
  // const {draft, setDraft, clearDraft} = useUtensilCatDraft();

  const isFirstRender = useRef(true);
  const values = watch();

  // 🔹 Restore draft ONCE on mount
  // useEffect(() => {
  //   if (draft) {
  //     reset(draft);
  //   }
  // }, []);

  // 🔹 Auto-save draft (skip first render)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    // setDraft(values);
  }, [values]);

  // 🔹 Clear draft on successful submit
  useEffect(() => {
    if (isSuccess) {
      reset();
      // clearDraft();
    }
  }, [isSuccess, reset]);

  // Fetch categories and handle loading and errors
  const {
    data: categoriesData,
    isLoading,
    isError,
    error,
  } = useGetCutleryCategories();

  // Use state for categories
  const [categories, setCategories] = useState<Category[]>([]);

  // Effect to set categories from the fetched data
  useEffect(() => {
    if (categoriesData && Array.isArray(categoriesData.data)) {
      const options: Category[] = categoriesData?.data.map(
        (category: FetchedCategory) => ({
          id: category.id,
          name: category.name,
          languageId: category.languageId, // Get the languageId from fetched data
          isActive: true, // Set to true or adjust this as necessary
        }),
      );
      setCategories(options);
    }
  }, [categoriesData]);

  const onSubmit = (data: FormValues) => {
    const selectedCategory = categories.find(
      (category) => category.id === data.cutleryCategory,
    );

    // Ensure that the selected category has a valid languageId
    if (!selectedCategory || !selectedCategory.languageId) {
      return;
    }

    // Proceed with adding the utensil
    addUtensil(
      {
        name: data.cutleryName,
        categoryId: data.cutleryCategory,
        languageId: selectedCategory.languageId, // Use the correct languageId
        inventory: Number(data.inventory),
      },
      {
        onSuccess: () => {
          reset();
        },
      },
    );
  };

  if (isPending) {
    return <Loader />;
  }

  // Filter active categories if needed
  const filteredCategories = categories.filter((category) => category.isActive); // Adjust condition as necessary

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className="space-y-8 bg-white p-8 dark:bg-black"
      >
        {/* Utensil Form */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:gap-6">
          <h1 className="col-span-12 mb-4 text-lg font-semibold">Cutlery</h1>

          <div className="col-span-12 md:col-span-6">
            <GenericInputField
              name="cutleryName"
              label="Cutlery Name"
              placeholder="Enter Cutlery Name"
            />
          </div>

          <div className="col-span-12 md:col-span-6">
            <GenericSearchDropdown
              name="cutleryCategory"
              label="Cutlery Category"
              options={filteredCategories.map((category) => ({
                label: category.name,
                value: category.id,
              }))}
            />
          </div>
          <div className="col-span-12 md:col-span-6">
            <GenericInputField
              name="inventory"
              label="Inventory"
              placeholder="Enter Inventory"
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

export default CutleryCreate;
