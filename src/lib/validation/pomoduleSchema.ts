import {z} from 'zod';

export const eventPOValidationSchema = z.object({
  date: z.string().nonempty('Date is required'),
  eventId: z.string().nonempty('Event selection is required'),
  categories: z.array(z.string()).optional(),
});

export const poSubmissionValidationSchema = z.object({
  materials: z.array(
    z.object({
      materialId: z.string(),
      quantity: z.number(),
      date: z.string().nonempty('Date is required'), // Changed from z.date() to z.string()
      time: z.string().nonempty('Time is required'), // Changed from z.date() to z.string()
      venue: z.string(),
    }),
  ),
});
