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
  deleteExtraRawPo,
  deleteRawMaterial,
  deleteRawMaterialCategoryCat,
  deleteRawMaterialForSubevent,
  ExtraRaw,
  getAllRawForExternalPo,
  getCaterorById,
  getDishById,
  getDishCategories,
  getDishCategoriesExternal,
  getDishCategoryById,
  getDishes,
  getDishesExternal,
  getDishRawMaterialCateror,
  getExtraRawMaterial,
  getMultipleDishes,
  getrawmaterial,
  getRawMaterialByDate,
  getRawMaterialById,
  getRawMaterialCategoryByIdCateor,
  getRawMaterialCategoryCateror,
  getRawMaterialCateror,
  getRawMaterialForSubevent,
  predictRawMaterialForDish,
  saveExtraRawMaterialPo,
  updateCounterIndexing,
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
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {AddRawMaterialForSubEvent, AddRawMaterialToDish} from '@/types/dish';
import toast from 'react-hot-toast';

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

export const useGetRawMaterialsCateror = () => {
  return useQuery({
    queryKey: [CATEROR_DISH_QUERY_KEYS.RAW_MATERIAL_CATEROR],
    queryFn: getRawMaterialCateror,
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
export const useGetDishCategories = () => {
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

// Hook to add a new dish category
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
export const useGetMultpleDishes = () => {
  return useMutation({
    mutationFn: getMultipleDishes,
    onSuccess: () => toast.success('Dish fetched successfully!'),
    onError: () => toast.error('Failed to fetch dish'),
  });
};

// Hook to get a specific dish by ID
export const useGetDishById = (id: string) => {
  return useQuery({
    queryKey: [CATEROR_DISH_QUERY_KEYS.DISH],
    queryFn: () => getDishById(id),
    enabled: !!id,
    refetchOnWindowFocus: false,
  });
};

// Hook to add a new dish
export const useAddDish = () => {
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

export const useUploadDish = () => {
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

export const useUploadRawMaterialCat = () => {
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

export const useUploadDisposal = () => {
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

export const useUploadDisposalCat = () => {
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

export const useUploadUtensilsCat = () => {
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

export const useUploadUtensils = () => {
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
export const useUpdateDish = () => {
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
        unit: string;
        portionSize: number;
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
export const useDeleteDish = () => {
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

export const useAddRawMaterialToDishCateror = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AddRawMaterialToDish) =>
      addRawMaterialToDishCateror(data),
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

export const useUpdateDishRawMaterialCateror = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AddRawMaterialToDish) =>
      updateDishRawMaterialCateror(data),

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

export const usePredictRawMaterials = () => {
  const mutation = useMutation({
    mutationFn: predictRawMaterialForDish,
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

export const useGetExtraRawMaterial = (id: string) => {
  return useQuery({
    queryKey: ['addextrarawpo', id],
    queryFn: () => getExtraRawMaterial(id),
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

export const useAddExtraRawMaterialPo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ExtraRaw) => saveExtraRawMaterialPo(data),
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['addextrarawpo'],
      });
      queryClient.invalidateQueries({
        queryKey: ['rawlist_history'],
      });
    },
    onSuccess: () => toast.success('Raw Material added successfully!'),
    onError: () => toast.error('Failed to add raw material'),
  });
};

export const useDeleteExtraRawPo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteExtraRawPo(id),
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['addextrarawpo'],
      });
      queryClient.invalidateQueries({
        queryKey: ['rawlist_history'],
      });
    },
    onSuccess: () => toast.success('Raw Material deleted successfully!'),
    onError: () => toast.error('Failed to delete raw material'),
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
export const useAddMultipleDishRawMaterials = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addMultipleDishRawMaterials,
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['abc'],
      });
    },
    onSuccess: () => toast.success('Raw Material added successfully!'),
    onError: () => toast.error('Failed to add raw material'),
  });
};

export const useUpdateMultipleDishRawMaterials = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateMultipleDishRawMaterials,
    onSettled: () => qc.invalidateQueries({queryKey: ['abc']}),
  });
};

export const useGetNewRawMaterialsFroSubevent = (id: string) => {
  return useQuery({
    queryKey: ['AddNewRawMaterialForSubEvent', id],
    queryFn: () => getRawMaterialForSubevent(id),
  });
};

export const useGetAllRawForExternalPo = () => {
  return useQuery({
    queryKey: ['all_raw_for_external_po'],
    queryFn: () => getAllRawForExternalPo(),
  });
};
// React Query hook for POST request
export const useGetRawMaterialsByDate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: getRawMaterialByDate,
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['rawMaterials'],
      });
    },

    onError: (error: Error) =>
      toast.error(error.message || 'Failed to generate raw material order'),
  });
};
export const useUpdateCounterIndexing = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {counterId: string; indexing: number}[]) =>
      updateCounterIndexing(data),

    onSuccess: () => {
      toast.success('Counter order updated');
    },

    onError: () => {
      toast.error('Failed to update counter order');
    },

    onSettled: () => {
      queryClient.invalidateQueries({queryKey: ['counter']});
    },
  });
};
