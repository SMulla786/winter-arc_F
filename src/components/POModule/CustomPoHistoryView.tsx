/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import CustomHistoryList from './CustomHistoryList';

interface CustomPoHistoryViewProps {
  historyData: {
    data: any[];
    isLoading: boolean;
    isError: boolean;
  };
  isHistoryLoading: boolean;
  onViewDetail: (historyId: string) => void;
  onCreateNew: () => void;
}

export const CustomPoHistoryView: React.FC<CustomPoHistoryViewProps> = ({
  historyData,
  isHistoryLoading,
  onViewDetail,
  onCreateNew,
}) => {
  // For now, we don't need a back button here since it's handled in the parent
  // The parent component (AllPomoduleHistory) handles the navigation
  const handleBack = () => {
    // This will be handled by the parent component
    console.log('Back to main menu - handled by parent');
  };

  return (
    <div className="space-y-6">
      <CustomHistoryList
        historyData={historyData}
        isHistoryLoading={isHistoryLoading}
        onBack={handleBack}
        onViewDetail={onViewDetail}
        onCreateNew={onCreateNew}
      />
    </div>
  );
};
