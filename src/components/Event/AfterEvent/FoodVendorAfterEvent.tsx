/* eslint-disable */
import {useState} from 'react';
import {RiWhatsappFill} from 'react-icons/ri';
import {useGetShareDataBySubeventId} from '@/lib/react-query/queriesAndMutations/cateror/event';

type FoodVendorAfterEventData = {
  id: string;
  VendorName: string;
  DishName: string;
  dishId: string;
  OrderQuantity: number;
  ActualQuantity: number;
  Price: number;
  Total: number;
  PaidAmount: number;
  PendingAmount: number;
  preperation: number;
  unit: string;
  difference: number;
  phoneNumber?: string;
};

const FoodVendorAfterEvent = ({costingData, selectedSubEvent}: any) => {
  const {data: subData} = useGetShareDataBySubeventId(
    selectedSubEvent! as string,
  );

  // LOCAL STATE TABLE
  const [tableData, setTableData] = useState<FoodVendorAfterEventData[]>(
    costingData?.foodVendor?.map((item: any) => ({
      id: item.id,
      VendorName: item.VendorName || 'N/A',
      DishName: item.DishName,
      dishId: item.dishId,
      OrderQuantity: Number(item.OrderQuantity || 0),
      ActualQuantity: Number(item.ActualQuantity || 0),
      Price: item.Price || 0,
      PaidAmount: item.PaidAmount || 0,
      PendingAmount: item.PendingAmount || 0,
      preperation: item.preperation || 0,
      unit: item.unit,
      Total: Number(item.ActualQuantity || 0) * (item.Price || 0),
      difference:
        Number(item.OrderQuantity || 0) - Number(item.ActualQuantity || 0),
      phoneNumber: item.phoneNumber,
    })) || [],
  );

  // HANDLE CHANGE
  const handleActualQtyChange = (index: number, newValue: number) => {
    setTableData((prev) => {
      const updated = [...prev];
      const row = updated[index];

      row.ActualQuantity = newValue;
      row.Total = newValue * row.Price;
      row.difference = row.OrderQuantity - newValue;

      return updated;
    });
  };

  return (
    <>
      <div className="rounded border border-stroke p-4 dark:border-strokedark">
        <h2 className="mb-3 text-lg font-semibold">Food Vendors</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-200 text-left dark:bg-meta-4">
                <th className="px-3 py-2">Vendor</th>
                <th className="px-3 py-2">Dish</th>
                <th className="px-3 py-2">Order Qty</th>
                <th className="px-3 py-2">Actual Qty</th>
                <th className="px-3 py-2">Difference</th>
                <th className="px-3 py-2">Price</th>
                <th className="px-3 py-2">Total</th>
                <th className="px-3 py-2">Paid Amount</th>
                <th className="px-3 py-2">Pending Amount</th>
                <th className="px-3 py-2">Share</th>
              </tr>
            </thead>

            <tbody>
              {tableData.map((row, i) => (
                <tr key={row.id} className="border-b dark:border-strokedark">
                  <td className="px-3 py-2">{row.VendorName}</td>
                  <td className="px-3 py-2">{row.DishName}</td>
                  <td className="px-3 py-2">{row.OrderQuantity}</td>

                  {/* Editable Actual Quantity */}
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      value={row.ActualQuantity}
                      onChange={(e) =>
                        handleActualQtyChange(i, Number(e.target.value))
                      }
                      className="w-full rounded-md border border-stroke px-2 py-1 dark:border-strokedark dark:bg-black"
                    />
                  </td>

                  <td className="px-3 py-2">{row.difference}</td>
                  <td className="px-3 py-2">{row.Price}</td>
                  <td className="px-3 py-2">{row.Total}</td>
                  <td className="px-3 py-2">{row.PaidAmount}</td>
                  <td className="px-3 py-2">{row.PendingAmount}</td>

                  {/* Share Button */}
                  <td className="px-3 py-2">
                    <a
                      href={`https://wa.me/${row.phoneNumber}?text=${encodeURIComponent(
                        [
                          `=== Event Details ===`,
                          subData?.event?.name &&
                            `Event: ${subData.event.name}`,
                          subData?.name && `SubEvent: ${subData.name}`,
                          subData?.address && `Address: ${subData.address}`,

                          `\n=== Vendor Assignment ===`,
                          `Vendor: ${row.VendorName}`,
                          `Dish: ${row.DishName}`,
                          `Order: ${row.OrderQuantity} ${row.unit}`,
                          `Actual: ${row.ActualQuantity} ${row.unit}`,
                          row.preperation && `Prepare For: ${row.preperation}`,
                          `Total: ₹${row.Total}`,
                        ]
                          .filter(Boolean)
                          .join('\n'),
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-green-500 hover:text-green-600"
                    >
                      <RiWhatsappFill size={18} />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default FoodVendorAfterEvent;
