import AdditionalExtra from '@/components/EventSummary/AdditionalExtra';
import FuelAdd from '@/components/EventSummary/FuelAdd';
import TransportForm from '@/components/EventSummary/TransportForm';
import {useGetEventSummary} from '@/lib/react-query/queriesAndMutations/cateror/event';
import {Route} from '@/routes/_app/_event/events.$id';
import Transport from './Transport';
import Additional from './Additional';
import Fuel from './Fuel';

const EventTabSection = () => {
  const {id: eventId} = Route.useParams();
  const {data: summary, isLoading} = useGetEventSummary(eventId);

  if (isLoading)
    return (
      <div className="text-gray-500 flex justify-center py-16 text-lg">
        Loading summary...
      </div>
    );

  if (!summary?.subEvents)
    return (
      <div className="text-gray-500 py-16 text-center">
        No summary data available
      </div>
    );

  return (
    <div className="mx-auto mt-2 md:mt-3">
      <div className="mt-2">
        <Transport />
      </div>
      <div className="mt-2">
        <Additional />
      </div>
      <div className="mt-2">
        <Fuel />
      </div>
    </div>
  );
};

export default EventTabSection;
