import {useState, useEffect} from 'react';
import {Link} from '@tanstack/react-router';
import ClickOutside from '../ClickOutside';
import {IoIosArrowDown} from 'react-icons/io';
import {useAuthContext} from '@/context/AuthContext';
import {useLogoutUser} from '@/lib/react-query/queriesAndMutations/auth';
import {QUERY_KEYS} from '@/lib/react-query/queryKeys';
import {useGetCaterorById} from '@/lib/react-query/queriesAndMutations/cateror/dish';
import UserOne from '../../assets/images/user/user-01.png';

const DropdownUser = () => {
  const {user, setToken} = useAuthContext();
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);

  // 🧩 Only call the API if role is CATEROR and caterorId exists
  const caterorId = user?.role === 'CATEROR' ? (user?.caterorId ?? '') : '';

  const {
    data: caterorData,
    isLoading,
    isError,
  } = useGetCaterorById(caterorId, {
    enabled: !!caterorId, // Prevents call if no caterorId
  });

  const {mutateAsync: logoutUser} = useLogoutUser();

  const handleSignOut = async () => {
    await logoutUser();
    setToken(null);
    localStorage.removeItem(QUERY_KEYS.TOKEN);
    localStorage.removeItem('languageId');
    localStorage.removeItem('caterorId');
    window.location.href = '/';
  };

  return (
    <ClickOutside onClick={() => setDropdownOpen(false)} className="relative">
      <Link
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-4"
      >
        <span className="h-12 w-20 overflow-hidden">
          {isLoading ? (
            <div className="bg-gray-300 h-12 w-12 animate-pulse" />
          ) : (
            <img
              src={caterorData?.data?.image || UserOne}
              alt="User"
              className="h-full w-full object-contain"
            />
          )}
        </span>

        <span className="hidden text-right lg:block">
          <span className="block text-sm font-medium text-black dark:text-white">
            {user?.username}
          </span>
          <span className="block text-xs">{user?.role}</span>
        </span>

        <IoIosArrowDown
          className="hidden fill-current sm:block"
          width={24}
          height={16}
        />
      </Link>

      {dropdownOpen && (
        <div className="absolute right-0 mt-4 flex w-40 flex-col rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <ul className="flex flex-col gap-5 border-stroke px-2 py-2 dark:border-strokedark">
            <li>
              <Link
                to="/users/profile"
                className="flex items-center gap-3.5 text-sm font-medium duration-300 ease-in-out hover:text-primary lg:text-base"
              >
                My Profile
              </Link>
            </li>
          </ul>

          <button
            onClick={handleSignOut}
            className="flex items-center gap-3.5 px-2 py-2 text-sm font-medium duration-300 ease-in-out hover:text-primary lg:text-base"
          >
            Log Out
          </button>
        </div>
      )}
    </ClickOutside>
  );
};

export default DropdownUser;
