// NewLabourRow.tsx
import React, {useEffect, useMemo, useRef} from 'react';
import {DishType} from './NewDishTable';
import {usePredictRawMaterials} from '@/lib/react-query/queriesAndMutations/cateror/dish';

export type Props = {
  dish: DishType;
  setAllDishes: React.Dispatch<React.SetStateAction<DishType[]>>;
  setSelectedDishId: React.Dispatch<React.SetStateAction<string | null>>;
  onLabourChange?: () => void;
  onDishSaved?: (dishId: string) => void;
};

const NewLabourRow: React.FC<Props> = ({
  dish,
  setAllDishes,
  setSelectedDishId,
  onLabourChange,
  onDishSaved,
}) => {
  const predictionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const {mutateAsync: predictRawMaterialByDish} = usePredictRawMaterials();

  const productionQty = useMemo(() => {
    const portion = dish?.portionSize || 0;
    const people = dish?.people || 0;
    const result = portion * people;
    return parseFloat(result.toFixed(3));
  }, [dish]);

  useEffect(() => {
    return () => {
      if (predictionTimeoutRef.current) {
        clearTimeout(predictionTimeoutRef.current);
      }
    };
  }, []);

  const triggerPrediction = () => {
    if (predictionTimeoutRef.current) {
      clearTimeout(predictionTimeoutRef.current);
    }

    predictionTimeoutRef.current = setTimeout(() => {
      if (
        dish?.dishId &&
        (dish?.portionSize || 0) > 0 &&
        (dish?.people || 0) > 0
      ) {
        handlePredictDish();
      }
    }, 1000);
  };

  const handlePredictDish = async () => {
    try {
      const response = await predictRawMaterialByDish({
        dishId: dish.dishId,
        people: dish?.people || 0,
        kg: productionQty,
      });

      setAllDishes((prev) => {
        return prev.map((d) =>
          d.dishId === dish.dishId
            ? {...d, rawMaterials: response.rawMaterials || []}
            : d,
        );
      });
    } catch (error) {
      console.error('Labour dish prediction error:', error);
    }
  };

  const handlePortionChange = (value: number) => {
    onLabourChange?.();
    const fixedValue = parseFloat(value.toFixed(3));
    setAllDishes((prev) =>
      prev.map((d) =>
        d.dishId === dish.dishId ? {...d, portionSize: fixedValue} : d,
      ),
    );
    triggerPrediction();
  };

  const handlePeopleChange = (value: number) => {
    onLabourChange?.();
    setAllDishes((prev) =>
      prev.map((d) => (d.dishId === dish.dishId ? {...d, people: value} : d)),
    );
    triggerPrediction();
  };

  return (
    <tr className="border-gray-300 dark:border-gray-700 align-middle">
      {/* Dish Name */}
      <td className="px-4 py-2 text-center">
        <input
          type="text"
          className="w-full cursor-pointer border-none bg-transparent text-center text-black hover:text-blue-600 dark:text-white"
          value={dish?.name || ''}
          readOnly
          onClick={() => setSelectedDishId(dish?.dishId)}
        />
      </td>

      {/* Portion Size */}
      <td className="px-2 py-2 text-center">
        <div className="flex items-center justify-center space-x-1">
          <input
            type="number"
            value={dish?.portionSize || 0}
            onChange={(e) => {
              const value = parseFloat(e.target.value);
              if (!isNaN(value)) {
                handlePortionChange(value);
              }
            }}
            onBlur={(e) => {
              const value = parseFloat(e.target.value);
              if (!isNaN(value)) {
                const fixedValue = parseFloat(value.toFixed(3));
                e.target.value = fixedValue.toString();
                handlePortionChange(fixedValue);
              }
            }}
            step="0.001"
            min="0"
            className="w-24 rounded-md border border-stroke bg-transparent px-2 py-1 text-sm text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary dark:disabled:bg-black"
            placeholder="0.000"
          />
          <span className="text-gray-500 text-sm">{dish?.unit}</span>
        </div>
      </td>

      {/* No Of People */}
      <td className="px-2 py-2 text-center">
        <div className="flex items-center justify-center space-x-1">
          <input
            type="number"
            value={dish?.people || 0}
            onChange={(e) => {
              const value = parseFloat(e.target.value);
              if (!isNaN(value)) {
                handlePeopleChange(value);
              }
            }}
            className="w-20 rounded-md border border-stroke bg-transparent px-2 py-1 text-sm text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary dark:disabled:bg-black"
            min="0"
          />
          <span className="text-gray-500 text-sm">people</span>
        </div>
      </td>

      {/* Production Qty */}
      <td className="px-4 py-2 text-center text-black dark:text-white">
        <div className="flex items-center justify-center space-x-1">
          <input
            type="number"
            value={productionQty.toFixed(3)}
            readOnly
            step="0.001"
            className="w-24 rounded-md border border-stroke bg-transparent px-2 py-1 text-sm text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary dark:disabled:bg-black"
          />
          <span className="text-gray-500 text-sm">{dish?.unit}</span>
        </div>
      </td>

      {/* Food Labour */}
      <td className="px-4 py-2 text-center">
        <input
          type="text"
          className="w-full border-none bg-transparent text-center text-black dark:text-white"
          disabled
          value={dish.foodVendor || ''}
        />
      </td>
    </tr>
  );
};

export default NewLabourRow;
