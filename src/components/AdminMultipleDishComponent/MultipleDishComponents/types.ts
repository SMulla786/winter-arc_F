import {z} from 'zod';
import {dishMasterSchemaCat} from '@/lib/validation/dishSchemas';

export interface Dish {
  id: string;
  name: string;
}

export interface Option {
  value: string;
  label: string;
  unit?: string;
}

export interface Column {
  id: number;
  people?: string;
  kg?: string;
  isEditing: boolean;
}

export interface Row {
  id: number;
  rawMaterial: string;
  process: string;
  unit: string;
  name?: string;
  quantities: {[key: number]: string};
}

export type EditColumnValues = {
  [key: number]: {people: string; kg: string};
};

export type FormValues = z.infer<typeof dishMasterSchemaCat>;
