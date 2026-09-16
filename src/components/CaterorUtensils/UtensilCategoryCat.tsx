import {useForm, FormProvider} from 'react-hook-form';
import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';
import {utensilcategorySchema} from '@/lib/validation/utensilSchema';
import GenericInputField from '../Forms/Input/GenericInputField';
import GenericButton from '../Forms/Buttons/GenericButton';
import {useAddUtensilCategory} from '@/lib/react-query/queriesAndMutations/cateror/utensils';
import {languageId} from '@/lib/contants';
import {Loader} from '../Loader/Loader';
import toast from 'react-hot-toast';
import {useEffect} from 'react';

type FormValues = z.infer<typeof utensilcategorySchema>;

const UtensilCategoryCat: React.FC = () => {
  const methods = useForm<FormValues>({
    resolver: zodResolver(utensilcategorySchema),
    defaultValues: {
      utensilCategoryName: '',
      language: languageId, // Add language field with default value
    },
  });

  const {
    mutate: addUtensilCategory,
    isPending,
    isSuccess,
    isError,
    error,
  } = useAddUtensilCategory();

  const {reset, setValue, handleSubmit, formState} = methods;

  const onSubmit = (data: FormValues) => {
    console.log('Submitting:', data);

    if (!data.utensilCategoryName || data.utensilCategoryName.trim() === '') {
      toast.error('Please enter utensil category name');
      return;
    }

    addUtensilCategory({
      name: data.utensilCategoryName,
      languageId: languageId,
    });
  };

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-8 bg-white p-8 dark:bg-black"
      >
        {/* Utensil Category Form */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:gap-6">
          <h1 className="col-span-12 mb-4 text-lg font-semibold">
            Utensil Category
          </h1>

          <div className="col-span-12 md:col-span-6">
            <GenericInputField
              name="utensilCategoryName"
              label="Utensil Category Name"
              placeholder="Enter Utensil Category"
            />
          </div>

          {/* Add hidden language field */}
          <input type="hidden" {...methods.register('language')} />
        </div>

        {/* Form Buttons */}
        <div className="flex justify-end space-x-4">
          <GenericButton type="submit" disabled={isPending}>
            {isPending ? 'Saving...' : 'Save'}
          </GenericButton>
        </div>
      </form>
    </FormProvider>
  );
};

export default UtensilCategoryCat;
