import React, {useMemo} from 'react';
import {BiSolidMap, BiSolidPhone, BiSolidEnvelope} from 'react-icons/bi';
import bgImage from '../../assets/images/template/Greeen.jpeg';

interface UserData {
  fullname?: string;
  phoneNumber?: string;
  email?: string;
  website?: string;
}

interface CatererData {
  data?: {
    user?: UserData;
    address?: string;
    image?: string;
  };
}

interface SubEventData {
  data?: {
    subevent?: {
      id?: string;
    };
  };
}

interface GreenDesignProps {
  caterorData: CatererData;
  SubEventData: SubEventData;
  qrRef: React.RefObject<HTMLDivElement>;
}

export const GreenDesign: React.FC<GreenDesignProps> = ({
  caterorData,
  SubEventData,
  qrRef,
}) => {
  const {name, phone, email, website, address, logoUrl, eventLink} =
    useMemo(() => {
      const user = caterorData?.data?.user;
      const subEventId = SubEventData?.data?.subevent?.id || 'demo';

      return {
        name: user?.fullname || 'CATERING SERVICES',
        phone: user?.phoneNumber || '(555) 555-0155',
        email: user?.email || 'info@catering.site.com',
        website: user?.website || 'www.cateringservice.site.com',
        address: caterorData?.data?.address || '556 Buckley, Kansas City, MO',
        logoUrl: caterorData?.data?.image || null,
        eventLink: `https://menubook.cc/qr/${subEventId}`,
      };
    }, [caterorData, SubEventData]);

  const qrCodeUrl = `https://quickchart.io/qr?text=${encodeURIComponent(eventLink)}&dark=d4a574&light=0a3d2e&ecLevel=Q&size=280&margin=0`;

  const services = [
    'Corporate event',
    'Birthday Celebrations',
    'Weddings',
    'Social Events',
  ];

  return (
    <div
      ref={qrRef}
      className="relative mx-auto flex aspect-[1/2] w-full max-w-[400px] flex-col overflow-hidden shadow-2xl"
    >
      {/* Background */}
      <div
        className="absolute inset-0 bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundSize: '100% 100%',
        }}
      />

      {/* Main Content */}
      <div className="relative z-20 flex h-full w-full flex-col px-5 py-5">
        {/* Header */}
        <div className="mb-2.5 flex items-center gap-2">
          <div className="ml-1 flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded border-2 border-[#BF9460]/50 bg-white/95">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="Logo"
                className="h-full w-full object-contain"
                crossOrigin="anonymous"
              />
            ) : (
              <span className="text-xl font-bold text-[#BF9460]">
                {name.charAt(0)}
              </span>
            )}
          </div>

          <div className="flex h-14 items-center">
            <h1 className="text-lg font-bold uppercase leading-none tracking-[0.1em] text-[#BF9460]">
              {name}
            </h1>
          </div>
        </div>

        {/* Tagline */}
        <p className="mb-3.5 text-center text-[10.5px] leading-relaxed tracking-wide text-amber-100 opacity-90">
          Delight your guests with an exceptional culinary experience
        </p>

        {/* QR Section */}
        <div className="mb-4 flex flex-col items-center">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[#BF9460]">
            Scan For Today's Menu
          </p>

          <div className="relative">
            <div className="rounded-lg border border-[#BF9460]/50 bg-gradient-to-br from-emerald-950/80 to-emerald-900/60 p-2 shadow-md">
              <img
                src={qrCodeUrl}
                alt="QR Code"
                className="h-24 w-24 rounded object-contain"
                crossOrigin="anonymous"
              />
            </div>
            <div className="pointer-events-none absolute inset-0 rounded-lg border border-[#BF9460]/20"></div>
          </div>
        </div>

        {/* Services */}
        <div className="mb-3">
          <h3 className="mb-0 text-center text-[10.5px] font-semibold uppercase tracking-widest text-[#BF9460]">
            Our Service
          </h3>

          <div className="grid grid-cols-2 gap-x-3 gap-y-1 px-1">
            {services.map((service, idx) => (
              <div
                key={idx}
                className="flex items-center gap-1.5 text-[9px] tracking-wide text-amber-100"
              >
                <span className="text-[10px] leading-none text-[#BF9460]">
                  ◆
                </span>
                <span className="leading-snug">{service}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-auto border-t border-[#BF9460]/30 pt-2.5">
          <h4 className="mb-1 text-center text-[10.5px] font-semibold uppercase tracking-widest text-[#BF9460]">
            Contact Us
          </h4>

          <div className="mx-auto mb-1 h-[1px] w-20 bg-[#BF9460]/40"></div>

          <div className="space-y-1 text-center text-[9.5px] leading-snug text-amber-100">
            {/* Phone + Email */}
            <div className="flex items-center justify-center gap-2 leading-none">
              <span className="flex items-center gap-1">
                <BiSolidPhone size={8} className="text-[#BF9460]" /> {phone}
              </span>

              <span className="h-3 w-[1px] bg-[#BF9460]/40"></span>

              <span className="flex items-center gap-1">
                <BiSolidEnvelope size={8} className="text-[#BF9460]" /> {email}
              </span>
            </div>

            {/* Address (wraps, icon aligned to first line) */}
            <div className="flex items-start justify-center gap-1">
              <BiSolidMap
                size={11}
                className="mt-[1px] flex-shrink-0 text-[#BF9460]"
              />
              <span className="max-w-[95%] leading-snug">{address}</span>
            </div>
          </div>

          <div className="mx-auto mt-2 h-[1px] w-28 bg-[#BF9460]/25"></div>

          <div className="mt-1.5 text-center text-[10px] font-medium tracking-normal text-amber-100 opacity-95">
            {website}
          </div>
        </div>
      </div>
    </div>
  );
};
