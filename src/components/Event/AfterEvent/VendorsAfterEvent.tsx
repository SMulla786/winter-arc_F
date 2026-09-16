import {useGetCostingData} from '@/lib/react-query/queriesAndMutations/cateror/costing';
import React from 'react';
import FoodVendorAfterEvent from './FoodVendorAfterEvent';
import ManPowerVendorAfterEvent from '../ManPowerVendor';

const VendorsAfterEvent = ({activeTab}: {activeTab: string}) => {
  const {data: costingData} = useGetCostingData(activeTab);
  console.log('costingData', costingData);

  return (
    <div className="mt-6 space-y-8">
      <FoodVendorAfterEvent
        costingData={costingData}
        selectedSubEvent={activeTab}
      />
      <ManPowerVendorAfterEvent costingData={costingData} />
    </div>
  );
};

export default VendorsAfterEvent;
