import {FiMenu, FiX} from 'react-icons/fi';
import DarkModeSwitcher from './DarkModeSwitcher';
import DropdownNotification from './DropdownNotification';
import DropdownUser from './DropdownUser';
import {useAuthContext} from '@/context/AuthContext';

const Header = (props: {
  sidebarOpen: string | boolean | undefined;
  setSidebarOpen: (arg0: boolean) => void;
}) => {
  const {user} = useAuthContext();
  const showNotifications = user?.role !== 'ADMIN';

  return (
    <header className="sticky top-0 z-999 flex w-full bg-white drop-shadow-1 dark:bg-boxdark dark:drop-shadow-none">
      <div className="flex flex-grow items-center justify-between px-4 py-4 shadow-2 md:px-6 2xl:px-11">
        <div className="flex items-center gap-2 sm:gap-4 lg:hidden">
          {/* <!-- Hamburger Toggle BTN --> */}

          <button
            aria-controls="sidebar"
            onClick={(e) => {
              e.stopPropagation();
              props.setSidebarOpen(!props.sidebarOpen);
            }}
            className="z-99999 block rounded-sm border border-stroke bg-white p-1.5 shadow-sm dark:border-strokedark dark:bg-boxdark lg:hidden"
          >
            <span className="relative block h-5.5 w-5.5 cursor-pointer">
              {props.sidebarOpen ? (
                <FiX className="h-full w-full text-black dark:text-white" />
              ) : (
                <FiMenu className="h-full w-full text-black dark:text-white" />
              )}
            </span>
          </button>

          {/* <!-- Hamburger Toggle BTN --> */}

          {/* <Link className="block flex-shrink-0 lg:hidden" to="/">
            <img src={LogoIcon} alt="Logo" />
          </Link> */}
        </div>
        {/* Welcome message for medium devices and up */}
        <div className="hidden md:ml-4 md:flex md:flex-col md:items-start">
          <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
            Welcome
          </span>
          <span className="text-gray-800 max-w-xs truncate text-lg font-semibold dark:text-white">
            {user?.fullname || 'User'}
          </span>
        </div>

        <div className="hidden sm:block">
          <form action="https://formbold.com/s/unique_form_id" method="POST">
            <div className="relative">
              {/* <button className="absolute left-0 top-1/2 -translate-y-1/2">
                <LuSearch
                  className="hover:fill-primary dark:hover:fill-primary"
                  size={22}
                />
              </button>
              <input
                type="text"
                placeholder="Type to search..."
                className="w-full bg-transparent pl-9 pr-4 text-black focus:outline-none dark:text-white xl:w-125"
              /> */}
            </div>
          </form>
        </div>

        <div className="flex items-center gap-2 2xsm:gap-7">
          <ul className="flex items-center gap-2 2xsm:gap-4">
            <DarkModeSwitcher />

            {showNotifications && <DropdownNotification />}

            {/* <DropdownMessage /> */}
            <DropdownUser />
          </ul>
        </div>
      </div>
    </header>
  );
};

export default Header;
