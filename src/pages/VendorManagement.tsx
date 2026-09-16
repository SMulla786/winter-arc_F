import DisplayVendor from '@/components/Vendor/DisplayVendor';
import Vendor from '@/components/Vendor/Vendor';

const VendorManagement: React.FC = () => {
  return (
    <div className="mx-auto max-w-270">
      <div className="grid grid-cols-8 gap-8">
        <div className="col-span-8">{/* <Vendor /> */}</div>
        <div className="col-span-8">
          <DisplayVendor />
        </div>
      </div>
    </div>
  );
};

export default VendorManagement;
