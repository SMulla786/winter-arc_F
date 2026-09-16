import {z} from 'zod';
import {password} from './custom.validation';

const idSchema = z.string().uuid();
const stringNonEmptySchema = z.string().min(1);
const phoneNumberSchema = z.string().min(10);

const userBaseSchema = z.object({
  email: z.string().email(),
  username: stringNonEmptySchema,
  fullname: stringNonEmptySchema,
  password: password,
  phoneNumber: phoneNumberSchema,
  secondaryPhoneNumber: z.string().optional(),
});

const caterorCommonFields = z.object({
  address: stringNonEmptySchema,
  plan: stringNonEmptySchema,
  amount: z.preprocess(
    (val) => Number(val),
    z
      .number({required_error: 'Amount is required'})
      .min(1, {message: 'Amount must be greater than 0'})
      .positive({message: 'Amount must be a positive number'}),
  ),

  renewalAmount: z.preprocess(
    (val) => Number(val),
    z
      .number({required_error: 'Renewal Amount is required'})
      .min(1, {message: 'Renewal Amount must be greater than 0'})
      .positive({message: 'Renewal Amount must be a positive number'}),
  ),
  languageId: idSchema,
});

const registerCaterorSchema = userBaseSchema.merge(caterorCommonFields);

const updateCaterorSchema = caterorCommonFields.partial();

const queryCaterorsSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).default(10),
  searchTerm: z.string().optional().default(''),
});

const getCaterorByIdSchema = z.object({
  id: idSchema,
});

const updatecaterorSchema = z.object({
  fullname: z
    .string({required_error: 'Full Name is required'})
    .min(3, {message: 'Name must be at least 3 characters long'}),

  phoneNumber: z.preprocess(
    (val) => (typeof val === 'string' ? val.trim() : val),
    z
      .string({required_error: 'Phone Number is required'})
      .length(10, {message: 'Phone Number must contain exactly 10 digits'})
      .regex(/^\d+$/, {message: 'Phone Number must contain only numbers'}),
  ),

  email: z
    .string({required_error: 'Email is required'})
    .email({message: 'Invalid email address'}),

  address: z
    .string({required_error: 'Residential Address is required'})
    .min(5, {message: 'Residential Address must be at least 5 characters long'})
    .max(100, {message: 'Residential Address cannot exceed 100 characters'}),

  state: z.string({required_error: 'State is required'}),
  city: z.string({required_error: 'City is required'}),
  plan: z.string({required_error: 'Plan is required'}),

  extraUsers: z.coerce
    .number()
    .positive({message: 'Extra Users must be a positive number'}),

  amount: z.preprocess(
    (val) => Number(val),
    z
      .number({required_error: 'Amount is required'})
      .min(1, {message: 'Amount must be greater than 0'}),
  ),

  renewalAmount: z.preprocess(
    (val) => Number(val),
    z
      .number({required_error: 'Renewal Amount is required'})
      .min(1, {message: 'Renewal Amount must be greater than 0'}),
  ),

  startDate: z
    .string({required_error: 'Start date is required'})
    .regex(/^\d{4}-\d{2}-\d{2}$/, {message: 'Invalid date format (YYYY-MM-DD)'})
    .refine(
      (date) => {
        const inputDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        inputDate.setHours(0, 0, 0, 0);
        return inputDate >= today;
      },
      {message: 'Start date cannot be in the past'},
    ),

  expiryDate: z
    .string({required_error: 'Expiry date is required'})
    .regex(/^\d{4}-\d{2}-\d{2}$/, {message: 'Invalid date format (YYYY-MM-DD)'})
    .refine(
      (date) => {
        const inputDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        inputDate.setHours(0, 0, 0, 0);
        return inputDate >= today;
      },
      {message: 'Expiry date cannot be in the past'},
    ),

  languageId: z.string({required_error: 'Language is required'}),

  refId: z.string().optional().or(z.literal('')),

  username: z.string({required_error: 'Username is required'}),

  password: z.string().optional(),
});

export {
  registerCaterorSchema,
  updateCaterorSchema,
  updatecaterorSchema,
  queryCaterorsSchema,
  getCaterorByIdSchema,
};
