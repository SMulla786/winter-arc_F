/* eslint-disable */
// SubEventContext.tsx
import React, {createContext, useContext, useState} from 'react';
import {RawMaterialListTypes} from '@/lib/validation/eventSchema';

export type PortionPeople = {
  portionSize: number;
  people: number;
};

export type PortionAndPeopleState = Record<string, PortionPeople>;
interface SubEventContextProps {
  isCollapsed: boolean;
  setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  portionAndPeople: PortionAndPeopleState;
  setPortionAndPeople: React.Dispatch<
    React.SetStateAction<PortionAndPeopleState>
  >;
  selectedDishDetails: any;
  setSelectedDishDetails: React.Dispatch<React.SetStateAction<any>>;

  // Store manual updates per dish keyed by dishId.
  dishUpdates: Record<
    string,
    {kg: number; portionSize: number; rawMaterials: RawMaterialListTypes[]}
  >;
  setDishUpdates: React.Dispatch<
    React.SetStateAction<
      Record<
        string,
        {
          kg: number;
          portionSize: number;
          people: number;
          rawMaterials: RawMaterialListTypes[];
        }
      >
    >
  >;

  // Handler functions for dish click and saving dish details.
  onDishClick: (dishId: string) => void;
  setOnDishClick: React.Dispatch<
    React.SetStateAction<(dishId: string) => void>
  >;
  handleSaveDishDetails: (updatedDish: any) => void;
  setHandleSaveDishDetails: React.Dispatch<
    React.SetStateAction<(updatedDish: any) => void>
  >;

  // Prediction state.
  preparationPeople: number;
  setPreparationPeople: React.Dispatch<React.SetStateAction<number>>;

  predictRawMaterial: (args: {
    dishId: string;
    people: number;
    kg: number;
  }) => Promise<any>;
  setPredictRawMaterial: React.Dispatch<
    React.SetStateAction<
      (args: {dishId: string; people: number; kg: number}) => Promise<any>
    >
  >;
  predictedRawMaterials: any;
  setPredictedRawMaterials: React.Dispatch<React.SetStateAction<any>>;
}

const SubEventContext = createContext<SubEventContextProps | undefined>(
  undefined,
);

export const useSubEventContext = () => {
  const context = useContext(SubEventContext);
  if (!context) {
    throw new Error(
      'useSubEventContext must be used within a SubEventProvider',
    );
  }
  return context;
};

export const SubEventProvider: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selectedDishDetails, setSelectedDishDetails] = useState<any | null>(
    null,
  );
  const [portionAndPeople, setPortionAndPeople] = useState<
    Record<string, PortionPeople>
  >({});
  const [dishUpdates, setDishUpdates] = useState<
    Record<
      string,
      {
        kg: number;
        portionSize: number;
        people: number;
        rawMaterials: RawMaterialListTypes[];
      }
    >
  >({});

  // Handlers for dish click and saving details.
  const [onDishClick, setOnDishClick] = useState<(dishId: string) => void>(
    () => () => {},
  );
  // const [handleSaveDishDetails, setHandleSaveDishDetails] = useState<
  //   (updatedDish: any) => void
  // >(() => (updatedDish: any) => {
  //   // Save the manual update for this dish keyed by dishId.
  //   setDishUpdates((prev) => ({
  //     ...prev,
  //     [updatedDish.dishId]: {
  //       kg: updatedDish.kg,
  //       rawMaterials: updatedDish.rawMaterials,
  //     },
  //   }));
  //   setSelectedDishDetails(null);
  // });
  const [handleSaveDishDetails, setHandleSaveDishDetails] = useState<
    (updatedDish: any) => void
  >(() => (updatedDish: any) => {
    console.log('updateeeeee', updatedDish);
    setDishUpdates((prev) => ({
      ...prev,
      [updatedDish.dishId]: {
        kg: updatedDish.kg,
        rawMaterials: updatedDish.rawMaterials,
        portionSize: updatedDish?.portionSize,
        people: updatedDish.people,
        isaddish: updatedDish.isaddish ?? false,
      },
    }));

    // Defer closing popup to ensure state update is processed first
    setTimeout(() => {
      setSelectedDishDetails(null);
    }, 0);
  });

  // Prediction state.
  const [preparationPeople, setPreparationPeople] = useState<number>(0);
  const [predictRawMaterial, setPredictRawMaterial] = useState<
    (args: {dishId: string; people: number; kg: number}) => Promise<any>
  >(() => async () => {});
  const [predictedRawMaterials, setPredictedRawMaterials] = useState<any>(null);

  const contextValue: SubEventContextProps = {
    isCollapsed,
    setIsCollapsed,
    selectedDishDetails,
    setSelectedDishDetails,
    dishUpdates,
    setDishUpdates,
    onDishClick,
    setOnDishClick,
    handleSaveDishDetails,
    setHandleSaveDishDetails,
    preparationPeople,
    setPreparationPeople,
    predictRawMaterial,
    setPredictRawMaterial,
    predictedRawMaterials,
    setPredictedRawMaterials,
    portionAndPeople,
    setPortionAndPeople,
  };

  return (
    <SubEventContext.Provider value={contextValue}>
      {children}
    </SubEventContext.Provider>
  );
};
