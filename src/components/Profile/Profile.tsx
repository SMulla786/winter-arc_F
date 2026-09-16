import {catererSchema} from '@/lib/validation/cartererSchema';
import {FormProvider, useForm} from 'react-hook-form';
import {z} from 'zod';
import GenericButton from '../Forms/Buttons/GenericButton';
import GenericInputField from '../Forms/Input/GenericInputField';
import GenericSearchDropdown from '../Forms/SearchDropDown/GenericSearchDropdown';
import GenericTextArea from '../Forms/TextArea/GenericTextArea';
import {zodResolver} from '@hookform/resolvers/zod';
import {useEffect, useState} from 'react';
import {profileSchema} from '@/lib/validation/profileSchemas';
import {useAuthContext} from '@/context/AuthContext';
import {useGetCaterorById} from '@/lib/react-query/queriesAndMutations/cateror/dish';
import {useUpdateCaterorProfile} from '@/lib/react-query/queriesAndMutations/cateror/caterorprofile';
import {useNavigate} from '@tanstack/react-router';

type FormValues = z.infer<typeof profileSchema>;

const Profile: React.FC = () => {
  const {user, role} = useAuthContext();
  const navigate = useNavigate();
  const methods = useForm<FormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullname: '',
      phoneNumber: '',
      address: '',
      state: '',
      city: '',
      email: '',
      username: '',
      googleRating: '',
      facebook: '',
      instagram: '',
      youtube: '',
      password: '',
    },
  });
  const {watch} = methods;

  const watchFiles = watch('imageFile');

  const [imageError, setImageError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const {mutate: updateCateror} = useUpdateCaterorProfile();

  const {data: profiledata} = useGetCaterorById(user?.caterorId || '');

  useEffect(() => {
    if (watchFiles && watchFiles.length > 0) {
      const file = watchFiles[0];

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setImageError('Please select an image file');
        setImageUrl(null);
        return;
      }

      // Validate file size (e.g., 5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setImageError('Image size should be less than 5MB');
        setImageUrl(null);
        return;
      }

      setImageError(null);

      // Create preview URL
      const objectUrl = URL.createObjectURL(file);
      setImageUrl(objectUrl);

      // Clean up
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [watchFiles]);
  // Set default form values when profiledata is available
  useEffect(() => {
    if (profiledata) {
      methods.reset({
        fullname: profiledata?.data.user?.fullname || '',
        phoneNumber: profiledata?.data.user?.phoneNumber || '',
        address: profiledata?.data.address || '',
        state: profiledata?.data?.state || '',
        city: profiledata?.data.city || '',
        email: profiledata?.data.user?.email || '',
        username: profiledata?.data.user?.username || '',
        googleRating: profiledata?.data.googleRating || '',
        facebook: profiledata?.data.facebook || '',
        instagram: profiledata?.data.instagram || '',
        youtube: profiledata?.data.youtube || '',
        // password: profiledata?.data.user?.password, // Keep password field empty for security
      });
    }
  }, [profiledata, methods]);

  const onSubmit = async (data: FormValues) => {
    const selectedFile =
      watchFiles instanceof FileList && watchFiles.length > 0
        ? watchFiles[0]
        : undefined;

    let base64Image = '';
    if (selectedFile) {
      base64Image = await convertFileToBase64(selectedFile);
    }

    const updateData = {
      caterorId: user?.caterorId || '',
      fullname: data.fullname,
      phoneNumber: data.phoneNumber,
      email: data.email,
      address: data.address,
      state: data.state,
      city: data.city,
      username: data.username,
      password: data.password?.trim() || '',
      googleRating: data.googleRating,
      facebook: data.facebook,
      instagram: data.instagram,
      youtube: data.youtube,
      image: base64Image || '', // 👈 send base64 image here
    };

    updateCateror(updateData);
  };

  // Utility function
  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className="space-y-4 bg-white p-8 dark:bg-black"
      >
        <div className="rounded-lg bg-white">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <h1 className="text-gray-800 text-xl font-semibold">
              Update Your Profile
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:gap-6">
          <div className="col-span-12 md:col-span-6">
            <GenericInputField
              name="fullname"
              label="Full Name"
              placeholder="Enter your Full Name"
            />
          </div>

          <div className="col-span-12 md:col-span-6">
            <GenericInputField
              name="phoneNumber"
              label="Phone Number"
              placeholder="Enter the Phone Number"
            />
          </div>

          <div className="col-span-12 md:col-span-full">
            <GenericTextArea
              name="address"
              label="Residential Address"
              placeholder="Enter the Residential Address"
            />
          </div>

          <div className="col-span-12 md:col-span-6">
            <GenericSearchDropdown
              name="state"
              label="State"
              options={[
                {label: 'Andhra Pradesh', value: 'Andhra Pradesh'},
                {label: 'Arunachal Pradesh', value: 'Arunachal Pradesh'},
                {label: 'Assam', value: 'Assam'},
                {label: 'Bihar', value: 'Bihar'},
                {label: 'Chhattisgarh', value: 'Chhattisgarh'},
                {label: 'Goa', value: 'Goa'},
                {label: 'Gujarat', value: 'Gujarat'},
                {label: 'Haryana', value: 'Haryana'},
                {label: 'Himachal Pradesh', value: 'Himachal Pradesh'},
                {label: 'Jharkhand', value: 'Jharkhand'},
                {label: 'Karnataka', value: 'Karnataka'},
                {label: 'Kerala', value: 'Kerala'},
                {label: 'Madhya Pradesh', value: 'Madhya Pradesh'},
                {label: 'Maharashtra', value: 'Maharashtra'},
                {label: 'Manipur', value: 'Manipur'},
                {label: 'Meghalaya', value: 'Meghalaya'},
                {label: 'Mizoram', value: 'Mizoram'},
                {label: 'Nagaland', value: 'Nagaland'},
                {label: 'Odisha', value: 'Odisha'},
                {label: 'Punjab', value: 'Punjab'},
                {label: 'Rajasthan', value: 'Rajasthan'},
                {label: 'Sikkim', value: 'Sikkim'},
                {label: 'Tamil Nadu', value: 'Tamil Nadu'},
                {label: 'Telangana', value: 'Telangana'},
                {label: 'Tripura', value: 'Tripura'},
                {label: 'Uttar Pradesh', value: 'Uttar Pradesh'},
                {label: 'Uttarakhand', value: 'Uttarakhand'},
                {label: 'West Bengal', value: 'West Bengal'},
                {label: 'Delhi', value: 'Delhi'},
                {label: 'Puducherry', value: 'Puducherry'},
              ]}
              defaultOption=""
            />
          </div>

          <div className="col-span-12 md:col-span-6">
            <GenericInputField
              name="city"
              label="City"
              placeholder="Enter your City"
            />
          </div>

          <div className="col-span-12 md:col-span-6">
            <GenericInputField
              name="email"
              label="Email"
              placeholder="Enter your Email"
              disabled
            />
          </div>

          <div className="col-span-12 md:col-span-6">
            <GenericInputField
              name="username"
              label="Username"
              placeholder="Enter your Username"
              disabled
            />
          </div>
          <div className="col-span-12 md:col-span-6">
            <GenericInputField
              name="password"
              label="Password"
              placeholder="Enter the Password"
              type="password"
            />
          </div>
          <div className="col-span-12 md:col-span-6">
            <GenericInputField
              name="googleRating"
              label="Google Rating Link"
              placeholder="Enter your Google Rating Link"
            />
          </div>
          <div className="col-span-12 md:col-span-6">
            <GenericInputField
              name="facebook"
              label="Facebook Link"
              placeholder="Enter your Facebook Link"
            />
          </div>
          <div className="col-span-12 md:col-span-6">
            <GenericInputField
              name="instagram"
              label="Instagram Link"
              placeholder="Enter your Instagram Link"
            />
          </div>
          <div className="col-span-12 md:col-span-6">
            <GenericInputField
              name="youtube"
              label="Youtube Link"
              placeholder="Enter your Youtube Link"
            />
          </div>

          <div className="col-span-12 md:col-span-6">
            <input
              type="file"
              {...methods.register('imageFile')}
              className="mt-10 bg-white file:mr-4 file:rounded-full file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100 dark:bg-black"
              multiple={false}
              accept="image/*" // Only accept image files
            />
            {imageError && (
              <p className="mt-2 text-sm text-red-600">{imageError}</p>
            )}
            {imageUrl && (
              <div className="mt-4">
                <img
                  src={imageUrl}
                  alt="Profile Preview"
                  className="h-auto max-h-48 w-full rounded-md object-cover"
                />
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-4">
          <GenericButton type="submit">Save</GenericButton>
        </div>
      </form>
    </FormProvider>
  );
};

export default Profile;
