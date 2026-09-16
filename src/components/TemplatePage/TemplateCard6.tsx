/* eslint-disable */
import {Image6} from '@/assets/images/template';
import {useAuthContext} from '@/context/AuthContext';
import {useGetCaterorById} from '@/lib/react-query/queriesAndMutations/cateror/dish';

const TemplateCard6 = ({template, setTemplate}: any) => {
  const {user} = useAuthContext();
  const userId = user?.caterorId;
  const {data} = useGetCaterorById(userId!);
  const caterorData = data?.data;

  return (
    <div
      className={`relative h-40 w-full overflow-hidden rounded-xl text-white md:h-48 lg:h-56 xl:h-64 ${template === 'template6' ? 'ring-2 ring-blue-500' : ''}`}
      style={{
        backgroundImage: `url(${Image6})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
      onClick={() => setTemplate('template6')}
    >
      <div className="flex h-full flex-col items-center justify-center space-y-1 bg-black bg-opacity-40 px-4 text-center font-croissant text-black">
        <img
          src={caterorData?.image || ''}
          alt="Logo"
          className="h-16 w-16 object-contain md:h-16 md:w-16 lg:h-24 lg:w-24"
        />
        <h2 className="md:2xl text-xl font-bold text-white lg:text-3xl">
          {caterorData?.user?.fullname || 'Company Name'}
        </h2>
        <p>{caterorData?.user?.email}</p>
        <p>{caterorData?.address}</p>
        <p>{caterorData?.user?.phoneNumber}</p>
      </div>
    </div>
  );
};

export default TemplateCard6;
