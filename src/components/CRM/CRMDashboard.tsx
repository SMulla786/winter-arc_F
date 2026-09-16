/* eslint-disable @typescript-eslint/no-explicit-any */
import React, {useState, useMemo, useRef, useEffect} from 'react';
import {useNavigate} from '@tanstack/react-router';
import {useGetAllEventsCrm} from '@/lib/react-query/queriesAndMutations/cateror/CRM/crm';
import {
  FiCalendar,
  FiFilter,
  FiDollarSign,
  FiTrendingUp,
  FiClock,
  FiX,
  FiAlertCircle,
} from 'react-icons/fi';
import AddEventCRMModal from './AddEventCRMModal';
import GenericTable from '../Forms/Table/GenericTable';
import {useAuthContext} from '@/context/AuthContext';

const formatDate = (dateString: string | null) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'N/A';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const formatDateTime = (dateString: string | null) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'N/A';

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;

  return `${day}/${month}/${year} ${hours}:${minutes} ${ampm}`;
};

const formatCurrency = (amount: string | number | null) => {
  if (!amount) return '₹0';
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return `₹${num.toLocaleString('en-IN')}`;
};

// Get first day of current month
const getFirstDayOfCurrentMonth = () => {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  return firstDay.toISOString().split('T')[0];
};

// Get last day of current month
const getLastDayOfCurrentMonth = () => {
  const now = new Date();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return lastDay.toISOString().split('T')[0];
};

// ──────────────────────────────────────────────────────────────
// Small Filter Popup Component
// ──────────────────────────────────────────────────────────────
interface FilterPopupProps {
  fromDate: string;
  toDate: string;
  showMissedFollowups: boolean;
  setFromDate: (date: string) => void;
  setToDate: (date: string) => void;
  setShowMissedFollowups: (value: boolean) => void;
  applyFilters: () => void;
  resetFilters: () => void;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}

const FilterPopup: React.FC<FilterPopupProps> = ({
  fromDate,
  toDate,
  showMissedFollowups,
  setFromDate,
  setToDate,
  setShowMissedFollowups,
  applyFilters,
  resetFilters,
  onClose,
  triggerRef,
}) => {
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose, triggerRef]);

  // Calculate position
  const [position, setPosition] = useState({top: 0, left: 0});

  useEffect(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY + 8,
        left: Math.min(rect.left + window.scrollX, window.innerWidth - 320),
      });
    }
  }, [triggerRef]);

  return (
    <div className="fixed inset-0 z-40" style={{pointerEvents: 'none'}}>
      <div
        ref={popupRef}
        className="absolute w-80 rounded-lg border border-stroke bg-white shadow-lg dark:border-strokedark dark:bg-boxdark"
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
          pointerEvents: 'auto',
        }}
      >
        {/* Header */}
        <div className="border-b border-stroke px-4 py-3 dark:border-strokedark">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FiFilter className="text-gray-600 dark:text-gray-300 text-sm" />
              <h3 className="text-gray-800 text-sm font-semibold dark:text-white">
                Filter Events
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-lg transition-colors"
            >
              <FiX />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="mb-4 space-y-4">
            {/* Missed Follow-ups Filter */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/30">
                  <FiAlertCircle className="text-sm text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={showMissedFollowups}
                      onChange={(e) => setShowMissedFollowups(e.target.checked)}
                      className="border-gray-300 dark:border-gray-600 rounded text-primary focus:ring-2 focus:ring-primary focus:ring-offset-0"
                    />
                    <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">
                      Show Missed Follow-ups
                    </span>
                  </label>
                  <p className="text-gray-500 dark:text-gray-400 mt-1 text-xs">
                    Events with past follow-up dates
                  </p>
                </div>
              </div>
            </div>

            {/* Date Range Filter */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FiCalendar className="text-gray-500 dark:text-gray-400 text-sm" />
                <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">
                  Date Range
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-700 dark:text-gray-300 mb-1 block text-xs font-medium">
                    From
                  </label>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="w-full rounded border border-stroke bg-white p-2 text-xs outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-form-strokedark dark:bg-form-input dark:text-white"
                    max={toDate || undefined}
                  />
                </div>
                <div>
                  <label className="text-gray-700 dark:text-gray-300 mb-1 block text-xs font-medium">
                    To
                  </label>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="w-full rounded border border-stroke bg-white p-2 text-xs outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-form-strokedark dark:bg-form-input dark:text-white"
                    min={fromDate || undefined}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <button
              onClick={() => {
                resetFilters();
                onClose();
              }}
              className="border-gray-300 bg-gray-50 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 w-full rounded border py-2 text-xs font-medium transition-colors"
            >
              Clear All Filters
            </button>
            <button
              onClick={() => {
                applyFilters();
                onClose();
              }}
              className="w-full rounded bg-primary py-2 text-xs font-medium text-white transition-colors hover:bg-primary/90"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface CRMDashboardProps {
  hasEditAccess?: boolean;
}

/* ────────────────────── Component ────────────────────── */
const CRMDashboard: React.FC<CRMDashboardProps> = ({
  hasEditAccess: propHasEditAccess,
}) => {
  const navigate = useNavigate();
  const {user} = useAuthContext();

  /* ────── UI state ────── */
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [fromDate, setFromDate] = useState<string>(getFirstDayOfCurrentMonth());
  const [toDate, setToDate] = useState<string>(getLastDayOfCurrentMonth());
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [showMissedFollowups, setShowMissedFollowups] = useState(false);
  const filterButtonRef = useRef<HTMLButtonElement>(null);

  // Get user role and restriction
  const restriction = user?.employeeRestriction?.crmdashboardpage;
  const role = user?.role;

  // Determine if user has edit access (use prop if provided, otherwise check context)
  const hasEditAccess =
    propHasEditAccess !== undefined
      ? propHasEditAccess
      : role === 'CATEROR' || restriction === 'EDIT';

  // Determine if user has view access
  const hasViewAccess =
    role === 'CATEROR' || restriction === 'EDIT' || restriction === 'VIEW';

  /* ────── Data & Mutation ────── */
  const {data: eventsData, isLoading, refetch} = useGetAllEventsCrm();

  /* ────── Filtered list with missed follow-up filter ────── */
  const filteredEvents = useMemo(() => {
    if (!eventsData?.data?.data) return [];
    let list = eventsData.data.data;

    // Filter by date range
    list = list.filter((e: any) => {
      const evDate = new Date(e.startDate);
      const from = new Date(fromDate);
      const to = new Date(toDate);
      to.setHours(23, 59, 59, 999);
      return evDate >= from && evDate <= to;
    });

    if (selectedStatus !== 'ALL') {
      list = list.filter((e: any) => e.status === selectedStatus);
    }

    // Filter missed follow-up events
    if (showMissedFollowups) {
      list = list.filter((e: any) => {
        const processes = e.EventCrmProcess || [];
        if (processes.length === 0) return false;

        const latestProcess = [...processes].sort(
          (a: any, b: any) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )[0];

        const followUpDate = latestProcess?.followUpDate;
        if (!followUpDate) return false;

        return new Date(followUpDate) < new Date();
      });
    }

    return list.map((e: any) => ({
      id: e.id,
      name: e.name,
      startDate: e.startDate,
      endDate: e.endDate,
      status: e.status,
      crmPriority: e.crmPriority,
      pinned: e.pinned,
      client: e.client,
      finalAmount: e.finalAmount,
      paidAmount: e.paidAmount,
      balance: e.balance,
      quotationAmount: e.quotationAmount,
      discountGiven: e.discountGiven,
      tentativeAmount: e.tentativeAmount,
      cancelledReason: e.cancelledReason,
      createdAt: e.createdAt,
      EventCrmProcess: e.EventCrmProcess || [],
      clientName: e.client?.user?.fullname,
      phoneNumber: e.client?.user?.phoneNumber,
      priority: e.crmPriority,
      isMissedFollowup: (() => {
        const processes = e.EventCrmProcess || [];
        if (processes.length === 0) return false;
        const latestProcess = [...processes].sort(
          (a: any, b: any) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )[0];
        const followUpDate = latestProcess?.followUpDate;
        return followUpDate ? new Date(followUpDate) < new Date() : false;
      })(),
    }));
  }, [eventsData, selectedStatus, fromDate, toDate, showMissedFollowups]);

  // Status counts based on filtered data
  const statusCounts = useMemo(() => {
    if (!eventsData?.data?.data)
      return {
        ENQUIRY: 0,
        FINALIZED: 0,
        CANCELED: 0,
        PREPARATION: 0,
        PAID: 0,
        ALL: 0,
      };

    const dateFilteredEvents = eventsData.data.data.filter((e: any) => {
      const evDate = new Date(e.startDate);
      const from = new Date(fromDate);
      const to = new Date(toDate);
      to.setHours(23, 59, 59, 999);
      return evDate >= from && evDate <= to;
    });

    const c = {
      ENQUIRY: 0,
      FINALIZED: 0,
      CANCELED: 0,
      PREPARATION: 0,
      PAID: 0,
      ALL: 0,
    };
    dateFilteredEvents.forEach((e: any) => {
      if (Object.prototype.hasOwnProperty.call(c, e.status)) {
        c[e.status as keyof typeof c]++;
      }
      c.ALL++;
    });
    return c;
  }, [eventsData, fromDate, toDate]);

  const totalPaid = useMemo(
    () =>
      filteredEvents.reduce(
        (sum, item) => sum + (parseFloat(item.paidAmount || '0') || 0),
        0,
      ),
    [filteredEvents],
  );

  const totalPending = useMemo(
    () =>
      filteredEvents.reduce(
        (sum, item) => sum + (parseFloat(item.balance || '0') || 0),
        0,
      ),
    [filteredEvents],
  );

  // Calculate conversion rate (FINALIZED / ENQUIRY)
  const conversionRate = useMemo(() => {
    const enquiries = statusCounts.ENQUIRY;
    const finalized = statusCounts.FINALIZED;
    if (enquiries === 0) return 0;
    return Math.round((finalized / enquiries) * 100);
  }, [statusCounts]);

  /* ────── Handlers ────── */
  const openAddEvent = () => {
    if (!hasEditAccess) {
      alert('You do not have permission to add events');
      return;
    }
    setShowAddEvent(true);
  };

  const handleStatusTab = (status: string) => setSelectedStatus(status);

  const openEdit = (event: any) => {
    if (!hasViewAccess) {
      alert('You do not have permission to view event details');
      return;
    }
    navigate({
      to: `/events/${event.id}`,
      search: {tab: 'crm'},
    });
  };

  const applyFilters = () => {
    setShowFilterPopup(false);
  };

  const resetFilters = () => {
    setFromDate(getFirstDayOfCurrentMonth());
    setToDate(getLastDayOfCurrentMonth());
    setShowMissedFollowups(false);
  };

  const hasActiveFilters =
    fromDate !== getFirstDayOfCurrentMonth() ||
    toDate !== getLastDayOfCurrentMonth() ||
    showMissedFollowups ||
    selectedStatus !== 'ALL';

  // Define columns for GenericTable
  const columns: Column<any>[] = [
    {
      header: 'Event Dates',
      accessor: 'startDate',
      sortable: true,
      render: (item) => (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-sm">
            <FiCalendar className="text-gray-400 h-3 w-3" />
            <span className="font-medium">{formatDate(item.startDate)}</span>
          </div>
          <div className="text-gray-500 text-xs">
            to {formatDate(item.endDate)}
          </div>
        </div>
      ),
    },
    {
      header: 'Event Name',
      accessor: 'name',
      sortable: true,
      render: (item) => (
        <button
          onClick={() => openEdit(item)}
          disabled={!hasViewAccess}
          className={`text-left font-semibold transition-colors ${hasViewAccess ? 'hover:text-primary-dark cursor-pointer text-primary hover:underline' : 'text-gray-500 cursor-not-allowed'}`}
        >
          {item.name}
        </button>
      ),
    },
    {
      header: 'Client',
      accessor: 'clientName',
      sortable: true,
      render: (item) => (
        <div className="font-medium">
          {item.client?.user?.fullname || 'N/A'}
        </div>
      ),
    },
    {
      header: 'Phone No.',
      accessor: 'phoneNumber',
      render: (item) => (
        <div className="font-mono text-sm">
          {item.client?.user?.phoneNumber || 'N/A'}
        </div>
      ),
    },
    {
      header: 'Assigned Employee',
      accessor: 'EventCrmProcess',
      render: (item) => {
        const assignedEmployees = (item.EventCrmProcess || [])
          .filter((p: any) => p.employee !== null && p.employee !== undefined)
          .map((p: any) => ({
            id: p.employee?.id,
            name:
              p.employee?.user?.fullname ||
              p.employee?.fullname ||
              'Unknown Employee',
          }))
          .filter(
            (e: any, i: number, self: any[]) =>
              i === self.findIndex((x: any) => x.id === e.id),
          );

        return assignedEmployees.length ? (
          <div className="space-y-2">
            {assignedEmployees.slice(0, 2).map((e: any, i: number) => (
              <div
                key={e.id || i}
                className="text-gray-900 px-3 py-1 text-xs font-medium"
              >
                {e.name}
              </div>
            ))}
            {assignedEmployees.length > 2 && (
              <div className="text-gray-500 text-xs">
                +{assignedEmployees.length - 2} more
              </div>
            )}
          </div>
        ) : (
          <span className="text-gray-400 text-sm">Not Assigned</span>
        );
      },
    },
    {
      header: 'Process',
      accessor: 'EventCrmProcess',
      render: (item: any) => {
        const processes = item.EventCrmProcess || [];
        const latestProcess =
          processes.length > 0
            ? [...processes].sort(
                (a: any, b: any) =>
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime(),
              )[0]
            : null;

        return latestProcess ? (
          <div className="flex flex-col gap-1">
            <div className="text-gray-900 text-sm font-medium">
              {latestProcess.process?.name || 'N/A'}
            </div>
          </div>
        ) : (
          <span className="text-gray-400 text-sm">—</span>
        );
      },
    },
    {
      header: 'Follow Up Date & Time',
      accessor: 'EventCrmProcess',
      render: (item) => {
        const processes = item.EventCrmProcess || [];
        const followUpDate =
          processes.length > 0
            ? [...processes].sort(
                (a: any, b: any) =>
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime(),
              )[0]?.followUpDate
            : null;

        return followUpDate ? (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <FiCalendar className="h-3 w-3 text-blue-500" />
              <span
                className={`text-sm font-semibold ${item.isMissedFollowup ? 'text-gray-900' : 'text-blue-600'}`}
              >
                {formatDateTime(followUpDate)}
              </span>
            </div>
            {/* Show if follow-up is missed */}
            {item.isMissedFollowup && (
              <div className="flex items-center gap-1">
                <FiAlertCircle className="h-3 w-3 text-red-500" />
                <span className="text-xs font-medium text-red-600">
                  Missed Follow-up
                </span>
              </div>
            )}
          </div>
        ) : (
          <span className="text-gray-400 text-sm">—</span>
        );
      },
    },
    {
      header: 'Priority',
      accessor: 'crmPriority',
      sortable: true,
      render: (item) => (
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
            item.crmPriority === 'HIGH'
              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
              : item.crmPriority === 'MEDIUM'
                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
          }`}
        >
          {item.crmPriority || 'LOW'}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      sortable: true,
      render: (item) => (
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
            item.status === 'FINALIZED'
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
              : item.status === 'CANCELED'
                ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                : item.status === 'ENQUIRY'
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                  : item.status === 'PREPARATION'
                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
                    : item.status === 'PAID'
                      ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
          }`}
        >
          {item.status}
        </span>
      ),
    },
  ];

  // If user has no access at all
  if (!hasViewAccess) {
    return (
      <div className="w-full min-w-0 space-y-6 p-4 sm:p-6">
        <div className="p-8 text-center">
          <div className="mb-4 flex justify-center">
            <FiCalendar className="text-gray-400 h-16 w-16" />
          </div>
          <h3 className="text-gray-700 dark:text-gray-300 mb-2 text-xl font-semibold">
            Access Denied
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            You don't have permission to access CRM Dashboard.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
          <p className="text-gray-500 text-lg">Loading CRM Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <h1 className="text-gray-900 text-xl font-bold dark:text-white sm:text-2xl">
            CRM Dashboard
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* Filter Badge (if filters applied) */}
          {hasActiveFilters && hasViewAccess && (
            <div className="flex items-center gap-2 rounded-full bg-yellow-50 px-3 py-1.5 dark:bg-yellow-900/20">
              <FiFilter className="text-sm text-yellow-600 dark:text-yellow-400" />
              <span className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
                {filteredEvents.length} events
              </span>
              <button
                onClick={resetFilters}
                className="text-sm text-yellow-600 hover:text-yellow-800 dark:hover:text-yellow-200"
              >
                ×
              </button>
            </div>
          )}

          {/* Filter Button - Only show if user has view access */}
          {hasViewAccess && (
            <button
              ref={filterButtonRef}
              onClick={() => setShowFilterPopup(!showFilterPopup)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2.5 font-medium transition-colors ${
                hasActiveFilters
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              <FiFilter className="text-sm" />
              Filter
              {hasActiveFilters && (
                <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-bold text-blue-600">
                  !
                </span>
              )}
            </button>
          )}

          {/* Add Process Button - Only show if user has edit access */}
          {hasEditAccess && (
            <button
              onClick={() => navigate({to: '/crm'})}
              className="hover:bg-primary-dark flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 font-semibold text-white shadow-lg transition-all hover:shadow-xl"
            >
              <FiCalendar className="text-sm" />
              Add Process
            </button>
          )}

          {/* Add Event Button - Only show if user has edit access */}
          {hasEditAccess && (
            <button
              onClick={openAddEvent}
              className="hover:bg-primary-dark flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 font-semibold text-white shadow-lg transition-all hover:shadow-xl"
            >
              <FiCalendar className="text-sm" />
              Add New Event
            </button>
          )}
        </div>
      </div>

      {/* Filter Popup */}
      {showFilterPopup && (
        <FilterPopup
          fromDate={fromDate}
          toDate={toDate}
          showMissedFollowups={showMissedFollowups}
          setFromDate={setFromDate}
          setToDate={setToDate}
          setShowMissedFollowups={setShowMissedFollowups}
          applyFilters={applyFilters}
          resetFilters={resetFilters}
          onClose={() => setShowFilterPopup(false)}
          triggerRef={filterButtonRef}
        />
      )}

      {/* Status Tabs - Minimal Height */}
      {hasViewAccess && (
        <div className="overflow-x-auto rounded-lg border border-stroke bg-white shadow-sm dark:border-strokedark dark:bg-boxdark">
          <div className="flex min-w-max">
            {[
              {
                key: 'ALL',
                label: 'All',
                count: statusCounts.ALL,
                color: 'bg-gray-500',
              },
              {
                key: 'ENQUIRY',
                label: 'Enquiry',
                count: statusCounts.ENQUIRY,
                color: 'bg-blue-500',
              },
              {
                key: 'FINALIZED',
                label: 'Finalized',
                count: statusCounts.FINALIZED,
                color: 'bg-green-500',
              },
              {
                key: 'CANCELED',
                label: 'Canceled',
                count: statusCounts.CANCELED,
                color: 'bg-red-500',
              },
              {
                key: 'PREPARATION',
                label: 'Preparation',
                count: statusCounts.PREPARATION,
                color: 'bg-purple-500',
              },
              {
                key: 'PAID',
                label: 'Paid',
                count: statusCounts.PAID,
                color: 'bg-indigo-500',
              },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setSelectedStatus(t.key)}
                className={`flex flex-1 flex-col items-center px-1.5 py-0.5 transition-all ${
                  selectedStatus === t.key
                    ? 'bg-primary text-white'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-meta-4'
                } min-w-[60px]`}
              >
                {/* <div className={`h-1 w-1 rounded-full ${t.color} mb-0.5`}></div> */}
                <span className="text-[10px] font-medium">{t.label}</span>
                <span
                  className={`text-[11px] font-bold ${selectedStatus === t.key ? 'text-white' : 'text-gray-900 dark:text-white'}`}
                >
                  {t.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Stats Overview - Only show if user has view access */}
      {hasViewAccess && (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {/* Total Paid Amount */}
          <div className="rounded-lg border border-stroke bg-white p-2 shadow-sm dark:border-strokedark dark:bg-boxdark">
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-green-100 p-1.5 dark:bg-green-900/30">
                <FiDollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-[11px]">
                  Total Paid
                </p>
                <p className="text-gray-900 text-base font-bold dark:text-white">
                  {formatCurrency(totalPaid)}
                </p>
              </div>
            </div>
          </div>

          {/* Pending Amount */}
          <div className="rounded-lg border border-stroke bg-white p-2 shadow-sm dark:border-strokedark dark:bg-boxdark">
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-red-100 p-1.5 dark:bg-red-900/30">
                <FiTrendingUp className="h-4 w-4 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-[11px]">
                  Pending Amount
                </p>
                <p className="text-gray-900 text-base font-bold dark:text-white">
                  {formatCurrency(totalPending)}
                </p>
                <p className="text-[10px] font-medium text-red-600 dark:text-red-400">
                  {filteredEvents.length} events
                </p>
              </div>
            </div>
          </div>

          {/* Conversion Rate */}
          <div className="rounded-lg border border-stroke bg-white p-2 shadow-sm dark:border-strokedark dark:bg-boxdark">
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-blue-100 p-1.5 dark:bg-blue-900/30">
                <FiClock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-[11px]">
                  Conversion Rate
                </p>
                <p className="text-gray-900 text-base font-bold dark:text-white">
                  {conversionRate}%
                </p>
                <p className="text-[10px] font-medium text-blue-600 dark:text-blue-400">
                  Enquiry → Finalized
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Events Table - Only show if user has view access */}
      {hasViewAccess && (
        <GenericTable
          data={filteredEvents}
          columns={columns}
          searchAble={true}
          itemsPerPage={10}
          // Table action buttons (if any) would be controlled by hasEditAccess
          // You can pass action={hasEditAccess} if GenericTable supports it
        />
      )}

      {showAddEvent && hasEditAccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="mx-4 w-full max-w-4xl rounded-2xl bg-white shadow-2xl">
            <div className="max-h-[80vh] overflow-y-auto">
              <AddEventCRMModal
                showModal={showAddEvent}
                onClose={() => setShowAddEvent(false)}
                onSave={() => {
                  setShowAddEvent(false);
                  refetch();
                }}
                selectedDate={new Date(getFirstDayOfCurrentMonth())}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CRMDashboard;
