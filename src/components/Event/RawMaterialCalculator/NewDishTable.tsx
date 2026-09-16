/*eslint-disable*/
import React from 'react';
import NewDishRow from './NewDishRow';
import FoodVendorRow from '../RawMaterialComponents/FoodVendorRow';
import {useGetFoodVendorAssignments} from '@/lib/react-query/queriesAndMutations/cateror/event';
import {Route} from '@/routes/_app/_event/events.$id';
import FoodLaberRow from '../RawMaterialComponents/AllVendors/FoodLaberRow';
import NewLabourRow from './NewLabourRow';
export type RawMaterialType = {
  rawId: string;
  rawName: string;
  unit: string;
  quantity: number;
  process: string;
};

export type DishType = {
  dishId: string;
  name: string;
  portionSize: number;
  dishCat: string;
  dishCatId: string;
  people: number;
  price: number;
  unit: string;
  foodVendor: string;
  maharaj: string[];
  rawMaterialCalculation: boolean;
  rawMaterials: RawMaterialType[];
};

type GroupedDishType = {
  categoryId: string;
  categoryName: string;
  dishes: DishType[];
};

type GroupedDishes = Record<string, GroupedDishType>;

export type Props = {
  subEventId: string;
  allDishes: DishType[];
  setAllDishes: React.Dispatch<React.SetStateAction<DishType[]>>;
  maharajOptions: {label: string; value: string}[];
  setSelectedDishId: React.Dispatch<React.SetStateAction<string | null>>;
  labourDish: any;
  setLabourDish: React.Dispatch<React.SetStateAction<any>>;
  onLabourChange?: () => void;
  onDishSaved?: (dishId: string) => void;
};
const NewDishTable: React.FC<Props> = ({
  allDishes,
  setAllDishes,
  maharajOptions,
  setSelectedDishId,
  subEventId,
  labourDish,
  setLabourDish,
  onLabourChange,
  onDishSaved,
}) => {
  const {id: EventId} = Route.useParams<{id: string}>();
  const {data} = useGetFoodVendorAssignments(EventId);
  const FoodVendorData = data?.data?.subEvents || [];
  const dishesArray = Object.values(allDishes);

  const groupedDishes = dishesArray.reduce(
    (acc, dish) => {
      if (dish?.rawMaterialCalculation !== true) return acc;
      const categoryId = dish.dishCatId || 'uncategorized';
      const categoryName = dish.dishCat || 'Uncategorized';

      if (!acc[categoryId]) {
        acc[categoryId] = {
          categoryId,
          categoryName,
          dishes: [],
        };
      }

      acc[categoryId].dishes.push(dish);
      return acc;
    },
    {} as Record<string, any>,
  );

  const currentSubEventVendorData = FoodVendorData.find(
    (se: any) => se.subEventId === subEventId,
  );

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

  // const groupedFoodLabourDishes = labourDish?.reduce((acc: any, dish: any) => {
  //   const categoryName = dish?.dishCategory || 'Uncategorized';
  //   if (!acc[categoryName]) {
  //     acc[categoryName] = {
  //       dishes: [],
  //     };
  //   }
  //   acc[categoryName].dishes.push(dish);
  //   return acc;
  // }, {});

  const groupedDishesLabour = dishesArray.reduce(
    (acc, dish) => {
      if (dish?.rawMaterialCalculation !== false) return acc;
      const categoryId = dish.dishCatId || 'uncategorized';
      const categoryName = dish.dishCat || 'Uncategorized';

      if (!acc[categoryId]) {
        acc[categoryId] = {
          categoryId,
          categoryName,
          dishes: [],
        };
      }

      acc[categoryId].dishes.push(dish);
      return acc;
    },
    {} as Record<string, any>,
  );

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px] table-auto">
          <thead className="overflow-x-auto">
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

              {group.dishes
                .filter(
                  (dish: DishType) => dish?.rawMaterialCalculation === true,
                )
                .map((dish: DishType) => (
                  <NewDishRow
                    key={dish.dishId}
                    dish={dish}
                    setAllDishes={setAllDishes}
                    maharajOptions={maharajOptions}
                    setSelectedDishId={setSelectedDishId}
                    onDishSaved={onDishSaved}
                  />
                ))}
            </React.Fragment>
          ))}
        </table>
      </div>
      {groupedDishesLabour && Object.keys(groupedDishesLabour).length > 0 && (
        <div className="mt-6">
          <div className="mb-2 rounded-t-lg bg-gradient-to-r from-blue-100 to-blue-50 py-3 text-center font-semibold text-blue-900 dark:from-blue-900/50 dark:to-blue-800/30 dark:text-blue-100">
            Food Labour Assigned Dishes
          </div>

          {/* Horizontal scroll container */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] table-auto">
              <thead>
                <tr className="bg-blue-100 text-center dark:bg-slate-700">
                  {[
                    'Dish Name',
                    'Portion Size',
                    'No Of People',
                    'Production Qty',
                    'Food Labour',
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
                {Object.entries(groupedDishesLabour).map(
                  ([categoryName, group]: any) => (
                    <React.Fragment key={categoryName}>
                      <tr>
                        <td
                          colSpan={5}
                          className="mt-1 bg-neutral-50 px-4 py-2 text-center font-semibold text-black dark:bg-slate-800 dark:text-white"
                        >
                          {group.categoryName}
                        </td>
                      </tr>

                      {group.dishes.map((vendorDish: any) => {
                        return (
                          <NewLabourRow
                            key={vendorDish.dishId}
                            dish={vendorDish}
                            setAllDishes={setAllDishes}
                            setSelectedDishId={setSelectedDishId}
                            onLabourChange={onLabourChange}
                            onDishSaved={onDishSaved}
                          />
                        );
                      })}
                    </React.Fragment>
                  ),
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {groupedFoodVendorDishes &&
        Object.keys(groupedFoodVendorDishes).length > 0 && (
          <div className="mt-6">
            <div className="mb-2 rounded-t-lg bg-gradient-to-r from-green-100 to-green-50 py-3 text-center font-semibold text-green-900 dark:from-green-900/50 dark:to-green-800/30 dark:text-green-100">
              Food Vendor Assigned Dishes
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] table-auto">
                <thead>
                  <tr className="bg-blue-100 text-center dark:bg-slate-700">
                    {[
                      'Dish Name',
                      'Unit',
                      'Order Qty',
                      'Prepartion Qty',
                      'Food Vendor',
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
                        <tr>
                          <td
                            colSpan={6}
                            className="mt-1 bg-neutral-50 px-4 py-2 text-center font-semibold text-black dark:bg-slate-800 dark:text-white"
                          >
                            {categoryName}
                          </td>
                        </tr>

                        {group.dishes.map((vendorDish: any, idx: number) => {
                          return (
                            <FoodVendorRow
                              key={`vendor-${vendorDish.dishId}`}
                              dish={vendorDish}
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
          </div>
        )}
    </div>
  );
};

export default NewDishTable;
