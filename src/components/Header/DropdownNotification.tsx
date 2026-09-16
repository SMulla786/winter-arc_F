/* eslint-disable */
import {useState} from 'react';
import {Link, useNavigate} from '@tanstack/react-router';
import ClickOutside from '../ClickOutside';
import {
  useGetAmountNotificationById,
  useGetFollowupDate,
  useGetNotificationForTendor,
} from '@/lib/react-query/queriesAndMutations/notification';
import {useAuthContext} from '@/context/AuthContext';
import {BiCheck, BiPencil} from 'react-icons/bi';
import {FaCheck, FaEdit, FaWhatsapp} from 'react-icons/fa';
import {CheckmarkIcon} from 'react-hot-toast';
import {
  useAcceptncomeExpense,
  useAddIncomeExpense,
  useEditIncomeExpense,
  useUpdateIncomeExpense,
} from '@/lib/react-query/queriesAndMutations/cateror/income';

const DropdownNotification = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifying, setNotifying] = useState(true);
  const [activeTab, setActiveTab] = useState<'payment' | 'crm' | 'tendor'>(
    'payment',
  );
  const {user} = useAuthContext();
  const {data: followupDate} = useGetFollowupDate();
  const {data: tendar} = useGetNotificationForTendor();

  const id = user?.caterorId ?? '';
  const navigate = useNavigate();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [itemType, setItemType] = useState<'payment' | 'crm' | 'tendor'>(
    'payment',
  );

  const {mutateAsync: AcceptIncomeExpense} = useAcceptncomeExpense();
  const {mutateAsync: editIcomeExpense} = useEditIncomeExpense();

  const shouldFetchNotifications = user?.role !== 'ADMIN' && !!id;
  const {data: notificationReponse} = useGetAmountNotificationById(
    shouldFetchNotifications ? id : '',
  );

  const formatIndianDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getNotificationType = (
    notification: any,
    type: 'payment' | 'crm' | 'tendor',
  ) => {
    if (type === 'payment') {
      if (notification.amount) return 'Payment Update';
      if (notification.dishName) return 'New Dish Added';
      return 'General Notification';
    } else if (type === 'crm') {
      return 'CRM Follow-up';
    } else {
      return `Event : ${notification.eventname}`;
    }
  };

  const getNotificationIcon = (
    notification: any,
    type: 'payment' | 'crm' | 'tendor',
  ) => {
    if (type === 'payment') {
      if (notification.amount) return '💰';
      if (notification.dishName) return '🍲';
      return '🔔';
    } else if (type === 'crm') {
      return '📅';
    } else {
      return '🏪';
    }
  };

  const edit = (item: any, type: 'payment' | 'crm' | 'tendor') => {
    if (type === 'payment') {
      const data = {
        date: item.date,
        particular: item.particular,
        amount: item.amount,
      };
      editIcomeExpense({id: item.id, data: data});
    }
    // Removed CRM and Tendor edit logic since we're navigating instead
  };

  const onAccept = (id: string, type: 'payment' | 'crm' | 'tendor') => {
    if (type === 'payment') {
      AcceptIncomeExpense(id);
    } else {
      // For CRM and Tendor, mark as followed up or similar
      console.log('Mark as followed up:', id); // Replace with actual action
    }
  };

  const shareToWhatsApp = (item: any, type: 'payment' | 'crm' | 'tendor') => {
    let message: string;
    let phone: string;

    if (type === 'payment') {
      message = `Hello ${item.clientName},\nThis is a reminder regarding your event "${item.eventName}".\nDetails: ${item.particular}\nPending Amount: ₹${Number(item.amount).toLocaleString('en-IN')}\nKindly complete the payment at the earliest.\nThank you 🙏`;
      phone = item.clientNumber;
    } else if (type === 'crm') {
      message = `Hello ${item.clientName},\nFollow-up reminder for event "${item.eventName}".\nProcess: ${item.processName}\nNote: ${item.note}\nFollow-up Date: ${formatIndianDate(item.followUpDate)}\nThank you 🙏`;
      phone = item.phone;
    } else {
      message = `Hello ${item.vendorname},\nRegarding event "${item.eventname}".\nAddress: ${item.vendorAddress}\nThank you 🙏`;
      phone = item.vendorPhone;
    }

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phone}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  const openEditModal = (item: any, type: 'payment' | 'crm' | 'tendor') => {
    if (type === 'payment') {
      setSelectedItem(item);
      setItemType(type);
      setIsEditModalOpen(true);
    } else if (type === 'crm') {
      // For CRM, navigate to /crmadd
      navigate({to: '/crmadd'});
    } else {
      // For Tendor, navigate to /vendor
      navigate({to: '/vendor'});
    }
  };

  const getCount = () => {
    if (activeTab === 'payment') {
      return notificationReponse?.length || 0;
    } else if (activeTab === 'crm') {
      return followupDate?.length || 0;
    } else {
      return tendar?.length || 0;
    }
  };

  const renderNotificationItem = (
    item: any,
    index: number,
    type: 'payment' | 'crm' | 'tendor',
  ) => (
    <div
      key={
        item.id
          ? item.id
          : `${item.followUpDate || item.date || item.createdAt}-${index}`
      }
      className="hover:bg-gray-50 border-b border-stroke px-4 py-3 dark:border-strokedark dark:hover:bg-meta-4"
    >
      <div className="flex items-start gap-3">
        <span className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-sm">
          {getNotificationIcon(item, type)}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <h4 className="truncate text-sm font-medium text-black dark:text-white">
              {getNotificationType(item, type)}
            </h4>
            <span className="text-gray-500 mt-1 text-xs sm:mt-0">
              {formatIndianDate(
                item.date || item.followUpDate || item.createdAt,
              )}
            </span>
          </div>

          <div className="text-gray-600 dark:text-gray-300 mt-1 text-sm">
            {item.eventName && (
              <p className="truncate">Event: {item.eventName}</p>
            )}
            {/* {item.eventname && (
              <p className="truncate">Event: {item.eventname}</p>
            )} */}
            {type === 'payment' && item.amount && (
              <p>Amount: ₹{Number(item.amount).toLocaleString('en-IN')}</p>
            )}
            {item.clientName && (
              <p className="truncate">Client: {item.clientName}</p>
            )}
            {type === 'payment' && item.particular && (
              <p className="truncate">Details: {item.particular}</p>
            )}
            {type === 'crm' && item.processName && (
              <p className="truncate">Process: {item.processName}</p>
            )}
            {type === 'tendor' && item.vendorname && (
              <p className="truncate">Vendor: {item.vendorname}</p>
            )}
            {type === 'tendor' && item.vendorAddress && (
              <p className="truncate">Address: {item.vendorAddress}</p>
            )}
            {type === 'crm' && item.note && (
              <p className="truncate">Note: {item.note}</p>
            )}
            {(type === 'payment' && item.clientNumber) ||
            (type === 'crm' && item.phone) ||
            (type === 'tendor' && item.vendorPhone) ? (
              <p className="truncate">
                {type === 'payment'
                  ? 'Client Number'
                  : type === 'crm'
                    ? 'Phone'
                    : 'Vendor Phone'}
                :{' '}
                {type === 'payment'
                  ? item.clientNumber
                  : type === 'crm'
                    ? item.phone
                    : item.vendorPhone}
              </p>
            ) : null}
            {type === 'crm' && item.employeeName && (
              <p className="truncate">Employee: {item.employeeName}</p>
            )}

            {/* Action Buttons - Different for Payment and others */}
            <div className="mt-2 flex flex-wrap gap-2">
              {type === 'payment' ? (
                <>
                  <button
                    className="flex items-center gap-1 rounded-md bg-green-600 px-2 py-1.5 text-xs font-medium text-white transition-colors hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1 disabled:opacity-50 sm:gap-2 sm:px-3 sm:text-sm"
                    title="Accept"
                    onClick={() => onAccept(item.id, type)}
                  >
                    <FaCheck className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>Accept</span>
                  </button>

                  <button
                    className="flex items-center gap-1 rounded-md bg-blue-600 px-2 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:opacity-50 sm:gap-2 sm:px-3 sm:text-sm"
                    title="Edit"
                    onClick={() => openEditModal(item, type)}
                  >
                    <FaEdit className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>Edit</span>
                  </button>

                  <button
                    className="flex items-center gap-1 rounded-md bg-green-500 px-2 py-1.5 text-xs font-medium text-white transition-colors hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-1 disabled:opacity-50 sm:gap-2 sm:px-3 sm:text-sm"
                    title="Share to WhatsApp"
                    onClick={() => shareToWhatsApp(item, type)}
                  >
                    <FaWhatsapp className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>Share</span>
                  </button>
                </>
              ) : (
                // CRM and Tendor Tabs - Only Edit and Share buttons
                <>
                  {/* <button
                    className="flex items-center gap-1 rounded-md bg-blue-600 px-2 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:opacity-50 sm:gap-2 sm:px-3 sm:text-sm"
                    title="Edit"
                    onClick={() => openEditModal(item, type)}
                  >
                    <FaEdit className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>Edit</span>
                  </button> */}

                  <button
                    className="flex items-center gap-1 rounded-md bg-green-500 px-2 py-1.5 text-xs font-medium text-white transition-colors hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-1 disabled:opacity-50 sm:gap-2 sm:px-3 sm:text-sm"
                    title="Share to WhatsApp"
                    onClick={() => shareToWhatsApp(item, type)}
                  >
                    <FaWhatsapp className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>Share</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNoNotifications = () => (
    <div className="flex flex-col items-center justify-center p-6 text-center">
      <svg
        className="text-gray-400 h-12 w-12"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1}
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
        />
      </svg>
      <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
        No new {activeTab} notifications
      </p>
    </div>
  );

  return (
    <ClickOutside onClick={() => setDropdownOpen(false)} className="relative">
      <li className="relative">
        <Link
          onClick={() => {
            setNotifying(false);
            setDropdownOpen(!dropdownOpen);
          }}
          className="relative flex h-8.5 w-8.5 items-center justify-center rounded-full border-[0.5px] border-stroke bg-gray hover:text-primary dark:border-strokedark dark:bg-meta-4 dark:text-white"
        >
          <span
            className={`absolute -top-0.5 right-0 z-1 h-2 w-2 rounded-full bg-meta-1 ${
              notifying === false ? 'hidden' : 'inline'
            }`}
          >
            <span className="absolute -z-1 inline-flex h-full w-full animate-ping rounded-full bg-meta-1 opacity-75"></span>
          </span>

          <svg
            className="fill-current duration-300 ease-in-out"
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M16.1999 14.9343L15.6374 14.0624C15.5249 13.8937 15.4687 13.7249 15.4687 13.528V7.67803C15.4687 6.01865 14.7655 4.47178 13.4718 3.31865C12.4312 2.39053 11.0812 1.7999 9.64678 1.6874V1.1249C9.64678 0.787402 9.36553 0.478027 8.9999 0.478027C8.6624 0.478027 8.35303 0.759277 8.35303 1.1249V1.65928C8.29678 1.65928 8.24053 1.65928 8.18428 1.6874C4.92178 2.05303 2.4749 4.66865 2.4749 7.79053V13.528C2.44678 13.8093 2.39053 13.9499 2.33428 14.0343L1.7999 14.9343C1.63115 15.2155 1.63115 15.553 1.7999 15.8343C1.96865 16.0874 2.2499 16.2562 2.55928 16.2562H8.38115V16.8749C8.38115 17.2124 8.6624 17.5218 9.02803 17.5218C9.36553 17.5218 9.6749 17.2405 9.6749 16.8749V16.2562H15.4687C15.778 16.2562 16.0593 16.0874 16.228 15.8343C16.3968 15.553 16.3968 15.2155 16.1999 14.9343ZM3.23428 14.9905L3.43115 14.653C3.5999 14.3718 3.68428 14.0343 3.74053 13.6405V7.79053C3.74053 5.31553 5.70928 3.23428 8.3249 2.95303C9.92803 2.78428 11.503 3.2624 12.6562 4.2749C13.6687 5.1749 14.2312 6.38428 14.2312 7.67803V13.528C14.2312 13.9499 14.3437 14.3437 14.5968 14.7374L14.7655 14.9905H3.23428Z"
              fill=""
            />
          </svg>
        </Link>

        {dropdownOpen && (
          <div className="absolute -right-27 mt-2.5 w-[95vw] max-w-sm rounded-lg border border-stroke bg-white shadow-xl dark:border-strokedark dark:bg-boxdark sm:-right-10 sm:w-96">
            <div className="sticky top-0 z-10 border-b border-stroke bg-white px-4 py-3 dark:border-strokedark dark:bg-boxdark">
              <div className="flex items-center justify-between">
                <h5 className="text-sm font-semibold text-bodydark2">
                  Notifications
                </h5>
                <span className="text-gray-500 text-xs">{getCount()} new</span>
              </div>
            </div>

            {/* Tab Buttons - Improved with Sky Blue Color */}
            <div className="bg-gray-50 border-b border-stroke px-2 py-2 dark:bg-meta-4">
              <div className="bg-gray-100 flex w-full rounded-lg p-1 dark:bg-meta-2">
                <button
                  onClick={() => setActiveTab('payment')}
                  className={`flex-1 rounded-md px-2 py-2 text-sm font-medium transition-all duration-200 ${
                    activeTab === 'payment'
                      ? 'mx-1 rounded bg-primary px-6 py-1 text-white transition duration-300 ease-in-out disabled:cursor-not-allowed disabled:opacity-50'
                      : 'hover:text-gray-700 text-black dark:text-black'
                  }`}
                >
                  Payment
                </button>
                <button
                  onClick={() => setActiveTab('crm')}
                  className={`flex-1 rounded-md px-2 py-2 text-sm font-medium transition-all duration-200 ${
                    activeTab === 'crm'
                      ? 'mx-1 rounded bg-primary px-6 py-1 text-white transition duration-300 ease-in-out disabled:cursor-not-allowed disabled:opacity-50'
                      : 'hover:text-gray-700 text-black dark:text-black'
                  }`}
                >
                  CRM
                </button>
                <button
                  onClick={() => setActiveTab('tendor')}
                  className={`flex-1 rounded-md px-2 py-2 text-sm font-medium transition-all duration-200 ${
                    activeTab === 'tendor'
                      ? 'mx-1 rounded bg-primary px-6 py-1 text-white transition duration-300 ease-in-out disabled:cursor-not-allowed disabled:opacity-50'
                      : 'hover:text-gray-700 text-black dark:text-black'
                  }`}
                >
                  Tendor
                </button>
              </div>
            </div>

            <div className="max-h-80 overflow-y-auto">
              {activeTab === 'payment'
                ? notificationReponse?.length
                  ? notificationReponse.map((item: any, index: number) =>
                      renderNotificationItem(item, index, 'payment'),
                    )
                  : renderNoNotifications()
                : activeTab === 'crm'
                  ? followupDate?.length
                    ? followupDate.map((item: any, index: number) =>
                        renderNotificationItem(item, index, 'crm'),
                      )
                    : renderNoNotifications()
                  : tendar?.length
                    ? tendar.map((item: any, index: number) =>
                        renderNotificationItem(item, index, 'tendor'),
                      )
                    : renderNoNotifications()}
            </div>
          </div>
        )}

        {/* Edit Modal - Only for Payment items */}
        {isEditModalOpen && selectedItem && itemType === 'payment' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className="w-full max-w-md rounded-lg bg-white shadow-lg dark:bg-boxdark">
              <div className="border-b border-stroke px-6 py-4 dark:border-strokedark">
                <h2 className="text-lg font-semibold text-black dark:text-white">
                  Edit Payment Notification
                </h2>
              </div>

              <div className="space-y-4 p-6">
                <div>
                  <label className="mb-1 block text-sm font-medium text-black dark:text-white">
                    Date
                  </label>
                  <input
                    type="date"
                    value={
                      selectedItem.date ? selectedItem.date.split('T')[0] : ''
                    }
                    onChange={(e) =>
                      setSelectedItem({
                        ...selectedItem,
                        date: e.target.value,
                      })
                    }
                    className="w-full rounded border border-stroke px-3 py-2 text-sm focus:border-primary focus:outline-none dark:border-strokedark dark:bg-boxdark dark:text-white"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-black dark:text-white">
                    Particular
                  </label>
                  <input
                    type="text"
                    value={selectedItem.particular || ''}
                    onChange={(e) =>
                      setSelectedItem({
                        ...selectedItem,
                        particular: e.target.value,
                      })
                    }
                    className="w-full rounded border border-stroke px-3 py-2 text-sm focus:border-primary focus:outline-none dark:border-strokedark dark:bg-boxdark dark:text-white"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-black dark:text-white">
                    Amount
                  </label>
                  <input
                    type="text"
                    value={selectedItem.amount || ''}
                    onChange={(e) =>
                      setSelectedItem({
                        ...selectedItem,
                        amount: e.target.value,
                      })
                    }
                    className="w-full rounded border border-stroke px-3 py-2 text-sm focus:border-primary focus:outline-none dark:border-strokedark dark:bg-boxdark dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-stroke p-6 dark:border-strokedark">
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="hover:bg-gray-100 rounded border border-stroke px-4 py-2 text-sm font-medium text-black dark:border-strokedark dark:text-white dark:hover:bg-meta-4"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setIsEditModalOpen(false);
                    edit(selectedItem, itemType);
                  }}
                  className="hover:bg-primary-dark rounded bg-primary px-4 py-2 text-sm font-medium text-white"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </li>
    </ClickOutside>
  );
};

export default DropdownNotification;
