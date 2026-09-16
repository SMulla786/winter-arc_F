import React, {useEffect, useRef, useState} from 'react';
import GenericButton from '@/components/Forms/Buttons/GenericButton';
import {FormProvider, useForm, SubmitHandler} from 'react-hook-form';
import {
  useGetActualPeople,
  useGetSubevent,
  useUpdateActualPeople,
} from '@/lib/react-query/queriesAndMutations/cateror/event';
import {Route} from '@/routes/_app/_event/events.$id';
import {BiChevronDown, BiChevronUp} from 'react-icons/bi';
import {FiSave, FiDownload} from 'react-icons/fi';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import {useAuthContext} from '@/context/AuthContext';

interface Dish {
  dish: {name: string};
  actual: number;
}

interface SubEvent {
  id: string;
  date: string;
  name: string;
  expectedPeople?: number;
  dishes: Dish[];
}

interface EventData {
  name: string;
  subEvents: SubEvent[];
}

interface FormValues {
  subEventPeople: {
    subEventId: string;
    expectedPeople: number;
    actualPeople: number;
    status: string;
  }[];
}

const EventPeopleCheck: React.FC = () => {
  const methods = useForm<FormValues>({
    defaultValues: {
      subEventPeople: [],
    },
  });
  const tableRef = useRef<HTMLDivElement>(null);
  const {
    control,
    handleSubmit,
    setValue,
    register,
    formState: {isSubmitting},
  } = methods;
  const {id: EventId} = Route.useParams();
  const {user} = useAuthContext();
  const restriction = user?.employeeRestriction?.peopleCheck;
  const role = user?.role;
  const {mutateAsync: updateActualPeople, isSuccess} = useUpdateActualPeople();
  const {data: subEvent} = useGetSubevent(EventId);
  console.log('subEventData', subEvent);
  const {data: actualPeople, refetch} = useGetActualPeople(EventId);

  const subeventPeople: EventData | undefined = subEvent?.data;
  const [isCollapsed, setIsCollapsed] = useState(false);

  const [subEventPeopleState, setSubEventPeopleState] = useState<{
    eventName: string;
    subEvents: {
      expectedPeople: string;
      subEventId: string;
      date: string;
      dishes: {
        dishName: string;
        quantity: number;
      }[];
    }[];
  } | null>(null);
  console.log('subEventPeopleState', subEventPeopleState);

  useEffect(() => {
    if (subeventPeople && actualPeople?.data?.subevents) {
      const eventName = subeventPeople.name;

      const formattedSubEvents = subeventPeople.subEvents?.map((subEvent) => {
        const actualPeopleEntry = actualPeople.data.subevents.find(
          (sub) => sub.id === subEvent.id,
        );

        return {
          subEventId: subEvent.id,
          date: subEvent.date,
          expectedPeople: subEvent?.expectedPeople,
          actualPeople: actualPeopleEntry ? actualPeopleEntry.actualPeople : 0,
          dishes: subEvent.dishes.map((dishItem) => ({
            dishName: dishItem.dish?.name,
            quantity: dishItem.actual,
          })),
        };
      });

      setSubEventPeopleState({eventName, subEvents: formattedSubEvents});
      setValue('subEventPeople', formattedSubEvents);
    }
  }, [subeventPeople, actualPeople, setValue, isSuccess]);

  useEffect(() => {
    if (isSuccess) {
      refetch();
    }
  }, [isSuccess, refetch]);

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    const sendingData = data.subEventPeople.map((item) => ({
      subEventId: item.subEventId,
      actualPeople: Number(item.actualPeople),
    }));

    try {
      await updateActualPeople(sendingData);
      refetch();
    } catch (error) {
      console.error('Error updating people:', error);
    }
  };

  const handleDownloadPDF = () => {
    if (!subEventPeopleState) return;

    const items = subEventPeopleState.subEvents;
    const getSubName = (item) =>
      subeventPeople?.subEvents?.find((sub) => sub.id === item.subEventId)
        ?.name || '';

    // ========== BUILD HTML ==========
    let htmlContent = `
    <!-- FIRST PAGE HEADER -->
    <div style="text-align:center; border:1px solid #0D47A1; padding:8px; margin-bottom:12px; background:#E3F2FD;">
      <h1 style="margin:0; font-size:24px; color:#0D47A1; font-weight:800;">
        ${user?.fullname || 'Caterer Name'}
      </h1>
      <p style="margin:6px 0 0; font-size:11px; font-weight:bold;">
        ${user?.address || ''}
        ${user?.email ? ` | Email - ${user.email}` : ''}
        | Mob. ${user?.phoneNumber || ''}
      </p>
    </div>

    <!-- MAIN TITLE -->
    <div style="text-align:center; background:#0D47A1; color:white; padding:10px 6px; margin-bottom:15px; font-weight:bold;">
      <h2 style="margin:0; font-size:17px;">Event People Report</h2>
      <div style="font-size:11px; margin-top:4px;">
        <strong>Event:</strong> ${subEventPeopleState.eventName}
        &nbsp;|&nbsp;
        <strong>Start Date:</strong> ${new Date(
          subEvent?.data.startDate,
        ).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })}
        &nbsp;|&nbsp;
        <strong>End Date:</strong> ${new Date(
          subEvent?.data.endDate,
        ).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })}
      </div>
    </div>

    <!-- TABLE -->
    <table style="width:100%; border-collapse: collapse; font-family:Arial; font-size:12px;">
      <thead>
        <tr style="background:#1E3A8A; color:white; font-weight:bold;">
          <th style="padding:6px; border:1px solid #ccc; text-align:center;">Sub Event</th>
          <th style="padding:6px; border:1px solid #ccc; text-align:center;">Expected</th>
          <th style="padding:6px; border:1px solid #ccc; text-align:center;">Actual</th>
        </tr>
      </thead>
      <tbody>
  `;

    // Row generation (unchanged data)
    items.forEach((item, index) => {
      htmlContent += `
      <tr style="background:${index % 2 === 0 ? '#fff' : '#f8f9f8'};">
        <td style="padding:6px; border:1px solid #ddd; font-weight:bold; text-align:center;">
          ${getSubName(item)}
        </td>
        <td style="padding:6px; border:1px solid #ddd; font-weight:bold; text-align:center;">
          ${item.expectedPeople ?? ''}
        </td>
        <td style="padding:6px; border:1px solid #ddd; font-weight:bold; text-align:center;">
          ${item.actualPeople ?? ''}
        </td>
      </tr>
    `;
    });

    htmlContent += `
      </tbody>
    </table>

    <!-- FOOTER -->
    <div style="margin-top:10px; text-align:center; font-size:11px;">
      Generated on: ${String(new Date().getDate()).padStart(2, '0')}/${String(
        new Date().getMonth() + 1,
      ).padStart(2, '0')}/${String(new Date().getFullYear()).slice(-2)}
    </div>
  `;

    // ========== PRINT WINDOW ==========
    const printWindow = window.open(
      '',
      'printWindow',
      'width=1000,height=800,scrollbars=yes',
    );
    if (!printWindow) {
      alert('Please enable popups to download PDF');
      return;
    }

    printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8"/>
  <title>Event People Report -  ${subEventPeopleState.eventName}</title>
        <style>
          body {
            margin:0;
            padding:0;
            font-family: Arial, sans-serif;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          body.first-page .repeat-title {
            display:none !important;
          }

          /* Title for pages 2+ */
          .repeat-title {
            position: fixed;
            top: 0;
            left: 8px;
            background:#0D47A1;
            color:white;
            padding:6px 10px;
            font-size:13px;
            font-weight:bold;
            z-index:9999;
          }

          table {
            width:100%;
            border-collapse: collapse;
          }

          thead { 
            display: table-header-group;
          }

          tr, td, th {
            page-break-inside: avoid !important;
          }

          @media print {
            .repeat-title {
              -webkit-print-color-adjust: exact;
            }
          }
        </style>
      </head>

      <body class="first-page">

        <div style="padding:14px;">
          ${htmlContent}
        </div>

        <script>
          setTimeout(() => {
            document.body.classList.remove('first-page');
            window.print();
            setTimeout(() => window.close(), 500);
          }, 300);
        </script>
      </body>
    </html>
  `);

    printWindow.document.close();
  };

  return (
    <div className="bg-transparent">
      {' '}
      <div className="rounded-lg bg-white dark:border-strokedark dark:bg-boxdark">
        <div className="mb-4 flex items-center justify-between rounded-t-lg bg-blue-900 px-4 py-5 text-white">
          <h2 className="text-gray-800 text-xl font-bold dark:text-white">
            People Count
          </h2>
          <div className="flex items-center">
            {/* <button
              onClick={handleDownloadPDF}
              className="flex gap-1 rounded bg-blue-100 px-4 py-4 text-sm font-medium text-blue-600 hover:bg-blue-200"
            >
              <span>📄</span>
              Download PDF
            </button> */}

            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 rounded bg-blue-100 px-3 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-200"
            >
              Download PDF
            </button>
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full p-2"
            >
              {isCollapsed ? (
                <BiChevronDown size={24} />
              ) : (
                <BiChevronUp size={24} />
              )}
            </button>
          </div>
        </div>

        {!isCollapsed && (
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div ref={tableRef} className="overflow-x-auto">
                <table className="text-gray-500 dark:text-gray-400 w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-700 dark:bg-gray-700 dark:text-gray-400 bg-blue-100 text-xs uppercase dark:bg-black">
                    <tr>
                      <th scope="col" className="px-6 py-3">
                        Sub Event
                      </th>
                      <th scope="col" className="px-6 py-3">
                        Expected People
                      </th>
                      <th scope="col" className="px-6 py-3">
                        Actual People
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {subEventPeopleState?.subEvents &&
                      subEventPeopleState.subEvents?.map((item, index) => (
                        <tr
                          key={index}
                          className="dark:border-gray-700 dark:bg-gray-800 border-b border-stroke bg-transparent dark:border-strokedark"
                        >
                          <td className="text-gray-900 px-6 py-4 font-medium dark:text-white">
                            {subeventPeople?.subEvents?.find(
                              (sub) => sub.id === item.subEventId,
                            )?.name || ''}
                          </td>
                          <td className="px-6 py-4">{item.expectedPeople}</td>
                          <td className="px-6 py-4">
                            <input
                              {...register(
                                `subEventPeople.${index}.actualPeople`,
                              )}
                              type="number"
                              className="w-24 rounded border border-stroke bg-white px-2 py-1 dark:border-meta-2 dark:bg-boxdark dark:text-white"
                            />
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
              {(role === 'CATEROR' || restriction === 'EDIT') && (
                <div className="mt-6 flex justify-end">
                  <GenericButton
                    type="submit"
                    disabled={isSubmitting}
                    className="mx-1 rounded bg-primary px-6 py-1 text-white transition duration-300 ease-in-out disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isSubmitting ? 'Saving...' : 'Save'}
                  </GenericButton>
                </div>
              )}
            </form>
          </FormProvider>
        )}
      </div>
    </div>
  );
};

export default EventPeopleCheck;
