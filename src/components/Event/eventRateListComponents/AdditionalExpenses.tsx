/* eslint-disable */
import {FiEdit} from 'react-icons/fi';
import {IoMdCheckmark} from 'react-icons/io';
import {MdDelete} from 'react-icons/md';
import {RiWhatsappFill} from 'react-icons/ri';
import {RxCross2} from 'react-icons/rx';
import {RateData} from './types';
import {useAuthContext} from '@/context/AuthContext';
import React, {useEffect, useMemo, useState} from 'react';
import {useGetShareDataBySubeventId} from '@/lib/react-query/queriesAndMutations/cateror/event';
import {useGetAdditionalVendors} from '@/lib/react-query/queriesAndMutations/cateror/additionalVendor';
import {confirmAlert} from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import {BiPrinter} from 'react-icons/bi';
interface AdditionalExpensesProps {
  subEventForm: RateData['subEvents'][0];
  setValue: any;
  formValues: RateData;
}

const AdditionalExpenses: React.FC<AdditionalExpensesProps> = ({
  subEventForm,
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
    categoryId: '',
    additionalVendorId: '',
    particular: '',
    quantity: 1,
    price: 0,
  });

  const {data: vendorData = []} = useGetAdditionalVendors();
  const {data: subData} = useGetShareDataBySubeventId(subEventForm?.id);

  const expenses = subEventForm?.subeventExtraCosts ?? [];

  // Find subevent index in formValues for setValue
  const subIdx = formValues.subEvents.findIndex(
    (s) => s.id === subEventForm.id,
  );

  /* ------------------ Category Options ------------------ */
  const categoryOptions = useMemo(() => {
    if (!Array.isArray(vendorData) || vendorData.length === 0) return [];

    const allCats = vendorData.flatMap((v: any) =>
      (v?.additionalVendorCatrgories || []).map(
        (c: any) => c?.additionalVendorCategory,
      ),
    );

    const unique = Array.from(
      new Map(allCats.filter(Boolean).map((c: any) => [c.id, c])).values(),
    );

    return unique.map((cat: any) => ({
      value: cat.id,
      label: cat.name,
    }));
  }, [vendorData]);

  /* ------------------ Vendor Options (filtered by category) ------------------ */
  const getVendorOptions = (categoryId: string) => {
    if (!categoryId) return [];

    const filtered = vendorData.filter((v: any) =>
      (v?.additionalVendorCatrgories || []).some(
        (c: any) => c?.additionalVendorCategory?.id === categoryId,
      ),
    );

    return filtered.map((v: any) => ({
      value: v.id,
      label: v.name,
    }));
  };

  const currentVendorOptions = useMemo(
    () => getVendorOptions(editForm.categoryId),
    [editForm.categoryId, vendorData],
  );

  /* ------------------ Helper Functions ------------------ */
  const getCategoryName = (id: string) =>
    categoryOptions.find((c) => c.value === id)?.label || 'Unknown Category';

  const getVendorName = (id: string) => {
    const vendor = vendorData.find((v: any) => v.id === id);
    return vendor?.name || 'Unknown Vendor';
  };

  const getVendorPhone = (id: string) => {
    const vendor = vendorData.find((v: any) => v.id === id);
    return vendor?.phone || '';
  };

  /* ------------------ Edit / Add Logic ------------------ */
  const startEdit = (expense: any, index: number) => {
    setEditingIndex(index);
    setEditForm({
      categoryId: expense.categoryId || '',
      additionalVendorId: expense.additionalVendorId || '',
      particular: expense.particular || '',
      quantity: expense.quantity || 1,
      price: expense.price || 0,
    });
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditForm({
      categoryId: '',
      additionalVendorId: '',
      particular: '',
      quantity: 1,
      price: 0,
    });
  };

  const cancelAdd = () => {
    setIsAdding(false);
    setEditForm({
      categoryId: '',
      additionalVendorId: '',
      particular: '',
      quantity: 1,
      price: 0,
    });
  };

  // In saveNew()
  const saveNew = () => {
    const {categoryId, additionalVendorId, particular, quantity, price} =
      editForm;

    if (
      !categoryId ||
      !additionalVendorId ||
      !particular.trim() ||
      quantity <= 0 ||
      price < 0
    ) {
      alert('Please fill all required fields with valid values.');
      return;
    }

    const qty = Number(quantity);
    const prc = Number(price);
    const total = qty * prc;

    const newExpense = {
      categoryId,
      additionalVendorId,
      particular: particular.trim(),
      quantity: qty,
      price: prc,
      total, // ← THIS IS REQUIRED BY BACKEND/VALIDATION
    };

    const updated = [...expenses, newExpense];

    if (subIdx !== -1) {
      setValue(`subEvents.${subIdx}.subeventExtraCosts`, updated);
    }

    setIsAdding(false);
    setEditForm({
      categoryId: '',
      additionalVendorId: '',
      particular: '',
      quantity: 1,
      price: 0,
    });
  };

  // In saveEdit()
  const saveEdit = () => {
    if (editingIndex === null) return;

    const {categoryId, additionalVendorId, particular, quantity, price} =
      editForm;

    if (
      !categoryId ||
      !additionalVendorId ||
      !particular.trim() ||
      quantity <= 0 ||
      price < 0
    ) {
      alert('Please fill all required fields with valid values.');
      return;
    }

    const qty = Number(quantity);
    const prc = Number(price);
    const total = qty * prc;

    const updated = expenses.map((exp, i) =>
      i === editingIndex
        ? {
            ...exp,
            categoryId,
            additionalVendorId,
            particular: particular.trim(),
            quantity: qty,
            price: prc,
            total, // ← Update total on edit too
          }
        : exp,
    );

    if (subIdx !== -1) {
      setValue(`subEvents.${subIdx}.subeventExtraCosts`, updated);
    }

    cancelEdit();
  };

  const handleRemove = (index: number) => {
    confirmAlert({
      title: 'Confirm removal',
      message: 'Are you sure you want to remove this expense?',
      buttons: [
        {
          label: 'Yes',
          onClick: () => {
            const updated = expenses.filter((_, i) => i !== index);
            if (subIdx !== -1) {
              setValue(`subEvents.${subIdx}.subeventExtraCosts`, updated);
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
  /* ------------------ PDF Print Logic ------------------ */
  const handlePrint = () => {
    // 1. Prepare Data
    const printData = expenses.map((expense) => ({
      category: getCategoryName(expense.categoryId),
      vendor: getVendorName(expense.additionalVendorId),
      particular: expense.particular || '-',
      quantity: expense.quantity || 0,
      price: expense.price || 0,
      total: (expense.quantity || 0) * (expense.price || 0),
    }));

    const grandTotal = printData.reduce((acc, curr) => acc + curr.total, 0);

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
        <h2 style="margin:0; font-size:16px;">Additional Expenses Report</h2>
        <div style="font-size:11px; margin-top:4px; opacity:0.95;">
          Event: ${eventName} | Subevent: ${subEventName} | Date: ${dateDisplay} | Time: ${timeDisplay}
        </div>
        <div style="font-size:11px; opacity:0.90; font-weight:normal;">Client: ${clientName} | People: ${peopleCount} | Address: ${address}</div>
      </div>

      <div style="font-family: Arial, sans-serif;">
        <h3 style="margin:15px 0 10px 0; font-size:16px; font-weight:700; color:#000; text-align:left; border-bottom:2px solid #1E3A8A; padding-bottom:5px;">Expense Items</h3>
        <table style="width:100%; border-collapse: collapse; font-size:12px; border: 1px solid #ccc;">
          <thead>
            <tr style="background-color:#1E3A8A; color: #333;">
              <th style="border: 1px solid #ccc; padding: 6px; text-align: left; color: #fff;">Category</th>
              <th style="border: 1px solid #ccc; padding: 6px; text-align: left; color: #fff;">Vendor</th>
              <th style="border: 1px solid #ccc; padding: 6px; text-align: left; color: #fff;">Particular</th>
              <th style="border: 1px solid #ccc; padding: 6px; text-align: center; color: #fff;">Qty</th>
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
                <td style="border: 1px solid #ccc; padding: 6px;">${row.category}</td>
                <td style="border: 1px solid #ccc; padding: 6px;">${row.vendor}</td>
                <td style="border: 1px solid #ccc; padding: 6px;">${row.particular}</td>
                <td style="border: 1px solid #ccc; padding: 6px; text-align: center;">${row.quantity}</td>
                <td style="border: 1px solid #ccc; padding: 6px; text-align: right;">₹${row.price}</td>
                <td style="border: 1px solid #ccc; padding: 6px; text-align: right;">₹${row.total.toFixed(2)}</td>
              </tr>`,
                    )
                    .join('')
                : `<tr><td colspan="6" style="padding:10px; text-align:center; font-style:italic;">No expenses found.</td></tr>`
            }
          </tbody>
           <tfoot>
            <tr style="background-color: #e3f2fd; font-weight: bold;">
              <td colspan="5" style="border: 1px solid #ccc; padding: 6px; text-align: right;">Grand Total:</td>
              <td style="border: 1px solid #ccc; padding: 6px; text-align: right;">₹${grandTotal.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
      </div>`;

    const fullHtml = `<!doctype html><html><head><meta charset="utf-8"/><title>Expense Report</title>
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
        <div class="container">${htmlContent}</div>
        <script>setTimeout(() => { document.body.classList.remove('first-page'); window.print(); setTimeout(() => window.close(), 600); }, 500);</script>
      </body></html>`;

    const printWindow = window.open('', '_blank', 'width=1000,height=800');
    if (printWindow) {
      printWindow.document.write(fullHtml);
      printWindow.document.close();
    }
  };
  const groupedExpenses = useMemo(() => {
    const map: any = {};

    expenses.forEach((exp) => {
      if (!map[exp.categoryId]) {
        map[exp.categoryId] = {
          categoryId: exp.categoryId,
          categoryName: getCategoryName(exp.categoryId),
          items: [],
        };
      }
      map[exp.categoryId].items.push(exp);
    });

    return Object.values(map);
  }, [expenses, categoryOptions, vendorData]);

  return (
    <div className="rounded-md border border-stroke dark:border-strokedark">
      <div className="flex items-center justify-between border-b border-stroke bg-pink-50 px-4 py-2 dark:border-strokedark">
        <h3 className="font-semibold text-pink-950">Additional Vendors</h3>

        <div className="flex gap-3">
          {/* PRINT BUTTON */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-1 rounded text-sm font-bold text-pink-950 underline hover:text-pink-800"
            title="Print PDF"
          >
            <BiPrinter size={18} /> Print PDF
          </button>

          {canEdit && (
            <button
              onClick={() => {
                setIsAdding(true);
                setEditForm({
                  categoryId: '',
                  additionalVendorId: '',
                  particular: '',
                  quantity: 1,
                  price: 0,
                });
              }}
              className="rounded px-3 py-1 text-sm font-bold text-pink-950 underline"
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
              <th className="p-2 text-left">Category</th>
              <th className="p-2 text-left">Vendor</th>
              <th className="p-2 text-left">Particular</th>
              <th className="p-2 text-center">Quantity</th>
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
                    value={editForm.categoryId}
                    onChange={(e) => {
                      setEditForm({
                        ...editForm,
                        categoryId: e.target.value,
                        additionalVendorId: '', // reset vendor when category changes
                      });
                    }}
                    className="w-full rounded border px-2 py-1 dark:bg-black"
                  >
                    <option value="">Select Category</option>
                    {categoryOptions.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="p-2">
                  <select
                    value={editForm.additionalVendorId}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        additionalVendorId: e.target.value,
                      })
                    }
                    className="w-full rounded border px-2 py-1 dark:bg-black"
                    disabled={!editForm.categoryId}
                  >
                    <option value="">
                      {editForm.categoryId
                        ? 'Select Vendor'
                        : 'First select category'}
                    </option>
                    {getVendorOptions(editForm.categoryId).map((v) => (
                      <option key={v.value} value={v.value}>
                        {v.label}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="p-2">
                  <input
                    type="text"
                    value={editForm.particular}
                    onChange={(e) =>
                      setEditForm({...editForm, particular: e.target.value})
                    }
                    placeholder="Particular"
                    className="w-full rounded border px-2 py-1 dark:bg-black"
                  />
                </td>
                <td className="p-2 text-center">
                  <input
                    type="number"
                    min="1"
                    value={editForm.quantity}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        quantity: Number(e.target.value) || 1,
                      })
                    }
                    className="w-20 rounded border px-2 py-1 text-center dark:bg-black"
                  />
                </td>
                <td className="p-2">
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
                    className="w-full rounded border px-2 py-1 dark:bg-black"
                  />
                </td>
                <td className="p-2 font-semibold">
                  ₹{(editForm.quantity * editForm.price).toFixed(2)}
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
            {groupedExpenses.map((group: any) =>
              group.items.map((extra: any, rowIndex: number) => {
                const index = expenses.findIndex((e) => e === extra);
                const isEditing = editingIndex === index;
                const total = (extra.quantity || 0) * (extra.price || 0);
                const vendorPhone = getVendorPhone(extra.additionalVendorId);

                const messageParts = [
                  `=== Event Details ===`,
                  subData?.event?.name && `Event: ${subData.event.name}`,
                  subData?.name && `SubEvent: ${subData.name}`,
                  subData?.date &&
                    `Date: ${new Date(subData.date).toLocaleDateString(
                      'en-GB',
                      {
                        day: '2-digit',
                        month: '2-digit',
                        year: '2-digit',
                      },
                    )}`,
                  subData?.time &&
                    `Time: ${new Date(subData.time).toLocaleTimeString(
                      'en-US',
                      {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true,
                      },
                    )}`,
                  subData?.address && `Address: ${subData.address}`,

                  `\n=== Caterer Details ===`,
                  subData?.event?.cateror?.user?.fullname &&
                    `Name: ${subData.event.cateror.user.fullname}`,
                  subData?.event?.cateror?.user?.phoneNumber &&
                    `Mobile: ${subData.event.cateror.user.phoneNumber}`,

                  `\n=== Additional Vendor ===`,
                  getCategoryName(extra.categoryId) &&
                    `Category: ${getCategoryName(extra.categoryId)}`,
                  getVendorName(extra.additionalVendorId) &&
                    `Vendor: ${getVendorName(extra.additionalVendorId)}`,
                  extra.particular && `Particular: ${extra.particular}`,
                  extra.quantity && `Quantity: ${extra.quantity}`,
                  extra.price && `Price: ₹${extra.price}`,
                  `Total: ₹${total.toFixed(2)}`,
                ].filter(Boolean);

                const message = encodeURIComponent(messageParts.join('\n'));

                return (
                  <tr
                    key={`${group.categoryId}-${index}`}
                    className="border-t border-stroke dark:border-strokedark"
                  >
                    {/* CATEGORY WITH ROWSPAN */}
                    {rowIndex === 0 && (
                      <td
                        rowSpan={group.items.length}
                        className="p-2 align-top font-semibold"
                      >
                        {getCategoryName(extra.categoryId)}
                      </td>
                    )}

                    <td className="p-2">
                      {isEditing ? (
                        <select
                          value={editForm.additionalVendorId}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              additionalVendorId: e.target.value,
                            })
                          }
                          className="w-full rounded border px-2 py-1 dark:bg-black"
                        >
                          <option value="">Select Vendor</option>
                          {currentVendorOptions.map((v) => (
                            <option key={v.value} value={v.value}>
                              {v.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        getVendorName(extra.additionalVendorId)
                      )}
                    </td>

                    <td className="p-2">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.particular}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              particular: e.target.value,
                            })
                          }
                          className="w-full rounded border px-2 py-1 dark:bg-black"
                        />
                      ) : (
                        extra.particular || '-'
                      )}
                    </td>

                    <td className="p-2 text-center">
                      {isEditing ? (
                        <input
                          type="number"
                          min="1"
                          value={editForm.quantity}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              quantity: Number(e.target.value) || 1,
                            })
                          }
                          className="w-20 rounded border px-2 py-1 text-center dark:bg-black"
                        />
                      ) : (
                        extra.quantity || 0
                      )}
                    </td>

                    <td className="p-2">
                      {isEditing ? (
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
                          className="w-full rounded border px-2 py-1 dark:bg-black"
                        />
                      ) : (
                        `₹${extra.price || 0}`
                      )}
                    </td>

                    <td className="p-2 font-semibold">₹{total.toFixed(2)}</td>

                    <td className="p-2">
                      {isEditing ? (
                        <div className="flex gap-2">
                          <IoMdCheckmark
                            onClick={saveEdit}
                            className="h-4 w-4 cursor-pointer"
                          />
                          <RxCross2
                            onClick={cancelEdit}
                            className="h-4 w-4 cursor-pointer"
                          />
                        </div>
                      ) : (
                        canEdit && (
                          <div className="flex gap-2">
                            <FiEdit
                              onClick={() => startEdit(extra, index)}
                              className="h-4 w-4 cursor-pointer"
                            />
                            <MdDelete
                              onClick={() => handleRemove(index)}
                              className="h-4 w-4 cursor-pointer"
                            />
                          </div>
                        )
                      )}
                    </td>

                    <td className="p-2">
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
                  </tr>
                );
              }),
            )}
          </tbody>
        </table>

        {expenses.length === 0 && !isAdding && (
          <div className="text-gray-500 py-8 text-center">
            No additional expenses added yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default AdditionalExpenses;
