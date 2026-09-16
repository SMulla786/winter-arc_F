import SubEventRawMaterialList from '@/components/Event/SubEventRawMaterialList';
const SubEventRawMaterialListPage: React.FC = () => {
  return (
    <div className="mx-auto max-w-270">
      <div className="grid grid-cols-8 gap-8">
        <div className="col-span-8">
          <SubEventRawMaterialList />
        </div>
      </div>
    </div>
  );
};

export default SubEventRawMaterialListPage;
