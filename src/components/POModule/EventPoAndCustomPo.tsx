import React, {useState} from 'react';
import Custommodule from './Custommodule';
import EventPoModule from './EventPoModule';
import MainPoPage from '../Event/subEvent/MainPoPage';
import CustommoduleEvent from './CustommoduleEvent';
import {useNavigate} from '@tanstack/react-router';
import {BiArrowBack} from 'react-icons/bi';
import {Route} from '@/routes/_app/_po/eventpo.$id';

const EventPoAndCustomPo = () => {
  const [activeTab, setActiveTab] = useState('event');
  const {id} = Route.useParams();

  const navigate = useNavigate();

  const handleCancel = () => {
    navigate({to: '/events/$id', params: {id: id}});
  };

  return (
    <div className="border-b border-[#eee] dark:border-strokedark">
      {/* Tabs */}
      <div className="border-gray-200 dark:border-gray-700 flex md:mx-7">
        <div className="border-gray-200 mb-6 border-b">
          <div className="flex">
            <button
              className={`border-b-2 px-6 py-4 text-center text-sm font-medium sm:text-base ${
                activeTab === 'event'
                  ? 'border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 border-transparent'
              }`}
              onClick={() => setActiveTab('event')}
            >
              Event PO
            </button>
            <button
              className={`border-b-2 px-6 py-4 text-center text-sm font-medium sm:text-base ${
                activeTab === 'custom'
                  ? 'border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 border-transparent'
              }`}
              onClick={() => setActiveTab('custom')}
            >
              Emergency PO
            </button>
          </div>
        </div>
      </div>

      {/* Active Component */}
      <div className="mt-4">
        <button
          onClick={handleCancel}
          className="flex gap-1 px-4 py-2 text-sm font-medium text-black"
        >
          <BiArrowBack className="h-4 w-4" />
          Back to Event
        </button>
        {activeTab === 'event' && <MainPoPage />}
        {activeTab === 'custom' && <CustommoduleEvent />}
      </div>
    </div>
  );
};

export default EventPoAndCustomPo;
