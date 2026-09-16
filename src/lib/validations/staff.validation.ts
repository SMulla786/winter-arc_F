import {z} from 'zod';
import {password} from './custom.validation';

const registerStaffSchema = z.object({
  username: z.string().min(1, {message: 'Username is required'}),
  email: z.string().email({message: 'Invalid email address'}),
  fullname: z.string().min(1, {message: 'Fullname is required'}),
  password: password,
  phoneNumber: z.string().min(10, {message: 'Phone number is required'}),
  secondaryPhoneNumber: z.string().optional(),
  jobTitle: z.string().min(1, {message: 'Job title is required'}),
  address: z.string().optional(),
  isAvailable: z.boolean().optional(),
  caterorId: z.string().uuid({message: 'Invalid Cateror ID'}),
  loginEnabled: z.boolean().default(false),
});

const queryStaffsSchema = z.object({
  page: z.number().default(1),
  limit: z.number().default(10),
  searchTerm: z.string().optional(),
});

const getStaffByIdSchema = z.object({
  id: z.string().uuid({message: 'Invalid Staff ID'}),
});

const updateStaffSchema = z.object({
  jobTitle: z.string().optional(),
  address: z.string().optional(),
  isAvailable: z.boolean().optional(),
});

export default {
  registerStaffSchema,
  queryStaffsSchema,
  getStaffByIdSchema,
  updateStaffSchema,
};
