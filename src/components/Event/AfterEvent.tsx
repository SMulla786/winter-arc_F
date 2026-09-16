import React, {useState} from 'react';
import EventPeopleCheck from './AfterEvent/EventPeopleCheck';
import UtensilChecking from './AfterEvent/UtensilChecking';
import WastageReport from './AfterEvent/WastageReport';
import RawMaterialReturn from './AfterEvent/RawMaterialReturn';
import EventDisposals from './AfterEvent/EventDisposals';
import {useAuthContext} from '@/context/AuthContext';
import toast from 'react-hot-toast';
import CostingComponent from './AfterEvent/Costing.tsx/CostingComponent';
import EventFeedback from './Feedback/EventFeedback';
import AfterEventCutlery from '../CutelryMaster/AfterEventCutlery';
import DocumentsUpload from '@/pages/DocumentsUpload';

const AfterEvent: React.FC = () => {
  const [activeTab, setActiveTab] = useState('EventPeopleCheck');
  const [activeComponentTab, setActiveComponentTab] =
    useState('UtensilChecking');
  const {user} = useAuthContext();
  const role = user?.role;
  const restriction = user?.employeeRestriction;
  const userPlan = user?.plan?.toLowerCase() || 'free';
  const isProPlan = userPlan === 'pro';
  const isPremiumPlan = userPlan === 'premium';
  const isUltraPremiumPlan = userPlan === 'ultrapremium';
  const isPremiumOrHigher = isPremiumPlan || isUltraPremiumPlan;

  // Define tabs based on user plan
  const getAfterEventTabs = () => {
    // For Pro plan - show People Check and Costing tabs
    if (isProPlan) {
      return [
        {id: 'EventPeopleCheck', label: 'People Check', key: 'peopleCheck'},
        // {id: 'Costing', label: 'Costing', key: 'costing'},
      ];
    }

    // For Premium and Ultra Premium - show ALL tabs including Costing
    if (isPremiumOrHigher) {
      return [
        {id: 'EventPeopleCheck', label: 'People Check', key: 'peopleCheck'},
        {id: 'WastageReport', label: 'Wastage Report', key: 'westageReport'},
        {
          id: 'RawMaterialReturn',
          label: 'Raw Material Return',
          key: 'rawMaterialReturn',
        },
        {
          id: 'Utensils&Disposals',
          label: 'Utensils & Disposals',
          key: 'utensils&disposals',
        },
        {id: 'Costing', label: 'Costing', key: 'costing'},
        {id: 'EventFeedback', label: 'Event Feedback', key: 'eventFeedback'},
      ];
    }

    // For Basic/Free plans - show all tabs EXCEPT Costing
    return [
      {id: 'EventPeopleCheck', label: 'People Check', key: 'peopleCheck'},
      {id: 'WastageReport', label: 'Wastage Report', key: 'westageReport'},
      {
        id: 'RawMaterialReturn',
        label: 'Raw Material Return',
        key: 'rawMaterialReturn',
      },
      {
        id: 'Utensils&Disposals',
        label: 'Utensils & Disposals',
        key: 'utensils&disposals',
      },
      {id: 'EventFeedback', label: 'Event Feedback', key: 'eventFeedback'},
    ];
  };

  const afterEventTabs = getAfterEventTabs();

  const canAccess = (key: string) => {
    if (role === 'CATEROR') return true;
    return restriction?.[key] !== 'BLOCK';
  };

  const handleTabClick = (tabId: string, accessKey: string) => {
    // For Costing tab, check if user has Premium/Ultra Premium plan
    if (tabId === 'Costing' && !isPremiumOrHigher && !isProPlan) {
      toast.error(
        'This feature is only available for Pro, Premium and Ultra Premium plans',
      );
      return;
    }

    if (!canAccess(accessKey)) {
      toast.error('Access restricted');
      return;
    }
    setActiveTab(tabId);
  };

  // Reset to first tab if current tab not available
  React.useEffect(() => {
    const currentTabExists = afterEventTabs.some((tab) => tab.id === activeTab);
    if (!currentTabExists && afterEventTabs.length > 0) {
      setActiveTab(afterEventTabs[0].id);
    }
  }, [userPlan, activeTab, afterEventTabs]);

  // MATCHED STYLE — EXACT SAME AS EVENT MANAGEMENT SUB TABS (purple theme)
  const getTabClasses = (isActive: boolean, isDisabled: boolean = false) => {
    const color = 'purple';

    const base = `transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-md 
      whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium cursor-pointer select-none 
      ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`;

    if (isActive) {
      return `${base} border-${color}-600 bg-${color}-100 text-${color}-600 
        shadow-lg dark:border-${color}-500 dark:bg-${color}-900/30 dark:text-${color}-400`;
    }

    return `${base} border-transparent text-gray-500 
      hover:border-${color}-300 hover:bg-${color}-50 
      dark:text-gray-400 dark:hover:border-${color}-600 dark:hover:bg-${color}-800/50`;
  };

  return (
    <div className="w-full">
      {/* MATCHED TAB BAR WRAPPER (same as EventManagement) */}
      <div className="bg-gray-50 flex items-center border-b border-stroke dark:border-strokedark dark:bg-boxdark-2">
        <div className="scrollbar-hide flex-1 overflow-x-auto">
          <div className="flex min-w-max gap-1">
            {afterEventTabs.map((tab) => {
              const isDisabled =
                !canAccess(tab.key) ||
                (tab.id === 'Costing' && !isPremiumOrHigher && !isProPlan);
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id, tab.key)}
                  disabled={isDisabled}
                  className={getTabClasses(isActive, isDisabled)}
                >
                  {tab.label}
                  {tab.id === 'Costing' && !isPremiumOrHigher && !isProPlan && (
                    <span className="ml-2 text-xs">🔒</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="mt-6 min-h-screen rounded-b-lg bg-white dark:bg-boxdark">
        <div className="p-2">
          {/* For Pro Plan - show People Check and Costing */}
          {isProPlan && (
            <>
              {activeTab === 'EventPeopleCheck' && canAccess('peopleCheck') && (
                <EventPeopleCheck />
              )}
              {activeTab === 'Costing' && canAccess('costing') && (
                <CostingComponent />
              )}
            </>
          )}

          {/* For Premium and Ultra Premium - show ALL pages */}
          {isPremiumOrHigher && (
            <>
              {activeTab === 'EventPeopleCheck' && canAccess('peopleCheck') && (
                <EventPeopleCheck />
              )}

              {activeTab === 'WastageReport' && canAccess('westageReport') && (
                <WastageReport />
              )}

              {activeTab === 'RawMaterialReturn' &&
                canAccess('rawMaterialReturn') && <RawMaterialReturn />}

              {/* Utensils & Disposals Tab Content */}
              {activeTab === 'Utensils&Disposals' &&
                canAccess('utensils&disposals') && (
                  <>
                    {/* Sub-tabs for Utensils & Disposals - Horizontal scrollable */}
                    <div className="mb-4">
                      <div className="scrollbar-hide border-gray-200 dark:border-gray-700 flex overflow-x-auto border-b">
                        <div className="flex min-w-max">
                          <button
                            className={`flex-shrink-0 border-b-2 px-4 py-3 text-sm font-medium sm:px-6 sm:py-4 sm:text-base ${
                              activeComponentTab === 'UtensilChecking'
                                ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 border-transparent'
                            }`}
                            onClick={() =>
                              setActiveComponentTab('UtensilChecking')
                            }
                          >
                            Utensil Checking
                          </button>
                          <button
                            className={`flex-shrink-0 border-b-2 px-4 py-3 text-sm font-medium sm:px-6 sm:py-4 sm:text-base ${
                              activeComponentTab === 'EventDisposal'
                                ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 border-transparent'
                            }`}
                            onClick={() =>
                              setActiveComponentTab('EventDisposal')
                            }
                          >
                            Event Disposals
                          </button>
                          <button
                            className={`flex-shrink-0 border-b-2 px-4 py-3 text-sm font-medium sm:px-6 sm:py-4 sm:text-base ${
                              activeComponentTab === 'EventCutlery'
                                ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 border-transparent'
                            }`}
                            onClick={() =>
                              setActiveComponentTab('EventCutlery')
                            }
                          >
                            Event Cutlery
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Render the active sub-component */}
                    <div className="space-y-6">
                      {activeComponentTab === 'UtensilChecking' && (
                        <UtensilChecking />
                      )}
                      {activeComponentTab === 'EventDisposal' && (
                        <EventDisposals />
                      )}
                      {activeComponentTab === 'EventCutlery' && (
                        <AfterEventCutlery />
                      )}
                    </div>
                  </>
                )}

              {activeTab === 'Costing' && canAccess('costing') && (
                <CostingComponent />
              )}

              {activeTab === 'EventFeedback' && canAccess('eventFeedback') && (
                <EventFeedback />
              )}
            </>
          )}

          {/* For Basic/Free plans - show all pages EXCEPT Costing */}
          {!isProPlan && !isPremiumOrHigher && (
            <>
              {activeTab === 'EventPeopleCheck' && canAccess('peopleCheck') && (
                <EventPeopleCheck />
              )}

              {activeTab === 'WastageReport' && canAccess('westageReport') && (
                <WastageReport />
              )}

              {activeTab === 'RawMaterialReturn' &&
                canAccess('rawMaterialReturn') && <RawMaterialReturn />}

              {/* Utensils & Disposals Tab Content */}
              {activeTab === 'Utensils&Disposals' &&
                canAccess('utensils&disposals') && (
                  <>
                    {/* Sub-tabs for Utensils & Disposals - Horizontal scrollable */}
                    <div className="mb-4">
                      <div className="scrollbar-hide border-gray-200 dark:border-gray-700 flex overflow-x-auto border-b">
                        <div className="flex min-w-max">
                          <button
                            className={`flex-shrink-0 border-b-2 px-4 py-3 text-sm font-medium sm:px-6 sm:py-4 sm:text-base ${
                              activeComponentTab === 'UtensilChecking'
                                ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 border-transparent'
                            }`}
                            onClick={() =>
                              setActiveComponentTab('UtensilChecking')
                            }
                          >
                            Utensil Checking
                          </button>
                          <button
                            className={`flex-shrink-0 border-b-2 px-4 py-3 text-sm font-medium sm:px-6 sm:py-4 sm:text-base ${
                              activeComponentTab === 'EventDisposal'
                                ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 border-transparent'
                            }`}
                            onClick={() =>
                              setActiveComponentTab('EventDisposal')
                            }
                          >
                            Event Disposals
                          </button>
                          <button
                            className={`flex-shrink-0 border-b-2 px-4 py-3 text-sm font-medium sm:px-6 sm:py-4 sm:text-base ${
                              activeComponentTab === 'EventCutlery'
                                ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 border-transparent'
                            }`}
                            onClick={() =>
                              setActiveComponentTab('EventCutlery')
                            }
                          >
                            Event Cutlery
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Render the active sub-component */}
                    <div className="space-y-6">
                      {activeComponentTab === 'UtensilChecking' && (
                        <UtensilChecking />
                      )}
                      {activeComponentTab === 'EventDisposal' && (
                        <EventDisposals />
                      )}
                      {activeComponentTab === 'EventCutlery' && (
                        <AfterEventCutlery />
                      )}
                    </div>
                  </>
                )}

              {activeTab === 'EventFeedback' && canAccess('eventFeedback') && (
                <EventFeedback />
              )}
            </>
          )}

          {/* Restricted fallback */}
          {afterEventTabs.find(
            (t) => t.id === activeTab && !canAccess(t.key),
          ) && (
            <div className="p-10 text-center">
              <p className="text-xl font-medium text-red-600 dark:text-red-400">
                Access Restricted
              </p>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                You don't have permission to access this section.
              </p>
            </div>
          )}

          {/* Upgrade message for Costing tab on non-premium plans */}
          {activeTab === 'Costing' && !isPremiumOrHigher && !isProPlan && (
            <div className="p-10 text-center">
              <div className="mb-4 text-6xl">⭐</div>
              <p className="text-gray-800 dark:text-gray-200 text-xl font-medium">
                Pro, Premium & Ultra Premium Feature
              </p>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                The Costing Analysis feature provides detailed insights into
                your event costs, profit margins, and financial performance.
              </p>
              <div className="mt-4 space-y-2">
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  ✨ Real-time cost tracking
                </p>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  ✨ Profit margin analysis
                </p>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  ✨ Budget vs actual comparison
                </p>
              </div>
              <button
                onClick={() => {
                  toast.success('Redirecting to upgrade page...');
                }}
                className="mt-6 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-2 text-white transition-all hover:from-purple-700 hover:to-blue-700"
              >
                Upgrade to Pro
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AfterEvent;
