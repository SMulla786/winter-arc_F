/*eslint-disable*/
import {useEffect, useState, useCallback, useMemo} from 'react';
import {useNavigate} from '@tanstack/react-router';
import GenericTable, {Column} from '@/components/Forms/Table/GenericTable';
import {
  useDeleteClient,
  useGetAllClient,
} from '@/lib/react-query/queriesAndMutations/cateror/client';
import {Loader} from '../Loader/Loader';
import {confirmAlert} from 'react-confirm-alert';
import {useAuthContext} from '@/context/AuthContext';
import {FiMessageCircle} from 'react-icons/fi';
import {useClientCelebrations} from './useClientCelebrations';
import {BsWhatsapp} from 'react-icons/bs';

type Client = {
  id: string;
  fullname: string;
  name: string;
  phoneNumber: string;
  address: string;
  caste: string;
  pendingAmount: string;
  events: string | number;
  billAmt: number;
  birthday?: string | null;
  anniversary?: string | null;
  secondaryPhoneNumber?: string;
  email?: string;
};

type ViewMode = 'all' | 'celebrations' | 'today' | 'upcoming';

const DisplayClient: React.FC = () => {
  const {user} = useAuthContext();
  const restriction = user?.employeeRestriction?.clientPage;
  const role = user?.role;

  const navigate = useNavigate();
  const [clientData, setClientData] = useState<Client[]>([]);
  const [allClientData, setAllClientData] = useState<Client[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('all');

  const {
    data: clientApiData,
    isLoading: isLoadingClients,
    refetch,
    isFetched,
  } = useGetAllClient();

  const {mutate: deleteClient} = useDeleteClient();

  // Use the custom hook
  const {
    clientsWithCelebrations,
    clientsWithTodayCelebrations,
    clientsWithUpcomingCelebrations,
    isToday,
    isUpcoming,
    formatDate,
  } = useClientCelebrations(allClientData);

  // Format date function - memoized to prevent recreation
  const formatDateMemoized = useCallback(
    (date: string | null | undefined) => {
      return formatDate(date);
    },
    [formatDate],
  );

  // Process client data when API data changes
  useEffect(() => {
    if (clientApiData?.data && Array.isArray(clientApiData.data)) {
      console.log('Raw API data received:', clientApiData);

      const mappedData = clientApiData.data.map((item) => {
        const {id} = item;
        const {fullname, phoneNumber, secondaryPhoneNumber, email} = item.user;
        const {caste, address, birthday, anniversary} = item;

        const formattedBirthday = formatDateMemoized(birthday);
        const formattedAnniversary = formatDateMemoized(anniversary);

        return {
          id,
          fullname,
          name: fullname,
          phoneNumber,
          secondaryPhoneNumber,
          email,
          caste: caste || '-',
          address: address || '-',
          pendingAmount:
            item.events
              ?.map((event: any) => event.finalAmount - event.paidAmount)
              .reduce((a, b) => a + b, 0) || 0,
          birthday: formattedBirthday || '-',
          anniversary: formattedAnniversary || '-',
          events: item.events ? item.events.length : 0,
          billAmt:
            item.events
              ?.map((event: any) => event.finalAmount)
              .reduce((a, b) => a + b, 0) || 0,
        };
      });

      console.log('Mapped client data:', mappedData);
      setAllClientData(mappedData);
    }
  }, [clientApiData?.data, formatDateMemoized]); // Removed refetch and isFetched

  // Update data when view mode changes
  useEffect(() => {
    switch (viewMode) {
      case 'all':
        setClientData(allClientData);
        break;
      case 'celebrations':
        setClientData(clientsWithCelebrations);
        break;
      case 'today':
        setClientData(clientsWithTodayCelebrations);
        break;
      case 'upcoming':
        setClientData(clientsWithUpcomingCelebrations);
        break;
      default:
        setClientData(allClientData);
    }
  }, [
    viewMode,
    allClientData,
    clientsWithCelebrations,
    clientsWithTodayCelebrations,
    clientsWithUpcomingCelebrations,
  ]);

  // Add manual refresh function if needed
  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  // WhatsApp sharing function
  const handleWhatsAppShare = useCallback((client: Client) => {
    console.log('client data', client);

    let message = '';
    let celebrationType = '';

    if (client.birthday && client.birthday !== '-') {
      celebrationType = 'birthday';
      message =
        `🎉 *Happy Birthday ${client.fullname || client.name}!* 🎂\n` +
        `Wishing you a wonderful year ahead filled with happiness and success! 🎈✨`;
    }

    if (!celebrationType && client.anniversary && client.anniversary !== '-') {
      celebrationType = 'anniversary';
      message =
        `💞 *Happy Anniversary ${client.fullname || client.name}!* 💍\n` +
        `Wishing you many more years of love and togetherness! ❤️✨`;
    }

    if (!celebrationType) {
      alert('No birthday or anniversary date available for this client.');
      return;
    }

    const phoneNumber = client.phoneNumber.replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, '_blank');
  }, []);

  // Memoize columns to prevent unnecessary re-renders
  const baseColumns = useMemo<Column<Client>[]>(
    () => [
      {
        header: 'Client Name',
        accessor: 'fullname',
        sortable: true,
        className: 'w-[150px]',
        render: (item) => (
          <span
            onClick={() => {
              if (role === 'CATEROR' || restriction === 'EDIT') {
                navigate({to: `/clienthistory/${item.id}`});
              }
            }}
            className="cursor-pointer text-blue-600 hover:text-blue-800 hover:underline"
          >
            {item.fullname}
          </span>
        ),
      },
      {header: 'Mobile No.', accessor: 'phoneNumber', sortable: true},
      {header: 'Address', accessor: 'address', className: 'w-[200px]'},
      {header: 'Caste', accessor: 'caste', sortable: true},
      {header: 'Events', accessor: 'events', sortable: true},
      {header: 'Pending Amount', accessor: 'pendingAmount', sortable: true},
    ],
    [navigate, role, restriction],
  );

  const celebrationColumns = useMemo<Column<Client>[]>(
    () => [
      {
        header: 'Client Name',
        accessor: 'fullname',
        sortable: true,
        className: 'w-[150px]',
        render: (item) => (
          <span
            onClick={() => {
              if (role === 'CATEROR' || restriction === 'EDIT') {
                navigate({to: `/clienthistory/${item.id}`});
              }
            }}
            className="cursor-pointer text-blue-600 hover:text-blue-800 hover:underline"
          >
            {item.fullname}
          </span>
        ),
      },
      {header: 'Mobile No.', accessor: 'phoneNumber', sortable: true},
      {header: 'Address', accessor: 'address', className: 'w-[200px]'},
      {header: 'Events', accessor: 'events', sortable: true},
      {header: 'Business Value', accessor: 'billAmt', sortable: true},
      {
        header: 'Birthday',
        accessor: 'birthday',
        sortable: true,
        render: (item) => {
          const hasBirthday = item.birthday && item.birthday !== '-';
          const isBirthdayToday = hasBirthday && isToday(item.birthday);
          const isBirthdayUpcoming = hasBirthday && isUpcoming(item.birthday);

          return (
            <div className="flex items-center gap-2">
              <span
                className={
                  isBirthdayToday
                    ? 'rounded bg-green-100 px-2 py-1 font-bold text-green-800'
                    : isBirthdayUpcoming
                      ? 'rounded bg-yellow-100 px-2 py-1 font-medium text-yellow-800'
                      : 'text-gray-600'
                }
              >
                {item.birthday || '-'}
              </span>
              {(isBirthdayToday || isBirthdayUpcoming) && (
                <button
                  onClick={() => handleWhatsAppShare(item)}
                  className="text-green-600 transition-colors hover:text-green-800"
                  title="Send Birthday Wishes"
                >
                  <FiMessageCircle className="text-sm" />
                </button>
              )}
            </div>
          );
        },
      },
      {
        header: 'Anniversary',
        accessor: 'anniversary',
        sortable: true,
        render: (item) => {
          const hasAnniversary = item.anniversary && item.anniversary !== '-';
          const isAnniversaryToday =
            hasAnniversary && isToday(item.anniversary);
          const isAnniversaryUpcoming =
            hasAnniversary && isUpcoming(item.anniversary);

          return (
            <div className="flex items-center gap-2">
              <span
                className={
                  isAnniversaryToday
                    ? 'rounded bg-pink-100 px-2 py-1 font-bold text-pink-800'
                    : isAnniversaryUpcoming
                      ? 'rounded bg-orange-100 px-2 py-1 font-medium text-orange-800'
                      : 'text-gray-600'
                }
              >
                {item.anniversary || '-'}
              </span>
              {(isAnniversaryToday || isAnniversaryUpcoming) && (
                <button
                  onClick={() => handleWhatsAppShare(item)}
                  className="text-green-600 transition-colors hover:text-green-800"
                  title="Send Anniversary Wishes"
                >
                  <FiMessageCircle className="text-sm" />
                </button>
              )}
            </div>
          );
        },
      },
      {header: 'Pending Amount', accessor: 'pendingAmount', sortable: true},
      {
        header: 'WP Share',
        accessor: 'fullname',
        render: (item) => {
          return (
            <div className="flex gap-3">
              <button
                onClick={() => handleWhatsAppShare(item)}
                className="flex items-center justify-center rounded-lg bg-green-100 p-2 text-green-700 hover:bg-green-200"
                title="Share via WhatsApp"
              >
                <BsWhatsapp className="text-base" />
              </button>
            </div>
          );
        },
      },
    ],
    [navigate, role, restriction, handleWhatsAppShare, isToday, isUpcoming],
  );

  const columns = viewMode === 'all' ? baseColumns : celebrationColumns;

  const handleEdit = useCallback(
    (item: Client) => {
      navigate({to: `/update/client/${item.id}`});
    },
    [navigate],
  );

  const handleDelete = useCallback(
    (item: Client) => {
      confirmAlert({
        customUI: ({onClose}) => (
          <div className="fixed inset-0 z-20 flex items-center justify-center bg-black bg-opacity-50">
            <div className="w-full max-w-md rounded-lg bg-white p-6 text-black shadow-md dark:bg-meta-4 dark:text-white">
              <h2 className="mb-4 text-xl font-semibold">Confirm to delete</h2>
              <p className="mb-6">
                Are you sure you want to delete client {item.fullname}?
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={async () => {
                    try {
                      await deleteClient(item.id);
                      setClientData((prevData) =>
                        prevData.filter((client) => client.id !== item.id),
                      );
                      setAllClientData((prevData) =>
                        prevData.filter((client) => client.id !== item.id),
                      );
                      onClose();
                    } catch (error) {
                      console.error('Error deleting client:', error);
                      onClose();
                    }
                  }}
                  className="rounded bg-red-600 px-4 py-2 text-white transition hover:bg-red-700"
                >
                  Yes
                </button>
                <button
                  onClick={onClose}
                  className="bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 rounded px-4 py-2 text-black transition dark:text-white"
                >
                  No
                </button>
              </div>
            </div>
          </div>
        ),
      });
    },
    [deleteClient],
  );

  if (isLoadingClients) {
    return <Loader />;
  }

  const getViewTitle = () => {
    switch (viewMode) {
      case 'all':
        return 'Client List';
      case 'celebrations':
        return 'All Clients with Celebrations';
      case 'today':
        return "Today's Celebrations";
      case 'upcoming':
        return 'Upcoming Celebrations (Next 7 Days)';
      default:
        return 'Client List';
    }
  };

  return (
    <div>
      {/* Enhanced View Mode Toggle */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setViewMode('all')}
          className={`rounded-lg px-4 py-2 font-medium transition-colors ${
            viewMode === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          All Clients ({allClientData.length})
        </button>
        <button
          onClick={() => setViewMode('celebrations')}
          className={`rounded-lg px-4 py-2 font-medium transition-colors ${
            viewMode === 'celebrations'
              ? 'bg-green-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          Celebrations Birthday & Anniversary ({clientsWithCelebrations.length})
        </button>
      </div>

      {/* Table displaying clients */}
      <GenericTable
        title={getViewTitle()}
        data={clientData || []}
        columns={columns}
        itemsPerPage={15}
        searchAble
        action={role === 'CATEROR' || restriction === 'EDIT'}
        onDelete={handleDelete}
        onEdit={handleEdit}
      />
    </div>
  );
};

export default DisplayClient;
