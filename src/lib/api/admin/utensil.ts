import {api} from '@/utils/axios';
import {AxiosError} from 'axios';
import {
  UtensilCategory,
  UtensilCategoryCreate,
  UtensilCategoryUpdate,
  Utensil,
  UtensilCreate,
  UtensilUpdate,
  GetUtensilsParams,
} from '@/types/admin';

// Utensil Categories API Functions

const addUtensilCategory = async (data: UtensilCategoryCreate) => {
  try {
    const response = await api.post('admin/utensils/categories', data);
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
    const response = await api.get('admin/utensils/categories');
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
    const response = await api.get(`admin/utensils/categories/${id}`);
    return response.data as UtensilCategory;
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
  data: UtensilCategoryUpdate,
) => {
  try {
    const response = await api.patch(`admin/utensils/categories/${id}`, data);
    return response.data as UtensilCategory;
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
    await api.delete(`admin/utensils/categories/${id}`);
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
    const response = await api.post('admin/utensils', data);
    console.log('response', response);
    return response.data as Utensil;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to add utensil');
    }
    throw error;
  }
};

const getUtensils = async () => {
  try {
    const response = await api.get('admin/utensils');
    console.log('response', response);
    return response;
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
  try {
    const response = await api.get(`admin/utensils/${id}`);
    return response.data as Utensil;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to get utensil');
    }
    throw error;
  }
};

const updateUtensil = async (id: string, data: UtensilUpdate) => {
  try {
    const response = await api.patch(`admin/utensils/${id}`, data);
    return response.data as Utensil;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to update utensil',
      );
    }
    throw error;
  }
};

const deleteUtensil = async (id: string) => {
  try {
    await api.delete(`admin/utensils/${id}`);
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to delete utensil',
      );
    }
    throw error;
  }
};

const sendUtensilData = async (
  caterorId: string,
  languageId: string,
  utensils: {utensilId: string; name: string; categoryId: string}[],
) => {
  try {
    const response = await api.post('/admin/copy-data/utensils', {
      caterorId,
      languageId,
      utensils,
    });
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to send utensil data',
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
  sendUtensilData,
};
