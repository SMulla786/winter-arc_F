/* eslint-disable */
import {RiWhatsappFill} from 'react-icons/ri';
import React, {useState, useMemo, useEffect, useCallback} from 'react';
import {RateData} from './types';
import {useGetShareDataBySubeventId} from '@/lib/react-query/queriesAndMutations/cateror/event';
import {FiEdit} from 'react-icons/fi';
import {MdDelete} from 'react-icons/md';
import {IoMdCheckmark} from 'react-icons/io';
import {RxCross2} from 'react-icons/rx';
import {confirmAlert} from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import {BiPrinter} from 'react-icons/bi';
import {useAuthContext} from '@/context/AuthContext';
import {useGetClubVendorPackage} from '@/lib/react-query/queriesAndMutations/cateror/rawmaterialprice';

// ========== REUSABLE WHATSAPP SHARE BUTTON (ALL VENDOR DATA) ==========
const VendorWhatsAppShareButton: React.FC<{
  vendorId: string;
  vendorName: string;
  vendorPhone: string;
  subData: any;
  subEventName: string;
  assignments: any[];
  isVendorTable: boolean;
  getDishName: (id: string) => string;
}> = ({
  vendorId,
  vendorName,
  vendorPhone,
  subData,
  subEventName,
  assignments,
  isVendorTable,
  getDishName,
}) => {
  if (!vendorPhone) return null;

  const handleShareAllVendorData = () => {
    // Filter assignments for this specific vendor
    const vendorAssignments = assignments.filter(
      (a) => a.foodVendorId === vendorId,
    );

    if (vendorAssignments.length === 0) return;

    // Calculate totals and prepare message
    let message = `Event: ${subData?.event?.name || 'N/A'}\n`;
    message += `SubEvent: ${subEventName}\n`;
    message += `Vendor: ${vendorName}\n\n`;
    message += `${isVendorTable ? 'Food Vendor Assignments:' : 'Labour Assignments:'}\n`;
    message += '────────────────────\n';

    let totalAll = 0;

    vendorAssignments.forEach((assignment, index) => {
      const dishName = getDishName(assignment.dishId);

      if (isVendorTable) {
        // For Vendor Table
        const orderQty = assignment.expected || 0;
        const price = assignment.singlePrice || 0;
        const prepQty = assignment.preparation || 0;
        const transport = assignment.transport || 0;
        const total = price * orderQty + transport;
        totalAll += total;

        message += `${index + 1}. ${dishName}\n`;
        message += `   Order Qty: ${orderQty}\n`;
        message += `   Price: ₹${price}\n`;
        message += `   Prep Qty: ${prepQty}\n`;
        message += `   Transport: ₹${transport}\n`;
        message += `   Total: ₹${total}\n\n`;
      } else {
        // For Labour Table
        const salary = assignment.singlePrice || 0;
        const count = assignment.count || 0;
        const transport = assignment.transport || 0;
        const total = salary * count + transport;
        totalAll += total;

        message += `${index + 1}. ${dishName}\n`;
        message += `   Salary: ₹${salary}\n`;
        message += `   Count: ${count}\n`;
        message += `   Transport: ₹${transport}\n`;
        message += `   Total: ₹${total}\n\n`;
      }
    });

    message += '────────────────────\n';
    message += `Grand Total: ₹${totalAll}\n\n`;
    message += `Thank you!`;

    const encodedMessage = encodeURIComponent(message);
    window.open(
      `https://wa.me/${vendorPhone}?text=${encodedMessage}`,
      '_blank',
    );
  };

  return (
    <button
      onClick={handleShareAllVendorData}
      title={`Share all ${vendorName}'s assignments via WhatsApp`}
      className="inline-flex items-center justify-center rounded p-1 transition-colors hover:bg-green-50"
    >
      <RiWhatsappFill className="text-xl text-green-600 hover:text-green-700" />
    </button>
  );
};
interface FoodVendorAssignment {
  id?: string;
  keyId?: string | number;
  foodVendorId: string;
  dishId: string;
  singlePrice: number;
  expected?: number;
  preparation?: number;
  transport?: number;
  count?: number;
  price: number;
  includeRawMaterial: boolean;
  isClubVendor?: boolean;
  unit: string;
}

// ========== FOOD VENDOR TABLE ==========
const FoodVendorTable: React.FC<
  Omit<FoodVendorAssignmentsProps, 'isLabour' | 'title' | 'color'> & {
    FoodVendorAssignmentsProps;
    onPrint: () => void;
    subData: any;
  }
> = ({
  subEventForm,
  foodVendorData,
  getDishesForSubevent,
  foodVendorAssignments = [],
  handleAddFoodVendor,
  handleUpdateFoodVendor,
  handleRemoveFoodVendor,
  onPrint,
  subData,
}) => {
  const subEventId = subEventForm?.id;
  const subEventName = subEventForm?.name || 'Unknown SubEvent';

  const allDishes = getDishesForSubevent(subEventForm?.id) || [];
  const allVendors = foodVendorData?.data || [];

  const getVendorById = (id: string) =>
    allVendors.find((v: any) => v.id === id);
  const getVendorName = (id: string) =>
    allVendors.find((v: any) => v.id === id)?.name || 'Unknown';
  const getVendorPhone = (id: string) =>
    allVendors.find((v: any) => v.id === id)?.phone || '';
  const getDishName = (id: string) =>
    allDishes.find((d: any) => d.caterorDishId === id)?.dishName || 'Unknown';

  const [isAdding, setIsAdding] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<any>({});

  // UPDATED FILTER LOGIC: Show only non-club vendors with includeRawMaterial = true
  const assignments = useMemo(() => {
    const allVendorsList = foodVendorData?.data || [];

    return foodVendorAssignments
      .map((a, i) => ({...a, originalIndex: i}))
      .filter((a) => {
        // Check if vendor is a club vendor
        const vendor = allVendorsList.find((v: any) => v.id === a.foodVendorId);
        const isClubVendor =
          a.isClubVendor === true || vendor?.isClubVendor === true;

        // Show only: includeRawMaterial = true AND isClubVendor = false
        return a.includeRawMaterial === true && !isClubVendor;
      })
      .sort((a, b) => (a.foodVendorId > b.foodVendorId ? 1 : -1));
  }, [foodVendorAssignments, foodVendorData]);

  // Group assignments by vendor for share button placement
  const vendorGroups = useMemo(() => {
    const groups: {[vendorId: string]: any[]} = {};
    assignments.forEach((row) => {
      if (!groups[row.foodVendorId]) {
        groups[row.foodVendorId] = [];
      }
      groups[row.foodVendorId].push(row);
    });
    return groups;
  }, [assignments]);

  const allUsedDishIds = useMemo(
    () => foodVendorAssignments.map((a) => a.dishId),
    [foodVendorAssignments],
  );

  // UPDATED: Only show vendors who are NOT club vendors AND have rawMaterialCalculation = true
  const vendorsOfType = useMemo(
    () =>
      allVendors.filter(
        (v: any) =>
          v.rawMaterialCalculation === true && v.isClubVendor !== true, // Exclude club vendors
      ),
    [allVendors],
  );

  const startEdit = (row: any) => {
    setEditingIndex(row.originalIndex);
    setEditForm({...row});
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditForm({});
  };

  const cancelAdd = () => {
    setIsAdding(false);
    setEditForm({});
  };

  const saveNew = () => {
    const total =
      (editForm.singlePrice || 0) * (editForm.expected || 0) +
      (editForm.transport || 0);

    const newAssignment = {
      keyId: Date.now() + Math.random(),
      foodVendorId: editForm.foodVendorId,
      dishId: editForm.dishId,
      singlePrice: Number(editForm.singlePrice || 0),
      expected: Number(editForm.expected || 0),
      preparation: Number(editForm.preparation || 0),
      transport: Number(editForm.transport || 0),
      unit: 'KILOGRAM',
      price: Math.max(total, 1),
      isClubVendor: false, // Change from true to false
      includeRawMaterial: true,
    };

    handleAddFoodVendor(subEventId, false, newAssignment);
    setIsAdding(false);
    setEditForm({});
  };

  const saveEdit = () => {
    if (editingIndex === null) return;

    const total =
      (editForm.singlePrice || 0) * (editForm.expected || 0) +
      (editForm.transport || 0);

    const updatedAssignment = {
      ...editForm,
      price: Math.max(total, 1),
      isClubVendor: false, // Add this line
      includeRawMaterial: true,
      expected: Math.max(editForm.expected || 0, 1),
      preparation: editForm.preparation || 0,
    };

    handleUpdateFoodVendor(subEventId, editingIndex, updatedAssignment);
    cancelEdit();
  };

  const smartRemove = (originalIndexToRemove: number) => {
    handleRemoveFoodVendor(subEventId, originalIndexToRemove);
  };

  return (
    <div className="rounded-md border border-stroke dark:border-strokedark">
      <div className="flex items-center justify-between border-b border-stroke bg-green-50 px-4 py-2 dark:border-strokedark">
        <h3 className="font-semibold text-green-950">Food Vendor</h3>
        <div className="flex gap-3">
          <button
            onClick={onPrint}
            className="flex items-center gap-1 rounded text-sm font-bold text-green-950 underline hover:text-green-800"
            title="Print Vendor Report"
          >
            <BiPrinter size={18} /> Print PDF
          </button>
          <button
            onClick={() => {
              setIsAdding(true);
              setEditForm({
                singlePrice: 0,
                expected: 0,
                preparation: 0,
                transport: 0,
              });
            }}
            className="rounded px-3 py-1 text-sm font-bold text-green-950 underline"
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
              <th className="p-2 text-left">Dish</th>
              <th className="p-2 text-left">Order Qty</th>
              <th className="p-2 text-left">Price</th>
              <th className="p-2 text-left">Preparation Qty</th>
              <th className="p-2 text-left">Transport</th>
              <th className="p-2 text-left">Total</th>
              <th className="p-2 text-left">Actions</th>
              <th className="p-2 text-left">Share All</th>
            </tr>
          </thead>
          <tbody>
            {/* Add New Row */}
            {isAdding && (
              <tr className="bg-blue-50 dark:bg-boxdark">
                {/* vendor */}
                <td className="p-2">
                  <select
                    value={editForm.foodVendorId || ''}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        foodVendorId: e.target.value,
                        dishId: '',
                      })
                    }
                    className="w-full rounded border px-2 py-1 dark:bg-black"
                  >
                    <option value="">Select Vendor</option>
                    {vendorsOfType.map((v: any) => (
                      <option key={v.id} value={v.id}>
                        {v.name}
                      </option>
                    ))}
                  </select>
                </td>

                {/* dish */}
                <td className="p-2">
                  <select
                    value={editForm.dishId || ''}
                    onChange={(e) =>
                      setEditForm({...editForm, dishId: e.target.value})
                    }
                    disabled={!editForm.foodVendorId}
                    className="w-full rounded border px-2 py-1 dark:bg-black"
                  >
                    <option value="">Select Dish</option>
                    {editForm.foodVendorId &&
                      getVendorById(
                        editForm.foodVendorId,
                      )?.foodVendorDishes?.map((d: any) => {
                        if (allUsedDishIds.includes(d.dishId)) return null;
                        const dishInSubevent = allDishes.find(
                          (sd) => sd.caterorDishId === d.dishId,
                        );
                        if (!dishInSubevent) return null;
                        return (
                          <option key={d.dishId} value={d.dishId}>
                            {dishInSubevent.dishName}
                          </option>
                        );
                      })}
                  </select>
                </td>

                {/*  order qty */}
                <td className="p-2">
                  <input
                    type="number"
                    value={editForm.expected || ''}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        expected: Number(e.target.value),
                      })
                    }
                    className="w-full rounded border px-2 py-1 dark:bg-black"
                    placeholder="0"
                  />
                </td>

                {/* price */}
                <td className="p-2">
                  <input
                    type="number"
                    value={editForm.singlePrice || ''}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        singlePrice: Number(e.target.value),
                      })
                    }
                    className="w-full rounded border px-2 py-1 dark:bg-black"
                    placeholder="0"
                  />
                </td>

                {/* pre qty */}
                <td className="p-2">
                  <input
                    type="number"
                    value={editForm.preparation || ''}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        preparation: Number(e.target.value),
                      })
                    }
                    className="w-full rounded border px-2 py-1 dark:bg-black"
                    placeholder="1"
                  />
                </td>

                {/* transport */}
                <td className="p-2">
                  <input
                    type="number"
                    value={editForm.transport || ''}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        transport: Number(e.target.value),
                      })
                    }
                    className="w-full rounded border px-2 py-1 dark:bg-black"
                    placeholder="0"
                  />
                </td>

                {/* total */}
                <td className="p-2"></td>
                <td className="p-2">
                  <div className="flex gap-2">
                    <IoMdCheckmark
                      onClick={saveNew}
                      className="h-5 w-5 cursor-pointer text-green-600"
                    />
                    <RxCross2
                      onClick={cancelAdd}
                      className="h-5 w-5 cursor-pointer text-red-600"
                    />
                  </div>
                </td>
                <td className="p-2"></td>
              </tr>
            )}

            {/* Data Rows */}
            {assignments.map((row, index) => {
              const isEditing = editingIndex === row.originalIndex;

              // Calculate Totals
              const total =
                (row.singlePrice || 0) * (row.expected || 0) +
                (row.transport || 0);

              const vendorPhone = getVendorPhone(row.foodVendorId);
              const vendorName = getVendorName(row.foodVendorId);

              // --- NEW LOGIC: Grouping Calculation ---
              // 1. Count how many rows exist for this specific vendor ID
              const rowspan = assignments.filter(
                (r) => r.foodVendorId === row.foodVendorId,
              ).length;

              // 2. Determine if this specific row is the *first* one in that group
              const isFirstVendorRow =
                assignments.findIndex(
                  (r) => r.foodVendorId === row.foodVendorId,
                ) === index;
              // ---------------------------------------

              return (
                <tr
                  key={row.keyId || row.originalIndex}
                  className="border-t border-stroke dark:border-strokedark"
                >
                  {/* 1. VENDOR COLUMN (Merged) */}
                  {isFirstVendorRow && (
                    <td
                      className="bg-white p-2 align-top dark:bg-boxdark"
                      rowSpan={rowspan}
                    >
                      {isEditing ? (
                        <select
                          value={editForm.foodVendorId || ''}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              foodVendorId: e.target.value,
                              dishId: '',
                            })
                          }
                          className="w-full rounded border px-2 py-1 dark:bg-black"
                        >
                          <option value="">Select Vendor</option>
                          {vendorsOfType.map((v: any) => (
                            <option key={v.id} value={v.id}>
                              {v.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="font-medium text-black dark:text-white">
                          {vendorName}
                        </span>
                      )}
                    </td>
                  )}

                  {/* 2. DISH COLUMN */}
                  <td className="p-2">
                    {isEditing ? (
                      <select
                        value={editForm.dishId || ''}
                        onChange={(e) =>
                          setEditForm({...editForm, dishId: e.target.value})
                        }
                        disabled={!editForm.foodVendorId}
                        className="w-full rounded border px-2 py-1 dark:bg-black"
                      >
                        <option value="">Select Dish</option>
                        {editForm.foodVendorId &&
                          getVendorById(
                            editForm.foodVendorId,
                          )?.foodVendorDishes?.map((d: any) => {
                            const isCurrent = d.dishId === row.dishId;
                            // Filter out dishes already used by other rows
                            if (!isCurrent && allUsedDishIds.includes(d.dishId))
                              return null;

                            const dishInSubevent = allDishes.find(
                              (sd) => sd.caterorDishId === d.dishId,
                            );

                            if (!dishInSubevent) return null;

                            return (
                              <option key={d.dishId} value={d.dishId}>
                                {dishInSubevent.dishName}
                              </option>
                            );
                          })}
                      </select>
                    ) : (
                      getDishName(row.dishId)
                    )}
                  </td>

                  {/* 3. ORDER QTY COLUMN */}
                  <td className="p-2">
                    {isEditing ? (
                      <input
                        type="number"
                        value={editForm.expected || ''}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            expected: Number(e.target.value),
                          })
                        }
                        className="w-full rounded border px-2 py-1 dark:bg-black"
                      />
                    ) : (
                      row.expected || 0
                    )}
                  </td>

                  {/* 4. PRICE COLUMN */}
                  <td className="p-2">
                    {isEditing ? (
                      <input
                        type="number"
                        value={editForm.singlePrice || ''}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            singlePrice: Number(e.target.value),
                          })
                        }
                        className="w-full rounded border px-2 py-1 dark:bg-black"
                      />
                    ) : (
                      `₹${row.singlePrice || 0}`
                    )}
                  </td>

                  {/* 5. PREPARATION QTY COLUMN */}
                  <td className="p-2">
                    {isEditing ? (
                      <input
                        type="number"
                        value={editForm.preparation || ''}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            preparation: Number(e.target.value),
                          })
                        }
                        className="w-full rounded border px-2 py-1 dark:bg-black"
                      />
                    ) : (
                      row.preparation || 0
                    )}
                  </td>

                  {/* 6. TRANSPORT COLUMN */}
                  <td className="p-2">
                    {isEditing ? (
                      <input
                        type="number"
                        value={editForm.transport || ''}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            transport: Number(e.target.value),
                          })
                        }
                        className="w-full rounded border px-2 py-1 dark:bg-black"
                      />
                    ) : (
                      `₹${row.transport || 0}`
                    )}
                  </td>

                  {/* 7. TOTAL COLUMN */}
                  <td className="p-2 font-semibold">₹{total}</td>

                  {/* 8. ACTIONS COLUMN */}
                  <td className="p-2">
                    {isEditing ? (
                      <div className="flex gap-2">
                        <IoMdCheckmark
                          onClick={saveEdit}
                          className="h-4 w-4 cursor-pointer text-xl text-graydark dark:text-gray-2"
                        />
                        <RxCross2
                          onClick={cancelEdit}
                          className="h-4 w-4 cursor-pointer text-xl text-graydark dark:text-gray-2"
                        />
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <FiEdit
                          onClick={() => startEdit(row)}
                          className="h-4 w-4 cursor-pointer text-xl text-graydark dark:text-gray-2"
                        />
                        <MdDelete
                          onClick={() => smartRemove(row.originalIndex)}
                          className="h-4 w-4 cursor-pointer text-xl text-graydark dark:text-gray-2"
                        />
                      </div>
                    )}
                  </td>

                  {/* 9. SHARE ALL COLUMN (Merged) */}
                  {isFirstVendorRow && (
                    <td className="p-2 align-top" rowSpan={rowspan}>
                      {!isEditing && vendorPhone && (
                        <VendorWhatsAppShareButton
                          vendorId={row.foodVendorId}
                          vendorName={vendorName}
                          vendorPhone={vendorPhone}
                          subData={subData}
                          subEventName={subEventName}
                          assignments={assignments}
                          isVendorTable={true}
                          getDishName={getDishName}
                        />
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ========== FOOD LABOUR TABLE ==========
const FoodLabourTable: React.FC<
  Omit<FoodVendorAssignmentsProps, 'isLabour' | 'title' | 'color'> & {
    onPrint: () => void;
    subData: any;
  }
> = ({
  subEventForm,
  foodVendorData,
  getDishesForSubevent,
  foodVendorAssignments = [],
  handleAddFoodVendor,
  handleUpdateFoodVendor,
  handleRemoveFoodVendor,
  onPrint,
  subData,
}) => {
  const subEventId = subEventForm?.id;
  const subEventName = subEventForm?.name || 'Unknown SubEvent';
  const peopleCount = subEventForm?.people || 0;

  const allDishes = getDishesForSubevent(subEventForm?.id) || [];
  const allVendors = foodVendorData?.data || [];

  const getVendorById = (id: string) =>
    allVendors.find((v: any) => v.id === id);
  const getVendorName = (id: string) =>
    allVendors.find((v: any) => v.id === id)?.name || 'Unknown';
  const getVendorPhone = (id: string) =>
    allVendors.find((v: any) => v.id === id)?.phone || '';
  const getDishName = (id: string) =>
    allDishes.find((d: any) => d.caterorDishId === id)?.dishName || 'Unknown';

  const [isAdding, setIsAdding] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<any>({});

  let assignments = useMemo(
    () =>
      foodVendorAssignments
        .map((a, i) => ({...a, originalIndex: i}))
        .filter((a) => a.includeRawMaterial === false),
    [foodVendorAssignments],
  );

  // Group by vendor and sort
  const labourGroups = useMemo(() => {
    const groups: {vendorId: string; rows: typeof assignments}[] = [];
    const vendorMap = new Map<string, typeof assignments>();

    assignments.forEach((row) => {
      const list = vendorMap.get(row.foodVendorId) || [];
      list.push(row);
      vendorMap.set(row.foodVendorId, list);
    });

    vendorMap.forEach((rows, vendorId) => {
      rows.sort((a, b) => {
        const scoreA =
          (a.singlePrice || 0) + (a.count || 0) + (a.transport || 0);
        const scoreB =
          (b.singlePrice || 0) + (b.count || 0) + (b.transport || 0);
        return scoreB - scoreA;
      });
      groups.push({vendorId, rows});
    });

    return groups;
  }, [assignments]);

  assignments = labourGroups.flatMap((g) => g.rows);

  const allUsedDishIds = useMemo(
    () => foodVendorAssignments.map((a) => a.dishId),
    [foodVendorAssignments],
  );

  const vendorsOfType = useMemo(
    () => allVendors.filter((v: any) => v.rawMaterialCalculation === false),
    [allVendors],
  );

  const isVendorAlreadyInLabour = (vendorId: string) => {
    return foodVendorAssignments.some(
      (a) => a.foodVendorId === vendorId && a.includeRawMaterial === false,
    );
  };

  const startEdit = (row: any) => {
    setEditingIndex(row.originalIndex);
    setEditForm({...row});
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditForm({});
  };

  const cancelAdd = () => {
    setIsAdding(false);
    setEditForm({});
  };

  const saveEdit = () => {
    if (editingIndex === null) return;

    const total =
      (editForm.singlePrice || 0) * (editForm.count || 0) +
      (editForm.transport || 0);

    const updatedAssignment = {
      ...editForm,
      price: Math.max(total, 1),
      includeRawMaterial: false,
      expected: Math.max(peopleCount, 1),
      preparation: Math.max(peopleCount, 1),
    };

    handleUpdateFoodVendor(subEventId, editingIndex, updatedAssignment);
    cancelEdit();
  };

  const saveNew = () => {
    const total =
      (editForm.singlePrice || 0) * (editForm.count || 0) +
      (editForm.transport || 0);

    const newAssignment = {
      isClubVendor: false,
      keyId: Date.now() + Math.random(),
      foodVendorId: editForm.foodVendorId,
      dishId: editForm.dishId,
      singlePrice: Number(editForm.singlePrice),
      count: Number(editForm.count),
      preparation: 0,
      transport: Number(editForm.transport || 0),
      unit: 'KILOGRAM',
      price: Math.max(total, 1),
      expected: Math.max(peopleCount, 1),
      includeRawMaterial: false,
    };

    handleAddFoodVendor(subEventId, true, newAssignment);
    setIsAdding(false);
    setEditForm({});
  };

  const smartRemove = (originalIndexToRemove: number) => {
    const rowToRemove = foodVendorAssignments[originalIndexToRemove];
    if (!rowToRemove) {
      handleRemoveFoodVendor(subEventId, originalIndexToRemove);
      return;
    }

    const salary = rowToRemove.singlePrice || 0;
    const count = rowToRemove.count || 0;
    const transport = rowToRemove.transport || 0;
    const allZero = salary === 0 && count === 0 && transport === 0;

    if (allZero) {
      handleRemoveFoodVendor(subEventId, originalIndexToRemove);
      return;
    }

    confirmAlert({
      title: 'Confirm Delete',
      message: (
        <div className="text-left">
          <p>
            You are deleting a dish assignment for{' '}
            <strong>{getVendorName(rowToRemove.foodVendorId)}</strong>.
          </p>
          <p className="mt-2">
            Salary: ₹{salary} | Count: {count} | Transport: ₹{transport}
          </p>
          <p className="mt-3 text-sm font-medium text-blue-600">
            These values will be copied to another dish of the same vendor (if
            exists).
          </p>
          <p className="mt-2">Do you want to proceed?</p>
        </div>
      ),
      buttons: [
        {
          label: 'Yes, Delete',
          onClick: () => {
            const otherDishIndex = foodVendorAssignments.findIndex(
              (a, idx) =>
                idx !== originalIndexToRemove &&
                a.foodVendorId === rowToRemove.foodVendorId &&
                a.includeRawMaterial === false,
            );

            if (otherDishIndex !== -1) {
              const targetDish = foodVendorAssignments[otherDishIndex];
              handleUpdateFoodVendor(subEventId, otherDishIndex, {
                ...targetDish,
                singlePrice: salary,
                count: count,
                transport: transport,
                price: salary * count + transport,
              });
            }

            setTimeout(() => {
              handleRemoveFoodVendor(subEventId, originalIndexToRemove);
            }, 10);
          },
        },
        {
          label: 'Cancel',
          onClick: () => {},
        },
      ],
      closeOnEscape: true,
      closeOnClickOutside: true,
    });
  };

  const displayValue = (value: number | undefined) =>
    value === 0 ? '-' : value;
  const displayCurrency = (value: number | undefined) =>
    value === 0 ? '-' : `₹${value}`;

  return (
    <div className="rounded-md border border-stroke dark:border-strokedark">
      <div className="flex items-center justify-between border-b border-stroke bg-red-50 px-4 py-2 dark:border-strokedark">
        <h3 className="font-semibold text-red-950">Food Labour</h3>
        <div className="flex gap-3">
          <button
            onClick={onPrint}
            className="flex items-center gap-1 rounded text-sm font-bold text-green-950 underline hover:text-green-800"
            title="Print Vendor Report"
          >
            <BiPrinter size={18} /> Print PDF
          </button>
          <button
            onClick={() => {
              setIsAdding(true);
              setEditForm({
                unit: 'KILOGRAM',
                transport: 0,
                count: 1,
                singlePrice: 0,
                preparation: 0,
              });
            }}
            className="rounded px-3 py-1 text-sm font-bold text-red-950 underline"
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
              <th className="p-2 text-left">Dish</th>
              <th className="p-2 text-left">Salary</th>
              <th className="p-2 text-left">Count</th>
              <th className="p-2 text-left">Transport</th>
              <th className="p-2 text-left">Total</th>
              <th className="p-2 text-left">Actions</th>
              <th className="p-2 text-left">Share All</th>
            </tr>
          </thead>
          <tbody>
            {isAdding && (
              <>
                <tr className="bg-blue-50 dark:bg-boxdark">
                  <td className="p-2">
                    <select
                      value={editForm.foodVendorId || ''}
                      onChange={(e) => {
                        const vendorId = e.target.value;
                        const vendor = getVendorById(vendorId);
                        const alreadyUsed = isVendorAlreadyInLabour(vendorId);

                        setEditForm({
                          ...editForm,
                          foodVendorId: vendorId,
                          singlePrice: alreadyUsed
                            ? 0
                            : vendor?.dailySalary || 0,
                          count: alreadyUsed ? 0 : 1,
                          transport: alreadyUsed ? 0 : vendor?.transport || 0,
                          dishId: '',
                        });
                      }}
                      className="w-full rounded border px-2 py-1 dark:bg-black"
                    >
                      <option value="">Select Vendor</option>
                      {vendorsOfType.map((v: any) => (
                        <option key={v.id} value={v.id}>
                          {v.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-2">
                    <select
                      value={editForm.dishId || ''}
                      onChange={(e) =>
                        setEditForm({...editForm, dishId: e.target.value})
                      }
                      disabled={!editForm.foodVendorId}
                      className="w-full rounded border px-2 py-1 dark:bg-black"
                    >
                      <option value="">Select Dish</option>
                      {editForm.foodVendorId &&
                        getVendorById(
                          editForm.foodVendorId,
                        )?.foodVendorDishes?.map((d: any) => {
                          if (allUsedDishIds.includes(d.dishId)) return null;
                          const dishInSubevent = allDishes.find(
                            (sd) => sd.caterorDishId === d.dishId,
                          );
                          if (!dishInSubevent) return null;
                          return (
                            <option key={d.dishId} value={d.dishId}>
                              {dishInSubevent.dishName}
                            </option>
                          );
                        })}
                    </select>
                  </td>
                  <td className="p-2">
                    <input
                      type="number"
                      value={editForm.singlePrice || ''}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          singlePrice: Number(e.target.value),
                        })
                      }
                      disabled={
                        editForm.foodVendorId &&
                        isVendorAlreadyInLabour(editForm.foodVendorId)
                      }
                      className="disabled:bg-gray-200 disabled:text-gray-500 w-full rounded border px-2 py-1 dark:bg-black"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="number"
                      value={editForm.count || ''}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          count: Number(e.target.value),
                        })
                      }
                      disabled={
                        editForm.foodVendorId &&
                        isVendorAlreadyInLabour(editForm.foodVendorId)
                      }
                      className="disabled:bg-gray-200 disabled:text-gray-500 w-full rounded border px-2 py-1 dark:bg-black"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="number"
                      value={editForm.transport || ''}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          transport: Number(e.target.value),
                        })
                      }
                      disabled={
                        editForm.foodVendorId &&
                        isVendorAlreadyInLabour(editForm.foodVendorId)
                      }
                      className="disabled:bg-gray-200 disabled:text-gray-500 w-full rounded border px-2 py-1 dark:bg-black"
                    />
                  </td>
                  <td className="p-2"></td>
                  <td className="p-2">
                    <div className="flex gap-2">
                      <IoMdCheckmark
                        onClick={saveNew}
                        className="h-4 w-4 cursor-pointer text-xl text-graydark dark:text-gray-2"
                      />
                      <RxCross2
                        onClick={cancelAdd}
                        className="h-4 w-4 cursor-pointer text-xl text-graydark dark:text-gray-2"
                      />
                    </div>
                  </td>
                  <td className="p-2"></td>
                </tr>
                {editForm.foodVendorId &&
                  isVendorAlreadyInLabour(editForm.foodVendorId) && (
                    <tr>
                      <td
                        colSpan={8}
                        className="text-gray-600 p-2 text-center text-xs italic"
                      >
                        Salary, Count, and Transport are managed on the first
                        dish for this vendor and cannot be edited here.
                      </td>
                    </tr>
                  )}
              </>
            )}

            {assignments.map((row, idx) => {
              const isEditing = editingIndex === row.originalIndex;
              const total =
                (row.singlePrice || 0) * (row.count || 0) +
                (row.transport || 0);
              const vendorPhone = getVendorPhone(row.foodVendorId);
              const vendorName = getVendorName(row.foodVendorId);

              const rowspan = assignments.filter(
                (r) => r.foodVendorId === row.foodVendorId,
              ).length;
              const isFirstInGroup =
                assignments.findIndex(
                  (r) => r.foodVendorId === row.foodVendorId,
                ) === idx;

              return (
                <tr
                  key={row.keyId || idx}
                  className="border-t border-stroke dark:border-strokedark"
                >
                  {isFirstInGroup && (
                    <td className="p-2 align-top" rowSpan={rowspan}>
                      {isEditing ? (
                        <select
                          value={editForm.foodVendorId || ''}
                          onChange={(e) => {
                            const vendorId = e.target.value;
                            const vendor = getVendorById(vendorId);
                            setEditForm({
                              ...editForm,
                              foodVendorId: vendorId,
                              singlePrice: vendor?.dailySalary || 0,
                              transport:
                                vendor?.transport || editForm.transport || 0,
                              dishId: '',
                            });
                          }}
                          className="w-full rounded border px-2 py-1 dark:bg-black"
                        >
                          <option value="">Select Vendor</option>
                          {vendorsOfType.map((v: any) => (
                            <option key={v.id} value={v.id}>
                              {v.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        vendorName
                      )}
                    </td>
                  )}
                  <td className="p-2">
                    {isEditing ? (
                      <select
                        value={editForm.dishId || ''}
                        onChange={(e) =>
                          setEditForm({...editForm, dishId: e.target.value})
                        }
                        disabled={!editForm.foodVendorId}
                        className="w-full rounded border px-2 py-1 dark:bg-black"
                      >
                        <option value="">Select Dish</option>
                        {editForm.foodVendorId &&
                          getVendorById(
                            editForm.foodVendorId,
                          )?.foodVendorDishes?.map((d: any) => {
                            const isCurrentDish = d.dishId === row.dishId;
                            if (
                              !isCurrentDish &&
                              allUsedDishIds.includes(d.dishId)
                            )
                              return null;
                            const dishInSubevent = allDishes.find(
                              (sd) => sd.caterorDishId === d.dishId,
                            );
                            if (!dishInSubevent) return null;
                            return (
                              <option key={d.dishId} value={d.dishId}>
                                {dishInSubevent.dishName}
                              </option>
                            );
                          })}
                      </select>
                    ) : (
                      getDishName(row.dishId)
                    )}
                  </td>
                  <td className="p-2">
                    {isEditing ? (
                      <input
                        type="number"
                        value={editForm.singlePrice || ''}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            singlePrice: Number(e.target.value),
                          })
                        }
                        className="w-full rounded border px-2 py-1 dark:bg-black"
                      />
                    ) : (
                      displayCurrency(row.singlePrice)
                    )}
                  </td>
                  <td className="p-2">
                    {isEditing ? (
                      <input
                        type="number"
                        value={editForm.count || ''}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            count: Number(e.target.value),
                          })
                        }
                        className="w-full rounded border px-2 py-1 dark:bg-black"
                      />
                    ) : (
                      displayValue(row.count)
                    )}
                  </td>
                  <td className="p-2">
                    {isEditing ? (
                      <input
                        type="number"
                        value={editForm.transport || ''}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            transport: Number(e.target.value),
                          })
                        }
                        className="w-full rounded border px-2 py-1 dark:bg-black"
                      />
                    ) : (
                      displayCurrency(row.transport)
                    )}
                  </td>
                  <td className="p-2 font-semibold">
                    {total === 0 ? '-' : `₹${total}`}
                  </td>
                  <td className="p-2">
                    {isEditing ? (
                      <div className="flex gap-2">
                        <IoMdCheckmark
                          onClick={saveEdit}
                          className="h-4 w-4 cursor-pointer text-xl text-graydark dark:text-gray-2"
                        />
                        <RxCross2
                          onClick={cancelEdit}
                          className="h-4 w-4 cursor-pointer text-xl text-graydark dark:text-gray-2"
                        />
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <MdDelete
                          onClick={() => smartRemove(row.originalIndex)}
                          className="h-4 w-4 cursor-pointer text-xl text-graydark dark:text-gray-2"
                        />
                      </div>
                    )}
                  </td>
                  {/* SHARE ALL BUTTON (only on first row for each vendor) */}
                  <td className="p-2">
                    {!isEditing && isFirstInGroup && vendorPhone && (
                      <VendorWhatsAppShareButton
                        vendorId={row.foodVendorId}
                        vendorName={vendorName}
                        vendorPhone={vendorPhone}
                        subData={subData}
                        subEventName={subEventName}
                        assignments={assignments}
                        isVendorTable={false}
                        getDishName={getDishName}
                      />
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ========== CLUB VENDOR TABLE ==========
const ClubVendorTable: React.FC<
  Omit<FoodVendorAssignmentsProps, 'isLabour' | 'title' | 'color'> & {
    onPrint: () => void;
    subData: any;
  }
> = ({
  subEventForm,
  foodVendorData,
  getDishesForSubevent,
  foodVendorAssignments = [],
  handleAddFoodVendor,
  handleUpdateFoodVendor,
  handleAddClubVendor,
  handleRemoveFoodVendor,
  onPrint,
  subData,
}) => {
  const subEventId = subEventForm?.id;
  const subEventName = subEventForm?.name || 'Unknown SubEvent';
  const [clubvendorpackages, setClubvendorpackages] = useState<
    {
      vendorId: string;
      vendorName: string;
      dishes: Array<{
        id: string;
        name: string;
      }>;
    }[]
  >([]);

  const {data: clubvendorpackagesData} = useGetClubVendorPackage();

  useEffect(() => {
    if (clubvendorpackagesData) {
      if (Array.isArray(clubvendorpackagesData)) {
        const transformedData = clubvendorpackagesData.map((vendor: any) => {
          return {
            vendorId: vendor.id,
            vendorName: vendor.name,
            dishes: vendor.dishes || [],
          };
        });

        setClubvendorpackages(transformedData);
      } else {
        setClubvendorpackages([]);
      }
    } else {
      setClubvendorpackages([]);
    }
  }, [clubvendorpackagesData]);

  const allDishes = getDishesForSubevent(subEventForm?.id) || [];
  const allVendors = foodVendorData?.data || [];

  const getVendorById = (id: string) =>
    allVendors.find((v: any) => v.id === id);
  const getVendorName = (id: string) =>
    allVendors.find((v: any) => v.id === id)?.name || 'Unknown';
  const getVendorPhone = (id: string) =>
    allVendors.find((v: any) => v.id === id)?.phone || '';

  const [isAdding, setIsAdding] = useState(false);
  const [editingVendorId, setEditingVendorId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});

  const startEdit = (vendorId: string, assignments: any[]) => {
    // Get the first assignment to pre-populate values
    const firstAssignment = assignments[0];
    setEditingVendorId(vendorId);
    setEditForm({
      foodVendorId: firstAssignment.foodVendorId,
      dishId: firstAssignment.dishId,
      singlePrice: firstAssignment.singlePrice || 0,
      expected: firstAssignment.expected || 0,
      preparation: firstAssignment.preparation || 0,
      transport: firstAssignment.transport || 0,
    });
  };

  const cancelEdit = () => {
    setEditingVendorId(null);
    setEditForm({});
  };

  const saveEdit = (vendorId: string, vendorAssignments: any[]) => {
    vendorAssignments.forEach((assignment, index) => {
      const total =
        (editForm.singlePrice || 0) * (editForm.expected || 0) +
        (editForm.transport || 0);

      const updatedAssignment = {
        ...assignment,
        singlePrice: Number(editForm.singlePrice || 0),
        expected: Number(editForm.expected || 0),
        preparation: Number(editForm.preparation || 0),
        transport: Number(editForm.transport || 0),
        price: Math.max(total, 1),
        includeRawMaterial: false,
      };

      handleUpdateFoodVendor(
        subEventId,
        assignment.originalIndex,
        updatedAssignment,
      );
    });

    cancelEdit();
  };

  const getDishName = (id: string) => {
    const dishFromAllDishes = allDishes.find(
      (d: any) => d.caterorDishId === id || d.dishId === id || d.id === id,
    );
    if (dishFromAllDishes) {
      return (
        dishFromAllDishes.dishName || dishFromAllDishes.dish?.name || 'Unknown'
      );
    }

    for (const vendorPackage of clubvendorpackages) {
      const clubVendorDish = vendorPackage.dishes.find((d: any) => d.id === id);
      if (clubVendorDish) {
        return clubVendorDish.name;
      }
    }

    return 'Unknown';
  };

  const assignments = useMemo(() => {
    const allVendorsList = foodVendorData?.data || [];

    const filteredAssignments = foodVendorAssignments
      .map((a, i) => ({...a, originalIndex: i}))
      .filter((a) => {
        const vendor = allVendorsList.find((v: any) => v.id === a.foodVendorId);
        const isClubVendor =
          a.isClubVendor === true || vendor?.isClubVendor === true;
        return isClubVendor === true;
      });

    return filteredAssignments.sort((a, b) => {
      if (a.foodVendorId !== b.foodVendorId) {
        return a.foodVendorId > b.foodVendorId ? 1 : -1;
      }

      const priceA = a.singlePrice || 0;
      const priceB = b.singlePrice || 0;

      if (priceA > 0 && priceB > 0) {
        return priceB - priceA;
      }
      if (priceA === 0 && priceB > 0) return 1;
      if (priceA > 0 && priceB === 0) return -1;
      return 0;
    });
  }, [foodVendorAssignments, foodVendorData]);

  const vendorGroups = useMemo(() => {
    const groups: {[vendorId: string]: any[]} = {};
    assignments.forEach((row) => {
      if (!groups[row.foodVendorId]) {
        groups[row.foodVendorId] = [];
      }
      groups[row.foodVendorId].push(row);
    });
    return groups;
  }, [assignments]);

  const allUsedDishIds = useMemo(
    () => foodVendorAssignments.map((a) => a.dishId),
    [foodVendorAssignments],
  );

  const clubVendors = useMemo(
    () => allVendors.filter((v: any) => v.isClubVendor === true),
    [allVendors],
  );

  const getAvailableDishesForVendor = useCallback(
    (vendorId: string) => {
      if (!vendorId) {
        return [];
      }

      const vendorPackage = clubvendorpackages.find(
        (pkg) => pkg.vendorId === vendorId,
      );

      const availableDishesMap = new Map();

      if (
        vendorPackage &&
        vendorPackage.dishes &&
        vendorPackage.dishes.length > 0
      ) {
        vendorPackage.dishes.forEach((dish: any) => {
          const caterorDish = allDishes.find(
            (d: any) =>
              d.caterorDishId === dish.id ||
              d.dishId === dish.id ||
              d.id === dish.id,
          );

          // ✅ ONLY include if dish exists in subevent
          if (
            caterorDish &&
            !allUsedDishIds.includes(
              caterorDish.caterorDishId || caterorDish.dishId || caterorDish.id,
            )
          ) {
            const finalDishId =
              caterorDish.caterorDishId || caterorDish.dishId || caterorDish.id;

            availableDishesMap.set(finalDishId, {
              dishId: finalDishId,
              dishName:
                caterorDish.dishName || caterorDish.dish?.name || dish.name,
              price: caterorDish.price || 0,
              source: 'clubPackage',
            });
          }
        });
      }

      const vendorDishesFromAllDishes = allDishes.filter((d: any) => {
        const hasMatchingVendor = d.foodVendorId === vendorId;

        return (
          hasMatchingVendor &&
          !allUsedDishIds.includes(d.caterorDishId || d.dishId)
        );
      });

      vendorDishesFromAllDishes.forEach((d: any) => {
        const dishId = d.caterorDishId || d.dishId;
        if (!availableDishesMap.has(dishId)) {
          availableDishesMap.set(dishId, {
            dishId: dishId,
            dishName: d.dishName || d.dish?.name || 'Unknown',
            price: d.price || 0,
            source: 'allDishes',
          });
        }
      });

      if (availableDishesMap.size === 0) {
        allDishes
          .filter((d: any) => {
            const dishId = d.caterorDishId || d.dishId;
            return !allUsedDishIds.includes(dishId);
          })
          .forEach((d: any) => {
            const dishId = d.caterorDishId || d.dishId;
            if (!availableDishesMap.has(dishId)) {
              availableDishesMap.set(dishId, {
                dishId: dishId,
                dishName: d.dishName || d.dish?.name || 'Unknown',
                price: d.price || 0,
                source: 'fallback',
              });
            }
          });
      }

      const availableDishes = Array.from(availableDishesMap.values()).sort(
        (a: any, b: any) => {
          if (a.price > 0 && b.price > 0) return b.price - a.price;
          if (a.price === 0 && b.price > 0) return 1;
          if (a.price > 0 && b.price === 0) return -1;
          return a.dishName.localeCompare(b.dishName);
        },
      );

      return availableDishes;
    },
    [clubvendorpackages, allDishes, allUsedDishIds],
  );

  const getDishPrice = (dishId: string) => {
    const dish = allDishes.find((d: any) => d.caterorDishId === dishId);
    return dish?.price || 0;
  };

  const cancelAdd = () => {
    setIsAdding(false);
    setEditForm({});
  };

  const saveNew = () => {
    const total =
      (editForm.singlePrice || 0) * (editForm.expected || 0) +
      (editForm.transport || 0);

    const newAssignment = {
      keyId: Date.now() + Math.random(),
      foodVendorId: editForm.foodVendorId,
      dishId: editForm.dishId,
      singlePrice: Number(editForm.singlePrice || 0),
      expected: Number(editForm.expected || 0),
      preparation: Number(editForm.preparation || 0),
      transport: Number(editForm.transport || 0),
      unit: 'KILOGRAM',
      price: Math.max(total, 1),
      isClubVendor: true,
      includeRawMaterial: true,
    };

    handleAddFoodVendor(subEventId, false, newAssignment);
    setIsAdding(false);
    setEditForm({});
  };

  const smartRemove = (originalIndexToRemove: number) => {
    handleRemoveFoodVendor(subEventId, originalIndexToRemove);
  };

  const getVendorNameFromPackages = (vendorId: string) => {
    const vendorPackage = clubvendorpackages.find(
      (pkg) => pkg.vendorId === vendorId,
    );
    return vendorPackage?.vendorName || getVendorName(vendorId);
  };

  return (
    <div className="rounded-md border border-stroke dark:border-strokedark">
      <div className="flex items-center justify-between border-b border-stroke bg-purple-50 px-4 py-2 dark:border-strokedark">
        <h3 className="font-semibold text-purple-950">Package Vendor </h3>
        <div className="flex gap-3">
          <button
            onClick={onPrint}
            className="flex items-center gap-1 rounded text-sm font-bold text-green-950 underline hover:text-green-800"
            title="Print Club Vendor Report"
          >
            <BiPrinter size={18} /> Print PDF
          </button>
          <button
            onClick={() => {
              setIsAdding(true);
              setEditForm({
                singlePrice: 0,
                expected: 0,
                preparation: 0,
                transport: 0,
              });
            }}
            className="rounded px-3 py-1 text-sm font-bold text-purple-950 underline"
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
              <th className="p-2 text-left">Dish</th>
              <th className="p-2 text-left">Order Qty</th>
              <th className="p-2 text-left">Price</th>
              <th className="p-2 text-left">Preparation Qty</th>
              <th className="p-2 text-left">Decoration</th>
              <th className="p-2 text-left">Transport</th>
              <th className="p-2 text-left">Total</th>
              <th className="p-2 text-left">Actions</th>
              <th className="p-2 text-left">Share All</th>
            </tr>
          </thead>
          <tbody>
            {/* Add New Row */}
            {isAdding && (
              <tr className="bg-blue-50 dark:bg-boxdark">
                {/* vendor */}
                <td className="p-2">
                  <select
                    value={editForm.foodVendorId || ''}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        foodVendorId: e.target.value,
                        dishId: '',
                      })
                    }
                    className="w-full rounded border px-2 py-1 dark:bg-black"
                  >
                    <option value="">Select Club Vendor</option>
                    {clubVendors.map((v: any) => (
                      <option key={v.id} value={v.id}>
                        {getVendorNameFromPackages(v.id)}
                      </option>
                    ))}
                  </select>
                </td>

                {/* dish */}
                <td className="p-2">
                  <select
                    value={editForm.dishId || ''}
                    onChange={(e) => {
                      const dishId = e.target.value;
                      const price = getDishPrice(dishId);
                      setEditForm({
                        ...editForm,
                        dishId: dishId,
                        singlePrice: price,
                      });
                    }}
                    disabled={!editForm.foodVendorId}
                    className="w-full rounded border px-2 py-1 dark:bg-black"
                  >
                    <option value="">Select Dish</option>
                    {getAvailableDishesForVendor(editForm.foodVendorId).map(
                      (d: any) => {
                        return (
                          <option key={d.dishId} value={d.dishId}>
                            {d.dishName} {d.price > 0 ? `(₹${d.price})` : ''}
                          </option>
                        );
                      },
                    )}
                  </select>
                </td>

                {/* order qty */}
                <td className="p-2">
                  <input
                    type="number"
                    value={editForm.expected || ''}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        expected: Number(e.target.value),
                      })
                    }
                    className="w-full rounded border px-2 py-1 dark:bg-black"
                    placeholder="0"
                  />
                </td>

                {/* price */}
                <td className="p-2">
                  <input
                    type="number"
                    value={editForm.singlePrice || ''}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        singlePrice: Number(e.target.value),
                      })
                    }
                    className="w-full rounded border px-2 py-1 dark:bg-black"
                    placeholder="0"
                  />
                </td>

                {/* prep qty */}
                <td className="p-2">
                  <input
                    type="number"
                    value={editForm.preparation || ''}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        preparation: Number(e.target.value),
                      })
                    }
                    className="w-full rounded border px-2 py-1 dark:bg-black"
                    placeholder="1"
                  />
                </td>

                {/* transport */}
                <td className="p-2">
                  <input
                    type="number"
                    value={editForm.transport || ''}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        transport: Number(e.target.value),
                      })
                    }
                    className="w-full rounded border px-2 py-1 dark:bg-black"
                    placeholder="0"
                  />
                </td>

                {/* total */}
                <td className="p-2"></td>
                <td className="p-2">
                  <div className="flex gap-2">
                    <IoMdCheckmark
                      onClick={saveNew}
                      className="h-5 w-5 cursor-pointer text-green-600"
                    />
                    <RxCross2
                      onClick={cancelAdd}
                      className="h-5 w-5 cursor-pointer text-red-600"
                    />
                  </div>
                </td>
                <td className="p-2"></td>
              </tr>
            )}

            {/* Data Rows - Iterate through vendor groups */}
            {Object.entries(vendorGroups).map(([vendorId, vendorRows]) => {
              const vendorPhone = getVendorPhone(vendorId);
              const vendorName = getVendorNameFromPackages(vendorId);
              const isEditing = editingVendorId === vendorId;

              return vendorRows.map((row, rowIndex) => {
                const total =
                  (row.singlePrice || 0) * (row.expected || 0) +
                  (row.transport || 0);

                // Check if this is the first row for this vendor
                const isFirstVendorRow = rowIndex === 0;
                const rowspan = vendorRows.length;

                return (
                  <tr
                    key={row.keyId || row.originalIndex}
                    className="border-t border-stroke dark:border-strokedark"
                  >
                    {/* 1. VENDOR COLUMN (Merged) */}
                    {isFirstVendorRow && (
                      <td
                        className="bg-white p-2 align-top dark:bg-boxdark"
                        rowSpan={rowspan}
                      >
                        {isEditing ? (
                          <select
                            value={editForm.foodVendorId || ''}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                foodVendorId: e.target.value,
                                dishId: '',
                              })
                            }
                            className="w-full rounded border px-2 py-1 dark:bg-black"
                          >
                            <option value="">Select Club Vendor</option>
                            {clubVendors.map((v: any) => (
                              <option key={v.id} value={v.id}>
                                {getVendorNameFromPackages(v.id)}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="font-medium text-black dark:text-white">
                            {vendorName}
                          </span>
                        )}
                      </td>
                    )}

                    {/* 2. DISH COLUMN */}
                    <td className="p-2">
                      {isEditing && isFirstVendorRow ? (
                        <select
                          value={editForm.dishId || ''}
                          onChange={(e) => {
                            const dishId = e.target.value;
                            const price = getDishPrice(dishId);
                            setEditForm({
                              ...editForm,
                              dishId: dishId,
                              singlePrice: price,
                            });
                          }}
                          disabled={!editForm.foodVendorId}
                          className="w-full rounded border px-2 py-1 dark:bg-black"
                        >
                          <option value="">Select Dish</option>
                          {getAvailableDishesForVendor(
                            editForm.foodVendorId,
                          ).map((d: any) => {
                            return (
                              <option key={d.dishId} value={d.dishId}>
                                {d.dishName}{' '}
                                {d.price > 0 ? `(₹${d.price})` : ''}
                              </option>
                            );
                          })}
                        </select>
                      ) : (
                        getDishName(row.dishId)
                      )}
                    </td>

                    {/* 3. ORDER QTY COLUMN */}
                    <td className="p-2">
                      {isEditing && isFirstVendorRow ? (
                        <input
                          type="number"
                          value={editForm.expected || ''}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              expected: Number(e.target.value),
                            })
                          }
                          className="w-full rounded border px-2 py-1 dark:bg-black"
                        />
                      ) : isFirstVendorRow ? (
                        row.expected || 0
                      ) : (
                        '-'
                      )}
                    </td>

                    {/* 4. PRICE COLUMN */}
                    <td className="p-2">
                      {isEditing && isFirstVendorRow ? (
                        <input
                          type="number"
                          value={editForm.singlePrice || ''}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              singlePrice: Number(e.target.value),
                            })
                          }
                          className="w-full rounded border px-2 py-1 dark:bg-black"
                        />
                      ) : isFirstVendorRow ? (
                        <span className="font-medium">
                          {row.singlePrice || '-'}
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>

                    {/* 5. PREPARATION QTY COLUMN */}
                    <td className="p-2">
                      {isEditing && isFirstVendorRow ? (
                        <input
                          type="number"
                          value={editForm.preparation || ''}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              preparation: Number(e.target.value),
                            })
                          }
                          className="w-full rounded border px-2 py-1 dark:bg-black"
                        />
                      ) : isFirstVendorRow ? (
                        row.preparation || 0
                      ) : (
                        '-'
                      )}
                    </td>

                    <td className="p-2">
                      {isEditing && isFirstVendorRow ? (
                        <input
                          type="string"
                          value={editForm.transport || ''}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              transport: Number(e.target.value),
                            })
                          }
                          className="w-full rounded border px-2 py-1 dark:bg-black"
                        />
                      ) : isFirstVendorRow ? (
                        row.transport || 0
                      ) : (
                        '-'
                      )}
                    </td>

                    {/* 6. TRANSPORT COLUMN */}
                    <td className="p-2">
                      {isEditing && isFirstVendorRow ? (
                        <input
                          type="number"
                          value={editForm.transport || ''}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              transport: Number(e.target.value),
                            })
                          }
                          className="w-full rounded border px-2 py-1 dark:bg-black"
                        />
                      ) : isFirstVendorRow ? (
                        row.transport || '-'
                      ) : (
                        '-'
                      )}
                    </td>

                    {/* 7. TOTAL COLUMN */}
                    <td className="p-2 font-semibold">
                      {isEditing && isFirstVendorRow
                        ? `₹${editForm.singlePrice * editForm.expected + editForm.transport || 0}`
                        : isFirstVendorRow
                          ? `₹${total}`
                          : '-'}
                    </td>

                    {/* 8. ACTIONS COLUMN */}
                    <td className="p-2">
                      {isEditing ? (
                        isFirstVendorRow ? (
                          <div className="flex gap-2">
                            <IoMdCheckmark
                              onClick={() => saveEdit(vendorId, vendorRows)}
                              className="h-4 w-4 cursor-pointer text-xl text-graydark dark:text-gray-2"
                            />
                            <RxCross2
                              onClick={cancelEdit}
                              className="h-4 w-4 cursor-pointer text-xl text-graydark dark:text-gray-2"
                            />
                          </div>
                        ) : null
                      ) : (
                        <div className="flex gap-2">
                          {isFirstVendorRow && (
                            <FiEdit
                              onClick={() => startEdit(vendorId, vendorRows)}
                              className="h-4 w-4 cursor-pointer text-xl text-graydark dark:text-gray-2"
                            />
                          )}
                          <MdDelete
                            onClick={() => smartRemove(row.originalIndex)}
                            className="h-4 w-4 cursor-pointer text-xl text-graydark dark:text-gray-2"
                          />
                        </div>
                      )}
                    </td>

                    {/* 9. SHARE ALL COLUMN (Merged) */}
                    {isFirstVendorRow && (
                      <td className="p-2 align-top" rowSpan={rowspan}>
                        {!isEditing && vendorPhone && (
                          <VendorWhatsAppShareButton
                            vendorId={vendorId}
                            vendorName={vendorName}
                            vendorPhone={vendorPhone}
                            subData={subData}
                            subEventName={subEventName}
                            assignments={vendorRows}
                            isVendorTable={true}
                            getDishName={getDishName}
                          />
                        )}
                      </td>
                    )}
                  </tr>
                );
              });
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
// ========== MAIN COMPONENT ==========
const FoodVendorAssignments: React.FC<FoodVendorAssignmentsProps> = (props) => {
  const {user} = useAuthContext();
  const {data: subData} = useGetShareDataBySubeventId(props.subEventForm?.id);

  const {foodVendorData, getDishesForSubevent, subEventForm} = props;

  // --- Print Logic Helpers ---
  const allDishes = getDishesForSubevent(subEventForm?.id) || [];
  console.log('dishFromAllDishes', allDishes);

  const allVendors = foodVendorData?.data || [];

  const getVendorName = (id: string) =>
    allVendors.find((v: any) => v.id === id)?.name || 'Unknown';
  const getDishName = (id: string) =>
    allDishes.find((d: any) => d.caterorDishId === id)?.dishName || 'Unknown';

  const handlePrintSpecific = (type: 'VENDOR' | 'LABOUR' | 'CLUB') => {
    // 1. Filter and Prepare Data based on Type
    const assignments = props.foodVendorAssignments || [];
    const isVendor = type === 'VENDOR';
    const isLabour = type === 'LABOUR';
    const isClub = type === 'CLUB';

    // Filter rows
    let relevantAssignments = [];
    if (isVendor) {
      // Get all vendors list
      const allVendorsList = props.foodVendorData?.data || [];

      // Filter: includeRawMaterial = true AND not a club vendor
      relevantAssignments = assignments.filter((a) => {
        const vendor = allVendorsList.find((v: any) => v.id === a.foodVendorId);
        const isClubVendor =
          a.isClubVendor === true || vendor?.isClubVendor === true;
        return a.includeRawMaterial === true && !isClubVendor;
      });
    } else if (isLabour) {
      relevantAssignments = assignments.filter(
        (a) => a.includeRawMaterial === false,
      );
    } else if (isClub) {
      // First filter club vendors
      const allVendorsList = props.foodVendorData?.data || [];
      relevantAssignments = assignments.filter((a) => {
        const vendor = allVendorsList.find((v: any) => v.id === a.foodVendorId);
        const isClubVendor =
          a.isClubVendor === true || vendor?.isClubVendor === true;
        return isClubVendor === true;
      });

      // Sort club vendor assignments: first by vendorId, then by price (highest first, zero at bottom)
      relevantAssignments.sort((a, b) => {
        // First sort by vendor to keep vendor groups together
        if (a.foodVendorId !== b.foodVendorId) {
          return a.foodVendorId > b.foodVendorId ? 1 : -1;
        }

        // Then sort by price within each vendor group
        const priceA = a.singlePrice || 0;
        const priceB = b.singlePrice || 0;

        // If both have non-zero prices, sort descending (highest first)
        if (priceA > 0 && priceB > 0) {
          return priceB - priceA; // descending order
        }
        // If one has zero price, put it at bottom
        if (priceA === 0 && priceB > 0) return 1;
        if (priceA > 0 && priceB === 0) return -1;
        // If both zero, maintain order
        return 0;
      });
    }

    const printData = relevantAssignments.map((a) => {
      if (isVendor || isClub) {
        return {
          vendorName: getVendorName(a.foodVendorId),
          dishName: getDishName(a.dishId),
          orderQty: a.expected || 0,
          price: a.singlePrice || 0,
          prepQty: a.preparation || 0,
          transport: a.transport || 0,
          total: (a.singlePrice || 0) * (a.expected || 0) + (a.transport || 0),
        };
      } else {
        return {
          vendorName: getVendorName(a.foodVendorId),
          dishName: getDishName(a.dishId),
          salary: a.singlePrice || 0,
          count: a.count || 0,
          transport: a.transport || 0,
          total: (a.singlePrice || 0) * (a.count || 0) + (a.transport || 0),
        };
      }
    });

    const totalCost = printData.reduce((acc, curr) => acc + curr.total, 0);

    // 2. Prepare Header Info
    const eventName = subData?.event?.name || 'N/A';
    const subEventName = subData?.name || '';
    const startDate = subData?.date
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
    const peopleCount = subData?.pax || 'N/A';

    const reportTitle = isClub
      ? 'Club Vendor Report'
      : isVendor
        ? 'Food Vendor Report'
        : 'Food Labour Report';

    // 3. Generate Table Headers HTML
    let tableHeaderHTML = '';
    if (isVendor || isClub) {
      tableHeaderHTML = `
    <th style="border: 1px solid #ccc; padding: 6px; text-align: left; color: #fff;">Vendor</th>
    <th style="border: 1px solid #ccc; padding: 6px; text-align: left; color: #fff;">Dish</th>
    <th style="border: 1px solid #ccc; padding: 6px; text-align: center; color: #fff;">Order Qty</th>
    <th style="border: 1px solid #ccc; padding: 6px; text-align: center; color: #fff;">Price</th>
    <th style="border: 1px solid #ccc; padding: 6px; text-align: center; color: #fff;">Prep Qty</th>
    <th style="border: 1px solid #ccc; padding: 6px; text-align: center; color: #fff;">Transport</th>
    <th style="border: 1px solid #ccc; padding: 6px; text-align: right; color: #fff;">Total</th>
  `;
    } else {
      tableHeaderHTML = `
    <th style="border: 1px solid #ccc; padding: 6px; text-align: left; color: #fff;">Vendor</th>
    <th style="border: 1px solid #ccc; padding: 6px; text-align: left; color: #fff;">Dish</th>
    <th style="border: 1px solid #ccc; padding: 6px; text-align: center; color: #fff;">Salary</th>
    <th style="border: 1px solid #ccc; padding: 6px; text-align: center; color: #fff;">Count</th>
    <th style="border: 1px solid #ccc; padding: 6px; text-align: center; color: #fff;">Transport</th>
    <th style="border: 1px solid #ccc; padding: 6px; text-align: right; color: #fff;">Total</th>
  `;
    }

    // 4. Generate Table Rows HTML
    const tableRowsHTML =
      printData.length > 0
        ? printData
            .map((row) => {
              if (isVendor || isClub) {
                return `<tr>
              <td style="border: 1px solid #ccc; padding: 6px;">${row.vendorName}</td>
              <td style="border: 1px solid #ccc; padding: 6px;">${row.dishName}</td>
              <td style="border: 1px solid #ccc; padding: 6px; text-align: center;">${row.orderQty}</td>
              <td style="border: 1px solid #ccc; padding: 6px; text-align: center;">₹${row.price}</td>
              <td style="border: 1px solid #ccc; padding: 6px; text-align: center;">${row.prepQty}</td>
              <td style="border: 1px solid #ccc; padding: 6px; text-align: center;">₹${row.transport}</td>
              <td style="border: 1px solid #ccc; padding: 6px; text-align: right;">₹${row.total.toFixed(2)}</td>
            </tr>`;
              } else {
                return `<tr>
              <td style="border: 1px solid #ccc; padding: 6px;">${row.vendorName}</td>
              <td style="border: 1px solid #ccc; padding: 6px;">${row.dishName}</td>
              <td style="border: 1px solid #ccc; padding: 6px; text-align: center;">₹${row.salary}</td>
              <td style="border: 1px solid #ccc; padding: 6px; text-align: center;">${row.count}</td>
              <td style="border: 1px solid #ccc; padding: 6px; text-align: center;">₹${row.transport}</td>
              <td style="border: 1px solid #ccc; padding: 6px; text-align: right;">₹${row.total.toFixed(2)}</td>
            </tr>`;
              }
            })
            .join('')
        : `<tr><td colspan="${
            isVendor || isClub ? 7 : 6
          }" style="padding:10px; text-align:center; font-style:italic;">No assignments found.</td></tr>`;

    // 5. Build Inner HTML Content
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
    <div style="font-size:11px; margin-top:4px; opacity:0.95;">
      Event: ${eventName} | Subevent: ${
        subEventName ? `${subEventName}` : ''
      } | Date: ${startDate} | Time: ${timeDisplay}
    </div>
    <div style="font-size:11px; opacity:0.90; font-weight:normal;">Client: ${clientName} | People: ${peopleCount}</div>
  </div>

  <div style="font-family: Arial, sans-serif;">
    <h3 style="margin:15px 0 10px 0; font-size:16px; font-weight:700; color:#000; text-align:left; border-bottom:2px solid #1E3A8A; padding-bottom:5px;">
      ${isClub ? 'Club Vendor Assignments' : isVendor ? 'Vendor Assignments' : 'Labour Assignments'}
    </h3>
    
    <table style="width:100%; border-collapse: collapse; font-size:12px; border: 1px solid #ccc;">
      <thead>
        <tr style="background-color:#1E3A8A; color: #fff;">
          ${tableHeaderHTML}
        </tr>
      </thead>
      <tbody>
        ${tableRowsHTML}
      </tbody>
       <tfoot>
        <tr style="background-color: #e3f2fd; font-weight: bold;">
          <td colspan="${
            isVendor || isClub ? 6 : 5
          }" style="border: 1px solid #ccc; padding: 6px; text-align: right;">Grand Total:</td>
          <td style="border: 1px solid #ccc; padding: 6px; text-align: right;">
            ₹${totalCost.toFixed(2)}
          </td>
        </tr>
      </tfoot>
    </table>
  </div>
`;

    // 6. Construct Full Page with CSS and Script
    const fullHtml = `<!doctype html>
  <html>
  <head>
    <meta charset="utf-8" />
    <title>${reportTitle}</title>
    <style>
      @page { margin: 12mm 8mm; size: A4; }
      html, body { margin:0; padding:0; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; font-family: Arial, sans-serif; color: #000; }
      body.first-page { padding-top:0 !important; }
      
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

    const printWindow = window.open('', '_blank', 'width=1000,height=800');
    if (printWindow) {
      printWindow.document.write(fullHtml);
      printWindow.document.close();
    } else {
      alert('Pop-up blocked. Please allow pop-ups for this site.');
    }
  };

  return (
    <div className="space-y-8">
      <ClubVendorTable
        {...props}
        onPrint={() => handlePrintSpecific('CLUB')}
        subData={subData}
      />

      <FoodVendorTable
        {...props}
        onPrint={() => handlePrintSpecific('VENDOR')}
        subData={subData}
      />
      <FoodLabourTable
        {...props}
        onPrint={() => handlePrintSpecific('LABOUR')}
        subData={subData}
      />
    </div>
  );
};

export default FoodVendorAssignments;
