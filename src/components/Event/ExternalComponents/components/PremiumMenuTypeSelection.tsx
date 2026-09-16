import {UtensilsCrossed, ChevronRight} from 'lucide-react';

export const PremiumMenuTypeSelection: React.FC<{
  onSelectPackage: () => void;
  onSelectDish: () => void;
}> = ({onSelectPackage, onSelectDish}) => (
  <div className="premium-shadow from-gray-50 to-gray-100 rounded-3xl bg-gradient-to-br p-8">
    {/* <div className="mb-8 text-center">
      <h2 className="font-elegant mb-3 text-2xl font-semibold text-[#EFBF04]">
        Explore Packages
      </h2>
    </div> */}

    <div className="space-y-6">
      {/* <button
        onClick={onSelectPackage}
        className="gold-gradient group relative overflow-hidden rounded-lg p-1 text-left transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl"
      >
        <div className="absolute inset-0" />
        <div className="relative flex items-center space-x-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg backdrop-blur-sm">
            <Package className="h-6 w-6 text-black" />
          </div>
          <div className="flex-1">
            <p className="text-base font-bold text-black">Explore Packages</p>
          </div>
          <div className="bg-gold/20 rounded-full p-3 backdrop-blur-sm transition-transform group-hover:scale-110">
            <ChevronRight className="h-5 w-5 text-black" />
          </div>
        </div>
      </button> */}

      <button
        onClick={onSelectDish}
        className="gold-gradient group relative overflow-hidden rounded-lg p-1 text-left transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl"
      >
        <div className="absolute inset-0" />
        <div className="relative flex items-center space-x-6">
          <div className="bg-gold/20 flex h-12 w-12 items-center justify-center rounded-lg backdrop-blur-sm">
            <UtensilsCrossed className="h-5 w-5 text-black" />
          </div>
          <div className="flex-1">
            <p className="text-base font-bold text-black">
              Customize Your Menu &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            </p>
          </div>
          <div className="bg-gold/20 rounded-full p-3 backdrop-blur-sm transition-transform group-hover:scale-110">
            <ChevronRight className="h-5 w-5 text-black" />
          </div>
        </div>
      </button>
    </div>
  </div>
);
