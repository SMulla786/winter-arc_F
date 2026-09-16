/*eslint-disable*/
import {api} from '@/utils/axios';
import {AxiosError} from 'axios';
import {z} from 'zod';

const DishGroupSchema = z.object({
  category: z.string(),
  dishes: z.array(z.string()),
  count: z.number().int().positive(),
});

// Schema for items in extraDishes
const ExtraDishSchema = z.object({
  category: z.string(),
  dishes: z.string(),
  Rate: z.number().int().positive(),
});
const RangePriceSchema = z.object({
  from: z.number().int().positive(),
  to: z.number().int().positive(),
  price: z.number().int().positive(),
});

export const PayloadSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.coerce.number().int().nonnegative(),
  mainDishes: z.array(DishGroupSchema).nonempty().min(1),
  extraDishes: z.array(ExtraDishSchema).optional(),
  range: z.array(RangePriceSchema).nonempty(),
});
type Payload = z.infer<typeof PayloadSchema>;
export const createPackage = async (data: Payload) => {
  try {
    const response = await api.post('cateror/packages', data);
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

export const getPackageById = async (id: string) => {
  try {
    console.log('Fetching package with ID:', id);
    const response = await api.get(`cateror/packages/${id}`);
    console.log('Fetched package:', response.data);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to fetch Package',
      );
    }
    throw error;
  }
};

export const updatePackage = async (id: string, data: any) => {
  try {
    const response = await api.put(`cateror/packages/${id}`, data);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to update Package',
      );
    }
    throw error;
  }
};
