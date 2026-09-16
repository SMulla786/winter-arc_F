import {ChevronRight} from 'lucide-react';

export const PremiumPackageSelection: React.FC<{
  packages: any[];
  onSelect: (pkg: any) => void;
}> = ({packages, onSelect}) => (
  <div className="premium-shadow rounded-3xl bg-black p-6">
    <div className="mb-6">
      <h2 className="font-elegant mb-2 text-2xl font-semibold text-white">
        Packages
      </h2>
    </div>

    <div className="space-y-4">
      {packages?.map((item: any) => (
        <div
          key={item.pkg.id}
          className="border-gold/20 from-gray-50 hover:border-gold group relative cursor-pointer overflow-hidden rounded-xl border bg-gradient-to-r to-white p-4 transition-all duration-300 hover:shadow-xl"
          onClick={() => onSelect(item)}
        >
          <div className="flex items-start space-x-4">
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <h3 className="font-elegant text-lg font-semibold text-white">
                  {item.packageName}
                </h3>
                {item.pkg.price && (
                  <span className="bg-gold rounded-full px-3 py-1 text-sm font-bold text-white">
                    ₹{item.pkg.price}
                  </span>
                )}
              </div>

              {item.pkg.description && (
                <p className="mt-2 text-sm text-white">
                  {item.pkg.description}
                </p>
              )}

              <div className="mt-4 grid grid-cols-2 gap-2">
                {item.categories.slice(0, 4).map((c: any) => (
                  <span key={c.categoryName} className="category-badge">
                    {c.categoryName} ({c.totalDishes})
                  </span>
                ))}
                {item.categories.length > 4 && (
                  <span className="category-badge">
                    +{item.categories.length - 4} more
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100">
            <div className="bg-gold rounded-full p-2">
              <ChevronRight className="h-4 w-4 text-black" />
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);
