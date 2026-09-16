import {z} from 'zod';

const utensilcategorySchema = z.object({
  utensilCategoryName: z
    .string({required_error: 'Utensil Category is required'})
    .min(3, {message: 'Utensil Category must be at least 3 characters long'}),

  language: z.string({required_error: 'Language is required'}),
});

const utensilcategorycaterorSchema = z.object({
  cutleryCategoryName: z
    .string({required_error: 'Utensil Category is required'})
    .min(3, {message: 'Utensil Category must be at least 3 characters long'}),
});

const utensilSchema = z.object({
  utensilName: z
    .string({required_error: 'Utensil Name is required'})
    .min(3, {message: 'Utensil Name must be at least 3 characters long'}),

  inventory: z.string().nonempty('Inventory is required'),

  utensilCategory: z.string({required_error: 'Utensil Category is required'}),
});

export const cutlerymasterSchema = z.object({
  cutleryName: z
    .string({required_error: 'Cutlery Name is required'})
    .min(3, {message: 'Cutlery Name must be at least 3 characters long'}),

  inventory: z.string().nonempty('Inventory is required'),

  cutleryCategory: z.string({required_error: 'Cutlery Category is required'}),
});

const updateutensilcategorySchema = z.object({
  utensilCategoryName: z
    .string({required_error: 'Utensil Category is required'})
    .min(3, {message: 'Utensil Category must be at least 3 characters long'}),
});

const updateutensilSchema = z.object({
  utensilName: z
    .string({required_error: 'Utensil Category is required'})
    .min(3, {message: 'Utensil Category must be at least 3 characters long'}),

  inventory: z.string().nonempty('Inventory is required'),
});

export {
  utensilcategorySchema,
  utensilSchema,
  updateutensilcategorySchema,
  updateutensilSchema,
  utensilcategorycaterorSchema,
};
