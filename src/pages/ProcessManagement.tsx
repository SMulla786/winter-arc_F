import DisplayProcess from '@/components/Process/DisplayProcess';
import Process from '@/components/Process/Process';

const ProcessManagement: React.FC = () => {
  return (
    <div className="">
      <div className="grid grid-cols-8 gap-8">
        <div className="col-span-8">
          <Process />
        </div>
        <div className="col-span-8">
          <DisplayProcess />
        </div>
      </div>
    </div>
  );
};

export default ProcessManagement;
