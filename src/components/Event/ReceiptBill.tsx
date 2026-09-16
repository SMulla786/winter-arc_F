import React, {useRef} from 'react';
import GenericButton from '../Forms/Buttons/GenericButton';
import {useReactToPrint} from 'react-to-print';
import {useLocation, useNavigate} from '@tanstack/react-router';
import {useAuthContext} from '@/context/AuthContext';
import Image from '../../assets/images/logo/MenuImage2.jpg';
import {useGetQuatation} from '@/lib/react-query/queriesAndMutations/cateror/quatation';
import {useGetClientById} from '@/lib/react-query/queriesAndMutations/cateror/client';
import {useGetCaterorById} from '@/lib/react-query/queriesAndMutations/cateror/dish';
import {useGetIncomeExpenseByCaterorId} from '@/lib/react-query/queriesAndMutations/cateror/income';
import {ArrowLeft} from 'lucide-react';

const ReceiptBill: React.FC = () => {
  const location = useLocation();
  const myData = location.state?.myData;
  const {user} = useAuthContext();
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Receipt-${Math.random().toString(36).substring(7)}`,
    pageStyle: `
      @page { size: A4 portrait; margin: 10mm; }
      @media print {
        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        #receipt { page-break-inside: avoid; break-inside: avoid; }
        .no-print { display: none !important; }
      }
    `,
  });

  const {data: profiledata} = useGetCaterorById(user?.caterorId || '');
  const eventId = myData?.event?.id || myData?.eventId;
  const {data: quotation} = useGetQuatation(eventId);
  const {data: client} = useGetClientById(quotation?.event?.clientId ?? '');

  const options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  };
  const today = new Date()
    .toLocaleDateString('en-GB', options)
    .replace(',', '');

  const navigate = useNavigate();

  return (
    <div className="bg-gray-100 flex min-h-screen flex-col items-center p-6">
      {/* Top Action Bar - At the very top of the page */}
      <div className="no-print mb-6 flex w-full max-w-3xl items-center justify-between">
        {/* Back Button (left side) */}
        <GenericButton
          onClick={() => navigate({to: `/events/${eventId}`})}
          className="hover:text-gray-700 flex items-center gap-2 bg-transparent px-0 py-0 text-black shadow-none"
        >
          <ArrowLeft className="h-5 w-5 text-black" />
          <span className="font-medium text-black">Back to Page</span>
        </GenericButton>

        {/* Print Button (right side) */}
        <GenericButton
          type="button"
          onClick={handlePrint}
          className="rounded bg-blue-700 px-6 py-2 font-semibold text-white shadow hover:bg-blue-800"
        >
          Print Receipt
        </GenericButton>
      </div>

      {/* Centered Receipt */}
      <div
        className="border-gray-400 w-full max-w-3xl border bg-white p-6 text-black shadow-lg"
        ref={printRef}
        id="receipt"
      >
        {/* Header */}
        <div className="border-gray-500 flex items-center justify-between border-b border-dashed pb-2">
          <div className="flex items-center">
            <img
              src={Image}
              alt="Logo"
              className="mr-3 h-16 w-16 rounded-full"
            />
            <div>
              <h1 className="text-xl font-bold">
                {profiledata?.data?.user?.fullname}
              </h1>
              <p className="text-sm">{profiledata?.data?.address}</p>
              {profiledata?.data?.gstNo && (
                <p className="text-xs">GST No: {profiledata?.data?.gstNo}</p>
              )}
            </div>
          </div>
          <div className="text-right text-sm">
            <div className="text-lg font-bold">Receipt</div>
            <div>{profiledata?.data?.user?.phoneNumber}</div>
            <div>{profiledata?.data?.user?.email}</div>
          </div>
        </div>

        {/* Receipt Info */}
        <div className="border-gray-400 mt-3 flex justify-between border-b border-dashed pb-2 text-sm">
          <div>
            <span className="block font-medium">
              Receipt No:{' '}
              <span className="font-semibold">{myData?.billNo}</span>
            </span>
          </div>
          <div>
            <span className="font-medium">Date:</span>{' '}
            <span className="font-semibold">{today}</span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-x-8 gap-y-2 text-sm md:grid-cols-2">
          <div className="flex">
            <span className="w-28 font-medium">Name:</span>
            <span>{client?.user?.fullname}</span>
          </div>
          <div className="flex">
            <span className="w-28 font-medium">Mobile:</span>
            <span>{client?.user?.phoneNumber}</span>
          </div>
        </div>

        {/* Amount Section */}
        <div className="border-gray-400 mt-4 border-t border-dashed pt-3">
          {/* Table Header */}
          <div className="border-gray-300 grid grid-cols-3 gap-4 border-b pb-1 text-sm font-semibold">
            <span>Sr No.</span>
            <span>Particular</span>
            <span className="text-right">Amount</span>
          </div>

          {/* Table Row */}
          <div className="grid grid-cols-3 gap-4 py-2 text-sm">
            <span>1</span>
            <span>{myData?.particular}</span>
            <span className="text-right font-semibold text-blue-700">
              ₹{myData?.amount}
            </span>
          </div>

          {/* Total Row */}
          <div className="mt-2 flex justify-between border-t border-dashed pt-2 text-sm font-semibold">
            <span>Total:</span>
            <span>₹{myData?.amount}</span>
          </div>
        </div>

        {/* Signatures */}
        <div className="mt-8 flex justify-between text-center text-xs">
          <div>
            <div className="border-gray-400 mx-auto mb-1 w-32 border-b border-dashed"></div>
            <div>Customer Signature</div>
          </div>
          <div>
            <div className="border-gray-400 mx-auto mb-1 w-32 border-b border-dashed"></div>
            <div>{profiledata?.data?.user?.fullname}</div>
            <div>Authorized Signature</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiptBill;
