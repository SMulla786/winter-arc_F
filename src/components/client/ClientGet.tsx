import {useEffect, useState} from 'react';
import {useNavigate} from '@tanstack/react-router';
import GenericTable, {Column} from '@/components/Forms/Table/GenericTable';
import {useGetAllClient} from '@/lib/react-query/queriesAndMutations/cateror/client';
import {useAuthContext} from '@/context/AuthContext';

type GetClient = {
  id: string;
  name: string;
  phoneNumber: string;
  address: string;
  caste: string;
  birthday?: string | null;
  anniversary?: string | null;
  events: string | number;
};

const ClientGet: React.FC = () => {
  const {user} = useAuthContext();
  const restriction = user?.employeeRestriction?.clientPage;
  const role = user?.role;

  const navigate = useNavigate();
  const [clientData, setClientData] = useState<GetClient[]>([]);

  const {
    data: clientApiData,
    isLoading: isLoadingClients,
    refetch,
    isFetched,
  } = useGetAllClient();

  const columns: Column<GetClient>[] = [
    {header: 'Client Name', accessor: 'name', sortable: true},
    {header: 'Mobile No.', accessor: 'phoneNumber', sortable: true},
    {header: 'Address', accessor: 'address', sortable: true},
    {header: 'Caste', accessor: 'caste', sortable: true},
    {header: 'Events', accessor: 'events'},
    {header: 'Birthday', accessor: 'birthday', sortable: true},
    {header: 'Anniversary', accessor: 'anniversary', sortable: true},
  ];

  // Format a date as YYYY-MM-DD
  const formatDate = (dateString?: string | null): string | undefined => {
    if (!dateString) return undefined;
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return undefined;
    return date.toISOString().split('T')[0];
  };

  // Check if the given date’s month/day match today’s
  const isToday = (dateStr?: string | null): boolean => {
    if (!dateStr) return false;
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return false;
    const today = new Date();
    return (
      date.getDate() === today.getDate() && date.getMonth() === today.getMonth()
    );
  };

  useEffect(() => {
    refetch();

    if (clientApiData?.data) {
      const mappedData = Array.isArray(clientApiData.data)
        ? clientApiData.data.map((item) => {
            const {id} = item;
            const {fullname, phoneNumber, secondaryPhoneNumber, email} =
              item.user;
            const {caste, address, pendingAmount, birthday, anniversary} = item;

            return {
              id,
              name: fullname,
              phoneNumber,
              secondaryPhoneNumber,
              email,
              caste: caste || '-',
              address: address || '-',
              pendingAmount,
              birthday: formatDate(birthday),
              anniversary: formatDate(anniversary),
              events: item.events ? item.events.length : 0,
            };
          })
        : [];

      // Filter: only show clients with a birthday or anniversary today
      const todayFiltered = mappedData.filter(
        (client) => isToday(client.birthday) || isToday(client.anniversary),
      );

      setClientData(todayFiltered);
    }
  }, [clientApiData, isFetched, refetch]);

  return (
    <div>
      <GenericTable
        title=" Clients (Birthday / Anniversary)"
        data={clientData || []}
        columns={columns}
        itemsPerPage={15}
        searchAble
      />
    </div>
  );
};

export default ClientGet;
