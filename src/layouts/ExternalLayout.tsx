import Feedback from '@/components/Feedback/Feedback';
import {Loader} from '@/components/Loader/Loader';
import {useUpdateQRPageCount} from '@/lib/react-query/queriesAndMutations/cateror/feedback';
import React, {Suspense, lazy, useEffect} from 'react';
import {Route} from '@/routes/_external/qr.$id';

// Lazy load the ShowQrCodeData component
const ShowQrCodeData = lazy(() => import('@/components/QrCode/ShowQrCode'));

const ExternalLayout: React.FC = () => {
  const {id} = Route.useParams();
  const {mutateAsync: updatePageCount} = useUpdateQRPageCount(id);

  // Unique storage key for each QR page id
  const SESSION_KEY = `qr_page_count_${id}`;

  useEffect(() => {
    const alreadyUpdated = sessionStorage.getItem(SESSION_KEY);

    if (!alreadyUpdated) {
      updatePageCount()
        .then(() => {
          sessionStorage.setItem(SESSION_KEY, 'true');
        })
        .catch((error) => {
          console.error('Failed to update QR page count:', error);
        });
    }
  }, [id, updatePageCount]);

  return (
    <>
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center bg-black">
            <p className="text-xl text-white">
              <Loader />
            </p>
          </div>
        }
      >
        <ShowQrCodeData />
      </Suspense>
      <Feedback />
    </>
  );
};

export default ExternalLayout;
