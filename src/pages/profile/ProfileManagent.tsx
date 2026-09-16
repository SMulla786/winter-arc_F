import React, {useEffect, useState, Suspense} from 'react';

// Components
import {Profile} from '@/components/Profile';
import DetailsPage from '../DetailsPage';
import PaymentDetails from '@/components/CaterorSetting/PaymentDetails';
import TermCondition from '@/components/CaterorSetting/TermCondition';
import ImageUpload from '../ImageUpload';

type TabConfig = {
  name: string;
  component: React.ReactNode;
};

const tabs: TabConfig[] = [
  {
    name: 'Profile',
    component: <Profile />,
  },
  {
    name: 'Firm Details',
    component: <DetailsPage />,
  },
  {
    name: 'Payment Details',
    component: <PaymentDetails />,
  },
  {
    name: 'Terms & Conditions',
    component: <TermCondition />,
  },
  {
    name: 'Letter Head',
    component: <ImageUpload />,
  },
];

const ProfileManagent: React.FC = () => {
  // Persist active tab like EventManagement
  const [activeTab, setActiveTab] = useState<number>(() => {
    return parseInt(sessionStorage.getItem('pm-activeTab') || '0', 10);
  });

  useEffect(() => {
    sessionStorage.setItem('pm-activeTab', activeTab.toString());
  }, [activeTab]);

  // Same visual language as EventManagement tabs
  const getTabClasses = (isActive: boolean) => {
    const base =
      'transition-all duration-300 ease-in-out whitespace-nowrap border-b-2 px-5 py-3 text-sm font-medium cursor-pointer select-none';

    if (isActive) {
      return `${base} border-blue-600 bg-blue-100 text-blue-600 shadow-sm dark:border-blue-500 dark:bg-blue-900/30 dark:text-blue-400`;
    }

    return `${base} border-transparent text-gray-500 hover:border-blue-300 hover:bg-blue-50 dark:text-gray-400 dark:hover:border-blue-600 dark:hover:bg-blue-800/50`;
  };

  return (
    <div className="w-full">
      {/* MAIN TABS */}
      <div className="flex w-full border-b border-stroke dark:border-strokedark">
        <div className="scrollbar-hide flex w-full overflow-x-auto">
          {tabs.map((tab, index) => (
            <button
              key={index}
              onClick={() => setActiveTab(index)}
              className={getTabClasses(activeTab === index)}
            >
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      {/* TAB CONTENT */}
      <div className="w-full pt-4">
        <Suspense
          fallback={
            <div className="text-gray-500 p-8 text-center">Loading…</div>
          }
        >
          {tabs[activeTab].component}
        </Suspense>
      </div>
    </div>
  );
};

export default ProfileManagent;
