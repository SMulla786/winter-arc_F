import React, {useState} from 'react';
import {useAuthContext} from '@/context/AuthContext';
import EventSelection from './RawListEditTabs.tsx/EventSelection';
import EachRawListHistory from './EachRawListHistory';
import DishShow from './RawListEditTabs.tsx/DishShow';
import PoTendorRateCompare from './PoTendorRateCompare';
import ExternalPoRMPage from './ExternalPoRMPage';
import {FaBars, FaTimes} from 'react-icons/fa';
import {
  FiCalendar,
  FiEye,
  FiFilter,
  FiPackage,
  FiRefreshCw,
} from 'react-icons/fi';
import ExternalPoHistoryPage from './ExternalPoHistory/ExternalPoHistoryPage';

type Props = {
  listId: string;
  eventId: string;
};

type ViewMode =
  | 'events'
  | 'dish-results'
  | 'raw-materials'
  | 'po'
  | 'compare-po';

const RawListEditWrapper: React.FC<Props> = ({listId, eventId}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('events');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshAllTabs = () => {
    setIsRefreshing(true);
    // Increment refreshKey to force ALL child components to re-render
    setRefreshKey((prev) => prev + 1);

    // Simulate refresh delay for better UX
    setTimeout(() => {
      setIsRefreshing(false);
    }, 800);
  };

  // Function to refresh specific tab
  const refreshCurrentTab = () => {
    // You could implement tab-specific refresh if needed
    handleRefreshAllTabs(); // For now, just refresh all
  };

  // Tab navigation items
  const tabItems = [
    {
      id: 'events',
      label: 'Select Events',
      icon: <FiCalendar className="mr-1" />,
    },
    {
      id: 'dish-results',
      label: 'Dish Results',
      icon: <FiEye className="mr-1" />,
    },
    {
      id: 'raw-materials',
      label: 'Raw Materials',
      icon: <FiFilter className="mr-1" />,
    },
    {id: 'po', label: 'Purchase Order', icon: <FiPackage className="mr-1" />},
    {id: 'compare-po', label: 'Tendor', icon: <FiPackage className="mr-1" />},
  ];

  return (
    <div className="bg-white dark:bg-black">
      <div className="mx-auto p-1 sm:p-2 md:p-3">
        <div className="rounded border border-neutral-200 bg-white p-2 shadow-sm dark:border-black dark:bg-black sm:p-3">
          {/* Header */}
          <div className="mb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <h3 className="text-gray-800 text-base font-semibold dark:text-white">
                  History
                </h3>

                {/* Refresh status indicator - moved next to title */}
                {isRefreshing && (
                  <div className="flex animate-pulse items-center text-xs text-blue-600 dark:text-blue-400">
                    <FiRefreshCw className="mr-1 h-3 w-3 animate-spin" />
                    Refreshing all tabs...
                  </div>
                )}
              </div>

              {/* Right side buttons */}
              <div className="flex items-center space-x-2">
                {/* Refresh All Tabs Button */}
                <button
                  onClick={handleRefreshAllTabs}
                  disabled={isRefreshing}
                  className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 group relative rounded p-1.5 transition-all duration-200"
                  title="Refresh all tabs"
                >
                  <FiRefreshCw
                    className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
                  />

                  {/* Tooltip */}
                  <div className="bg-gray-900 dark:bg-gray-700 invisible absolute right-0 top-full z-10 mt-2 whitespace-nowrap rounded px-2 py-1 text-xs text-white group-hover:visible">
                    Refresh all tabs
                  </div>
                </button>

                {/* Mobile Menu Toggle */}
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded p-1 lg:hidden"
                >
                  {isMobileMenuOpen ? (
                    <FaTimes className="h-5 w-5" />
                  ) : (
                    <FaBars className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-gray-200 dark:border-gray-700 mb-3 border-b">
            {/* Desktop Tabs */}
            <div className="hidden space-x-1 lg:flex">
              {tabItems.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setViewMode(tab.id as ViewMode)}
                  className={`flex items-center rounded-t-lg px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                    viewMode === tab.id
                      ? 'border-b-2 border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-800'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Mobile Tabs Dropdown */}
            {isMobileMenuOpen && (
              <div className="border-gray-200 dark:border-gray-700 dark:bg-gray-800 mb-2 rounded border bg-white shadow-lg lg:hidden">
                <div className="flex flex-col p-1">
                  {tabItems.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setViewMode(tab.id as ViewMode);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`flex items-center rounded px-3 py-2 text-sm font-medium ${
                        viewMode === tab.id
                          ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                          : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
                      }`}
                    >
                      {tab.icon}
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Mobile Tabs Horizontal Scroll */}
            <div className="flex overflow-x-auto py-1 lg:hidden">
              <div className="flex min-w-max space-x-1">
                {tabItems.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setViewMode(tab.id as ViewMode)}
                    className={`flex items-center whitespace-nowrap rounded px-2 py-1 text-xs font-medium ${
                      viewMode === tab.id
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {tab.icon}
                    <span className="ml-1">
                      {tab.id === 'events'
                        ? 'Events'
                        : tab.id === 'dish-results'
                          ? 'Dish'
                          : tab.id === 'raw-materials'
                            ? 'Raw'
                            : tab.id === 'compare-po'
                              ? 'Tendor'
                              : tab.id === 'po'
                                ? 'PO'
                                : tab.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="mt-2">
            {/* All components will refresh when refreshKey changes */}
            {viewMode === 'events' && (
              <EventSelection key={`events-${refreshKey}`} listId={listId} />
            )}
            {viewMode === 'dish-results' && (
              <DishShow key={`dish-${refreshKey}`} listId={listId} />
            )}
            {viewMode === 'raw-materials' && (
              <EachRawListHistory key={`raw-${refreshKey}`} listId={listId} />
            )}
            {viewMode === 'po' && <ExternalPoHistoryPage id={listId} />}
            {viewMode === 'compare-po' && (
              <PoTendorRateCompare
                key={`compare-${refreshKey}`}
                eventid={listId}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RawListEditWrapper;
