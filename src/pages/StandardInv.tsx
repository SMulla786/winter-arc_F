import {useGetStadardInv} from '@/lib/react-query/queriesAndMutations/StandardInv/standardinv';
import React from 'react';

const StandardInv = () => {
  const usegetstandardinv = useGetStadardInv();
  console.log('getstandard data', usegetstandardinv);
  return (
    <div className="h-full w-full bg-white p-4">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-2">
          <span className="font-bold">Category</span>
          <span className="font-bold">Percentage</span>
        </div>

        {/* Categories */}
        <div className="flex items-start justify-between rounded border p-2">
          <div>
            <span className="font-medium">Raw Material:</span>
            <p className="text-gray-600 text-sm">Food Vendor(out Source)</p>
            <p className="text-gray-600 text-sm">
              Disposal And Washing Machine
            </p>
          </div>
          <input
            type="text"
            placeholder="28.00%"
            className="w-20 text-right font-bold text-blue-600"
          />
        </div>

        <div className="flex items-start justify-between rounded border p-2">
          <div>
            <span className="font-medium">Fuel:</span>
            <p className="text-gray-600 text-sm">Gas</p>
            <p className="text-gray-600 text-sm">Coal</p>
          </div>
          <input
            type="text"
            placeholder="3.00%"
            className="w-20 text-right font-bold text-blue-600"
          />
        </div>

        <div className="flex items-start justify-between rounded border p-2">
          <div>
            <span className="font-medium">Transportation:</span>
            <p className="text-gray-600 text-sm">Own</p>
            <p className="text-gray-600 text-sm">Rental</p>
          </div>
          <input
            type="text"
            placeholder="3.00%"
            className="w-20 text-right font-bold text-blue-600"
          />
        </div>

        <div className="flex items-start justify-between rounded border p-2">
          <div>
            <span className="font-medium">Labour:</span>
            <p className="text-gray-600 text-sm">Sidharaj</p>
            <p className="text-gray-600 text-sm">Food Vendor(cook)</p>
          </div>
          <input
            type="text"
            placeholder="15.00%"
            className="w-20 text-right font-bold text-blue-600"
          />
        </div>

        <div className="flex items-center justify-between rounded border p-2">
          <span className="font-medium">Additional Cost:</span>
          <input
            type="text"
            placeholder="1.00%"
            className="w-20 text-right font-bold text-blue-600"
          />
        </div>

        <div className="flex items-center justify-between rounded border p-2">
          <span className="font-medium">GOP:</span>
          <input
            type="text"
            placeholder="50.00%"
            className="w-20 text-right font-bold text-blue-600"
          />
        </div>

        {/* Total */}
        <div className="bg-gray-100 flex items-center justify-between rounded border p-3">
          <span className="font-bold">TOTAL:</span>
          <span className="font-bold text-green-600">100.00%</span>
        </div>
      </div>
    </div>
  );
};

export default StandardInv;
