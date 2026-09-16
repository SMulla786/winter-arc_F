/* eslint-disable */
import React, {useState} from 'react';
import CustomRMSubmit from './CustomRM';
import CustomTendor from './CustomTendor';
import CustomPO from './CustomPO';
import CustomRMHistory from './CustomRMHistory';
import CustomRMHistoryDetail from './CustomRMHistoryDetail';
import {useGetRawMaterialHistory} from '@/lib/react-query/queriesAndMutations/cateror/Employee/totaldishcountandRawmaterial';

interface CustomPOManagerProps {
  eventId?: string;
  listId?: string;
  initialData?: any;
}

type ViewType =
  | 'form'
  | 'tender'
  | 'purchase'
  | 'custom-history'
  | 'history-detail';

const Custommodule: React.FC<CustomPOManagerProps> = ({
  eventId,
  listId,
  initialData,
}) => {
  const [view, setView] = useState<ViewType>('form');
  const [lastSubmittedId, setLastSubmittedId] = useState<string | undefined>(
    eventId,
  );
  const [submittedRawMaterials, setSubmittedRawMaterials] = useState<any>(null);
  const [isFormSubmitted, setIsFormSubmitted] = useState<boolean>(false);
  const [selectedHistoryId, setSelectedHistoryId] = useState<string>('');
  const [historyDetailTab, setHistoryDetailTab] = useState<
    'materials' | 'tenders' | 'purchases'
  >('materials');

  // Fetch history data
  const {data: historyData, isLoading: isHistoryLoading} =
    useGetRawMaterialHistory();

  const handleSubmitSuccess = (response: any) => {
    const newId = response?.id || response?.data?.id || eventId;
    if (newId) {
      setLastSubmittedId(newId);
      setSubmittedRawMaterials(response?.data || response);
      setIsFormSubmitted(true);
      setView('form');
    }
  };

  const handleBackFromHistory = () => {
    setView('form');
    setSelectedHistoryId('');
    setHistoryDetailTab('materials');
  };

  const handleViewHistoryDetail = (historyId: string) => {
    console.log('Viewing history detail for ID:', historyId);
    setSelectedHistoryId(historyId);
    setHistoryDetailTab('materials'); // Reset to materials tab when opening detail
    setView('history-detail');
  };

  const handleCreateNew = () => {
    setView('form');
    setIsFormSubmitted(false);
    setSubmittedRawMaterials(null);
  };

  const handleHistoryDetailTabChange = (
    tab: 'materials' | 'tenders' | 'purchases',
  ) => {
    setHistoryDetailTab(tab);
  };

  // Determine which content to show in the main area
  const renderMainContent = () => {
    switch (view) {
      case 'form':
        return (
          <CustomRMSubmit
            eventId={lastSubmittedId || eventId}
            initialData={initialData}
            onSuccess={handleSubmitSuccess}
            submittedData={submittedRawMaterials}
            isReadOnly={!!submittedRawMaterials}
          />
        );

      case 'tender':
        return <CustomTendor eventId={lastSubmittedId || eventId} />;

      case 'purchase':
        return <CustomPO listId={lastSubmittedId || listId} />;

      case 'custom-history':
        return (
          <CustomRMHistory
            historyData={historyData}
            isHistoryLoading={isHistoryLoading}
            onBack={handleBackFromHistory}
            onViewDetail={handleViewHistoryDetail}
            onCreateNew={handleCreateNew}
          />
        );

      case 'history-detail':
        return (
          <CustomRMHistoryDetail
            historyId={selectedHistoryId}
            onBack={handleBackFromHistory}
            activeTab={historyDetailTab}
            onTabChange={handleHistoryDetailTabChange}
            hideTabs={true} // Add this prop to hide internal tabs
          />
        );

      default:
        return (
          <CustomRMSubmit
            eventId={eventId}
            initialData={initialData}
            onSuccess={handleSubmitSuccess}
            submittedData={submittedRawMaterials}
            isReadOnly={!!submittedRawMaterials}
          />
        );
    }
  };

  // Determine if we should show the main tabs (hide them when in history detail)
  const showMainTabs = view !== 'history-detail';

  return (
    <div className="border-b border-[#eee] dark:border-strokedark">
      {/* TABS - Only show when not in history detail view */}
      {showMainTabs && (
        <div className="border-gray-200 dark:border-gray-700 border-b md:mx-7">
          <nav className="flex space-x-8" aria-label="Tabs">
            {/* Raw Material Tab */}
            <button
              className={`px-1 py-4 text-sm font-medium transition-colors duration-200 ${
                view === 'form'
                  ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
              onClick={() => setView('form')}
            >
              Raw Material {isFormSubmitted ? '✓' : ''}
            </button>

            {/* Tender Tab */}
            <button
              className={`px-1 py-4 text-sm font-medium transition-colors duration-200 ${
                view === 'tender'
                  ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
              onClick={() => setView('tender')}
            >
              Tender
            </button>

            {/* Purchase Order Tab */}
            <button
              className={`px-1 py-4 text-sm font-medium transition-colors duration-200 ${
                view === 'purchase'
                  ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
              onClick={() => setView('purchase')}
            >
              Purchase Order
            </button>

            {/* History Tab */}
            <button
              className={`px-1 py-4 text-sm font-medium transition-colors duration-200 ${
                view === 'custom-history'
                  ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
              onClick={() => setView('custom-history')}
            >
              History
            </button>
          </nav>
        </div>
      )}

      {/* When in history detail view, show a back button and custom tabs */}
      {view === 'history-detail' && (
        <div className="border-gray-200 dark:border-gray-700 border-b md:mx-7">
          <nav className="mt-2 flex space-x-8" aria-label="Detail Tabs">
            <button
              className={`px-1 py-3 text-sm font-medium transition-colors duration-200 ${
                historyDetailTab === 'materials'
                  ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
              onClick={() => handleHistoryDetailTabChange('materials')}
            >
              Raw Materials
            </button>
            <button
              className={`px-1 py-3 text-sm font-medium transition-colors duration-200 ${
                historyDetailTab === 'tenders'
                  ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
              onClick={() => handleHistoryDetailTabChange('tenders')}
            >
              Tenders
            </button>
            <button
              className={`px-1 py-3 text-sm font-medium transition-colors duration-200 ${
                historyDetailTab === 'purchases'
                  ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
              onClick={() => handleHistoryDetailTabChange('purchases')}
            >
              Purchase Orders
            </button>
          </nav>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <div className="mt-4 md:mx-7">{renderMainContent()}</div>
    </div>
  );
};

export default Custommodule;
