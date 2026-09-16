/* eslint-disable  */
import React from 'react';
import GenericTable, {Column} from '../Forms/Table/GenericTable';
import {useGetNotification} from '@/lib/react-query/queriesAndMutations/notification';
import {Loader} from '../Loader/Loader';
import {useAuthContext} from '@/context/AuthContext';

// Define the columns for the table
const columns: Column<any>[] = [
  {header: 'Dish Name', accessor: 'dishName', sortable: true},
  {
    header: 'Created Date',
    accessor: (row) =>
      new Intl.DateTimeFormat('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(row?.createdAt)),
    sortable: true,
  },
];

const DisplayNotificationDishes: React.FC = () => {
  const {user} = useAuthContext();
  const restriction = user?.employeeRestriction?.notificationDishPage;
  const role = user?.role;
  const {data: notificationReponse, isLoading} = useGetNotification();

  // Filter data where caterorId is null
  const filteredData =
    notificationReponse?.filter((item) => item.caterorId === null) || [];

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="flex flex-col">
      <GenericTable
        title="Notification Dishes"
        data={filteredData} // Pass the filtered data
        columns={columns}
        itemsPerPage={15}
        searchAble
        action={role === 'CATEROR' || restriction === 'EDIT'}
        onEdit={() => {}}
        onDelete={() => {}}
      />
    </div>
  );
};

export default DisplayNotificationDishes;
