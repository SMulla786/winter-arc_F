import DisplayDisposalCategory from '@/components/Disposal/DisplayDisposalCategory';
import DisposalCategory from '@/components/Disposal/DisposalCategory';

const DisposalCategoryManagement: React.FC = () => {
  return (
    <div className="">
      <div className="grid grid-cols-8 gap-8">
        <div className="col-span-8">
          <DisposalCategory />
        </div>
        <div className="col-span-8">
          <DisplayDisposalCategory />
        </div>
      </div>
    </div>
  );
};

export default DisposalCategoryManagement;
