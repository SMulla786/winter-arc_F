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
      }}
    >
      {/* 🏛 Caterer / Header Section */}
      <div className="z-10 flex flex-col items-center text-center">
        <h1
          className="mb-1 text-4xl font-bold text-[#c7a552] sm:text-5xl md:text-6xl"
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
          className="mb-2 text-5xl font-bold text-[#c7a552] sm:text-6xl"
          style={titleFont}
        >
          {caterorData?.data?.user?.fullname || 'Business Name'}
        </h1>

        <p
          className="mt-1 text-base text-[#c7a552] sm:text-lg"
          style={elegantFont}
        >
          Culinary Excellence for Unforgettable Events
        </p>
      </div>

      {/* 🗓 Event Info */}
      <div className="mt-6 w-full max-w-2xl rounded-2xl border border-yellow-700 bg-black/40 p-6 text-center sm:p-8">
        <h2
          className="text-2xl font-semibold text-[#c7a552] sm:text-3xl"
          style={titleFont}
        >
          {subevent.name}
        </h2>

        <div
          className="mt-4 space-y-2 text-yellow-200 sm:text-lg"
          style={elegantFont}
        >
          <p>
            <span className="text-[#c7a552]" style={accentFont}>
              Date:
            </span>{' '}
            {eventDate}
          </p>
          <p>
            <span className="text-[#c7a552]" style={accentFont}>
              Time:
            </span>{' '}
            {new Date(subevent.time).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
          {subevent.address && (
            <p>
              <span className="text-[#c7a552]" style={accentFont}>
                Venue:
              </span>{' '}
              {subevent.address}
            </p>
          )}
        </div>
      </div>

      {/* 🍽 Menu Header */}
      <div className="mt-6 text-center">
        <h2
          className="text-4xl font-bold uppercase text-[#c7a552] sm:text-5xl"
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
                className="mx-3 text-xl font-semibold uppercase tracking-wider text-[#c7a552] sm:text-2xl"
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
                    className="text-lg font-medium text-yellow-200 sm:text-xl"
                    style={elegantFont}
                  >
                    {dish.name}
                  </p>
                  {dish.description && (
                    <p
                      className="mt-1 text-sm italic text-[#c7a552] sm:text-base"
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
          className="mb-2 text-5xl font-bold text-[#c7a552] sm:text-6xl"
          style={titleFont}
        >
          Contact Us
        </h1>
        <div className="mx-auto mt-3 h-1 w-20 rounded-full bg-yellow-700 sm:w-28"></div>
        {(caterorData?.data?.address || caterorData?.data?.city) && (
          <div className="flex">
            <span className="text-xl text-[#c7a552]">
              {caterorData?.data?.address || ''}
            </span>
          </div>
        )}
        <div className="flex items-center justify-center gap-2 sm:flex-row sm:gap-4">
          {cateror.phoneNumber && (
            <div className="flex items-center space-x-2 text-xl text-[#c7a552] sm:text-2xl lg:text-2xl">
              <span>(+91)&nbsp;{cateror.phoneNumber}</span>
            </div>
          )}
        </div>
      </div>
      <div className="mx-auto mt-3 h-1 w-20 rounded-full bg-yellow-700 sm:w-28"></div>

      <div className="mt-6 flex items-center justify-center gap-6">
        <>
          <a href={facebook} target="_blank" rel="noopener noreferrer">
            <FaSquareFacebook className="text-3xl text-[#e4b94d]" />
          </a>
          <a href={instagram} target="_blank" rel="noopener noreferrer">
            <FaSquareInstagram className="text-3xl text-[#e4b94d]" />
          </a>
          <a href={youtube} target="_blank" rel="noopener noreferrer">
            <FaSquareYoutube className="text-3xl text-[#e4b94d]" />
          </a>
        </>
        <a
          href={`tel:${cateror.phoneNumber}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <FaPhoneSquareAlt
            className="text-3xl text-[#e4b94d]"
            onClick={(e) => e.preventDefault()}
          />
        </a>
      </div>
    </div>
  );
};

export default ExternalBlackThemee;
