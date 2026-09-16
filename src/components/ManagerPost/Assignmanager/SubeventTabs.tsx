/* eslint-disable */
import React from 'react';

interface SubeventTabsProps {
  subevents: any[];
  currentSubEventIndex: number;
  onSubeventChange: (index: number) => void;
  activeMainTab: string;
  onMainTabChange: (tab: string) => void;
}

const SubeventTabs: React.FC<SubeventTabsProps> = ({
  subevents,
  currentSubEventIndex,
  onSubeventChange,
  activeMainTab,
}) => {
  // Get tab title based on active main tab
  const getTabTitle = () => {
    switch (activeMainTab) {
      case 'service':
        return 'Service Management';
      case 'kitchen':
        return 'Kitchen Management';
      case 'dress-code':
        return 'Dress Code Management';
      default:
        return 'Management';
    }
  };

  return (
    <div className="mb-2">
      {/* Subevent Tabs - Show for ALL main tabs */}
      <div className="mt-2">
        <h3 className="mb-3 px-4 text-lg font-semibold text-black dark:text-white">
          {getTabTitle()} - Select Subevent
        </h3>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {subevents.map((sub, i) => (
            <div
              key={sub.id || i}
              className={`min-w-[200px] flex-shrink-0 cursor-pointer rounded-md py-2 transition-all duration-200 dark:bg-transparent dark:text-white ${
                currentSubEventIndex === i
                  ? 'border-b-4 border-blue-600 bg-blue-50 shadow-sm dark:bg-blue-900/30'
                  : 'hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 border-b-4 border-stroke bg-white dark:border-strokedark'
              }`}
              onClick={() => onSubeventChange(i)}
            >
              <div className="flex flex-col">
                <h2 className="text-gray-800 dark:text-gray-100 truncate px-4 text-sm font-medium">
                  {sub.name || `Subevent ${i + 1}`}
                </h2>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SubeventTabs;
