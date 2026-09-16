import React, {useEffect, useState} from 'react';
import {useForm, FormProvider} from 'react-hook-form';
import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';
import GenericInputField from '../Forms/Input/GenericInputField';
import GenericSearchDropdown from '../Forms/SearchDropDown/GenericSearchDropdown';
import GenericButton from '../Forms/Buttons/GenericButton';
import {
  useAddUtensil,
  useGetUtensilCategories,
} from '@/lib/react-query/queriesAndMutations/admin/utensils';
import {utensilSchema} from '@/lib/validation/utensilSchema';
import toast from 'react-hot-toast';

type Category = {
  id: string;
  name: string;
  languageId: string;
  isActive: boolean;
};

type FetchedCategory = {
  id: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
  languageId?: string;
};

type FormValues = z.infer<typeof utensilSchema>;

const Utensil: React.FC = () => {
  const methods = useForm<FormValues>({
    resolver: zodResolver(utensilSchema),
  });

  const {mutate: addUtensil, isPending: isAdding} = useAddUtensil();
  const {
    data: categoriesData,
    isLoading,
    isError,
    error,
  } = useGetUtensilCategories();

  const [categories, setCategories] = useState<Category[]>([]);

  // ✅ Load categories properly (works for both API response formats)
  useEffect(() => {
    console.log('Fetched raw category data:', categoriesData);
    const raw = categoriesData?.data?.data ?? categoriesData?.data ?? []; // handle both structures

    if (Array.isArray(raw)) {
      const mapped = raw.map((cat: FetchedCategory) => ({
        id: cat.id,
        name: cat.name,
        languageId: cat.languageId ?? '',
        isActive: true,
      }));
      setCategories(mapped);
    } else {
      console.warn('Category data not array:', raw);
    }
  }, [categoriesData]);

  const onSubmit = (data: FormValues) => {
    const selectedCategory = categories.find(
      (category) => category.id === data.utensilCategory,
    );

    if (!selectedCategory || !selectedCategory.languageId) {
      toast.error('Please select a valid category.');
      return;
    }

    addUtensil(
      {
        name: data.utensilName,
        categoryId: data.utensilCategory,
        languageId: selectedCategory.languageId,
      },
      {
        onSuccess: () => toast.success('Utensil added successfully!'),
        onError: () => toast.error('Failed to add utensil.'),
      },
    );
  };

  if (isLoading) return <div>Loading categories...</div>;
  if (isError) return <div>Error fetching categories: {String(error)}</div>;

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className="space-y-8 bg-white p-8 dark:bg-black"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:gap-6">
          <h1 className="col-span-12 mb-4 text-lg font-semibold">Utensil</h1>

          <div className="col-span-12 md:col-span-6">
            <GenericInputField
              name="utensilName"
              label="Utensil Name"
              placeholder="Enter Utensil Name"
            />
          </div>

          <div className="col-span-12 md:col-span-6">
            <GenericSearchDropdown
              name="utensilCategory"
              label="Utensil Category"
              options={categories.map((cat) => ({
                label: cat.name,
                value: cat.id,
              }))}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <GenericButton type="submit" disabled={isAdding}>
            {isAdding ? 'Saving...' : 'Save'}
          </GenericButton>
        </div>
      </form>
    </FormProvider>
  );
};

export default Utensil;
