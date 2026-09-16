import {z} from 'zod';

const idSchema = z.string().uuid('Invalid ID');
const caterorIdSchema = z.string().uuid('Invalid cateror ID');
const languageIdSchema = z.string().uuid('Invalid language ID');

const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).default(10),
});

const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(100),
  languageId: languageIdSchema,
  caterorId: caterorIdSchema.optional(),
});

const addCategorySchema = categorySchema;

const updateCategorySchema = categorySchema.extend({
  id: idSchema,
});

const getCategoriesQuerySchema = paginationSchema.extend({
  caterorId: caterorIdSchema.optional(),
});

const utensilSchema = z.object({
  name: z.string().min(1, 'Utensil name is required').max(100),
  categoryId: idSchema,
  languageId: languageIdSchema,
  caterorId: caterorIdSchema.optional(),
});

const addUtensilSchema = utensilSchema;

const updateUtensilSchema = utensilSchema.extend({
  id: idSchema,
});

const getUtensilsQuerySchema = paginationSchema.extend({
  search: z.string().optional(),
  languageId: languageIdSchema,
  caterorId: caterorIdSchema.optional(),
});

export default {
  idSchema,
  caterorIdSchema,
  languageIdSchema,
  paginationSchema,
  categorySchema,
  addCategorySchema,
  updateCategorySchema,
  getCategoriesQuerySchema,
  utensilSchema,
  addUtensilSchema,
  updateUtensilSchema,
  getUtensilsQuerySchema,
};
