import z from 'zod';

const createQuotationSchema = z.object({
  name: z.string().min(1, {message: 'Name is required'}),
  amount: z.number({
    required_error: 'Amount is required',
    invalid_type_error: 'Expected number, received string',
  }),
  description: z.string().min(1, {message: 'Description is required'}),
});

export {createQuotationSchema};
