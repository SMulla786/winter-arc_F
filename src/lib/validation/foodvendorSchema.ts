import {z} from 'zod';

export const foodVendorSchema = z.object({
  name: z.string().min(3, 'Name is required'),

  phone: z
    .string({required_error: 'Phone Number is required'})
    .length(10, {message: 'Phone Number must contain exactly 10 digits'})
    .regex(/^\d+$/, {message: 'Phone Number must contain only numbers'}),

  address: z
    .string({required_error: 'Residential Address is required'})
    .min(5, {
      message: 'Residential Address must be at least 5 characters long',
    })
    .max(100, {message: 'Residential Address cannot exceed 100 characters'}),
  // email: z.string({required_error: 'Email is required'}).optional(),
});

//  Display Validation Schema
export const addFoodVendorSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().regex(/^\d{10}$/, 'Phone number must be 10 digits'),
  address: z.string().min(1, 'Address is required'),
  amount: z
    .string()
    .min(1, 'Amount is required')
    .transform((val) => Number(val)),
  image: z.any().optional(),
});
