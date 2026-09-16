import React from 'react';
import {FiX} from 'react-icons/fi';
import {LineItem} from '../types';
import GenericTable from '@/components/Forms/Table/GenericTable';

export function InwardModal({
  title = 'Details',
  onClose,
  items,
}: {
  title?: string;
  onClose: () => void;
  items: LineItem[];
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black bg-opacity-50 p-4">
      <div className="my-8 max-h-[90vh] w-full max-w-4xl overflow-hidden overflow-y-auto rounded-lg bg-white shadow-xl">
        <div className="sticky top-0 z-50 flex items-center justify-between border-b bg-white px-6 py-4">
          <div>
            <h3 className="text-gray-800 text-lg font-semibold">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            <FiX />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-4">
            <h4 className="text-sm font-semibold">Items</h4>
            <div className="mt-3">
              <GenericTable
                data={items}
                columns={[
                  {header: 'Material', accessor: 'name'},
                  {header: 'Qty', accessor: 'quantity'},
                  {header: 'Unit', accessor: 'unit'},
                  {header: 'Price', accessor: 'price'},
                ]}
                paginationOff
                searchAble={false}
              />
            </div>
          </div>
        </div>

        <div className="border-t px-6 py-4">
          <div className="flex justify-end">
            <button onClick={onClose} className="bg-gray-200 rounded px-4 py-2">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
