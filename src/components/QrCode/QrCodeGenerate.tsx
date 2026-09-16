import React, {useState} from 'react';
import {useAuthContext} from '@/context/AuthContext';
import {useGetCaterorById} from '@/lib/react-query/queriesAndMutations/cateror/dish';
import {useGetSubEventDesign} from '@/lib/react-query/queriesAndMutations/cateror/designselection';
import {useGetSubeventById} from '@/lib/react-query/queriesAndMutations/cateror/event';
import {useGetQrDesign} from '@/lib/react-query/queriesAndMutations/cateror/designselection';
import {Route} from '@/routes/_app/_event/qrgenerator.$id';
import QrCardStaticDesign from '../Settings/QrSaticDesign';
import QrCodeDesignOrange from './QrCodeDesignOrange'; // Import orange component
import QrCodeDesignBlack from './QrCodeDesignBlack'; // Import black component

const QrCodeGenerator = () => {
  // ✅ Get parameters, user info, and API data
  const {id} = Route.useParams<{id: string}>();
  const {user} = useAuthContext();
  const {
    data: caterorData,
    isLoading,
    isError,
  } = useGetCaterorById(user?.caterorId ?? '');

  const {data: design} = useGetSubEventDesign(id);
  console.log('Design data:', design);
  const {data: SubEventData} = useGetSubeventById(id!);

  //  QR Base URL
  const QR_BASE_URL = import.meta.env.VITE_QR_BASE_URL || 'menubook.cc';
  const BASE_URL = `${QR_BASE_URL}/qr/${id || 'default'}`;

  //  Back button functionality
  const handleBack = () => {
    window.history.back();
  };

  // ✅ Link modal (Open/Copy)
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

  // ✅ Loading state
  if (isLoading)
    return (
      <div className="to-gray-100 dark:from-gray-900 dark:to-gray-800 flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50">
        <div className="bg-gray-800 rounded-xl p-8 text-center shadow-lg">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
          <p className="text-gray-300 mt-4">Loading user data...</p>
        </div>
      </div>
    );

  // ✅ Error state
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
            className="mt-4 rounded-lg bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );

  // Determine which component to render based on design colour

  return (
    <>
      <div className="min-h-screen p-4 sm:p-6 md:p-8">
        <QrCardStaticDesign subEventId={id} SubEventData={SubEventData} />
      </div>
    </>
  );
};

export default QrCodeGenerator;
