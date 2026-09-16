import {Loader} from '@/components/Loader/Loader';
import {useGetSubevent} from '@/lib/react-query/queriesAndMutations/cateror/event';
import {Route} from '@/routes/_app/_event/events.$id';
import React, {useEffect, useState} from 'react';
import CounterAssignment from './CounterAssignment';
import DressCodeManagement from './DressCodeManagement';
import ExtraVendorAssignment from './ExtraVendorAssignment';
import ManagerAssignment from './ManagerAssignment';
import Menpowerkitchen from './Menpowerkitchen';
import SubeventTabs from './SubeventTabs';
import OutsourceVendors from './OutsourceVendors';

const AssignManager: React.FC = () => {
  const {id: EventId} = Route.useParams();
  const [currentSubEventIndex, setCurrentSubEventIndex] = useState(0);
  const [activeMainTab, setActiveMainTab] = useState('service');

  const {data: subeventsData, isLoading: subeventsLoading} =
    useGetSubevent(EventId);

  const subevents = subeventsData?.data?.subEvents || [];
  const currentSubEvent = subevents[currentSubEventIndex];

  // State for kitchen component
  const [vendorInputs, setVendorInputs] = useState({});

  // Mock functions for vendor management
  const handleAddVendor = (subEventId: string) => {
    console.log('Add vendor for:', subEventId);
  };

  const handleRemoveVendor = (subEventId: string, index: number) => {
    console.log('Remove vendor:', subEventId, index);
  };

  useEffect(() => {
    if (subevents?.length > 0 && currentSubEventIndex >= subevents.length) {
      setCurrentSubEventIndex(0);
    }
  }, [subevents, currentSubEventIndex]);

  if (subeventsLoading) {
    return <Loader />;
  }

  // 2. No subevent selected / not found
  if (!subevents.length || !currentSubEvent) {
    return (
      <div className="border-gray-300 dark:border-gray-700 flex h-40 items-center justify-center rounded-md bg-white p-4 text-center shadow-sm dark:bg-boxdark">
        <div className="flex flex-col items-center gap-2">
          {/* Simple icon */}
          <div className="dark:text-gray-500 mb-2 text-orange-300">
            <svg
              className="h-8 w-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>

          {/* Message with slightly improved styling */}
          <p className="text-gray-600 dark:text-gray-300 text-sm font-medium">
            Please create a subevent first
          </p>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-xs">
            No subevents available to display
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-2 dark:bg-boxdark">
      {/* Subevent Tabs */}
      <div className="mb-2">
        <SubeventTabs
          subevents={subevents}
          currentSubEventIndex={currentSubEventIndex}
          onSubeventChange={setCurrentSubEventIndex}
          activeMainTab={activeMainTab}
          onMainTabChange={setActiveMainTab}
        />
      </div>

      {/* Service Tab Content */}
      {activeMainTab === 'service' && (
        <>
          <div className="mb-2">
            <ManagerAssignment
              subevent={currentSubEvent}
              subeventId={currentSubEvent?.id}
            />
          </div>
          <div className="my-1 border-t border-stroke dark:border-strokedark"></div>

          <div className="mb-2">
            <CounterAssignment
              subevent={currentSubEvent}
              subeventId={currentSubEvent?.id}
            />
          </div>
          <div className="my-1 border-t border-stroke dark:border-strokedark"></div>

          <div className="mb-2">
            <OutsourceVendors
              subevent={currentSubEvent}
              subeventId={currentSubEvent?.id}
            />
          </div>
          <div className="my-1 border-t border-stroke dark:border-strokedark"></div>
          <div className="mb-2">
            <ExtraVendorAssignment
              subevent={currentSubEvent}
              subeventId={currentSubEvent?.id}
            />
          </div>
          <div className="my-1 border-t border-stroke dark:border-strokedark"></div>

          <div className="mb-2">
            <Menpowerkitchen
              subeventId={currentSubEvent?.id}
              subEventForm={currentSubEvent}
              vendorInputs={vendorInputs}
              setVendorInputs={setVendorInputs}
              handleAddVendor={handleAddVendor}
              handleRemoveVendor={handleRemoveVendor}
            />
          </div>
          <div className="my-1 border-t border-stroke dark:border-strokedark"></div>

          <div className="mb-2">
            <DressCodeManagement
              subevent={currentSubEvent}
              subeventId={currentSubEvent?.id}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default AssignManager;
