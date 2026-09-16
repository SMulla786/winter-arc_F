/*eslint-disable*/
import {AddRawMaterialForAdmin, AddRawMaterialForSubEvent} from '@/types/dish';
import {api} from '@/utils/axios';
import {AxiosError} from 'axios';

// Dish Category APIs

const addDishCategoryAdmin = async (data: {
  name: string;
  languageId: string;
}) => {
  try {
    const res = await api.post('admin/dishes/categories', data);
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

const getDishCategoriesAdmin = async () => {
  try {
    const res = await api.get(`/admin/dishes/categories`);
    // console.log('dish cat', res.data);
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

// Function to update category
const updateDishCategoryAdmin = async (data: {
  id: string;
  name: string;
  languageId: string;
}) => {
  const {name, id, languageId} = data;
  try {
    const res = await api.patch(`admin/dishes/categories/${id}`, {
      id: id,
      name: name,
      languageId: languageId,
    });
    return res.data; // Return the data instead of the entire response
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to update dish category',
      );
    }
    throw error;
  }
};

// Function to get a dish category by ID
const getDishCategoryByIdAdmin = async (id: string) => {
  try {
    const res = await api.get(`admin/dishes/categories/${id}`);
    return res.data; // Ensure you return only the data
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || `Failed to fetch dish with ID: ${id}`,
      );
    }
    throw error;
  }
};

const deleteDishCategoryAdmin = async (id: string) => {
  try {
    const res = await api.delete(`admin/dishes/categories/${id}`);
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

const addDishAdmin = async (data: {
  name: string;
  categoryId: string;
  languageId: string;
  priority: string;
  description?: string;
  columns: any[];
  rawMaterials: any[];
}) => {
  try {
    const res = await api.post('admin/dishes', data);
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to add dish');
    }
    throw error;
  }
};

const getDishesAdmin = async () => {
  try {
    const res = await api.get(`admin/dishes`);
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

export const updateDish = async (
  id: string,
  data: {
    name: string;
    categoryId: string;
    priority: string;
    description?: string;
    vegNonveg: 'VEG' | 'NONVEG';
    languageId?: string;
  },
) => {
  try {
    const res = await api.put(`/admin/dishes/${id}`, data);
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

export const addRawMaterialForAdmin = async (data: AddRawMaterialForAdmin) => {
  try {
    const res = await api.post(
      `/cateror/events/subevents/extraRawmaterials/`,
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

export const updateMultipleDishRawMaterials = async (data: {
  dishId: string;
  dishName: string;
  dishCategoryId: string;
  vegNonveg: 'VEG' | 'NONVEG';
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

export const addMultipleDishRawMaterials = async (data: {
  dishName: string;
  dishCategoryId: string;
  vegNonveg: 'VEG' | 'NONVEG';
  description: string | undefined;
  languageId: string;
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
    console.log('====================================');
    console.log('datappplllll', data);
    console.log('====================================');
    const response = await api.post('/admin/dishes/new', {
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
const getDishByIdAdmin = async (id: string) => {
  try {
    const res = await api.get(`admin/dishes/${id}`);
    return res.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || `Failed to fetch dish with ID: ${id}`,
      );
    }
    throw error;
  }
};

const updateDishAdmin = async (
  id: string,
  data: {name: string; categoryId: string; dishId: string},
) => {
  try {
    const res = await api.put(`admin/dishes/${id}`, data);
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

const deleteDishAdmin = async (id: string) => {
  try {
    const res = await api.delete(`admin/dishes/${id}`);
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

const addRawMaterialCategoryAdmin = async (data: {
  name: string;
  languageId: string;
}) => {
  try {
    const res = await api.post('admin/rawmaterials/categories', data);
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to add Raw Material category',
      );
    }
    throw error;
  }
};

const getRawMaterialCategoriesAdmin = async () => {
  try {
    const res = await api.get('admin/rawmaterials/categories');
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message ||
          'Failed to fetch Raw Material categories',
      );
    }
    throw error;
  }
};

const getRawMaterialCategoryByIdAdmin = async (id: string) => {
  try {
    const res = await api.get(`admin/rawmaterials/categories/${id}`);
    return res; // Ensure you return only the data
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message ||
          `Failed to fetch  Raw Material category with ID: ${id}`,
      );
    }
    throw error;
  }
};

const updateRawMaterialCategoryAdmin = async (
  id: string,
  data: {name: string; languageId: string},
) => {
  try {
    const res = await api.patch(`admin/rawmaterials/categories/${id}`, data); // Ensure 'data' structure is correct here
    console.log('API Response:', res.data); // Check if this logs the response data
    return res.data; // Return only the data
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message ||
          'Failed to update Raw Material Category',
      );
    }
    throw error;
  }
};

const deleteRawMaterialCategoryAdmin = async (id: string) => {
  try {
    const res = await api.delete(`admin/rawmaterials/categories/${id}`);
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

const addRawMaterialAdmin = async (data: {
  name: string;
  categoryId: string;
  languageId: string;
  unit: string;
  amount: number;
  inventory: number;
}) => {
  try {
    const res = await api.post('admin/rawmaterials', data);
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to add Raw Material',
      );
    }
    throw error;
  }
};

const getRawMaterialsAdmin = async () => {
  try {
    const res = await api.get(`admin/rawmaterials`);
    return res.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to fetch Raw Material',
      );
    }
    throw error;
  }
};

const getRawMaterialByIdAdmin = async (id: string) => {
  try {
    const res = await api.get(`admin/rawmaterials/${id}`);
    console.log('ressssssssssssss', res.data);
    return res.data; // Ensure you return only the data
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message ||
          `Failed to fetch  Raw Material with ID: ${id}`,
      );
    }
    throw error;
  }
};

// Function to update a raw material
const updateRawMaterialAdmin = async (
  id: string,
  data: {name: string; categoryId: string; languageId: string; unit: string},
) => {
  try {
    const res = await api.patch(`admin/rawmaterials/${id}`, data);
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message ||
          `Failed to update raw material with ID: ${id}`,
      );
    }
    throw error;
  }
};

const deleteRawMaterialAdmin = async (id: string) => {
  try {
    const res = await api.delete(`admin/rawmaterials/${id}`);
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message ||
          `Failed to delete Raw Material with ID: ${id}`,
      );
    }
    throw error;
  }
};

const addRawMaterialsToDishAdmin = async (data: {
  dishId: string;
  people: number;
  price: number;
  kg: number;
  rawMaterialsWithQuantityAndPrice: {
    rawMaterialId: string;
    processId: string;
    quantity: number;
  }[];
}) => {
  try {
    const response = await api.post(`/admin/dishes/rawmaterials`, data);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to add raw materials to dish',
      );
    }
    throw error;
  }
};

const updateRawMaterilasToDishAdmin = async (data: {
  dishId: string;
  rawMaterialsWithQuantityAndPrice: Array<{
    rawMaterialId: string;
    processId: string;
    quantity: number;
  }>;
}) => {
  try {
    const response = await api.post(`/admin/dishes/rawmaterials/update`, data);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message ||
          'Failed to update raw materials to dish',
      );
    }
    throw error;
  }
};

const predictRawMaterialForDish = async (body: {
  dishId: string;
  people?: number;
  price?: number;
  kg?: number;
}) => {
  try {
    const response = await api.post(`/admin/dishes/rawmaterials/predict`, {
      dishId: body.dishId,
      people: body.people,
      price: body.price,
      kg: body.kg,
    });
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

export const withoutPrediction = async (dishId: string, people?: number) => {
  try {
    const response = await api.get(
      `/admin/dishes/rawmaterials/${dishId}/${people}`,
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

export {
  addDishCategoryAdmin,
  getDishCategoriesAdmin,
  updateDishCategoryAdmin,
  getDishCategoryByIdAdmin,
  deleteDishCategoryAdmin,
  addDishAdmin,
  getDishesAdmin,
  getDishByIdAdmin,
  updateDishAdmin,
  deleteDishAdmin,
  addRawMaterialCategoryAdmin,
  getRawMaterialCategoriesAdmin,
  getRawMaterialCategoryByIdAdmin,
  updateRawMaterialCategoryAdmin,
  deleteRawMaterialCategoryAdmin,
  addRawMaterialAdmin,
  getRawMaterialsAdmin,
  getRawMaterialByIdAdmin,
  updateRawMaterialAdmin,
  deleteRawMaterialAdmin,
  addRawMaterialsToDishAdmin,
  updateRawMaterilasToDishAdmin,
  predictRawMaterialForDish,
};
