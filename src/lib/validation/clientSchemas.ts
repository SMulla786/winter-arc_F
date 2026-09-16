import {z} from 'zod';

const clientValidationSchema = z
  .object({
    fullname: z
      .string({required_error: 'Name is required'})
      .min(2, {message: 'Name must be at least 2 characters long'}),
    phoneNo: z
      .string({required_error: 'Phone number is required'})
      .min(10, {message: 'Phone number must be at least 10 characters long'}),
    secondaryPhoneNo: z.string().optional(),
    email: z.string().email().optional(),
    username: z.string({required_error: 'username is required'}).optional(),
    address: z
      .string({required_error: 'address is required'})
      .min(2, {message: 'address is required'}),
    caste: z.string({required_error: 'caste is required'}),
    panNumber: z.string().optional(),
    gstNumber: z.string().optional(),
    companyName: z.string().optional(),
    companyAddress: z.string().optional(),

    // anniversary: z.coerce.date().optional(),
    // birthday: z.coerce.date().optional(),
    birthday: z
      .union([z.string().length(0), z.coerce.date()])
      .optional()
      .transform((val) => (val instanceof Date ? val : undefined)),

    anniversary: z
      .union([z.string().length(0), z.coerce.date()])
      .optional()
      .transform((val) => (val instanceof Date ? val : undefined)),
  })
  .transform((data) => ({
    ...data,
    username: data.phoneNo,
  }));

const updateClientValidationSchema = z.object({
  fullname: z
    .string({required_error: 'Name is required'})
    .min(2, {message: 'Name must be at least 2 characters long'}),
  phoneNo: z
    .string({required_error: 'Phone number is required'})
    .min(10, {message: 'Phone number must be at least 10 characters long'}),
  secondaryPhoneNo: z.string().optional(),
  email: z
    .string({required_error: 'Email is required'})
    .min(3, {message: 'Email must be at least 3 characters long'})
    .email({message: 'Invalid email address'}),
  address: z
    .string({required_error: 'address is required'})
    .min(2, {message: 'address is required'}),
  caste: z.string().optional(),
  panNumber: z.string().optional(),
  gstNumber: z.string().optional(),
  companyName: z.string().optional(),
  companyAddress: z.string().optional(),

  birthday: z
    .union([z.string().length(0), z.coerce.date()])
    .optional()
    .transform((val) => (val instanceof Date ? val : undefined)),

  anniversary: z
    .union([z.string().length(0), z.coerce.date()])
    .optional()
    .transform((val) => (val instanceof Date ? val : undefined)),
});

export {clientValidationSchema, updateClientValidationSchema};
