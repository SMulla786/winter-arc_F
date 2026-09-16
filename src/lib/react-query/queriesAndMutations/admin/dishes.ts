import {
  addDish,
  addDishCategory,
  addMultipleDishRawMaterials,
  addNewRawMaterialForSubEvent,
  addRawMaterialCategoryCateror,
  addRawMaterialCateror,
  addRawMaterialForSubEvent,
  addRawMaterialToDishCateror,
  deleteDish,
  deleteDishCategory,
  deleteRawMaterial,
  deleteRawMaterialCategoryCat,
  deleteRawMaterialForSubevent,
  getCaterorById,
  getDishById,
  getDishCategories,
  getDishCategoriesExternal,
  getDishCategoryById,
  getDishes,
  getDishesExternal,
  getDishRawMaterialCateror,
  getrawmaterial,
  getRawMaterialById,
  getRawMaterialCategoryByIdCateor,
  getRawMaterialCategoryCateror,
  getRawMaterialCateror,
  getRawMaterialForSubevent,
  predictRawMaterialForDish,
  updateDish,
  updateDishCategory,
  updateDishRawMaterialCateror,
  updateMultipleDishRawMaterials,
  updateRawMaterialCateror,
  updateRawMaterialCaterorCat,
  uploadDish,
  uploadDishCat,
  uploadDisposal,
  uploadDisposalCat,
  uploadFile,
  uploadRawMaterialCat,
  uploadUtensials,
  uploadUtensialsCat,
} from '@/lib/api/cateror/dish';
import {
  CATEROR_DISH_QUERY_KEYS,
  CATEROR_DISH_RAW_MATERIAL_QUERY_KEYS,
} from '../../queryKeys';
import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {AddRawMaterialForSubEvent, AddRawMaterialToDish} from '@/types/dish';
import toast from 'react-hot-toast';
import {
  addMultipleDishRawMaterialsadmin,
  getProcessesadmin,
  getRawMaterialCaterorAdmin,
  predictRawMaterialForDishadmin,
  updateMultipleDishRawMaterialsadmin,
} from '@/lib/api/admin/dishes';

export const useAddRawMaterialCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addRawMaterialCategoryCateror,
    onSuccess: () => toast.success('Raw Material Category added successfully!'),
    onError: (error) => toast.error('Failed to add raw material category'),
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [CATEROR_DISH_QUERY_KEYS.RAW_MATERIAL_CATEGORY_CATEROR],
      });
    },
  });
};

export const useGetRawMaterialCategoriesCat = () => {
  return useQuery({
    queryKey: [CATEROR_DISH_QUERY_KEYS.RAW_MATERIAL_CATEGORY_CATEROR],
    queryFn: getRawMaterialCategoryCateror,
  });
};

export const useGetRawMaterialCategoryByIdCat = (id: string) => {
  return useQuery({
    queryKey: [CATEROR_DISH_QUERY_KEYS.RAW_MATERIAL_CATEGORY_CATEROR, id],
    queryFn: () => getRawMaterialCategoryByIdCateor(id),
  });
};

export const useUpdateRawMaterialCategoriesCat = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({id, data}: {id: string; data: {name: string}}) => {
      return updateRawMaterialCaterorCat(id, data);
    },
    onSuccess: () =>
      toast.success('Raw Material Category updated successfully!'),
    onError: () => toast.error('Failed to update raw material category'),
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [CATEROR_DISH_QUERY_KEYS.RAW_MATERIAL_CATEGORY_CATEROR],
      });
    },
  });
};

export const useGetRawMaterialById = (id: string) => {
  return useQuery({
    queryKey: [CATEROR_DISH_QUERY_KEYS.RAW_MATERIAL_CATEROR],
    queryFn: () => getRawMaterialById(id),
  });
};

export const useGetRawMaterial = (id: string) => {
  return useQuery({
    queryKey: [CATEROR_DISH_QUERY_KEYS.RAW_MATERIAL_CATEROR],
    queryFn: () => getrawmaterial(id),
  });
};

export const useDeleteRawMaterialCategoryCat = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteRawMaterialCategoryCat(id),
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [CATEROR_DISH_QUERY_KEYS.RAW_MATERIAL_CATEGORY_CATEROR],
      });
    },
    onSuccess: () =>
      toast.success('Raw Material Category deleted successfully!'),
    onError: () => toast.error('Raw Material Available For This category'),
  });
};

export const useAddRawMaterialCateror = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addRawMaterialCateror,
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [CATEROR_DISH_QUERY_KEYS.RAW_MATERIAL_CATEROR],
      });
    },
    onSuccess: () => toast.success('Raw Material added successfully!'),
    onError: () => toast.error('Failed to add raw material'),
  });
};

export const useGetRawMaterialsCaterorAdmin = (languageId?: string) => {
  return useQuery({
    queryKey: [CATEROR_DISH_QUERY_KEYS.RAW_MATERIAL_CATEROR, languageId],
    queryFn: () => getRawMaterialCaterorAdmin(languageId as string),
    enabled: !!languageId,
  });
};
export const useUpdateRawMaterialsCateror = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: {
        name: string;
        amount: number;
        inventory: number;
        unit: string;
        categoryId: string;
      };
    }) => updateRawMaterialCateror(id, data),
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [CATEROR_DISH_QUERY_KEYS.DISH_CATEGORIES],
      });
    },
    onSuccess: () => toast.success('Raw Material updated successfully!'),
    onError: () => toast.error('Failed to update raw material'),
  });
};

export const useDeleteRawMaterial = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteRawMaterial(id),
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [CATEROR_DISH_QUERY_KEYS.RAW_MATERIAL_CATEROR],
      });
    },
    onError: () => toast.error('Dish is Available For This Raw material'),
    onSuccess: () => toast.success('Raw Material deleted successfully!'),
  });
};

// Hook to get all dish categories
export const useGetDishCategoriesAdmin = () => {
  return useQuery({
    queryKey: [CATEROR_DISH_QUERY_KEYS.DISH_CATEGORIES],
    queryFn: () => getDishCategories(),
  });
};

export const useGetDishCategoriesExternal = (id: string) => {
  return useQuery({
    queryKey: [CATEROR_DISH_QUERY_KEYS.DISH_CATEGORIES],
    queryFn: () => getDishCategoriesExternal(id),
  });
};

export const useGetDishesExternal = (id: string) => {
  return useQuery({
    queryKey: [CATEROR_DISH_QUERY_KEYS.DISHES],
    queryFn: () => getDishesExternal(id),
  });
};

export const useAddDishCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addDishCategory,
    onSuccess: () => toast.success('Dish category added successfully!'),
    onError: () => toast.error('Failed to add dish category'),
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [CATEROR_DISH_QUERY_KEYS.DISH_CATEGORIES],
      });
    },
  });
};

export const useUploadFile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: uploadFile,
    onSuccess: () => toast.success('File Upload successfully!'),
    onError: () => toast.error('Failed to upload file'),
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['file'],
      });
    },
  });
};

// Hook to get a dish category by id
export const useGetDishCategoryById = (id: string) => {
  return useQuery({
    queryKey: [CATEROR_DISH_QUERY_KEYS.DISH_CATEGORIES],
    queryFn: () => getDishCategoryById(id),
    enabled: !!id,
  });
};

export const useGetDishesAdmin = () => {
  return useQuery({
    queryKey: [CATEROR_DISH_QUERY_KEYS.DISHES],
    queryFn: () => getDishes(),
  });
};
// Hook to update a dish category
export const useUpdateDishCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({id, data}: {id: string; data: {name: string}}) =>
      updateDishCategory(id, data),
    onSuccess: () => toast.success('Dish category updated successfully!'),
    onError: () => toast.error('Failed to update dish category'),
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [CATEROR_DISH_QUERY_KEYS.DISH_CATEGORIES],
      });
    },
  });
};

// Hook to delete a disposal category
export const useDeleteDishCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteDishCategory(id),
    onSuccess: () => toast.success('Dish category deleted successfully!'),
    onError: () => toast.error('Dish Available For This Category'),
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [CATEROR_DISH_QUERY_KEYS.DISH_CATEGORIES],
      });
    },
  });
};

// Hook to get all dish
export const useGetDishes = () => {
  return useQuery({
    queryKey: [CATEROR_DISH_QUERY_KEYS.DISHES],
    queryFn: () => getDishes(),
  });
};

// Hook to get a specific dish by ID
export const useGetDishByIdAdmin = (id: string) => {
  return useQuery({
    queryKey: [CATEROR_DISH_QUERY_KEYS.DISH],
    queryFn: () => getDishById(id),
    enabled: !!id,
    refetchOnWindowFocus: false,
  });
};

// Hook to add a new dish
export const useAddDishAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addDish,
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [CATEROR_DISH_QUERY_KEYS.DISHES],
      });
    },
  });
};

export const useUploadDishAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: uploadDish,
    onSuccess: () => toast.success('File Upload successfully!'),
    onError: () => toast.error('Failed to upload file'),

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['dish_upload'],
      });
    },
  });
};

export const useUploadRawMaterialCatAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: uploadRawMaterialCat,
    onSuccess: () => toast.success('File Upload successfully!'),
    onError: () => toast.error('Failed to upload file'),

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['rawcat_upload'],
      });
    },
  });
};

export const useUploadDishCat = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: uploadDishCat,
    onSuccess: () => toast.success('File Upload successfully!'),
    onError: () => toast.error('Failed to upload file'),

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['rawcat_upload'],
      });
    },
  });
};

export const useUploadDisposalAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: uploadDisposal,
    onSuccess: () => toast.success('File Upload successfully!'),
    onError: () => toast.error('Failed to upload file'),

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['disposal_upload'],
      });
    },
  });
};

export const useUploadDisposalCatAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: uploadDisposalCat,
    onSuccess: () => toast.success('File Upload successfully!'),
    onError: () => toast.error('Failed to upload file'),

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['disposalcat_upload'],
      });
    },
  });
};

export const useUploadUtensilsCatAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: uploadUtensialsCat,
    onSuccess: () => toast.success('File Upload successfully!'),
    onError: () => toast.error('Failed to upload file'),

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['utensilscat_upload'],
      });
    },
  });
};

export const useUploadUtensilsAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: uploadUtensials,
    onSuccess: () => toast.success('File Upload successfully!'),
    onError: () => toast.error('Failed to upload file'),

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['utensil_upload'],
      });
    },
  });
};

// Hook to update a dish
export const useUpdateDishAdmin = () => {
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
        priority: string;
        description?: string;
        vegNonveg: 'VEG' | 'NONVEG';
      };
    }) => updateDish(id, data),
    onSuccess: (res) => {
      // console.log('Dish updated successfully!');
    },
    onError: (error) => {
      console.log(error);
      toast.error('Failed to update dish');
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [CATEROR_DISH_QUERY_KEYS.DISHES],
      });
    },
  });
};

// Hook to delete a dish
export const useDeleteDishAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteDish(id),
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [CATEROR_DISH_QUERY_KEYS.DISHES],
      });
    },
  });
};

export const useAddRawMaterialToDishAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AddRawMaterialToDish) => addRawMaterialToDish(data),
    onSuccess: (res) => {
      toast.success('Raw material added to dish successfully!');
    },
    onError: (error) => {
      toast.error('Failed to add raw material to dish');
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [
          CATEROR_DISH_RAW_MATERIAL_QUERY_KEYS.GET_ALL_CATEROR_DISH_RAW_MATERIAL,
        ],
      });
    },
  });
};

export const useUpdateDishRawMaterialAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AddRawMaterialToDish) => updateDishRawMaterial(data),

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [
          CATEROR_DISH_RAW_MATERIAL_QUERY_KEYS.GET_ALL_CATEROR_DISH_RAW_MATERIAL,
        ],
      });
    },
  });
};

export const useGetDishRawMaterials = (id: string, people: number) => {
  console.log('id', id, 'people', people);
  return useQuery({
    // Include `id` and `data` in the queryKey to make it unique
    queryKey: [
      CATEROR_DISH_RAW_MATERIAL_QUERY_KEYS.GET_CATEROR_DISH_RAW_MATERIAL_BY_ID,
      id,
      people,
    ],
    queryFn: () => getDishRawMaterialCateror(id, people),
    enabled: !!id && !!people,
  });
};

export const usePredictRawMaterialsAdmin = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: predictRawMaterialForDishadmin,
    onSuccess: () => toast.success('Raw material predicted successfully!'),
    onError: () => toast.error('Failed to predict raw material'),
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [
          CATEROR_DISH_RAW_MATERIAL_QUERY_KEYS.GET_ALL_CATEROR_DISH_RAW_MATERIAL,
        ],
      });
    },
  });

  return mutation;
};

export const useGetCaterorById = (id: string, options?: {enabled: boolean}) => {
  return useQuery({
    queryKey: ['cateror', id],
    queryFn: () => getCaterorById(id),
    enabled: options?.enabled ?? true,
  });
};
export const useAddNewRawMaterialForSubevent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AddRawMaterialForSubEvent) =>
      addNewRawMaterialForSubEvent(data),
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['AddNewRawMaterialForSubEvent'],
      });
    },
    onSuccess: () => toast.success('Raw Material added successfully!'),
    onError: () => toast.error('Failed to add raw material'),
  });
};

export const useAddRawMaterialForSubevent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AddRawMaterialForSubEvent) =>
      addRawMaterialForSubEvent(data),
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['AddRawMaterialForSubEvent'],
      });
    },
    onSuccess: () => toast.success('Raw Material added successfully!'),
    onError: () => toast.error('Failed to add raw material'),
  });
};

export const useDeleteAddedRawmaterialForSubevent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteRawMaterialForSubevent(id),
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['AddNewRawMaterialForSubEvent'],
      });
    },
  });
};
export const useAddMultipleDishRawMaterialsAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addMultipleDishRawMaterialsadmin,
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['abc'],
      });
    },
    onSuccess: () => toast.success('Raw Material added successfully!'),
    onError: () => toast.error('Failed to add raw material'),
  });
};

export const useUpdateMultipleDishRawMaterialsAdmin = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateMultipleDishRawMaterialsadmin,
    onSettled: () => qc.invalidateQueries({queryKey: ['abc']}),
  });
};

export const useGetNewRawMaterialsFroSubevent = (id: string) => {
  return useQuery({
    queryKey: ['AddNewRawMaterialForSubEvent', id],
    queryFn: () => getRawMaterialForSubevent(id),
  });
};

export const useGetProcessesAdmin = (languageId?: string) => {
  return useQuery({
    queryKey: ['processes', languageId],
    queryFn: () => getProcessesadmin(languageId as string),
    enabled: !!languageId,
  });
};
