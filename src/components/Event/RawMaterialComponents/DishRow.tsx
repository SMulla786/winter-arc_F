// /*eslint-disable*/
// import {useSubEventContext} from '@/context/SubEventContext';
// import React, {useEffect, useMemo, useRef, useState} from 'react';
// import DropdownOutside from './../../Forms/SearchDropDown/DropdownOutside';
// import {useWatch, useFormContext} from 'react-hook-form';
// import {usePredictRawMaterials} from '@/lib/react-query/queriesAndMutations/cateror/dish';
// import toast from 'react-hot-toast';
// import OutSideMultipleSelectDropdown from './OutSideMultipleSelectDropdown';

// export type PortionPeople = {
//   portionSize: number;
//   people: number;
// };

// export type PortionAndPeopleState = Record<string, PortionPeople>;

// interface DishRowProps {
//   index: number;
//   field: any;
//   register: any;
//   getValues: any;
//   DishCategories: any;
//   CaterorDish: any;
//   maharajId?: string;
//   maharajOptions: {label: string; value: string}[];
//   expectedPeople: number;
//   portionAndPeople: PortionAndPeopleState;
//   setPortionAndPeople: React.Dispatch<
//     React.SetStateAction<PortionAndPeopleState>
//   >;
//   updatedDish: any;
//   setUpdatedDish: React.Dispatch<React.SetStateAction<any>>;
// }

// const DishRow: React.FC<DishRowProps> = ({
//   index,
//   field,
//   register,
//   CaterorDish,
//   maharajOptions,
//   maharajId,
//   portionAndPeople,
//   setPortionAndPeople,
//   updatedDish,
//   setUpdatedDish,
// }) => {
//   const {onDishClick, selectedDishDetails, dishUpdates, setDishUpdates} =
//     useSubEventContext();
//   const {setValue} = useFormContext();
//   const [popupKg, setPopupKg] = useState<number>(selectedDishDetails?.kg || 0);
//   const people = portionAndPeople[field?.dishId]?.people || 0;
//   const portion = portionAndPeople[field?.dishId]?.portionSize || 0;

//   const productionQty = useMemo(() => {
//     const portion = portionAndPeople[field?.dishId]?.portionSize;
//     const people = portionAndPeople[field?.dishId]?.people;

//     return portion && people ? portion * people : 0;
//   }, [portionAndPeople, field?.dishId]);

//   const {mutateAsync: predictRawMaterialByDish, isPending: isPredicting} =
//     usePredictRawMaterials();
//   const userChangedRef = useRef(false);

//   const handlePredictDish = async () => {
//     if (!field?.dishId || isNaN(popupKg)) return;

//     try {
//       const response = await predictRawMaterialByDish({
//         dishId: field.dishId,
//         people: people,
//         kg: productionQty,
//       });

//       const newDish = response;

//       setUpdatedDish((prev) => {
//         const current = prev || [];
//         const exists = current.some((d) => d.dishId === newDish.dishId);

//         if (exists) {
//           return current.map((dish) =>
//             dish.dishId === newDish.dishId
//               ? {...dish, rawMaterials: newDish.rawMaterials}
//               : dish,
//           );
//         } else {
//           return [...current, newDish];
//         }
//       });
//     } catch (error) {
//       console.error(error);
//       toast.error('Prediction failed. Please try again.');
//     }
//   };

//   const isFirstRender = useRef(true);

//   useEffect(() => {
//     if (!userChangedRef.current) return; // 🚫 skip page load
//     if (!field?.dishId || !portion || !people) return;

//     const timer = setTimeout(() => {
//       handlePredictDish();
//     }, 800);

//     return () => clearTimeout(timer);
//   }, [portion, people]);

//   const sortedDishes = [...(CaterorDish?.data.dishes || [])].sort((a, b) =>
//     a.name.localeCompare(b.name, 'en', {sensitivity: 'base'}),
//   );

//   const selectedDish = sortedDishes.find(
//     (item: {id: string}) => item.id === field?.dishId,
//   );

//   const isMissingRawMaterial =
//     selectedDish?.caterorDishRawMaterialQuantities?.length === 0;

//   const {onChange: onKgChange, ...kgRegisterRest} = register(
//     `dishes.${index}.kg`,
//   );

//   return (
//     <>
//       {/* Dish */}
//       <td className="px-4 py-2 text-center">
//         <input
//           type="text"
//           value={selectedDish?.name || ''}
//           className={`w-full cursor-pointer border-none bg-transparent text-center text-black dark:text-white ${
//             isMissingRawMaterial ? 'text-red-500 dark:text-red-500' : ''
//           }`}
//           onClick={() => onDishClick(field?.dishId)}
//           readOnly
//         />
//       </td>

//       {/* Portion Size */}
//       <td className="px-4 py-2 text-center">
//         <div className="flex items-center justify-center space-x-2">
//           <input
//             type="number"
//             value={portion}
//             onChange={(e) => {
//               userChangedRef.current = true;
//               setPortionAndPeople({
//                 ...portionAndPeople,
//                 [field?.dishId]: {
//                   ...portionAndPeople[field?.dishId],
//                   portionSize: parseFloat(e.target.value),
//                 },
//               });
//             }}
//             className="w-24 rounded-md border border-stroke bg-transparent px-3 py-1 text-center text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
//           />
//           <span className="text-gray-500 min-w-[40px] text-left text-sm">
//             {selectedDish?.unit}
//           </span>
//         </div>
//       </td>

//       {/* No Of People */}
//       <td className="px-4 py-2 text-center">
//         <div className="flex items-center justify-center space-x-2">
//           <input
//             type="number"
//             value={people}
//             onChange={(e) => {
//               userChangedRef.current = true;
//               setPortionAndPeople({
//                 ...portionAndPeople,
//                 [field?.dishId]: {
//                   ...portionAndPeople[field?.dishId],
//                   people: parseFloat(e.target.value),
//                 },
//               });
//             }}
//             className="w-24 rounded-md border border-stroke bg-transparent px-3 py-1 text-center text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
//           />
//           <span className="text-gray-500 min-w-[60px] text-left text-sm">
//             people
//           </span>
//         </div>
//       </td>

//       {/* Production Qty */}
//       <td className="px-4 py-2 text-center">
//         <div className="flex items-center justify-center space-x-2">
//           <input
//             type="number"
//             value={productionQty.toFixed(3) || 0}
//             className="w-24 rounded-md border border-stroke bg-transparent px-3 py-1 text-center text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
//             readOnly
//           />
//           <span className="text-gray-500 min-w-[40px] text-left text-sm">
//             {selectedDish?.unit}
//           </span>
//         </div>
//       </td>

//       {/* Incharge */}
//       <td className="relative overflow-visible px-2 py-2 text-center">
//         <div className="">
//           <OutSideMultipleSelectDropdown
//             name={''}
//             options={maharajOptions}
//             value={portionAndPeople[field.dishId]?.maharaj || []}
//             onChange={(selected: string[]) => {
//               setPortionAndPeople((prev) => ({
//                 ...prev,
//                 [field.dishId]: {
//                   ...prev[field.dishId],
//                   maharaj: selected,
//                 },
//               }));
//             }}
//             // className="w-48"
//           />
//         </div>
//       </td>
//     </>
//   );
// };

// export default DishRow;

/*eslint-disable*/
import {useSubEventContext} from '@/context/SubEventContext';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import DropdownOutside from './../../Forms/SearchDropDown/DropdownOutside';
import {useWatch, useFormContext} from 'react-hook-form';
import {usePredictRawMaterials} from '@/lib/react-query/queriesAndMutations/cateror/dish';
import toast from 'react-hot-toast';
import OutSideMultipleSelectDropdown from './OutSideMultipleSelectDropdown';

export type PortionPeople = {
  portionSize: number;
  people: number;
};

export type PortionAndPeopleState = Record<string, PortionPeople>;

interface DishRowProps {
  index: number;
  field: any;
  register: any;
  getValues: any;
  DishCategories: any;
  CaterorDish: any;
  maharajId?: string;
  maharajOptions: {label: string; value: string}[];
  expectedPeople: number;
  portionAndPeople: PortionAndPeopleState;
  setPortionAndPeople: React.Dispatch<
    React.SetStateAction<PortionAndPeopleState>
  >;
  updatedDish: any;
  setUpdatedDish: React.Dispatch<React.SetStateAction<any>>;
}

const DishRow: React.FC<DishRowProps> = ({
  index,
  field,
  register,
  CaterorDish,
  maharajOptions,
  maharajId,
  portionAndPeople,
  setPortionAndPeople,
  setUpdatedDish,
}) => {
  const {onDishClick, selectedDishDetails, dishUpdates, setDishUpdates} =
    useSubEventContext();
  const {setValue} = useFormContext();
  const [popupKg, setPopupKg] = useState<number>(selectedDishDetails?.kg || 0);
  const people = portionAndPeople[field?.dishId]?.people || 0;
  const portion = portionAndPeople[field?.dishId]?.portionSize || 0;
  // const productionQty =
  //   portionAndPeople[field?.dishId]?.portionSize *
  //   portionAndPeople[field?.dishId]?.people;
  const productionQty = useMemo(() => {
    const portion = portionAndPeople[field?.dishId]?.portionSize;
    const people = portionAndPeople[field?.dishId]?.people;

    return portion && people ? portion * people : 0;
  }, [portionAndPeople, field?.dishId]);

  const {mutateAsync: predictRawMaterialByDish, isPending: isPredicting} =
    usePredictRawMaterials();
  const userChangedRef = useRef(false);

  const handlePredictDish = async () => {
    if (!field?.dishId || isNaN(popupKg)) return;

    try {
      const response = await predictRawMaterialByDish({
        dishId: field.dishId,
        people: people,
        kg: productionQty,
      });

      const newDish = response;

      setUpdatedDish((prev) => {
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

  const isFirstRender = useRef(true);

  useEffect(() => {
    if (!userChangedRef.current) return; // 🚫 skip page load
    if (!field?.dishId || !portion || !people) return;

    const timer = setTimeout(() => {
      handlePredictDish();
    }, 800);

    return () => clearTimeout(timer);
  }, [portion, people]);

  const sortedDishes = [...(CaterorDish?.data.dishes || [])].sort((a, b) =>
    a.name.localeCompare(b.name, 'en', {sensitivity: 'base'}),
  );

  const selectedDish = sortedDishes.find(
    (item: {id: string}) => item.id === field?.dishId,
  );

  const isMissingRawMaterial =
    selectedDish?.caterorDishRawMaterialQuantities?.length === 0;

  const {onChange: onKgChange, ...kgRegisterRest} = register(
    `dishes.${index}.kg`,
  );

  return (
    <>
      <tr className="align-middle">
        {/* Dish */}
        <td className="px-2 py-2 text-center">
          <input
            type="text"
            value={selectedDish?.name || ''}
            className={`w-full cursor-pointer border-none bg-transparent text-center text-black dark:text-white ${
              isMissingRawMaterial ? 'text-red-500 dark:text-red-500' : ''
            }`}
            // onClick={() => onDishClick(getValues(`dishes.${index}.dishId`))}
            onClick={() => onDishClick(field?.dishId)}
            readOnly
          />
        </td>

        <td className="px-2 py-2 text-center">
          <div className="flex items-center justify-center space-x-1">
            <input
              type="number"
              value={portion}
              onChange={(e) => {
                userChangedRef.current = true; //
                setPortionAndPeople({
                  ...portionAndPeople,
                  [field?.dishId]: {
                    ...portionAndPeople[field?.dishId],
                    portionSize: parseFloat(e.target.value),
                  },
                });
              }}
              className="w-20 rounded-md border border-stroke bg-transparent px-2 py-1 text-sm text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary dark:disabled:bg-black"
            />
            <span className="text-gray-500 text-sm">{selectedDish?.unit}</span>
          </div>
        </td>

        <td className="px-2 py-2 text-center">
          <div className="flex items-center justify-center space-x-1">
            <input
              type="number"
              value={people}
              onChange={(e) => {
                userChangedRef.current = true; //
                setPortionAndPeople({
                  ...portionAndPeople,
                  [field?.dishId]: {
                    ...portionAndPeople[field?.dishId],
                    people: parseFloat(e.target.value),
                  },
                });
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
              className="w-20 rounded-md border border-stroke bg-transparent px-2 py-1 text-sm text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary dark:disabled:bg-black"
            />
            <span className="text-gray-500 text-sm">{selectedDish?.unit}</span>
          </div>
        </td>

        <td className="relative overflow-visible px-2 py-2 text-center">
          <OutSideMultipleSelectDropdown
            name={''}
            options={maharajOptions}
            value={portionAndPeople[field.dishId]?.maharaj || []}
            onChange={(selected: string[]) => {
              setPortionAndPeople((prev) => ({
                ...prev,
                [field.dishId]: {
                  ...prev[field.dishId],
                  maharaj: selected,
                },
              }));
            }}
          />
        </td>
      </tr>
    </>
  );
};

export default DishRow;
