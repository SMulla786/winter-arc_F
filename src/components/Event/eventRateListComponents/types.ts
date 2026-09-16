import DisplayVendor from '@/components/Vendor/DisplayVendor';
import {z} from 'zod';

export const RateCalculatorSchema = z.object({
  subEvents: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      vendorAssignments: z.array(
        z.object({
          id: z.string().optional(),
          vendorId: z.string().min(1, 'Vendor is required'),
          count: z.number().min(0, 'Count must be positive'),
          price: z.number().min(0, 'Price must be positive'),
          roleId: z.string().min(1, 'Role is required'),
          transport: z.number().min(0, 'Transport must be positive'),
        }),
      ),
      displayVendors: z
        .array(
          z.object({
            id: z.string().optional(),
            displayVendorId: z.string().min(1, 'Display Vendor is required'),
            displayId: z.string().min(1, 'Display is required'),
            quantity: z.number().min(0, 'Quantity must be positive'),
            price: z.number().min(0, 'Price must be positive'),
            totalPrice: z.number().min(0, 'Total price must be positive'),
          }),
        )
        .default([]),
      foodVendorAssignments: z
        .array(
          z.object({
            foodVendorId: z.string().min(1, 'Food Vendor is required'),
            id: z.string().min(1, 'Id is required'),
            price: z.number().min(0, 'Price must be positive'),
            includeRawMaterial: z.boolean(),
            expected: z.number().min(0, 'Expected quantity must be positive'),
            preparation: z
              .number()
              .min(0, 'Preparation quantity must be positive'),
            singlePrice: z.number().min(0, 'Single price must be positive'),
            unit: z.enum([
              'LITRE',
              'GRAM',
              'KILOGRAM',
              'BOTTLE',
              'PIECE',
              'METER',
              'PACKET',
              'BUNDLE',
            ]),
          }),
        )
        .default([]),
      rawMaterial: z.number().min(0, 'Raw material must be positive'),
      extraCost: z
        .array(
          z.object({
            id: z.string().optional(),
            additionalVendorId: z.string().min(1, 'Vendor is required'),
            categoryId: z.string().min(1, 'Category is required'),
            particular: z.string().min(1, 'Particular is required'),
            quantity: z.number().min(0, 'Quantity must be positive'),
            price: z.number().min(0, 'Price must be positive'),
            total: z.number().min(0, 'Total must be positive'),
          }),
        )
        .default([]),

      perPlatePrice: z.number().min(0, 'Per plate price must be positive'),
      profit: z.number().min(0, 'Profit must be positive'),
    }),
  ),
});

export type RateData = z.infer<typeof RateCalculatorSchema>;
export type ExtraInputs = Record<
  string,
  {
    id: string;
    additionalVendorId: string;
    categoryId: string;
    particular: string;
    quantity: string;
    total: string;
    price: string;
  }
>;
export type VendorInputs = Record<
  string,
  {
    id: string;
    vendorId: string;
    count: string;
    price: string;
    roleId: string;
    transport: string;
  }
>;
export type FoodVendorInputs = Record<
  string,
  {
    dishId: string;
    foodVendorId: string;
    id: string;
    price: string;
    includeRawMaterial: boolean;
    isClubVendor: boolean;
    expected: string;
    preparation: string;
    singlePrice: string;
    unit:
      | 'LITRE'
      | 'GRAM'
      | 'KILOGRAM'
      | 'BOTTLE'
      | 'PIECE'
      | 'METER'
      | 'PACKET'
      | 'BUNDLE';
  }
>;
