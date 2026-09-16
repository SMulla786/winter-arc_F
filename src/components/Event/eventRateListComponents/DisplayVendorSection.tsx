/* eslint-disable */
import {
  useGetAllDisplayVendor,
  useGetAllDisplayVendorData,
} from '@/lib/react-query/queriesAndMutations/cateror/displayVendor';
import {useGetShareDataBySubeventId} from '@/lib/react-query/queriesAndMutations/cateror/event';
import {Route} from '@/routes/_app/_event/events.$id';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {FiEdit} from 'react-icons/fi';
import {IoMdCheckmark} from 'react-icons/io';
import {MdDelete} from 'react-icons/md';
import {RiWhatsappFill} from 'react-icons/ri';
import {RxCross2} from 'react-icons/rx';
import {RateData} from './types';
import {confirmAlert} from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import {BiPrinter} from 'react-icons/bi';
import {useAuthContext} from '@/context/AuthContext';

type DisplayVendor = {
  id?: string;
  displayVendorId: string;
  displayId: string;
  quantity: number;
  price: number;
  totalPrice: number;
  keyId?: string | number; // for React key
};

interface DisplayVendorSectionProps {
  subEventForm: RateData['subEvents'][0];
  setValue: any;
  formValues: RateData;
}

const DisplayVendorSection: React.FC<DisplayVendorSectionProps> = ({
  subEventForm,
  setValue,
  formValues,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<any>({
    displayVendorId: '',
    displayId: '',
    quantity: 1,
    price: 0,
  });

  const displayVendors: DisplayVendor[] = subEventForm?.displayVendors ?? [];
  const EventId = Route.useParams().id;
  const {user} = useAuthContext();
  const {data: displayVendorsData} = useGetAllDisplayVendor();
  const {data: displayData} = useGetAllDisplayVendorData(EventId as string);
  const {data: subData} = useGetShareDataBySubeventId(subEventForm?.id);

  const subEventName = subEventForm?.name || 'Unknown SubEvent';

  // Track whether we've already synced this subevent to prevent overwriting user changes
  const syncedRef = useRef<Record<string, boolean>>({});

  /* ------------------ Sync API Data (Only Once on Initial Load) ------------------ */
  const syncDataToForm = useCallback(() => {
    if (!displayData || !formValues?.subEvents?.length || !subEventForm?.id)
      return;

    const subIdx = formValues.subEvents.findIndex(
      (s) => s.id === subEventForm.id,
    );
    if (subIdx === -1) return;

    // If we've already synced this subevent, don't touch it again
    if (syncedRef.current[subEventForm.id]) {
      return;
    }

    const apiSub = displayData.subEvents?.find(
      (se: any) => se.id === subEventForm.id,
    );

    const currentLocal = formValues.subEvents[subIdx].displayVendors || [];

    // Only sync if local list is empty AND API has data (initial population)
    if (apiSub?.subEventDisplay?.length > 0 && currentLocal.length === 0) {
      setValue(
        `subEvents.${subIdx}.displayVendors`,
        apiSub.subEventDisplay.map((d: any) => ({
          keyId: d.id || Date.now() + Math.random(),
          displayVendorId: d.displayVendorId,
          displayId: d.displayId,
          quantity: d.quantity,
          price: d.price,
          totalPrice: d.quantity * d.price,
        })),
      );

      // Mark as synced — prevents re-sync after user deletes items
      syncedRef.current[subEventForm.id] = true;
    }
  }, [displayData, formValues, subEventForm?.id, setValue]);

  useEffect(() => {
    syncDataToForm();
  }, [syncDataToForm]);

  /* ------------------ Helpers ------------------ */
  const subIdx = formValues.subEvents.findIndex(
    (s) => s.id === subEventForm?.id,
  );

  const getVendorById = (id: string) =>
    displayVendorsData?.find((v: any) => v.id === id);

  const getDisplayById = (vendorId: string, displayId: string) => {
    const vendor = getVendorById(vendorId);
    return vendor?.displays?.find((d: any) => d.id === displayId);
  };

  const getVendorName = (id: string) =>
    getVendorById(id)?.name || 'Unknown Vendor';

  const getVendorPhone = (id: string) => getVendorById(id)?.phone || '';

  const getDisplayName = (vendorId: string, displayId: string) =>
    getDisplayById(vendorId, displayId)?.name || 'Unknown Display';

  /* ------------------ Edit / Add Logic ------------------ */
  const startEdit = (row: DisplayVendor, index: number) => {
    setEditingIndex(index);
    setEditForm({
      displayVendorId: row.displayVendorId,
      displayId: row.displayId,
      quantity: row.quantity,
      price: row.price,
    });
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditForm({displayVendorId: '', displayId: '', quantity: 1, price: 0});
  };

  const cancelAdd = () => {
    setIsAdding(false);
    setEditForm({displayVendorId: '', displayId: '', quantity: 1, price: 0});
  };

  const saveEdit = () => {
    if (editingIndex === null) return;

    const qty = Number(editForm.quantity);
    const price = Number(editForm.price);

    if (
      !editForm.displayVendorId ||
      !editForm.displayId ||
      qty <= 0 ||
      price <= 0
    ) {
      alert('Please fill all required fields with valid values.');
      return;
    }

    const totalPrice = qty * price;

    const updatedAssignment = {
      ...displayVendors[editingIndex],
      displayVendorId: editForm.displayVendorId,
      displayId: editForm.displayId,
      quantity: qty,
      price,
      totalPrice,
    };

    const updated = displayVendors.map((v, i) =>
      i === editingIndex ? updatedAssignment : v,
    );

    if (subIdx !== -1) {
      setValue(`subEvents.${subIdx}.displayVendors`, updated);
    }

    cancelEdit();
  };

  const saveNew = () => {
    const qty = Number(editForm.quantity);
    const price = Number(editForm.price);

    if (
      !editForm.displayVendorId ||
      !editForm.displayId ||
      qty <= 0 ||
      price <= 0
    ) {
      alert('Please select vendor, display, and enter valid quantity & price.');
      return;
    }

    const totalPrice = qty * price;

    const newAssignment: DisplayVendor = {
      keyId: Date.now() + Math.random(),
      displayVendorId: editForm.displayVendorId,
      displayId: editForm.displayId,
      quantity: qty,
      price,
      totalPrice,
    };

    const updated = [...displayVendors, newAssignment];

    if (subIdx !== -1) {
      setValue(`subEvents.${subIdx}.displayVendors`, updated);
    }

    setIsAdding(false);
    setEditForm({displayVendorId: '', displayId: '', quantity: 1, price: 0});
  };

  const handleRemove = (index: number) => {
    confirmAlert({
      title: 'Remove vendor',
      message: 'Are you sure you want to remove this vendor assignment?',
      buttons: [
        {
          label: 'Yes',
          onClick: () => {
            const updated = displayVendors.filter((_, i) => i !== index);
            if (subIdx !== -1) {
              setValue(`subEvents.${subIdx}.displayVendors`, updated);
            }
          },
        },
        {
          label: 'Cancel',
          onClick: () => {},
        },
      ],
    });
  };
  const handlePrint = () => {
    // 1. Prepare Data
    const printData = displayVendors.map((row) => ({
      vendorName: getVendorName(row.displayVendorId),
      displayName: getDisplayName(row.displayVendorId, row.displayId),
      quantity: row.quantity,
      price: row.price,
      total: row.quantity * row.price,
    }));

    const totalCost = printData.reduce((acc, curr) => acc + curr.total, 0);

    // 2. Metadata
    const eventName = subData?.event?.name || 'N/A';
    const subEventName = subEventForm?.name || '';
    const dateDisplay = subData?.date
      ? new Date(subData.date).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
      : 'N/A';
    const timeDisplay = subData?.time
      ? new Date(subData.time).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        })
      : 'N/A';
    const clientName = subData?.event?.cateror?.user?.fullname || 'N/A';
    const address = subData?.address || 'N/A';
    const peopleCount = subData?.pax || 'N/A';

    // 3. Build HTML
    const htmlContent = `
      <div style="border:1px solid #0D47A1; padding:10px; margin-bottom:12px; background:#E3F2FD; font-family: Arial, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
             <td width="100%" align="center">
               <h1 style="margin:0; font-size:24px; color:#0D47A1; font-weight:800;">${user?.fullname || 'Caterer Name'}</h1>
               <p style="margin:6px 0 0; font-weight:bold; font-size:11px; color:#000;">
                 ${user?.address ? `Address - ${user.address}` : ''} ${user?.email ? ` | Email - ${user.email}` : ''} | Mob.${user?.phoneNumber || ''}
               </p>
             </td>
          </tr>
        </table>
      </div>

      <div style="text-align:center; background:#0D47A1; color:white; padding:10px 6px; margin-bottom:12px; font-weight:bold; font-family: Arial, sans-serif;">
        <div style="font-size:11px; margin-top:4px; opacity:0.95;">
          Event: ${eventName} | Subevent: ${subEventName} | Date: ${dateDisplay} | Time: ${timeDisplay}
        </div>
        <div style="font-size:11px; opacity:0.90; font-weight:normal;">Client: ${clientName} | People: ${peopleCount} | Address: ${address}</div>
      </div>

      <div style="font-family: Arial, sans-serif;">
        <h3 style="margin:15px 0 10px 0; font-size:16px; font-weight:700; color:#000; text-align:left; border-bottom:2px solid #1E3A8A; padding-bottom:5px;">Display Assignments</h3>
        <table style="width:100%; border-collapse: collapse; font-size:12px; border: 1px solid #ccc;">
          <thead>
            <tr style="background-color:#1E3A8A; color: #333;">
              <th style="border: 1px solid #ccc; padding: 6px; text-align: left; color: #fff;">Vendor</th>
              <th style="border: 1px solid #ccc; padding: 6px; text-align: left; color: #fff;">Display</th>
              <th style="border: 1px solid #ccc; padding: 6px; text-align: center; color: #fff;">Quantity</th>
              <th style="border: 1px solid #ccc; padding: 6px; text-align: right; color: #fff;">Price</th>
              <th style="border: 1px solid #ccc; padding: 6px; text-align: right; color: #fff;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${
              printData.length > 0
                ? printData
                    .map(
                      (row) => `
              <tr>
                <td style="border: 1px solid #ccc; padding: 6px;">${row.vendorName}</td>
                <td style="border: 1px solid #ccc; padding: 6px;">${row.displayName}</td>
                <td style="border: 1px solid #ccc; padding: 6px; text-align: center;">${row.quantity}</td>
                <td style="border: 1px solid #ccc; padding: 6px; text-align: right;">₹${row.price}</td>
                <td style="border: 1px solid #ccc; padding: 6px; text-align: right;">₹${row.total.toFixed(2)}</td>
              </tr>`,
                    )
                    .join('')
                : `<tr><td colspan="5" style="padding:10px; text-align:center; font-style:italic;">No display vendors assigned.</td></tr>`
            }
          </tbody>
           <tfoot>
            <tr style="background-color: #e3f2fd; font-weight: bold;">
              <td colspan="4" style="border: 1px solid #ccc; padding: 6px; text-align: right;">Grand Total:</td>
              <td style="border: 1px solid #ccc; padding: 6px; text-align: right;">₹${totalCost.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
      </div>`;

    const fullHtml = `<!doctype html><html><head><meta charset="utf-8"/><title>Display Report</title>
      <style>
        @page { margin: 12mm 8mm; size: A4; }
        html, body { margin:0; padding:0; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; font-family: Arial, sans-serif; }
        body.first-page { padding-top:0 !important; }
        .repeat-title { position: fixed; top: 8px; left: 8px; background: #0D47A1; color: #fff; padding: 6px 10px; font-size: 13px; font-weight: 700; border-radius: 0 0 4px 0; z-index: 9999; }
        body.first-page .repeat-title { display: none !important; }
        .container { padding:12px; }
        table { width:100%; border-collapse: collapse; }
        thead { display: table-header-group; }
        tr { page-break-inside: avoid; }
        @media print { .repeat-title { -webkit-print-color-adjust: exact; } body { margin: 0; } }
      </style></head>
      <body class="first-page">
        <div class="repeat-title">Display Vendor Report</div>
        <div class="container">${htmlContent}</div>
        <script>setTimeout(() => { document.body.classList.remove('first-page'); window.print(); setTimeout(() => window.close(), 600); }, 500);</script>
      </body></html>`;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(fullHtml);
      printWindow.document.close();
    }
  };
  return (
    <div className="rounded-md border border-stroke dark:border-strokedark">
      <div className="flex items-center justify-between border-b border-stroke bg-purple-50 px-4 py-2 dark:border-strokedark">
        <h3 className="font-semibold text-purple-950">Display Vendors</h3>

        <div className="flex gap-3">
          {/* PRINT BUTTON */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-1 rounded text-sm font-bold text-purple-950 underline hover:text-purple-800"
            title="Print PDF"
          >
            <BiPrinter size={18} /> Print PDF
          </button>

          {/* EXISTING ADD BUTTON */}
          <button
            onClick={() => {
              setIsAdding(true);
              setEditForm({
                displayVendorId: '',
                displayId: '',
                quantity: 1,
                price: 0,
              });
            }}
            className="rounded text-sm font-bold text-purple-950 underline"
          >
            Add New
          </button>
        </div>
      </div>

      <div className="overflow-x-auto p-4">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">Vendor</th>
              <th className="p-2 text-left">Display</th>
              <th className="p-2 text-left text-center">Quantity</th>
              <th className="p-2 text-left">Price</th>
              <th className="p-2 text-left">Total</th>
              <th className="p-2 text-left">Actions</th>
              <th className="p-2 text-left">Share</th>
            </tr>
          </thead>
          <tbody>
            {/* Add New Row */}
            {isAdding && (
              <tr className="bg-blue-50 dark:bg-boxdark">
                <td className="p-2">
                  <select
                    value={editForm.displayVendorId || ''}
                    onChange={(e) => {
                      const vendorId = e.target.value;
                      const vendor = getVendorById(vendorId);
                      const display = vendor?.displays?.[0];
                      setEditForm((prev: any) => ({
                        ...prev,
                        displayVendorId: vendorId,
                        displayId: display?.id || '',
                        price: display?.price || 0,
                      }));
                    }}
                    className="w-full rounded border px-2 py-1 dark:bg-black"
                  >
                    <option value="">Select Vendor</option>
                    {displayVendorsData?.map((v: any) => (
                      <option key={v.id} value={v.id}>
                        {v.name}
                      </option>
                    ))}
                  </select>
                </td>

                <td className="p-2">
                  <select
                    value={editForm.displayId || ''}
                    onChange={(e) => {
                      const displayId = e.target.value;
                      const display = getDisplayById(
                        editForm.displayVendorId,
                        displayId,
                      );
                      setEditForm((prev: any) => ({
                        ...prev,
                        displayId,
                        price: display?.price || 0,
                      }));
                    }}
                    className="w-full rounded border px-2 py-1 dark:bg-black"
                  >
                    <option value="">Select Display</option>
                    {getVendorById(editForm.displayVendorId)?.displays?.map(
                      (d: any) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ),
                    )}
                  </select>
                </td>

                <td className="p-2 text-center">
                  <input
                    type="number"
                    min="1"
                    value={editForm.quantity || 1}
                    onChange={(e) =>
                      setEditForm((prev: any) => ({
                        ...prev,
                        quantity: Number(e.target.value) || 1,
                      }))
                    }
                    className="w-20 rounded border px-2 py-1 text-center dark:bg-black"
                  />
                </td>

                <td className="p-2">
                  <input
                    type="number"
                    value={editForm.price || ''}
                    onChange={(e) =>
                      setEditForm((prev: any) => ({
                        ...prev,
                        price: Number(e.target.value) || 0,
                      }))
                    }
                    className="bg-gray-100 w-full rounded border px-2 py-1 dark:bg-black"
                  />
                </td>

                <td className="p-2 font-semibold">
                  ₹
                  {(
                    Number(editForm.quantity || 1) * Number(editForm.price || 0)
                  ).toFixed(2)}
                </td>

                <td className="p-2">
                  <div className="flex gap-2">
                    <IoMdCheckmark
                      onClick={saveNew}
                      className="h-4 w-4 cursor-pointer text-graydark dark:text-gray-2"
                    />
                    <RxCross2
                      onClick={cancelAdd}
                      className="h-4 w-4 cursor-pointer text-graydark dark:text-gray-2"
                    />
                  </div>
                </td>
                <td className="p-2"></td>
              </tr>
            )}

            {/* Existing Rows */}
            {displayVendors.map((row, index) => {
              const isEditing = editingIndex === index;
              const total = row.quantity * row.price;
              const vendorPhone = getVendorPhone(row.displayVendorId);
              const message = encodeURIComponent(
                `Event: ${subData?.event?.name}\nSubEvent: ${subEventName}\nDisplay: ${getDisplayName(
                  row.displayVendorId,
                  row.displayId,
                )}\nQuantity: ${row.quantity}\nTotal: ₹${total}`,
              );

              return (
                <tr
                  key={row.keyId ?? `row-${index}`}
                  className="border-t border-stroke dark:border-strokedark"
                >
                  <td className="p-2">
                    {isEditing ? (
                      <select
                        value={editForm.displayVendorId || ''}
                        onChange={(e) => {
                          const vendorId = e.target.value;
                          const vendor = getVendorById(vendorId);
                          const fallbackDisplay = vendor?.displays?.[0];
                          setEditForm({
                            ...editForm,
                            displayVendorId: vendorId,
                            displayId: fallbackDisplay?.id || '',
                            price: fallbackDisplay?.price || 0,
                          });
                        }}
                        className="w-full rounded border px-2 py-1 dark:bg-black"
                      >
                        <option value="">Select Vendor</option>
                        {displayVendorsData?.map((v: any) => (
                          <option key={v.id} value={v.id}>
                            {v.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      getVendorName(row.displayVendorId)
                    )}
                  </td>

                  <td className="p-2">
                    {isEditing ? (
                      <select
                        value={editForm.displayId || ''}
                        onChange={(e) => {
                          const displayId = e.target.value;
                          const display = getDisplayById(
                            editForm.displayVendorId,
                            displayId,
                          );
                          setEditForm((prev: any) => ({
                            ...prev,
                            displayId,
                            price: display?.price || 0,
                          }));
                        }}
                        className="w-full rounded border px-2 py-1 dark:bg-black"
                      >
                        <option value="">Select Display</option>
                        {getVendorById(editForm.displayVendorId)?.displays?.map(
                          (d: any) => (
                            <option key={d.id} value={d.id}>
                              {d.name}
                            </option>
                          ),
                        )}
                      </select>
                    ) : (
                      getDisplayName(row.displayVendorId, row.displayId)
                    )}
                  </td>

                  <td className="p-2 text-center">
                    {isEditing ? (
                      <input
                        type="number"
                        min="1"
                        value={editForm.quantity || 1}
                        onChange={(e) =>
                          setEditForm((prev: any) => ({
                            ...prev,
                            quantity: Number(e.target.value) || 1,
                          }))
                        }
                        className="w-20 rounded border px-2 py-1 text-center dark:bg-black"
                      />
                    ) : (
                      row.quantity
                    )}
                  </td>

                  <td className="p-2">
                    {isEditing ? (
                      <input
                        type="number"
                        value={editForm.price || ''}
                        onChange={(e) =>
                          setEditForm((prev: any) => ({
                            ...prev,
                            price: Number(e.target.value) || 0,
                          }))
                        }
                        className="bg-gray-100 w-full rounded border px-2 py-1 dark:bg-black"
                      />
                    ) : (
                      `₹${row.price.toFixed(2)}`
                    )}
                  </td>

                  <td className="p-2 font-semibold">₹{total.toFixed(2)}</td>

                  <td className="p-2">
                    {isEditing ? (
                      <div className="flex gap-2">
                        <IoMdCheckmark
                          onClick={saveEdit}
                          className="h-4 w-4 cursor-pointer text-graydark dark:text-gray-2"
                        />
                        <RxCross2
                          onClick={cancelEdit}
                          className="h-4 w-4 cursor-pointer text-graydark dark:text-gray-2"
                        />
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <FiEdit
                          onClick={() => startEdit(row, index)}
                          className="h-4 w-4 cursor-pointer text-graydark dark:text-gray-2"
                        />
                        <MdDelete
                          onClick={() => handleRemove(index)}
                          className="h-4 w-4 cursor-pointer text-graydark dark:text-gray-2"
                        />
                      </div>
                    )}
                  </td>

                  <td className="p-2">
                    {vendorPhone ? (
                      <a
                        href={`https://wa.me/${vendorPhone}?text=${message}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <RiWhatsappFill className="text-2xl text-green-600 hover:text-green-700" />
                      </a>
                    ) : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {displayVendors.length === 0 && !isAdding && (
          <div className="text-gray-500 py-8 text-center">
            No display vendors assigned yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default DisplayVendorSection;
