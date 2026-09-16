/*eslint-disable*/
import {useAuthContext} from '@/context/AuthContext';
import {useGetCaterorById} from '@/lib/react-query/queriesAndMutations/cateror/dish';
import {Mail, MapPin, Phone} from 'lucide-react';

const TemplateCard7 = ({template, setTemplate}: any) => {
  const {user} = useAuthContext();
  const userId = user?.caterorId;
  const {data} = useGetCaterorById(userId!);
  const caterorData = data?.data;

  return (
    <div
      className={`border-gray-200 relative w-full overflow-hidden bg-[#6F7F57] text-white transition-all ${
        template === 'template7' ? 'ring-2 ring-blue-500' : ''
      } min-h-[90px] md:min-h-[110px] lg:min-h-[130px] print:min-h-[120px]`}
      onClick={() => setTemplate('template7')}
    >
      <div className="flex flex-col items-center justify-center gap-3 p-2 text-center md:flex-row md:justify-between md:p-2 md:text-left lg:p-2 print:flex-row">
        {/* Company Logo/Image + Name */}
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-6">
          <img
            src={caterorData?.image || '/api/placeholder/80/80'}
            alt="Company Logo"
            style={{width: '320px', height: '120px'}}
            className="object-contain"
          />

          <h1 className="text-lg font-semibold uppercase text-white sm:text-2xl md:text-3xl lg:text-4xl">
            {caterorData?.user?.fullname || 'Company Name'}
          </h1>
        </div>

        {/* Contact Information */}
        <div className="ml-40 flex flex-col space-y-2 text-sm font-bold sm:text-base md:text-base lg:text-base">
          {caterorData?.user?.email && (
            <div className="flex items-center">
              <div className="flex w-6 justify-center">
                <Mail className="mr-2 h-5 w-5" />
              </div>
              <span>{caterorData.user.email}</span>
            </div>
          )}

          {caterorData?.user?.phoneNumber && (
            <div className="flex items-center">
              <div className="flex w-6 justify-center">
                <Phone className="mr-2 h-5 w-5" />
              </div>
              <span>{caterorData.user.phoneNumber}</span>
            </div>
          )}

          {caterorData?.address && (
            <div className="flex items-start text-left">
              <div className="flex w-6 justify-center">
                <MapPin className="mr-2 h-5 w-5" />
              </div>
              <span>{caterorData.address}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TemplateCard7;
