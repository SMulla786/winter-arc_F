/* eslint-disable */
import {Image4} from '@/assets/images/template';
import {useAuthContext} from '@/context/AuthContext';
import {useGetCaterorById} from '@/lib/react-query/queriesAndMutations/cateror/dish';

const TemplateCard4 = ({template, setTemplate}: any) => {
  const {user} = useAuthContext();
  const userId = user?.caterorId;
  const {data} = useGetCaterorById(userId!);
  const caterorData = data?.data;

  return (
    <div
      className={`relative h-40 w-full overflow-hidden rounded-xl text-white md:h-48 lg:h-56 xl:h-64 ${template === 'template4' ? 'ring-2 ring-blue-500' : ''}`}
      style={{
        backgroundImage: `url(${Image4})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
      onClick={() => setTemplate('template4')}
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

export default TemplateCard4;

// const TemplateCard4 = ({ backgroundImage, caterorData }: any) => (
//     <div
//         className="relative h-40 w-full text-white md:h-48 lg:h-56 xl:h-64 rounded-xl overflow-hidden"
//         style={{
//             backgroundImage: `url(${backgroundImage})`,
//             backgroundSize: 'cover',
//             backgroundPosition: 'center',
//             backgroundRepeat: 'no-repeat',
//         }}
//     >
//         <div className="bg-black bg-opacity-40 h-full w-full p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
//             <div className="mb-4 sm:mb-24 sm:ml-3 sm:justify-start sm:px-9">
//                 <img
//                     src={caterorData?.image || ''}
//                     alt="Company Logo"
//                     className="h-24 w-24 rounded-full border-2 border-white object-cover"
//                 />
//             </div>
//             <div className="text-center text-black sm:mr-20 sm:mt-20 sm:text-right">
//                 <h1 className="font-croissant font-extrabold text-white dark:text-white sm:text-2xl">
//                     {caterorData?.user?.fullname || 'Company Name'}
//                 </h1>
//                 <p>Name: {caterorData?.user?.fullname}</p>
//                 <p>Email: {caterorData?.user?.email}</p>
//                 <p>Address: {caterorData?.address}</p>
//                 <p>Phone: {caterorData?.user?.phoneNumber || 'N/A'}</p>
//             </div>
//         </div>
//     </div>
// );

// export default TemplateCard4;
