import {api} from '@/utils/axios';
import {AxiosError} from 'axios';
import {
  UtensilCategory,
  UtensilCategoryCreate,
  Utensil,
  UtensilCreate,
} from '@/types/cateror';

// Utensil Categories API Functions

const addUtensilCategory = async (data: UtensilCategoryCreate) => {
  try {
    const response = await api.post('cateror/utensils/categories', data);
    return response.data as UtensilCategory;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to add utensil category',
      );
    }
    throw error;
  }
};

const getUtensilCategories = async () => {
  try {
    const response = await api.get('cateror/utensils/categories');
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to get utensil categories',
      );
    }
    throw error;
  }
};

const getUtensilCategoryById = async (id: string) => {
  try {
    const response = await api.get(`cateror/utensils/categories/${id}`);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to get utensil category',
      );
    }
    throw error;
  }
};

const updateUtensilCategory = async (
  id: string,
  data: {name: string; languageId: string | undefined},
) => {
  try {
    const res = await api.patch(`cateror/utensils/categories/${id}`, data);
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to update utensil category',
      );
    }
    throw error;
  }
};

const deleteUtensilCategory = async (id: string) => {
  try {
    await api.delete(`cateror/utensils/categories/${id}`);
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to delete utensil category',
      );
    }
    throw error;
  }
};

// Utensils API Functions

const addUtensil = async (data: UtensilCreate) => {
  try {
    const response = await api.post('cateror/utensils', data);
    return response.data as Utensil;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to add utensil');
    }
    throw error;
  }
};

const getUtensils = async (languageId: string) => {
  try {
    const response = await api.get(`cateror/utensils?languageId=${languageId}`);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to get utensils',
      );
    }
    throw error;
  }
};

//Function to get Utensil by id
const getUtensilById = async (id: string) => {
  console.log('daaaataaa', id);

  try {
    const response = await api.get(`cateror/utensils/${id}`);
    return response.data as Utensil;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to get utensil');
    }
    throw error;
  }
};

export const addUtensilsInventory = async (
  data: {
    id: string;
    inventory: number;
  }[],
) => {
  try {
    const res = await api.put('cateror/utensils/bulk', data);
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

const updateUtensil = async (
  id: string,
  data: {name: string; categoryId: string; languageId: string},
) => {
  console.log(id, data);
  try {
    const response = await api.patch(`cateror/utensils/${id}`, data);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || `Failed to update utensil :${id}`,
      );
    }
    throw error;
  }
};

const deleteUtensil = async (id: string) => {
  try {
    await api.delete(`cateror/utensils/${id}`);
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to delete utensil',
      );
    }
    throw error;
  }
};

export {
  addUtensilCategory,
  getUtensilCategories,
  getUtensilCategoryById,
  updateUtensilCategory,
  deleteUtensilCategory,
  addUtensil,
  getUtensils,
  getUtensilById,
  updateUtensil,
  deleteUtensil,
};
