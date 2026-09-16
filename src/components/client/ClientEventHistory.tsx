/*eslint-disable*/

import {useGetClientHistory} from '@/lib/react-query/queriesAndMutations/cateror/client';
import {Route} from '@/routes/_app/_client/clienthistory.$id';
import {Link, useNavigate} from '@tanstack/react-router';
import React, {useEffect, useState} from 'react';

const ClientEventHistory = () => {
  const {id} = Route.useParams();
  const {data: clientHistory} = useGetClientHistory(id);
  console.log('history', clientHistory);
  const [openEventId, setOpenEventId] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);

    return date.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC',
    });
  };
  const formatOnlyTime = (utcString: string) => {
    if (!utcString) return 'N/A';

    const date = new Date(utcString);

    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Kolkata',
    });
  };

  const navigate = useNavigate();
  useEffect(() => {
    if (clientHistory && clientHistory.length > 0) {
      setOpenEventId(clientHistory[0].id);
    }
  }, [clientHistory]);

  const formatCurrency = (amount: number) => {
    if (amount === null || amount === undefined) return '₹0';
    return '₹' + amount.toLocaleString('en-IN');
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'enquiry':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'preparation':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'finalized':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'paid':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (!clientHistory || clientHistory.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <h3 className="text-gray-600 text-lg font-medium">
            No event history found
          </h3>
          <p className="text-gray-500 mt-1">
            This client doesn't have any events yet
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="mb-4">
        <button
          className="text-left text-xl font-bold"
          onClick={() => navigate({to: '/client', state: {showList: true}})}
        >
          ← Back
        </button>
      </div>
      {/* Event Type Tabs */}
      <div className="mb-6 overflow-x-auto">
        <div className="flex min-w-max flex-nowrap gap-3 px-1">
          {clientHistory.map((event: any) => {
            const isSelected = openEventId === event.id;

            return (
              <button
                key={event.id}
                type="button"
                onClick={() =>
                  setOpenEventId((prev) =>
                    prev === event.id ? null : event.id,
                  )
                }
                className={`whitespace-nowrap rounded border-b-2 border-stroke px-4 py-2 text-sm transition-all duration-200 ${
                  isSelected
                    ? 'border-blue-600 bg-sky-100 text-blue-600 dark:border-blue-400 dark:bg-blue-900 dark:text-blue-400'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300 border-transparent hover:border-blue-300 hover:text-blue-500 dark:bg-meta-4 dark:text-white dark:hover:text-blue-300'
                }`}
              >
                {event.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Event Details */}
      {clientHistory.map((event: any) => (
        <div
          key={event.id}
          className={`mb-8 rounded-xl bg-white shadow-sm transition-all duration-200 ${
            openEventId === event.id ? 'block' : 'hidden'
          }`}
        >
          {/* Event Header */}
          <div className="flex items-center justify-between border-b border-stroke p-6 dark:border-strokedark dark:bg-boxdark dark:text-white">
            <div>
              <h3 className="text-gray-900 text-2xl font-bold">{event.name}</h3>
              <div className="text-gray-500 mt-1 flex items-center space-x-4 text-sm">
                <span>
                  <span className="font-medium">From:</span>{' '}
                  {formatDate(event.startDate)}
                </span>
                <span>
                  <span className="font-medium">To:</span>{' '}
                  {formatDate(event.endDate)}
                </span>
              </div>
            </div>
            <span
              className={`${getStatusColor(event.status)} rounded-full border border-stroke px-3 py-1 text-xs font-semibold dark:border-strokedark`}
            >
              {event.status}
            </span>
          </div>

          {/* Financial Summary */}
          <div className="grid grid-cols-1 gap-4 p-6 dark:bg-boxdark dark:text-white md:grid-cols-4">
            {/* <div className="bg-gray-50 rounded-lg border border-stroke p-4 dark:border-strokedark">
              <p className="text-gray-500 text-sm font-medium">
                Quotation Amount
              </p>
              <p className="text-gray-900 mt-1 text-xl font-semibold">
                {formatCurrency(event.quotationAmount)}
              </p>
            </div> */}
            <div className="bg-gray-50 rounded-lg border border-stroke p-4 dark:border-strokedark">
              <p className="text-gray-500 text-sm font-medium">Final Amount</p>
              <p className="text-gray-900 mt-1 text-xl font-semibold">
                {formatCurrency(event.finalAmount)}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg border border-stroke p-4 dark:border-strokedark">
              <p className="text-gray-500 text-sm font-medium">Paid Amount</p>
              <p className="text-gray-900 mt-1 text-xl font-semibold">
                {formatCurrency(event.paidAmount)}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg border border-stroke p-4 dark:border-strokedark">
              <p className="text-gray-500 text-sm font-medium">Balance</p>
              <p className="text-gray-900 mt-1 text-xl font-semibold">
                {formatCurrency(event.finalAmount - event.paidAmount)}
              </p>
            </div>
          </div>

          {/* Sub Events */}
          <div className="border-t border-stroke p-6 dark:border-strokedark dark:bg-boxdark dark:text-white">
            <div className="mb-4 flex items-center justify-between">
              <h4 className="text-gray-800 text-lg font-semibold">
                Sub Events
              </h4>
              <span className="rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-800">
                {event.subEvents.length} events
              </span>
            </div>

            {event.subEvents.length > 0 ? (
              <div className="space-y-4">
                {event.subEvents.map((subEvent: any) => (
                  <Link
                    key={subEvent.id}
                    to={`/events/${event.id}`}
                    className="block rounded-lg border border-stroke p-4 transition-colors hover:border-indigo-300 hover:bg-indigo-50/50 dark:border-strokedark"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h5 className="text-gray-900 font-medium">
                          {subEvent.name}
                        </h5>
                        <p className="text-gray-500 mt-1 text-sm">
                          {formatDate(subEvent.date)}{' '}
                          {formatOnlyTime(subEvent.time)}
                        </p>
                      </div>
                      <span className="bg-gray-100 text-gray-800 rounded-full px-2 py-1 text-xs font-medium">
                        {subEvent.expectedPeople || 0} people
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div className="flex items-center text-sm">
                        <svg
                          className="text-gray-400 mr-2 h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                        <span className="font-medium">Amount:</span>{' '}
                        <span className="ml-1">
                          {formatCurrency(
                            subEvent.finalAmount || subEvent?.expectedCost || 0,
                          )}
                        </span>
                      </div>

                      {subEvent.address && (
                        <div className="flex items-start text-sm">
                          <svg
                            className="text-gray-400 mr-2 mt-0.5 h-4 w-4 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          <span className="truncate">{subEvent.address}</span>
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="border-gray-300 rounded-lg border-2 border-dashed p-8 text-center">
                <svg
                  className="text-gray-400 mx-auto h-12 w-12"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <h5 className="text-gray-700 mt-2 text-sm font-medium">
                  No sub events scheduled
                </h5>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ClientEventHistory;
