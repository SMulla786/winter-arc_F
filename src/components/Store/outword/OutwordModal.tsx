import React from 'react';
import {FiX} from 'react-icons/fi';
import GenericTable from '../../Forms/Table/GenericTable';
import {Outword} from '../types';
import {formatIST} from '../helpers';
import {itemColumns} from './columns';

interface OutwordModalProps {
  selectedOutword: Outword;
  onClose: () => void;
}

const OutwordModal: React.FC<OutwordModalProps> = ({
  selectedOutword,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black bg-opacity-50 p-4">
      <div className="my-8 max-h-[90vh] w-full max-w-6xl overflow-hidden overflow-y-auto rounded-lg bg-white shadow-xl">
        <div className="sticky top-0 z-50 flex items-center justify-between border-b border-stroke bg-white px-6 py-4 shadow-sm">
          <div>
            <h3 className="text-gray-800 text-lg font-semibold">
              Outword Details
            </h3>
            <p className="text-gray-600 mt-1 text-sm">
              {selectedOutword.type.toLowerCase() === 'wastage'
                ? 'Wastage'
                : selectedOutword.event
                  ? `${selectedOutword.event.name} – ${formatIST(selectedOutword.event.startDate, 'dd MMM yyyy')}`
                  : selectedOutword.poNumber
                    ? `PO #${selectedOutword.poNumber}`
                    : 'General Outword'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            <FiX />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="bg-gray-50 rounded-lg border border-stroke p-4">
              <h4 className="text-gray-700 mb-2 text-sm font-medium">
                Outword Information
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">
                    {formatIST(selectedOutword.createdAt)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span className="font-medium capitalize">
                    {selectedOutword.type.toLowerCase()}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg border border-stroke p-4">
              <h4 className="text-gray-700 mb-2 text-sm font-medium">
                Items Summary
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Items:</span>
                  <span className="font-medium">
                    {selectedOutword.inventoryItem.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Categories:</span>
                  <span className="font-medium">
                    {
                      Array.from(
                        new Set(
                          selectedOutword.inventoryItem.map(
                            (item) =>
                              item.material?.category?.name || 'Unknown',
                          ),
                        ),
                      ).length
                    }
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg border border-stroke p-4">
              <h4 className="text-gray-700 mb-2 text-sm font-medium">
                Financial Summary
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Value:</span>
                  <span className="font-medium text-green-700">
                    ₹
                    {selectedOutword.inventoryItem
                      .reduce(
                        (sum, item) => sum + item.quantity * item.price,
                        0,
                      )
                      .toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {selectedOutword.inventoryItem.length === 0 ? (
            <div className="rounded-lg border border-stroke py-12 text-center">
              <p className="text-gray-500">
                No items recorded for this outword.
              </p>
            </div>
          ) : (
            <div className="rounded-lg border border-stroke">
              <div className="bg-gray-50 border-b border-stroke px-6 py-4">
                <h4 className="text-gray-800 font-medium">Items List</h4>
              </div>
              <div className="max-h-[400px] overflow-y-auto">
                <GenericTable
                  data={selectedOutword.inventoryItem}
                  columns={itemColumns}
                  paginationOff={true}
                  searchAble={false}
                  action={false}
                />
              </div>

              <div className="bg-gray-50 sticky bottom-0 border-t border-stroke px-6 py-4">
                <div className="flex justify-between">
                  <span className="text-gray-800 font-semibold">
                    Grand Total:
                  </span>
                  <span className="text-lg font-bold text-green-700">
                    ₹
                    {selectedOutword.inventoryItem
                      .reduce(
                        (sum, item) => sum + item.quantity * item.price,
                        0,
                      )
                      .toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-stroke px-6 py-4">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="bg-gray-200 text-gray-700 hover:bg-gray-300 rounded px-4 py-2 font-medium transition duration-300 ease-in-out"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OutwordModal;
