/* eslint-disable */
import React, {useState, useMemo, useEffect} from 'react';
import {useGetTransport, useUpdateTransport} from './costingHelper';
import {Route} from '@/routes/_app/_event/events.$id';
import {FiEdit, FiCheck} from 'react-icons/fi';
import {MdDelete} from 'react-icons/md';
import {IoMdCheckmark} from 'react-icons/io';
import {RxCross2} from 'react-icons/rx';

interface RentalVehicle {
  id: string | number;
  vendorName: string;
  vehicleNumber: string;
  rent: number | string;
}

interface OwnVehicle {
  id: string | number;
  vehicleNumber: string;
  distance: number | string;
  trip: number | string;
  totalDistance: number | string;
  fuelPerKm: number | string;
  totalAmount: number | string;
}

const Transport: React.FC = () => {
  const {id: eventId} = Route.useParams();
  const {data = []} = useGetTransport(eventId);
  const {mutateAsync: updateTransport} = useUpdateTransport();

  /* ---------------- STATE FOR EDIT MODE ---------------- */
  const [editingRentId, setEditingRentId] = useState<string | null>(null);
  const [newRent, setNewRent] = useState<number | string>('');

  // For Own Vehicle Editable Fields
  const [editingOwnId, setEditingOwnId] = useState<string | null>(null);
  const [editedOwnVehicle, setEditedOwnVehicle] = useState<any>({
    distance: '',
    trip: '',
    totalDistance: '',
    fuelPerKm: '',
    totalAmount: '',
  });

  /* ---------------- ONLY DATA TRANSFORMATION ---------------- */
  const rentalVehicles: RentalVehicle[] = useMemo(
    () =>
      data
        .filter((item: any) => item.type === 'RENTAL')
        .map((item: any) => ({
          id: item.id,
          vendorName: item.vendorName ?? '-',
          vehicleNumber: item.vehicleNumber ?? '-',
          rent: item.actualTotal ? item.actualTotal : (item.total ?? 0),
        })),
    [data],
  );

  const ownVehicles: OwnVehicle[] = useMemo(
    () =>
      data
        .filter((item: any) => item.type === 'OWN')
        .map((item: any) => ({
          id: item.id,
          vehicleNumber:
            item.transport?.vehicleNumber ?? item.vehicleNumber ?? '-',
          distance: item.actualDistance
            ? item.actualDistance
            : (item.distance ?? 0),
          trip: item.actualTrip ? item.actualTrip : (item.trip ?? 0),
          totalDistance:
            item.actualDistance ??
            (item.distance && item.trip ? item.distance * item.trip : 0),
          fuelPerKm: item?.transport?.fuelPerKm ?? '-',
          totalAmount: item?.actualTotal
            ? item?.actualTotal
            : (item.total ?? 0),
        })),
    [data],
  );

  // Update Own Vehicle Mutation
  const handleOwnVehicleUpdate = async (vehicleId: string | number) => {
    await updateTransport({
      id: vehicleId,
      data: {
        actualDistance: Number(editedOwnVehicle.distance),
        actualTrip: Number(editedOwnVehicle.trip),
        totalDistance: Number(editedOwnVehicle.totalDistance),
        fuelPerKm: Number(editedOwnVehicle.fuelPerKm),
        actualTotal: Number(editedOwnVehicle.totalAmount),
      },
    });
    setEditingOwnId(null); // Exit edit mode
  };

  // Live calculation for totalDistance and totalAmount
  useEffect(() => {
    if (editedOwnVehicle.distance && editedOwnVehicle.trip) {
      const totalDistance =
        Number(editedOwnVehicle.distance) * Number(editedOwnVehicle.trip);
      setEditedOwnVehicle((prev) => ({
        ...prev,
        totalDistance: totalDistance.toString(),
        totalAmount: (
          totalDistance * Number(editedOwnVehicle.fuelPerKm)
        ).toString(),
      }));
    }
  }, [editedOwnVehicle.distance, editedOwnVehicle.trip]);

  useEffect(() => {
    if (editedOwnVehicle.totalDistance && editedOwnVehicle.fuelPerKm) {
      const totalAmount =
        Number(editedOwnVehicle.totalDistance) *
        Number(editedOwnVehicle.fuelPerKm);
      setEditedOwnVehicle((prev) => ({
        ...prev,
        totalAmount: totalAmount.toString(),
      }));
    }
  }, [editedOwnVehicle.totalDistance, editedOwnVehicle.fuelPerKm]);

  return (
    <div className="flex flex-col gap-6">
      {/* ========================================================== */}
      {/* RENTAL TABLE                         */}
      {/* ========================================================== */}
      <div className="rounded-md border border-stroke bg-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stroke bg-blue-50 px-4 py-2 dark:border-strokedark">
          <h3 className="font-semibold text-blue-900">Rental Vehicles</h3>
        </div>

        {/* Content */}
        <div className="overflow-x-auto bg-white p-4 dark:border-strokedark dark:bg-black dark:text-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 dark:border-strokedark dark:bg-black dark:text-white">
              <tr>
                <th className="p-2 text-left">Vendor Name</th>
                <th className="p-2 text-left">Vehicle Number</th>
                <th className="p-2 text-center">Rent (₹)</th>
                <th className="p-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:border-strokedark dark:bg-meta-4 dark:text-white">
              {/* Data Rows - RENTAL */}
              {rentalVehicles.length > 0 ? (
                rentalVehicles.map((vehicle) => {
                  const isEditing = editingRentId === vehicle.id;
                  return (
                    <tr
                      key={vehicle.id}
                      className="border-t border-stroke dark:border-strokedark"
                    >
                      <td className="p-2">{vehicle.vendorName}</td>
                      <td className="p-2">{vehicle.vehicleNumber}</td>
                      <td className="p-2 text-center">
                        {isEditing ? (
                          <input
                            type="number"
                            value={newRent || vehicle.rent}
                            onChange={(e) => setNewRent(e.target.value)}
                            className="w-24 rounded border px-2 py-1 text-center dark:border-strokedark dark:bg-meta-4 dark:text-white"
                          />
                        ) : (
                          `₹${vehicle.rent}`
                        )}
                      </td>
                      <td className="p-2 text-center">
                        {isEditing ? (
                          <div className="flex justify-center gap-2">
                            <IoMdCheckmark
                              onClick={async () => {
                                await updateTransport({
                                  id: vehicle.id,
                                  data: {
                                    actualTotal: Number(newRent),
                                  },
                                });
                                setEditingRentId(null);
                              }}
                              className="h-4 w-4 cursor-pointer text-green-600"
                              title="Save"
                            />
                            <RxCross2
                              onClick={() => setEditingRentId(null)}
                              className="h-4 w-4 cursor-pointer text-red-600"
                              title="Cancel"
                            />
                          </div>
                        ) : (
                          <div className="flex justify-center gap-2">
                            <FiEdit
                              onClick={() => {
                                setEditingRentId(vehicle.id);
                                setNewRent(vehicle.rent);
                              }}
                              className="h-4 w-4 cursor-pointer text-graydark hover:text-blue-600 dark:text-gray-2"
                              title="Edit"
                            />
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="text-gray-500 py-4 text-center text-sm"
                  >
                    No rental vehicles added
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
      <div className="rounded-md border border-stroke bg-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stroke bg-blue-50 px-4 py-2 dark:border-strokedark">
          <h3 className="font-semibold text-blue-900">Own Vehicles</h3>
        </div>

        {/* Content */}
        <div className="overflow-x-auto bg-white p-4 dark:border-strokedark dark:bg-black dark:text-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 dark:border-strokedark dark:bg-black dark:text-white">
              <tr>
                <th className="p-2 text-left">Vehicle Number</th>
                <th className="p-2 text-center">Distance (Km)</th>
                <th className="p-2 text-center">Trip(s)</th>
                <th className="p-2 text-center">Total Dist.</th>
                <th className="p-2 text-center">Fuel Per Km</th>
                <th className="p-2 text-center">Total Cost (₹)</th>
                <th className="p-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:border-strokedark dark:bg-meta-4 dark:text-white">
              {/* Data Rows - OWN */}
              {ownVehicles.length > 0 ? (
                ownVehicles.map((vehicle) => {
                  const isEditing = editingOwnId === vehicle.id;
                  return (
                    <tr
                      key={vehicle.id}
                      className="border-t border-stroke dark:border-strokedark"
                    >
                      <td className="p-2">{vehicle.vehicleNumber}</td>
                      <td className="p-2 text-center">
                        {isEditing ? (
                          <input
                            type="number"
                            value={
                              editedOwnVehicle.distance || vehicle.distance
                            }
                            onChange={(e) =>
                              setEditedOwnVehicle({
                                ...editedOwnVehicle,
                                distance: e.target.value,
                              })
                            }
                            className="w-20 rounded border px-2 py-1 text-center dark:bg-black"
                          />
                        ) : (
                          vehicle.distance
                        )}
                      </td>
                      <td className="p-2 text-center">
                        {isEditing ? (
                          <input
                            type="number"
                            value={editedOwnVehicle.trip || vehicle.trip}
                            onChange={(e) =>
                              setEditedOwnVehicle({
                                ...editedOwnVehicle,
                                trip: e.target.value,
                              })
                            }
                            className="w-16 rounded border px-2 py-1 text-center dark:bg-black"
                          />
                        ) : (
                          vehicle.trip
                        )}
                      </td>
                      <td className="p-2 text-center font-medium">
                        {isEditing
                          ? editedOwnVehicle.totalDistance
                          : vehicle.totalDistance}{' '}
                        Km
                      </td>
                      <td className="p-2 text-center">{vehicle.fuelPerKm}</td>
                      <td className="p-2 text-center font-bold">
                        ₹
                        {isEditing
                          ? editedOwnVehicle.totalAmount
                          : vehicle.totalAmount}
                      </td>
                      <td className="p-2 text-center">
                        {isEditing ? (
                          <div className="flex justify-center gap-2">
                            <IoMdCheckmark
                              onClick={() => handleOwnVehicleUpdate(vehicle.id)}
                              className="h-4 w-4 cursor-pointer text-green-600"
                              title="Save"
                            />
                            <RxCross2
                              onClick={() => setEditingOwnId(null)}
                              className="h-4 w-4 cursor-pointer text-red-600"
                              title="Cancel"
                            />
                          </div>
                        ) : (
                          <div className="flex justify-center gap-2">
                            <FiEdit
                              onClick={() => {
                                setEditingOwnId(vehicle.id);
                                setEditedOwnVehicle({
                                  distance: vehicle.distance,
                                  trip: vehicle.trip,
                                  totalDistance: vehicle.totalDistance,
                                  fuelPerKm: vehicle.fuelPerKm,
                                  totalAmount: vehicle.totalAmount,
                                });
                              }}
                              className="h-4 w-4 cursor-pointer text-graydark hover:text-blue-600 dark:text-gray-2"
                              title="Edit"
                            />
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="text-gray-500 py-4 text-center text-sm"
                  >
                    No own vehicles added
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

export default Transport;
