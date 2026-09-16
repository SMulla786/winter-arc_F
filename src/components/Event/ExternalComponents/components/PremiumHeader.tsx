import {ChevronRight} from 'lucide-react';
import {MdMenuBook} from 'react-icons/md';

export const PremiumHeader: React.FC<{
  selectedFeature: string;
  onBack: () => void;
}> = ({selectedFeature, onBack}) => (
  <div className="via-gray-900 sticky top-0 z-20 bg-gradient-to-r from-black to-black shadow-2xl">
    <div className="relative px-6 py-4">
      <div className="flex items-center justify-center">
        {selectedFeature !== 'NONE' && (
          <button
            onClick={onBack}
            className="touch-button absolute left-6 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 backdrop-blur-sm transition-all hover:bg-white/20"
          >
            <ChevronRight className="text-gold h-6 w-6 rotate-180" />
          </button>
        )}
        <div className="flex items-center space-x-3">
          <div className="bg-gold rounded-full p-2">
            <MdMenuBook className="h-4 w-4 text-black" />
          </div>
          <h1 className="font-elegant text-center text-2xl font-bold text-white">
            {selectedFeature === 'NONE'
              ? 'Craft Your Perfect Menu'
              : selectedFeature === 'PACKAGE'
                ? 'Package Selection'
                : 'Dish Selection'}
          </h1>
        </div>
      </div>
      <div className="via-gold absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent to-transparent opacity-60" />
    </div>
  </div>
);
