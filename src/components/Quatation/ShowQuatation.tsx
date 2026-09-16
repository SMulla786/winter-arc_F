/* eslint-disable  */
import LeftBottom from '@/assets/images/Bill/LeftBottom.png';
import LeftTop from '@/assets/images/Bill/LeftTop.png';
import RightBottom from '@/assets/images/Bill/RightBottom.png';
import RightTop from '@/assets/images/Bill/RightTop.png';
import {useInvoice} from '@/context/InvoiceContext';
import {Route} from '@/routes/_app/_event/events.$id';
import React, {useMemo, useRef, useState} from 'react';
import {useAuthContext} from '@/context/AuthContext';
import {useGetTerms} from '@/lib/react-query/queriesAndMutations/cateror/termcondition';
import {useGetPaymentDetails} from '@/lib/react-query/queriesAndMutations/cateror/paymentdetails';
import {format} from 'date-fns';
import {useGetQuatationImage} from '@/lib/react-query/queriesAndMutations/cateror/quatation';
import {useGetClientById} from '@/lib/react-query/queriesAndMutations/cateror/client';
import TemplateCard7 from '../TemplatePage/TemplateCard7';
import TemplateCard8 from '../TemplatePage/TemplateCard8';

interface ShowQuotationProps {
  quotation: any;
  image: string;
  mappedQuatation: unknown[];
  eventData: any;
  totalExtraCost: number;
  charges: {name: string; amount: number}[];
  totalAmount: number;
  pendingAmount: number;
  paidAmount: number;
  quotationColor: string;
  quatationDesign: string;
  isGstApplied: boolean | null;
  quotationGST: number;
  quotationCGST: number;
  quotationSGST: number;
  printRef: React.RefObject<HTMLDivElement>;
}

const ShowQuotation: React.FC<ShowQuotationProps> = ({
  image,
  mappedQuatation,
  eventData,
  quotationGST,
  quotationCGST,
  quotationSGST,
  isGstApplied,
  totalAmount,
  quotationColor,
  quatationDesign,
  printRef,
  quotation,
}) => {
  const {id: EventId} = Route.useParams();
  const {invoices} = useInvoice();
  const {user} = useAuthContext();
  const id = user?.caterorId ?? '';

  const {data: client} = useGetClientById(quotation?.event?.clientId ?? '');

  const {data: termsResponse} = useGetTerms(id);
  const {data: quotationImage} = useGetQuatationImage(id);
  const {data: paymentData} = useGetPaymentDetails(id);

  const templates: any = {
    template7: <TemplateCard7 />,
    template8: <TemplateCard8 />,
  };

  const formatIndianDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    const day = date.getDate();
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const monthName = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${monthName} ${year}`;
  };

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = formatIndianDate(startDate);
    const end = formatIndianDate(endDate);
    return start === end ? start : `${start} to ${end}`;
  };

  const total = useMemo(() => {
    if (!eventData?.subEvents?.length) return 0;
    return eventData.subEvents.reduce((sum, subEvent) => {
      const maxPeople = Math.max(
        Number(subEvent.expectedPeople) || 0,
        Number(subEvent.actualPeople) || 0,
      );
      const currentCost =
        subEvent?.perPlate !== 0 &&
        subEvent?.perPlate !== null &&
        subEvent?.perPlate !== undefined
          ? subEvent?.perPlate
          : subEvent?.fixedPerPlate;
      return sum + currentCost * maxPeople;
    }, 0);
  }, [eventData]);

  const groupAndSortDishes = (dishes: any[]) => {
    if (!dishes || dishes.length === 0) return new Map();
    const categoryMap = new Map<string, any[]>();
    dishes.forEach((dishItem) => {
      const categoryName = dishItem.dish?.category?.name || 'Other';
      if (!categoryMap.has(categoryName)) {
        categoryMap.set(categoryName, []);
      }
      categoryMap.get(categoryName)?.push(dishItem);
    });
    categoryMap.forEach((dishesList) => {
      dishesList.sort((a, b) => {
        const nameA = a.dish?.name?.toLowerCase() || '';
        const nameB = b.dish?.name?.toLowerCase() || '';
        return nameA.localeCompare(nameB);
      });
    });
    return new Map(
      Array.from(categoryMap.entries()).sort((a, b) =>
        a[0].localeCompare(b[0]),
      ),
    );
  };

  if (!mappedQuatation || mappedQuatation.length === 0) {
    return <div className="text-center">No quotation data available.</div>;
  }

  const cgst = quotation?.event?.quotationCGST || 0;
  const sgst = quotation?.event?.quotationSGST || 0;

  const totalAddonsAmount = eventData.subEvents?.reduce(
    (eventSum: number, subEvent: any) => {
      const addons = subEvent.SubeventAddonServices;
      if (!addons) return eventSum;
      const subEventTotal = addons.reduce((addonSum: number, addon: any) => {
        const price = addon.addonService?.price;
        return price ? addonSum + price : addonSum;
      }, 0);
      return eventSum + subEventTotal;
    },
    0,
  );

  return (
    <div className="bg-gray-100 mt-5 flex min-h-screen flex-col items-center justify-center">
      <div
        className="border-gray-400 w-full bg-white p-2 text-black shadow-lg dark:bg-boxdark"
        ref={printRef}
        id="receipt"
      >
        {/* Template - Make it smaller/compact */}
        <div
          className="relative text-[#222529] dark:text-white"
          style={{marginBottom: '-10px'}}
        >
          {templates[quotationImage?.quatationDesign]}
        </div>

        <div className="py-1 text-center">
          <h1 className="font-croissant text-xl font-extrabold text-[#343a40]">
            Quotation
          </h1>
        </div>

        {/* Client & Event Info - Compact */}
        <div className="no-page-break">
          <div className="mt-1 flex flex-col justify-between gap-2 sm:flex-row">
            <div className="w-full px-1 sm:w-1/2">
              <div className="mb-1">
                <p className="font-croissant text-xs font-bold text-[#6F7F65]">
                  Client Information
                </p>
              </div>
              <div className="mb-1">
                <span className="mr-1 w-20 gap-1 font-croissant text-xs font-bold text-[#6F7F65]">
                  Name:
                </span>
                <span className="font-lora text-xs font-semibold text-[#343a40]">
                  {client?.name || 'N/A'}
                </span>
              </div>
              <div className="grid grid-cols-1 gap-0">
                <div>
                  <span className="mr-1 w-20 font-croissant text-xs font-bold text-[#6F7F65]">
                    Phone:
                  </span>
                  <span className="font-lora text-xs font-semibold text-[#343a40]">
                    {client?.phoneNumber || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="mr-1 w-20 font-croissant text-xs font-bold text-[#6F7F65]">
                    Address:
                  </span>
                  <span className="font-lora text-xs font-semibold text-[#343a40]">
                    {client?.address || 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex w-full justify-end px-1 sm:w-1/2">
              <div className="text-right">
                <div className="mb-1">
                  <p className="font-croissant text-xs font-bold text-[#6F7F65]">
                    Event Information
                  </p>
                </div>
                <div className="space-y-1">
                  <div>
                    <span className="font-croissant text-xs font-bold text-[#6F7F65]">
                      Name:
                    </span>
                    <span className="ml-1 font-lora text-xs font-semibold text-[#343a40]">
                      {eventData.name}
                    </span>
                  </div>
                  <div>
                    <span className="font-croissant text-xs font-bold text-[#6F7F65]">
                      Date:
                    </span>
                    <span className="ml-1 font-lora text-xs font-semibold text-[#343a40]">
                      {formatDateRange(eventData.startDate, eventData.endDate)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Table - Compact */}
        <div className="keep-with-table mt-2 overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="bg-[#6F7F57] text-white">
                <th className="px-1 py-1 text-left font-croissant text-xs">
                  Date & Time
                </th>
                <th className="px-1 py-1 text-left font-croissant text-xs">
                  Sub-Event
                </th>
                <th className="px-2 py-1 text-left font-croissant text-xs">
                  Menu Items
                </th>
                <th className="px-1 py-1 text-right font-croissant text-xs">
                  Note
                </th>
                <th className="px-1 py-1 text-right font-croissant text-xs">
                  Cost
                </th>
                <th className="px-1 py-1 text-right font-croissant text-xs">
                  People
                </th>
                <th className="px-1 py-1 text-right font-croissant text-xs">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {eventData.subEvents.map((item: any, index) => {
                const maxPeople = Math.max(
                  item.expectedPeople || 0,
                  item.actualPeople || 0,
                );
                const currentCost =
                  item.perPlate !== 0 &&
                  item.perPlate !== null &&
                  item.perPlate !== undefined
                    ? item.perPlate
                    : item.fixedPerPlate;
                const groupedDishes = groupAndSortDishes(item.dishes);

                return (
                  <tr
                    key={`subevent-${index}`}
                    className={index % 2 === 0 ? 'bg-[#f8f9f6]' : 'bg-white'}
                  >
                    <td className="px-1 py-1 font-lora text-xs text-[#343a40]">
                      {format(new Date(item.date), 'dd/MM/yy')}
                      <br />
                      {format(new Date(item.time), 'hh:mm a')}
                    </td>
                    <td className="px-1 py-1 font-lora text-xs text-[#343a40]">
                      {item.name}
                    </td>
                    <td className="px-2 py-1">
                      {item?.package?.name && (
                        <div className="mb-1">
                          <span className="text-xs font-semibold uppercase text-green-700">
                            ({item?.package?.name})
                          </span>
                        </div>
                      )}
                      {groupedDishes.size > 0 ? (
                        <div className="space-y-2">
                          {Array.from(groupedDishes.entries()).map(
                            ([categoryName, categoryDishes]) => (
                              <div key={categoryName}>
                                <div className="mb-0.5 text-xs font-bold text-[#6F7F65]">
                                  {categoryName}
                                </div>
                                <ul className="ml-2 list-inside list-disc">
                                  {categoryDishes.map(
                                    (dish: any, i: number) => (
                                      <li
                                        key={i}
                                        className="pl-1 -indent-3 font-lora text-xs text-[#343a40]"
                                      >
                                        {dish.dish.name}
                                      </li>
                                    ),
                                  )}
                                </ul>
                              </div>
                            ),
                          )}
                        </div>
                      ) : (
                        <div className="font-lora text-xs text-[#343a40]">
                          No menu items
                        </div>
                      )}
                    </td>
                    <td className="px-1 py-1 text-right font-lora text-xs text-[#343a40]">
                      <span className="flex-1">
                        {item.note == '' ? '' : item.note ? item.note : ''}
                      </span>
                    </td>
                    <td className="px-1 py-1 text-right font-lora text-xs text-[#343a40]">
                      ₹{currentCost?.toFixed(2) || '0.00'}
                    </td>
                    <td className="px-1 py-1 text-right font-lora text-xs text-[#343a40]">
                      {maxPeople}
                    </td>
                    <td className="px-1 py-1 text-right font-lora text-xs text-[#343a40]">
                      {(currentCost * maxPeople).toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Addons Table - Compact */}
        {totalAddonsAmount > 0 && (
          <div className="mt-2 overflow-x-auto">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="bg-[#6F7F57] text-white">
                  <th className="px-1 py-1 text-left font-croissant text-xs">
                    Date
                  </th>
                  <th className="px-1 py-1 text-left font-croissant text-xs">
                    Sub-Event
                  </th>
                  <th className="px-1 py-1 text-left font-croissant text-xs">
                    AddOns / Charges
                  </th>
                  <th className="px-2 py-1 text-right font-croissant text-xs">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {eventData.subEvents.map((item: any, index: number) => {
                  return (
                    item.SubeventAddonServices &&
                    item.SubeventAddonServices.length > 0 &&
                    item.SubeventAddonServices.map(
                      (addon: any, addonIdx: number) => (
                        <tr
                          key={`subevent-addon-${index}-${addonIdx}`}
                          className={
                            index % 2 === 0 ? 'bg-[#f8f9f6]' : 'bg-white'
                          }
                        >
                          <td className="px-2 py-1 font-lora text-xs text-[#343a40]">
                            {format(new Date(item.date), 'dd/MM/yy')}
                            <br />
                            {item.time
                              ? format(new Date(item.time), 'hh:mm a')
                              : ''}
                          </td>
                          <td className="px-2 py-1 font-lora text-xs text-[#343a40]">
                            {item.name}
                          </td>
                          <td className="px-2 py-1 font-lora text-xs text-[#343a40]">
                            {addon.addonService?.name || 'Unknown AddOn'}
                          </td>
                          <td className="px-2 py-1 text-right font-lora text-xs text-[#343a40]">
                            ₹
                            {addon.addonService?.price
                              ? addon.addonService.price.toFixed(2)
                              : '0.00'}
                          </td>
                        </tr>
                      ),
                    )
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Payment & Summary Section - Compact */}
        <div className="mt-3 flex flex-col-reverse sm:flex-row">
          <div className="mt-2 w-full sm:mt-0 sm:w-1/2">
            <div className="rounded-lg bg-[#f1f3ee] p-2">
              <h3 className="mb-1 font-croissant text-xs font-bold text-[#6F7F65]">
                Payment Information
              </h3>
              <div className="text-xs">
                <p className="font-lora">
                  <span className="font-semibold">A/c Holder:</span>{' '}
                  {paymentData?.data?.AccountHolderName || 'N/A'}
                </p>
                <p className="font-lora">
                  <span className="font-semibold">Bank:</span>{' '}
                  {paymentData?.data?.BankName || 'N/A'}
                </p>
                <p className="font-lora">
                  <span className="font-semibold">A/c No:</span>{' '}
                  {paymentData?.data?.AccountNo || 'N/A'}
                </p>
                <p className="font-lora">
                  <span className="font-semibold">IFSC:</span>{' '}
                  {paymentData?.data?.IFSC || 'N/A'}
                </p>
                <p className="font-lora">
                  <span className="font-semibold">UPI:</span>{' '}
                  {paymentData?.data?.upi || 'N/A'}
                </p>
                <p className="font-lora">
                  <span className="font-semibold">GST:</span>{' '}
                  {eventData?.cateror?.user?.gstin ||
                    eventData?.cateror?.paymentDetails?.gstin ||
                    'N/A'}
                </p>
              </div>
            </div>
          </div>

          <div className="w-full sm:w-1/2 sm:pl-4">
            <div className="rounded-lg border border-[#e0e0e0] p-2">
              <h3 className="mb-1 font-croissant text-xs font-bold text-[#6F7F65]">
                Summary
              </h3>
              <div className="text-xs">
                <div className="flex justify-between">
                  <span>Amount:</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
                {totalAddonsAmount > 0 && (
                  <div className="flex justify-between">
                    <span>Addons:</span>
                    <span>₹{totalAddonsAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>CGST:</span>
                  <span>₹{quotationCGST.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>SGST:</span>
                  <span>₹{quotationSGST.toFixed(2)}</span>
                </div>
                <div className="my-1 border-t border-[#e0e0e0]"></div>
                <div className="flex justify-between font-semibold">
                  <span>Total Amount:</span>
                  <span>
                    ₹{(total + cgst + sgst + totalAddonsAmount).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Terms and Conditions - Compact */}
        <div className="mt-2 border-t border-[#e0e0e0] px-1 pt-2">
          <h3 className="mb-1 font-croissant text-xs font-bold text-[#6F7F65]">
            Terms & Conditions
          </h3>
          <ul className="list-inside list-disc space-y-0.5 font-lora text-xs text-[#343a40]">
            {termsResponse?.data?.map((term: any, index: number) => (
              <li key={`term-${index}`}>{term.terms}</li>
            ))}
          </ul>
        </div>

        {/* Signatures - Compact */}
        <div className="mt-6 flex justify-between px-1">
          <div className="text-center">
            <div className="mb-0.5 h-0.5 w-24 bg-[#6F7F65]"></div>
            <p className="font-croissant text-xs text-[#6F7F65]">
              Customer Signature
            </p>
          </div>
          <div className="text-center">
            <div className="mb-0.5 h-0.5 w-24 bg-[#6F7F65]"></div>
            <p className="font-croissant text-xs text-[#6F7F65]">
              {eventData?.cateror?.user?.fullname}
            </p>
            <p className="font-croissant text-xs text-[#6F7F65]">
              Authorized Signature
            </p>
          </div>
        </div>
      </div>

      {/* Print CSS */}
      <style>{`
        @media print {
          /* Keep table headers repeating */
          thead {
            display: table-header-group;
          }
          
          /* Keep rows together */
          tbody tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
          
          /* Prevent page break between client info and table */
          .no-page-break {
            page-break-after: avoid;
            page-break-inside: avoid;
          }
          
          /* Keep table with its header */
          .keep-with-table {
            page-break-before: avoid;
          }
          
          /* Remove background color from body */
          .bg-gray-100 {
            background: white !important;
          }
          
          /* Keep background colors */
          .bg-\\[\\#6F7F57\\] {
            background-color: #6F7F57 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          .bg-\\[\\#f8f9f6\\] {
            background-color: #f8f9f6 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          .bg-white {
            background-color: white !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          /* Reduce margins to fit more content */
          @page {
            margin: 0.3cm;
            size: A4;
          }
          
          body {
            margin: 0;
            padding: 0;
          }
          
          /* Reduce padding on main container */
          #receipt {
            padding: 4px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ShowQuotation;
