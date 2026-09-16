import {
  UtensilsCrossed,
  ChefHat,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import {Dish} from '../types';

interface PremiumCustomDishSelectionProps {
  groupedDishes: {
    VEG: Record<string, Dish[]>;
    NONVEG: Record<string, Dish[]>;
  };
  activeTab: 'VEG' | 'NONVEG';
  selectedDishes: {dishId: string; dishName: string}[]; // ← match hook type
  onDishToggle: (dish: Dish) => void;
  expandedCategories: string[];
  onToggleCategory: (category: string) => void;
}

export const PremiumCustomDishSelection: React.FC<
  PremiumCustomDishSelectionProps
> = ({
  groupedDishes,
  activeTab,
  selectedDishes,
  onDishToggle,
  expandedCategories,
  onToggleCategory,
}) => {
  return (
    <div className="premium-shadow overflow-hidden rounded-3xl bg-black">
      <div className="p-6">
        <div className="flex items-center space-x-3">
          <UtensilsCrossed className="h-6 w-6 text-white" />
          <div>
            <h2 className="font-elegant text-xl font-semibold text-white">
              Dish Selections
            </h2>
            <p className="text-sm text-white">
              Tap to curate your perfect menu
            </p>
          </div>
        </div>
      </div>

      <div className="max-h-[60vh] overflow-y-auto p-2">
        {Object.keys(groupedDishes[activeTab] || {})
          .sort()
          .map((cat, index) => (
            <div
              key={cat}
              className={`border-gray-200 last:border-b-0 ${
                index % 2 === 0
                  ? 'from-gray-900 bg-gradient-to-r to-black'
                  : 'from-gray-800 to-gray-900 bg-gradient-to-r'
              }`}
            >
              <div
                className="category-header flex cursor-pointer items-center justify-between transition-all hover:brightness-110"
                style={{
                  background:
                    'linear-gradient(135deg, #D4AF37 0%, #F5E3A9 50%, #B8941F 100%)',
                  padding: '15px',
                  borderRadius: '10px',
                  marginBottom: '12px',
                }}
                onClick={() => onToggleCategory(cat)}
              >
                <div className="flex items-center space-x-2">
                  <div className="rounded-xl p-1">
                    <ChefHat className="h-4 w-4 text-black" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-black">{cat}</h3>
                    <p className="text-xs text-black">
                      {groupedDishes[activeTab][cat].length} items
                    </p>
                  </div>
                </div>
                {expandedCategories.includes(cat) ? (
                  <ChevronDown className="h-5 w-5 text-black" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-black" />
                )}
              </div>

              {expandedCategories.includes(cat) && (
                <div className="grid grid-cols-1 gap-2 p-2">
                  {groupedDishes[activeTab][cat].map((dish: Dish) => (
                    <label
                      key={dish.id}
                      className="new-dish-item glass-effect flex cursor-pointer items-start space-x-2 transition-all hover:shadow-md"
                    >
                      <input
                        type="checkbox"
                        checked={selectedDishes.some(
                          (s) => s.dishId === dish.id,
                        )}
                        onChange={() => onDishToggle(dish)}
                        className="premium-checkbox"
                      />
                      <div className="min-w-0 flex-1 bg-black">
                        <div className="flex items-start justify-between">
                          <span className="text-sm text-white">
                            {dish.name}
                          </span>
                        </div>
                        {dish.description && (
                          <p className="mt-1 text-xs italic leading-relaxed text-[#d4d4d2]">
                            {dish.description}
                          </p>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
};
