/*eslint-disable*/
import {languageId} from '@/lib/contants';
import {
  useAddUtensilsInventory,
  useGetUtensils,
} from '@/lib/react-query/queriesAndMutations/cateror/utensils';
import React, {useEffect, useState} from 'react';
import {Loader} from '../Loader/Loader';
import {useAuthContext} from '@/context/AuthContext';
import {useNavigate} from '@tanstack/react-router'; // ✅ import navigate

const UtensilsInventory = () => {
  const {user} = useAuthContext();
  const restriction = user?.employeeRestriction?.utensilsInventoryPage;
  const role = user?.role;
  const [inventories, setInventories] = useState<Record<string, number>>({});
  const [prices, setPrices] = useState<Record<string, number>>({});
  const navigate = useNavigate(); // ✅ for navigation

  const {
    data: utensilsApiData = [],
    error,
    isLoading,
  } = useGetUtensils(languageId || 'defaultLanguageId');

  const {mutateAsync: addUtensilsInventory, isPending} =
    useAddUtensilsInventory();

  const handleInventoryChange = (id: string, value: number) => {
    setInventories((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const grouped = Array.isArray(utensilsApiData?.data)
    ? Object.values(
        utensilsApiData?.data?.reduce((acc: any, item: any) => {
          const categoryId = item.category?.id || 'uncategorized';
          const categoryName = item.category?.name || 'Uncategorized';

          if (!acc[categoryId]) {
            acc[categoryId] = {
              categoryId,
              categoryName,
              items: [],
            };
          }

          acc[categoryId].items.push(item);
          return acc;
        }, {}),
      )
    : [];
  const [openCategoryId, setOpenCategoryId] = useState<string | null>(null);

  useEffect(() => {
    if (grouped.length > 0 && !openCategoryId) {
      setOpenCategoryId(grouped[0].categoryId);
    }
  }, [grouped, openCategoryId]);

  const handleSavePrices = async () => {
    const pricesArray = (utensilsApiData?.data ?? []).map((item) => ({
      utensilId: item.id,
      inventory: Number(inventories[item.id] ?? item.inventory),
    }));

    try {
      await addUtensilsInventory(pricesArray);
      setPrices({});
      setInventories({});
    } catch (error) {
      console.error('Error saving prices/inventory:', error);
    }
  };

  if (isLoading || isPending) return <Loader />;

  return (
    <div className="space-y-4">
      {/* Back button OUTSIDE main card */}
      <div className="mb-4">
        <button
          onClick={() => navigate({to: '/utensils'})}
          className="dark:text-gray-200 px-4 py-2 text-xl font-bold transition"
        >
          ← Back
        </button>
      </div>

      {/* Main card */}
      <div className="rounded-lg bg-white p-6 shadow dark:bg-black">
        <h2 className="mb-3 text-lg font-semibold">Utensils Inventory</h2>{' '}
        <div className="mb-6 overflow-x-auto">
          <div className="flex min-w-max flex-nowrap gap-3">
            {grouped?.map((group: any) => {
              const isSelected = openCategoryId === group.categoryId;

              return (
                <button
                  key={group.categoryId}
                  type="button"
                  onClick={() =>
                    setOpenCategoryId((prev) =>
                      prev === group.categoryId ? null : group.categoryId,
                    )
                  }
                  className={`whitespace-nowrap rounded border-b-2 px-4 py-2 text-sm transition-all duration-200 ${
                    isSelected
                      ? 'border-blue-600 bg-sky-100 text-blue-600 dark:border-blue-400 dark:bg-blue-900 dark:text-blue-400'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300 border-transparent hover:border-blue-300 hover:text-blue-500 dark:bg-meta-4 dark:text-white dark:hover:text-blue-300'
                  }`}
                >
                  {group.categoryName}
                </button>
              );
            })}
          </div>
        </div>
        {openCategoryId && (
          <div className="overflow-x-auto px-2">
            <div className="grid w-full grid-cols-2 gap-4 bg-neutral-100 p-3 py-2 text-sm font-semibold dark:bg-meta-4">
              <span>Name</span>
              <span>Inventory</span>
            </div>

            {grouped
              ?.find((group: any) => group.categoryId === openCategoryId)
              ?.items.map((item: any) => (
                <div
                  key={item.id}
                  className="grid w-full grid-cols-2 items-center gap-4 border-b border-stroke px-1 py-2 text-sm dark:border-strokedark"
                >
                  <span>{item.name}</span>

                  <input
                    type="number"
                    min={0}
                    className="w-24 rounded border border-stroke bg-transparent px-2 py-1 text-sm text-black shadow-sm focus:border-primary focus:ring-1 focus:ring-primary dark:border-strokedark dark:bg-form-input dark:text-white"
                    value={inventories[item.id] ?? item.inventory ?? 0}
                    onChange={(e) =>
                      handleInventoryChange(item.id, parseFloat(e.target.value))
                    }
                  />
                </div>
              ))}
          </div>
        )}
        {(role === 'CATEROR' || restriction === 'EDIT') && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleSavePrices}
              className="inline-flex items-center rounded-md border border-transparent bg-primary px-8 py-3 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Save Inventory
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UtensilsInventory;
