import {DisposalCategoryCreate} from '@/types/cateror';
import {api} from '@/utils/axios';
import {AxiosError} from 'axios';
import toast from 'react-hot-toast';

// Disposal Category APIs

const addDisposalCategory = async (data: DisposalCategoryCreate) => {
  try {
    const res = await api.post('cateror/disposals/categories', data);
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
    const res = await api.get('cateror/disposals/categories');
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

const updateDisposalCategory = async (id: string, data: {name: string}) => {
  try {
    const res = await api.patch(`cateror/disposals/categories/${id}`, data);
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
    const res = await api.get(`cateror/disposals/categories/${id}`);
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
    const res = await api.delete(`cateror/disposals/categories/${id}`);
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
  inventory: number;
  unit: string;
  price: number;
}) => {
  try {
    const res = await api.post('cateror/disposals', data);
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

// Function to get Disposals
const getDisposals = async (languageId: string) => {
  try {
    // Pass languageId as a query parameter to the API
    const res = await api.get(`cateror/disposals?languageId=${languageId}`);
    return res.data; // Return the actual data
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to fetch disposals',
      );
    }
    throw error;
  }
};
export const getDisposalsData = async (eventid: string) => {
  console.log('====================================');
  console.log(eventid);
  console.log('====================================');
  try {
    const res = await api.get(`cateror/events/disposals/${eventid}`);
    return res.data;
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
    const res = await api.get(`cateror/disposals/${id}`);
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message ||
          `Failed to fetch disposal with ID: ${id}`,
      );
    }
    toast.error(`already Exists`);
    throw error;
  }
};

const updateDisposal = async (
  id: string,
  data: {name: string; categoryId: string; languageId: string},
) => {
  console.log(id, data);

  try {
    const res = await api.patch(`cateror/disposals/${id}`, data);
    return res;
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
    const res = await api.delete(`cateror/disposals/${id}`);
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

export const addDisposalInventory = async (
  data: {
    id: string;
    inventory: number;
  }[],
) => {
  try {
    const res = await api.put('cateror/disposals/bulk', data);
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
};
