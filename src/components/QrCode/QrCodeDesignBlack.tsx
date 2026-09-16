import React, {useRef, useState} from 'react';
import QRCode from 'react-qr-code';
import {FaPhone} from 'react-icons/fa';
import {MdLocationOn} from 'react-icons/md';
import {BiArrowBack, BiDownload} from 'react-icons/bi';
import {useReactToPrint} from 'react-to-print';

interface QrCodeDesignBlackProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  caterorData: any;
  BASE_URL: string;
}

const QrCodeDesignBlack: React.FC<QrCodeDesignBlackProps> = ({
  caterorData,
  BASE_URL,
}) => {
  const printRef = useRef<HTMLDivElement>(null);
  const qrRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  // ✅ Print / PDF - Adjusted for single long page with no extra black margins
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `QR-Standee-${Math.random().toString(36).substring(7)}`,
    pageStyle: `
      @page {
        size: 5.2in 11.5in; /* Matches the standee dimensions for a single long page */
        margin: 0;
        padding: 0;
      }
      html, body {
        margin: 0;
        padding: 0;
        height: 100%;
        background: #fff; /* Changed to white to avoid extra black space */
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        color-adjust: exact !important;
      }
      .standee-container {
        width: 5.2in !important;
        height: 11.5in !important;
        background: #000;
        color: #fff;
        page-break-inside: avoid;
        page-break-after: avoid;
        margin: 0 !important; /* Override any class margins */
        margin-top: 0 !important; /* Specifically remove top margin from mt-8 class */
        padding: 0;
        box-sizing: border-box;
        position: relative; /* Ensure it fills the page exactly */
      }
      @media print {
        body { 
          -webkit-print-color-adjust: exact !important; 
          print-color-adjust: exact !important; 
          background: #fff !important; /* Ensure white background in print */
        }
        .standee-container { 
          break-inside: avoid;
          margin: 0 !important;
          margin-top: 0 !important;
          top: 0;
          left: 0;
        }
      }
    `,
  });

  // ✅ Print / PDF - For QR Scanner div only (square format)
  const handleQrPrint = useReactToPrint({
    contentRef: qrRef,
    documentTitle: `QR-Scanner-${Math.random().toString(36).substring(7)}`,
    pageStyle: `
      @page {
        size: 3in 3in; /* Square size for QR code */
        margin: 0;
        padding: 0;
      }
      html, body {
        margin: 0;
        padding: 0;
        height: 100%;
        background: #fff;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        color-adjust: exact !important;
      }
      .qr-scanner-container {
        width: 3in !important;
        height: 3in !important;
        margin: 0 !important;
        padding: 0;
        box-sizing: border-box;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
      }
      @media print {
        body { 
          -webkit-print-color-adjust: exact !important; 
          print-color-adjust: exact !important; 
          background: #fff !important;
        }
        .qr-scanner-container { 
          margin: 0 !important;
          top: 0;
          left: 0;
        }
      }
    `,
  });

  // ✅ Copy link
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(BASE_URL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleBack = () => window.history.back();

  // Helper to avoid duplicate address/city
  const getLocation = () => {
    const address = caterorData?.data?.address?.trim();
    const city = caterorData?.data?.city?.trim();
    if (!address && !city) return '';
    if (!address) return city;
    if (!city) return address;
    return `${address}, ${city}`;
  };

  return (
    <div className="bg-gray-100 flex min-h-screen flex-col items-center p-6">
      {/* ---------- Standee Preview ---------- */}
      <div
        className="standee-container mx-auto mt-8 overflow-hidden rounded-2xl shadow-2xl"
        ref={printRef}
        style={{
          width: '500px',
          height: '1100px',
          backgroundColor: '#000',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="relative h-full bg-black-2 p-1">
          <div className="absolute inset-0 bg-black-2 bg-gradient-to-r opacity-20 blur-sm"></div>
          <div className="relative z-10 flex h-full flex-col justify-between p-4 sm:p-6 md:p-10">
            <div className="flex flex-col items-center text-center">
              <h1
                className="mb-6 text-2xl font-bold text-yellow-400 sm:text-5xl md:text-4xl"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                  letterSpacing: '0.1em',
                }}
              >
                Welcome To
              </h1>

              <div className="mb-6 rounded-full p-2">
                <img
                  src={caterorData?.data?.image}
                  alt="Business Logo"
                  className="h-28 w-28 object-contain"
                />
              </div>

              {caterorData?.data?.user?.fullname && (
                <h1
                  className="mb-2 text-5xl font-bold text-yellow-400 sm:text-4xl"
                  style={{
                    fontFamily: "'Libre Baskerville', serif",
                    letterSpacing: '0.05em',
                    lineHeight: '1.1',
                    color: '#FFD700',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                  }}
                >
                  {caterorData.data.user.fullname}
                </h1>
              )}

              <p
                className="mb-2 text-xl text-yellow-300 sm:text-xl"
                style={{fontFamily: "'Crimson Text', serif"}}
              >
                for unforgettable events
              </p>
              <p
                className="text-lg text-yellow-200 sm:text-xl"
                style={{fontFamily: "'Crimson Text', serif"}}
              >
                Services designed to bring culinary excellence to your event.
              </p>
            </div>

            <div className="py-2">
              <h2
                className="font-serif mb-6 text-center text-2xl font-bold text-yellow-400 sm:text-3xl"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                  letterSpacing: '0.1em',
                }}
              >
                Our Royal Services
              </h2>

              <div className="flex justify-center">
                <div className="rounded-xl border-2 border-yellow-600 bg-black bg-opacity-50 p-4 backdrop-blur-sm sm:p-6">
                  <div className="grid grid-cols-1 gap-3 text-lg text-yellow-200 sm:grid-cols-2 sm:gap-4 sm:text-xl">
                    {[
                      'Royal Celebrations',
                      'Grand Weddings',
                      'Social Galas',
                      'Corporate Events',
                      'Birthday Parties',
                      'Anniversary Events',
                    ].map((item, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <span className="text-xl text-yellow-400">✦</span>
                        <span style={{fontFamily: "'Crimson Text', serif"}}>
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* QR Scanner Div - With ref for isolated print */}
            <div
              ref={qrRef}
              className="qr-scanner-container flex flex-col items-center py-4"
            >
              <div className="rounded-2xl border-4 border-yellow-500 bg-white p-4 shadow-2xl">
                <div className="rounded-lg border-2 border-yellow-300 p-2">
                  <QRCode
                    value={BASE_URL}
                    size={180}
                    bgColor="#ffffff"
                    fgColor="#000000"
                    level="H"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center space-y-4">
              {getLocation() && (
                <div className="flex items-center space-x-3">
                  <MdLocationOn className="h-5 w-5 text-yellow-400" />
                  <span
                    className="text-base text-yellow-200 sm:text-2xl"
                    style={{fontFamily: "'Crimson Text', serif"}}
                  >
                    {getLocation()}
                  </span>
                </div>
              )}

              {caterorData?.data?.user?.phoneNumber && (
                <div className="flex items-center space-x-3">
                  <FaPhone className="h-4 w-4 text-yellow-400" />
                  <span
                    className="text-base text-yellow-200 sm:text-2xl"
                    style={{fontFamily: "'Crimson Text', serif"}}
                  >
                    {caterorData.data.user.phoneNumber}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-center space-x-4">
        <button
          onClick={handleBack}
          className="flex items-center space-x-2 rounded-lg bg-yellow-700 px-6 py-3 text-white hover:bg-yellow-800"
        >
          <BiArrowBack className="h-5 w-5" />
          <span className="text-lg">Back</span>
        </button>

        <button
          onClick={handlePrint}
          className="flex items-center space-x-2 rounded-lg bg-yellow-800 px-6 py-3 text-white hover:bg-yellow-900"
        >
          <BiDownload className="h-5 w-5" />
          <span className="text-lg">Download Standee</span>
        </button>

        {/* New Button: Download QR Scanner PDF */}
        <button
          onClick={handleQrPrint}
          className="flex items-center space-x-2 rounded-lg bg-yellow-900 px-6 py-3 text-white hover:bg-yellow-950"
        >
          <BiDownload className="h-5 w-5" />
          <span className="text-lg">Download QR </span>
        </button>

        <button
          onClick={handleCopy}
          className="flex items-center space-x-2 rounded-lg bg-yellow-600 px-6 py-3 text-white hover:bg-yellow-700"
        >
          <span className="text-lg">{copied ? 'Copied!' : 'Copy Link'}</span>
        </button>
      </div>
    </div>
  );
};

export default QrCodeDesignBlack;
