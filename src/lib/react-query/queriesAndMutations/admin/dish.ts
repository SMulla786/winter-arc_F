import {ADMIN_DISH_QUERY_KEYS} from '../../queryKeys';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {
  addDishAdmin,
  addDishCategoryAdmin,
  addRawMaterialAdmin,
  addRawMaterialCategoryAdmin,
  addRawMaterialsToDishAdmin,
  deleteDishAdmin,
  deleteDishCategoryAdmin,
  deleteRawMaterialAdmin,
  deleteRawMaterialCategoryAdmin,
  getDishByIdAdmin,
  getDishCategoriesAdmin,
  getDishCategoryByIdAdmin,
  getDishesAdmin,
  getRawMaterialByIdAdmin,
  getRawMaterialCategoriesAdmin,
  getRawMaterialCategoryByIdAdmin,
  getRawMaterialsAdmin,
  predictRawMaterialForDish,
  updateDishAdmin,
  updateDishCategoryAdmin,
  updateRawMaterialAdmin,
  updateRawMaterialCategoryAdmin,
  updateRawMaterilasToDishAdmin,
  withoutPrediction,
} from '@/lib/api/admin/dish';
import toast from 'react-hot-toast';

// Hook to get all dish categories
export const useGetDishCategoriesAdmin = (languageId: string) => {
  return useQuery({
    queryKey: [ADMIN_DISH_QUERY_KEYS.DISH_CATEGORIES],
    queryFn: () => getDishCategoriesAdmin(languageId),
  });
};

// Hook to add a new dish category
export const useAddDishCategoryAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addDishCategoryAdmin,
    onSuccess: () => {
      toast.success('Dish category added successfully!');
    },
    onError: () => {
      toast.error('Failed to add dish category');
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [ADMIN_DISH_QUERY_KEYS.DISH_CATEGORIES],
      });
    },
  });
};

// Hook to get a dish category by ID
export const useGetDishCategoryByIdAdmin = (id: string) => {
  return useQuery({
    queryKey: [ADMIN_DISH_QUERY_KEYS.DISH_CATEGORY, id],
    queryFn: () => getDishCategoryByIdAdmin(id),
  });
};

// Hook to update a dish category
export const useUpdateDishCategoryAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateDishCategoryAdmin,
    onSuccess: () => {
      toast.success('Dish category updated successfully!');
    },
    onError: () => {
      toast.error('Failed to update dish category');
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [ADMIN_DISH_QUERY_KEYS.DISH_CATEGORY],
      });
    },
  });
};

// Hook to delete a dish category
export const useDeleteDishCategoryAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteDishCategoryAdmin(id),
    onSuccess: () => {
      toast.success('Dish category deleted successfully!');
    },
    onError: () => {
      toast.error('Failed to delete dish category');
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [ADMIN_DISH_QUERY_KEYS.DISH_CATEGORIES],
      });
    },
  });
};

// Hook to get all dishes
export const useGetDishesAdmin = (
  languageId: string,
  // options?: {enabled?: boolean},
) => {
  return useQuery({
    queryKey: [ADMIN_DISH_QUERY_KEYS.DISHES, languageId],
    queryFn: () => getDishesAdmin(languageId),
    // enabled: options?.enabled ?? true,
  });
};

// Hook to get a specific dish by ID
export const useGetDishByIdAdmin = (id: string) => {
  return useQuery({
    queryKey: [ADMIN_DISH_QUERY_KEYS.DISH, id],
    queryFn: () => getDishByIdAdmin(id),
  });
};

// Hook to add a new dish
export const useAddDishAdmin = () => {
  return useMutation({
    mutationFn: addDishAdmin,
    onSuccess: () => {
      toast.success('Dish added successfully!');
    },
    onError: () => {
      toast.error('Failed to add dish');
    },
  });
};

// Hook to update a dish
export const useUpdateDishAdmin = () => {
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: {name: string; categoryId: string; dishId: string};
    }) => updateDishAdmin(id, data),
    onSuccess: () => {
      toast.success('Dish updated successfully!');
    },
    onError: () => {
      toast.error('Failed to update dish');
    },
  });
};

// Hook to delete a dish
export const useDeleteDishAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteDishAdmin(id),
    onSuccess: () => {
      toast.success('Dish deleted successfully!');
    },
    onError: () => {
      toast.error('Failed to delete dish');
    },
    onSettled: () => {
      queryClient.invalidateQueries({queryKey: [ADMIN_DISH_QUERY_KEYS.DISHES]});
    },
  });
};

// Hook to get all raw material categories
export const useGetRawMaterialCategoriesAdmin = () => {
  return useQuery({
    queryKey: [ADMIN_DISH_QUERY_KEYS.RAW_MATERIAL_CATEGORIES],
    queryFn: getRawMaterialCategoriesAdmin,
  });
};

// Hook to add a new raw material category
export const useAddRawMaterialCategoryAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addRawMaterialCategoryAdmin,
    onSuccess: () => {
      toast.success('Raw Material Category added successfully!');
    },
    onError: () => {
      toast.error('Failed to add Raw Material Category');
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [ADMIN_DISH_QUERY_KEYS.RAW_MATERIAL_CATEGORIES],
      });
    },
  });
};

// Hook to get a raw material category by ID
export const useGetRawMaterialCategoryByIdAdmin = (id: string) => {
  return useQuery({
    queryKey: [ADMIN_DISH_QUERY_KEYS.RAW_MATERIAL_CATEGORY, id],
    queryFn: () => getRawMaterialCategoryByIdAdmin(id),
    enabled: !!id,
  });
};

// Hook to update a raw material category
export const useUpdateRawMaterialCategoryAdmin = () => {
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: {name: string; languageId: string};
    }) => updateRawMaterialCategoryAdmin(id, data),
    onSuccess: () => {
      toast.success('Raw Material category updated successfully');
    },
    onError: () => {
      toast.error('Failed to update raw material category');
    },
  });
};

// Hook to delete a raw material category
export const useDeleteRawMaterialCategoryAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteRawMaterialCategoryAdmin(id),
    onSuccess: () => {
      toast.success('Raw Material category deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete Raw Material category');
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [ADMIN_DISH_QUERY_KEYS.RAW_MATERIAL_CATEGORIES],
      });
    },
  });
};

// Hook to get all raw materials
export const useGetRawMaterialAdmin = (languageId: string) => {
  return useQuery({
    queryKey: [ADMIN_DISH_QUERY_KEYS.RAW_MATERIALS],
    queryFn: () => getRawMaterialsAdmin(languageId),
  });
};

// Hook to get a specific raw material by ID
export const useGetRawMaterialByIdAdmin = (id: string) => {
  return useQuery({
    queryKey: [ADMIN_DISH_QUERY_KEYS.RAW_MATERIALS],
    queryFn: () => getRawMaterialByIdAdmin(id),
  });
};

// Hook to add a new raw material
export const useAddRawMaterialAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addRawMaterialAdmin,
    onSuccess: () => {
      toast.success('Raw Material added successfully');
    },
    onError: () => {
      toast.error('Failed to add Raw Material');
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [ADMIN_DISH_QUERY_KEYS.RAW_MATERIALS],
      });
    },
  });
};

// Hook to update a raw material
export const useUpdateRawMaterialAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: {
        name: string;
        categoryId: string;
        languageId: string;
        unit: string;
      };
    }) => updateRawMaterialAdmin(id, data),
    onSuccess: () => {
      toast.success('Raw Material updated successfully');
    },
    onError: () => {
      toast.error('Failed to update Raw Material');
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [ADMIN_DISH_QUERY_KEYS.RAW_MATERIALS],
      });
    },
  });
};

// Hook to delete a raw material
export const useDeleteRawMaterialAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteRawMaterialAdmin(id),
    onSuccess: () => {
      toast.success('Raw Material deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete Raw Material');
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [ADMIN_DISH_QUERY_KEYS.RAW_MATERIALS],
      });
    },
  });
};

// Hook to add raw materials to a dish
export const useAddRawMaterialsToDish = () => {
  return useMutation({
    mutationFn: addRawMaterialsToDishAdmin,
    onSuccess: () => {
      toast.success('Raw Material added to dish successfully');
    },
    onError: () => {
      toast.error('Error adding raw materials to dish');
    },
  });
};

// Hook to update raw materials for a dish
export const useUpdateRawMaterilasToDish = () => {
  return useMutation({
    mutationFn: updateRawMaterilasToDishAdmin,
    onSuccess: () => {
      toast.success('Raw Material updated for dish successfully');
    },
    onError: () => {
      toast.error('Error updating raw materials for dish');
    },
  });
};

// Hook to predict raw materials for a dish
export const usePredictRawMaterials = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: predictRawMaterialForDish,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [ADMIN_DISH_QUERY_KEYS.RAW_MATERIALS],
      });
    },
  });
};
