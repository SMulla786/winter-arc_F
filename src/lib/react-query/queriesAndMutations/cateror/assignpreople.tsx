/* eslint-disable */
import {api} from '@/utils/axios';
import {useMutation, useQuery} from '@tanstack/react-query';
import {AxiosError} from 'axios';
import {z} from 'zod';
import toast from 'react-hot-toast';
import {CATEROR_UTENSIL_QUERY_KEYS} from '../../queryKeys';

// Single schema with optional items array
const UtensilsPayloadSchema = z.object({
  people: z.number().min(1, 'People count must be at least 1'),
  caterorId: z.string().optional(),
  items: z
    .array(
      z.object({
        utensilId: z.string().min(1, 'Utensil ID is required'),
        quantity: z.number().min(0, 'Quantity must be non-negative'),
      }),
    )
    .optional()
    .default([]),
});
export const EventUtensilsSchema = z.object({
  eventId: z.string().min(1, 'Event ID is required'),
  utensils: z
    .array(
      z.object({
        utensilId: z.string().min(1, 'Utensil ID is required'),
        taken: z.number().min(0, 'Quantity must be at least 0'),
      }),
    )
    .min(1, 'At least one utensil is required'),
});

export type EventUtensilsPayload = z.infer<typeof EventUtensilsSchema>;

// Schema for Disposal
const DisposalPayloadSchema = z.object({
  people: z.number().min(1, 'People count must be at least 1'),
  caterorId: z.string().optional(),
  items: z
    .array(
      z.object({
        disposalId: z.string().min(1, 'Disposal ID is required'),
        quantity: z.number().min(0, 'Quantity must be non-negative'),
      }),
    )
    .optional()
    .default([]),
});

export const useSaveUtensilsQuantity = () => {
  return useMutation({
    mutationFn: (data: z.infer<typeof UtensilsPayloadSchema>) =>
      saveUtensilsQuantity(data),
    onSuccess: () => {
      toast.success('Utensils quantities saved successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to save utensils quantities');
    },
  });
};

export const useAddEventUtensils = () => {
  return useMutation({
    mutationFn: saveEventUtensils,
    onSuccess: () => {
      toast.success('Event utensils saved successfully');
    },
    onError: (error: Error) => {
      console.error('Mutation Error:', error);
      toast.error(error.message || 'Failed to save event utensils');
    },
  });
};

export const useSaveDisposalQuantity = () => {
  return useMutation({
    mutationFn: (data: z.infer<typeof DisposalPayloadSchema>) =>
      saveDisposalQuantity(data),
    onSuccess: () => {
      toast.success('Disposal quantities saved successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to save disposal quantities');
    },
  });
};

export const useGetUtensilsPeople = (languageId: string | null) => {
  return useQuery({
    queryKey: ['get data', languageId],
    queryFn: () => getUtensilsPeople(languageId as string),
    enabled: !!languageId, // Only run query when languageId is available
  });
};

export const useGetDisposalPeople = (languageId: string | null) => {
  return useQuery({
    queryKey: ['disposal-people', languageId],
    queryFn: () => getDisposalPeople(languageId),
    enabled: !!languageId,
  });
};

const saveUtensilsQuantity = async (
  data: z.infer<typeof UtensilsPayloadSchema>,
) => {
  try {
    const baseValidation = UtensilsPayloadSchema.parse(data);

    if (!baseValidation.items || baseValidation.items.length === 0) {
      throw new Error('At least one utensil item is required');
    }
    const response = await api.post(
      `/cateror/utensils/template`,
      baseValidation,
    );
    return response.data;
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(
        `Validation failed: ${error.errors.map((e) => e.message).join(', ')}`,
      );
    }
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to save utensils quantities',
      );
    }
    throw error;
  }
};

export const saveEventUtensils = async (data: EventUtensilsPayload) => {
  try {
    console.log('Sending data to API:', JSON.stringify(data, null, 2));

    // Validate the data
    const validatedData = EventUtensilsSchema.parse(data);

    // Log the validated data to ensure it's correct
    console.log('Validated data:', validatedData);

    // Make the API call to the correct endpoint
    const response = await api.post(
      '/cateror/events/utensils/bulk',
      validatedData,
    );

    console.log('API Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('API Error:', error);

    if (error instanceof z.ZodError) {
      const errorMessage = `Validation failed: ${error.errors.map((e) => e.message).join(', ')}`;
      console.error('Zod Validation Error:', errorMessage);
      throw new Error(errorMessage);
    }

    if (error.response) {
      const errorMessage =
        error.response.data?.message || 'Failed to save event utensils';
      console.error('API Error Response:', error.response.data);
      throw new Error(errorMessage);
    }

    throw error;
  }
};

const saveDisposalQuantity = async (
  data: z.infer<typeof DisposalPayloadSchema>,
) => {
  try {
    const baseValidation = DisposalPayloadSchema.parse(data);

    if (!baseValidation.items || baseValidation.items.length === 0) {
      throw new Error('At least one disposal item is required');
    }
    const response = await api.post(
      `/cateror/disposals/template`,
      baseValidation,
    );
    return response.data;
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(
        `Validation failed: ${error.errors.map((e) => e.message).join(', ')}`,
      );
    }
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to save disposal quantities',
      );
    }
    throw error;
  }
};

export const getUtensilsPeople = async (languageId: string) => {
  try {
    const response = await api.get(
      `/cateror/utensils/template?languageId=${languageId}`,
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to get disposal people',
      );
    }
    throw error;
  }
};

export const getDisposalPeople = async (languageId: string) => {
  try {
    const response = await api.get(
      `/cateror/disposals/template?languageId=${languageId}`,
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to get utensils people',
      );
    }
    throw error;
  }
};
