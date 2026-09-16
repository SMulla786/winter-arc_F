import {z} from 'zod';

import {
  emailSchema,
  usernameSchema,
  fullnameSchema,
  phoneNumberSchema,
} from './custom.validation';

const idSchema = z.string().uuid();

const userBaseSchema = z.object({
  email: emailSchema,
  username: usernameSchema,
  fullname: fullnameSchema,
  phoneNumber: phoneNumberSchema,
  secondaryPhoneNumber: phoneNumberSchema.optional(),
});

const registerMaharajSchema = userBaseSchema.extend({
  isAvailable: z.boolean().optional(),
  specialization: z.array(z.string()).optional(),
  experience: z.number().optional(),
  caterorId: idSchema,
});

const updateMaharajSchema = z.object({
  isAvailable: z.boolean().optional(),
  specialization: z.array(z.string()).optional(),
  experience: z.number().optional(),
  caterorId: idSchema.optional(),
});

const getMaharajByIdSchema = z.object({
  id: idSchema,
});

const queryMaharajsSchema = z.object({
  page: z.number().default(1),
  limit: z.number().default(10),
  searchTerm: z.string().optional(),
});

export default {
  registerMaharajSchema,
  updateMaharajSchema,
  getMaharajByIdSchema,
  queryMaharajsSchema,
};
