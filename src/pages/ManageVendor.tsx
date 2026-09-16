import React, {useState, useEffect} from 'react';
import AddVendorPo from '@/components/POModule/AddVendorPo';
import AdditionalVendors from '@/components/FoodVender/Additionalvendors';
import DisplayVendorManagement from '@/components/DisplayVendor/DisplayVendorManagement';
import AddDisposalVendor from '@/components/DisposalPo/AddDisposalVendor';
import {useNavigate, useLocation} from '@tanstack/react-router';

type TabType = 'po' | 'additional' | 'management' | 'disposal';

const ManageVendor: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<TabType>('po');

  // Parse tab from URL query parameter
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tabFromUrl = searchParams.get('tab') as TabType;

    if (
      tabFromUrl &&
      ['po', 'additional', 'management', 'disposal'].includes(tabFromUrl)
    ) {
      setActiveTab(tabFromUrl);
    }
  }, [location.search]);

  // Function to handle tab change with URL update
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    // Update URL with tab query parameter
    navigate({
      to: '/vendormanagement',
      search: {tab},
    });
  };

  return (
    <div className="mx-auto space-y-6">
      {/* Tabs */}
      <div className="mb-8 flex overflow-x-auto border-b border-stroke">
        <button
          className={`relative px-4 text-lg font-medium transition-all duration-200 ${
            activeTab === 'po'
              ? 'border-b-2 border-blue-600 bg-blue-50 text-blue-600'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
          onClick={() => handleTabChange('po')}
        >
          <div className="flex items-center gap-2 py-1 text-sm">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 3a1 1 0 000 2h11a1 1 0 100-2H3zM3 7a1 1 0 000 2h7a1 1 0 100-2H3zM3 11a1 1 0 100 2h4a1 1 0 100-2H3z" />
            </svg>
            Raw Material Vendor
          </div>
        </button>

        <button
          className={`relative px-4 text-lg font-medium transition-all duration-200 ${
            activeTab === 'additional'
              ? 'border-b-2 border-blue-600 bg-green-50 text-blue-600'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
          onClick={() => handleTabChange('additional')}
        >
          <div className="flex items-center gap-2 py-1 text-sm">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
            </svg>
            Additional Vendors
          </div>
        </button>

        <button
          className={`relative px-4 text-lg font-medium transition-all duration-200 ${
            activeTab === 'management'
              ? 'border-b-2 border-blue-600 bg-purple-50 text-blue-600'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
          onClick={() => handleTabChange('management')}
        >
          <div className="flex items-center gap-2 py-1 text-sm">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 3h12a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1z" />
            </svg>
            Display Vendor
          </div>
        </button>
        <button
          className={`relative px-4 text-lg font-medium transition-all duration-200 ${
            activeTab === 'disposal'
              ? 'border-b-2 border-blue-600 bg-purple-50 text-blue-600'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
          onClick={() => handleTabChange('disposal')}
        >
          <div className="flex items-center gap-2 py-1 text-sm">
            <svg
              className="h-5 w-5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Disposal Vendor
          </div>
        </button>
      </div>

      {/* Content */}
      <div>
        {activeTab === 'po' && <AddVendorPo />}
        {activeTab === 'additional' && <AdditionalVendors />}
        {activeTab === 'management' && <DisplayVendorManagement />}
        {activeTab === 'disposal' && <AddDisposalVendor />}
      </div>
    </div>
  );
};

export default ManageVendor;
