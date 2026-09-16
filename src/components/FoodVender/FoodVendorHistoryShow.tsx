/* eslint-disable */
import React, {useMemo, useState} from 'react';
import {useGetFoodVendorAllHistory} from '@/lib/react-query/queriesAndMutations/cateror/foodvendor';
import {Route} from '@/routes/_app/_foodvendor/foodvendorhistoryshow.$id';
import {
  Calendar,
  IndianRupee,
  MapPin,
  Utensils,
  Wallet,
  AlertCircle,
  Search,
  X,
  Clock,
  ClipboardList,
  Layers,
  User,
} from 'lucide-react';
import {useNavigate} from '@tanstack/react-router';

const FoodVendorHistoryShow = () => {
  const {id} = Route.useParams();
  const {data: history, isLoading, isError} = useGetFoodVendorAllHistory(id);
  console.log('history', history);
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | string>('all');
  const [openIds, setOpenIds] = useState<Record<string, boolean>>({});

  const format = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const now = new Date();
  const [dateFilter, setDateFilter] = useState({
    from: format(new Date(now.getFullYear(), now.getMonth(), 1)),
    to: format(new Date(now.getFullYear(), now.getMonth() + 1, 0)),
  });

  const items = history || [];

  const formatCurrency = (amount: number | undefined) => {
    if (amount == null) return '-';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      payment: 'bg-green-50 text-green-700 ring-green-100',
      order: 'bg-blue-50 text-blue-700 ring-blue-100',
      refund: 'bg-orange-50 text-orange-700 ring-orange-100',
      default: 'bg-gray-50 text-gray-700 ring-gray-100',
    };
    return colors[type?.toLowerCase()] || colors.default;
  };

  const toggleOpen = (id: string, type: string) => {
    if (type === 'PAYMENT') {
      setOpenIds((s) => ({...s, [id]: !s[id]}));
    }
  };

  const clearAllFilters = () => {
    setQuery('');
    setTypeFilter('all');
    setDateFilter({from: '', to: ''});
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const arr = Array.isArray(items) ? items : []; // ✅ safety guard

    return arr
      .filter((it: any) =>
        typeFilter === 'all' ? true : it?.type === typeFilter,
      )
      .filter((it: any) => {
        if (!q) return true;
        return (
          String(it.type).toLowerCase().includes(q) ||
          String(it.subEventDish?.dishId || '')
            .toLowerCase()
            .includes(q) ||
          String(it.subEventDish?.subEvent?.name || '')
            .toLowerCase()
            .includes(q) ||
          String(it.subEventDish?.subEvent?.address || '')
            .toLowerCase()
            .includes(q)
        );
      })
      .filter((it: any) => {
        if (!dateFilter.from && !dateFilter.to) return true;
        const itemDate = new Date(it.createdAt);
        const fromDate = dateFilter.from ? new Date(dateFilter.from) : null;
        const toDate = dateFilter.to ? new Date(dateFilter.to) : null;
        if (fromDate && toDate)
          return itemDate >= fromDate && itemDate <= toDate;
        if (fromDate) return itemDate >= fromDate;
        if (toDate) return itemDate <= toDate;
        return true;
      })
      .sort(
        (a: any, b: any) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }, [items, query, typeFilter, dateFilter]);

  const totals = useMemo(() => {
    return filtered.reduce(
      (acc: any, it: any) => {
        acc.totalCount++;
        acc.totalAmount += Number(it.totalAmount || 0);
        acc.totalWallet += Number(it.walletAmount || 0);
        return acc;
      },
      {totalCount: 0, totalAmount: 0, totalWallet: 0},
    );
  }, [filtered]);

  const hasActiveFilters =
    query || typeFilter !== 'all' || dateFilter.from || dateFilter.to;

  if (isLoading)
    return (
      <div className="text-gray-500 flex min-h-screen items-center justify-center">
        Loading vendor history...
      </div>
    );

  if (isError)
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 to-red-100 p-6">
        <div className="max-w-md rounded-xl bg-white p-6 shadow">
          <AlertCircle className="mx-auto mb-3 h-10 w-10 text-red-500" />
          <h3 className="text-gray-800 text-center text-lg font-semibold">
            Unable to load history
          </h3>
          <p className="text-gray-600 mt-2 text-center text-sm">
            Something went wrong while fetching vendor history. Try again later.
          </p>
        </div>
      </div>
    );

  return (
    <div className="dark:bg-dark min-h-screen w-full">
      <div className="mx-auto w-full">
        <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center">
          <button
            className="flex items-center gap-1 text-xl font-semibold text-blue-600 hover:text-blue-700"
            aria-label="Go Back"
            onClick={() => navigate({to: `/foodvendorhistory/${id}`})}
          >
            <span className="text-xl">←</span>
          </button>

          <h1 className="text-gray-900 text-xl font-semibold">
            Food Vendor Payment History
          </h1>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          {/* LEFT: LIST */}
          <div className="space-y-3 lg:col-span-3">
            {filtered?.length === 0 ? (
              <div className="rounded-2xl bg-white py-10 text-center shadow dark:bg-boxdark">
                <div className="bg-gray-100 mx-auto mb-4 flex h-28 w-28 items-center justify-center rounded-full">
                  <Utensils className="text-gray-500 h-10 w-10" />
                </div>
                <h3 className="text-gray-900 text-lg font-semibold">
                  No transactions found
                </h3>
                <p className="text-gray-600 mx-auto mt-2 max-w-md text-sm">
                  Try clearing filters or searching for different terms.
                </p>
              </div>
            ) : (
              filtered?.map((item: any) => {
                const isOpen = openIds[item.id];
                return (
                  <article
                    key={item.id}
                    onClick={() => toggleOpen(item.id, item.type)}
                    className={`cursor-pointer rounded-2xl border border-transparent bg-white p-5 shadow-sm transition hover:shadow-md dark:bg-boxdark ${
                      item.type === 'PAYMENT'
                        ? 'ring-1 ring-green-200'
                        : 'ring-1 ring-blue-200'
                    }`}
                  >
                    {/* TOP SUMMARY */}
                    <div className="flex items-start gap-4">
                      <div
                        className={`rounded-full p-3 ring-1 ${getTypeColor(
                          item.type,
                        )} shrink-0`}
                      >
                        <IndianRupee className="h-5 w-5" />
                      </div>
                      <div className="flex w-full flex-col md:flex-row md:items-center md:justify-between">
                        <div>
                          <div className="flex items-center gap-3">
                            <span className="text-gray-800 text-sm font-medium">
                              {String(item.type).toUpperCase()}
                            </span>
                            <span className="text-gray-400 text-xs">•</span>
                            <time className="text-gray-500 text-xs">
                              {new Date(item.createdAt).toLocaleString(
                                'en-IN',
                                {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                },
                              )}
                            </time>
                          </div>
                        </div>

                        <div className="mt-3 flex items-center gap-6 md:mt-0">
                          <div className="text-right">
                            <p className="text-gray-500 text-center text-sm">
                              Total
                            </p>
                            <p className="text-md font-semibold text-green-600">
                              {formatCurrency(item.totalAmount)}
                            </p>
                          </div>
                          {item.amount != null && (
                            <div className="text-right">
                              <p className="text-gray-500 text-center text-sm">
                                Amount
                              </p>
                              <p className="text-gray-800 text-md font-semibold">
                                {formatCurrency(item.amount)}
                              </p>
                            </div>
                          )}
                          {item.walletAmount != null && (
                            <div className="text-right">
                              <p className="text-gray-500 text-center text-sm">
                                Deposit
                              </p>
                              <p className="text-md text-gray-900 font-semibold">
                                {formatCurrency(item.walletAmount)}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* EXPANDED DETAILS */}
                    {isOpen && item.eventVendorHistories?.length > 0 && (
                      <div className="border-gray-200 mt-2 border-t">
                        {item.eventVendorHistories.map(
                          (evh: any, index: number) => {
                            const subEvent = evh.subEventDish?.subEvent;
                            const event = subEvent?.event;
                            const dish = evh.subEventDish;

                            return (
                              <div
                                key={index}
                                className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4"
                              >
                                <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                                  <div>
                                    <h4 className="text-gray-900 flex items-center gap-2 text-sm font-semibold">
                                      <ClipboardList className="text-gray-500 h-4 w-4" />
                                      Event: {event?.name || '-'}
                                    </h4>
                                    <div className="flex justify-start gap-2">
                                      <p className="text-gray-600 ml-6 text-xs">
                                        <MapPin className="text-gray-400 mr-1 inline h-3 w-3" />
                                        Address:{' '}
                                        {subEvent?.address || 'No address'}
                                      </p>
                                      <p className="text-gray-600 ml-6 text-xs">
                                        <Calendar className="text-gray-400 mr-1 inline h-3 w-3" />
                                        {new Date(
                                          subEvent?.date,
                                        ).toLocaleDateString('en-IN', {
                                          day: '2-digit',
                                          month: 'short',
                                          year: 'numeric',
                                        })}
                                        {' • '}
                                        {new Date(
                                          subEvent?.time,
                                        ).toLocaleTimeString('en-IN', {
                                          hour: '2-digit',
                                          minute: '2-digit',
                                        })}
                                      </p>

                                      <p className="text-gray-600 ml-6 text-xs">
                                        <Clock className="text-gray-400 mr-1 inline h-3 w-3" />
                                        Duration:{' '}
                                        {new Date(
                                          event?.startDate,
                                        ).toLocaleDateString('en-IN')}{' '}
                                        →{' '}
                                        {new Date(
                                          event?.endDate,
                                        ).toLocaleDateString('en-IN')}
                                      </p>
                                      <p className="text-gray-600 ml-6 text-xs">
                                        <User className="text-gray-400 mr-1 inline h-3 w-3" />
                                        People:{' '}
                                        {subEvent?.actualPeople ||
                                          subEvent?.expectedPeople ||
                                          '-'}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="mt-3 md:mt-0">
                                    <span className="text-gray-500 text-xs">
                                      SubEvent:{' '}
                                    </span>
                                    <span className="text-gray-800 text-sm font-medium">
                                      {subEvent?.name || '-'}
                                    </span>
                                  </div>
                                </div>

                                {/* DISH DETAILS */}
                                <div className="mt-3">
                                  <div className="overflow-x-auto">
                                    <div className="border-gray-200 w-full border-t text-xs">
                                      <div className="bg-gray-100 text-gray-700 grid grid-cols-6 text-left">
                                        <div className="px-2 py-1 font-semibold">
                                          Dish
                                        </div>
                                        <div className="px-2 py-1 text-right font-semibold">
                                          Order Quantity
                                        </div>
                                        <div className="px-2 py-1 text-right font-semibold">
                                          Prep
                                        </div>
                                        <div className="px-2 py-1 text-right font-semibold">
                                          Actual Quantity
                                        </div>
                                        <div className="px-2 py-1 text-right font-semibold">
                                          Price
                                        </div>
                                        <div className="px-2 py-1 text-right font-semibold">
                                          Paid
                                        </div>
                                      </div>

                                      <div className="grid grid-cols-6">
                                        <div className="px-2 py-1">
                                          {dish?.dish?.name}
                                        </div>
                                        <div className="px-2 py-1 text-right">
                                          {dish?.expected} {dish?.unit}
                                        </div>
                                        <div className="px-2 py-1 text-right">
                                          {dish?.preparation}
                                        </div>
                                        <div className="px-2 py-1 text-right">
                                          {dish?.actual} {dish?.unit}
                                        </div>
                                        <div className="px-2 py-1 text-right">
                                          {formatCurrency(dish?.price)}
                                        </div>
                                        <div className="px-2 py-1 text-right">
                                          {formatCurrency(dish?.paidPrice)}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          },
                        )}
                      </div>
                    )}
                  </article>
                );
              })
            )}
          </div>

          {/* RIGHT: SUMMARY & FILTERS */}
          <aside className="space-y-4 lg:col-span-1">
            <div className="rounded-2xl bg-white p-4 shadow dark:bg-boxdark">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Transactions</p>
                  <p className="text-2xl font-semibold text-violet-600">
                    {totals.totalCount}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-gray-500 text-sm">Total</p>
                  <p className="text-md font-semibold text-green-600">
                    {formatCurrency(totals.totalAmount)}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-4 shadow dark:bg-boxdark">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-gray-800 text-sm font-semibold">
                  Date Filters
                </h3>
                {hasActiveFilters && (
                  <button
                    onClick={clearAllFilters}
                    className="text-gray-500 hover:text-gray-700 flex items-center gap-1 text-xs"
                  >
                    <X className="h-3 w-3" />
                    Clear all
                  </button>
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-gray-600 mb-1 block text-xs font-medium">
                    From
                  </label>
                  <input
                    type="date"
                    value={dateFilter.from}
                    onChange={(e) =>
                      setDateFilter((prev) => ({...prev, from: e.target.value}))
                    }
                    className="border-gray-300 w-full rounded-lg border px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-black"
                  />
                </div>

                <div>
                  <label className="text-gray-600 mb-1 block text-xs font-medium">
                    To
                  </label>
                  <input
                    type="date"
                    value={dateFilter.to}
                    onChange={(e) =>
                      setDateFilter((prev) => ({...prev, to: e.target.value}))
                    }
                    className="border-gray-300 w-full rounded-lg border px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-black"
                  />
                </div>

                {/* <div>
                  <label className="text-gray-600 mb-1 block text-xs font-medium">
                    Search
                  </label>
                  <div className="relative">
                    <Search className="text-gray-400 absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2" />
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search transactions..."
                      className="border-gray-300 w-full rounded-lg border py-2 pl-8 pr-3 text-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div> */}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};
export default FoodVendorHistoryShow;
