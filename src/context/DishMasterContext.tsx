import {
  DEFAULT_KG,
  DEFAULT_LANGUAGE_ID,
  DEFAULT_PEOPLE_COUNT,
  DEFAULT_PRICE,
} from '@/lib/contants';
import React, {createContext, useContext, useState, ReactNode} from 'react';

// Define the shape of the context state
interface DishMasterContextType {
  selectedLanguageId: string;
  setSelectedLanguageId: (id: string) => void;
  dishId: string;
  setDishId: (id: string) => void;
  inputData: string;
  setInputData: (data: string) => void;
  people: number;
  setPeople: (people: number) => void;
  kg: number;
  setKg: (kg: number) => void;
  price: number;
  setPrice: (price: number) => void;
}

// Create the context with a default value
const DishMasterContext = createContext<DishMasterContextType | undefined>(
  undefined,
);

// Create a provider component
const DishMasterProvider: React.FC<{children: ReactNode}> = ({children}) => {
  const [selectedLanguageId, setSelectedLanguageId] =
    useState<string>(DEFAULT_LANGUAGE_ID);
  const [dishId, setDishId] = useState<string>('');
  const [inputData, setInputData] = useState<string>('');
  const [people, setPeople] = useState<number>(DEFAULT_PEOPLE_COUNT);
  const [kg, setKg] = useState<number>(DEFAULT_KG);
  const [price, setPrice] = useState<number>(DEFAULT_PRICE);

  return (
    <DishMasterContext.Provider
      value={{
        selectedLanguageId,
        setSelectedLanguageId,
        dishId,
        setDishId,
        inputData,
        setInputData,
        people,
        setPeople,
        kg,
        setKg,
        price,
        setPrice,
      }}
    >
      {children}
    </DishMasterContext.Provider>
  );
};

// Custom hook to use the DishMasterContext
const useDishMaster = () => {
  const context = useContext(DishMasterContext);
  if (!context) {
    throw new Error('useDishMaster must be used within a DishMasterProvider');
  }
  return context;
};

// Exporting components and hooks at the end
export {DishMasterProvider, useDishMaster};
