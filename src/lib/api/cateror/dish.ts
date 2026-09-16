/* eslint-disable */
import {AddRawMaterialForSubEvent, AddRawMaterialToDish} from '@/types/dish';
import {api} from '@/utils/axios';
import {AxiosError} from 'axios';

// raw material apis
type Item = {
  oldName: string;
  newName: string | null;
};

export type fileUploadPayload = Item[];

export const uploadFile = async (data: fileUploadPayload) => {
  try {
    const res = await api.put(`/cateror/rawmaterials/bulkName`, data);
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to upload file');
    }
    throw error;
  }
};

const addRawMaterialCategoryCateror = async (data: {name: string}) => {
  // console.log(data);
  try {
    const res = await api.post('/cateror/rawmaterials/categories', {
      name: data.name,
    });
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message ||
          'Failed to add rawmaterial categoey category',
      );
    }
    throw error;
  }
};

const getRawMaterialCategoryCateror = async () => {
  try {
    const res = await api.get('/cateror/rawmaterials/categories');
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to add dish category',
      );
    }
    throw error;
  }
};

export const getRawMaterialCategoryByIdCateor = async (id: string) => {
  try {
    const res = await api.get(`/cateror/rawmaterials/categories/${id}`);
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to add raw material category',
      );
    }
    throw error;
  }
};
const updateRawMaterialCaterorCat = async (
  id: string,
  data: {name: string},
) => {
  try {
    const res = await api.patch(`cateror/rawmaterials/categories/${id}`, data);
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to update dish category',
      );
    }
    throw error;
  }
};

const getRawMaterialById = async (id: string) => {
  try {
    const res = await api.get(`/cateror/rawmaterials/${id}`);
    console.log(res);

    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to add dish category',
      );
    }
    throw error;
  }
};

export const getrawmaterial = async (id: string) => {
  try {
    const res = await api.get(`/cateror/rawmaterials/${id}`);
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to add dish category',
      );
    }
    throw error;
  }
};

const deleteRawMaterialCategoryCat = async (id: string) => {
  try {
    const res = await api.delete(`/cateror/rawmaterials/categories/${id}`);
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to add dish category',
      );
    }
    throw error;
  }
};

const addRawMaterialCateror = async (data: {
  name: string;
  unit: string;
  categoryId: string;
  languageId: string;
  amount: number;
  inventory: number;
}) => {
  try {
    const res = await api.post('/cateror/rawmaterials', data);
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to add raw materials',
      );
    }
    throw error;
  }
};

const getRawMaterialCateror = async () => {
  try {
    const res = await api.get('/cateror/rawmaterials');
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to add dish category',
      );
    }
    throw error;
  }
};

const updateRawMaterialCateror = async (
  id: string,
  data: {
    name: string;
    amount: number;
    inventory: number;
    unit: string;
    categoryId: string;
  },
) => {
  try {
    const res = await api.patch(`cateror/rawmaterials/${id}`, data);
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to update dish category',
      );
    }
    throw error;
  }
};

const deleteRawMaterial = async (id: string) => {
  try {
    const res = await api.delete(`/cateror/rawmaterials/${id}`);
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to delete dish category',
      );
    }
    throw error;
  }
};

// Dish Category APIs

const addDishCategory = async (data: {
  name: string;
  languageId: string | null;
}) => {
  try {
    const res = await api.post('cateror/dishes/categories', data);
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to add dish category',
      );
    }
    throw error;
  }
};

const getDishCategories = async () => {
  try {
    const res = await api.get(`cateror/dishes/categories`);
    // console.log('res : ', res.data);
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to fetch dish categories',
      );
    }
    throw error;
  }
};

export const getDishCategoriesExternal = async (id: string) => {
  try {
    const res = await api.get(`categories/${id}`);
    // console.log('res : ', res.data);
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to fetch dish categories',
      );
    }
    throw error;
  }
};

export const getDishesExternal = async (id: string) => {
  try {
    const res = await api.get(`dishes/${id}`);
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to fetch dishes',
      );
    }
    throw error;
  }
};

const updateDishCategory = async (id: string, data: {name: string}) => {
  try {
    const res = await api.patch(`cateror/dishes/categories/${id}`, data);
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to update dish category',
      );
    }
    throw error;
  }
};

const getDishCategoryById = async (id: string) => {
  try {
    const res = await api.get(`cateror/dishes/categories/${id}`);
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || `Failed to fetch dish with ID: ${id}`,
      );
    }
    throw error;
  }
};

const deleteDishCategory = async (id: string) => {
  try {
    const res = await api.delete(`cateror/dishes/categories/${id}`);
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to delete dish category',
      );
    }
    throw error;
  }
};

// Disposal APIs

const addDish = async (data: {
  name: string;
  categoryId: string;
  priority: string;
  // description: string | undefined;
}) => {
  // console.log(data);
  try {
    const res = await api.post('/cateror/dishes', data);
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to add dish');
    }
    throw error;
  }
};

const getDishes = async () => {
  try {
    const res = await api.get(`/cateror/dishes`);
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to fetch dishes',
      );
    }
    throw error;
  }
};
const getMultipleDishes = async (dishIds: string[]) => {
  try {
    const res = await api.put(`/cateror/dishes/multiple`, dishIds); // 👈 send array directly
    return res.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to fetch dishes',
      );
    }
    throw error;
  }
};

export const uploadDish = async (data: fileUploadPayload) => {
  try {
    const res = await api.put(`/cateror/dishes/bulkName`, data);
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to upload file');
    }
    throw error;
  }
};
export const uploadRawMaterialCat = async (data: fileUploadPayload) => {
  try {
    const res = await api.put(`/cateror/rawmaterials/category/bulkName`, data);
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to upload file');
    }
    throw error;
  }
};

export const uploadDishCat = async (data: fileUploadPayload) => {
  try {
    const res = await api.put(`/cateror/dishes/category/bulkName`, data);
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to upload file');
    }
    throw error;
  }
};

export const uploadDisposalCat = async (data: fileUploadPayload) => {
  try {
    const res = await api.put(`/cateror/disposals/category/bulkName`, data);
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to upload file');
    }
    throw error;
  }
};

export const uploadUtensialsCat = async (data: fileUploadPayload) => {
  try {
    const res = await api.put(`/cateror/utensils/category/bulkName`, data);
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to upload file');
    }
    throw error;
  }
};

export const uploadDisposal = async (data: fileUploadPayload) => {
  try {
    const res = await api.put(`/cateror/disposals/bulkName`, data);
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to upload disposals',
      );
    }
    throw error;
  }
};

export const uploadUtensials = async (data: fileUploadPayload) => {
  try {
    const res = await api.put(`/cateror/utensils/bulkName`, data);
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to upload utensils',
      );
    }
    throw error;
  }
};

const getDishById = async (id: string) => {
  try {
    const res = await api.get(`/cateror/dishes/${id}`);
    console.log(id);
    console.log('singleDishData', res);
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || `Failed to fetch dish with ID: ${id}`,
      );
    }
    throw error;
  }
};

const updateDish = async (
  id: string,
  data: {
    name: string;
    categoryId: string;
    priority: string;
    description?: string;
    vegNonveg: 'VEG' | 'NONVEG';
    portionSize: number;
    unit: string;
  },
) => {
  try {
    const res = await api.put(`cateror/dishes/${id}`, data);
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || `Failed to update dish with ID: ${id}`,
      );
    }
    throw error;
  }
};

const deleteDish = async (id: string) => {
  try {
    const res = await api.delete(`cateror/dishes/${id}`);
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || `Failed to delete dish with ID: ${id}`,
      );
    }
    throw error;
  }
};

const addRawMaterialToDishCateror = async (data: AddRawMaterialToDish) => {
  try {
    const response = await api.post('cateror/dishes/rawmaterials', data);
    return response.data;
  } catch (error: any) {
    console.error(
      'Error adding raw materials to dish:',
      error.response?.data || error.message,
    );
    throw error;
  }
};

const updateDishRawMaterialCateror = async (data: AddRawMaterialToDish) => {
  try {
    const res = await api.post(`cateror/dishes/rawmaterials/update`, data);
    return res.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message ||
          'Failed to update raw material category',
      );
    }
    throw error;
  }
};

export const deleteRawMaterialForSubevent = async (id: string) => {
  try {
    const res = await api.delete(
      `/cateror/events/subevents/extraRawmaterials/${id}`,
    );
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || `Failed to delete dish with ID: ${id}`,
      );
    }
    throw error;
  }
};

const getDishRawMaterialCateror = async (
  id: string,
  people: number, // Correct destructuring and type annotation
) => {
  try {
    const res = await api.get(`/cateror/dishes/rawmaterials/${id}`, {
      params: {people}, // Properly include `people` as a query parameter
    });
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to fetch dish raw materials',
      );
    }
    throw error;
  }
};

const predictRawMaterialForDish = async (params: {
  dishId: string;
  people?: number;
  price?: number;
  kg?: number;
}) => {
  try {
    const response = await api.get(`/cateror/dishes/rawmaterials/predict`, {
      params: {
        dishId: params.dishId,
        people: params.people,
        price: params.price,
        kg: params.kg,
      },
    });
    console.log('response.data', response.data);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message ||
          'Failed to predict raw materials for dish',
      );
    }
    throw error;
  }
};

export const WithoutPredictRawmterialForDish = async (
  dishId: string,
  people?: number,
) => {
  try {
    const response = await api.get(
      `/cateror/dishes/rawmaterials/${dishId}/${people}`,
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message ||
          'Failed to predict raw materials for dish',
      );
    }
    throw error;
  }
};

const getCaterorById = async (id: string) => {
  try {
    const res = await api.get(`cateror/cateror/${id}`);
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'failed to get cateror');
    }
    throw error;
  }
};

export type FormattedRemainingRaw = {
  rawMaterialId: string | undefined;
  inventory: number | undefined;
  totalQty: string;
  inventory_value: string;
  rawMaterialListId: string | undefined;
};
export type ExtraRaw = {
  materials: FormattedRemainingRaw[];
};

export const saveExtraRawMaterialPo = async (data: ExtraRaw) => {
  try {
    const res = await api.put(`cateror/events/rawmateriallist`, data);
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'failed to add extra material',
      );
    }
    throw error;
  }
};

export const deleteExtraRawPo = async (id: string) => {
  try {
    const res = await api.delete(`cateror/events/rawmateriallist/extra/${id}`);
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'failed to delete extra material',
      );
    }
    throw error;
  }
};

export const getExtraRawMaterial = async (id: string) => {
  try {
    const res = await api.get(`cateror/events/rawmateriallist/extra/${id}`);
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'failed to get extra material',
      );
    }
    throw error;
  }
};

const addNewRawMaterialForSubEvent = async (
  data: AddRawMaterialForSubEvent,
) => {
  try {
    const res = await api.post(
      `/cateror/events/extraNewRawmaterials/${data.subeventId}`,
      data,
    );
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to add raw materials',
      );
    }
    throw error;
  }
};

const addRawMaterialForSubEvent = async (data: AddRawMaterialForSubEvent) => {
  try {
    const res = await api.post(
      `/cateror/events/subevents/extraRawmaterials/${data.subeventId}`,
      data,
    );
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to add raw materials',
      );
    }
    throw error;
  }
};

const addMultipleDishRawMaterials = async (data: {
  caterorid: string;
  dishName: string;
  dishCategoryId: string;
  vegNonveg: 'VEG' | 'NONVEG';
  description: string | undefined;
  unit: string;
  portionSize: number;
  prices: {
    people: number;
    kg: number;
    rawMaterials: {
      rawMaterialId: string;
      processId: string;
      quantity: number;
    }[];
  }[];
}) => {
  try {
    const response = await api.post(`cateror/dishes/new/${data.caterorid}`, {
      ...(data.prices ? data : {...data, prices: []}),
    });
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message ||
          'Failed to add multiple raw materials to dish',
      );
    }
    throw error;
  }
};

const updateMultipleDishRawMaterials = async (data: {
  dishId: string;
  dishName: string;
  dishCategoryId: string;
  vegNonveg: 'VEG' | 'NONVEG';
  unit: string;
  portionSize: number;
  description: string | undefined;
  prices: {
    people: number;
    kg: number;
    rawMaterials: {
      rawMaterialId: string;
      processId: string;
      quantity: number;
    }[];
  }[];
}) => {
  try {
    const {dishId, ...body} = data;
    const res = await api.put(`cateror/dishes/new/${dishId}`, body);
    return res.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message ??
          'Failed to update raw materials for dish',
      );
    }
    throw error;
  }
};

const getRawMaterialForSubevent = async (subeventId: string) => {
  try {
    const res = await api.get(
      `/cateror/events/subevents/extraRawmaterials/${subeventId}`,
    );
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to fetch dishes',
      );
    }
    throw error;
  }
};

// Payload type for fetching raw materials by date range and selected subevents
type RawMaterialByDatePayload = {
  from: string;
  to: string;
  subeventIds: string[];
};

const getRawMaterialByDate = async (data: RawMaterialByDatePayload) => {
  try {
    const res = await api.post(`/cateror/events/rawmateriallist`, data);
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to fetch raw materials',
      );
    }
    throw error;
  }
};

export const getAllRawForExternalPo = async () => {
  try {
    const res = await api.get(`/cateror/events/rawmateriallist`);
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to fetch raw materials',
      );
    }
    throw error;
  }
};
const updateCounterIndexing = async (
  data: {counterId: string; indexing: number}[],
) => {
  try {
    console.log(data);
    const res = await api.put('/cateror/counter/indexing', {data});
    return res.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to update counter indexing',
      );
    }
    throw error;
  }
};
export {
  updateCounterIndexing,
  addRawMaterialCategoryCateror,
  getRawMaterialCategoryCateror,
  getRawMaterialById,
  updateRawMaterialCaterorCat,
  deleteRawMaterialCategoryCat,
  addRawMaterialCateror,
  getRawMaterialCateror,
  updateRawMaterialCateror,
  deleteRawMaterial,
  addDishCategory,
  getDishCategories,
  updateDishCategory,
  getDishCategoryById,
  deleteDishCategory,
  addDish,
  getDishes,
  getDishById,
  updateDish,
  deleteDish,
  addRawMaterialToDishCateror,
  updateDishRawMaterialCateror,
  getDishRawMaterialCateror,
  predictRawMaterialForDish,
  getCaterorById,
  addMultipleDishRawMaterials,
  addNewRawMaterialForSubEvent,
  addRawMaterialForSubEvent,
  getRawMaterialForSubevent,
  updateMultipleDishRawMaterials,
  getMultipleDishes,
  getRawMaterialByDate,
};
