import {z} from 'zod';

export const managerpostSchema = z.object({
  name: z.string().min(1, 'Name is required'),
});
export const eventTypeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
});

export const servicePostSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  price: z.string().min(1, 'Price is required'),
});

export const assignManagerSchema = z.object({
  managerId: z.string().min(1, 'Manager is required'),
  employeeId: z.string().min(1, 'Employee is required'),
});
