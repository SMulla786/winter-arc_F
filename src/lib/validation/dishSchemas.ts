import {z} from 'zod';
import {caterorId} from '../contants';
import {getAmountNotification} from '../api/Notification';

const rawMaterialCategoryValidationSchema = z.object({
  Name: z
    .string({required_error: 'Category Name is required'})
    .min(2, {message: 'Name must be at least 2 characters long'}),
});

const rawMaterialValidationSchema = z.object({
  name: z.string().min(1, 'Raw material name is required').max(100),
  unit: z.enum(['BOTTLE', 'GRAM', 'KILOGRAM', 'LITRE', 'PIECE', 'METER']),
  rawMaterialCategory: z.string().min(1, 'Raw material category is required'),
});

const updaterawMaterialValidationSchema = z.object({
  name: z.string().min(1, 'Raw material name is required').max(100),
  unit: z.enum(['BOTTLE', 'GRAM', 'KILOGRAM', 'LITRE', 'PIECE', 'METER']),
  rawMaterialCategory: z.string().min(1, 'Raw material category is required'),
});

const bulkAddDishRawMaterialsSchema = z.object({
  DishID: z.string().uuid({message: 'Dish ID must be a valid UUID'}),
  PeopleCount: z
    .number()
    .positive({message: 'People count must be a positive number'}),
  UnitPrices: z
    .number()
    .positive({message: 'Unit prices must be a positive number'}),
  rawMaterials: z.array(
    z.object({
      RawMaterialID: z
        .string()
        .uuid({message: 'Raw Material ID must be a valid UUID'}),
      Quantity: z
        .number()
        .positive({message: 'Quantity must be a positive number'}),
    }),
  ),
});

const dishCategoryValidationSchema = z.object({
  name: z
    .string({required_error: 'Category Name is required'})
    .min(2, {message: 'Name must be at least 2 characters long'}),

  languageId: z.string({required_error: 'Language is required'}).optional(),
});

const dishValidationSchema = z.object({
  DishName: z
    .string({required_error: 'Dish Name is required'})
    .min(2, {message: 'Name must be at least 2 characters long'}),
  CategoryID: z
    .string({required_error: 'Category ID is required'})
    .uuid({message: 'Category ID must be a valid UUID'}),
});

const dishMasterSchema = z.object({
  name: z.string().min(1, 'Dish name is required').max(100),
  description: z.string().optional(),
  dishCategory: z.string().min(1, 'Dish Category is required'),
  language: z.string().min(1, 'Language is required'),
  priority: z.enum(['P1', 'P2', 'P3']),
  columns: z
    .array(
      z.object({
        id: z.number(),
        people: z.string().nonempty('People is required'),
        kg: z.string().nonempty('Kg is required'),
      }),
    )
    .optional(),
  rawMaterials: z
    .array(
      z.object({
        id: z.number(),
        rawMaterial: z.string().nonempty('Raw material is required'),
        process: z.string().nonempty('Process is required'),
        unit: z.string().optional(),
        name: z.string().optional(),
        quantities: z.record(z.string(), z.string().optional()),
      }),
    )
    .optional(),
});
const dishMasterSchemaCat = z.object({
  name: z.string().min(1, 'Dish name is required').max(100),
  // description: z.string().optional(),
  dishCategory: z.string().min(1, 'Dish Category is required'),
  unit: z.string().optional(),
  // portionSize: z.preprocess((val) => {
  //   if (val === undefined || val === null) return undefined;
  //   if (typeof val === 'string' && val.trim() === '') return undefined;

  //   const num = Number(val);
  //   return Number.isNaN(num) ? undefined : num;
  // }, z.number().min(0.1).optional()),
  portionSize: z.preprocess((val) => {
    if (val === undefined || val === null) return undefined;
    if (typeof val === 'string' && val.trim() === '') return undefined;

    const num = Number(val);
    return Number.isNaN(num) ? undefined : num;
  }, z.number().min(0).optional()),

  vegNonveg: z.enum(['VEG', 'NONVEG']),
  description: z.string().optional(),
  isOutSourced: z.boolean().optional(),
  outSourceVendor: z.string().optional(),
});
// Define the schema for each raw material entry
const rawMaterialWithQuantityAndPriceSchema = z.object({
  rawMaterials: z.string().nonempty('Raw material must be selected.'),
  quantity: z
    .string()
    .nonempty('Quantity is required.')
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: 'Quantity must be a positive number.',
    }),
  process: z.string().nonempty('Process must be selected.'),
});

// Define the main schema for the form
const addRawMaterialToDishSchema = z.object({
  people: z.number().min(1, 'At least one raw material is required.'),
  kg: z
    .number()
    .min(0.1, 'At least one raw material is required.')
    .refine((val) => val % 1 !== 0, {
      message: 'Quantity must be a decimal number.',
    }),
  price: z.number().min(1, 'At least one raw material is required.'),
  rawMaterialsWithQuantityAndPrice: z
    .array(rawMaterialWithQuantityAndPriceSchema)
    .min(1, 'At least one raw material is required.'),
});

const copyDataValidationSchema = z.object({
  CaterorId: z.string().min(1, 'Cateror is required').max(100),
});

export const copyDataUtensilsSchema = z.object({
  caterorId: z.string().min(1, 'Cateror is required'),
  languageId: z.string().min(1, 'Language ID is required'),
  utensils: z
    .array(
      z.object({
        utensilId: z.string().min(1, 'Utensil ID is required'),
        quantity: z.number().min(1).optional(), // optional if backend defaults to 1
      }),
    )
    .min(1, 'Select at least one  utensil'),
});

export {
  dishMasterSchemaCat,
  rawMaterialCategoryValidationSchema,
  rawMaterialValidationSchema,
  dishCategoryValidationSchema,
  dishValidationSchema,
  bulkAddDishRawMaterialsSchema,
  dishMasterSchema,
  updaterawMaterialValidationSchema,
  addRawMaterialToDishSchema,
  copyDataValidationSchema,
};
