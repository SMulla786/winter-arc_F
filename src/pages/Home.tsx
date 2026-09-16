import React, {useEffect, useState} from 'react';
import {IoWalletSharp} from 'react-icons/io5';
import {FaDollarSign, FaShoppingBasket} from 'react-icons/fa';
import ExpiryDate from '@/components/Admin/ExpiryDate';
import StatCard from '@/components/Admin/StatCard';
import Loader from '@/components/common/Loader';
import {useAuthContext} from '@/context/AuthContext';
import {useGetCaterors} from '@/lib/react-query/queriesAndMutations/admin/cateror';
import {log} from 'console';

interface StatCardProps {
  amount: string;
  title: string;
  icon: React.ReactNode;
}

const Home: React.FC = () => {
  const {data, isSuccess, isError, isPending} = useGetCaterors();
  console.log('data', data);

  // console.log('Admin Daata :', data);
  const {user} = useAuthContext();
  // const {data: customer} = useGetCustomerById(id as string);

  const [statsData, setStatsData] = useState<StatCardProps[]>([]);
  const [showExtraBoxes, setShowExtraBoxes] = useState(false);

  useEffect(() => {
    if (isSuccess && data) {
      console.log('data', data);
      setStatsData([
        {
          title: 'Total Caterors',
          amount: `${data.data.totalCount}`,
          icon: <FaDollarSign className="text-2xl" />,
        },
        {
          title: 'Active Caterors',
          amount: `${data.data.activeCount}`,
          icon: <FaShoppingBasket className="text-2xl" />,
        },
      ]);
    }
  }, [isSuccess, data, isPending]);

  if (isError) {
    return <div>Error fetching data.</div>;
  }

  if (isPending) {
    return <Loader />;
  }

  const handleToggle = () => {
    setShowExtraBoxes(!showExtraBoxes);
  };

  const displayedStats = showExtraBoxes ? statsData : statsData.slice(0, 8);

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5">
        {displayedStats.map((stat, index) => (
          <StatCard
            amount={stat.amount}
            icon={stat.icon}
            title={stat.title}
            key={index}
          />
        ))}
      </div>

      {/* {!showExtraBoxes ? (
        <button
          onClick={handleToggle}
          className="mt-4 flex items-center text-blue-600"
        >
          <span>Show More</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className="ml-2 h-5 w-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      ) : (
        <button
          onClick={handleToggle}
          className="mt-4 flex items-center text-blue-600"
        >
          <span>Show Less</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className="ml-2 h-5 w-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 15l7-7 7 7"
            />
          </svg>
        </button>
      )} */}

      <div className="mt-4 grid h-full w-full grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-7.5 2xl:gap-7.5">
        <div className="col-span-12">
          <ExpiryDate />
        </div>
        {/* <div className="col-span-12">
          <TeamPerformance />
        </div> */}
      </div>
    </div>
  );
};

export default Home;
