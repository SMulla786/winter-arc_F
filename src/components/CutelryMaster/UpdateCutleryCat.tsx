/* eslint-disable */
import React, {useEffect} from 'react';
import {useForm, FormProvider} from 'react-hook-form';
import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import GenericButton from '../Forms/Buttons/GenericButton';
import GenericInputField from '../Forms/Input/GenericInputField';
import {useMatch, useNavigate} from '@tanstack/react-router';
import {
  useGetCutleryCategoryById,
  useUpdateCutleryCategory,
} from '@/lib/api/cateror/cutlerymaster';

const formSchema = z.object({
  cutleryCategoryName: z
    .string({required_error: 'Cutlery Category is required'})
    .min(3, {message: 'Cutlery Category must be at least 3 characters long'}),
});

type FormValues = z.infer<typeof formSchema>;

const UpdateCutleryCat: React.FC = () => {
  const navigate = useNavigate();

  const {params} = useMatch(
    '/_app/_edit/update/cutlerycategoryCateror/$id' as any,
  );
  const {id = ''} = params as {id: string};

  const methods = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cutleryCategoryName: '',
    },
  });

  const {reset, handleSubmit} = methods;

  // Fetch cutlery data by ID
  const {data: cutlery, isSuccess} = useGetCutleryCategoryById(id);

  console.log('Fetched cutlery data:', cutlery);

  const {
    mutate: updateCutleryCategory,
    isPending,
    isSuccess: isUpdateSuccess,
    isError,
    error,
  } = useUpdateCutleryCategory();

  // Set form values when cutlery data is successfully fetched
  useEffect(() => {
    if (isSuccess && cutlery) {
      reset({cutleryCategoryName: cutlery.name || ''});
    }
  }, [isSuccess, cutlery, reset]);

  const onSubmit = (data: FormValues) => {
    // Prevent updating if the name hasn't changed
    // if (data.cutleryCategoryName.trim() === cutlery?.name?.trim()) {
    //   toast.error('The name is already the same. Please enter a new name.');
    //   return;
    // }

    // Check if required fields exist

    // Create update data - note: use the category's own id as categoryId
    const updateData = {
      name: data.cutleryCategoryName,
    };

    console.log('Sending update data:', updateData);

    updateCutleryCategory({
      id: id,
      data: updateData,
    });
  };

  useEffect(() => {
    if (isUpdateSuccess) {
      // toast.success('Cutlery category updated successfully');
      reset();
      navigate({
        to: '/cutlerymanagment',
      });
    }
  }, [isUpdateSuccess, reset, navigate]);

  useEffect(() => {
    if (isError) {
      const errorMessage =
        (error as {message?: string})?.message ||
        'Something went wrong while updating the cutlery category';
      console.error('Update error:', errorMessage);
      toast.error(errorMessage);
    }
  }, [isError, error]);

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-8 bg-white p-8 dark:bg-black"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:gap-6">
          <h1 className="col-span-12 mb-4 text-lg font-semibold">
            Update Cutlery Category
          </h1>

          <div className="col-span-12 md:col-span-6">
            <GenericInputField
              name="cutleryCategoryName"
              label="Cutlery Category Name"
              placeholder="Enter Cutlery Category"
              required={true}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <GenericButton
            type="button"
            onClick={() => navigate({to: `/cutlerymanagment`})}
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

export default UpdateCutleryCat;
