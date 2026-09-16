import {Sparkles} from 'lucide-react';

export const PremiumAdditionalServicesSection: React.FC<any> = ({
  services,
  selectedAddons,
  onToggle,
}) => (
  <div className="premium-shadow overflow-hidden rounded-xl bg-black">
    <div className="p-6">
      <div className="flex items-center space-x-3">
        <Sparkles className="h-6 w-6 text-white" />
        <div>
          <h2 className="font-elegant text-xl font-semibold text-white">
            Additional Services
          </h2>
          <p className="text-sm text-white">Enhance your event experience</p>
        </div>
      </div>
    </div>

    <div className="grid gap-2 md:grid-cols-2">
      {services.map((s: any) => (
        <label
          key={s.id}
          className="new-dish-item glass-effect flex cursor-pointer items-center justify-between transition-all hover:shadow-md"
        >
          <div className="flex items-center gap-4">
            <input
              type="checkbox"
              checked={selectedAddons.includes(s.id)}
              onChange={() => onToggle(s.id)}
              className="premium-checkbox"
            />
            <span className="font-semibold text-white">{s.name}</span>
          </div>
          <span className="from-gold to-gold rounded-full bg-gradient-to-r px-3 py-1 text-sm font-bold text-white">
            +₹{s.cost}
          </span>
        </label>
      ))}
    </div>
  </div>
);
