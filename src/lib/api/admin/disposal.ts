import {DisposalCategoryCreate, DisposalCategoryUpdate} from '@/types/admin';
import {api} from '@/utils/axios';
import {AxiosError} from 'axios';

// Disposal Category APIs

const addDisposalCategory = async (data: DisposalCategoryCreate) => {
  try {
    const res = await api.post('admin/disposals/categories', data);
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to add disposal category',
      );
    }
    throw error;
  }
};

const getDisposalCategories = async () => {
  try {
    const res = await api.get('admin/disposals/categories');
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to fetch disposal categories',
      );
    }
    throw error;
  }
};

const updateDisposalCategory = async (
  id: string,
  data: DisposalCategoryUpdate,
) => {
  try {
    const res = await api.put(`admin/disposals/categories/${id}`, data);
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to update disposal category',
      );
    }
    throw error;
  }
};

const getDisposalCategoryById = async (id: string) => {
  try {
    const res = await api.get(`admin/disposals/categories/${id}`);
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to get disposal category',
      );
    }
    throw error;
  }
};

//Function to Delete Disposal Category
const deleteDisposalCategory = async (id: string) => {
  try {
    const res = await api.delete(`admin/disposals/categories/${id}`);
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to delete disposal category',
      );
    }
    throw error;
  }
};

// Disposal APIs

const addDisposal = async (data: {
  name: string;
  categoryId: string;
  languageId: string;
}) => {
  try {
    const res = await api.post('admin/disposals', data);
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to add disposal',
      );
    }
    throw error;
  }
};

const getDisposals = async () => {
  try {
    const res = await api.get('admin/disposals');
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to fetch disposals',
      );
    }
    throw error;
  }
};

//Function to get Disposal by id
const getDisposalById = async (id: string) => {
  try {
    const res = await api.get(`admin/disposals/${id}`);
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message ||
          `Failed to fetch disposal with ID: ${id}`,
      );
    }
    throw error;
  }
};

const updateDisposal = async (
  id: string,
  data: {name: string; categoryId: string; languageId: string},
) => {
  try {
    const res = await api.put(`admin/disposals/${id}`, data);
    console.log('responce data ', res);

    return res.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message ||
          `Failed to update disposal with ID: ${id}`,
      );
    }
    throw error;
  }
};

const deleteDisposal = async (id: string) => {
  try {
    const res = await api.delete(`admin/disposals/${id}`);
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message ||
          `Failed to delete disposal with ID: ${id}`,
      );
    }
    throw error;
  }
};

const sendDisposalData = async (
  caterorId: string,
  languageId: string,
  disposals: {disposalId: string; quantity: number}[],
) => {
  try {
    const res = await api.post('/admin/copy-data/disposals', {
      caterorId,
      languageId,
      disposals,
    });
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to send disposal data',
      );
    }
    throw error;
  }
};

export {
  addDisposalCategory,
  getDisposalCategories,
  updateDisposalCategory,
  getDisposalCategoryById,
  deleteDisposalCategory,
  addDisposal,
  getDisposals,
  getDisposalById,
  updateDisposal,
  deleteDisposal,
  sendDisposalData,
};
