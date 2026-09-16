import Quotation from '@/components/Quatation/Quatation';
import ShowQuotation from '@/components/Quatation/ShowQuatation';

const QuatationPage: React.FC = () => {
  return (
    <div className="mx-auto max-w-270">
      <div className="grid grid-cols-8 gap-8">
        <div className="col-span-8">
          <Quotation />
        </div>
      </div>
    </div>
  );
};

export default QuatationPage;
