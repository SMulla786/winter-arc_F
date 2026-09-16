import DisplayDisposal from '@/components/Disposal/DisplayDisposal';
import Disposal from '@/components/Disposal/Disposal';

const DisposalManagement: React.FC = () => {
  return (
    <div className="mx-auto max-w-270">
      <div className="grid grid-cols-8 gap-8">
        <div className="col-span-8">
          <Disposal />
        </div>
        <div className="col-span-8">
          <DisplayDisposal />
        </div>
      </div>
    </div>
  );
};

export default DisposalManagement;
