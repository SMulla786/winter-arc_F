/* eslint-disable */
import React, {useState, useMemo} from 'react';
import {format} from 'date-fns';
import {useGetRawMaterialHistory} from '@/lib/react-query/queriesAndMutations/cateror/Employee/totaldishcountandRawmaterial';
import RawListEditWrapper from './RawListEditWrapper';
import {CustomPoHistoryView} from './CustomPoHistoryView';
import {MultipleRawMaterialListsView} from './MultipleRawMaterialListsView';
import CustomHistoryList from './CustomHistoryList'; // This is your detail component
import {useAuth} from './AuthProvider';
import CustomHistoryListData from './CutomHistoryListData';

// Types
interface DropdownOption {
  value: string;
  label: string;
}

interface HistoryItem {
  id: string;
  listNo: number;
  from: string;
  to: string;
  caterorId: string;
  createdAt: string;
  updatedAt: string;
  type: 'dish' | 'raw-material';
}

interface AllPomoduleHistoryProps {
  setInnerComponent?: (value: string) => void;
  setListEditId?: (value: string) => void;
  onNavigateToCustomDetail?: (historyId: string) => void; // Add this for parent navigation
}

// Helper functions
const safeFormat = (dateString: string, formatString: string) => {
  if (!dateString) return 'DD/MM/YYYY';
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? 'DD/MM/YYYY' : format(date, formatString);
};

// Main component
const AllPomoduleHistory: React.FC<AllPomoduleHistoryProps> = ({
  setInnerComponent,
  setListEditId,
  onNavigateToCustomDetail, // Receive the navigation callback
}) => {
  // State management
  const [leftDropdown, setLeftDropdown] = useState<string>('event');
  const [selectedHistoryItem, setSelectedHistoryItem] =
    useState<HistoryItem | null>(null);
  const [selectedCustomHistoryId, setSelectedCustomHistoryId] =
    useState<string>('');
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');
  const [activeTab, setActiveTab] = useState<
    'materials' | 'tenders' | 'purchases'
  >('materials');

  // Get Auth context
  const {customRawMaterialData} = useAuth();

  // API call for raw material history (for multiple raw material lists)
  const {
    data: rawMaterialHistory,
    isLoading: isRawHistoryLoading,
    isError: isRawHistoryError,
  } = useGetRawMaterialHistory();

  // API call for custom raw material history
  const {
    data: customHistoryData,
    isLoading: isCustomHistoryLoading,
    isError: isCustomHistoryError,
  } = useGetRawMaterialHistory();

  // Process raw material history data
  const rawMaterialHistoryData = useMemo(() => {
    return (rawMaterialHistory?.data || []).map((item: any) => ({
      id: item.id || Math.random().toString(),
      listNo: item.listNo || 0,
      from: item.from,
      to: item.to,
      caterorId: item.caterorId,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      type: 'raw-material' as const,
    }));
  }, [rawMaterialHistory]);

  // Process custom history data - Combine API data with current session data
  const customHistoryList = useMemo(() => {
    const combinedList: any[] = [];

    // Add current session data from AuthContext if exists
    if (customRawMaterialData) {
      combinedList.push({
        ...customRawMaterialData,
        custom: true,
      });
    }

    // Add historical data from API
    if (customHistoryData?.data) {
      // If customHistoryData.data is an array, add all items
      if (Array.isArray(customHistoryData.data)) {
        customHistoryData.data.forEach((item: any) => {
          // Don't add duplicates (check by ID)
          if (!combinedList.some((existing) => existing.id === item.id)) {
            combinedList.push({
              ...item,
              custom: true,
            });
          }
        });
      }
      // If customHistoryData.data has a data property that's an array
      else if (
        customHistoryData.data.data &&
        Array.isArray(customHistoryData.data.data)
      ) {
        customHistoryData.data.data.forEach((item: any) => {
          if (!combinedList.some((existing: any) => existing.id === item.id)) {
            combinedList.push({
              ...item,
              custom: true,
            });
          }
        });
      }
    }

    // Sort by listNo in descending order (most recent first)
    return combinedList.sort((a, b) => b.listNo - a.listNo);
  }, [customHistoryData, customRawMaterialData]);

  // Dropdown options
  const leftOptions: DropdownOption[] = [
    {value: 'event', label: 'Event'},
    {
      value: 'multiple-raw-material-lists',
      label: 'Multiple Raw Material Lists',
    },
    {value: 'custom-po', label: 'Custom PO'},
  ];

  // Handlers for Multiple Raw Material Lists
  const handleListSelection = (listId: string) => {
    const selectedItem = rawMaterialHistoryData.find(
      (item) => item.id === listId,
    );
    if (selectedItem) {
      setSelectedHistoryItem(selectedItem);
      if (setInnerComponent && setListEditId) {
        setInnerComponent('rawListWrapper');
        setListEditId(selectedItem.id);
      }
    }
  };

  const handleBackToHistory = () => {
    setSelectedHistoryItem(null);
  };

  // Handlers for Custom PO
  const handleViewCustomHistoryDetail = (historyId: string) => {
    console.log('Viewing custom history detail:', historyId);

    // If we have a parent navigation callback, use it to navigate to the Custom PO tab
    if (onNavigateToCustomDetail) {
      onNavigateToCustomDetail(historyId);
    } else {
      // Fallback: show detail within this component
      setSelectedCustomHistoryId(historyId);
      setActiveTab('materials');
      setViewMode('detail');
    }
  };

  const handleBackFromDetail = () => {
    setViewMode('list');
    setSelectedCustomHistoryId('');
  };

  const handleTabChange = (tab: 'materials' | 'tenders' | 'purchases') => {
    setActiveTab(tab);
  };

  const handleCreateNewCustom = () => {
    // Navigate to custom raw material creation
    if (setInnerComponent) {
      setInnerComponent('customPoSubmit');
    }
  };

  // Render content based on dropdown selection and view mode
  const renderContent = () => {
    // If we're in custom PO detail view (local detail view)
    if (
      leftDropdown === 'custom-po' &&
      viewMode === 'detail' &&
      selectedCustomHistoryId
    ) {
      return (
        <CustomHistoryListData
          historyId={selectedCustomHistoryId}
          onBack={handleBackFromDetail}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
      );
    }

    switch (leftDropdown) {
      case 'multiple-raw-material-lists':
        return (
          <MultipleRawMaterialListsView
            data={rawMaterialHistoryData}
            isLoading={isRawHistoryLoading}
            isError={isRawHistoryError}
            onViewHistory={(item) => handleListSelection(item.id)}
            formatDate={safeFormat}
          />
        );

      case 'custom-po':
        return (
          <CustomPoHistoryView
            historyData={{
              data: customHistoryList,
              isLoading: isCustomHistoryLoading,
              isError: isCustomHistoryError,
            }}
            isHistoryLoading={isCustomHistoryLoading}
            onViewDetail={handleViewCustomHistoryDetail}
            onCreateNew={handleCreateNewCustom}
          />
        );

      case 'event':
        return (
          <div className="rounded-lg bg-white p-6 shadow dark:bg-black">
            <p className="text-gray-600 dark:text-gray-400">
              Event history is coming soon.
            </p>
          </div>
        );

      default:
        return (
          <div className="dark:bg-gray-800 rounded-lg bg-white p-6 shadow">
            <p className="text-gray-600 dark:text-gray-400">
              Select an option from the dropdown to view the corresponding
              history.
            </p>
          </div>
        );
    }
  };

  // If a multiple raw material list item is selected, show RawListEditWrapper
  if (selectedHistoryItem) {
    return (
      <div>
        <button
          onClick={handleBackToHistory}
          className="hover:bg-gray-100 mb-4 rounded p-1.5 dark:hover:bg-meta-4"
        >
          ← Back to List Selection
        </button>
        <RawListEditWrapper
          listId={selectedHistoryItem.id}
          eventId={selectedHistoryItem.id}
        />
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header with dropdown - Only show when in list view */}
      {viewMode === 'list' && (
        <div className="mb-6 rounded-lg bg-white p-6 shadow dark:bg-black">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="text-gray-700 dark:text-gray-300 mb-2 block text-sm font-medium">
                Select Option
              </label>
              <select
                className="border-gray-300 dark:border-gray-600 w-full rounded-md border px-4 py-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-meta-4 dark:text-white"
                value={leftDropdown}
                onChange={(e) => {
                  setLeftDropdown(e.target.value);
                  setViewMode('list'); // Reset to list view when changing options
                }}
              >
                {leftOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic content area */}
      <div className="rounded-lg bg-white p-6 shadow dark:bg-black">
        {viewMode === 'list' && !selectedHistoryItem && (
          <h2 className="text-gray-900 mb-6 text-2xl font-bold dark:text-white">
            {leftOptions.find((opt) => opt.value === leftDropdown)?.label || ''}{' '}
            History
          </h2>
        )}
        {renderContent()}
      </div>
    </div>
  );
};

export default AllPomoduleHistory;
