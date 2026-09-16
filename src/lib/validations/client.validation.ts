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

const registerClientSchema = userBaseSchema.extend({
  address: z.string().optional(),
  caste: z.string().optional(),
  caterorId: idSchema,
});

const queryClientsSchema = z.object({
  page: z.number().default(1),
  limit: z.number().default(10),
  searchTerm: z.string().optional(),
});

const getClientByIdSchema = z.object({
  id: idSchema,
});

const updateClientSchema = z.object({
  address: z.string().optional(),
  caste: z.string().optional(),
  caterorId: idSchema.optional(),
});

export default {
  registerClientSchema,
  queryClientsSchema,
  getClientByIdSchema,
  updateClientSchema,
};
