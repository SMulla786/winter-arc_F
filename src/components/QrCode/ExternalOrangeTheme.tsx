// /* eslint-disable */
// import React from 'react';
// import {FaPhone} from 'react-icons/fa';
// import {MdLocationOn} from 'react-icons/md';
import orange from '@/assets/images/menucard/orange.png';
import divider from '@/assets/images/menucard/design.png';

// interface OrangeThemeProps {
//   subeventData: any;
//   caterorData: any;
//   groupedDishes: Record<string, Array<{name: string; description: string}>>;
//   eventDate: string;
//   printRef: React.RefObject<HTMLDivElement>;
// }

// const ExternalOrangeTheme: React.FC<OrangeThemeProps> = ({
//   subeventData,
//   caterorData,
//   groupedDishes,
//   eventDate,
//   printRef,
// }) => {
//   const subevent = subeventData;
//   const cateror = subevent.event.cateror.user;

//   // Typography presets (adapted for orange theme)
//   const titleFont = {fontFamily: "'Cinzel', serif"};
//   const elegantFont = {fontFamily: "'Cormorant Garamond', serif"};
//   const accentFont = {fontFamily: "'Marcellus', serif"};

//   return (
//     <div
//       ref={printRef}
//       className="min-h-screen w-full rounded-xl bg-cover bg-center bg-no-repeat text-black"
//       style={{
//         backgroundImage: `url(${orange})`,
//       }}
//     >
//       {/* Transparent overlay for readability */}
//       <div className="min-h-screen w-full rounded-xl border-2 px-2 py-4 backdrop-blur-[2px] sm:px-4 sm:py-6 md:px-8 md:py-8 lg:px-12 lg:py-10 xl:px-16 xl:py-12">
//         {/* Header */}
//         <div className="flex flex-col items-center rounded-lg pb-4 text-center sm:pb-6 md:pb-8 lg:pb-10">
//           <h1 className="mb-2 text-3xl font-semibold sm:text-8xl md:text-8xl lg:text-8xl">
//             Welcome To
//           </h1>

//           <img
//             src={caterorData?.data?.image}
//             alt="Business Logo"
//             className="mx-auto mb-2 h-16 w-16 object-contain sm:mb-3 sm:h-20 sm:w-20 md:mb-3 md:h-24 md:w-24 lg:mb-3 lg:h-28 lg:w-28 xl:h-32 xl:w-32"
//           />

//           {cateror?.fullname && (
//             <h2 className="font-serif text-3xl font-bold tracking-wide drop-shadow-lg sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl">
//               {cateror.fullname}
//             </h2>
//           )}
//         </div>

//         {/* Divider */}
//         <div className="my-2 flex justify-center sm:my-3 md:my-4">
//           <img
//             src={divider}
//             alt="Divider"
//             className="h-4 w-64 object-cover sm:h-5 sm:w-72 md:h-5 md:w-80"
//           />
//         </div>

//         {/* Event Info */}
//         <div className="mb-4 text-center sm:mb-6 md:mb-8 lg:mb-10">
//           <h2 className="font-serif text-3xl font-bold uppercase tracking-widest sm:text-2xl md:text-3xl lg:text-4xl">
//             {subevent.name}
//           </h2>

//           <div className="mx-auto mt-3 max-w-2xl rounded-lg p-3 backdrop-blur-sm sm:mt-4 sm:max-w-3xl sm:p-4 md:mt-4 md:p-6 lg:mt-4 lg:p-8">
//             <div className="flex flex-col items-center justify-between gap-3 sm:flex-row sm:gap-4 md:gap-6">
//               <div className="text-center sm:text-left">
//                 <p className="text-xl font-semibold text-black sm:text-sm">
//                   DATE
//                 </p>
//                 <p className="text-xl font-bold sm:text-base md:text-lg">
//                   {eventDate}
//                 </p>
//               </div>

//               <div className="text-center sm:text-left">
//                 <p className="text-xl font-semibold text-black sm:text-sm">
//                   TIME
//                 </p>
//                 <p className="text-xl font-bold sm:text-base md:text-lg">
//                   {new Date(subevent.time).toLocaleTimeString('en-US', {
//                     hour: '2-digit',
//                     minute: '2-digit',
//                   })}
//                 </p>
//               </div>

//               {subevent.address && (
//                 <div className="max-w-xs text-center sm:max-w-sm sm:text-left">
//                   <p className="text-xl font-semibold text-black sm:text-sm">
//                     LOCATION
//                   </p>
//                   <p className="break-words text-xl font-bold sm:text-base md:text-lg">
//                     {subevent.address}
//                   </p>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Divider */}
//         <div className="my-2 flex justify-center sm:my-3 md:my-4">
//           <img
//             src={divider}
//             alt="Divider"
//             className="h-4 w-64 object-cover sm:h-5 sm:w-72 md:h-5 md:w-80"
//           />
//         </div>

//         {/* Menu Section - Centered */}
//         <div className="mx-auto mb-4 max-w-4xl text-center sm:mb-6 md:mb-8 lg:mb-10">
//           <h3 className="font-serif text-2xl font-bold uppercase tracking-widest sm:text-3xl md:text-4xl lg:text-5xl">
//             Our Menu
//           </h3>
//           <div className="my-2 flex justify-center sm:my-3 md:my-4">
//             <img
//               src={divider}
//               alt="Divider"
//               className="h-4 w-64 object-cover sm:h-5 sm:w-72 md:h-5 md:w-80"
//             />
//           </div>
//         </div>

//         {/* Menu Items - Centered with mx-auto */}
//         <div className="mx-auto w-full max-w-md space-y-6 sm:max-w-lg sm:space-y-8 md:max-w-2xl md:space-y-10 lg:max-w-3xl xl:max-w-4xl">
//           {Object.entries(groupedDishes).map(([category, dishes]) => (
//             <div
//               key={category}
//               className="rounded-2xl border-2 border-black bg-white/10 p-3 shadow-lg transition sm:p-4 md:p-6 lg:p-8"
//             >
//               {/* Category Title - With dividers like Black Theme */}
//               <div className="mb-3 flex items-center justify-center text-center sm:mb-4">
//                 <div className="from-gray-800 to-gray-400 h-[1px] flex-1 bg-gradient-to-r opacity-70"></div>
//                 <h3
//                   className="mx-2 text-lg font-bold uppercase tracking-wider text-black sm:mx-3 sm:text-xl md:mx-3 md:text-2xl lg:text-3xl"
//                   style={titleFont}
//                 >
//                   {category}
//                 </h3>
//                 <div className="from-gray-800 to-gray-400 h-[1px] flex-1 bg-gradient-to-l opacity-70"></div>
//               </div>

//               {/* Dish List - Grid like Black Theme */}
//               <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 md:gap-6">
//                 {dishes.map((dish, j) => (
//                   <li
//                     key={j}
//                     className="rounded-lg bg-gradient-to-b from-white/20 to-white/20 p-3 text-center shadow-md transition-all hover:shadow-lg sm:p-4"
//                   >
//                     <p
//                       className="text-base font-semibold text-black sm:text-lg md:text-xl lg:text-2xl"
//                       style={elegantFont}
//                     >
//                       {dish.name}
//                     </p>
//                     {dish.description && (
//                       <p
//                         className="text-gray-700 mt-1 text-xl italic sm:text-sm md:text-base lg:text-lg"
//                         style={elegantFont}
//                       >
//                         ({dish.description})
//                       </p>
//                     )}
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           ))}
//         </div>

//         {/* Divider */}
//         <div className="my-2 flex justify-center sm:my-3 md:my-4">
//           <img
//             src={divider}
//             alt="Divider"
//             className="h-4 w-64 object-cover sm:h-5 sm:w-72 md:h-5 md:w-80"
//           />
//         </div>

//         {/* Contact Section */}
//         <div className="mt-6 space-y-2 text-center sm:mt-8 sm:space-y-3 md:mt-10 md:space-y-4">
//           <h4 className="font-serif text-base font-bold uppercase tracking-widest sm:text-lg md:text-xl lg:text-2xl">
//             Contact Us
//           </h4>

//           <div className="flex flex-col items-center justify-center gap-2 sm:flex-row sm:gap-4">
//             {cateror.phoneNumber && (
//               <div className="flex items-center space-x-2 text-xl sm:text-2xl md:text-2xl lg:text-2xl">
//                 <FaPhone className="text-lg sm:text-xl md:text-2xl" />
//                 <span className="text-lg font-bold sm:text-xl md:text-2xl">
//                   {cateror.phoneNumber}
//                 </span>
//               </div>
//             )}
//           </div>

//           {(caterorData?.data?.address || caterorData?.data?.city) && (
//             <div className="flex items-center justify-center space-x-2 text-center">
//               <span className="text-xl sm:text-2xl md:text-2xl lg:text-2xl">
//                 <MdLocationOn className="text-lg font-bold sm:text-xl md:text-2xl" />
//               </span>
//               <span className="break-words text-lg font-bold sm:text-xl md:text-2xl lg:text-2xl">
//                 {caterorData?.data?.address || ''}
//               </span>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ExternalOrangeTheme;

// components/QrThemes/BlackTheme.tsx
import {useGetCaterorById} from '@/lib/react-query/queriesAndMutations/cateror/dish';
import React from 'react';
import {FaPhoneSquareAlt} from 'react-icons/fa';
import {
  FaSquareFacebook,
  FaSquareInstagram,
  FaSquareYoutube,
} from 'react-icons/fa6';

interface BlackThemeProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  subeventData: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  caterorData: any;
  groupedDishes: Record<string, Array<{name: string; description: string}>>;
  eventDate: string;
  printRef: React.RefObject<HTMLDivElement>;
}

const ExternalBlackThemee: React.FC<BlackThemeProps> = ({
  subeventData,
  caterorData,
  groupedDishes,
  eventDate,
  printRef,
}) => {
  const subevent = subeventData;
  const cateror = subevent.event.cateror.user;
  const caterorIdcaterorId = caterorData?.data?.id;
  const {data: profiledata} = useGetCaterorById(caterorIdcaterorId || '');
  const facebook = profiledata?.data?.facebook;
  const instagram = profiledata?.data?.instagram;
  const youtube = profiledata?.data?.youtube;

  // Typography presets
  const titleFont = {fontFamily: "'Cinzel', serif"};
  const elegantFont = {fontFamily: "'Cormorant Garamond', serif"};
  const accentFont = {fontFamily: "'Marcellus', serif"};

  return (
    <div
      ref={printRef}
      className="relative mx-auto flex min-h-screen flex-col items-center overflow-hidden bg-gradient-to-b from-black-2 via-zinc-900 to-black-2 px-6 py-4"
      style={{
        maxWidth: '210mm',
        minHeight: '297mm',

        backgroundImage: `url(${orange})`,
      }}
    >
      {/* 🏛 Caterer / Header Section */}
      <div className="z-10 flex flex-col items-center text-center">
        <h1
          className="mb-1 text-4xl font-bold text-[#180333] sm:text-5xl md:text-6xl"
          style={titleFont}
        >
          Welcome To
        </h1>
        <div className="">
          <img
            src={caterorData?.data?.image}
            alt="Caterer"
            className="h-28 w-28 object-contain sm:h-36 sm:w-36"
          />
        </div>

        <h1
          className="mb-2 text-5xl font-bold text-[#180333] sm:text-6xl"
          style={titleFont}
        >
          {caterorData?.data?.user?.fullname || 'Business Name'}
        </h1>

        <p
          className="mt-1 text-base text-[#180333] sm:text-lg"
          style={elegantFont}
        >
          Culinary Excellence for Unforgettable Events
        </p>
      </div>

      {/* 🗓 Event Info */}
      <div className="mt-6 w-full max-w-2xl rounded-2xl border border-yellow-700 bg-black/70 p-6 text-center sm:p-8">
        <h2
          className="text-2xl font-semibold text-[#fff] sm:text-3xl"
          style={titleFont}
        >
          {subevent.name}
        </h2>

        <div
          className="mt-4 space-y-2 text-yellow-200 sm:text-lg"
          style={elegantFont}
        >
          <p>
            <span className="font-bold text-[#fff]" style={accentFont}>
              Date:
            </span>{' '}
            <span className="text-[#fff]">{eventDate}</span>
          </p>
          <p>
            <span className="font-bold text-[#fff]" style={accentFont}>
              Time:
            </span>{' '}
            <span className="text-[#fff]">
              {new Date(subevent.time).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </p>
          {subevent.address && (
            <p>
              <span className="font-bold text-[#fff]" style={accentFont}>
                Venue:
              </span>{' '}
              <span className="text-[#fff]">{subevent.address}</span>
            </p>
          )}
        </div>
      </div>

      {/* 🍽 Menu Header */}
      <div className="mt-6 text-center">
        <h2
          className="text-4xl font-bold uppercase text-[#ffffff] sm:text-5xl"
          style={titleFont}
        >
          Royal Menu
        </h2>
        <div className="mx-auto mt-3 h-1 w-20 rounded-full bg-yellow-700 sm:w-28"></div>
      </div>

      {/* 🍴 Menu Sections */}
      <div className="mt-6 w-full max-w-3xl space-y-6">
        {Object.entries(groupedDishes).map(([category, dishes], i) => (
          <div
            key={i}
            className="rounded-2xl border border-yellow-700 bg-black/50 p-6 shadow-lg transition sm:p-8"
          >
            {/* Category Title */}
            <div className="mb-4 flex items-center justify-center text-center">
              <div className="h-[1px] flex-1 bg-gradient-to-r from-yellow-700 to-yellow-400 opacity-70"></div>
              <h3
                className="mx-3 text-xl font-semibold uppercase tracking-wider text-[#ffffff] sm:text-2xl"
                style={titleFont}
              >
                {category}
              </h3>
              <div className="h-[1px] flex-1 bg-gradient-to-l from-yellow-700 to-yellow-400 opacity-70"></div>
            </div>

            {/* Dish List */}
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
              {dishes.map((dish, j) => (
                <li
                  key={j}
                  className="rounded-lg bg-gradient-to-b from-zinc-900/40 to-black/60 p-4 text-center hover:bg-black/70"
                >
                  <p
                    className="text-lg font-medium text-yellow-500 sm:text-xl"
                    style={elegantFont}
                  >
                    {dish.name}
                  </p>
                  {dish.description && (
                    <p
                      className="mt-1 text-[14px] italic text-[#ffffff] sm:text-base"
                      style={elegantFont}
                    >
                      {dish.description ? `(${dish.description})` : ''}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-8 space-y-3 text-center sm:mt-10 sm:space-y-4">
        <h1
          className="mb-2 text-5xl font-bold text-[#080324] sm:text-6xl"
          style={titleFont}
        >
          Contact Us
        </h1>
        <div className="mx-auto mt-3 h-1 w-20 rounded-full bg-yellow-700 sm:w-28"></div>
        {(caterorData?.data?.address || caterorData?.data?.city) && (
          <div className="flex">
            <span className="text-xl text-[#0f0529]">
              {caterorData?.data?.address || ''}
            </span>
          </div>
        )}
        <div className="flex items-center justify-center gap-2 sm:flex-row sm:gap-4">
          {cateror.phoneNumber && (
            <div className="flex items-center space-x-2 text-xl text-[#0a0516] sm:text-2xl lg:text-2xl">
              <span>(+91)&nbsp;{cateror.phoneNumber}</span>
            </div>
          )}
        </div>
      </div>
      <div className="mx-auto mt-3 h-1 w-20 rounded-full bg-yellow-700 sm:w-28"></div>

      <div className="mt-6 flex items-center justify-center gap-6">
        <>
          <a href={facebook} target="_blank" rel="noopener noreferrer">
            <FaSquareFacebook className="text-3xl text-[#0f081f]" />
          </a>
          <a href={instagram} target="_blank" rel="noopener noreferrer">
            <FaSquareInstagram className="text-3xl text-[#0f081f]" />
          </a>
          <a href={youtube} target="_blank" rel="noopener noreferrer">
            <FaSquareYoutube className="text-3xl text-[#0f081f]" />
          </a>
        </>
        <a
          href={`tel:${cateror.phoneNumber}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <FaPhoneSquareAlt
            className="text-3xl text-[#0f081f]"
            onClick={(e) => e.preventDefault()}
          />
        </a>
      </div>
    </div>
  );
};

export default ExternalBlackThemee;
