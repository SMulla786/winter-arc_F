import {BiSave} from 'react-icons/bi';

export const PremiumBottomActionBar: React.FC<any> = ({
  count,
  isPending,
  lastUpdated,
  onSubmit,
}) => (
  <div className="bottom-action-bar">
    <div className="mb-1 flex items-center justify-between">
      <div>
        <p className="text-xs text-white">Total Selected</p>
        <p className="font-elegant text-xs font-bold text-white">
          {count} items
        </p>
      </div>
      <button
        onClick={onSubmit}
        disabled={isPending}
        className={`group relative overflow-hidden rounded-lg px-4 py-2 text-black shadow-2xl transition-all ${
          isPending
            ? 'bg-gray-400'
            : 'floating-action hover:shadow-3xl hover:scale-105'
        }`}
      >
        <div className="relative z-10 flex items-center gap-2 text-xs">
          {isPending ? (
            <>Crafting Your Experience...</>
          ) : (
            <>
              <BiSave className="h-5 w-5" />
              Save Menu
            </>
          )}
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      </button>
    </div>

    {lastUpdated && (
      <p className="text-center text-xs text-white">
        Last curated:{' '}
        {new Date(lastUpdated).toLocaleString('en-US', {
          month: 'short',
          day: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        })}
      </p>
    )}
  </div>
);
