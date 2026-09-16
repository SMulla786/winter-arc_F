import {ChevronDown} from 'lucide-react';
import {FaCircle} from 'react-icons/fa';
import {MdMenuBook} from 'react-icons/md';
import {Dish, ExtraDish} from '../types';

interface SelectedDishItem {
  dishId: string;
  dishName: string;
  groupName?: string;
  subGroupName?: string;
  category?: string;
  cost: number;
  isExtra: boolean;
  index: number;
  freeSelectionCount: number;
  // ... other fields if any
}

export const PremiumQuickSummary: React.FC<any> = ({
  selectedDishes,
  dishes, // probably Dish[]
  singlePackage,
  extraDishes, // ExtraDish[]
  showSummary,
  onToggle,
}) => {
  // Optional: log to debug
  // console.log('Selected Dishes in Summary:', JSON.stringify(selectedDishes, null, 2));

  return (
    <>
      <button
        onClick={onToggle}
        className="premium-shadow from-gray-900 group w-full rounded-lg bg-gradient-to-r to-black p-6 text-left transition-all hover:scale-[1.02] hover:shadow-xl"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-gold/20 rounded-lg p-3 backdrop-blur-sm">
              <MdMenuBook className="h-6 w-6 text-gray" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-white">Selected Menu</p>
              <p className="text-sm text-gray">{selectedDishes.length} items</p>
            </div>
          </div>
          <div className="bg-gold/20 rounded-full p-2 backdrop-blur-sm transition-transform group-hover:scale-110">
            <ChevronDown
              className={`text-gold h-5 w-5 transition-transform ${showSummary ? 'rotate-180' : ''}`}
            />
          </div>
        </div>
      </button>

      {showSummary && (
        <div className="premium-shadow rounded-lg bg-black p-6">
          <h3 className="font-elegant mb-4 text-xl font-semibold text-white">
            Selected Menu
          </h3>
          <div className="grid max-h-60 grid-cols-1 gap-2 space-y-2 overflow-y-auto md:grid-cols-4">
            {(selectedDishes as SelectedDishItem[]).map((item) => {
              const name = item.dishName;

              // Determine veg/non-veg
              // Strategy: try to find in original lists first → fallback to assumption or add veg field later
              let isVeg = true; // safe default (most Indian veg dishes)

              // Try to match by name in dishes
              const foundDish = dishes.find((dish: Dish) => dish.name === name);
              if (foundDish) {
                isVeg = foundDish.vegNonveg === 'VEG';
              } else {
                // Try extraDishes
                const foundExtra = extraDishes.find(
                  (ed: ExtraDish) => ed.name === name,
                );
                if (foundExtra) {
                  isVeg = foundExtra.vegNonveg === 'VEG';
                }
                // If still not found → could check singlePackage.packageDishes if needed
                // or leave as veg (common in such menus)
              }

              return (
                <div
                  key={item.dishId} // much better than using name
                  className="from-gray-50 to-gray-100 border-gold/10 flex items-center gap-4 rounded-lg border bg-gradient-to-r px-4 py-3"
                >
                  <FaCircle
                    className={`text-xs ${isVeg ? 'text-emerald-500' : 'text-rose-500'}`}
                  />
                  <span className="flex-1 font-medium text-white">{name}</span>

                  {item.isExtra && item.cost > 0 && (
                    <span className="gold-gradient rounded-full px-3 py-1 text-xs font-bold text-black">
                      +₹{item.cost}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
};
