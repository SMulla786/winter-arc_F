interface RawMaterial {
  quantity: number;
  orderQuantity: number;
  maharaj: string;
  rawMaterialId: string;
  name: string;
  unit: string;
  subEvent: string;
  categoryId: string;
  categoryName?: string | null;
  category?: string | null;
  inventory?: number;
  inventory_value?: number;
  id?: string;
  subEventId?: string;
  price?: number;
  total_price?: number;
}

interface ExtraRawMaterial {
  id: string;
  rawMaterialId: string;
  quantity: number;
  eventId: string;
  rawMaterial: {
    id: string;
    name: string;
    unit: string;
    categoryId: string;
    languageId: string;
    caterorId: string;
    inventory: number;
    amount: number;
  };
}

interface FormattedData {
  unformatedRawMaterials: RawMaterial[];
  maharajList: string[];
  subEventNameList: string[];
  formatedRawMaterials: RawMaterial[];
  subEventMaharajwiseRawMaterials: {
    [subEvent: string]: RawMaterial[];
  };
  maharajSubEventwiseRawMaterials: {
    [maharaj: string]: RawMaterial[];
  };
}

interface CategoryOption {
  id: string;
  name: string;
}

export type {RawMaterial, ExtraRawMaterial, FormattedData, CategoryOption};
