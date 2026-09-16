import React, {useEffect, useMemo, useRef} from 'react';
import {DishType} from './NewDishTable';
import OutSideMultipleSelectDropdown from '../RawMaterialComponents/OutSideMultipleSelectDropdown';
import toast from 'react-hot-toast';
import {usePredictRawMaterials} from '@/lib/react-query/queriesAndMutations/cateror/dish';
type Props = {
  dish: DishType;
  setAllDishes: React.Dispatch<React.SetStateAction<DishType[]>>;
  maharajOptions: {label: string; value: string}[];
  setSelectedDishId: React.Dispatch<React.SetStateAction<string | null>>;
  onDishSaved?: (dishId: string) => void;
};

const NewDishRow: React.FC<Props> = ({
  dish,
  setAllDishes,
  maharajOptions,
  setSelectedDishId,
  onDishSaved,
}) => {
  const isMissingRawMaterial = dish?.rawMaterials?.length === 0;
  const {mutateAsync: predictRawMaterialByDish, isPending: isPredicting} =
    usePredictRawMaterials();
  const userChangedRef = useRef(false);
  const productionQty = useMemo(() => {
    const portion = dish?.portionSize;
    const people = dish?.people;

    return portion && people ? portion * people : 0;
  }, [dish]);
  const handlePredictDish = async () => {
    if (!dish) return;

    try {
      const response = await predictRawMaterialByDish({
        dishId: dish.dishId,
        people: dish?.people,
        kg: productionQty,
      });

      const newDish = response;
      setAllDishes((prev) => {
        const current = prev || [];
        const exists = current.some((d) => d.dishId === newDish.dishId);

        if (exists) {
          return current.map((dish) =>
            dish.dishId === newDish.dishId
              ? {...dish, rawMaterials: newDish.rawMaterials}
              : dish,
          );
        } else {
          return [...current, newDish];
        }
      });
    } catch (error) {
      console.error(error);
      toast.error('Prediction failed. Please try again.');
    }
  };

  useEffect(() => {
    if (!userChangedRef.current) return;
    if (!dish?.dishId || !dish?.portionSize || !dish?.people) return;

    const timer = setTimeout(() => {
      handlePredictDish();
    }, 800);

    return () => clearTimeout(timer);
  }, [dish?.portionSize, dish?.people]);
  return (
    <>
      <tr className="align-middle">
        <td className="px-2 py-2 text-center">
          <input
            type="text"
            value={dish?.name || ''}
            className={`w-full cursor-pointer border-none bg-transparent text-center text-black dark:text-white ${
              isMissingRawMaterial ? 'text-red-500 dark:text-red-500' : ''
            }`}
            readOnly
            onClick={() => setSelectedDishId(dish?.dishId)}
          />
        </td>

        <td className="px-2 py-2 text-center">
          <div className="flex items-center justify-center space-x-1">
            <input
              type="number"
              value={dish.portionSize || 0}
              onChange={(e) => {
                userChangedRef.current = true;
                const value = parseFloat(e.target.value) || 0;

                setAllDishes((prev) =>
                  prev.map((d) =>
                    d.dishId === dish.dishId ? {...d, portionSize: value} : d,
                  ),
                );
              }}
              className="w-20 rounded-md border border-stroke bg-transparent px-2 py-1 text-sm text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary dark:disabled:bg-black"
            />

            <span className="text-gray-500 text-sm">{dish?.unit}</span>
          </div>
        </td>

        <td className="px-2 py-2 text-center">
          <div className="flex items-center justify-center space-x-1">
            <input
              type="number"
              value={dish?.people || 0}
              onChange={(e) => {
                userChangedRef.current = true;
                const value = parseFloat(e.target.value) || 0;

                setAllDishes((prev) =>
                  prev.map((d) =>
                    d.dishId === dish.dishId ? {...d, people: value} : d,
                  ),
                );
              }}
              className="w-20 rounded-md border border-stroke bg-transparent px-2 py-1 text-sm text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary dark:disabled:bg-black"
            />
            <span className="text-gray-500 text-sm">people</span>
          </div>
        </td>

        <td className="px-2 py-2 text-center">
          <div className="flex items-center justify-center space-x-1">
            <input
              type="number"
              value={productionQty.toFixed(3) || 0}
              readOnly
              className="w-20 rounded-md border border-stroke bg-transparent px-2 py-1 text-sm text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary dark:disabled:bg-black"
            />
            <span className="text-gray-500 text-sm">{dish?.unit}</span>
          </div>
        </td>

        <td className="relative overflow-visible px-2 py-2 text-center">
          <OutSideMultipleSelectDropdown
            name=""
            options={maharajOptions}
            value={dish?.maharaj || []}
            onChange={(selected: string[]) => {
              setAllDishes((prev) =>
                prev.map((d) =>
                  d.dishId === dish.dishId ? {...d, maharaj: selected} : d,
                ),
              );
            }}
          />
        </td>
      </tr>
    </>
  );
};

export default NewDishRow;
