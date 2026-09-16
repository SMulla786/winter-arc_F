// /* eslint-disable */
// import React from 'react';
// import DishRow from './DishRow';
// import {useGetFoodVendorAssignments} from '@/lib/react-query/queriesAndMutations/cateror/event';
// import {Route} from '@/routes/_app/_event/events.$id';
// import FoodVendorRow from './FoodVendorRow';
// import {useSubEventContext} from '@/context/SubEventContext';
// import FoodLaberRow from './AllVendors/FoodLaberRow';
// import {TableVirtuoso} from 'react-virtuoso';

// export type PortionPeople = {
//   portionSize: number;
//   people: number;
// };

// export type PortionAndPeopleState = Record<string, PortionPeople>;

// interface DishTableProps {
//   subEventDishes: any[];
//   subEventId: string;
//   register: any;
//   getValues: any;
//   DishCategories: any;
//   CaterorDish: any;
//   maharajOptions: {label: string; value: string}[];
//   foodvendor: any;
//   expectedPeople: number;
//   portionAndPeople: PortionAndPeopleState;
//   setPortionAndPeople: React.Dispatch<
//     React.SetStateAction<PortionAndPeopleState>
//   >;
//   updatedDish: any;
//   setUpdatedDish: React.Dispatch<React.SetStateAction<any>>;
//   labourDish: any;
//   setLabourDish: React.Dispatch<React.SetStateAction<any>>;
// }

// const DishTable: React.FC<DishTableProps> = ({
//   subEventDishes,
//   subEventId,
//   register,
//   getValues,
//   DishCategories,
//   CaterorDish,
//   maharajOptions,
//   foodvendor,
//   expectedPeople,
//   portionAndPeople,
//   setPortionAndPeople,
//   setUpdatedDish,
//   updatedDish,
//   labourDish,
//   setLabourDish,
// }) => {
//   const {id: EventId} = Route.useParams<{id: string}>();
//   const {data} = useGetFoodVendorAssignments(EventId);
//   const FoodVendorData = data?.data?.subEvents || [];
//   const {dishUpdates} = useSubEventContext();

//   const getMaharajName = (maharajId: string) => {
//     const maharaj = maharajOptions.find((option) => option.value === maharajId);
//     return maharaj ? maharaj.label : 'Unknown';
//   };

//   const currentSubEventVendorData = FoodVendorData.find(
//     (se: any) => se.subEventId === subEventId,
//   );

//   const groupedDishes = subEventDishes.reduce((acc: any, dish: any) => {
//     const categoryId = dish?.dish?.category?.id || 'uncategorized';
//     const categoryName = dish?.dish?.category?.name || 'Uncategorized';
//     if (!acc[categoryId]) {
//       acc[categoryId] = {
//         categoryId,
//         categoryName,
//         dishes: [],
//       };
//     }

//     acc[categoryId].dishes.push(dish);
//     return acc;
//   }, {});

//   const groupedFoodVendorDishes = currentSubEventVendorData?.dishes?.reduce(
//     (acc: any, dish: any) => {
//       if (dish?.rawMaterialCalculation !== true) return acc;
//       const categoryName = dish?.dishCategory || 'Uncategorized';
//       if (!acc[categoryName]) {
//         acc[categoryName] = {
//           dishes: [],
//         };
//       }
//       acc[categoryName].dishes.push(dish);
//       return acc;
//     },
//     {},
//   );

//   const groupedFoodLabourDishes = labourDish?.reduce((acc: any, dish: any) => {
//     const categoryName = dish?.dishCategory || 'Uncategorized';
//     if (!acc[categoryName]) {
//       acc[categoryName] = {
//         dishes: [],
//       };
//     }
//     acc[categoryName].dishes.push(dish);
//     return acc;
//   }, {});

//   const virtualDishRows = Object.values(groupedDishes).flatMap((group: any) => [
//     {
//       type: 'category',
//       categoryId: group.categoryId,
//       categoryName: group.categoryName,
//     },
//     ...group.dishes.map((dish: any) => ({
//       type: 'dish',
//       categoryId: group.categoryId,
//       categoryName: group.categoryName,
//       dish,
//     })),
//   ]);

//   // Define column widths for the table
//   const columnWidths = [
//     'w-[200px]',
//     'w-[150px]',
//     'w-[150px]',
//     'w-[150px]',
//     'w-[200px]',
//   ];

//   return (
//     <div className="min-h-[30vh] max-w-full">
//       {/* Main Dishes Table with TableVirtuoso */}
//       <div className="overflow-hidden">
//         <TableVirtuoso
//           style={{height: 500}}
//           data={virtualDishRows}
//           fixedHeaderContent={() => (
//             <tr className="bg-blue-100 text-center align-middle dark:bg-meta-4">
//               {[
//                 'Dish',
//                 'Portion Size',
//                 'No Of People',
//                 'Production Qty',
//                 'Incharge',
//               ].map((column, index) => (
//                 <th
//                   key={index}
//                   className={`px-4 py-4 font-medium text-black dark:text-white ${columnWidths[index]}`}
//                 >
//                   {column}
//                 </th>
//               ))}
//             </tr>
//           )}
//           components={{
//             Table: ({style, ...props}) => (
//               <table
//                 {...props}
//                 className="w-full border-collapse"
//                 style={{...style, tableLayout: 'fixed'}}
//               />
//             ),
//             TableRow: ({item, ...props}) => {
//               if (item.type === 'category') {
//                 return (
//                   <tr {...props} className="border-b-0">
//                     <td
//                       colSpan={5}
//                       className="bg-neutral-50 px-4 py-2 text-center font-semibold text-black dark:bg-slate-800 dark:text-white"
//                     >
//                       {item.categoryName}
//                     </td>
//                   </tr>
//                 );
//               }

//               return <tr {...props} className="" />;
//             },
//           }}
//           itemContent={(index, row: any) => {
//             if (row.type === 'category') {
//               return (
//                 <td
//                   colSpan={5}
//                   className="bg-neutral-50 px-4 py-2 text-center font-semibold text-black dark:bg-slate-800 dark:text-white"
//                 >
//                   {row.categoryName}
//                 </td>
//               );
//             }

//             const field = row.dish;

//             return (
//               <DishRow
//                 index={index}
//                 field={{
//                   ...field,
//                   maharajName: getMaharajName(field.maharajId),
//                 }}
//                 register={register}
//                 getValues={getValues}
//                 DishCategories={DishCategories}
//                 CaterorDish={CaterorDish}
//                 maharajId={field.maharajId}
//                 maharajOptions={maharajOptions}
//                 hasFoodVendor={!!field.foodVendorId}
//                 foodvendor={foodvendor}
//                 expectedPeople={expectedPeople}
//                 portionAndPeople={portionAndPeople}
//                 setPortionAndPeople={setPortionAndPeople}
//                 setUpdatedDish={setUpdatedDish}
//                 updatedDish={updatedDish}
//               />
//             );
//           }}
//         />
//       </div>

//       {/* Food Vendor Assigned Dishes */}
//       {groupedFoodVendorDishes &&
//         Object.keys(groupedFoodVendorDishes).length > 0 && (
//           <div className="mt-6">
//             <div className="mb-2 text-center font-semibold text-black dark:text-white">
//               Food Vendor Assigned Dishes
//             </div>

//             <div className="border-gray-200 dark:border-gray-700 overflow-hidden rounded-lg border">
//               <table className="w-full table-auto border-collapse">
//                 <thead>
//                   <tr className="bg-blue-100 text-center dark:bg-slate-700">
//                     {[
//                       'Dish Name',
//                       'Food Vendor',
//                       'Order Qty',
//                       'Prepartion Qty',
//                       'Unit',
//                     ].map((column, index) => (
//                       <th
//                         key={index}
//                         className="px-4 py-4 font-medium text-black dark:text-white"
//                         style={{width: index === 0 ? '200px' : '150px'}}
//                       >
//                         {column}
//                       </th>
//                     ))}
//                   </tr>
//                 </thead>

//                 <tbody>
//                   {Object.entries(groupedFoodVendorDishes).map(
//                     ([categoryName, group]: any) => (
//                       <React.Fragment key={categoryName}>
//                         {/* 🔹 Category Row */}
//                         <tr>
//                           <td
//                             colSpan={5}
//                             className="mt-1 bg-neutral-50 px-4 py-2 text-center font-semibold text-black dark:bg-slate-800 dark:text-white"
//                           >
//                             {categoryName}
//                           </td>
//                         </tr>

//                         {/* 🔹 Dishes under category */}
//                         {group.dishes.map((vendorDish: any, idx: number) => {
//                           const updatedKg =
//                             dishUpdates[vendorDish.dishId]?.kg ??
//                             vendorDish.expected ??
//                             0;

//                           return (
//                             <FoodVendorRow
//                               key={`vendor-${vendorDish.dishId}`}
//                               dish={vendorDish}
//                               kg={updatedKg}
//                               index={idx}
//                             />
//                           );
//                         })}
//                       </React.Fragment>
//                     ),
//                   )}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         )}

//       {/* Food Labour Assigned Dishes */}
//       {groupedFoodLabourDishes &&
//         Object.keys(groupedFoodLabourDishes).length > 0 && (
//           <div className="mt-6">
//             <div className="mb-2 text-center font-semibold text-black dark:text-white">
//               Food Labour Assigned Dishes
//             </div>

//             <div className="border-gray-200 dark:border-gray-700 overflow-hidden rounded-lg border">
//               <table className="w-full table-auto border-collapse">
//                 <thead>
//                   <tr className="bg-blue-100 text-center dark:bg-slate-700">
//                     {[
//                       'Dish Name',
//                       'Food Labour',
//                       'Portion Size',
//                       'No Of People',
//                       'Production Qty',
//                     ].map((column, index) => (
//                       <th
//                         key={index}
//                         className="px-4 py-4 font-medium text-black dark:text-white"
//                         style={{width: '150px'}}
//                       >
//                         {column}
//                       </th>
//                     ))}
//                   </tr>
//                 </thead>

//                 <tbody>
//                   {Object.entries(groupedFoodLabourDishes).map(
//                     ([categoryName, group]: any) => (
//                       <React.Fragment key={categoryName}>
//                         {/* 🔹 Category Row */}
//                         <tr>
//                           <td
//                             colSpan={5}
//                             className="mt-1 bg-neutral-50 px-4 py-2 text-center font-semibold text-black dark:bg-slate-800 dark:text-white"
//                           >
//                             {categoryName}
//                           </td>
//                         </tr>

//                         {/* 🔹 Dishes under category */}
//                         {group.dishes.map((vendorDish: any, idx: number) => {
//                           const updatedKg =
//                             dishUpdates[vendorDish.dishId]?.kg ??
//                             vendorDish.expected ??
//                             0;

//                           return (
//                             <FoodLaberRow
//                               key={`vendor-${vendorDish.dishId}`}
//                               dish={vendorDish}
//                               portionAndPeople={portionAndPeople}
//                               setPortionAndPeople={setPortionAndPeople}
//                               index={idx}
//                               maharajOptions={maharajOptions}
//                             />
//                           );
//                         })}
//                       </React.Fragment>
//                     ),
//                   )}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         )}
//     </div>
//   );
// };

// export default DishTable;

/* eslint-disable */
import React from 'react';
import DishRow from './DishRow';
import {useGetFoodVendorAssignments} from '@/lib/react-query/queriesAndMutations/cateror/event';
import {Route} from '@/routes/_app/_event/events.$id';
import FoodVendorRow from './FoodVendorRow';
import {useSubEventContext} from '@/context/SubEventContext';
import FoodLaberRow from './AllVendors/FoodLaberRow';

export type PortionPeople = {
  portionSize: number;
  people: number;
};

export type PortionAndPeopleState = Record<string, PortionPeople>;

interface DishTableProps {
  subEventDishes: any[];
  subEventId: string; // Add this
  register: any;
  getValues: any;
  DishCategories: any;
  CaterorDish: any;
  maharajOptions: {label: string; value: string}[];
  foodvendor: any;
  expectedPeople: number;
  portionAndPeople: PortionAndPeopleState;
  setPortionAndPeople: React.Dispatch<
    React.SetStateAction<PortionAndPeopleState>
  >;
  updatedDish: any;
  setUpdatedDish: React.Dispatch<React.SetStateAction<any>>;
  labourDish: any;
  setLabourDish: React.Dispatch<React.SetStateAction<any>>;
}

const DishTable: React.FC<DishTableProps> = ({
  subEventDishes,
  subEventId,
  register,
  getValues,
  DishCategories,
  CaterorDish,
  maharajOptions,
  foodvendor,
  expectedPeople,
  portionAndPeople,
  setPortionAndPeople,
  setUpdatedDish,
  updatedDish,
  labourDish,
  setLabourDish,
}) => {
  const {id: EventId} = Route.useParams<{id: string}>();
  const {data} = useGetFoodVendorAssignments(EventId);
  const FoodVendorData = data?.data?.subEvents || [];
  const {dishUpdates} = useSubEventContext();
  console.log('sub event dishess', subEventDishes);

  const getMaharajName = (maharajId: string) => {
    const maharaj = maharajOptions.find((option) => option.value === maharajId);
    return maharaj ? maharaj.label : 'Unknown';
  };

  const currentSubEventVendorData = FoodVendorData.find(
    (se: any) => se.subEventId === subEventId,
  );

  const groupedDishes = subEventDishes.reduce((acc: any, dish: any) => {
    const categoryId = dish?.dish?.category?.id || 'uncategorized';
    const categoryName = dish?.dish?.category?.name || 'Uncategorized';
    if (!acc[categoryId]) {
      acc[categoryId] = {
        categoryId,
        categoryName,
        dishes: [],
      };
    }

    acc[categoryId].dishes.push(dish);
    return acc;
  }, {});

  const groupedFoodVendorDishes = currentSubEventVendorData?.dishes?.reduce(
    (acc: any, dish: any) => {
      if (dish?.rawMaterialCalculation !== true) return acc;
      const categoryName = dish?.dishCategory || 'Uncategorized';
      if (!acc[categoryName]) {
        acc[categoryName] = {
          dishes: [],
        };
      }
      acc[categoryName].dishes.push(dish);
      return acc;
    },
    {},
  );

  const groupedFoodLabourDishes = labourDish?.reduce((acc: any, dish: any) => {
    const categoryName = dish?.dishCategory || 'Uncategorized';
    if (!acc[categoryName]) {
      acc[categoryName] = {
        dishes: [],
      };
    }
    acc[categoryName].dishes.push(dish);
    return acc;
  }, {});

  return (
    <div className="min-h-[30vh] max-w-full overflow-visible">
      <table className="w-full table-auto">
        <thead>
          <tr className="bg-blue-100 text-center align-middle dark:bg-meta-4">
            {[
              'Dish',
              'Portion Size',
              'No Of People',
              'Production Qty',
              'Incharge',
            ].map((column, index) => (
              <th
                key={index}
                className="min-w-[120px] px-4 py-4 text-center font-medium text-black dark:text-white"
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>

        {Object.values(groupedDishes).map((group: any) => (
          <React.Fragment key={group.categoryId}>
            <tr>
              <td
                colSpan={6}
                className="mt-1 bg-neutral-50 px-4 py-2 text-center font-semibold text-black dark:bg-slate-800 dark:text-white"
              >
                {group.categoryName}
              </td>
            </tr>

            {group.dishes.map((field: any, index: number) => (
              <DishRow
                key={field.dishId || index}
                index={index}
                field={{
                  ...field,
                  maharajName: getMaharajName(field.maharajId),
                }}
                register={register}
                getValues={getValues}
                DishCategories={DishCategories}
                CaterorDish={CaterorDish}
                maharajId={field.maharajId}
                maharajOptions={maharajOptions}
                hasFoodVendor={!!field.foodVendorId}
                foodvendor={foodvendor}
                expectedPeople={expectedPeople}
                portionAndPeople={portionAndPeople}
                setPortionAndPeople={setPortionAndPeople}
                setUpdatedDish={setUpdatedDish}
                updatedDish={updatedDish}
              />
            ))}
          </React.Fragment>
        ))}
      </table>

      {groupedFoodVendorDishes &&
        Object.keys(groupedFoodVendorDishes).length > 0 && (
          <div className="mt-6">
            <div className="mb-2 text-center font-semibold text-black dark:text-white">
              Food Vendor Assigned Dishes
            </div>

            <table className="w-full table-auto">
              <thead>
                <tr className="bg-blue-100 text-center dark:bg-slate-700">
                  {[
                    'Dish Name',
                    'Food Vendor',
                    'Order Qty',
                    'Prepartion Qty',
                    'Unit',
                  ].map((column, index) => (
                    <th
                      key={index}
                      className="min-w-[120px] px-4 py-4 font-medium text-black dark:text-white"
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {Object.entries(groupedFoodVendorDishes).map(
                  ([categoryName, group]: any) => (
                    <React.Fragment key={categoryName}>
                      {/* 🔹 Category Row */}
                      <tr>
                        <td
                          colSpan={6}
                          className="mt-1 bg-neutral-50 px-4 py-2 text-center font-semibold text-black dark:bg-slate-800 dark:text-white"
                        >
                          {categoryName}
                        </td>
                      </tr>

                      {/* 🔹 Dishes under category */}
                      {group.dishes.map((vendorDish: any, idx: number) => {
                        const updatedKg =
                          dishUpdates[vendorDish.dishId]?.kg ??
                          vendorDish.expected ??
                          0;

                        return (
                          <FoodVendorRow
                            key={`vendor-${vendorDish.dishId}`}
                            dish={vendorDish}
                            kg={updatedKg}
                            index={idx}
                          />
                        );
                      })}
                    </React.Fragment>
                  ),
                )}
              </tbody>
            </table>
          </div>
        )}

      {groupedFoodLabourDishes &&
        Object.keys(groupedFoodLabourDishes).length > 0 && (
          <div className="mt-6">
            <div className="mb-2 text-center font-semibold text-black dark:text-white">
              Food Labour Assigned Dishes
            </div>

            <table className="w-full table-auto">
              <thead>
                <tr className="bg-blue-100 text-center dark:bg-slate-700">
                  {[
                    'Dish Name',
                    'Food Labour',
                    'Portion Size',
                    'No Of People',
                    'Production Qty',
                  ].map((column, index) => (
                    <th
                      key={index}
                      className="min-w-[120px] px-4 py-4 font-medium text-black dark:text-white"
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {Object.entries(groupedFoodLabourDishes).map(
                  ([categoryName, group]: any) => (
                    <React.Fragment key={categoryName}>
                      {/* 🔹 Category Row */}
                      <tr>
                        <td
                          colSpan={6}
                          className="mt-1 bg-neutral-50 px-4 py-2 text-center font-semibold text-black dark:bg-slate-800 dark:text-white"
                        >
                          {categoryName}
                        </td>
                      </tr>

                      {/* 🔹 Dishes under category */}
                      {group.dishes.map((vendorDish: any, idx: number) => {
                        return (
                          <FoodLaberRow
                            key={`vendor-${vendorDish.dishId}`}
                            dish={vendorDish}
                            portionAndPeople={portionAndPeople}
                            setPortionAndPeople={setPortionAndPeople}
                            index={idx}
                            maharajOptions={maharajOptions}
                          />
                        );
                      })}
                    </React.Fragment>
                  ),
                )}
              </tbody>
            </table>
          </div>
        )}
    </div>
  );
};

export default DishTable;
