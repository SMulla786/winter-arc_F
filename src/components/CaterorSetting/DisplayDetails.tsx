/* eslint-disable */
import React from 'react';
import GenericTable from '../Forms/Table/GenericTable';
import {useGetDetails} from '@/lib/react-query/queriesAndMutations/cateror/details';
import {useDeleteFirmDetails} from '@/lib/react-query/queriesAndMutations/cateror/details';

const DisplayDetail: React.FC = () => {
  const {data: response, isLoading, isError} = useGetDetails();
  const {mutate: deleteFirmDetails} = useDeleteFirmDetails();

  const columns = [
    {header: 'Name', accessor: 'name'},
    {header: 'Email', accessor: 'email'},
    {header: 'Phone', accessor: 'phone'},
    {header: 'Address', accessor: 'address'},
  ];

  if (isLoading) return <p>Loading details...</p>;
  if (isError) return <p className="text-red-500">Failed to load details</p>;

  const handleDelete = (item: any) => {
    deleteFirmDetails(item.id);
  };

  return (
    <div className="mt-2">
      <GenericTable
        title="Details"
        columns={columns}
        data={response || []}
        action
        onDelete={handleDelete}
      />
    </div>
  );
};

export default DisplayDetail;
