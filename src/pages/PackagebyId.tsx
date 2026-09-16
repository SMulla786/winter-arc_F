/* eslint-disable */
import React from 'react';
import {useParams, useNavigate} from '@tanstack/react-router';
import {useGetPackageById} from '@/lib/react-query/package/displaypackage';
import GenericTable, {Column} from '@/components/Forms/Table/GenericTable';
import {BiArrowBack} from 'react-icons/bi';

type MainDishRow = {
  categoryName: string;
  dishName: string;
  count: number;
};

type ExtraDishRow = {
  dishName: string;
  cost: number;
};

const PackageById: React.FC = () => {
  const navigate = useNavigate();
  const {id} = useParams({from: '/_app/packages/packagedata/$id'}) as {
    id: string;
  };
  const {data, isLoading, isError, error} = useGetPackageById(id);
  console.log('dataaaaaaaaaaa', data);

  if (isLoading) return <div className="p-4 text-white">Loading...</div>;
  if (isError)
    return <div className="p-4 text-red-600">Error: {error.message}</div>;
  const mainDishRows: MainDishRow[] =
    data?.packageDishes?.map((category: any) => {
      const dishNames = category.dishes
        .map((dish: any) => dish.dishName)
        .join(', ');

      return {
        categoryName: category.categoryName,
        dishName: dishNames,
        count: category.count ?? 1,
      };
    }) || [];

  const extraDishRows: ExtraDishRow[] =
    data?.extraDishes?.map((extra: any) => ({
      dishName: extra.dish?.name || 'N/A',
      cost: extra.cost,
    })) || [];

  const mainDishColumns: Column<MainDishRow>[] = [
    {header: 'Category', accessor: 'categoryName'},
    {header: 'Dishes', accessor: 'dishName'},
    {header: 'Total Count', accessor: 'count'},
  ];

  const extraDishColumns: Column<ExtraDishRow>[] = [
    {header: 'Dish Name', accessor: 'dishName'},
    {header: 'Cost (₹)', accessor: 'cost'},
  ];

  return (
    <div className="p-6 text-black dark:text-white">
      {/* Back Button */}
      <button
        onClick={() => navigate({to: '/packages/displaypackage'})}
        className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 mb-4 flex items-center gap-2 rounded px-4 py-2 text-sm font-medium text-black dark:text-white"
      >
        <BiArrowBack className="text-lg" /> Back to Package List
      </button>

      <h1 className="mb-4 text-2xl font-bold">Package Detail</h1>
      <p>
        <strong>Name:</strong> {data?.name}
      </p>
      <p>
        <strong>Price:</strong> ₹{data?.packageRange?.[0]?.price || 'N/A'}
      </p>

      <h2 className="mb-2 mt-6 text-xl font-semibold">Main Dishes</h2>
      <GenericTable
        title="Main Dish Details"
        data={mainDishRows}
        columns={mainDishColumns}
        paginationOff
      />

      <h2 className="mb-2 mt-6 text-xl font-semibold">Extra Dishes</h2>
      <GenericTable
        title="Extra Dish Details"
        data={extraDishRows}
        columns={extraDishColumns}
        paginationOff
      />
    </div>
  );
};

export default PackageById;
