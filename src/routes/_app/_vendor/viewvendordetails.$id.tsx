/* eslint-disable */
import {useEffect, useState} from 'react';
import {api} from '@/utils/axios';
import {createFileRoute} from '@tanstack/react-router';
import VendorPopup from '@/components/Popup/VendorPopup';

// -------------------
// Types
// -------------------
interface EventData {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  caterorId: string;
  clientId: string;
  discountGiven: number;
  balance: number;
  finalAmount: number;
  paidAmount: number;
  quotationAmount: number;
  createdAt: string;
  isActive: boolean;
  status: string;
  ispaid: boolean;
}

interface SubEventData {
  id: string;
  name: string;
  expectedPeople: number;
  note: string | null;
  time: string;
  date: string;
  address: string;
  packageId: string | null;
  finalAmount: number;
  actualPeople: number | null;
  eventId: string;
  discountGiven: number;
  expectedCost: number;
  createdAt: string;
  profit: number;
  qrDesignId: string;
  event: EventData;
}

interface ManpowerRole {
  id: string;
  name: string;
  caterorId: string;
}

interface ManpowerItem {
  id: string;
  manpowerVendorId: string;
  quantity: number;
  rate: number;
  status: string;
  manpowerRoleId: string;
  paidAmount: number;
  subEventId: string;
  createdAt: string;
  subEvent: SubEventData;
  manpowerRole: ManpowerRole;
}

interface VendorData {
  id: string;
  name: string;
  phone: string;
  address: string;
  email: string | null;
  caterorId: string;
  createdAt: string;
  updatedAt: string;
  manpowerId: string | null;
  manpower: ManpowerItem[];
}

function VendorDetails({id}: {id: string}) {
  const [data, setData] = useState<VendorData | null>(null);

  const [popupOpen, setPopupOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (id) {
        try {
          const response = await api.get<VendorData>(
            `/cateror/vendors/history/${id}`,
          );
          setData(response.data);
        } catch (error) {
          console.error('Error fetching vendor data:', error);
        }
      }
    };
    fetchData();
  }, [id]);

  console.log('response', data);

  const handlePayClick = (event: any) => {
    console.log('eventttt', event);
    setSelectedEvent(event);
    setPopupOpen(true);
  };

  if (!data) return <p>Loading...</p>;

  // 🔹 Group manpower by Event
  const groupedByEvent = data.manpower.reduce(
    (acc: any, item) => {
      const event = item.subEvent?.event;
      if (!event) return acc;

      if (!acc[event.id]) {
        acc[event.id] = {
          eventId: event.id,

          eventName: event.name,
          startDate: event.startDate,
          endDate: event.endDate,
          rows: [],
        };
      }

      acc[event.id].rows.push({
        id: item.subEvent.id,
        date: new Intl.DateTimeFormat('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }).format(new Date(item.subEvent.date)),
        subEvent: item.subEvent.name,
        role: item.manpowerRole?.name || '-',
        manpowerId: item.id,
        paidAmount: item.paidAmount,
        quantity: item.quantity,
        rate: item.rate,
        total: item.quantity * item.rate,
        status: item.status,
      });

      return acc;
    },
    {} as Record<string, any>,
  );

  console.log('groped man power', groupedByEvent);

  const handlePopupSubmit = (formData: {
    subEventId: string;
    amount: number;
  }) => {
    console.log(
      'Paying vendor:',
      formData,
      'for event:',
      selectedEvent?.eventId,
    );
    // 🔹 Call API to pay vendor here
    setPopupOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Vendor Info Card */}
      <div className="rounded bg-white p-4 shadow dark:bg-black">
        <h1 className="mb-2 text-xl font-bold">{data.name}</h1>
        <p>
          <strong>Phone:</strong> {data.phone}
        </p>
        <p>
          <strong>Address:</strong> {data.address}
        </p>
        <p>
          <strong>Email:</strong> {data.email || 'N/A'}
        </p>
      </div>

      {/* Manpower History Table */}
      <div className="overflow-x-auto rounded bg-white p-4 shadow dark:bg-black">
        <h2 className="mb-4 text-lg font-semibold">Vendor History</h2>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-2 text-xs uppercase dark:bg-meta-4">
              <th className="text-gray-100 p-2">Event Dates</th>
              <th className="text-gray-100 p-2">Event Name</th>
              <th className="text-gray-100 p-2">Sub Event</th>
              <th className="text-gray-100 p-2">Date</th>
              <th className="text-gray-100 p-2">Role</th>
              <th className="text-gray-100 p-2">Quantity</th>
              <th className="text-gray-100 p-2">Rate</th>
              <th className="text-gray-100 p-2">Paid Amount</th>

              <th className="text-gray-100 p-2">Total</th>
              <th className="text-gray-100 p-2">Pending Amount</th>

              <th className="text-gray-100 p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {Object.values(groupedByEvent).map((event: any) => (
              <>
                {event.rows.map((row: any, index: number) => (
                  <tr
                    key={`${event.eventId}-${index}`}
                    className="border-gray-200 border-b"
                  >
                    {/* Event Dates with rowSpan */}
                    {index === 0 && (
                      <td
                        rowSpan={event.rows.length}
                        className="border-gray-200 border-b p-2 text-center align-top"
                      >
                        {new Intl.DateTimeFormat('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        }).format(new Date(event.startDate))}{' '}
                        →{' '}
                        {new Intl.DateTimeFormat('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        }).format(new Date(event.endDate))}
                      </td>
                    )}

                    {/* Event Name with rowSpan */}
                    {index === 0 && (
                      <td
                        rowSpan={event.rows.length}
                        className="border-gray-200 border-b p-2 text-center align-top font-semibold"
                      >
                        {event.eventName}
                      </td>
                    )}

                    <td className="p-2">{row.subEvent}</td>
                    <td className="p-2">{row.date}</td>
                    <td className="p-2">{row.role}</td>
                    <td className="p-2 text-right">{row.quantity}</td>
                    <td className="p-2 text-right">{row.rate}</td>
                    <td className="p-2 text-right">{row.paidAmount}</td>
                    <td className="p-2 text-right">{row.total}</td>
                    <td className="p-2 text-right">
                      {row.total - row.paidAmount}
                    </td>

                    <td className="p-2 text-right">
                      <button
                        onClick={() => handlePayClick(event)}
                        className="rounded bg-blue-600 px-4 py-1 text-white hover:bg-blue-700"
                      >
                        Pay
                      </button>
                    </td>
                  </tr>
                ))}
              </>
            ))}
          </tbody>
        </table>
      </div>

      <VendorPopup
        id={
          selectedEvent && selectedEvent.rows.length > 0
            ? selectedEvent.rows[0].manpowerId
            : null
        }
        isOpen={popupOpen}
        onClose={() => setPopupOpen(false)}
        onSubmit={handlePopupSubmit}
        subEvents={
          selectedEvent
            ? selectedEvent.rows.map((r: any) => ({
                id: r.id,
                name: r.subEvent,
              }))
            : []
        }
      />
    </div>
  );
}

function VendorDetailsRoute() {
  const {id} = Route.useParams();
  return <VendorDetails id={id} />;
}

export const Route = createFileRoute('/_app/_vendor/viewvendordetails/$id')({
  component: VendorDetailsRoute,
});
