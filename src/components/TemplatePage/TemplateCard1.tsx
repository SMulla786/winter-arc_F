/* eslint-disable */
import {Image1} from '@/assets/images/template';
import {useAuthContext} from '@/context/AuthContext';
import {useGetCaterorById} from '@/lib/react-query/queriesAndMutations/cateror/dish';

const TemplateCard1 = ({template, setTemplate}: any) => {
  const {user} = useAuthContext();
  const userId = user?.caterorId;

  const {data} = useGetCaterorById(userId!);
  const CaterorData = data?.data;
  console.log('CaterorData', CaterorData);
  return (
    <div
      className={`relative h-40 w-full overflow-hidden rounded-xl text-white md:h-20 lg:h-29 xl:h-39 ${template === 'template1' ? 'ring-2 ring-blue-500' : ''}`}
      style={{
        backgroundImage: `url(${Image1})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
      onClick={() => {
        setTemplate('template1');
      }}
    >
      <div className="flex h-full w-full flex-col bg-black bg-opacity-40 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="mb-4 sm:mb-0 sm:ml-3 sm:justify-start sm:px-9">
          <img
            src={CaterorData?.image || ''}
            alt="Company Logo"
            className="h-24 w-24 object-contain"
          />
        </div>
        <div className="text-center font-croissant sm:mr-11 sm:text-right">
          <h1 className="font-extrabold text-[#222529] dark:text-white sm:text-2xl">
            {CaterorData?.user?.fullname || 'Company Name'}
          </h1>
          <p>Name: {CaterorData?.user?.fullname}</p>
          <p>Email: {CaterorData?.user?.email}</p>
          <p>Address: {CaterorData?.address}</p>
          <p>Phone: {CaterorData?.user?.phoneNumber || 'N/A'}</p>
        </div>
      </div>
    </div>
  );
};

export default TemplateCard1;
