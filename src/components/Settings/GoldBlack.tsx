/*eslint-disable*/
import {BiSolidPhone, BiSolidEnvelope, BiSolidMap} from 'react-icons/bi';
import {BsCheckSquareFill} from 'react-icons/bs';
import QRCode from 'react-qr-code';
import dishLeft from '@/assets/images/product/dish-2.avif';
import dishRight from '@/assets/images/product/saile-ilyas-SiwrpBnxDww-unsplash.jpg';

export const GoldDarkDesignPreview = ({
  caterorData,
  SubEventData,
  qrRef,
}: any) => {
  // --- Styling Constants ---
  const colors = {
    bg: '#3D3D40', // Darker charcoal (matches reference better)
    gold: '#CEA66F', // Muted gold (matches reference)
    goldDark: '#F2D194',
    text: '#E5E5E5',
  };

  const fonts = {
    header: "'Cinzel', serif",
    body: "'Cormorant Garamond', serif",
    brand: "'Playfair Display', serif",
  };

  // Safe data extraction
  const catererName = caterorData?.data?.user?.fullname || 'Catering Services';
  const catererPhone = caterorData?.data?.user?.phoneNumber || '(555) 555-0155';
  const catererAddress =
    caterorData?.data?.address || '556 Buckles Lane, Billings, Montana';
  const catererImage = caterorData?.data?.image;
  const eventLink = `https://menubook.cc/qr/${SubEventData?.data?.subevent?.id}`;

  return (
    <div
      ref={qrRef}
      className="relative flex h-full w-full flex-col overflow-hidden"
      style={{backgroundColor: colors.bg}}
    >
      {/* --- Content Container --- */}
      <div className="relative z-10 flex h-full flex-col justify-between px-3 py-3">
        {/* 1. Header Section - Image + Title Side by Side */}
        <div className="mb-1.5 flex items-center gap-2">
          {/* Food / Logo Image */}
          <div
            className="flex-shrink-0 overflow-hidden"
            style={{
              width: '78px',
              height: '68px',
              border: `1.5px solid ${colors.gold}`,
              boxShadow: '0 2px 6px rgba(0,0,0,0.45)',
            }}
          >
            {catererImage ? (
              <img
                src={catererImage}
                className="h-full w-full object-cover"
                crossOrigin="anonymous"
                alt="Caterer"
              />
            ) : (
              <div className="bg-gray-700 h-full w-full" />
            )}
          </div>

          {/* Title Text */}
          <div className="flex-1">
            <h1
              style={{
                fontFamily: fonts.brand,
                color: colors.gold,
                fontSize: '22px',
                letterSpacing: '0.08em',
                fontWeight: 700,
                lineHeight: '1.1',
                textTransform: 'uppercase',
                margin: 0,
              }}
            >
              {catererName}
            </h1>
          </div>
        </div>

        {/* 2. Sub-header */}
        <div className="mb-2 mt-0.5">
          <p
            className="mb-1 italic"
            style={{
              fontFamily: fonts.body,
              color: '#B8B8B8',
              fontSize: '13px',
              lineHeight: '1.3',
            }}
          >
            Delight your guests with an exceptional culinary experience
          </p>
          <h3
            className="text-center font-bold uppercase"
            style={{
              fontFamily: fonts.header,
              color: colors.gold,
              fontSize: '15px',
              letterSpacing: '0.12em',
              marginTop: '2px',
              marginBottom: '2px',
            }}
          >
            Scan For Today's Menu
          </h3>
        </div>

        {/* 3. QR Code Section (Centered over Gold Band) */}
        {/* 3. QR + Decorative Images Row */}
        <div className="mb-2 flex items-center justify-center">
          {/* Left Decorative Image */}
          <div
            className="h-[90px] w-[90px] overflow-hidden border-2"
            style={{borderColor: colors.gold}}
          >
            <img
              src={dishLeft}
              alt="Food Left"
              className="h-full w-full object-cover"
            />
          </div>

          {/* QR Container */}
          <div
            className="relative"
            style={{
              padding: '10px',
              border: `3px solid ${colors.gold}`,
              backgroundColor: colors.bg,
              boxShadow: '0 6px 20px rgba(0,0,0,0.6)',
            }}
          >
            <div className="bg-#CEA66F p-2">
              <QRCode
                value={eventLink}
                size={80}
                fgColor="#CEA66F"
                bgColor="#3D3D40"
              />
            </div>

            {/* Corner Brackets */}
            <div
              className="border-t-2.5 border-l-2.5 absolute left-[3px] top-[3px] h-[14px] w-[14px]"
              style={{borderColor: colors.gold}}
            />
            <div
              className="border-t-2.5 border-r-2.5 absolute right-[3px] top-[3px] h-[14px] w-[14px]"
              style={{borderColor: colors.gold}}
            />
            <div
              className="border-b-2.5 border-l-2.5 absolute bottom-[3px] left-[3px] h-[14px] w-[14px]"
              style={{borderColor: colors.gold}}
            />
            <div
              className="border-b-2.5 border-r-2.5 absolute bottom-[3px] right-[3px] h-[14px] w-[14px]"
              style={{borderColor: colors.gold}}
            />
          </div>

          {/* Right Decorative Image */}
          <div
            className="h-[90px] w-[90px] overflow-hidden border-2"
            style={{borderColor: colors.gold}}
          >
            <img
              src={dishRight}
              alt="Food Right"
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        {/* 4. Services List */}
        <div className="mb-1.5 w-full">
          {/* Section Title with Divider */}
          <div className="mb-0.5 flex items-center justify-center">
            <div
              className="h-[1px] flex-1"
              style={{backgroundColor: colors.gold, opacity: 0.35}}
            ></div>
            <h4
              className="px-0.5 uppercase"
              style={{
                fontFamily: fonts.header,
                color: colors.gold,
                fontSize: '15px',
                letterSpacing: '0.12em',
                fontWeight: 600,
              }}
            >
              Our Services
            </h4>
            <div
              className="h-[1px] flex-1"
              style={{backgroundColor: colors.gold, opacity: 0.35}}
            ></div>
          </div>

          {/* Service Grid */}
          <div
            className="mt-0.5 grid grid-cols-2 gap-x-1.5 gap-y-0.5"
            style={{
              fontFamily: fonts.body,
              color: '#E0E0E0',
              fontSize: '12px',
              lineHeight: '1.2',
            }}
          >
            {[
              'Corporate Events',
              'Birthday Celebrations',
              'Weddings',
              'Social Gatherings',
            ].map((service) => (
              <div key={service} className="flex items-center gap-1">
                <span
                  style={{color: colors.gold, fontSize: '10px', lineHeight: 1}}
                >
                  ◆
                </span>
                <span style={{letterSpacing: '0.02em'}}>{service}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-auto flex w-full flex-col items-center gap-1">
          {/* Contact Box */}
          <div
            className="text-center font-bold uppercase"
            style={{
              border: `1px solid ${colors.gold}`,
              padding: '3px 16px',
              color: colors.gold,
              fontSize: '10px',
              letterSpacing: '0.18em',
              fontFamily: fonts.header,
              transform: 'translateY(-4px)', // reliably moves it up
            }}
          >
            Contact us
          </div>

          {/* Info Lines */}
          <div
            className="w-full space-y-0 text-center"
            style={{
              fontFamily: fonts.body,
              color: '#C0C0C0',
              fontSize: '10px',
              paddingTop: '3px',
              borderTop: `1px solid ${colors.gold}`,
              lineHeight: '1.15',
            }}
          >
            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="flex items-center gap-0.5">
                <span style={{color: colors.gold, fontSize: '9px'}}>☐</span>
                {catererPhone}
              </span>
              <span className="flex items-center gap-0.5">
                <span style={{color: colors.gold, fontSize: '9px'}}>☐</span>
                {caterorData?.data?.user?.email}
              </span>
            </div>
            <div className="flex items-center justify-center gap-1">
              <span style={{color: colors.gold, fontSize: '7px'}}>●</span>
              {catererAddress}
            </div>
          </div>

          {/* Bottom border and website */}
          <div
            className="w-full"
            style={{
              borderBottom: `1px solid ${colors.gold}`,
              marginTop: '4px',
              marginBottom: '2px',
            }}
          ></div>

          <p
            className="uppercase"
            style={{
              fontSize: '8px',
              color: colors.gold,
              letterSpacing: '0.16em',
              fontFamily: fonts.body,
            }}
          >
            www.cateringservice.site.com
          </p>
        </div>
      </div>
    </div>
  );
};
