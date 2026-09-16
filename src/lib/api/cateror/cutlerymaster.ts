import {api} from '@/utils/axios';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {AxiosError} from 'axios';
import {
  CATEROR_UTENSIL_QUERY_KEYS,
  EVENT_UTENSIL_KEYS,
} from '@/lib/react-query/queryKeys';
import toast from 'react-hot-toast';
import z from 'zod';
import {Utensil} from '@/types/cateror';

export const CutleryPayloadSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  categoryId: z.string().min(1, 'Category ID is required'),
  inventory: z.number().min(0, 'Inventory must be non-negative'),
});

export interface CutleryCategoryCreate {
  name: string;
  languageId: string | null;
}
export interface CutleryCategory {
  id: string;
  name: string;
  languageId: string;
}

export interface CutleryCreate {
  name: string;
  categoryId: string;
  languageId: string;
  inventory: number;
}

export const eventCutlerySchema = z.object({
  cutleryID: z.string().min(1, 'Cutlery ID is required'),
  taken: z.number().int().min(0),
  returned: z.number().int().min(0),
  fetchedReturned: z.number().int().min(0),
  updateReturned: z.number().int().min(0),
});

export const addCutleryToEventSchema = eventCutlerySchema.omit({
  returned: true,
});

export const bulkAddCutleryToEventSchema = z.object({
  eventId: z.string().min(1, 'Event Id is required'),
  cutleries: addCutleryToEventSchema.array(),
});

export type bulkAddCutleryToEventSchemaTypes = z.infer<
  typeof bulkAddCutleryToEventSchema
>;

export const EventCutleriesSchema = z.object({
  eventId: z.string().min(1, 'Event ID  is required'),
  cutleries: z
    .array(
      z.object({
        cutleryID: z.string().min(1, 'Cutlery ID is required'),
        taken: z.number().min(0, 'Quantity must be at least 0'),
      }),
    )
    .min(1, 'At least one Cutlery is required'),
});

export const updatecutlerySchema = z.object({
  name: z
    .string({required_error: 'Cutlery Name is required'})
    .min(3, {message: 'Cutlery Name must be at least 3 characters long'}),
  categoryId: z.string().min(1, 'Category ID is required'),
  inventory: z.number().min(0, 'Inventory must be non-negative'),
});

export type EventCutleryPayload = z.infer<typeof EventCutleriesSchema>;
export const useGetMasterCutlery = (languageId: string) => {
  return useQuery({
    queryKey: [CATEROR_UTENSIL_QUERY_KEYS.UTENSILS, languageId],
    queryFn: () => getMasterCutlery(languageId),
    enabled: !!languageId,
  });
};
export const useAddEventUCutlries = () => {
  return useMutation({
    mutationFn: saveEventCutlries,
    onSuccess: () => {
      toast.success('Event Cutlery saved successfully');
    },
    onError: (error: Error) => {
      console.error('Mutation Error:', error);
      toast.error(error.message || 'Failed to save event Cutlery');
    },
  });
};

export const useGetCutleryById = (id: string) => {
  return useQuery({
    queryKey: [CATEROR_UTENSIL_QUERY_KEYS.UTENSIL, id],
    queryFn: () => getCutleryById(id),
    enabled: !!id,
  });
};

export const getCutleryById = async (id: string) => {
  console.log('daaaataaa', id);

  try {
    const response = await api.get(`cateror/cutleries/${id}`);
    return response.data as Utensil;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to get utensil');
    }
    throw error;
  }
};

export const useUpdateCutlery = () => {
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
        inventory: number;
      };
    }) => updateCutlery(id, data),
    onSuccess: () => {
      toast.success('Cutlery updated successfully');
    },
    onError: () => {
      toast.error('Failed to update Cutlery');
    },
  });
};

export const updateCutlery = async (
  id: string,
  data: {
    name: string;
    categoryId: string;
    languageId: string;
    inventory: number;
  },
) => {
  console.log(id, data);
  try {
    const response = await api.patch(`cateror/cutleries/${id}`, data);
    return response;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || `Failed to update cutlery :${id}`,
      );
    }
    throw error;
  }
};

export const saveEventCutlries = async (data: EventCutleryPayload) => {
  try {
    console.log('Sending data to API:', JSON.stringify(data, null, 2));

    // Validate the data
    const validatedData = EventCutleriesSchema.parse(data);

    // Log the validated data to ensure it's correct
    console.log('Validated data:', validatedData);

    // Make the API call to the correct endpoint
    const response = await api.post(
      '/cateror/events/cutleries/bulk',
      validatedData,
    );

    // console.log('API Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('API Error:', error);

    if (error instanceof z.ZodError) {
      const errorMessage = `Validation failed: ${error.errors.map((e) => e.message).join(', ')}`;
      // console.error('Zod Validation Error:', errorMessage);
      throw new Error(errorMessage);
    }

    if (error.response) {
      const errorMessage =
        error.response.data?.message || 'Failed to save event utensils';
      // console.error('API Error Response:', error.response.data);
      throw new Error(errorMessage);
    }

    throw error;
  }
};
export const useSaveMasterCutlery = () => {
  return useMutation({
    mutationFn: (data: z.infer<typeof CutleryPayloadSchema>) =>
      saveCutleryQuantity(data),
    onSuccess: () => {
      toast.success('Utensils quantities saved successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to save utensils quantities');
    },
  });
};
export const useGetMasterCutleryById = (id: string) => {
  return useQuery({
    queryKey: [CATEROR_UTENSIL_QUERY_KEYS.UTENSILS, id],
    queryFn: () => getMasterCutleryById(id),
    enabled: !!id, // Only run the query if id exists
  });
};

export const useGetEventCutlery = (id: string) => {
  return useQuery({
    queryKey: [EVENT_UTENSIL_KEYS.GET_ALL_EVENT_UTENSIL],
    queryFn: () => getEventCutlery(id),
  });
};

export const useGetCutleryCategoryById = (id: string) => {
  return useQuery({
    queryKey: ['GET CUTLERY CATEGORY BY ID', id],
    queryFn: () => getCutleryCategoryById(id),
  });
};

export const useUpdateCutleryCategory = () => {
  return useMutation({
    mutationFn: updateCutleryCategory,
    onSuccess: () => {
      toast.success('Cutlery Category updated successfully');
    },
    onError: (error) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to update Cutlery Category';
      toast.error(errorMessage);
    },
  });
};

export const updateCutleryCategory = async (data: {
  id: string;
  data: {
    name: string;
  };
}) => {
  try {
    // Validate required fields before sending

    const res = await api.patch(`/cateror/cutleries/categories/${data.id}`, {
      name: data.data.name,
    });
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      // Log the error details for debugging
      console.error('API Error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      throw new Error(
        error.response?.data?.message || 'Failed to update cutlery category',
      );
    }
    throw error;
  }
};
export const getCutleryCategoryById = async (id: string) => {
  try {
    const response = await api.get(`cateror/cutleries/categories/${id}`);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to get cutlery category',
      );
    }
    throw error;
  }
};

export const useAddCutleryCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addCutleryCategory,
    onSuccess: () => {
      toast.success('Cutlery Category added successfully');
    },
    onError: () => {
      toast.error('Failed to add Cutlery Category');
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [CATEROR_UTENSIL_QUERY_KEYS.UTENSILCATEGORIES],
      });
    },
  });
};

export const useGetCutleryCategories = () => {
  return useQuery({
    queryKey: [CATEROR_UTENSIL_QUERY_KEYS.UTENSILCATEGORIES],
    queryFn: getCutleryCategories,
  });
};

export const useGetCutleries = (languageId?: string) => {
  return useQuery({
    queryKey: [CATEROR_UTENSIL_QUERY_KEYS.UTENSILS, languageId],
    queryFn: () => getCutleries(languageId!),
    enabled: !!languageId,
  });
};

export const useGetEventCutleries = (id: string) => {
  return useQuery({
    queryKey: [EVENT_UTENSIL_KEYS.GET_ALL_EVENT_UTENSIL],
    queryFn: () => getEventCutleries(id),
  });
};
export const getEventCutleries = async (id: string) => {
  try {
    const response = await api.get(`/cateror/events/cutleriesByEventId/${id}`);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to get Event Utensils',
      );
    }
    throw error;
  }
};
export const useBulkReturnEventCutleries = () => {
  return useMutation({
    mutationFn: bulkReturnEventCutleries,
    onSuccess: () => {
      toast.success('Event utensils returned successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to return event utensils');
    },
  });
};

export const bulkReturnEventCutleries = async (
  data: bulkAddCutleryToEventSchemaTypes,
) => {
  try {
    const response = await api.post('/cateror/events/cutleries/bulk/return', {
      eventId: data.eventId,
      cutleries: data.cutleries,
    });
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to get Event Utensils',
      );
    }
    throw error;
  }
};
export const useDeleteCutlery = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCutlery,
    onSuccess: () => {
      toast.success('Cutlery deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete Cutlery');
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [CATEROR_UTENSIL_QUERY_KEYS.UTENSILS],
      });
    },
  });
};

export const deleteCutlery = async (id: string) => {
  try {
    await api.delete(`cateror/cutleries/${id}`);
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to delete utensil',
      );
    }
    throw error;
  }
};

export const getCutleries = async (languageId: string) => {
  try {
    const response = await api.get(
      `cateror/cutleries?languageId=${languageId}`,
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to get cutleries',
      );
    }
    throw error;
  }
};
export const useAddCutlery = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addCutlery,
    onSuccess: () => {
      toast.success('Cutlery added successfully');
    },
    onError: () => {
      toast.error('Failed to add Cutlery');
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [CATEROR_UTENSIL_QUERY_KEYS.UTENSILS],
      });
    },
  });
};

export const addCutlery = async (data: CutleryCreate) => {
  try {
    const response = await api.post('/cateror/cutleries', data);
    return response.data as Utensil;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to add utensil');
    }
    throw error;
  }
};
export const addCutleryCategory = async (data: CutleryCategoryCreate) => {
  try {
    const response = await api.post('/cateror/cutleries/categories', data);
    return response.data as CutleryCategory;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to add utensil category',
      );
    }
    throw error;
  }
};

export const getCutleryCategories = async () => {
  try {
    const response = await api.get('cateror/cutleries/categories');
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

export const useBulkReturnEventUCutlery = () => {
  return useMutation({
    mutationFn: bulkReturnEventCutlery,
    onSuccess: () => {
      toast.success('Event utensils returned successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to return event utensils');
    },
  });
};

export const bulkReturnEventCutlery = async (
  data: bulkAddCutleryToEventSchemaTypes,
) => {
  try {
    const response = await api.post('/cateror/events/cutleries/bulk', {
      eventId: data.eventId,
      cutleries: data.cutleries,
    });
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to get Event Utensils',
      );
    }
    throw error;
  }
};

export const getEventCutlery = async (id: string) => {
  try {
    const response = await api.get(`/cateror/events/cutleries/${id}`);
    console.log('geteventcutlerydataaaaa', response);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to get Event Cutlery',
      );
    }
    throw error;
  }
};

export const getMasterCutlery = async (languageId: string) => {
  try {
    const response = await api.get(
      `/cateror/cutleries?languageId=${languageId}`,
    );
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

export const saveCutleryQuantity = async (
  data: z.infer<typeof CutleryPayloadSchema>,
) => {
  try {
    console.log('Saving utensil:', data);

    const baseValidation = CutleryPayloadSchema.parse(data);

    const response = await api.post(`/cateror/cutleries`, baseValidation);
    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Zod validation error:', error.errors);
      throw new Error(
        `Validation failed: ${error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ')}`,
      );
    }
    if (error instanceof AxiosError) {
      console.error('Axios error:', error.response?.data);
      throw new Error(
        error.response?.data?.message || 'Failed to save utensil quantity',
      );
    }
    console.error('Unexpected error:', error);
    throw error;
  }
};

export const getMasterCutleryById = async (id: string) => {
  try {
    const response = await api.get(`/cateror/events/cutleries/${id}`);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to fetch utensil',
      );
    }
    throw error;
  }
};
