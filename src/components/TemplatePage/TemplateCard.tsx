/* eslint-disable */
import React from 'react';
import {Image2} from '@/assets/images/template'; // <-- import Image2 here to compare

interface TemplateCardProps {
  backgroundImage: string;
  caterorData: any;
}

const TemplateCard: React.FC<TemplateCardProps> = ({
  backgroundImage,
  caterorData,
}) => {
  const isImage2 = backgroundImage === Image2;

  const containerClasses = isImage2
    ? 'flex flex-col items-center justify-center text-center h-full w-full bg-black bg-opacity-40 p-4'
    : 'bg-black bg-opacity-40 h-full w-full p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between';

  return (
    <div
      className="relative h-40 w-full overflow-hidden rounded-xl text-white md:h-48 lg:h-56 xl:h-64"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className={containerClasses}>
        <div
          className={`mb-4 ${isImage2 ? '' : 'sm:mb-0 sm:ml-3 sm:justify-start sm:px-9'}`}
        >
          <img
            src={caterorData?.image || ''}
            alt="Company Logo"
            className="h-24 w-24 rounded-full border-2 border-white object-contain"
          />
        </div>
        <div
          className={
            isImage2 ? 'mt-3 text-center' : 'text-center sm:mr-11 sm:text-right'
          }
        >
          <h1 className="font-croissant font-extrabold text-[#222529] dark:text-white sm:text-2xl">
            {caterorData?.user?.fullname || 'Company Name'}
          </h1>
          <p className="mt-1 font-croissant text-[#222529] dark:text-white">
            Name: {caterorData?.user?.fullname}
          </p>
          <p className="mt-1 font-croissant text-[#222529] dark:text-white">
            Email: {caterorData?.user?.email}
          </p>
          <p className="font-croissant text-[#222529] dark:text-white">
            Address: {caterorData?.address}
          </p>
          <p className="mt-1 font-croissant text-[#222529] dark:text-white">
            Phone: {caterorData?.user?.phoneNumber || 'N/A'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TemplateCard;
