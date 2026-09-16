/* eslint-disable */
import {
  useDeleteSubEvent,
  useGetMultiPackagesToSubEvent,
  useGetSubevent,
  usePostMultiPackagesToSubEvent,
} from '@/lib/react-query/queriesAndMutations/cateror/event';
import {useGetCaterorById} from '@/lib/react-query/queriesAndMutations/cateror/dish';
import {subEventValidationSchema} from '@/lib/validation/eventSchema';
import {useNavigate} from '@tanstack/react-router';
import React, {useEffect, useState} from 'react';
import {BiEditAlt, BiLinkExternal, BiQr} from 'react-icons/bi';
import {FiDelete} from 'react-icons/fi';
import {MdDeleteSweep, MdOutlineFileDownload} from 'react-icons/md';
import z from 'zod';
import {Loader} from '../Loader/Loader';
import {confirmAlert} from 'react-confirm-alert';
import toast from 'react-hot-toast';
import {Route} from '@/routes/_app/_event/events.$id';
import {HiOutlineLink} from 'react-icons/hi2';
import {useAuthContext} from '@/context/AuthContext';
import {api} from '@/utils/axios';
import {FaDownload, FaRegFilePdf} from 'react-icons/fa';
// import {Route} from '@/routes/_app/_event/events.$id';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {useGetAllPackage} from '@/lib/react-query/package/displaypackage';
import {downloadEventPdf} from '@/components/Event/utils/pdfDownloader';
import {BackgroundPicker} from '@/components/Event/utils/BackgroundPicker';
import pdfBg from '@/assets/images/pdf-bg/bg.png';

type SubEventType = z.infer<typeof subEventValidationSchema>;

const SubEventList: React.FunctionComponent = () => {
  const {user} = useAuthContext();
  const restriction = user?.employeeRestriction?.subEventPage;
  const role = user?.role;

  const {id: EventId} = Route.useParams();
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [subEventId, setSubEventId] = useState<string | null>(null);
  const [selectedPackages, setSelectedPackages] = useState<string[]>([]);
  console.log('selectedPackages', selectedPackages);
  const [bgPickerOpen, setBgPickerOpen] = useState(false);
  const [pendingPdfSubEventId, setPendingPdfSubEventId] = useState<
    string | null
  >(null);

  const {data: subEventResponse, isLoading, refetch} = useGetSubevent(EventId);
  console.log('datanew-', subEventResponse);
  const {data: packageData} = useGetAllPackage();
  console.log('packageData', packageData);
  const {mutate: postMultiPackages} = usePostMultiPackagesToSubEvent();
  const {mutateAsync: deleteSubEvent} = useDeleteSubEvent();
  const {
    data: multiPackagesData,
    refetch: refetchPackages,
    isLoading: isLoadingPackages,
  } = useGetMultiPackagesToSubEvent(subEventId as string, {enabled: false});
  // console.log('multiPackagesData', multiPackagesData);
  const [pdfData, setPdfData] = useState<any>(null);
  const {data: catererData} = useGetCaterorById(user?.caterorId || '', {
    enabled: !!user?.caterorId,
  });
  console.log('cat data----0', catererData);

  const handleOpenModal = (id: string) => {
    setSubEventId(id);
    setSelectedPackages([]); // Reset
    setIsModalOpen(true);
    refetchPackages(); // Trigger fresh fetch
  };

  // useEffect stays same
  useEffect(() => {
    console.log('multiPackagesData multiPackagesData ', multiPackagesData);
    if (multiPackagesData?.data && Array.isArray(multiPackagesData.data)) {
      const packageIds = multiPackagesData.data.map(
        (pkg: any) => pkg.packageId,
      );
      setSelectedPackages(packageIds);
    }
  }, [multiPackagesData]);
  // console.log('multiPackagesData', multiPackagesData);

  // useEffect(() => {
  //   if (multiPackagesData && Array.isArray(multiPackagesData.packages)) {
  //     const packageIds = multiPackagesData.packages.map(
  //       (pkg: any) => pkg.packageId,
  //     );
  //     setSelectedPackages(packageIds);
  //   }
  // }, [multiPackagesData]);

  const togglePackage = (packageId: string) => {
    setSelectedPackages((prev) =>
      prev.includes(packageId)
        ? prev.filter((id) => id !== packageId)
        : [...prev, packageId],
    );
  };
  const vegPackages = packageData?.filter(
    (pkg: any) => pkg.packageType === 'VEG',
  );

  const nonVegPackages = packageData?.filter(
    (pkg: any) => pkg.packageType === 'NONVEG',
  );

  const mappedSubEvents =
    subEventResponse?.data.subEvents
      ?.map((subEvent) => {
        // Create date object from the original time
        let date = new Date(subEvent.time);

        // Subtract 5.5 hours (330 minutes) from the time
        const originalTime = date.getTime();
        const adjustedTime = originalTime - 5.5 * 60 * 60 * 1000; // Subtract 5.5 hours in milliseconds
        date = new Date(adjustedTime);

        // Format time in Indian format (12-hour with AM/PM) after subtracting 5.5 hours
        let hours = date.getHours();
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        const formattedHours = hours === 0 ? 12 : hours; // Convert 0 to 12 for 12 AM

        // Format date in Indian format (DD/MM/YYYY)
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();

        return {
          ...subEvent,
          SubEventName: subEvent.name,
          Time: `${formattedHours}:${minutes} ${ampm}`, // Indian format with 5.5 hrs subtracted
          StartDate: `${day}/${month}/${year}`, // Indian format: 24/05/2024
          isEnabled: subEvent.isEnabled,
          originalTime: new Date(subEvent.time), // Keep original for reference if needed
        };
      })
      ?.sort((a, b) => {
        // Sort using the adjusted time
        const adjustedDateA = new Date(
          a.originalTime.getTime() - 5.5 * 60 * 60 * 1000,
        );
        const adjustedDateB = new Date(
          b.originalTime.getTime() - 5.5 * 60 * 60 * 1000,
        );

        const dateA = adjustedDateA.getTime();
        const dateB = adjustedDateB.getTime();
        if (dateA !== dateB) return dateA - dateB;

        const timeA =
          adjustedDateA.getHours() * 60 + adjustedDateA.getMinutes();
        const timeB =
          adjustedDateB.getHours() * 60 + adjustedDateB.getMinutes();
        return timeA - timeB;
      }) || [];

  const handleEditSubEvent = (id: string) => {
    navigate({
      to: `/update-subevent/${id}`,
    });
  };

  const handleGenerateQR = (id: string) => {
    navigate({
      to: `/qrgenerator/${id}`,
    });
  };

  // Function to show PDF preview popup in CURRENT TAB
  const showPDFPreviewPopup = (
    pdfBlob: Blob,
    pdfUrl: string,
    subEventId: string,
  ) => {
    // Create a unique ID for this preview
    const previewId = `pdf-preview-${Date.now()}`;

    // Create modal/popup container
    const modal = document.createElement('div');
    modal.id = previewId;
    modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.95);
    z-index: 99999;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    animation: fadeIn 0.3s ease;
  `;

    // Add CSS for animations
    if (!document.querySelector('#pdf-preview-styles')) {
      const style = document.createElement('style');
      style.id = 'pdf-preview-styles';
      style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes slideIn {
        from { transform: translateY(20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
      @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
      }
      @media (max-width: 768px) {
        #pdf-preview-modal {
          width: 95% !important;
          height: 95vh !important;
        }
        #pdf-preview-content {
          height: 85vh !important;
        }
      }
      .print-btn:hover {
        background: #2980b9 !important;
      }
      .download-btn:hover {
        background: #219653 !important;
      }
      .close-btn:hover {
        background: #c0392b !important;
      }
    `;
      document.head.appendChild(style);
    }

    modal.innerHTML = `
    <div id="pdf-preview-modal" style="
      width: 90%;
      max-width: 1000px;
      height: 90vh;
      background: #fff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      display: flex;
      flex-direction: column;
      animation: slideIn 0.3s ease;
    ">
      <!-- Header with title and controls -->
      <div style="
        background: #2c3e50;
        color: white;
        padding: 16px 20px;
        display: flex;
        
        align-items: right;
        border-bottom: 1px solid rgba(255,255,255,0.1);
      ">
       
        <div style="display: flex; gap: 10px; align-items: right;"> 
          <button id="close-btn" style="
            background: #e74c3c;
            color: white;
            border: none;
            width: 36px;
            height: 36px;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            transition: all 0.2s;
          ">
            ×
          </button>
        </div>
      </div>
      
      <!-- PDF Content Area -->
      <div id="pdf-preview-content" style="
        flex: 1;
        background: #525659;
        overflow: auto;
        position: relative;
      ">
        <embed 
          src="${pdfUrl}" 
          type="application/pdf" 
          style="
            width: 100%;
            height: 100%;
            border: none;
          "
        />
        
        <!-- Fallback for mobile devices -->
        <div id="pdf-mobile-fallback" style="
          display: none;
          padding: 20px;
          text-align: center;
          color: white;
        ">
          <p>PDF viewer not supported on this device. Please use the download button.</p>
        </div>
      </div>
    </div>
  `;

    // Add to current page
    document.body.appendChild(modal);

    // Get elements
    const closeBtn = modal.querySelector('#close-btn');
    const printBtn = modal.querySelector('#print-btn');
    const downloadBtn = modal.querySelector('#download-btn');
    const pdfEmbed = modal.querySelector('embed');
    // Event Listeners
    const closePreview = () => {
      modal.style.animation = 'fadeOut 0.3s ease';
      setTimeout(() => {
        document.body.removeChild(modal);
        URL.revokeObjectURL(pdfUrl); // Clean up memory
      }, 300);
    };

    // Close button
    closeBtn?.addEventListener('click', closePreview);

    // Download button
    downloadBtn?.addEventListener('click', () => {
      const a = document.createElement('a');
      a.href = pdfUrl;
      a.download = `qr-code-${subEventId}-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });

    // Print button - DIRECT PRINT without opening new tab
    printBtn?.addEventListener('click', () => {
      // Close the preview modal first
      closePreview();

      // Create a temporary iframe for printing
      const printIframe = document.createElement('iframe');
      printIframe.style.position = 'absolute';
      printIframe.style.left = '-9999px';
      printIframe.style.top = '-9999px';
      printIframe.style.width = '0';
      printIframe.style.height = '0';
      printIframe.style.border = 'none';

      document.body.appendChild(printIframe);

      printIframe.onload = () => {
        try {
          // Create a blob URL for the PDF
          const printPdfUrl = URL.createObjectURL(pdfBlob);

          // Set the iframe source to the PDF
          (printIframe as HTMLIFrameElement).src = printPdfUrl;

          // Wait for PDF to load in iframe
          setTimeout(() => {
            try {
              // Focus and print
              (printIframe as HTMLIFrameElement).focus();

              // For Chrome, Firefox, Edge
              if ((printIframe as HTMLIFrameElement).contentWindow) {
                (printIframe as HTMLIFrameElement).contentWindow?.print();
              }

              // Clean up after print dialog closes
              setTimeout(() => {
                URL.revokeObjectURL(printPdfUrl);
                document.body.removeChild(printIframe);
              }, 1000);
            } catch (printError) {
              console.error('Print error:', printError);

              // Fallback: Open PDF in new tab for printing
              const printWindow = window.open(pdfUrl, '_blank');
              if (printWindow) {
                printWindow.onload = () => {
                  printWindow.print();
                };
              }

              // Clean up
              URL.revokeObjectURL(printPdfUrl);
              document.body.removeChild(printIframe);
            }
          }, 1000);
        } catch (error) {
          console.error('Error setting up print:', error);
          toast.error('Failed to print PDF');
          document.body.removeChild(printIframe);
        }
      };

      // Fallback if iframe fails to load
      printIframe.onerror = () => {
        console.error('Print iframe failed to load');

        // Alternative method: Create object URL and open in new tab
        const printPdfUrl = URL.createObjectURL(pdfBlob);
        const printWindow = window.open(printPdfUrl, '_blank');

        if (printWindow) {
          printWindow.onload = () => {
            printWindow.print();

            // Clean up after printing
            setTimeout(() => {
              URL.revokeObjectURL(printPdfUrl);
            }, 1000);
          };
        } else {
          // toast.warning('Please allow popups to print the PDF');
          // If popup blocked, download the PDF
          const a = document.createElement('a');
          a.href = pdfUrl;
          a.download = `qr-code-${subEventId}-print.pdf`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }

        document.body.removeChild(printIframe);
      };
    });

    // Focus the modal for keyboard accessibility
    modal.setAttribute('tabindex', '0');
    modal.focus();
  };

  const handleToggle = async (subEvent: any) => {
    const invertedValue = !subEvent.isEnabled;
    try {
      const response = await api.put(
        `cateror/events/subevents/linkActive/${subEvent.id}`,
        {edit: invertedValue},
      );
      if (response) {
        toast.success('Link status updated successfully');
        refetch();
      }
    } catch (error) {
      console.error('Error updating link status:', error);
      toast.error('Failed to update link status');
    }
  };

  const handleDeleteSubEvent = async (id: string) => {
    confirmAlert({
      customUI: ({onClose}) => {
        console.log('delete sub event id', id);
        return (
          <div className="fixed inset-0 z-20 flex items-center justify-center bg-meta-4 bg-opacity-50">
            <div className="w-full max-w-md rounded-lg bg-white p-6 text-black shadow-md dark:bg-meta-4 dark:text-white">
              <h2 className="mb-4 text-xl font-semibold">Confirm to delete</h2>
              <p className="mb-6">Are you sure you want to delete sub event?</p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={async () => {
                    try {
                      await deleteSubEvent(id);
                      onClose();
                    } catch (error) {
                      console.error('Error deleting sub event:', error);
                      onClose();
                    }
                  }}
                  className="rounded bg-red-600 px-4 py-2 text-white transition hover:bg-red-700"
                >
                  Yes
                </button>
                <button
                  onClick={onClose}
                  className="bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 rounded px-4 py-2 text-black transition dark:text-white"
                >
                  No
                </button>
              </div>
            </div>
          </div>
        );
      },
    });
  };
  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="bg-white dark:bg-black">
      <div className="ml-4 flex items-center bg-white dark:bg-black">
        <div className="mr-6 rounded-md bg-indigo-100 px-3 py-1 font-medium text-indigo-800">
          Subevent List
        </div>
      </div>

      <div className="mt-2 overflow-x-auto bg-white dark:bg-black">
        <table className="min-w-full dark:divide-graydark">
          <thead>
            <tr className="bg-gray-2 text-left dark:bg-meta-4">
              <th className="text-gray-500 bg-gray-2 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider dark:bg-meta-4">
                Date
              </th>
              <th className="text-gray-500 bg-gray-2 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider dark:bg-meta-4">
                Time
              </th>
              <th className="text-gray-500 bg-gray-2 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider dark:bg-meta-4">
                Sub Event
              </th>
              <th className="text-gray-500 bg-gray-2 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider dark:bg-meta-4">
                Expected People
              </th>
              <th className="text-gray-500 bg-gray-2 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider dark:bg-meta-4">
                QR Code
              </th>
              {(role === 'CATEROR' || restriction === 'EDIT') && (
                <th className="text-gray-500 bg-gray-2 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider dark:bg-meta-4">
                  Link
                </th>
              )}
              {(role === 'CATEROR' || restriction === 'EDIT') && (
                <th className="text-gray-500 bg-gray-2 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider dark:bg-meta-4">
                  Link status
                </th>
              )}

              {(role === 'CATEROR' || restriction === 'EDIT') && (
                <th className="text-gray-500 bg-gray-2 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider dark:bg-meta-4">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-gray-200 bg-transparent">
            {mappedSubEvents.map((subEvent, index) => (
              <tr
                key={subEvent.id}
                className={`hover:bg-gray-50 ${index % 2 === 0 ? 'bg-blue-50 dark:dark:bg-[#1F2937]' : 'bg-blue-100 dark:bg-[#374151]'} `}
              >
                <td className="whitespace-nowrap px-6 text-sm text-graydark dark:text-white">
                  {subEvent.StartDate}
                </td>
                <td className="whitespace-nowrap px-6 text-sm text-graydark dark:text-white">
                  {subEvent.Time}
                </td>
                <td className="whitespace-nowrap px-6 text-sm text-graydark dark:text-white">
                  {subEvent.SubEventName}
                </td>
                <td className="whitespace-nowrap px-6 text-sm text-graydark dark:text-white">
                  {subEvent.expectedPeople}
                </td>

                <td className="whitespace-nowrap px-6 text-sm text-graydark dark:text-white">
                  <button
                    onClick={() => handleGenerateQR(subEvent.id)}
                    className="flex items-center justify-center rounded-md p-2 text-graydark dark:text-white"
                    title="Generate QR Code"
                  >
                    <BiQr size={20} />
                  </button>
                </td>

                {(role === 'CATEROR' || restriction === 'EDIT') && (
                  <>
                    <td className="whitespace-nowrap px-6 text-sm text-graydark dark:text-white">
                      <HiOutlineLink
                        size={20}
                        className={
                          subEvent.lastUpdated
                            ? 'cursor-pointer text-green-700'
                            : 'cursor-pointer text-primary'
                        }
                        title={
                          subEvent.lastUpdated
                            ? `Last Updated: ${new Intl.DateTimeFormat(
                                'en-US',
                                {
                                  month: 'short',
                                  day: '2-digit',
                                  year: 'numeric',
                                  hour: 'numeric',
                                  minute: 'numeric',
                                  hour12: true,
                                },
                              ).format(new Date(subEvent.lastUpdated))}`
                            : 'Not updated yet'
                        }
                        onClick={() => handleOpenModal(subEvent.id)}
                      />
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center">
                        <label
                          htmlFor={`toggle-${subEvent.id}`}
                          className="flex cursor-pointer items-center"
                        >
                          <div className="relative">
                            <input
                              type="checkbox"
                              id={`toggle-${subEvent.id}`}
                              className="sr-only"
                              checked={subEvent.isEnabled}
                              onChange={() => handleToggle(subEvent)}
                            />
                            <div
                              className={`block h-4 w-8 rounded-full transition-colors duration-200 ease-in-out ${subEvent.isEnabled ? 'bg-blue-600' : 'bg-gray-300 border border-strokedark dark:border-stroke'}`}
                            ></div>
                            <div
                              className={`absolute left-[-4px] top-1 h-2 w-2 rounded-full bg-black transition-transform duration-200 ease-in-out dark:bg-white ${subEvent.isEnabled ? 'translate-x-6 transform bg-white' : 'left-[4px]'}`}
                            ></div>
                          </div>
                        </label>
                      </div>
                    </td>
                  </>
                )}

                {(role === 'CATEROR' || restriction === 'EDIT') && (
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                    <div className="flex items-center gap-4">
                      {/* <button
                        onClick={() => handleEditSubEvent(subEvent.id)}
                        className="text-gray-600 hover:text-indigo-900"
                      >
                        <MdOutlineFileDownload size={20} />
                      </button> */}

                      <button
                        onClick={() => {
                          setPdfData(mappedSubEvents);
                          setBgPickerOpen(true);
                        }}
                        className="text-gray-600 hover:text-red-600" // PDF color adjusted
                        title="Download PDF"
                      >
                        <FaRegFilePdf size={20} />
                      </button>

                      <button
                        onClick={() => handleEditSubEvent(subEvent.id)}
                        className="text-gray-600 hover:text-indigo-900"
                      >
                        <BiEditAlt size={20} />
                      </button>

                      <button
                        onClick={() => handleDeleteSubEvent(subEvent.id)}
                        className="text-gray-600 hover:text-red-900"
                      >
                        <MdDeleteSweep size={20} />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="border-gray-200 dark:border-gray-700 flex max-h-[80vh] w-full max-w-lg flex-col rounded-2xl border bg-white p-5 shadow-2xl dark:bg-black">
              {/* Header */}
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-gray-800 text-lg font-semibold dark:text-white">
                  Share Sub Event
                </h2>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setSelectedPackages([]);
                  }}
                  className="text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 rounded-full p-1 transition"
                >
                  ✕
                </button>
              </div>

              <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
                Share this link for external access
              </p>

              {/* Link Actions */}
              {/* <div className="flex gap-2">
                <button
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-50 px-3 py-2.5 text-sm font-medium text-blue-700 transition hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300"
                  onClick={() => {
                    const link = `${window.location.origin}/subeventexternal/${subEventId}/${user?.caterorId}`;
                    navigator.clipboard.writeText(link);
                    toast.success('Link copied');
                  }}
                >
                  Copy Link
                </button>

                <button
                  onClick={() => {
                    const link = `${window.location.origin}/subeventexternal/${subEventId}/${user?.caterorId}`;
                    window.open(link, '_blank', 'noopener,noreferrer');
                  }}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 px-3 py-2.5 text-sm font-medium text-white shadow hover:from-blue-600 hover:to-blue-700"
                >
                  Open in New Tab
                </button>
              </div> */}

              {/* Package Selection */}
              {/* Package Selection */}
              <div className="border-gray-200 dark:border-gray-700 mt-4 flex flex-1 flex-col border-t pt-4">
                <h3 className="text-gray-700 dark:text-gray-300 mb-3 text-sm font-semibold">
                  Select Packages
                </h3>

                {/* SCROLLABLE AREA */}
                {isLoadingPackages ? (
                  <div className="flex-1 overflow-y-auto pr-2">
                    <p className="text-gray-500 dark:text-gray-400">
                      Loading packages...
                    </p>
                  </div>
                ) : (
                  <div className="flex-1 overflow-y-auto pr-2">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {/* ================= VEG COLUMN ================= */}
                      <div>
                        <h4 className="text-md mb-2 font-semibold text-green-700 dark:text-green-400">
                          Veg Packages
                        </h4>

                        <div className="space-y-2">
                          {vegPackages?.map((pkg: any) => (
                            <label
                              key={pkg.id}
                              className="text-gray-700 dark:text-gray-300 text-md flex cursor-pointer items-center gap-2 font-semibold"
                            >
                              <input
                                type="checkbox"
                                checked={selectedPackages.includes(pkg.id)}
                                onChange={() => togglePackage(pkg.id)}
                                className="accent-green-600"
                              />
                              <span>{pkg.name}</span>
                            </label>
                          ))}

                          {vegPackages?.length === 0 && (
                            <p className="text-gray-400 text-xs">
                              No veg packages
                            </p>
                          )}
                        </div>
                      </div>

                      {/* ================= NON-VEG COLUMN ================= */}
                      <div>
                        <h4 className="text-md mb-2 font-semibold text-red-700 dark:text-red-400">
                          Non-Veg Packages
                        </h4>

                        <div className="space-y-2">
                          {nonVegPackages?.map((pkg: any) => (
                            <label
                              key={pkg.id}
                              className="text-gray-700 dark:text-gray-300 text-md flex cursor-pointer items-center gap-2 font-semibold"
                            >
                              <input
                                type="checkbox"
                                checked={selectedPackages.includes(pkg.id)}
                                onChange={() => togglePackage(pkg.id)}
                                className="accent-red-600"
                              />
                              <span>{pkg.name}</span>
                            </label>
                          ))}

                          {nonVegPackages?.length === 0 && (
                            <p className="text-gray-400 text-xs">
                              No non-veg packages
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Footer (STAYS FIXED) */}
                <div className="text-gray-600 dark:text-gray-400 mt-4 flex items-center justify-between border-t pt-3 text-sm">
                  <span>
                    Selected: <b>{selectedPackages.length}</b>
                  </span>

                  <button
                    onClick={() => {
                      const link = `${window.location.origin}/subeventexternal/${subEventId}/${user?.caterorId}`;

                      // 1. Save packages
                      postMultiPackages({
                        subEventId: subEventId as string,
                        data: selectedPackages,
                      });

                      // 2. Copy link
                      navigator.clipboard.writeText(link);
                      toast.success('Saved and link copied');

                      // 3. Close modal
                      setIsModalOpen(false);
                      setSelectedPackages([]);
                    }}
                    className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
                  >
                    Save & Copy
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        <BackgroundPicker
          isOpen={bgPickerOpen}
          onClose={() => setBgPickerOpen(false)}
          onSelect={(bgUrl) => {
            setBgPickerOpen(false);
            // 3. Generate PDF with DATA + BG URL
            if (pdfData) {
              const catererName = catererData?.data?.user?.fullname; // Adjust based on API structure
              const catererLogo = catererData?.data?.image; // Adjust based on API structure
              downloadEventPdf(pdfData, bgUrl, catererName, catererLogo);
            }
          }}
        />
      </div>
    </div>
  );
};

export default SubEventList;
