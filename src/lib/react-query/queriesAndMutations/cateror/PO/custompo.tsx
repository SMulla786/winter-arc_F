/*eslint-disable*/
import {submitPurchaseorderCustom} from '@/lib/api/cateror/PO/pomodule';
import {api} from '@/utils/axios';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {z} from 'zod';

export const customPurchaseOrderSchema = z.object({
  eventId: z.string().optional(),
  eventName: z.string(),
  materials: z.array(
    z.object({
      materialId: z.string(),
      materialName: z.string(),
      vendorId: z.string(),
      vendorName: z.string(),
      unit: z.string(),
      quantity: z.number().positive(),
      category: z.string(),
      subeventId: z.string(),
      subeventName: z.string(),
      date: z.string(), // Keep as string in frontend
      time: z.string(), // Keep as string in frontend
      venue: z.string(),
      price: z.number().positive(),
      totalAmount: z.number(),
      isBreakdown: z.boolean().optional(),
      parentId: z.string().nullable().optional(),
      particular: z.string().optional().default(''), // Optional with default
    }),
  ),
});
export type CustomPurchaseOrderData = z.infer<typeof customPurchaseOrderSchema>;

export const rawMaterialSchema = z.object({
  id: z.string(),
  listNo: z.number(),
  caterorId: z.string(),
  from: z.string(),
  to: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  sendToVendors: z.array(
    z.object({
      id: z.string(),
      materialId: z.string(),
      RMlistId: z.string(),
      inventory: z.number(),
      name: z.string(),
      quantity: z.number(),
      caterorId: z.string(),
      tendorNo: z.number(),
      inventoryOrder: z.number(),
      unit: z.string(),
      eventId: z.string().nullable(),
      createdAt: z.string(),
      rawmaterial: z.object({
        id: z.string(),
        name: z.string(),
        unit: z.string(),
        inventory: z.number(),
        // Remove the fields that don't exist in the API response
        category: z.object({
          id: z.string(),
          name: z.string(),
          createdAt: z.string(),
          updatedAt: z.string(),
          languageId: z.string(),
          caterorId: z.string(),
        }),
      }),
    }),
  ),
});

export type RawMaterialData = z.infer<typeof rawMaterialSchema>;

export const useGetRawMaterialCustom = (id: string) => {
  return useQuery({
    queryKey: ['eventPoHistoryById', id],
    queryFn: () => getcustomRawMaterial(id),
    enabled: !!id,
  });
};

export const useGetAllCustomRawMaterials = (id: string) => {
  console.log('datidd', id);
  return useQuery({
    queryKey: ['eventPoHistoryById', id],
    queryFn: () => getallcustomhistory(id, {}),
    enabled: !!id,
  });
};

export const useGetCustomPo = (id: string) => {
  return useQuery({
    queryKey: ['eventPoHistoryById', id],
    queryFn: () => getcustompo(id),
    enabled: !!id,
  });
};

export const useGetTenderRM = (id: string) => {
  return useQuery({
    queryKey: ['eventPoHistoryById', id],
    queryFn: () => getTenderRawmaterial(id),
    enabled: !!id,
  });
};

export const useSubmitCutomPo = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => saveCustomPo(id, data),
    onSuccess: () => {
      toast.success('Custom PO submitted successfully');
      queryClient.invalidateQueries({queryKey: ['customrawmaterials']});
    },
    onError: (error: any) => {
      toast.error(
        `Failed to submit Custom PO: ${error.message || 'Unknown error'}`,
      );
    },
  });
};

export const useSaveCustomRawMaterial = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveCutomRawMtaerial,
    onSuccess: () => {
      toast.success('Custom Raw Material submitted successfully');
      queryClient.invalidateQueries({queryKey: ['customrawmaterials']});
    },
    onError: (error: any) => {
      toast.error(
        `Failed to submit Custom Raw Material: ${error.message || 'Unknown error'}`,
      );
    },
  });
};

export const saveCutomRawMtaerial = async (data: RawMaterialData) => {
  try {
    const response = await api.post(
      '/cateror/events/rawmateriallist/custom',
      data,
    );

    return response.data;
  } catch (error: any) {
    toast.error(
      `Failed to submit Raw Material: ${error.message || 'Unknown error'}`,
    );
    throw error;
  }
};

export const getcustomRawMaterial = async (
  id: string,
): Promise<RawMaterialData> => {
  try {
    const response = await api.get(`/cateror/events/rawmateriallist/${id}`);
    console.log('custom raw material response:', response);
    console.log('custom raw material data:', response.data);

    // Validate the response with Zod schema
    const validatedData = rawMaterialSchema.parse(response.data);

    return validatedData;
  } catch (error: any) {
    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      const errMsg = `Data validation failed: ${error.errors.map((e) => e.message).join(', ')}`;
      toast.error(errMsg);

      throw new Error(errMsg);
    }

    // Handle API errors
    const errMsg = `Failed to fetch raw materials: ${error.response?.data?.message || error.message || 'Unknown error'}`;
    toast.error(errMsg);
    throw error;
  }
};

export const getcustompo = async (id: string) => {
  try {
    const response = await api.get(`/cateror/purchase/RMlistId/${id}`);

    console.log('Full API Response:', response);
    console.log('Response data:', response.data);

    return response.data;
  } catch (error: any) {
    const errMsg = `Failed to fetch raw materials: ${error.response?.data?.message || error.message || 'Unknown error'}`;
    toast.error(errMsg);
    throw error;
  }
};

export const getTenderRawmaterial = async (id: string) => {
  try {
    const response = await api.get(`/cateror/purchase/RMlist/${id}`);
    console.log('Submit PO Response:', response.data);
    return response.data;
  } catch (error: any) {
    const errMsg = `Failed to fetch raw materials: ${error.response?.data?.message || error.message || 'Unknown error'}`;
    toast.error(errMsg);
    throw error;
  }
};

export const saveCustomPo = async (id: string, data: any): Promise<any> => {
  try {
    const response = await api.post(`/cateror/purchase/rmlist/${id}`, data);
    return response.data;
  } catch (error: any) {
    toast.error(
      `Failed to submit Purchase Order: ${error.message || 'Unknown error'}`,
    );
    throw error;
  }
};

export const getallcustomhistory = async (
  id: string,
  data: any,
): Promise<any> => {
  try {
    const response = await api.post(
      `/cateror/events/rawmateriallist/${id}`,
      data,
    );
    console.log('gethistory', response);

    console.log('gethistory dtaa', response.data);
    return response.data;
  } catch (error: any) {
    toast.error(
      `Failed to submit Purchase Order: ${error.message || 'Unknown error'}`,
    );
    throw error;
  }
};
