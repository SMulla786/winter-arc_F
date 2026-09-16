/*eslint-disable*/
import React from 'react';
import {useForm, FormProvider, useFieldArray} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import z from 'zod';
import {FiPlus, FiTrash2, FiUpload} from 'react-icons/fi';
import GenericInputField from '../Forms/Input/GenericInputField';
import GenericButton from '../Forms/Buttons/GenericButton';
import {useCreateDisplayVendorDisplays} from '@/lib/react-query/queriesAndMutations/cateror/displayVendor';

// Constants
const VALIDATION_MESSAGES = {
  DISPLAY_NAME_REQUIRED: 'Display Name Required',
  IMAGE_REQUIRED: 'Image Required',
  PRICE_REQUIRED: 'Price Required',
  AT_LEAST_ONE_DISPLAY: 'At least one display is required',
} as const;

const DEFAULT_DISPLAY_VALUES = {
  displayName: '',
  image: '',
  price: '',
} as const;

// Zod schemas
const displaySchema = z.object({
  displayName: z.string().min(1, VALIDATION_MESSAGES.DISPLAY_NAME_REQUIRED),
  image: z.string().optional(), // <-- make image optional
  price: z.string().min(1, VALIDATION_MESSAGES.PRICE_REQUIRED),
});

const multipleDisplaysSchema = z.object({
  displays: z
    .array(displaySchema)
    .min(1, VALIDATION_MESSAGES.AT_LEAST_ONE_DISPLAY),
});

type DisplayFormValues = z.infer<typeof multipleDisplaysSchema>;

interface CreateVendorDisplaysProps {
  onClose: () => void;
  postResponse: any;
}

const CreateVendorDisplays: React.FC<CreateVendorDisplaysProps> = ({
  onClose,
  postResponse,
}) => {
  const methods = useForm<DisplayFormValues>({
    resolver: zodResolver(multipleDisplaysSchema),
    defaultValues: {
      displays: [DEFAULT_DISPLAY_VALUES],
    },
  });

  const {control, handleSubmit, setValue, watch} = methods;
  const {fields, append, remove} = useFieldArray({
    control,
    name: 'displays',
  });

  const {mutate: createDisplay} = useCreateDisplayVendorDisplays(
    postResponse?.id,
  );

  // Convert file to Base64 string
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // Handle image upload for a specific display
  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    index: number,
  ): Promise<void> => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const base64 = await fileToBase64(file);
      setValue(`displays.${index}.image`, base64);
    } catch (error) {
      console.error('Error converting file to Base64:', error);
    }
  };

  const onSubmit = (data: DisplayFormValues): void => {
    const formattedData = data.displays.map((display) => ({
      name: display.displayName,
      image: display.image,
      price: Number(display.price),
    }));

    createDisplay(
      {data: formattedData},
      {
        onSuccess: onClose,
      },
    );
  };

  const watchedDisplays = watch('displays');

  return (
    <div className="mt-5 rounded-sm border border-stroke bg-white px-4 pb-2 pt-4 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-6">
      <header className="mb-4">
        <h2 className="text-greay-700 text-xl font-bold dark:text-white">
          Create Vendor Displays
        </h2>
      </header>

      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <section>
            <h3 className="text-gray-800 mb-3 text-lg font-medium dark:text-white">
              Vendor Displays
            </h3>

            {/* ---- TWO CARDS PER ROW (md+) ---- */}
            <div className="grid gap-4 md:grid-cols-2">
              {fields.map((field, idx) => (
                <div
                  key={field.id}
                  className="flex flex-col gap-3 rounded-lg border border-stroke p-4 dark:border-strokedark sm:flex-row sm:items-end"
                >
                  {/* Display Name */}
                  <div className="flex-1">
                    <GenericInputField
                      name={`displays.${idx}.displayName`}
                      label="Display Name"
                      placeholder="Enter Display Name"
                    />
                  </div>

                  {/* Price */}
                  <div className="w-full sm:w-32">
                    <GenericInputField
                      type="number"
                      name={`displays.${idx}.price`}
                      label="Price"
                      placeholder="0"
                    />
                  </div>

                  {/* Image Upload */}
                  <div className="w-full sm:w-44">
                    <label className="text-gray-700 dark:text-gray-300 block text-sm font-medium">
                      Image
                    </label>

                    {watchedDisplays?.[idx]?.image ? (
                      <div className="group relative mt-1">
                        <img
                          src={watchedDisplays[idx].image}
                          alt="preview"
                          className="h-20 w-full rounded border object-cover dark:border-strokedark"
                        />
                        <div className="absolute inset-0 flex items-center justify-center gap-2 rounded bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                          <label className="cursor-pointer">
                            <FiUpload className="text-white" />
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleFileUpload(e, idx)}
                              className="hidden"
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() =>
                              setValue(`displays.${idx}.image`, '')
                            }
                            className="text-white"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label className="mt-1 flex cursor-pointer items-center gap-1.5 text-sm text-primary hover:text-primary/80">
                        <FiUpload />
                        <span>Upload</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, idx)}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>

                  {/* Remove Button (only if >1) */}
                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => remove(idx)}
                      className="self-center rounded p-1 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                    >
                      <FiTrash2 className="h-5 w-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Add Display – floating action */}
            <div className="mt-4 flex justify-center md:justify-start">
              <button
                type="button"
                onClick={() => append(DEFAULT_DISPLAY_VALUES)}
                className="flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
              >
                <FiPlus className="h-4 w-4" />
                Add Display
              </button>
            </div>
          </section>
          <footer className="flex justify-end pt-4">
            <GenericButton type="submit" className="min-w-[150px]">
              Create Displays
            </GenericButton>
          </footer>
        </form>
      </FormProvider>
    </div>
  );
};

export default CreateVendorDisplays;
