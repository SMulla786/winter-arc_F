/*eslint-disable*/
import React from 'react';
import OutSideMultipleSelectDropdown from '../OutSideMultipleSelectDropdown';
import {useSubEventContext} from '@/context/SubEventContext';

export type PortionPeople = {
  portionSize: number;
  people: number;
};

export type PortionAndPeopleState = Record<string, PortionPeople>;
interface FoodVendorRowProps {
  dish: any;
  index: number;
  maharajOptions: {label: string; value: string}[];
  portionAndPeople: PortionAndPeopleState;
  setPortionAndPeople: React.Dispatch<
    React.SetStateAction<PortionAndPeopleState>
  >;
}

const FoodLaberRow: React.FC<FoodVendorRowProps> = ({
  dish,
  maharajOptions,
  portionAndPeople,
  setPortionAndPeople,
}) => {
  const {onDishClick} = useSubEventContext();
  const people = portionAndPeople[dish?.dishId]?.people || 0;
  const portion = portionAndPeople[dish?.dishId]?.portionSize || 0;
  const productionQty =
    portionAndPeople[dish?.dishId]?.portionSize *
    portionAndPeople[dish?.dishId]?.people;
  console.log('dishhhh ', dish);
  return (
    <tr className="border-gray-300 dark:border-gray-700 align-middle">
      <td className="px-4 py-2 text-center">
        <input
          type="text"
          className="w-full border-none bg-transparent text-center text-black dark:text-white"
          value={dish?.name || ''}
          onClick={() => onDishClick(dish?.dishId)}
        />
      </td>

      <td className="px-4 py-2 text-center">
        <input
          type="text"
          className="w-full border-none bg-transparent text-center text-black dark:text-white"
          disabled
          value={dish.foodVendor || ''}
        />
      </td>

      <td className="px-2 py-2 text-center">
        <div className="flex items-center justify-center space-x-1">
          <input
            type="number"
            value={portion}
            onChange={(e) => {
              setPortionAndPeople({
                ...portionAndPeople,
                [dish?.dishId]: {
                  ...portionAndPeople[dish?.dishId],
                  portionSize: parseFloat(e.target.value),
                },
              });
            }}
            className="w-20 rounded-md border border-stroke bg-transparent px-2 py-1 text-sm text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary dark:disabled:bg-black"
          />
          {/* <span className="text-gray-500 text-sm">{selectedDish?.unit}</span> */}
        </div>
      </td>

      <td className="px-2 py-2 text-center">
        <div className="flex items-center justify-center space-x-1">
          <input
            type="number"
            value={people}
            onChange={(e) => {
              setPortionAndPeople({
                ...portionAndPeople,
                [dish?.dishId]: {
                  ...portionAndPeople[dish?.dishId],
                  people: parseFloat(e.target.value),
                },
              });
            }}
            className="w-20 rounded-md border border-stroke bg-transparent px-2 py-1 text-sm text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary dark:disabled:bg-black"
          />
          <span className="text-gray-500 text-sm">people</span>
        </div>
      </td>
      <td className="px-4 py-2 text-center text-black dark:text-white">
        {productionQty || 0}
      </td>

      {/* <td className="relative overflow-visible px-2 py-2 text-center">
        <OutSideMultipleSelectDropdown
          name={''}
          options={maharajOptions}
          value={portionAndPeople[dish?.dishId]?.maharaj || []}
          onChange={(selected: string[]) => {
            console.log('selecteddd');
            setPortionAndPeople((prev) => ({
              ...prev,
              [dish?.dishId]: {
                ...prev[dish?.dishId],
                maharaj: selected,
              },
            }));
          }}
        />
      </td> */}
    </tr>
  );
};

export default FoodLaberRow;
