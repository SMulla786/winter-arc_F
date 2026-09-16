import React, {useState} from 'react';
import Custommodule from './Custommodule';
import EventPoModule from './EventPoModule';

const PO = () => {
  const [activeTab, setActiveTab] = useState('event');

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
              Event Based PO
            </button>
            <button
              className={`border-b-2 px-6 py-4 text-center text-sm font-medium sm:text-base ${
                activeTab === 'custom'
                  ? 'border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 border-transparent'
              }`}
              onClick={() => setActiveTab('custom')}
            >
              Custom PO
            </button>
          </div>
        </div>
      </div>

      {/* Active Component */}
      <div className="mt-4">
        {activeTab === 'event' && <EventPoModule />}
        {activeTab === 'custom' && <Custommodule />}
      </div>
    </div>
  );
};

export default PO;
