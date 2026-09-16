import {Sparkles, Crown, ChevronDown, ChevronRight} from 'lucide-react';
import {ExtraDish} from '../types';

export const PremiumExtraDishesSection: React.FC<any> = ({
  extraDishes,
  selectedDishes,
  onDishToggle,
  expandedCategories,
  onToggleCategory,
  singlePackage,
}) => {
  const grouped = extraDishes.reduce((acc: any, ed: ExtraDish) => {
    const catId = ed.categoryId;
    const catName =
      singlePackage?.extraDishes.find((e: any) => e.categoryId === catId)
        ?.category?.name || 'Premium Add-ons';
    if (!acc[catName]) acc[catName] = [];
    acc[catName].push(ed);
    return acc;
  }, {});

  return (
    <div className="premium-shadow overflow-hidden rounded-3xl bg-black">
      <div className="border-gray-200 border-b p-6">
        <div className="flex items-center space-x-3">
          <Sparkles className="h-6 w-6 text-white" />
          <div>
            <h2 className="font-elegant text-xl font-semibold text-white">
              Premium Enhancements
            </h2>
            <p className="text-gray-600 text-sm text-white">
              Elevate your experience
            </p>
          </div>
        </div>
      </div>

      <div className="max-h-[60vh] overflow-y-auto">
        {Object.entries(grouped).map(([cat, items]: [string, ExtraDish[]]) => {
          const required = items[0].selectCount;
          const cost = items[0].cost;
          const selected = selectedDishes.filter((d) =>
            items.some((i) => i.name === d),
          ).length;
          return (
            <div key={cat} className="border-gray-200 border-b last:border-b-0">
              <div
                className="from-gray-900 flex cursor-pointer justify-between bg-gradient-to-r to-black p-5 transition-all hover:brightness-110"
                onClick={() => onToggleCategory(cat)}
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-gold/20 rounded-xl p-2">
                    <Crown className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{cat}</h3>
                    <p className="text-xs text-white">
                      Select {required} • +₹{cost} each
                    </p>
                  </div>
                </div>
                {expandedCategories.includes(cat) ? (
                  <ChevronDown className="h-5 w-5 text-white" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-white" />
                )}
              </div>

              {expandedCategories.includes(cat) && (
                <div className="space-y-3 p-4">
                  {items.map((ed) => {
                    const disabled =
                      selected >= required && !selectedDishes.includes(ed.name);
                    return (
                      <label
                        key={ed.id}
                        className={`new-dish-item glass-effect flex cursor-pointer items-start space-x-4 transition-all ${
                          disabled ? 'opacity-50 grayscale' : 'hover:shadow-md'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedDishes.includes(ed.name)}
                          onChange={() => onDishToggle(ed.name)}
                          className="premium-checkbox mt-1"
                          disabled={disabled}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between">
                            <span className="font-semibold text-white">
                              {ed.name}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="bg-gold rounded-full px-2 py-1 text-xs font-bold text-white">
                                +₹{ed.cost}
                              </span>
                            </div>
                          </div>
                          {ed.description && (
                            <p className="mt-1 text-sm leading-relaxed text-white">
                              {ed.description}
                            </p>
                          )}
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
