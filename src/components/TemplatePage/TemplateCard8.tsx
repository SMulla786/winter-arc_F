/*eslint-disable*/
import {useAuthContext} from '@/context/AuthContext';
import {useGetCaterorById} from '@/lib/react-query/queriesAndMutations/cateror/dish';
import {Mail, MapPin, Phone} from 'lucide-react';

const TemplateCard8 = ({template, setTemplate}: any) => {
  const {user} = useAuthContext();
  const userId = user?.caterorId;
  const {data} = useGetCaterorById(userId!);
  const caterorData = data?.data;

  return (
    <div
      className={`border-gray-200 relative w-full overflow-hidden bg-white text-black transition-all dark:bg-boxdark${
        template === 'template8' ? 'ring-2 ring-blue-500' : ''
      } min-h-[100px] md:min-h-[120px] lg:min-h-[140px] print:min-h-[120px]`}
      onClick={() => setTemplate('template8')}
    >
      <div className="flex flex-col items-center justify-center gap-3 border-b-4 border-neutral-500 p-4 text-center md:flex-row md:justify-between md:p-6 md:text-left lg:p-8 print:flex-row">
        {/* Company Logo/Image + Name */}
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-6">
          <img
            src={caterorData?.image || '/api/placeholder/80/80'}
            alt="Company Logo"
            className="h-14 w-14 object-cover shadow-md dark:border-white sm:h-16 sm:w-16 md:h-18 md:w-18 lg:h-20 lg:w-20"
          />
          <h1 className="text-lg font-semibold uppercase text-black dark:text-white sm:text-2xl md:text-3xl lg:text-4xl">
            {caterorData?.user?.fullname || 'Company Name'}
          </h1>
        </div>

        {/* Contact Information */}
        <div className="mt-4 flex flex-col space-y-2 text-sm font-bold dark:text-white sm:text-base md:mt-0 md:text-lg">
          {caterorData?.user?.email && (
            <div className="flex items-center">
              <div className="flex w-6 justify-center">
                <Mail className="h-5 w-5" />
              </div>
              <span>{caterorData.user.email}</span>
            </div>
          )}

          {caterorData?.address && (
            <div className="flex items-center">
              <div className="flex w-6 justify-center">
                <MapPin className="h-5 w-5" />
              </div>
              <span>{caterorData.address}</span>
            </div>
          )}

          {caterorData?.user?.phoneNumber && (
            <div className="flex items-center">
              <div className="flex w-6 justify-center">
                <Phone className="h-5 w-5" />
              </div>
              <span>{caterorData.user.phoneNumber}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TemplateCard8;
