import {z} from 'zod';

const rawmaterialcategorySchema = z.object({
  name: z
    .string({required_error: 'Language is required'})
    .min(3, {message: 'Language must be at least 3 characters long'}),

  language: z.string({required_error: 'Language is required'}),
});
const rawmaterialcategoryCaterorSchema = z.object({
  name: z
    .string({required_error: 'Language is required'})
    .min(3, {message: 'Language must be at least 3 characters long'}),
});

const updaterawmaterialcategorySchema = z.object({
  name: z.string().nonempty('Name is required'),
  languageId: z.string().optional(), // add this if it's missing
});
const updaterawmaterialcategoryCaterorSchema = z.object({
  name: z.string().nonempty('Name is required'),
  unit: z.string().nonempty('Unit is required'),
  category: z.string().nonempty('Category is required'),
  amount: z.preprocess(
    (val) => Number(val),
    z.number().positive({message: 'Amount must be a positive number'}),
  ),
  inventory: z.preprocess(
    (val) => Number(val) || 0,
    z.number().nonnegative({message: 'Inventory must be a positive number'}),
  ),
});

export {
  rawmaterialcategorySchema,
  updaterawmaterialcategorySchema,
  rawmaterialcategoryCaterorSchema,
  updaterawmaterialcategoryCaterorSchema,
};
