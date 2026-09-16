import React from 'react';
import {useForm, FormProvider, Controller} from 'react-hook-form';
import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';
import GenericInputField from '../Forms/Input/GenericInputField';
import GenericButton from '../Forms/Buttons/GenericButton';
import {useCreateDisplay} from '@/lib/react-query/queriesAndMutations/cateror/display';

const displaySchema = z.object({
  displayName: z.string().min(1, 'Display name is required'),
  image: z.any().refine((file) => file?.length > 0, 'Image is required'),
  price: z.string().optional(),
});

type FormValues = z.infer<typeof displaySchema>;

const DisplayForm: React.FC = () => {
  const methods = useForm<FormValues>({
    resolver: zodResolver(displaySchema),
  });

  const {mutateAsync: addDisplay, isPending} = useCreateDisplay();

  const fileToBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  const onSubmit = async (data: FormValues) => {
    try {
      const base64Image = await fileToBase64(data.image[0]);
      const payload = {
        name: data.displayName,
        image: base64Image,
        price: Number(data.price) || 0,
      };
      await addDisplay(payload);
      methods.reset();
    } catch (error) {
      console.error('Error converting image to Base64:', error);
    }
  };

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className="space-y-8 bg-white p-8 dark:bg-black"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <GenericInputField
            name="displayName"
            label="Display Name"
            placeholder="Enter display name"
          />

          <GenericInputField
            name="price"
            label="Price (Optional)"
            placeholder="Enter price"
          />

          <Controller
            name="image"
            control={methods.control}
            render={({field, fieldState}) => (
              <div className="flex flex-col">
                <label className="mb-1 font-medium">Upload Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => field.onChange(e.target.files)}
                />
                {fieldState.error && (
                  <p className="mt-1 text-sm text-red-500">
                    {fieldState.error.message}
                  </p>
                )}
              </div>
            )}
          />
        </div>

        <div className="flex justify-end">
          <GenericButton type="submit" disabled={isPending}>
            {isPending ? 'Saving...' : 'Save'}
          </GenericButton>
        </div>
      </form>
    </FormProvider>
  );
};

export default DisplayForm;
