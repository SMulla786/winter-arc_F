import {api} from '@/utils/axios';
import {AxiosError} from 'axios';
import {CaterorRegister} from '@/types/admin';
import {IdAndToken} from '@/types';
import {updateCaterorSchema} from '@/lib/validations/cateror.validation';
import {z} from 'zod';

type UpdateCaterorTypes = z.infer<typeof updateCaterorSchema>;

const registerCateror = async (data: CaterorRegister) => {
  try {
    const res = await api.post('/admin/cateror', data);
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'failed to register cateror',
      );
    }
    throw error;
  }
};

const getCaterors = async () => {
  try {
    const res = await api.get('/admin/cateror');
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to get caterors',
      );
    }
    throw error;
  }
};

const getCaterorById = async (data: IdAndToken) => {
  try {
    const res = await api.get(`admin/cateror/${data.id}`);
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'failed to get cateror');
    }
    throw error;
  }
};

const updateCateror = async ({
  id,
  ...data
}: UpdateCaterorTypes & IdAndToken) => {
  console.log('Fixed Submitted data:', data);

  try {
    const res = await api.patch(`/admin/cateror/${id}`, data); // Ensure ID is correctly passed in the URL
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to update cateror',
      );
    }
    throw error;
  }
};

const deleteCateror = async (id: string) => {
  try {
    const res = await api.delete(`/admin/cateror/${id}`);
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'failed to update cateror',
      );
    }
    throw error;
  }
};

export {
  registerCateror,
  getCaterors,
  getCaterorById,
  updateCateror,
  deleteCateror,
};
