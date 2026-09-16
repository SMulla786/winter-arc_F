/* eslint-disable */
import {z} from 'zod';

// Define the schema for material validation
export const materialSchema = z.object({
  materialId: z.string().nonempty('Material ID is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  time: z
    .string()
    .regex(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
      'Time must be in ISO 8601 format',
    ),
  venue: z.string().nonempty('Venue is required'),
  actual: z.number().min(0, 'Actual must be non-negative').optional(),
  price: z.number().min(0, 'Price must be non-negative'),
  reason: z.string().optional(),
});

// Define the schema for form validation
export const storeSchema = z
  .object({
    type: z.enum(['INWORD', 'OUTWORD'], {message: 'Select a valid type'}),
    subtype: z.string().optional(),
    event: z.string().optional(),
    poId: z.string().optional(),
    listNo: z.string().optional(),
    category: z.string().optional(),
    materials: z.array(materialSchema).optional(),
  })
  .refine(
    (data) => {
      if (data.subtype === 'PO') {
        return !!data.listNo && !!data.poId && !!data.event;
      }
      return true;
    },
    {
      message: 'PO List Number, PO ID, and Event are required for PO type',
      path: ['listNo'],
    },
  );

export interface Material {
  id: string;
  name: string;
  category: Category;
  categoryId: string;
  unit: string;
  amount: number;
  inventory: number;
}

export interface SelectedMaterial extends Material {
  quantity: number;
  date: string;
  time: string;
  venue: string;
  actual?: number;
  price: number;
}

export interface Category {
  id: string;
  name: string;
}

export interface Event {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  venue?: string;
  subEvents: any[];
}

export interface PurchaseOrder {
  id: string;
  listNo: number;
  eventId: string;
  PurchaseMaterial: any[];
}
