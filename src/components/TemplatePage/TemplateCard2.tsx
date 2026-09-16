/* eslint-disable */
import {Image2} from '@/assets/images/template';
import {useAuthContext} from '@/context/AuthContext';
import {useGetCaterorById} from '@/lib/react-query/queriesAndMutations/cateror/dish';

const TemplateCard2 = ({template, setTemplate}: any) => {
  const {user} = useAuthContext();
  const userId = user?.caterorId;
  const {data} = useGetCaterorById(userId!);
  const caterorData = data?.data;

  return (
    <div
      className={`relative h-40 w-full overflow-hidden rounded-xl text-white md:h-20 lg:h-29 xl:h-32 ${template === 'template2' ? 'ring-2 ring-blue-500' : ''}`}
      style={{
        backgroundImage: `url(${Image2})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
      onClick={() => setTemplate('template2')}
    >
      <div className="flex h-full flex-row items-center justify-between bg-black bg-opacity-40 p-4 sm:p-6">
        {/* Left Side - Image */}
        <div className="flex items-center justify-center">
          <img
            src={caterorData?.image || ''}
            alt="Logo"
            className="h-20 w-20 object-contain sm:h-24 sm:w-24 md:h-28 md:w-28"
          />
        </div>

        {/* Right Side - Details */}
        <div className="flex flex-1 flex-col items-end justify-center text-right font-croissant text-white">
          <h2 className="mb-2 text-xl font-bold sm:text-2xl md:text-3xl">
            {caterorData?.user?.fullname || 'Company Name'}
          </h2>
          <div className="space-y-1 text-sm sm:text-base">
            <p className="max-w-xs truncate">{caterorData?.user?.email}</p>
            <p className="max-w-xs truncate">{caterorData?.address}</p>
            <p className="max-w-xs truncate">
              {caterorData?.user?.phoneNumber || 'N/A'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateCard2;
// const TemplateCard2 = ({ backgroundImage, caterorData }: any) => (
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
//                     src={catero  rData?.image || ''}
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

// export default TemplateCard2;
