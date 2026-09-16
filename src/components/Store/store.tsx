import React, {useState, useEffect} from 'react';
import POInward from './inword/POInward';
import CustomInward from './inword/CustomInward';
import RawMaterialReturnInward from './inword/RawMaterialReturnInward';
import EventsOutward from './EventsOutward';
import WastageOutward from './WastageOutward';
import InwordHistory from './inword/InwordHistory';
import OutwordHistory from './outword/OutwordHistory';
import RawMaterialListdata from './RawMaterialListdata';
import {useAuthContext} from '@/context/AuthContext';

type MainTab =
  | 'INVENTORY'
  | 'INWORD'
  | 'OUTWORD'
  | 'INWORD HISTORY'
  | 'OUTWORD HISTORY';

type InwordSubtype = 'PO' | 'Custom' | 'Raw Material Return' | '';
type OutwordSubtype = 'Events' | 'Wastage' | '';

const Store: React.FC = () => {
  const {user} = useAuthContext();
  const role = user?.role;

  // Get all individual tab restrictions
  const storeInventoryRestriction = user?.employeeRestriction?.storeInventory;
  const inwordStoreRestriction = user?.employeeRestriction?.inwordStore;
  const outwordStoreRestriction = user?.employeeRestriction?.outwordStore;
  const inwordHistoryRestriction = user?.employeeRestriction?.inwordHistory;
  const outwordHistoryRestriction = user?.employeeRestriction?.outwordHistory;

  // Determine if user has access to each tab
  const hasInventoryAccess =
    role === 'CATEROR' ||
    storeInventoryRestriction === 'EDIT' ||
    storeInventoryRestriction === 'VIEW';

  const hasInwordAccess =
    role === 'CATEROR' ||
    inwordStoreRestriction === 'EDIT' ||
    inwordStoreRestriction === 'VIEW';

  const hasOutwordAccess =
    role === 'CATEROR' ||
    outwordStoreRestriction === 'EDIT' ||
    outwordStoreRestriction === 'VIEW';

  const hasInwordHistoryAccess =
    role === 'CATEROR' ||
    inwordHistoryRestriction === 'EDIT' ||
    inwordHistoryRestriction === 'VIEW';

  const hasOutwordHistoryAccess =
    role === 'CATEROR' ||
    outwordHistoryRestriction === 'EDIT' ||
    outwordHistoryRestriction === 'VIEW';

  // Determine edit access for each tab
  const hasInventoryEdit =
    role === 'CATEROR' || storeInventoryRestriction === 'EDIT';
  const hasInwordEdit = role === 'CATEROR' || inwordStoreRestriction === 'EDIT';
  const hasOutwordEdit =
    role === 'CATEROR' || outwordStoreRestriction === 'EDIT';

  // Get initial tab - first available tab with access
  const getInitialTab = () => {
    if (hasInventoryAccess) return 'INVENTORY';
    if (hasInwordAccess) return 'INWORD';
    if (hasOutwordAccess) return 'OUTWORD';
    if (hasInwordHistoryAccess) return 'INWORD HISTORY';
    if (hasOutwordHistoryAccess) return 'OUTWORD HISTORY';
    return 'INVENTORY'; // fallback
  };

  const [activeTab, setActiveTab] = useState<MainTab>(getInitialTab());
  const [activeSubtype, setActiveSubtype] = useState<string>('');

  // Define which tabs should be visible based on user access for each tab
  const getVisibleTabs = () => {
    const tabs: {tab: MainTab; hasAccess: boolean}[] = [
      {tab: 'INVENTORY', hasAccess: hasInventoryAccess},
      {tab: 'INWORD', hasAccess: hasInwordAccess},
      {tab: 'OUTWORD', hasAccess: hasOutwordAccess},
      {tab: 'INWORD HISTORY', hasAccess: hasInwordHistoryAccess},
      {tab: 'OUTWORD HISTORY', hasAccess: hasOutwordHistoryAccess},
    ];

    return tabs.filter((t) => t.hasAccess).map((t) => t.tab);
  };

  const visibleTabs = getVisibleTabs();

  // Check if current subtype should be visible
  const getVisibleSubtypes = () => {
    if (activeTab === 'INWORD') {
      // For INWORD tab, check if user has at least VIEW access
      return hasInwordAccess ? ['PO', 'Custom', 'Raw Material Return'] : [];
    } else if (activeTab === 'OUTWORD') {
      // For OUTWORD tab, check if user has at least VIEW access
      return hasOutwordAccess ? ['Events', 'Wastage'] : [];
    }
    return [];
  };

  const visibleSubtypes = getVisibleSubtypes();

  const isHistoryTab =
    activeTab === 'INWORD HISTORY' || activeTab === 'OUTWORD HISTORY';
  const needsSubtype = activeTab === 'INWORD' || activeTab === 'OUTWORD';

  // Reset subtype if current one is not in visible subtypes
  useEffect(() => {
    if (
      activeSubtype &&
      visibleSubtypes.length > 0 &&
      !visibleSubtypes.includes(activeSubtype)
    ) {
      setActiveSubtype('');
    }
  }, [visibleSubtypes, activeSubtype]); // Now visibleSubtypes is defined before this useEffect

  // Reset subtype when switching main tabs
  const handleTabChange = (tab: MainTab) => {
    setActiveTab(tab);
    if (tab !== 'INWORD' && tab !== 'OUTWORD') {
      setActiveSubtype('');
    }
  };

  // Ensure activeTab is valid for current user
  useEffect(() => {
    if (!visibleTabs.includes(activeTab)) {
      setActiveTab(visibleTabs[0] || getInitialTab());
    }
  }, [visibleTabs, activeTab]);

  const renderContent = () => {
    switch (activeTab) {
      case 'INVENTORY':
        return <RawMaterialListdata hasEditAccess={hasInventoryEdit} />; // Fixed: was using hasInwordEdit

      case 'INWORD':
        switch (activeSubtype) {
          case 'PO':
            return <POInward hasEditAccess={hasInwordEdit} />;
          case 'Custom':
            return <CustomInward hasEditAccess={hasInwordEdit} />;
          case 'Raw Material Return':
            return <RawMaterialReturnInward hasEditAccess={hasInwordEdit} />;
          default:
            return (
              <div className="text-gray-500 p-4">
                Please select an Inward type
              </div>
            );
        }

      case 'OUTWORD':
        switch (activeSubtype) {
          case 'Events':
            return <EventsOutward hasEditAccess={hasOutwordEdit} />;
          case 'Wastage':
            return <WastageOutward hasEditAccess={hasOutwordEdit} />;
          default:
            return (
              <div className="text-gray-500 p-4">
                Please select an Outward type
              </div>
            );
        }

      case 'INWORD HISTORY':
        return <InwordHistory hasEditAccess={hasInwordEdit} />;

      case 'OUTWORD HISTORY':
        return <OutwordHistory hasEditAccess={hasOutwordEdit} />;

      default:
        return null;
    }
  };

  // If no tabs are visible (no access), show message
  if (visibleTabs.length === 0) {
    return (
      <div className="rounded-lg bg-white p-6 shadow-md dark:bg-boxdark">
        <div className="p-8 text-center">
          <h3 className="text-gray-700 dark:text-gray-300 mb-2 text-xl font-semibold">
            Access Denied
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            You don't have permission to access the Store module.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-white p-6 shadow-md dark:bg-boxdark">
      {/* Main Tabs */}
      <div className="border-gray-200 dark:border-gray-700 mb-6 flex overflow-x-auto border-b">
        {visibleTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => handleTabChange(tab)}
            className={`px-6 py-2 text-sm font-medium ${
              activeTab === tab
                ? 'border-b-2 border-primary text-primary'
                : 'text-gray-500 hover:text-primary'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {needsSubtype && (
        <div className="mb-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block font-medium">Select Type</label>
              <select
                value={activeSubtype}
                onChange={(e) => setActiveSubtype(e.target.value)}
                className="border-gray-300 dark:border-gray-600 w-full rounded border p-2 text-sm dark:bg-strokedark"
                disabled={visibleSubtypes.length === 0}
              >
                <option value="">Select Type</option>
                {activeTab === 'INWORD' &&
                  visibleSubtypes.map((subtype) => (
                    <option key={subtype} value={subtype}>
                      {subtype === 'PO'
                        ? 'PO (Purchase Order)'
                        : subtype === 'Custom'
                          ? 'Custom'
                          : 'Raw Material Return'}
                    </option>
                  ))}
                {activeTab === 'OUTWORD' &&
                  visibleSubtypes.map((subtype) => (
                    <option key={subtype} value={subtype}>
                      {subtype}
                    </option>
                  ))}
              </select>
              {visibleSubtypes.length === 0 && (
                <p className="mt-1 text-sm text-red-500">
                  You don't have permission to access {activeTab} types
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Render Content */}
      {renderContent()}
    </div>
  );
};

export default Store;
