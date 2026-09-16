/* eslint-disable */
export interface Material {
  id: string;
  name: string;
  unit: string;
  categoryId: string;
  category: {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
    languageId: string;
    caterorId: string;
  };
  amount: number;
  inventory: number;
}

export interface OutwordInventoryItem {
  id: string;
  inventoryId: string;
  materialId: string;
  vendorId: string | null;
  vendorName: string | null;
  quantity: number;
  price: number;
  reason: string | null;
  createdAt: string;
  updatedAt: string;
  material: Material;
}

export interface Outword {
  id: string;
  caterorId: string;
  eventId: string | null;
  poNumber: number | null;
  type: string;
  createdAt: string;
  updatedAt: string;
  event: null | {id: string; name: string; startDate: string};
  inventoryItem: OutwordInventoryItem[];
}

export interface InventoryItem {
  id: string;
  materialId: string;
  quantity: number;
  price: number;
  createdAt: string;
  material: Material;
}

export interface Inword {
  id: string;
  poNumber: number | null;
  eventId: string | null;
  event: {id: string; name: string; startDate: string} | null;
  createdAt: string;
  inventoryItem: InventoryItem[];
}
export type MaterialBase = {
  id: string;
  name: string;
  unit: string;
  category?: {id: string; name: string} | null;
  amount?: number;
};

export type LineItem = {
  id: string;
  materialId: string;
  name: string;
  unit: string;
  category: string;
  vendorId?: string;
  vendorName?: string;
  poQuantity?: number;
  requiredQty?: number;
  quantity: number;
  date?: string;
  time?: string;
  venue?: string;
  price?: number;
  error?: string;
  requiredErrors?: string[];
  alreadyInInventory?: any[];
  totalReceived?: number;
  isBreakdown?: boolean;
  parentId?: string;
  breakdownQuantity?: number;
  totalAmount?: number;
  submitMainRow?: boolean;
};

export type POOption = {label: string; value: string; rawData?: any};
