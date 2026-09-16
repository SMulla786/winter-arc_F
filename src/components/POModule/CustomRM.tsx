/* eslint-disable */
import React, {useState, useMemo, useEffect} from 'react';
import {useNavigate} from '@tanstack/react-router';
import {useAuth} from './AuthProvider';
import {useGetRawMaterialsCateror} from '@/lib/react-query/queriesAndMutations/cateror/dish';
import {
  useGetRawMaterialCustom,
  useSaveCustomRawMaterial,
} from '@/lib/react-query/queriesAndMutations/cateror/PO/custompo';
import {useGetRawMaterialHistory} from '@/lib/react-query/queriesAndMutations/cateror/Employee/totaldishcountandRawmaterial';
import CustomRMForm from './CustomRMForm';
import CustomRMTableView from './CustomRMTableView';
import CustomRMHistory from './CustomRMHistory';
import {z} from 'zod';
import CustomRMHistoryDetail from './CustomRMHistoryDetail';
import toast from 'react-hot-toast';
// Validation schema (can be moved to separate file)
export const poSubmissionValidationSchema = z.object({
  startDate: z.coerce.date(),
  data: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        quantity: z.number().min(1, 'Quantity must be at least 1'),
        unit: z.string(),
        inventory_value: z
          .number()
          .min(0, 'Inventory value cannot be negative'),
      }),
    )
    .min(1, 'At least one raw material is required'),
});

// Types (can be moved to separate file)
interface Category {
  id: string;
  name: string;
  caterorId: string;
  createdAt: string;
  languageId: string;
  updatedAt: string;
}

interface Material {
  id: string;
  name: string;
  category: Category;
  categoryId: string;
  unit: string;
  amount: number;
  inventory: number;
  caterorId: string;
  languageId: string;
  createdAt: string;
  updatedAt: string;
}

export interface SelectedMaterial extends Material {
  quantity: number;
  inventory_value: number;
}

export interface CustomPOSubmitProps {
  eventId?: string;
  initialData?: {
    startDate: string;
    data: Array<{
      id: string;
      name: string;
      quantity: number;
      unit: string;
      inventory_value: number;
    }>;
  };
  onSuccess?: () => void;
}

interface CategoryWiseData {
  category: string;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    unit: string;
    inventory_value: number;
    category: string;
  }>;
  totalQuantity: number;
  totalInventoryValue: number;
}

const CustomRMSubmit: React.FC<CustomPOSubmitProps> = ({
  eventId,
  initialData,
  onSuccess,
}) => {
  const navigate = useNavigate();
  const {
    customRawMaterialData,
    saveRawMaterialData,
    clearRawMaterialData,
    transformApiToRawMaterialData,
  } = useAuth();

  const {mutate: submitPO, isPending: isSubmitting} =
    useSaveCustomRawMaterial();
  const {
    data: existingPoData,
    isLoading: isExistingLoading,
    error: existingError,
  } = useGetRawMaterialCustom(eventId || '');
  const {data: rawMaterialData, isLoading: isMaterialsLoading} =
    useGetRawMaterialsCateror();
  const {data: historyData, isLoading: isHistoryLoading} =
    useGetRawMaterialHistory();

  // View state
  const [currentView, setCurrentView] = useState<
    'form' | 'table' | 'history' | 'history-detail'
  >(customRawMaterialData ? 'table' : 'form');

  const [selectedHistoryId, setSelectedHistoryId] = useState<string>('');

  // Show loading state for existing PO data
  if (eventId && isExistingLoading) {
    return (
      <div className="rounded-sm border border-neutral-200 bg-white p-6 shadow-md dark:border-black dark:bg-black">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="text-gray-500 dark:text-gray-400 mb-2">
              Loading raw material data...
            </div>
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-blue-600 border-r-transparent"></div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state for existing PO data
  if (eventId && existingError) {
    return (
      <div className="rounded-sm border border-neutral-200 bg-white p-6 shadow-md dark:border-black dark:bg-black">
        <div className="py-12 text-center">
          <div className="mb-2 text-red-500 dark:text-red-400">
            Error loading raw material data
          </div>
          <button
            onClick={() => window.location.reload()}
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Handle view changes
  const handleBackFromHistory = () => {
    if (customRawMaterialData) {
      setCurrentView('table');
    } else {
      setCurrentView('form');
    }
  };

  const handleClearData = () => {
    clearRawMaterialData();
    setCurrentView('form');
    toast.success('Data cleared successfully!');
  };

  const handleHistory = () => {
    setCurrentView('history');
  };

  // Handle view history detail
  const handleViewHistoryDetail = (historyId: string) => {
    console.log('Viewing history detail for ID:', historyId);

    // Check if this is the current session data from AuthContext
    if (customRawMaterialData && customRawMaterialData.id === historyId) {
      // Use the AuthContext data directly
      setSelectedHistoryId(historyId);
      setCurrentView('history-detail');
    } else {
      // Fetch from API for historical data
      setSelectedHistoryId(historyId);
      setCurrentView('history-detail');
    }
  };

  // Calculate category-wise totals for table view
  const getCategoryWiseData = useMemo((): CategoryWiseData[] => {
    if (!customRawMaterialData) return [];

    const categoryMap: {[key: string]: CategoryWiseData} = {};

    if (customRawMaterialData.sendToVendors) {
      customRawMaterialData.sendToVendors.forEach((item) => {
        const categoryName =
          item.rawmaterial?.category?.name || 'Uncategorized';

        if (!categoryMap[categoryName]) {
          categoryMap[categoryName] = {
            category: categoryName,
            items: [],
            totalQuantity: 0,
            totalInventoryValue: 0,
          };
        }

        categoryMap[categoryName].items.push({
          id: item.materialId,
          name: item.rawmaterial?.name || item.name,
          quantity: item.quantity,
          unit: item.unit,
          inventory_value: item.inventoryOrder,
          category: categoryName,
        });
        categoryMap[categoryName].totalQuantity += item.quantity;
        categoryMap[categoryName].totalInventoryValue += item.inventoryOrder;
      });
    }

    return Object.values(categoryMap);
  }, [customRawMaterialData]);

  // Determine which view to render
  const renderView = () => {
    switch (currentView) {
      case 'table':
        return (
          <CustomRMTableView
            customRawMaterialData={customRawMaterialData}
            getCategoryWiseData={getCategoryWiseData}
            onClearData={handleClearData}
            onViewHistory={handleHistory}
            onCreateNew={() => setCurrentView('form')}
          />
        );

      case 'form':
      default:
        return (
          <CustomRMForm
            eventId={eventId}
            initialData={initialData}
            existingPoData={existingPoData}
            rawMaterialData={rawMaterialData}
            isMaterialsLoading={isMaterialsLoading}
            isSubmitting={isSubmitting}
            customRawMaterialData={customRawMaterialData}
            onSubmitSuccess={(response) => {
              const rawMaterialData = transformApiToRawMaterialData(response);
              if (rawMaterialData) {
                saveRawMaterialData(rawMaterialData);
              }
              setCurrentView('table');
              if (onSuccess) onSuccess();
            }}
            submitPO={submitPO}
            onViewTable={() => setCurrentView('table')}
            onViewHistory={() => setCurrentView('history')}
          />
        );
    }
  };

  return (
    <div className="rounded-sm border border-neutral-200 bg-white p-6 shadow-md dark:border-black dark:bg-black">
      {renderView()}
    </div>
  );
};

export default CustomRMSubmit;
