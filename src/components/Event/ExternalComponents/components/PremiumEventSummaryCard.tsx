import {Sparkles, Calendar, ChefHat, MapPin, Users} from 'lucide-react';

export const PremiumEventSummaryCard: React.FC<{
  subEvent: any;
  cateror: any;
  date?: string;
}> = ({subEvent, cateror, date}) => (
  <div className="premium-shadow from-gray-50 to-gray-100 rounded-lg bg-black px-8 py-2">
    <div className="mb-4 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="rounded-2xl bg-white/10 p-3">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        <h2 className="font-elegant text-xl font-semibold text-white">
          Event Details
        </h2>
      </div>
      <div className="flex flex-col">
        <span className="bg-gold rounded-full text-sm font-semibold text-white shadow-lg">
          {new Date(date).toLocaleString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })}
        </span>
        <span className="bg-gold rounded-full text-sm font-semibold text-white shadow-lg">
          {new Date(date).toLocaleString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          })}
        </span>
      </div>
    </div>
    <div className="space-y-4">
      <div className="flex justify-between">
        <div className="flex items-center space-x-3 rounded-lg bg-black p-2">
          <Calendar className="h-5 w-5 text-[#EFBF04]" />
          <div className="flex-1 bg-black">
            <p className="text-sm text-[#EFBF04]">Event</p>
            <p className="text-xs text-white">{subEvent?.name}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3 rounded-lg bg-black p-2">
          <ChefHat className="h-5 w-5 text-[#EFBF04]" />
          <div className="flex-1">
            <p className="text-sm text-[#EFBF04]">SubEvent</p>
            <p className="text-xs text-white">{subEvent?.name}</p>
          </div>
        </div>
      </div>
      <div className="flex justify-between">
        {subEvent?.address && (
          <div className="flex items-center space-x-3 rounded-lg bg-black p-2">
            <MapPin className="h-5 w-5 text-[#EFBF04]" />
            <div className="flex-1">
              <p className="text-sm text-[#EFBF04]">Venue</p>
              <p className="text-xs text-white">{subEvent.address}</p>
            </div>
          </div>
        )}
        <div className="flex items-center space-x-3 rounded-lg bg-black p-2">
          <Users className="h-5 w-5 text-[#EFBF04]" />
          <div className="flex-1">
            <p className="text-sm text-[#EFBF04]">Guests &nbsp;&nbsp;&nbsp;</p>
            <p className="text-xs text-white">{subEvent?.expectedPeople}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);
