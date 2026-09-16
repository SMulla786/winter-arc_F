import {useQueryClient, useMutation, useQuery} from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {CATEROR_DISH_QUERY_KEYS} from '../../queryKeys';
import {
  addRawMaterialCaterorPrice,
  addRawMaterialRateList,
  getClubVendorPackage,
  getEventRateList,
  getFuelCost,
  getRawMaterialPrice,
  getTransporatioanCost,
} from '@/lib/api/cateror/rawmaterialprice';

interface ManpowerItem {
  id?: string;
  manpowerVendorId: string;
  manpowerRoleId: string;
  quantity: number;
  rate: number;
  transport: number;
  totalAmount: number;
}

interface DisplayVendorItem {
  id?: string;
  displayVendorId: string;
  displayId: string;
  quantity: number;
  price: number;
  totalPrice: number;
}

interface ExtraCostItem {
  id?: string;
  additionalVendorId: string;
  categoryId: string;
  particular: string;
  quantity: number;
  price: number;
  total: number;
}

interface FoodVendorItem {
  id: string;
  foodVendorId: string;
  clubVendorId: string;
  price: number;
  rawMaterialCalculation: boolean;
  expected: number;
  preparation: number;
  unit:
    | 'LITRE'
    | 'GRAM'
    | 'KILOGRAM'
    | 'BOTTLE'
    | 'PIECE'
    | 'METER'
    | 'PACKET'
    | 'BUNDLE';
  singlePrice: number;
  transport: number;
  count: number;
}

interface RawMaterialRateListData {
  subEventId: string;
  manpower: ManpowerItem[];
  displayVendors: DisplayVendorItem[];
  price: number;
  foodVendor: FoodVendorItem[];
  profit: number;
  perPlatePrice: number;
  extraCost: ExtraCostItem[];
  rawMaterialCost: number;
  perPlate?: number;
  defaultPerPlate?: number;
}

export const useAddRawMaterialcaterorPrice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addRawMaterialCaterorPrice,
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [CATEROR_DISH_QUERY_KEYS.RAW_MATERIAL_CATEROR],
      });
    },
    onSuccess: () => toast.success('Raw Material added successfully!'),
    onError: () => toast.error('Failed to add raw material'),
  });
};

// export const useGetRawMaterialcaterorPrice = () => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: getRawMaterialPrice,
//     onSettled: () => {
//       queryClient.invalidateQueries({
//         queryKey: ['RawMaterialPrice'],
//       });
//     },
//     onSuccess: () => toast.success('Raw Material added successfully!'),
//     onError: () => toast.error('Failed to add raw material'),
//   });
// };

export const useAddRawMaterialRateList = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({subEventId, ...data}: RawMaterialRateListData) =>
      addRawMaterialRateList(subEventId, data),
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [CATEROR_DISH_QUERY_KEYS.RAW_MATERIAL_CATEROR],
      });
      queryClient.invalidateQueries({queryKey: ['foodVendorAssignments']});
    },
    onSuccess: () => {
      toast.success('Data saved successfully!');
      queryClient.invalidateQueries({queryKey: ['foodVendorAssignments']});
    },
    onError: () => toast.error('Failed to save data'),
  });
};

export const useGetEventRateList = (subEventId: string) => {
  return useQuery({
    queryKey: [CATEROR_DISH_QUERY_KEYS.RAW_MATERIAL_CATEROR],
    queryFn: () => getEventRateList(subEventId),
  });
};

export const useGetFuelCost = (eventId: string) => {
  return useQuery({
    queryKey: ['fuel', eventId],
    queryFn: () => getFuelCost(eventId),
  });
};

export const useGetTransportaionCost = (eventId: string) => {
  return useQuery({
    queryKey: ['transport', eventId],
    queryFn: () => getTransporatioanCost(eventId),
  });
};

export const useGetClubVendorPackage = () => {
  return useQuery({
    queryKey: ['clubvendorspackage'],
    queryFn: getClubVendorPackage,
  });
};
