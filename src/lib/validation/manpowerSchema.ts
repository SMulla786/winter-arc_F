// manpowerSchema.ts
import {z} from 'zod';

const manpowerSchema = z.object({
  cooks: z.string().min(0, 'Price must be positive'),
  femaleWaiters: z.string().min(0, 'Price must be positive'),
  helpers: z.string().min(0, 'Price must be positive'),
  waiters: z.string().min(0, 'Price must be positive'),
  washers: z.string().min(0, 'Price must be positive'),
  manager: z.string().min(0, 'Price must be positive'),
});

export {manpowerSchema};
