/*eslint-disable*/

import React, {useEffect, useState} from 'react';
import {useForm, FormProvider} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import GenericTextArea from '../Forms/TextArea/GenericTextArea';
import GenericSearchDropdown from '../Forms/SearchDropDown/GenericSearchDropdown';
import GenericButton from '../Forms/Buttons/GenericButton';
import GenericDropdown from '../Forms/DropDown/GenericDropDown';
import {useDishMaster} from '@/context/DishMasterContext';
import {dishMasterSchema} from '@/lib/validation/dishSchemas';
import {
  useAddDishAdmin,
  useGetDishByIdAdmin,
  useGetDishCategoriesAdmin,
  useGetDishesAdmin,
} from '@/lib/react-query/queriesAndMutations/admin/dish';
import {useGetLanguages} from '@/lib/react-query/queriesAndMutations/admin/languages';
import {z} from 'zod';
import SearchInputWithSuggestions from '../Forms/Input/GenericInputFieldList';

type FormValues = z.infer<typeof dishMasterSchema>;

interface DishMasterProps {
  onDishAdded: () => void;
}

const DishMaster: React.FC<DishMasterProps> = ({onDishAdded}) => {
  const {setDishId} = useDishMaster();
  const methods = useForm<FormValues>({
    resolver: zodResolver(dishMasterSchema),
  });
  const {reset, watch} = methods;

  const selectedLanguageId = watch('language');
  const [categoryOptions, setCategoryOptions] = useState<
    {label: string; value: string}[]
  >([]);
  const [languageOptions, setLanguageOptions] = useState<
    {label: string; value: string}[]
  >([]);

  const [DishbyId, setDishbyId] = useState<string>('');
  const {data: selectedDish} = useGetDishByIdAdmin(DishbyId);
  const {data: categoriesData, refetch: refetchCategories} =
    useGetDishCategoriesAdmin(selectedLanguageId);

  const {data: dishesData, refetch: refetchDishes} =
    useGetDishesAdmin(selectedLanguageId);

  const {mutate: addDish} = useAddDishAdmin();
  const {data: languages} = useGetLanguages();

  useEffect(() => {
    if (languages) {
      const options = languages.map((language: any) => ({
        label: language.name,
        value: language.id,
      }));
      setLanguageOptions(options);
    }
  }, [languages]);

  useEffect(() => {
    if (selectedLanguageId) {
      refetchCategories();
      refetchDishes();
    }
  }, [selectedLanguageId, refetchCategories, refetchDishes]);

  useEffect(() => {
    if (categoriesData?.data?.data) {
      const options = categoriesData.data.data.map((category: any) => ({
        label: category.name,
        value: category.id,
      }));
      setCategoryOptions(options);
    }
  }, [categoriesData]);

  const onSubmit = (data: FormValues) => {
    addDish(
      {
        name: data.name,
        categoryId: data.dishCategory,
        languageId: data.language,
        priority: data.priority,
        description: data.description,
      },
      {
        onSuccess: (response) => {
          setDishId(response.data.id);
          reset();
          onDishAdded();
        },
        onError: (error) => {
          console.error('Error adding dish:', error);
        },
      },
    );
  };
  useEffect(() => {
    if (selectedDish) {
      reset({
        name: selectedDish?.data.name,
        description: selectedDish?.data.description,
        priority: selectedDish?.data.priority,
        dishCategory: selectedDish?.data.categoryId,
      });
    }
  }, [selectedDish, reset]);
  const onDishSearch = (dishId: string) => {
    console.log(selectedDish, 'selectedDish');
    setDishbyId(dishId);
  };

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className="space-y-8 bg-white p-8 dark:bg-black"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:gap-6">
          <div className="col-span-12 md:col-span-6">
            <GenericDropdown
              name="language"
              label="Language"
              options={languageOptions}
              defaultOption="Select Language"
            />
          </div>

          <div className="col-span-12 md:col-span-6">
            <SearchInputWithSuggestions
              name="dishName"
              label="Dish Name  "
              suggestions={dishesData?.data?.data || []}
              onDishSearch={onDishSearch}
            />
          </div>

          <div className="col-span-12 md:col-span-6">
            <GenericSearchDropdown
              name="priority"
              label="Priority"
              options={[
                {label: '1st Priority', value: 'P1'},
                {label: '2nd Priority', value: 'P2'},
                {label: '3rd Priority', value: 'P3'},
              ]}
            />
          </div>
          <div className="col-span-12 md:col-span-6">
            <GenericDropdown
              name="dishCategory"
              label="Dish Category"
              options={categoryOptions}
              defaultOption="Select Category"
              // control={methods.control}
            />
          </div>

          <div className="col-span-12 md:col-span-full">
            <GenericTextArea
              rows={4}
              name="description"
              label="Dish Description"
              placeholder="Enter dish description"
            />
          </div>

          <div className="col-span-12 mt-10 md:col-span-3">
            <GenericButton type="submit">Save</GenericButton>
            {/* <GenericButton onClick={handleLoad}>Load</GenericButton> */}
          </div>
        </div>
      </form>
    </FormProvider>
  );
};

export default DishMaster;
