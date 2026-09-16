// Types (unchanged)
interface CateringPackage {
  id: string;
  name: string;
  price?: number;
  dishes?: string[];
}
interface Dish {
  id: string;
  name: string;
  description?: string;
  vegNonveg: 'VEG' | 'NONVEG';
  category: {id: string; name: string};
}
interface ExtraDish {
  id: string;
  name: string;
  description?: string;
  vegNonveg: 'VEG' | 'NONVEG';
  cost: number;
  selectCount: number;
  categoryId: string;
}

export type {CateringPackage, Dish, ExtraDish};
