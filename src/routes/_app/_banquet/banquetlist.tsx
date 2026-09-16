/* eslint-disable */
import {useDeleteBanquet, useGetBanquets} from '@/components/Banquet/banquet';
import GenericTable from '@/components/Forms/Table/GenericTable';
import {createFileRoute, useNavigate} from '@tanstack/react-router';

export const Route = createFileRoute('/_app/_banquet/banquetlist')({
  component: BanquetList,
});

function BanquetList() {
  const {data: banquets} = useGetBanquets();
  const {mutateAsync: deleteBanquet} = useDeleteBanquet();
  const navigate = useNavigate();
  const columns = [
    {
      header: 'Name',
      accessor: 'name',
    },
  ];
  return (
    <div>
      <GenericTable
        title="Banquet List"
        data={banquets || []}
        columns={columns}
        action
        onDelete={(id: any) => deleteBanquet(id.id)}
        onEdit={(id: any) =>
          navigate({to: `/updatebanquet/${id.id}/${id.name}`})
        }
      />
    </div>
  );
}
