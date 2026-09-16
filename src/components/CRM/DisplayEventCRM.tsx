import React from 'react';
import GenericTable, {Column} from '../Forms/Table/GenericTable';
import {useDeleteEventCRM} from '@/lib/react-query/queriesAndMutations/cateror/CRM/crm';
import {useNavigate} from '@tanstack/react-router';

interface EventCRMProcess {
  id: string;
  processId: string;
  note: string;
  followUpDate: string | null;
  employeeId: string | null;
  eventId: string;
  images: string | null;
  createdAt: string;
  updatedAt: string;
  process: {
    id: string;
    name: string;
    description: string;
    caterorId: string;
    createdAt: string;
    updatedAt: string;
  };
  employee: null;
}

interface EventData {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  caterorId: string;
  clientId: string;
  pinned: boolean;
  discountGiven: number;
  balance: number;
  finalAmount: number;
  quotationGST: number;
  quotationCGST: number;
  quotationSGST: number;
  paidAmount: number;
  quotationAmount: number;
  createdAt: string;
  isActive: boolean;
  status: string;
  isCrmFinalized: boolean;
  ispaid: boolean;
  EventCrmProcess: EventCRMProcess[];
}

interface DisplayEventCRMProps {
  eventData?: EventData; // Accept the entire event data object
  eventCrmProcessData?: EventCRMProcess[]; // Or accept just the process data
  eventId?: string; // Optional event ID for header display
  eventName?: string; // Optional event name for header display
}

const DisplayEventCRM: React.FC<DisplayEventCRMProps> = ({
  eventData,
  eventCrmProcessData,
  eventId,
  eventName,
}) => {
  const navigate = useNavigate();
  const {mutate: deleteEventCRM} = useDeleteEventCRM();

  // Use the passed data directly - prefer eventData if provided, otherwise use eventCrmProcessData
  const tableData: EventCRMProcess[] =
    eventData?.EventCrmProcess || eventCrmProcessData || [];

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const columns: Column<EventCRMProcess>[] = [
    {
      header: 'Process Name',
      accessor: (row) => (
        <div className="min-w-[150px]">
          <div className="text-gray-900 font-semibold">{row.process.name}</div>
          <div className="text-gray-500 mt-1 text-xs">
            {row.process.description}
          </div>
        </div>
      ),
    },
    {
      header: 'Note',
      accessor: 'note',
      cell: (value) => (
        <div className="max-w-xs" title={value}>
          {value || 'No note'}
        </div>
      ),
    },
    {
      header: 'Follow-up Date',
      accessor: (row) => (
        <div className="text-center">
          {row.followUpDate ? (
            <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
              {formatDate(row.followUpDate)}
            </span>
          ) : (
            <span className="bg-gray-100 text-gray-600 inline-flex items-center rounded-full px-2 py-1 text-xs font-medium">
              Not set
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'Created',
      accessor: (row) => (
        <div className="text-gray-600 text-sm">
          {formatDateTime(row.createdAt)}
        </div>
      ),
    },
    {
      header: 'Last Updated',
      accessor: (row) => (
        <div className="text-gray-600 text-sm">
          {formatDateTime(row.updatedAt)}
        </div>
      ),
    },
  ];

  const handleDelete = (item: EventCRMProcess) => {
    if (window.confirm('Are you sure you want to delete this CRM process?')) {
      deleteEventCRM(item.id);
    }
  };

  const handleEdit = (item: EventCRMProcess) => {
    navigate({
      to: `/eventcrm/${item.id}`,
    });
  };

  // Get display name and ID
  const displayEventName = eventData?.name || eventName || 'Selected Event';
  const displayEventId = eventData?.id || eventId;

  // Empty state
  if (!tableData || tableData.length === 0) {
    return (
      <div className="bg-gray-50 border-gray-300 flex flex-col items-center justify-center rounded-lg border border-dashed p-8">
        <div className="text-gray-400 mb-4 text-6xl">📊</div>
        <p className="text-gray-500 mb-2 text-lg font-semibold">
          No CRM Processes Found
        </p>
        <p className="text-gray-400 mb-4 text-center">
          No CRM processes have been added for this event yet.
        </p>
        <div className="text-gray-500 mt-2 text-xs">
          Event: {displayEventName}
          {displayEventId && ` (ID: ${displayEventId})`}
        </div>
      </div>
    );
  }

  return (
    <div className="border-gray-200 rounded-lg border bg-white p-6 shadow-lg">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-gray-800 text-2xl font-bold">CRM Processes</h2>
          <p className="text-gray-600 mt-1">
            {displayEventName}
            {displayEventId && (
              <span className="text-gray-400 ml-2 text-sm">
                (ID: {displayEventId})
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
            {tableData.length}{' '}
            {tableData.length === 1 ? 'process' : 'processes'}
          </span>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        <div className="rounded-lg bg-blue-50 p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {tableData.length}
          </div>
          <div className="text-sm text-blue-800">Total Processes</div>
        </div>
        <div className="rounded-lg bg-green-50 p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {tableData.filter((item) => item.followUpDate).length}
          </div>
          <div className="text-sm text-green-800">With Follow-up</div>
        </div>
        <div className="rounded-lg bg-purple-50 p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">
            {new Set(tableData.map((item) => item.process.name)).size}
          </div>
          <div className="text-sm text-purple-800">Unique Processes</div>
        </div>
      </div>

      <GenericTable
        data={tableData}
        columns={columns}
        action
        onDelete={handleDelete}
        onEdit={handleEdit}
      />

      {/* Additional Information */}
      <div className="border-gray-200 mt-6 border-t pt-4">
        <div className="text-gray-600 text-sm">
          <p>
            <strong>Event Status:</strong> {eventData?.status || 'N/A'}
          </p>
          <p>
            <strong>Created:</strong>{' '}
            {eventData ? formatDateTime(eventData.createdAt) : 'N/A'}
          </p>
          {eventData?.finalAmount && (
            <p>
              <strong>Final Amount:</strong> ₹
              {eventData.finalAmount.toLocaleString()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DisplayEventCRM;
