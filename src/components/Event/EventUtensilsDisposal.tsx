import EventUtensilPage from '@/pages/EventUtensilPage';
import React, {useState} from 'react';
import EventDisposal from './EventDisposal';
import {useAuthContext} from '@/context/AuthContext';
import toast from 'react-hot-toast';
import EventCutlery from '../CutelryMaster/EventCutlery';

const EventUtensilsDisposal = () => {
  const {user} = useAuthContext();
  const restriction = user?.employeeRestriction;
  const role = user?.role;
  const [activeComponent, setActiveComponent] = useState('EventUtensil');

  return (
    <div className="border-b border-[#eee] dark:border-strokedark">
      <div className="border-gray-200 dark:border-gray-700 flex border-b md:mx-7">
        <button
          className={`border-b-2 px-6 py-4 text-center text-sm font-medium sm:text-base ${
            activeComponent === 'EventUtensil'
              ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
              : 'text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 border-transparent'
          }`}
          onClick={() => setActiveComponent('EventUtensil')}
        >
          Event Utensils
        </button>
        <button
          className={`border-b-2 px-6 py-4 text-center text-sm font-medium sm:text-base ${
            activeComponent === 'EventDisposal'
              ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
              : 'text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 border-transparent'
          }`}
          onClick={() => setActiveComponent('EventDisposal')}
        >
          Event Disposal
        </button>
        <button
          className={`border-b-2 px-6 py-4 text-center text-sm font-medium sm:text-base ${
            activeComponent === 'EventCutlery'
              ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
              : 'text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 border-transparent'
          }`}
          onClick={() => setActiveComponent('EventCutlery')}
        >
          Event Cutlery
        </button>
      </div>

      {/* <div className="mt-4">
        {activeComponent === 'EventUtensil' && <EventUtensilPage />}
        {activeComponent === 'EventDisposal' && <EventDisposal />}
      </div> */}

      <div className="mt-4">
        {activeComponent === 'EventUtensil' &&
          ((restriction?.eventUtensils !== 'BLOCK' && role === 'EMPLOYEE') ||
          role === 'CATEROR' ? (
            <EventUtensilPage />
          ) : (
            toast.error('Update your plan to access Event Utensils') || null
          ))}

        {activeComponent === 'EventDisposal' &&
          ((restriction?.eventDisposals !== 'BLOCK' && role === 'EMPLOYEE') ||
          role === 'CATEROR' ? (
            <EventDisposal />
          ) : (
            toast.error('Update your plan to access Event Disposal') || null
          ))}
        {activeComponent === 'EventCutlery' &&
          ((restriction?.eventCutlery !== 'BLOCK' && role === 'EMPLOYEE') ||
          role === 'CATEROR' ? (
            <EventCutlery />
          ) : (
            toast.error('Update your plan to access Event Cutlery') || null
          ))}
      </div>
    </div>
  );
};

export default EventUtensilsDisposal;
