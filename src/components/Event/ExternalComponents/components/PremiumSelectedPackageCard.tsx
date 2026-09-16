import {Crown} from 'lucide-react';
import {CateringPackage} from '../types';
import {MdClose} from 'react-icons/md';

export const PremiumSelectedPackageCard: React.FC<{
  pkg: CateringPackage;
  onRemove: () => void;
}> = ({pkg, onRemove}) => (
  <div className="gold-gradient premium-shadow rounded-xl p-6">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="rounded-xl bg-black/20 p-3 backdrop-blur-sm">
          <Crown className="h-6 w-6 text-black" />
        </div>
        <div>
          <p className="text-sm font-semibold text-black">Selected Package</p>
          <p className="font-elegant text-xl font-bold text-black">
            {pkg.name}
          </p>
          {pkg.price && (
            <p className="text-sm font-medium text-black">
              ₹{pkg.price} per guest
            </p>
          )}
        </div>
      </div>
      <button
        onClick={onRemove}
        className="rounded-full bg-black/20 p-2 backdrop-blur-sm transition-all hover:bg-black/30"
      >
        <MdClose className="h-5 w-5 text-center text-black" />
      </button>
    </div>
  </div>
);
