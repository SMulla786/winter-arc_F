/* eslint-disable  */
import {useGetRawMaterialsCateror} from '@/lib/react-query/queriesAndMutations/cateror/dish';
import {useAddRawMaterialcaterorPrice} from '@/lib/react-query/queriesAndMutations/cateror/rawmaterialprice';
import {useNavigate} from '@tanstack/react-router';
import {useState, useEffect} from 'react';
import {Loader} from '../Loader/Loader';

type RawMaterial = {
  rawMaterialId: string;
  amount: number;
  inventory: number;
};

const AddPriceRawmaterial: React.FC = () => {
  const navigate = useNavigate();
  const {data: rawMaterial} = useGetRawMaterialsCateror();
  const {mutateAsync: addRawMaterialPrice, isPending} =
    useAddRawMaterialcaterorPrice();

  const [prices, setPrices] = useState<Record<string, number>>({});
  const [inventories, setInventories] = useState<Record<string, number>>({});
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [categories, setCategories] = useState<string[]>([]);
  const [filteredMaterials, setFilteredMaterials] = useState<any[]>([]);

  // Process raw materials data and extract unique categories
  useEffect(() => {
    if (rawMaterial?.data?.rawMaterials) {
      const materials = rawMaterial.data.rawMaterials
        .map((item: any) => ({
          id: item.id,
          name: item.name,
          category: item.category.name,
          unit: item.unit,
          amount: item.amount,
          inventory: item.inventory,
        }))
        .sort((a: any, b: any) => a.name.localeCompare(b.name));

      // Extract unique categories
      const uniqueCategories = [
        'All',
        ...(Array.from(
          new Set(materials.map((item: any) => item.category)),
        ) as string[]),
      ];
      setCategories(uniqueCategories);
      setFilteredMaterials(materials);
    }
  }, [rawMaterial]);

  // Filter materials when category changes
  useEffect(() => {
    if (rawMaterial?.data?.rawMaterials) {
      const materials = rawMaterial.data.rawMaterials
        .map((item: any) => ({
          id: item.id,
          name: item.name,
          category: item.category.name,
          unit: item.unit,
          amount: item.amount,
          inventory: item.inventory,
        }))
        .sort((a: any, b: any) => a.name.localeCompare(b.name));

      if (selectedCategory === 'All') {
        setFilteredMaterials(materials);
      } else {
        setFilteredMaterials(
          materials.filter((item: any) => item.category === selectedCategory),
        );
      }
    }
  }, [selectedCategory, rawMaterial]);

  const handlePriceChange = (id: string, value: number) => {
    setPrices((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleInventoryChange = (id: string, value: number) => {
    setInventories((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSavePrices = async () => {
    const pricesArray = filteredMaterials.map((item) => {
      const usedQty = Number(inventories[item.id] || 0);

      return {
        rawMaterialId: item.id,
        amount: Number(prices[item.id] ?? item.amount),
        inventory: item.inventory - usedQty,
      };
    });

    try {
      await addRawMaterialPrice(pricesArray);

      const updatedMaterials = filteredMaterials.map((item) => {
        const usedQty = Number(inventories[item.id] || 0);

        return {
          ...item,
          amount: Number(prices[item.id] ?? item.amount),
          inventory: item.inventory - usedQty,
        };
      });

      setFilteredMaterials(updatedMaterials);

      setPrices({});
      setInventories({});
    } catch (error) {
      console.error('Error saving prices/inventory:', error);
    }
  };

  if (isPending) return <Loader />;

  return (
    <div className="">
      <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
        <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between">
          <h2 className="mb-4 text-xl font-bold md:mb-0">
            Raw Materials Pricing
          </h2>

          {/* Category Filter */}
          <div className="flex items-center">
            <label
              htmlFor="category-filter"
              className="text-gray-700 dark:text-gray-300 mr-2 text-sm font-medium"
            >
              Filter by Category:
            </label>
            <select
              id="category-filter"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded border border-stroke bg-transparent px-3 py-1 text-sm text-black shadow-sm focus:border-primary focus:ring-1 focus:ring-primary dark:border-strokedark dark:bg-form-input dark:text-white"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full table-auto text-sm">
            <thead className="bg-gray-2 text-left dark:bg-meta-4">
              <tr>
                <th className="px-4 py-3 font-medium text-black dark:text-white">
                  Raw Material Name
                </th>
                <th className="px-4 py-3 font-medium text-black dark:text-white">
                  Category
                </th>
                <th className="px-4 py-3 font-medium text-black dark:text-white">
                  Unit
                </th>
                <th className="px-4 py-3 font-medium text-black dark:text-white">
                  Inventory Price
                </th>
                <th className="px-4 py-3 font-medium text-black dark:text-white">
                  Inventory
                </th>
                <th className="px-4 py-3 font-medium text-black dark:text-white">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-2 dark:divide-strokedark">
              {filteredMaterials.length > 0 ? (
                filteredMaterials.map((item) => (
                  <tr key={item.id}>
                    <td className="whitespace-nowrap px-4 py-4 text-black dark:text-white">
                      {item.name}
                    </td>
                    <td className="text-gray-600 dark:text-gray-300 whitespace-nowrap px-4 py-4">
                      {item.category}
                    </td>
                    <td className="text-gray-600 dark:text-gray-300 whitespace-nowrap px-4 py-4">
                      {item.unit}
                    </td>

                    <td className="text-gray-600 dark:text-gray-300 whitespace-nowrap px-4 py-4">
                      {item.inventory}
                    </td>

                    <td className="whitespace-nowrap px-4 py-4">
                      <input
                        type="number"
                        min="0"
                        className="w-24 rounded border border-stroke bg-transparent px-2 py-1 text-sm text-black shadow-sm focus:border-primary focus:ring-1 focus:ring-primary dark:border-strokedark dark:bg-form-input dark:text-white"
                        value={inventories[item.id] ?? 0}
                        onChange={(e) =>
                          handleInventoryChange(
                            item.id,
                            parseFloat(e.target.value),
                          )
                        }
                      />
                    </td>

                    <td className="whitespace-nowrap px-4 py-4">
                      <input
                        type="number"
                        className="w-24 rounded border border-stroke bg-transparent px-2 py-1 text-sm text-black shadow-sm focus:border-primary focus:ring-1 focus:ring-primary dark:border-strokedark dark:bg-form-input dark:text-white"
                        value={prices[item.id] ?? item.amount}
                        onChange={(e) =>
                          handlePriceChange(item.id, parseFloat(e.target.value))
                        }
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="text-gray-500 dark:text-gray-400 px-4 py-4 text-center"
                  >
                    No raw materials found for the selected category
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <button
          onClick={handleSavePrices}
          className="inline-flex items-center rounded-md border border-transparent bg-primary px-8 py-3 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          disabled={isPending}
        >
          {isPending ? 'Saving...' : 'Save Prices'}
        </button>
      </div>
    </div>
  );
};

export default AddPriceRawmaterial;
