/*eslint-disable*/
import React from 'react';
import {BiSolidPhone, BiSolidEnvelope, BiSolidMap} from 'react-icons/bi';
import {BsCheckSquareFill} from 'react-icons/bs';
import QRCode from 'react-qr-code';
import frameImagePath from '@/assets/images/template/Classic.png';

// Main Preview Component with Background Image
export const ClassicDesignPreview = ({
  caterorData,
  SubEventData,
  qrRef,
}: any) => {
  const colors = {
    bg: '#F2EBDC',
    primary: '#1B365D',
    text: '#2C3E50',
  };

  // Data Extraction
  const catererName = caterorData?.data?.user?.fullname || 'CATERING SERVICES';
  const catererPhone = caterorData?.data?.user?.phoneNumber || '555-0155';
  const catererAddress = caterorData?.data?.address || '556 Buckley Ln, KC, MO';
  const catererWebsite = 'www.cateringservice.com';
  const catererImage = caterorData?.data?.image;
  const eventLink = `https://menubook.cc/qr/${SubEventData?.data?.subevent?.id || 'demo'}`;

  return (
    <div
      ref={qrRef}
      className="font-serif relative mx-auto flex aspect-[1/2] w-full max-w-sm select-none flex-col items-center overflow-hidden"
      style={{backgroundColor: colors.bg}}
    >
      {/* --- Background Frame Image --- */}
      <img
        src={frameImagePath}
        alt="Standee Frame"
        className="pointer-events-none absolute inset-0 z-0 h-full w-full object-fill"
        crossOrigin="anonymous"
      />

      {/* --- Main Content Area --- */}
      <div className="relative z-10 flex h-full w-full flex-col items-center px-6 py-8 text-[#1B365D]">
        {/* Header Section - Logo Left, Name Vertically Centered, Tagline Below */}
        {/* Header Section - Logo Left, Name Same Height, Tagline Below */}
        <div className="mb-2 w-full px-1">
          <div className="flex items-center">
            {/* Square Logo */}
            <div
              className="flex flex-shrink-0 items-center justify-center bg-white"
              style={{
                width: 54,
                height: 54,
                border: '2px solid #1B365D',
                boxShadow: '0 2px 6px rgba(0,0,0,0.22)',
              }}
            >
              {catererImage ? (
                <img
                  src={catererImage}
                  className="h-full w-full object-cover"
                  crossOrigin="anonymous"
                  alt="Caterer Logo"
                />
              ) : (
                <div className="h-full w-full bg-[#D8C9A3]/40" />
              )}
            </div>

            {/* Name (Exact Same Visual Height as Logo) */}
            <div
              className="ml-3 grid flex-1 place-items-center overflow-hidden"
              style={{height: 54}}
            >
              <h1
                className="text-center font-bold uppercase leading-none"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  color: '#1B365D',
                  fontSize: '18px',
                  letterSpacing: '0.12em',
                  maxHeight: '54px',
                  lineHeight: '1',
                  display: 'block',
                  wordBreak: 'break-word',
                }}
              >
                {catererName}
              </h1>
            </div>
          </div>

          {/* Tagline */}
          <p
            className="mt-3 text-center italic leading-tight"
            style={{
              fontFamily: "'Crimson Text', serif",
              color: '#5A6B82',
              fontSize: '11px',
              marginBottom: '12px',
            }}
          >
            Delight your guests with an exceptional culinary experience
          </p>
          <h3
            className="text-center font-bold uppercase"
            style={{
              fontFamily: "'Playfair Display', serif",
              color: '#1B365D',
              fontSize: '12.5px',
              letterSpacing: '0.14em',
              marginBottom: '8px', // very small gap before QR
            }}
          >
            Scan For Today’s Menu
          </h3>
        </div>

        <div className="-mt-2 flex w-full flex-grow flex-col items-center gap-2">
          {/* QR */}
          <div className="-mt-1 mb-4 rounded border border-[#1B365D] bg-[#F5EFD8] p-1 shadow-sm">
            <QRCode
              value={eventLink}
              size={102}
              fgColor="#1B365D"
              bgColor="#F5EFD8"
            />
          </div>

          {/* Our Services Title */}
          <h3 className="mb-0 text-[12px] font-bold uppercase leading-none tracking-wider text-[#1B365D]">
            Our Services
          </h3>

          {/* Services List */}
          <div className="-mt-0.5 w-full max-w-[210px] border-b border-t border-[#1B365D]/20 pb-1 pt-0">
            <div className="grid grid-cols-2 gap-x-2 gap-y-1 pl-3">
              {[
                'Corporate',
                'Weddings',
                'Birthdays',
                'Socials',
                'Luxury & VIP Events',
                'Public & Outdoor Events',
              ].map((service) => (
                <div
                  key={service}
                  className="flex items-center gap-1 text-[10.5px] font-semibold leading-tight"
                >
                  <BsCheckSquareFill className="text-[8px]" />
                  <span>{service}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="mb-2.5 mt-auto flex w-full flex-col items-center">
          {/* Contact Label */}
          <div className="mb-1 border border-[#1B365D] px-3 py-0.5 text-[9.5px] font-bold uppercase tracking-widest">
            Contact
          </div>

          <div className="space-y-0.5 text-center">
            {/* Phone + Email */}
            <div className="flex items-center justify-center gap-2 text-[9.5px] leading-none">
              <span className="flex items-center gap-1">
                <BiSolidPhone size={8} /> {catererPhone}
              </span>
              <span className="h-3 w-[1px] bg-[#1B365D] opacity-40"></span>
              <span className="flex items-center gap-1">
                <BiSolidEnvelope size={8} /> {caterorData?.data?.user?.email}
              </span>
            </div>

            {/* Address */}
            <div className="flex items-start justify-center gap-1 border-b border-[#1B365D]/30 pb-0.5 text-[9.5px] leading-none">
              <BiSolidMap size={8} className="mt-[1px]" />
              <span>{catererAddress}</span>
            </div>

            {/* Website */}
            <div className="pt-0.5 text-[8.5px] font-bold leading-none tracking-wider opacity-80">
              {catererWebsite}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
