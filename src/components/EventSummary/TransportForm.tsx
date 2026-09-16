/* eslint-disable */
import {Route} from '@/routes/_app/_event/events.$id';
import React, {useState, useMemo} from 'react';
import {FiEdit} from 'react-icons/fi';
import {MdDelete} from 'react-icons/md';
import {IoMdCheckmark} from 'react-icons/io';
import {RxCross2} from 'react-icons/rx';
import {
  useAddTransport,
  useGetTransport,
  useDeleteTransport,
  useGetVehicles,
  useUpdateTransport,
} from '@/lib/react-query/queriesAndMutations/cateror/eventsummary';

// Types matches your backend requirements
type TransportPayload = {
  type: 'OWN' | 'RENTAL';
  vendorName?: string;
  vehicleNumber?: string;
  transportId?: string; // For OWN vehicle reference
  trip?: number;
  distance?: number;
  total: number;
  isPaid?: boolean;
};

const TransportForm = () => {
  const {id} = Route.useParams();
  const eventId = id as string;

  // --- Queries & Mutations ---
  const {mutate: addTransport} = useAddTransport(eventId);
  const {data: transportData} = useGetTransport(eventId);
  const {mutate: deleteTransport} = useDeleteTransport();
  const {mutate: updateTransport} = useUpdateTransport();
  const {data: vehiclesData} = useGetVehicles();

  // --- State ---
  const [addingType, setAddingType] = useState<'RENTAL' | 'OWN' | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Unified Form State for both Add and Edit
  const [formData, setFormData] = useState<Partial<TransportPayload>>({
    vendorName: '',
    vehicleNumber: '',
    transportId: '',
    trip: 1,
    distance: 0,
    total: 0,
  });

  // --- Derived Data ---
  const transportsArray = Array.isArray(transportData)
    ? transportData
    : (transportData?.data ?? []);

  const rentalList = transportsArray.filter((t: any) => t.type === 'RENTAL');
  const ownList = transportsArray.filter((t: any) => t.type === 'OWN');

  // --- Helpers ---

  // Calculate total for OWN vehicles: (Fuel/Km * Distance * Trip)
  const calculateOwnTotal = (
    vId: string | undefined,
    dist: number,
    trp: number,
  ) => {
    if (!vId) return 0;
    const vehicle = vehiclesData?.find((v: any) => v.id === vId);
    const rate = vehicle?.fuelPerKm || 0;
    return rate * (dist || 0) * (trp || 0);
  };

  const resetForm = () => {
    setAddingType(null);
    setEditingId(null);
    setFormData({
      vendorName: '',
      vehicleNumber: '',
      transportId: '',
      trip: 1,
      distance: 0,
      total: 0,
    });
  };

  // --- Handlers ---

  const handleEditClick = (item: any) => {
    setEditingId(item.id);
    setAddingType(null); // Ensure we aren't adding
    setFormData({
      vendorName: item.vendorName,
      vehicleNumber: item.vehicleNumber,
      transportId: item.transportId || item.transport?.id, // Handle populated object or ID
      trip: item.trip,
      distance: item.distance,
      total: item.total,
    });
  };

  const handleSave = (type: 'RENTAL' | 'OWN') => {
    // Validation
    if (type === 'RENTAL') {
      if (
        !formData.vendorName ||
        !formData.vehicleNumber ||
        (formData.total ?? 0) < 0
      ) {
        alert('Please fill Vendor Name, Vehicle Number and valid Rent.');
        return;
      }
    } else {
      if (
        !formData.transportId ||
        (formData.distance ?? 0) <= 0 ||
        (formData.trip ?? 0) <= 0
      ) {
        alert('Please select a Vehicle and enter valid Distance/Trips.');
        return;
      }
    }

    const payload: TransportPayload = {
      type,
      total: Number(formData.total),
      ...(type === 'RENTAL'
        ? {
            vendorName: formData.vendorName,
            vehicleNumber: formData.vehicleNumber,
          }
        : {
            transportId: formData.transportId,
            trip: Number(formData.trip),
            distance: Number(formData.distance),
          }),
    };

    if (editingId) {
      updateTransport({id: editingId, data: payload});
    } else {
      addTransport(payload);
    }
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to remove this transport?')) {
      deleteTransport({id});
    }
  };

  const handlePaymentStatus = (id: string) => {
    if (window.confirm('Mark this transport as PAID?')) {
      updateTransport({id, data: {isPaid: true}});
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* ========================================================== */}
      {/* RENTAL TABLE                         */}
      {/* ========================================================== */}
      <div className="rounded-md border border-stroke bg-white dark:border-strokedark dark:bg-black">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stroke bg-blue-50 px-4 py-2 dark:border-strokedark dark:bg-black">
          <h3 className="font-semibold text-blue-900 dark:text-secondary">
            Rental Vehicles
          </h3>
          <button
            onClick={() => {
              resetForm();
              setAddingType('RENTAL');
            }}
            className="rounded px-3 py-1 text-sm font-bold text-blue-900 underline hover:text-blue-700 dark:text-secondary"
          >
            Add New
          </button>
        </div>

        {/* Content */}
        <div className="overflow-x-auto p-4">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left">Vendor Name</th>
                <th className="p-2 text-left">Vehicle Number</th>
                <th className="p-2 text-center">Rent (₹)</th>
                <th className="p-2 text-center">Payment</th>
                <th className="p-2 text-center">Actions</th>
              </tr>
            </thead>
            {/* UPDATED: Added bg-white to tbody */}
            <tbody className="bg-white dark:bg-black">
              {/* Add Row - RENTAL */}
              {addingType === 'RENTAL' && (
                <tr className="bg-blue-50 dark:bg-black">
                  <td className="p-2 dark:bg-black">
                    <input
                      type="text"
                      placeholder="Vendor Name"
                      value={formData.vendorName}
                      onChange={(e) =>
                        setFormData({...formData, vendorName: e.target.value})
                      }
                      className="w-full rounded border px-2 py-1 dark:bg-black"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="text"
                      placeholder="Vehicle No."
                      value={formData.vehicleNumber}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          vehicleNumber: e.target.value,
                        })
                      }
                      className="w-full rounded border px-2 py-1 dark:bg-black"
                    />
                  </td>
                  <td className="p-2 text-center">
                    <input
                      type="number"
                      placeholder="0"
                      value={formData.total}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          total: Number(e.target.value),
                        })
                      }
                      className="w-24 rounded border px-2 py-1 text-center dark:bg-black"
                    />
                  </td>
                  <td className="text-gray-500 p-2 text-center text-xs">
                    Pending
                  </td>
                  <td className="p-2 text-center">
                    <div className="flex justify-center gap-2">
                      <IoMdCheckmark
                        onClick={() => handleSave('RENTAL')}
                        className="h-5 w-5 cursor-pointer text-green-600"
                        title="Save"
                      />
                      <RxCross2
                        onClick={resetForm}
                        className="h-5 w-5 cursor-pointer text-red-600"
                        title="Cancel"
                      />
                    </div>
                  </td>
                </tr>
              )}

              {/* Data Rows - RENTAL */}
              {rentalList.length > 0
                ? rentalList.map((item: any) => {
                    const isEditing = editingId === item.id;
                    return (
                      <tr
                        key={item.id}
                        className="border-t border-stroke dark:border-strokedark"
                      >
                        <td className="p-2">
                          {isEditing ? (
                            <input
                              value={formData.vendorName}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  vendorName: e.target.value,
                                })
                              }
                              className="w-full rounded border px-2 py-1 dark:bg-black"
                            />
                          ) : (
                            item.vendorName
                          )}
                        </td>
                        <td className="p-2">
                          {isEditing ? (
                            <input
                              value={formData.vehicleNumber}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  vehicleNumber: e.target.value,
                                })
                              }
                              className="w-full rounded border px-2 py-1 dark:bg-black"
                            />
                          ) : (
                            item.vehicleNumber
                          )}
                        </td>
                        <td className="p-2 text-center">
                          {isEditing ? (
                            <input
                              type="number"
                              value={formData.total}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  total: Number(e.target.value),
                                })
                              }
                              className="w-24 rounded border px-2 py-1 text-center dark:bg-black"
                            />
                          ) : (
                            `₹${item.total}`
                          )}
                        </td>
                        <td className="p-2 text-center">
                          {item.isPaid ? (
                            <span className="rounded bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">
                              PAID
                            </span>
                          ) : (
                            <button
                              onClick={() => handlePaymentStatus(item.id)}
                              disabled={isEditing}
                              className="rounded border border-green-600 px-2 py-0.5 text-xs font-medium text-green-600 hover:bg-green-50 disabled:opacity-50"
                            >
                              Mark Paid
                            </button>
                          )}
                        </td>
                        <td className="p-2 text-center">
                          {isEditing ? (
                            <div className="flex justify-center gap-2">
                              <IoMdCheckmark
                                onClick={() => handleSave('RENTAL')}
                                className="h-4 w-4 cursor-pointer text-green-600"
                              />
                              <RxCross2
                                onClick={resetForm}
                                className="h-4 w-4 cursor-pointer text-red-600"
                              />
                            </div>
                          ) : (
                            <div className="flex justify-center gap-2">
                              {!item.isPaid && (
                                <FiEdit
                                  onClick={() => handleEditClick(item)}
                                  className="h-4 w-4 cursor-pointer text-graydark hover:text-blue-600 dark:text-gray-2"
                                />
                              )}
                              <MdDelete
                                onClick={() => handleDelete(item.id)}
                                className="h-4 w-4 cursor-pointer text-graydark hover:text-red-600 dark:text-gray-2"
                              />
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                : !addingType && (
                    <tr>
                      <td
                        colSpan={5}
                        className="text-gray-500 py-4 text-center text-sm dark:bg-black"
                      >
                        No rental vehicles assigned.
                      </td>
                    </tr>
                  )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================== */}
      {/* OWN TABLE                          */}
      {/* ========================================================== */}
      <div className="rounded-md border border-stroke bg-white dark:border-strokedark dark:bg-black">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stroke bg-blue-50 px-4 py-2 dark:border-strokedark dark:bg-black">
          <h3 className="font-semibold text-blue-900 dark:text-secondary">
            Own Vehicles
          </h3>
          <button
            onClick={() => {
              resetForm();
              setAddingType('OWN');
            }}
            className="rounded px-3 py-1 text-sm font-bold text-blue-900 underline hover:text-blue-700 dark:text-secondary"
          >
            Add New
          </button>
        </div>

        {/* Content */}
        <div className="overflow-x-auto p-4">
          <table className="w-full text-sm dark:bg-black">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left">Vehicle</th>
                <th className="p-2 text-center">Distance (Km)</th>
                <th className="p-2 text-center">Trip(s)</th>
                <th className="p-2 text-center">Total Dist.</th>
                <th className="p-2 text-center">Total Cost (₹)</th>
                <th className="p-2 text-center">Actions</th>
              </tr>
            </thead>
            {/* UPDATED: Added bg-white to tbody */}
            <tbody className="bg-white dark:bg-black">
              {/* Add Row - OWN */}
              {addingType === 'OWN' && (
                <tr className="bg-blue-50 dark:bg-black">
                  <td className="p-2 dark:bg-black">
                    <select
                      value={formData.transportId}
                      onChange={(e) => {
                        const newId = e.target.value;
                        const newTotal = calculateOwnTotal(
                          newId,
                          formData.distance || 0,
                          formData.trip || 0,
                        );
                        setFormData({
                          ...formData,
                          transportId: newId,
                          total: newTotal,
                        });
                      }}
                      className="w-full rounded border px-2 py-1 dark:bg-black"
                    >
                      <option value="">Select Vehicle</option>
                      {vehiclesData?.map((v: any) => (
                        <option key={v.id} value={v.id}>
                          {v.vehicleName} - {v.vehicleNumber} (₹{v.fuelPerKm}
                          /km)
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-2 text-center">
                    <input
                      type="number"
                      min="0"
                      value={formData.distance}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        const newTotal = calculateOwnTotal(
                          formData.transportId,
                          val,
                          formData.trip || 0,
                        );
                        setFormData({
                          ...formData,
                          distance: val,
                          total: newTotal,
                        });
                      }}
                      className="w-20 rounded border px-2 py-1 text-center dark:bg-black"
                    />
                  </td>
                  <td className="p-2 text-center">
                    <input
                      type="number"
                      min="1"
                      value={formData.trip}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        const newTotal = calculateOwnTotal(
                          formData.transportId,
                          formData.distance || 0,
                          val,
                        );
                        setFormData({...formData, trip: val, total: newTotal});
                      }}
                      className="w-16 rounded border px-2 py-1 text-center dark:bg-black"
                    />
                  </td>
                  <td className="p-2 text-center font-medium">
                    {(formData.distance || 0) * (formData.trip || 0)} Km
                  </td>
                  <td className="p-2 text-center font-bold">
                    ₹{formData.total?.toFixed(2)}
                  </td>
                  <td className="p-2 text-center">
                    <div className="flex justify-center gap-2">
                      <IoMdCheckmark
                        onClick={() => handleSave('OWN')}
                        className="h-5 w-5 cursor-pointer text-green-600"
                        title="Save"
                      />
                      <RxCross2
                        onClick={resetForm}
                        className="h-5 w-5 cursor-pointer text-red-600"
                        title="Cancel"
                      />
                    </div>
                  </td>
                </tr>
              )}

              {/* Data Rows - OWN */}
              {ownList.length > 0
                ? ownList.map((item: any) => {
                    const isEditing = editingId === item.id;
                    const vehicleInfo = item.transport || {}; // Safely access populated transport

                    return (
                      <tr
                        key={item.id}
                        className="border-t border-stroke dark:border-strokedark"
                      >
                        <td className="p-2">
                          {isEditing ? (
                            <select
                              value={formData.transportId}
                              onChange={(e) => {
                                const newId = e.target.value;
                                const newTotal = calculateOwnTotal(
                                  newId,
                                  formData.distance || 0,
                                  formData.trip || 0,
                                );
                                setFormData({
                                  ...formData,
                                  transportId: newId,
                                  total: newTotal,
                                });
                              }}
                              className="w-full rounded border px-2 py-1 dark:bg-black"
                            >
                              <option value="">Select Vehicle</option>
                              {vehiclesData?.map((v: any) => (
                                <option key={v.id} value={v.id}>
                                  {v.vehicleName} - {v.vehicleNumber}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span>
                              {vehicleInfo.vehicleName} -{' '}
                              {vehicleInfo.vehicleNumber}
                            </span>
                          )}
                        </td>
                        <td className="p-2 text-center">
                          {isEditing ? (
                            <input
                              type="number"
                              value={formData.distance}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                const newTotal = calculateOwnTotal(
                                  formData.transportId,
                                  val,
                                  formData.trip || 0,
                                );
                                setFormData({
                                  ...formData,
                                  distance: val,
                                  total: newTotal,
                                });
                              }}
                              className="w-20 rounded border px-2 py-1 text-center dark:bg-black"
                            />
                          ) : (
                            item.distance
                          )}
                        </td>
                        <td className="p-2 text-center">
                          {isEditing ? (
                            <input
                              type="number"
                              value={formData.trip}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                const newTotal = calculateOwnTotal(
                                  formData.transportId,
                                  formData.distance || 0,
                                  val,
                                );
                                setFormData({
                                  ...formData,
                                  trip: val,
                                  total: newTotal,
                                });
                              }}
                              className="w-16 rounded border px-2 py-1 text-center dark:bg-black"
                            />
                          ) : (
                            item.trip
                          )}
                        </td>
                        <td className="p-2 text-center font-medium">
                          {isEditing
                            ? (formData.distance || 0) * (formData.trip || 0)
                            : (item.distance || 0) * (item.trip || 0)}{' '}
                          Km
                        </td>
                        <td className="p-2 text-center font-bold">
                          ₹
                          {isEditing
                            ? formData.total?.toFixed(2)
                            : item.total?.toFixed(2)}
                        </td>
                        <td className="p-2 text-center">
                          {isEditing ? (
                            <div className="flex justify-center gap-2">
                              <IoMdCheckmark
                                onClick={() => handleSave('OWN')}
                                className="h-4 w-4 cursor-pointer text-green-600"
                              />
                              <RxCross2
                                onClick={resetForm}
                                className="h-4 w-4 cursor-pointer text-red-600"
                              />
                            </div>
                          ) : (
                            <div className="flex justify-center gap-2">
                              <FiEdit
                                onClick={() => handleEditClick(item)}
                                className="h-4 w-4 cursor-pointer text-graydark hover:text-blue-600 dark:text-gray-2"
                              />
                              <MdDelete
                                onClick={() => handleDelete(item.id)}
                                className="h-4 w-4 cursor-pointer text-graydark hover:text-red-600 dark:text-gray-2"
                              />
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                : !addingType && (
                    <tr>
                      <td
                        colSpan={6}
                        className="text-gray-500 py-4 text-center text-sm dark:bg-black"
                      >
                        No own vehicles assigned.
                      </td>
                    </tr>
                  )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TransportForm;
