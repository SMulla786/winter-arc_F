import {z} from 'zod';

export const addOnServiceSchema = z.object({
  name: z.string().min(3, 'Name is required'),
  price: z.preprocess(
    (val) => Number(val),
    z.number().min(0, 'Price must be a positive number'),
  ),
});
