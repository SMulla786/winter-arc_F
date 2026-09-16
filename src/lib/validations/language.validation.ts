import {z} from 'zod';

const codeSchema = z.string().min(1, 'Code is required');
const nameSchema = z.string().min(1, 'Name is required');

const createLanguageSchema = z.object({
  code: codeSchema,
  name: nameSchema,
});

const updateLanguageSchema = z.object({
  code: codeSchema.optional(),
  name: nameSchema.optional(),
});

const queryLanguagesSchema = z.object({
  page: z.number().min(1, 'Page must be greater than 0').default(1),
  limit: z.number().min(1, 'Limit must be greater than 0').default(10),
  searchTerm: z.string().optional().default(''),
});

const getLanguageByIdSchema = z.object({
  id: z.string().uuid('Invalid ID format'),
});

export default {
  codeSchema,
  nameSchema,
  createLanguageSchema,
  updateLanguageSchema,
  queryLanguagesSchema,
  getLanguageByIdSchema,
};
