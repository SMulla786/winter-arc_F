import React, {useRef, useState} from 'react';
import {useAuthContext} from '@/context/AuthContext';
import {useGetCaterorById} from '@/lib/react-query/queriesAndMutations/cateror/dish';
import {useGetSubEventDesign} from '@/lib/react-query/queriesAndMutations/cateror/designselection';
import {useGetSubeventById} from '@/lib/react-query/queriesAndMutations/cateror/event';
import {Route} from '@/routes/_app/_event/qrgenerator.$id';
import {useReactToPrint} from 'react-to-print';
import {BiArrowBack, BiDownload} from 'react-icons/bi';
import QRCode from 'react-qr-code';
import menucardbg from '@/assets/images/menucard/menucard1.jpg';
import {FaPhone} from 'react-icons/fa';
import {MdLocationOn} from 'react-icons/md';

const QRCodeDesign = () => {
  const {id} = Route.useParams<{id: string}>();
  const {user} = useAuthContext();
  const {
    data: caterorData,
    isLoading,
    isError,
  } = useGetCaterorById(user?.caterorId ?? '');
  const {data: design} = useGetSubEventDesign(id);
  const {data: SubEventData} = useGetSubeventById(id!);

  const QR_BASE_URL = import.meta.env.VITE_QR_BASE_URL || 'menubook.cc';
  const BASE_URL = `${QR_BASE_URL}/qr/${id || 'default'}`;

  const printRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `QR-${Math.random().toString(36).substring(7)}`,
    pageStyle: `
      @page { size: A4; margin: 0; }
      body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; background: white !important; height: 400vh; display: flex; align-items: center; justify-content: center; }
    `,
  });

  const handleBack = () => window.history.back();
  const [showOptions, setShowOptions] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(BASE_URL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  if (isLoading)
    return (
      <div className="to-gray-100 flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50">
        <div className="bg-gray-800 rounded-xl p-8 text-center shadow-lg">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
          <p className="text-gray-300 mt-4">Loading user data...</p>
        </div>
      </div>
    );

  if (isError)
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="bg-gray-800 rounded-xl p-8 text-center shadow-lg">
          <div className="mb-4 text-red-500">⚠️</div>
          <h3 className="mb-2 text-xl font-bold text-red-400">
            Error loading user data
          </h3>
          <p className="text-gray-300">Please try again later</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-8">
      <div className="border-3 mx-auto mt-8 w-full max-w-2xl overflow-hidden rounded-2xl border-amber-600 bg-gradient-to-br from-orange-300 to-amber-600 shadow-2xl">
        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="flex flex-col items-center pb-6 text-center">
            <h1 className="mb-4 text-3xl font-bold text-black sm:text-4xl md:text-5xl">
              Welcome To
            </h1>
            <img
              src={caterorData?.data?.image}
              alt="Business Logo"
              className="mx-auto mb-4 h-32 w-32 rounded-full border-4 border-amber-600 object-cover shadow-lg sm:h-40 sm:w-40 md:h-48 md:w-48"
              // style={{boxShadow: '0 0 30px rgba(255,165,0,0.6)'}}
            />
            {caterorData?.data?.user?.fullname && (
              <h2 className="font-serif text-2xl font-bold tracking-wide text-black sm:text-3xl md:text-4xl lg:text-5xl">
                {caterorData.data.user.fullname}
              </h2>
            )}
            <p className="mt-2 text-lg text-black sm:text-xl md:text-2xl">
              for unforgettable events
            </p>
            <p className="mt-2 text-base text-black sm:text-lg md:text-xl">
              Services designed to bring culinary excellence to your event.
            </p>
          </div>

          {/* Subtitle */}
          <div className="mb-6 flex flex-col items-center uppercase">
            <h2 className="mb-2 text-lg font-bold text-black sm:text-xl md:text-2xl">
              Catering Planner
            </h2>
            <h2 className="font-bold text-black sm:text-xl md:text-2xl">&</h2>
            <h2 className="mt-2 text-lg font-bold text-black sm:text-xl md:text-2xl">
              Event Management
            </h2>
          </div>

          {/* Divider */}
          <div className="my-6 border-t border-amber-500"></div>

          {/* QR Code */}
          <div className="flex flex-col items-center py-6">
            <h3 className="font-serif mb-4 text-lg tracking-widest text-black sm:text-xl md:text-2xl">
              SCAN HERE
            </h3>
            <div
              className="rounded-lg border-4 border-amber-600 bg-white p-4 shadow-xl"
              ref={printRef}
            >
              <QRCode
                value={BASE_URL}
                size={window.innerWidth < 400 ? 120 : 180}
                bgColor="#ffffff"
                fgColor="#000000"
                level="H"
              />
            </div>
            <p className="mt-2 text-sm text-black sm:text-base md:text-lg">
              {design?.data?.design?.menuName}
            </p>
          </div>

          {/* Contact Info */}
          <div className="flex flex-col items-center space-y-2 text-black">
            {(caterorData?.data?.address || caterorData?.data?.city) && (
              <div className="flex items-center space-x-2 text-sm sm:text-base md:text-lg">
                <MdLocationOn className="h-4 w-4 text-yellow-400" />
                <span>
                  {caterorData?.data?.address || ''}
                  {caterorData?.data?.address && caterorData?.data?.city
                    ? ', '
                    : ''}
                  {caterorData?.data?.city || ''}
                </span>
              </div>
            )}
            {caterorData?.data?.user?.phoneNumber && (
              <div className="flex items-center space-x-2 text-sm sm:text-base md:text-lg">
                <FaPhone className="h-3 w-3 text-black" />
                <span>{caterorData.data.user.phoneNumber}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row print:hidden">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 rounded-lg border-2 border-amber-600 px-5 py-2 font-semibold text-black shadow-lg transition hover:bg-amber-600 hover:text-white sm:px-6 sm:py-3"
        >
          <BiArrowBack className="h-5 w-5" /> Back
        </button>

        <div className="text-center">
          <button
            onClick={() => setShowOptions(true)}
            className="flex items-center justify-center gap-2 rounded-lg border-2 border-amber-600 bg-amber-600 px-5 py-2 font-semibold text-white shadow-lg hover:bg-amber-700 sm:px-6 sm:py-3"
          >
            Link Of QR
          </button>

          {showOptions && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
              <div className="w-11/12 max-w-sm rounded-xl border-2 border-amber-600 bg-white p-6 text-center shadow-[0_0_25px_rgba(245,158,11,0.3)]">
                <h2 className="mb-4 text-lg font-semibold text-amber-800">
                  QR Link Options
                </h2>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => {
                      window.open(BASE_URL, '_blank');
                      setShowOptions(false);
                    }}
                    className="rounded-md border border-amber-500 px-4 py-2 text-amber-700 hover:bg-amber-500 hover:text-white"
                  >
                    Open Link
                  </button>
                  <button
                    onClick={handleCopy}
                    className="rounded-md border border-amber-500 px-4 py-2 text-amber-700 hover:bg-amber-500 hover:text-white"
                  >
                    {copied ? 'Copied!' : 'Copy Link'}
                  </button>
                  <button
                    onClick={() => setShowOptions(false)}
                    className="mt-2 rounded-md border border-amber-300 px-4 py-2 text-amber-600 hover:bg-amber-100"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={handlePrint}
          className="flex items-center gap-2 rounded-lg border-2 border-amber-600 bg-amber-600 px-5 py-2 font-semibold text-white shadow-lg hover:bg-amber-700 sm:px-6 sm:py-3"
        >
          <BiDownload className="h-5 w-5" /> Download QR
        </button>
      </div>
    </div>
  );
};

export default QRCodeDesign;
