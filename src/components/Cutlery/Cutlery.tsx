import React, {useEffect, useRef} from 'react';
import {useForm, FormProvider, Controller} from 'react-hook-form';
import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';
import GenericInputField from '../Forms/Input/GenericInputField';
import GenericButton from '../Forms/Buttons/GenericButton';
import {useCreateCutlery} from '@/lib/react-query/queriesAndMutations/cateror/cutlery';
import {useAuthContext} from '@/context/AuthContext';

export const cutlerySchema = z.object({
  cutleryName: z.string().min(1, 'Cutlery name is required'),
  image: z.any().refine((file) => file?.length > 0, 'Image is required'),
  price: z.string().optional(),
});

export type FormValues = z.infer<typeof cutlerySchema>;

const Cutlery: React.FC = () => {
  const methods = useForm<FormValues>({
    resolver: zodResolver(cutlerySchema),
  });

  const {mutateAsync: addCutlery, isPending, isSuccess} = useCreateCutlery();
  const {user} = useAuthContext();
  const restriction = user?.employeeRestriction?.cutlerypage;
  const role = user?.role;

  // Convert file to Base64
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
        name: data.cutleryName,
        image: base64Image,
        price: Number(data.price) || 0,
      };
      await addCutlery(payload);
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
            name="cutleryName"
            label="Cutlery Name"
            placeholder="Enter cutlery name"
          />

          <GenericInputField
            name="price"
            label="Price (Optional)"
            placeholder="Enter price"
          />

          {/* Dynamic file input using Controller */}
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
          {(role == 'CATEROR' ||
            restriction === 'VIEW' ||
            restriction === 'EDIT') && (
            <GenericButton type="submit" disabled={isPending}>
              {isPending ? 'Saving...' : 'Save'}
            </GenericButton>
          )}
        </div>
      </form>
    </FormProvider>
  );
};

export default Cutlery;
