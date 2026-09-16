import {api} from '@/utils/axios';
import {AxiosError} from 'axios';
import {z} from 'zod';
import {PayloadSchema} from '@/lib/api/cateror/package';

type Payload = z.infer<typeof PayloadSchema>;
export const getPackages = async (data?: Partial<Payload>) => {
  try {
    const response = await api.get('cateror/packages');
    console.log('responseeeeeeeeee', response);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to get Packages',
      );
    }
    throw error;
  }
};

export const getPackagesExternal = async (id: string) => {
  try {
    const response = await api.get(`packages/${id}`);
    // console.log('responseeeeeeeeee', response);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to get Packages',
      );
    }
    throw error;
  }
};
export const deletePackage = async (id: string) => {
  //console.log('delete iddddddd', id);
  const response = await api.delete(`cateror/packages/${id}`);
  //console.log('deleteeeeeeeeee', response);

  return response.data;
};

export const getPackagesdata = async (data: {id: string}) => {
  try {
    const response = await api.get(`cateror/packages/${data.id}`);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to get Package by ID',
      );
    }
    throw error;
  }
};
