import {profileSchema} from '@/lib/validation/profileSchemas';
import {IdAndToken} from '@/types';
import {api} from '@/utils/axios';
import {AxiosError} from 'axios';
import {z} from 'zod';

// type UpdateCaterorTypes = z.infer<typeof profileSchema>;

// export const updateCaterorProfile = async ({
//   id,
//   ...data
// }: UpdateCaterorTypes & IdAndToken) => {
//   console.log('Fixed Submitted data:', data);

//   try {
//     const res = await api.put(`/cateror/cateror/${id}`, data); // Ensure ID is correctly passed in the URL
//     return res;
//   } catch (error) {
//     if (error instanceof AxiosError) {
//       throw new Error(
//         error.response?.data?.message || 'Failed to update cateror',
//       );
//     }
//     throw error;
//   }
// };

export const updateCaterorProfile = async (
  caterorId: string,
  fullname: string,
  email: string,
  phoneNumber: string,
  address: string,
  state: string,
  city: string,
  username: string,
  googleRating: string,
  facebook: string,
  instagram: string,
  youtube: string,
  password?: string,
  image?: string, // 👈 Base64 string
) => {
  try {
    const payload = {
      fullname,
      email,
      phoneNumber,
      address,
      state,
      city,
      username,
      googleRating,
      facebook,
      instagram,
      youtube,
      password,
      image, // 👈 base64 image string
    };

    const response = await api.put(`/cateror/cateror/${caterorId}`, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error in updateCaterorProfile:', error);
    throw error;
  }
};
