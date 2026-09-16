/* eslint-disable */
import React, {useEffect} from 'react';
import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';
import {FormProvider, useForm, useFieldArray} from 'react-hook-form';
import {IoMdArrowRoundBack} from 'react-icons/io';
import {FiPlus, FiTrash2, FiUpload} from 'react-icons/fi';
import GenericInputField from '../Forms/Input/GenericInputField';
import GenericButton from '../Forms/Buttons/GenericButton';
import {
  useCreateDisplayVendorDisplays,
  useUpdateDisplayVendor,
} from '@/lib/react-query/queriesAndMutations/cateror/displayVendor';

// --- Validation Messages ---
const VALIDATION_MESSAGES = {
  VENDOR_NAME_REQUIRED: 'Vendor Name is required',
  PHONE_REQUIRED: 'Phone number is required',
  DISPLAY_NAME_REQUIRED: 'Display Name is required',
  IMAGE_REQUIRED: 'Image is required',
  PRICE_REQUIRED: 'Price is required',
  AT_LEAST_ONE_DISPLAY: 'At least one display required',
} as const;

// --- Zod Schemas ---
const displaySchema = z.object({
  id: z.string().optional(),
  displayName: z.string().min(1, VALIDATION_MESSAGES.DISPLAY_NAME_REQUIRED),
  image: z.string().optional(),
  price: z.string().min(1, VALIDATION_MESSAGES.PRICE_REQUIRED),
});

const updateVendorSchema = z.object({
  vendorName: z.string().min(1, VALIDATION_MESSAGES.VENDOR_NAME_REQUIRED),
  phone: z.string().min(1, VALIDATION_MESSAGES.PHONE_REQUIRED),
  address: z.string().optional(),
  displays: z
    .array(displaySchema)
    .min(1, VALIDATION_MESSAGES.AT_LEAST_ONE_DISPLAY),
});

type VendorFormValues = z.infer<typeof updateVendorSchema>;

interface UpdateDisplayVendorFormProps {
  vendor: any;
  onClose: () => void;
}

const DEFAULT_DISPLAY_VALUES = {
  displayName: '',
  image: '',
  price: '',
} as const;

const UpdateDisplayVendorForm: React.FC<UpdateDisplayVendorFormProps> = ({
  vendor,
  onClose,
}) => {
  const methods = useForm<VendorFormValues>({
    resolver: zodResolver(updateVendorSchema),
    defaultValues: {
      vendorName: vendor?.name || '',
      phone: vendor?.phone || '',
      address: vendor?.address || '',
      displays: [],
    },
  });

  const {control, reset, handleSubmit, setValue, watch, getValues, setFocus} =
    methods;
  const {fields, append, remove} = useFieldArray({
    control,
    name: 'displays',
  });

  const {mutateAsync: updateVendor, isPending: isUpdatingVendor} =
    useUpdateDisplayVendor();
  const {mutateAsync: updateDisplays, isPending: isUpdatingDisplays} =
    useCreateDisplayVendorDisplays(vendor?.id);

  // Prefill vendor and display data
  useEffect(() => {
    if (vendor) {
      reset({
        vendorName: vendor?.name || '',
        phone: vendor?.phone || '',
        address: vendor?.address || '',
        displays:
          vendor.displays?.map((d: any) => ({
            id: d.id,
            displayName: d.name,
            price: d.price.toString(),
            image: d.image,
          })) || [],
      });
    }
  }, [vendor, reset]);

  // Convert file to Base64 string
  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
    });

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await fileToBase64(file);
      setValue(`displays.${index}.image`, base64);
    } catch (error) {
      console.error('Error converting file to Base64:', error);
    }
  };
  // useEffect(() => {
  //   setFocus('displays.0.displayName');
  // }, [setFocus]);
  const handleVendorUpdate = async () => {
    const {vendorName, phone, address} = getValues();
    try {
      await updateVendor({id: vendor.id, name: vendorName, phone, address});
    } catch (error) {
      console.error('Vendor update failed:', error);
    }
  };

  const handleDisplaysUpdate = async () => {
    const {displays} = getValues();

    for (let i = 0; i < displays.length; i++) {
      if (!displays[i].displayName) {
        setFocus(`displays.${i}.displayName`);
        return;
      }
      if (!displays[i].price) {
        setFocus(`displays.${i}.price`);
        return;
      }
      // Optional: if you want image required:
      // if (!data.displays[i].image) {
      //   setFocus(`displays.${i}.image`);
      //   return;
      // }
    }

    // Only filter out displays that have BOTH name and price empty
    const validDisplays = displays.filter(
      (d) => d.displayName?.trim() || d.price?.trim(),
    );

    if (validDisplays.length === 0) {
      alert('Please add at least one display.');
      return;
    }

    try {
      const formattedDisplays = validDisplays.map((d) => ({
        id: d.id,
        name: d.displayName,
        price: Number(d.price || 0),
        image: d.image || '',
      }));

      await updateDisplays({data: formattedDisplays});
      onClose();
    } catch (error) {
      console.error('Display update failed:', error);
    }
  };

  const watchedDisplays = watch('displays');

  return (
    <div className="rounded-sm border border-stroke bg-white px-4 pb-2 pt-4 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-6">
      <div className="mb-4 flex items-center">
        <span className="cursor-pointer px-2" onClick={onClose}>
          <IoMdArrowRoundBack />
        </span>
        <h2 className="text-xl font-bold dark:text-white">Update Vendor</h2>
      </div>

      <FormProvider {...methods}>
        <form className="space-y-4">
          {/* Vendor Info */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <GenericInputField
              name="vendorName"
              label="Vendor Name"
              placeholder="Enter vendor name"
            />
            <GenericInputField
              name="phone"
              label="Phone"
              placeholder="Enter phone number"
            />
            <GenericInputField
              name="address"
              label="Address"
              placeholder="Enter address"
            />
          </div>

          <div className="flex justify-end pt-3">
            <GenericButton
              type="button"
              onClick={handleVendorUpdate}
              disabled={isUpdatingVendor}
            >
              {isUpdatingVendor ? 'Updating...' : 'Update Vendor Info'}
            </GenericButton>
          </div>

          {/* Displays Section */}
          <section>
            <h3 className="text-gray-800 mb-3 text-lg font-medium dark:text-white">
              Vendor Displays
            </h3>

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

            {/* Add Display Button */}
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

          <div className="flex justify-end pt-3">
            <GenericButton
              type="button"
              onClick={handleDisplaysUpdate}
              disabled={isUpdatingDisplays}
            >
              {isUpdatingDisplays ? 'Updating...' : 'Update Displays'}
            </GenericButton>
          </div>
        </form>
      </FormProvider>
    </div>
  );
};

export default UpdateDisplayVendorForm;
