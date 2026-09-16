/* eslint-disable */
import {Image3} from '@/assets/images/template';
import {useAuthContext} from '@/context/AuthContext';
import {useGetCaterorById} from '@/lib/react-query/queriesAndMutations/cateror/dish';

const TemplateCard3 = ({template, setTemplate}: any) => {
  const {user} = useAuthContext();
  const userId = user?.caterorId;
  const {data} = useGetCaterorById(userId!);
  const caterorData = data?.data;

  return (
    <div
      className={`relative h-40 w-full overflow-hidden rounded-xl text-white md:h-48 lg:h-56 xl:h-64 ${template === 'template3' ? 'ring-2 ring-blue-500' : ''}`}
      style={{
        backgroundImage: `url(${Image3})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
      onClick={() => setTemplate('template3')}
    >
      <div className="flex h-full w-full flex-col bg-black bg-opacity-40 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="mb-4 sm:mb-0 sm:ml-3 sm:justify-start sm:px-9">
          <img
            src={caterorData?.image || ''}
            alt="Company Logo"
            className="h-24 w-24 object-contain"
          />
        </div>
        <div className="text-center font-croissant sm:mr-11 sm:text-right">
          <h1 className="font-extrabold text-[#222529] dark:text-white sm:text-2xl">
            {caterorData?.user?.fullname || 'Company Name'}
          </h1>
          <p>Name: {caterorData?.user?.fullname}</p>
          <p>Email: {caterorData?.user?.email}</p>
          <p>Address: {caterorData?.address}</p>
          <p>Phone: {caterorData?.user?.phoneNumber || 'N/A'}</p>
        </div>
      </div>
    </div>
  );
};

export default TemplateCard3;
