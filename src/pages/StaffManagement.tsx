import DisplayStaff from '@/components/Staff/DisplayStaff';
import Staff from '@/components/Staff/Staff';

const StaffManagement: React.FC = () => {
  return (
    <div className="mx-auto max-w-270">
      <div className="grid grid-cols-8 gap-8">
        <div className="col-span-8">
          <Staff />
        </div>
        <div className="col-span-8">
          <DisplayStaff />
        </div>
      </div>
    </div>
  );
};

export default StaffManagement;
