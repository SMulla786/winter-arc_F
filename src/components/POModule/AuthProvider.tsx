/* eslint-disable @typescript-eslint/no-explicit-any */
import {createContext, useContext, useState, useEffect} from 'react';

interface RawMaterialData {
  id: string;
  listNo: number;
  caterorId: string;
  from: Date;
  to: Date;
  createdAt: string;
  updatedAt: string;
  sendToVendors: Array<{
    id: string;
    materialId: string;
    RMlistId: string;
    inventory: number;
    name: string;
    quantity: number;
    caterorId: string;
    tendorNo: number;
    inventoryOrder: number;
    unit: string;
    eventId: string | null;
    createdAt: string;
    rawmaterial: {
      id: string;
      name: string;
      unit: string;
      categoryId: string;
      languageId: string;
      caterorId: string;
      inventory: number;
      amount: number;
      createdAt: string;
      category: {
        id: string;
        name: string;
        createdAt: string;
        updatedAt: string;
        languageId: string;
        caterorId: string;
      };
    };
  }>;
  type: 'raw_material';
}

interface AuthContextType {
  user: any;
  customRawMaterialData: RawMaterialData | null;
  setRawMaterialData: (data: RawMaterialData | null) => void;
  loadRawMaterialData: () => RawMaterialData | null;
  saveRawMaterialData: (data: RawMaterialData) => void;
  clearRawMaterialData: () => void;
  // Transform API response to RawMaterialData format
  transformApiToRawMaterialData: (apiData: any) => RawMaterialData | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({children}: {children: React.ReactNode}) => {
  const [user, setUser] = useState(null);
  const [customRawMaterialData, setRawMaterialData] =
    useState<RawMaterialData | null>(null);

  // Transform API response to RawMaterialData format
  const transformApiToRawMaterialData = (
    apiData: any,
  ): RawMaterialData | null => {
    if (!apiData) return null;

    // Check if it's the API response structure
    if (apiData.data && apiData.data.sendToVendors) {
      return {
        id: apiData.data.id,
        listNo: apiData.data.listNo,
        caterorId: apiData.data.caterorId,
        from: new Date(apiData.data.from),
        to: new Date(apiData.data.to),
        createdAt: apiData.data.createdAt,
        updatedAt: apiData.data.updatedAt,
        sendToVendors: apiData.data.sendToVendors,
        type: 'raw_material',
      };
    }

    // If it's already in RawMaterialData format
    if (apiData.sendToVendors) {
      return {
        ...apiData,
        from:
          apiData.from instanceof Date ? apiData.from : new Date(apiData.from),
        to: apiData.to instanceof Date ? apiData.to : new Date(apiData.to),
      };
    }

    return null;
  };

  // Load raw material data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('customRawMaterialData');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        if (parsedData) {
          const materialData =
            transformApiToRawMaterialData(parsedData) || parsedData;
          setRawMaterialData(materialData as RawMaterialData);
        }
      } catch (error) {
        console.error('Failed to parse saved raw material data:', error);
        localStorage.removeItem('customRawMaterialData');
      }
    }
  }, []);

  // Save raw material data to localStorage whenever it changes
  useEffect(() => {
    if (customRawMaterialData) {
      localStorage.setItem(
        'customRawMaterialData',
        JSON.stringify(customRawMaterialData),
      );
    }
  }, [customRawMaterialData]);

  const loadRawMaterialData = () => {
    const savedData = localStorage.getItem('customRawMaterialData');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        return transformApiToRawMaterialData(parsedData) || parsedData;
      } catch (error) {
        console.error('Failed to parse saved raw material data:', error);
        return null;
      }
    }
    return null;
  };

  const saveRawMaterialData = (data: RawMaterialData) => {
    setRawMaterialData(data);
    localStorage.setItem('customRawMaterialData', JSON.stringify(data));
  };

  const clearRawMaterialData = () => {
    setRawMaterialData(null);
    localStorage.removeItem('customRawMaterialData');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        customRawMaterialData,
        setRawMaterialData,
        loadRawMaterialData,
        saveRawMaterialData,
        clearRawMaterialData,
        transformApiToRawMaterialData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
