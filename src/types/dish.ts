// Common Interfaces
export interface QueryParams {
  page?: number;
  limit?: number;
}

export interface ParamsWithId {
  id: string;
}

export interface CategoryRequestBody {
  CategoryName?: string;
}

export interface DishRequestBody {
  DishName?: string;
  DishCategoryID?: string;
}

// Process Interfaces
export interface Process {
  ProcessID: string;
  ProcessName: string;
}

// Raw Material Interfaces
export interface RawMaterial {
  RawMaterialID: string;
  RawMaterialName: string;
  RawMaterialUnit: string;
  ProcessID?: string;
  Process?: Process;
  Unit?: string;
}

// Request Payloads for Raw Material
export interface CreateRawMaterialRequestBody {
  RawMaterialName: string;
  RawMaterialUnit: string;
  ProcessID?: string;
}

export interface UpdateRawMaterialRequestBody {
  RawMaterialName?: string;
  RawMaterialUnit?: string;
  ProcessID?: string;
}

export interface GetRawMaterialByIdParams extends ParamsWithId {}

export interface DeleteRawMaterialParams extends ParamsWithId {}

// Response Payloads for Raw Material
export interface RawMaterialResponse extends RawMaterial {}

export interface RawMaterialsResponse {
  rawMaterials: RawMaterialResponse[];
  total: number;
  totalPages: number;
  currentPage: number;
}

// Dish Category Interfaces
export interface DishCategory {
  DishCategoryID: string;
  CategoryName: string;
}

export interface CreateDishCategoryRequestBody extends CategoryRequestBody {
  CategoryName: string;
}

export interface GetDishCategoryByIdParams extends ParamsWithId {}

export interface UpdateDishCategoryRequestBody extends CategoryRequestBody {}

export interface UpdateDishCategoryParams extends ParamsWithId {}

export interface DeleteDishCategoryParams extends ParamsWithId {}

export interface SearchDishesCategoriesQuery extends QueryParams {
  category: string;
}

// Dish Interfaces
export interface Dish {
  id: string;
  name: string;
  DishCategoryID: string;
  DishCategory?: DishCategory;
}

export interface CreateDishRequestBody extends DishRequestBody {
  DishName: string;
  DishCategoryID: string;
}

export interface UpdateDishRequestBody extends DishRequestBody {}

export interface UpdateDishParams extends ParamsWithId {}

export interface SearchDishesQuery extends QueryParams {
  dishName: string;
}

// Response Payloads for Dishes
export interface DishResponse extends Dish {
  DishName: string;
}

export interface DishesResponse {
  dishes: DishResponse[];
  total: number;
  totalPages: number;
  currentPage: number;
}

// Dish Raw Material Interfaces
export interface AddDishRawMaterialRequestBody {
  DishID: string;
  RawMaterialID: string;
  PeopleCount: number;
  Quantity: number;
  UnitPrices: number;
}

export interface BulkAddDishRawMaterialsRequestBody {
  DishID: string;
  rawMaterials: {
    RawMaterialID: string;
    Quantity: number;
  }[];
  PeopleCount: number;
  UnitPrices: number;
}

export interface PredictRawMaterialQuantityRequestBody {
  DishID: string;
  PeopleCount: number;
}

export interface UpdateDishRawMaterialRequestBody {
  DishID: string;
  RawMaterialID: string;
  PeopleCount?: number;
  Quantity?: number;
  UnitPrices?: number;
}

// Response Payloads for Dish Categories
export interface DishCategoriesResponse {
  dishCategories: DishCategory[];
  total: number;
  totalPages: number;
  currentPage: number;
}

export interface PredictRawMaterial {
  RawMaterialID: string;
  RawMaterialName: string;
  RawMaterialUnit: string;
  PredictedQuantity: number | null;
  PredictedPrice: number | null;
}

export interface RawMaterialType {
  RawMaterialID: string;
  Quantity: number;
}

export type AllRawMaterialResponse = RawMaterialType[];

// cateror dish

export interface PredictCaterorDishReqBody {
  DishID: string;
  PeopleCount: number;
  CaterorID: string;
}
// prettier-ignore
export interface CaterorBulkAddDishRawMaterialsReqBody
  extends BulkAddDishRawMaterialsRequestBody {
  CaterorID: string;
}

export interface RawMaterial {
  rawMaterialId: string;
  processId: string;
  quantity: number;
}

export interface AddRawMaterialToDish {
  rawMaterials: RawMaterial[];
  dishId: string;
  people: number;
  price: number;
  kg: number;
}
export interface DishRawMaterialCateror {
  people: number;
}

export interface AddRawMaterialForSubEvent {
  subeventId: string;
  data: {
    rawMaterialId: string;
    name: string;
    unit: string;
    categoryId: string;
    quantity: number;
  };
}
export interface AddRawMaterialForAdmin {
  data: {
    rawMaterialId: string;
    name: string;
    unit: string;
    categoryId: string;
    quantity: number;
  };
}

export interface AddExtraRawMaterial {
  subeventId: string;
  data: {
    rawMaterialId: string;
    name: string;
    unit: string;
    categoryId: string;
    quantity: number;
  };
}
