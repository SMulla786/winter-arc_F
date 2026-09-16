import {z} from 'zod';

export const crmSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
});

export const updateCRM = z.object({
  id: z.string().min(1, 'ID is required'),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
});

export const eventCRM = z.object({
  status: z.string().optional(),
  processId: z.string().min(1, 'CRM Process is required'),
  fullname: z.string().min(1, 'Employee is required'),
  note: z.string().optional(),
  followupDate: z.string().min(1, 'Follow-up date is required'),
  imageFile: z.any().optional(),
  eventSelect: z.string().optional(),
});
