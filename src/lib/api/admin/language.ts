import {api} from '@/utils/axios';
import {AxiosError} from 'axios';
import {LanguageCreate, LanguageUpdate} from '../../../types/admin'; // Adjust the import paths based on your project

// Function to add a new language
const addLanguage = async (data: LanguageCreate) => {
  try {
    const response = await api.post('/admin/language', data);
    return response;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to add language',
      );
    }
    throw error;
  }
};

// Function to get a list of languages with pagination and search
const getLanguages = async () => {
  try {
    const response = await api.get('/admin/language');
    return response.data.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to get languages',
      );
    }
    throw error;
  }
};

// Function to get a specific language by ID
const getLanguageById = async (id: string) => {
  try {
    const response = await api.get(`/language/${id}`);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to get language',
      );
    }
    throw error;
  }
};

// Function to update a language by ID
const updateLanguage = async (id: string, data: LanguageUpdate) => {
  try {
    const response = await api.patch(`/language/${id}`, data);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to update language',
      );
    }
    throw error;
  }
};

// Function to delete a language by ID
const deleteLanguage = async (id: string) => {
  try {
    await api.delete(`admin/language/${id}`);
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to delete language',
      );
    }
    throw error;
  }
};

export {
  addLanguage,
  getLanguages,
  getLanguageById,
  updateLanguage,
  deleteLanguage,
};
