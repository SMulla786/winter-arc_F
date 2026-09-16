/* eslint-disable */
import {BiPlus, BiPrinter} from 'react-icons/bi'; // Added BiPrinter
import {FiEdit} from 'react-icons/fi';
import {IoMdCheckmark} from 'react-icons/io';
import {MdDelete} from 'react-icons/md';
import {RiWhatsappFill} from 'react-icons/ri';
import {RxCross2} from 'react-icons/rx';

import {useAuthContext} from '@/context/AuthContext';
import React, {useMemo, useState} from 'react';
import {useGetShareDataBySubeventId} from '@/lib/react-query/queriesAndMutations/cateror/event';
import {confirmAlert} from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import {RateData} from './types';

interface VendorAssignmentsProps {
  subEventForm: RateData['subEvents'][0];
  vendorData: any[];
  vendorRoleData: any[];
  setValue: any;
  formValues: RateData;
}

const VendorAssignments: React.FC<VendorAssignmentsProps> = ({
  subEventForm,
  vendorData = [],
  vendorRoleData = [],
  setValue,
  formValues,
}) => {
  const {user} = useAuthContext();
  const restriction = user?.employeeRestriction?.eventRateListPage;
  const role = user?.role;
  const canEdit = role === 'CATEROR' || restriction === 'EDIT';

  const [isAdding, setIsAdding] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const [editForm, setEditForm] = useState({
    vendorId: '',
    roleId: '',
    count: 1,
    price: 0,
    transport: 0,
  });

  const {data: subData} = useGetShareDataBySubeventId(subEventForm?.id);

  const assignments = subEventForm?.vendorAssignments ?? [];

  // Find subevent index in formValues
  const subIdx = formValues?.subEvents?.findIndex(
    (s) => s.id === subEventForm.id,
  );

  /* ------------------ Helpers ------------------ */
  const getVendorName = (id: string) =>
    vendorData.find((v) => v.id === id)?.name || 'Unknown Vendor';

  const getRoleName = (id: string) =>
    vendorRoleData.find((r) => r.id === id)?.name || 'Unknown Role';

  const getVendorPhone = (id: string) =>
    vendorData.find((v) => v.id === id)?.phone || '';

  const calculateTotal = (count: number, price: number, transport: number) =>
    (count || 0) * (price || 0) + (transport || 0);

  /* ------------------ PDF Generation Logic ------------------ */
  const handlePrint = () => {
    // 1. Prepare Data for Print
    const printData = assignments.map((assignment) => ({
      vendorName: getVendorName(assignment.vendorId),
      roleName: getRoleName(assignment.roleId),
      transport: assignment.transport || 0,
      count: assignment.count || 0,
      price: assignment.price || 0,
      total: calculateTotal(
        assignment.count,
        assignment.price,
        assignment.transport,
      ),
    }));

    const eventName = subData?.event?.name || 'N/A';
    const subEventName = subData?.name || '';
    console.log('subDataaaaaaa', subData);
    const startDate = subData?.date
      ? new Date(subData.date).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
      : 'N/A';
    const clientName = subData?.event?.cateror?.user?.fullname || 'N/A';
    const time = subData?.time
      ? new Date(subData.time).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        })
      : 'N/A';
    console.log('subData', clientName);
    // Use subData.time or date for end date reference, or just list the event date
    const dateDisplay = startDate;

    // 2. Build HTML Content (Matching the PDF Structure provided)
    const htmlContent = `
      <div style="border:1px solid #0D47A1; padding:10px; margin-bottom:12px; background:#E3F2FD; font-family: Arial, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
             <td width="100%" align="center">
               <h1 style="margin:0; font-size:24px; color:#0D47A1; font-weight:800;">
                 ${user?.fullname || 'Caterer Name'}
               </h1>
               <p style="margin:6px 0 0; font-weight:bold; font-size:11px; color:#000;">
                 ${user?.address ? `Address - ${user.address}` : ''} 
                 ${user?.email ? ` | Email - ${user.email}` : ''} 
                 | Mob.${user?.phoneNumber || ''}
               </p>
             </td>
          </tr>
        </table>
      </div>

      <div style="text-align:center; background:#0D47A1; color:white; padding:10px 6px; margin-bottom:12px; font-weight:bold; font-family: Arial, sans-serif;">
        <h2 style="margin:0; font-size:16px;">Manpower Vendor Report</h2>
        <div style="font-size:11px; margin-top:4px; opacity:0.95;">
          Event: ${eventName} |Subevent: ${subEventName ? `${subEventName}` : ''} | Date: ${dateDisplay}| Time:${time} | Client: ${clientName}
        </div>
      </div>

      <div style="font-family: Arial, sans-serif;">
        <h3 style="margin:15px 0 10px 0; font-size:16px; font-weight:700; color:#000; text-align:left; border-bottom:2px solid #1E3A8A; padding-bottom:5px;">
           Vendor Assignments
        </h3>
        
        <table style="width:100%; border-collapse: collapse; font-size:12px; border: 1px solid #ccc;">
          <thead>
            <tr style="background-color:#1E3A8A; color: #333;">
              <th style="border: 1px solid #ccc; padding: 6px; text-align: left; color: #fff;">Vendor</th>
              <th style="border: 1px solid #ccc; padding: 6px; text-align: left; color: #fff;">Role</th>
              <th style="border: 1px solid #ccc; padding: 6px; text-align: center; color: #fff;">Transport</th>
              <th style="border: 1px solid #ccc; padding: 6px; text-align: center; color: #fff;">Manpower Details</th>
              <th style="border: 1px solid #ccc; padding: 6px; text-align: right; color: #fff;">Total Cost</th>
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
                  <td style="border: 1px solid #ccc; padding: 6px;">${row.roleName}</td>
                  <td style="border: 1px solid #ccc; padding: 6px; text-align: center;">₹${row.transport}</td>
                  <td style="border: 1px solid #ccc; padding: 6px; text-align: center;">
                    ${row.count} × ₹${row.price}
                  </td>
                  <td style="border: 1px solid #ccc; padding: 6px; text-align: right;">
                    ₹${row.total.toFixed(2)}
                  </td>
                </tr>
              `,
                    )
                    .join('')
                : `<tr><td colspan="5" style="padding:10px; text-align:center; font-style:italic;">No assignments found.</td></tr>`
            }
          </tbody>
           <tfoot>
            <tr style="background-color: #e3f2fd; font-weight: bold;">
              <td colspan="4" style="border: 1px solid #ccc; padding: 6px; text-align: right;">Grand Total:</td>
              <td style="border: 1px solid #ccc; padding: 6px; text-align: right;">
                ₹${printData.reduce((acc, curr) => acc + curr.total, 0).toFixed(2)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    `;

    // 3. Construct Full Page with CSS and Script
    const fullHtml = `<!doctype html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>Manpower Vendor Report</title>
        <style>
          @page { margin: 12mm 8mm; size: A4; }
          html, body { margin:0; padding:0; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; font-family: Arial, sans-serif; color: #000; }
          body.first-page { padding-top:0 !important; }
          
          /* repeat-title top-left on pages 2+ */
          .repeat-title {
            position: fixed;
            top: 8px;
            left: 8px;
            background: #0D47A1;
            color: #fff;
            padding: 6px 10px;
            font-size: 13px;
            font-weight: 700;
            border-radius: 0 0 4px 0;
            z-index: 9999;
          }
          body.first-page .repeat-title { display: none !important; }
          
          .container { padding:12px; box-sizing: border-box; }
          
          /* keep table header repeating */
          table { width:100%; border-collapse: collapse; }
          thead { display: table-header-group; }
          tr { page-break-inside: avoid; break-inside: avoid; }
          
          @media print {
            .repeat-title { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            tr { page-break-inside: avoid; page-break-after: auto; }
            td { page-break-inside: avoid; page-break-after: auto; }
            @page { margin: 12mm 8mm; }
            body { margin: 0; }
          }
        </style>
      </head>
      <body class="first-page">
       

        <div class="container">
          ${htmlContent}
        </div>
        <script>
          setTimeout(() => {
            document.body.classList.remove('first-page');
            window.print();
            setTimeout(() => window.close(), 600);
          }, 500);
        </script>
      </body>
      </html>`;

    // 4. Open Window
    const printWindow = window.open('', '_blank', 'width=1000,height=800');
    if (printWindow) {
      printWindow.document.write(fullHtml);
      printWindow.document.close();
    } else {
      alert('Pop-up blocked. Please allow pop-ups for this site.');
    }
  };

  /* ------------------ Edit / Add Logic ------------------ */
  const startEdit = (assignment: any, index: number) => {
    setEditingIndex(index);
    setEditForm({
      vendorId: assignment.vendorId || '',
      roleId: assignment.roleId || '',
      count: assignment.count || 1,
      price: assignment.price || 0,
      transport: assignment.transport || 0,
    });
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditForm({
      vendorId: '',
      roleId: '',
      count: 1,
      price: 0,
      transport: 0,
    });
  };

  const cancelAdd = () => {
    setIsAdding(false);
    setEditForm({
      vendorId: '',
      roleId: '',
      count: 1,
      price: 0,
      transport: 0,
    });
  };

  const saveEdit = () => {
    if (editingIndex === null) return;

    const {vendorId, roleId, count, price, transport} = editForm;

    if (!vendorId || !roleId || count <= 0 || price < 0 || transport < 0) {
      alert('Please fill all required fields with valid values.');
      return;
    }

    const updated = assignments.map((item, i) =>
      i === editingIndex
        ? {
            ...item,
            vendorId,
            roleId,
            count: Number(count),
            price: Number(price),
            transport: Number(transport),
          }
        : item,
    );

    if (subIdx !== -1) {
      setValue(`subEvents.${subIdx}.vendorAssignments`, updated);
    }

    cancelEdit();
  };

  const saveNew = () => {
    const {vendorId, roleId, count, price, transport} = editForm;

    if (!vendorId || !roleId || count <= 0 || price < 0 || transport < 0) {
      alert(
        'Please select vendor/role and enter valid count, price, and transport.',
      );
      return;
    }

    const newAssignment = {
      vendorId,
      roleId,
      count: Number(count),
      price: Number(price),
      transport: Number(transport),
    };

    const updated = [...assignments, newAssignment];

    if (subIdx !== -1) {
      setValue(`subEvents.${subIdx}.vendorAssignments`, updated);
    }

    setIsAdding(false);
    setEditForm({
      vendorId: '',
      roleId: '',
      count: 1,
      price: 0,
      transport: 0,
    });
  };

  const handleRemove = (index: number) => {
    confirmAlert({
      title: 'Confirm removal',
      message: 'Are you sure you want to remove this assignment?',
      buttons: [
        {
          label: 'Yes',
          onClick: () => {
            const updated = assignments.filter((_, i) => i !== index);

            if (subIdx !== -1) {
              setValue(`subEvents.${subIdx}.vendorAssignments`, updated);
            }
          },
        },
        {
          label: 'No',
          onClick: () => {}, // do nothing
        },
      ],
    });
  };

  const getRolePrice = (roleId: string) =>
    vendorRoleData.find((r) => r.id === roleId)?.price ?? 0;
  const groupedAssignments = useMemo(() => {
    const map: Record<string, any[]> = {};

    assignments.forEach((a) => {
      if (!map[a.vendorId]) {
        map[a.vendorId] = [];
      }
      map[a.vendorId].push(a);
    });

    return map;
  }, [assignments]);

  return (
    <div className="rounded-md border border-stroke dark:border-strokedark">
      <div className="flex items-center justify-between border-b border-stroke bg-blue-50 px-4 py-2 dark:border-strokedark">
        <h3 className="font-semibold text-blue-900">Manpower Vendor</h3>
        <div className="flex gap-2">
          {/* New Print Button */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-1 rounded px-3 py-1 text-sm font-bold text-blue-900 underline hover:text-blue-700"
            title="Download/Print PDF"
          >
            <BiPrinter size={18} />
            Print PDF
          </button>
          {canEdit && (
            <button
              onClick={() => {
                setIsAdding(true);
                setEditForm({
                  vendorId: '',
                  roleId: '',
                  count: 1,
                  price: 0,
                  transport: 0,
                });
              }}
              className="rounded px-3 py-1 text-sm font-bold text-blue-900 underline"
            >
              Add New
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto p-4">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">Vendor</th>
              <th className="p-2 text-left">Role</th>
              <th className="p-2 text-center">Transport</th>
              <th className="p-2 text-center">Manpower × Price</th>
              <th className="p-2 text-center">Total</th>
              <th className="p-2 text-center">Actions</th>
              <th className="p-2 text-left">Share</th>
            </tr>
          </thead>
          <tbody>
            {/* Add New Row */}
            {isAdding && (
              <tr className="bg-blue-50 dark:bg-boxdark">
                <td className="p-2">
                  <select
                    value={editForm.vendorId}
                    onChange={(e) =>
                      setEditForm({...editForm, vendorId: e.target.value})
                    }
                    className="w-full rounded border px-2 py-1 dark:bg-black"
                  >
                    <option value="">Select Vendor</option>
                    {vendorData.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="p-2">
                  <select
                    value={editForm.roleId}
                    onChange={(e) => {
                      const roleId = e.target.value;
                      setEditForm((prev) => ({
                        ...prev,
                        roleId,
                        price: getRolePrice(roleId), // 👈 auto set price
                      }));
                    }}
                    className="w-full rounded border px-2 py-1 dark:bg-black"
                  >
                    <option value="">Select Role</option>
                    {vendorRoleData.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="p-2 text-center">
                  <input
                    type="number"
                    min="0"
                    value={editForm.transport}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        transport: Number(e.target.value) || 0,
                      })
                    }
                    className="w-20 rounded border px-2 py-1 text-center dark:bg-black"
                  />
                </td>
                <td className="p-2 text-center">
                  <input
                    type="number"
                    min="1"
                    value={editForm.count}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        count: Number(e.target.value) || 1,
                      })
                    }
                    className="mx-1 inline-block w-12 rounded border px-2 py-1 text-center dark:bg-black"
                  />
                  ×
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={editForm.price}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        price: Number(e.target.value) || 0,
                      })
                    }
                    className="mx-1 inline-block w-20 rounded border px-2 py-1 text-center dark:bg-black"
                  />
                </td>
                <td className="p-2 text-center font-semibold">
                  ₹
                  {calculateTotal(
                    editForm.count,
                    editForm.price,
                    editForm.transport,
                  ).toFixed(2)}
                </td>
                <td className="p-2 text-center">
                  <div className="flex justify-center gap-2">
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
            {Object.entries(groupedAssignments).map(
              ([vendorId, vendorAssignments]) =>
                vendorAssignments.map((assignment, roleIndex) => {
                  const globalIndex = assignments.findIndex(
                    (a) =>
                      a.vendorId === assignment.vendorId &&
                      a.roleId === assignment.roleId &&
                      a.count === assignment.count &&
                      a.price === assignment.price,
                  );

                  const isEditing = editingIndex === globalIndex;

                  const total = calculateTotal(
                    assignment.count || 0,
                    assignment.price || 0,
                    assignment.transport || 0,
                  );

                  const vendorPhone = getVendorPhone(assignment.vendorId);

                  const messageParts = [
                    `=== Event Details ===`,
                    subData?.event?.name && `Event: ${subData.event.name}`,
                    subData?.name && `SubEvent: ${subData.name}`,
                    subData?.date &&
                      `Date: ${new Date(subData.date).toLocaleDateString('en-GB')}`,
                    subData?.time &&
                      `Time: ${new Date(subData.time).toLocaleTimeString('en-US')}`,

                    `\n=== Manpower Vendor ===`,
                    `Vendor: ${getVendorName(assignment.vendorId)}`,
                    `Role: ${getRoleName(assignment.roleId)}`,
                    `Transport: ₹${assignment.transport}`,
                    `Manpower: ${assignment.count} × ₹${assignment.price}`,
                    `Total: ₹${total.toFixed(2)}`,
                  ].filter(Boolean);

                  const message = encodeURIComponent(messageParts.join('\n'));

                  return (
                    <tr
                      key={`${vendorId}-${roleIndex}`}
                      className="border-t border-stroke dark:border-strokedark"
                    >
                      {/* VENDOR COLUMN (ONLY ONCE) */}
                      {roleIndex === 0 && (
                        <td
                          rowSpan={vendorAssignments.length}
                          className="p-2 align-top font-semibold"
                        >
                          {getVendorName(vendorId)}
                        </td>
                      )}

                      {/* ROLE */}
                      <td className="p-2">
                        {isEditing ? (
                          <select
                            value={editForm.roleId}
                            onChange={(e) => {
                              const roleId = e.target.value;
                              setEditForm((prev) => ({
                                ...prev,
                                roleId,
                                price: getRolePrice(roleId),
                              }));
                            }}
                            className="w-full rounded border px-2 py-1 dark:bg-black"
                          >
                            <option value="">Select Role</option>
                            {vendorRoleData.map((r) => (
                              <option key={r.id} value={r.id}>
                                {r.name}
                              </option>
                            ))}
                          </select>
                        ) : (
                          getRoleName(assignment.roleId)
                        )}
                      </td>

                      {/* TRANSPORT */}
                      <td className="p-2 text-center">
                        ₹{assignment.transport || 0}
                      </td>

                      {/* MANPOWER */}
                      <td className="p-2 text-center">
                        {assignment.count} × ₹{assignment.price}
                      </td>

                      {/* TOTAL */}
                      <td className="p-2 text-center font-semibold">
                        ₹{total.toFixed(2)}
                      </td>

                      {/* ACTIONS */}
                      <td className="p-2 text-center">
                        {canEdit && (
                          <div className="flex justify-center gap-2">
                            <FiEdit
                              onClick={() => startEdit(assignment, globalIndex)}
                              className="h-4 w-4 cursor-pointer"
                            />
                            <MdDelete
                              onClick={() => handleRemove(globalIndex)}
                              className="h-4 w-4 cursor-pointer"
                            />
                          </div>
                        )}
                      </td>

                      {/* SHARE */}
                      {/* SHARE – ONLY ONCE PER VENDOR */}
                      {roleIndex === 0 && (
                        <td
                          rowSpan={vendorAssignments.length}
                          className="p-2 text-center align-top"
                        >
                          {vendorPhone && (
                            <a
                              href={`https://wa.me/${vendorPhone}?text=${message}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <RiWhatsappFill className="text-xl text-green-600" />
                            </a>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                }),
            )}
          </tbody>
        </table>

        {assignments.length === 0 && !isAdding && (
          <div className="text-gray-500 py-8 text-center">
            No manpower vendors assigned yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorAssignments;
