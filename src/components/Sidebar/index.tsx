/* eslint-disable*/

import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from '@tanstack/react-router';
import SidebarLinkGroup from './SidebarLinkGroup';
import Logo from '../../assets/images/logo/sidebar-logo.png';
import SmallLogo from '../../assets/images/logo/menubg.png';
import { SidebarProps } from '@/types';
import { PiSquaresFourLight } from 'react-icons/pi';
import { IoIosArrowDown } from 'react-icons/io';
import {
  BiBriefcase,
  BiCalendar,
  BiCalendarEvent,
  BiPlusCircle,
  BiSolidDish,
} from 'react-icons/bi';
import {
  FaBowlFood,
  FaCoins,
  FaMoneyBillWave,
  FaTable,
  FaTruck,
  FaUpload,
  FaUtensils,
} from 'react-icons/fa6';
import { FiSettings, FiUpload, FiUsers } from 'react-icons/fi';
import {
  IoNotificationsCircle,
  IoPersonAddOutline,
  IoSettingsOutline,
  IoTrashBin,
} from 'react-icons/io5';
import {
  MdContactEmergency,
  MdEvent,
  MdFastfood,
  MdOutlineAddBusiness,
  MdOutlineInventory2,
  MdReport,
  MdRestaurantMenu,
} from 'react-icons/md';
import { useAuthContext } from '@/context/AuthContext';
import { ProfileIcon } from '@/icons';
import {
  BsCalendarEventFill,
  BsCashCoin,
  BsDisplay,
  BsLayers,
  BsTerminalSplit,
  BsTruck,
} from 'react-icons/bs';
import { Icon } from 'lucide-react';
import {
  FaBoxOpen,
  FaClipboardList,
  FaLayerGroup,
  FaListUl,
  FaTshirt,
  FaUser,
  FaUserCircle,
  FaUserPlus,
  FaWarehouse,
} from 'react-icons/fa';
import { GiTable } from 'react-icons/gi';
import { steps } from 'framer-motion';
import { sub } from 'date-fns';

const Sidebar = ({ sidebarOpen, setSidebarOpen }: SidebarProps) => {
  const location = useLocation();
  const { pathname } = location;
  const { role } = useAuthContext();
  const { user } = useAuthContext();
  const userRole = user?.role;

  const isFixedOpenRef = useRef(false);
  const [isFixedOpen, setIsFixedOpen] = useState(false);
  const isExpanded = sidebarOpen || isFixedOpen;

  const [hoveredRoute, setHoveredRoute] = useState<string | null>(null);
  const [hoveredRect, setHoveredRect] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [showSubRoutes, setShowSubRoutes] = useState<{
    label: string;
    subRoutes: any[];
  } | null>(null);

  const freePlanRoutes = [
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: <BiCalendar size={22} />,
      step: 1,
    },
    {
      label: 'Client',
      path: '/client',
      icon: <ProfileIcon size={20} />,
      step: 2,
    },
  ];

  const basicPlanRoutes = [
    // Step 1-2: Dashboard & Client (from free plan)
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: <BiCalendar size={22} />,
      step: 1,
    },
    {
      label: 'Client',
      path: '/client',
      icon: <ProfileIcon size={20} />,
      step: 2,
    },

    // Step 3: Dish with sub-routes
    {
      label: 'Dish',
      icon: <BiSolidDish size={22} />,
      step: 3,
      subRoutes: [
        {
          label: 'Raw Material Category',
          path: '/RawMaterialCategory',
          step: '3.I',
        },
        { label: 'Raw Material Process', path: '/process', step: '3.III' },
        { label: 'Dish Category', path: '/dishCategory', step: '3.IV' },
        { label: 'Create Dish', path: '/AddDish', step: '3.V' },
        { label: 'All Dishes', path: '/Alldishes', step: '3.VI' },

        { label: 'Package', path: '/packages/displaypackage', step: '3.VIII' },
        { label: 'Inventory', path: '/inventorydisplay', step: '3.IX' }, //added
      ],
    },

    // Step 8: Setting with sub-routes
    {
      label: 'Setting',
      icon: <FiSettings size={20} />,
      step: 8,
      subRoutes: [
        { label: 'Payment Details', path: '/pdetails', step: '8.I' },
        { label: 'Terms & Conditions', path: '/tandc', step: '8.II' },
        { label: 'Letter Head Upload', path: '/image', step: '8.III' },
      ],
    },
  ];

  const proPlanRoutes = [
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: <BiCalendar size={22} />,
      step: 1,
    },

    {
      label: 'Client',
      path: '/client',
      icon: <ProfileIcon size={22} />,
      step: 2,
    },

    // Step 3: Dish with ALL pro sub-routes
    {
      label: 'Dish',
      icon: <BiSolidDish size={22} />,
      step: 3,
      subRoutes: [
        {
          label: 'Raw Material Category',
          path: '/RawMaterialCategory',
          step: '3.I',
        },
        { label: 'Raw Material', path: '/AddRawMaterial', step: '3.II' },
        { label: 'Raw Material Process', path: '/process', step: '3.III' },
        { label: 'Dish Category', path: '/dishCategory', step: '3.IV' },
        { label: 'Create Dish', path: '/AddDish', step: '3.V' },
        { label: 'All Dishes', path: '/Alldishes', step: '3.VI' },
        { label: 'Add on service', path: '/addonservice', step: '3.VII' },
        { label: 'Package', path: '/packages/displaypackage', step: '3.VIII' },
        { label: 'Inventory', path: '/inventorydisplay', step: '3.IX' }, //added
      ],
    },

    {
      label: 'Income & Expenditure',
      path: '/incomeexpenditure',
      icon: <FaCoins size={22} />,
      step: 12,
    },

    {
      label: 'Reports',
      icon: <FaTable size={20} />,
      step: 8,
      subRoutes: [
        { label: 'Pending Bill Reports', path: '/report', step: '8.I' },
        // {
        //   label: 'Store Reports',
        //   path: '/rawmaterialreport',
        //   step: '8.I',
        // },
        // {label: 'Wastage Reports', path: '/westagereport', step: '8.I'},
        // {label: 'Disposal Reports', path: '/disposalreport', step: '8.I'},
        // {label: 'Utensils Reports', path: '/utensilsreport', step: '8.I'},
      ],
    },

    // {
    //   label: 'Banquat Management',
    //   path: '/createbanquet',
    //   icon: <IoNotificationsCircle size={22} />,
    //   step: 14,
    // },
    // {
    //   label: 'Counter Management',
    //   path: '/countermanagement',
    //   icon: <GiTable size={22} />,
    //   step: 14,
    // },
  ];

  const premiumPlanRoutes = [
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: <BiCalendar size={22} />,
      step: 1,
    },
    {
      label: 'Event Type Master',
      path: '/eventtypemaster',
      icon: <MdEvent size={22} />,
      step: 2,
    },

    {
      label: 'Client',
      path: '/client',
      icon: <ProfileIcon size={22} />,
      step: 2,
    },

    // Step 3: Dish with ALL pro sub-routes
    {
      label: 'Dish',
      icon: <BiSolidDish size={22} />,
      step: 3,
      subRoutes: [
        {
          label: 'Raw Material Category',
          path: '/RawMaterialCategory',
          step: '3.I',
        },
        // {label: 'Raw Material', path: '/AddRawMaterial', step: '3.II'},
        { label: 'Raw Material Process', path: '/process', step: '3.III' },
        { label: 'Dish Category', path: '/dishCategory', step: '3.IV' },
        { label: 'Create Dish', path: '/AddDish', step: '3.V' },
        { label: 'All Dishes', path: '/Alldishes', step: '3.VI' },
        { label: 'Add on service', path: '/addonservice', step: '3.VII' },
        { label: 'Package', path: '/packages/displaypackage', step: '3.VIII' },
        { label: 'Inventory', path: '/inventorydisplay', step: '3.IX' }, //added
      ],
    },

    // {
    //   label: 'Maharaj',
    //   path: '/users/maharaj',
    //   icon: <MdContactEmergency size={22} />,
    //   step: 6,
    // },

    {
      label: 'Staff Management',
      icon: <BiBriefcase size={22} />,
      steps: 6,
      subRoutes: [
        { label: 'Dress Code', path: '/dresscode', step: '6.I' },
        { label: 'Counter Management', path: '/countermanagement', step: '6.II' },
        { label: 'Manpower Vendor', path: '/manpowervendor', step: '6.III' },
      ],
    },

    {
      label: 'Food Vendors',
      path: '/foodvendor',
      icon: <MdFastfood size={22} />,
      step: 8,
    },

    // Step 9: Utensils with sub-routes
    {
      label: 'Utensil & Disposals',
      icon: <FaUtensils size={22} />,
      step: 9,
      subRoutes: [
        { label: 'Utensils Category', path: '/utensilCategory', step: '9.I' },
        { label: 'Create Utensils', path: '/utensils', step: '9.II' },
        {
          label: 'Utensils People Assign',
          path: '/utensilpeopleassign',
          step: '9.III',
        },
        { label: 'Disposal Category', path: '/disposalcategory', step: '10.I' },
        { label: 'Create Disposal', path: '/disposal', step: '10.II' },
        {
          label: 'Disposal People Assign',
          path: '/disposalpeopleassign',
          step: '10.III',
        },
        {
          label: 'Cutlery Category',
          path: '/cutlerymanagment',
          step: '10.IV',
        },
        {
          label: 'Create Cutlery',
          path: '/createcutlery',
          step: '10.V',
        },
        // {
        //   label: 'Master Cutlery',
        //   path: '/cutlerymaster',
        //   step: '10.VI',
        // },
      ],
    },
    {
      label: 'Vendor Management',
      path: '/vendormanagement',
      icon: <FaUserPlus size={22} />,
    },

    // Step 10: Disposals with sub-routes

    {
      label: 'Purchase Order',
      path: '/dishcountreport',
      icon: <MdOutlineInventory2 size={22} />,
      step: 11,
    },

    {
      label: 'Store',
      path: '/store',
      icon: <FaWarehouse size={22} />,
      step: 13,
    },
    {
      label: 'Cutlery',
      path: '/cutlery',
      icon: <MdRestaurantMenu size={22} />,
      step: 14,
    },

    {
      label: 'Vehicle',
      path: '/vehicle',
      icon: <BsTruck size={22} />,
      step: 15,
    },

    {
      label: 'CRM',
      icon: <FaUser size={22} />,
      step: 10,
      path: '/eventcrm',
    },
    // Step 12: Income & Expenditure
    {
      label: 'Income & Expenditure',
      path: '/incomeexpenditure',
      icon: <FaCoins size={22} />,
      step: 12,
    },

    {
      label: 'Reports',
      icon: <FaTable size={20} />,
      step: 8,
      subRoutes: [
        { label: 'Pending Bill Reports', path: '/report', step: '8.I' },
        {
          label: 'Store Reports',
          path: '/rawmaterialreport',
          step: '8.I',
        },
        { label: 'Wastage Reports', path: '/westagereport', step: '8.I' },
        { label: 'Disposal Reports', path: '/disposalreport', step: '8.I' },
        { label: 'Utensils Reports', path: '/utensilsreport', step: '8.I' },
      ],
    },

    {
      label: 'Banquat Management',
      path: '/createbanquet',
      icon: <IoNotificationsCircle size={22} />,
      step: 14,
    },

    {
      label: 'Setting',
      icon: <FiSettings size={20} />,
      step: 15,
      subRoutes: [
        // {label: 'Firm Details', path: '/detail', step: '15.I'},
        // {label: 'Payment Details', path: '/pdetails', step: '15.II'},
        // {label: 'Terms & Conditions', path: '/tandc', step: '15.III'},
        // {label: 'Letter Head', path: '/image', step: '15.V'},
        // {label: 'Create Employee', path: '/createemployee', step: '15.VI'},
        // {label: 'Employee Setting', path: '/employeesetting', step: '15.VII'},
        // {
        //   label: 'Expense Master',
        //   path: '/expensemaster',
        //   step: '15.VII',
        // },
        {
          label: 'Fuel Master',
          path: '/fuelmaster',
          step: '15.VII',
        },
      ],
    },
    {
      label: 'Create Employee',
      path: '/createemployee',
      icon: <IoPersonAddOutline size={22} />,
      step: 14,
    },
    {
      label: 'Employee Setting',
      path: '/employeesetting',
      icon: <IoSettingsOutline size={22} />,
      step: 14,
    },
  ];

  const ultrapremiumPlanRoutes = [
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: <BiCalendar size={22} />,
      step: 1,
    },
    {
      label: 'Event Type Master',
      path: '/eventtypemaster',
      icon: <MdEvent size={22} />,
      step: 2,
    },

    {
      label: 'Client',
      path: '/client',
      icon: <ProfileIcon size={22} />,
      step: 2,
    },

    // Step 3: Dish with ALL pro sub-routes
    {
      label: 'Dish',
      icon: <BiSolidDish size={22} />,
      step: 3,
      subRoutes: [
        {
          label: 'Raw Material Category',
          path: '/RawMaterialCategory',
          step: '3.I',
        },
        // {label: 'Raw Material', path: '/AddRawMaterial', step: '3.II'},
        { label: 'Raw Material Process', path: '/process', step: '3.III' },
        { label: 'Dish Category', path: '/dishCategory', step: '3.IV' },
        { label: 'Create Dish', path: '/AddDish', step: '3.V' },
        { label: 'All Dishes', path: '/Alldishes', step: '3.VI' },
        { label: 'Add on service', path: '/addonservice', step: '3.VII' },
        { label: 'Package', path: '/packages/displaypackage', step: '3.VIII' },
        // { label: 'Inventory', path: '/inventorydisplay', step: '3.IX' }, //ultrapremiumPlanRoutes does not have inventory access
      ],
    },

    // {
    //   label: 'Maharaj',
    //   path: '/users/maharaj',
    //   icon: <MdContactEmergency size={22} />,
    //   step: 6,
    // },

    {
      label: 'Staff Management',
      icon: <BiBriefcase size={22} />,
      steps: 6,
      subRoutes: [
        { label: 'Dress Code', path: '/dresscode', step: '6.I' },
        { label: 'Counter Management', path: '/countermanagement', step: '6.II' },
        { label: 'Manpower Vendor', path: '/manpowervendor', step: '6.III' },
      ],
    },

    {
      label: 'Food Vendors',
      path: '/foodvendor',
      icon: <MdFastfood size={22} />,
      step: 8,
    },

    // Step 9: Utensils with sub-routes
    {
      label: 'Utensil & Disposals',
      icon: <FaUtensils size={22} />,
      step: 9,
      subRoutes: [
        { label: 'Utensils Category', path: '/utensilCategory', step: '9.I' },
        { label: 'Create Utensils', path: '/utensils', step: '9.II' },
        {
          label: 'Utensils People Assign',
          path: '/utensilpeopleassign',
          step: '9.III',
        },
        { label: 'Disposal Category', path: '/disposalcategory', step: '10.I' },
        { label: 'Create Disposal', path: '/disposal', step: '10.II' },
        {
          label: 'Disposal People Assign',
          path: '/disposalpeopleassign',
          step: '10.III',
        },
        {
          label: 'Cutlery Category',
          path: '/cutlerymanagment',
          step: '10.IV',
        },
        {
          label: 'Create Cutlery',
          path: '/createcutlery',
          step: '10.V',
        },
        // {
        //   label: 'Master Cutlery',
        //   path: '/cutlerymaster',
        //   step: '10.VI',
        // },
      ],
    },
    {
      label: 'Vendor Management',
      path: '/vendormanagement',
      icon: <FaUserPlus size={22} />,
    },

    // Step 10: Disposals with sub-routes

    {
      label: 'Purchase Order',
      path: '/dishcountreport',
      icon: <MdOutlineInventory2 size={22} />,
      step: 11,
    },

    {
      label: 'Store',
      path: '/store',
      icon: <FaWarehouse size={22} />,
      step: 13,
    },
    {
      label: 'Cutlery',
      path: '/cutlery',
      icon: <MdRestaurantMenu size={22} />,
      step: 14,
    },

    {
      label: 'Vehicle',
      path: '/vehicle',
      icon: <BsTruck size={22} />,
      step: 15,
    },

    {
      label: 'CRM',
      icon: <FaUser size={22} />,
      step: 10,
      path: '/eventcrm',
    },
    // Step 12: Income & Expenditure
    {
      label: 'Income & Expenditure',
      path: '/incomeexpenditure',
      icon: <FaCoins size={22} />,
      step: 12,
    },

    {
      label: 'Reports',
      icon: <FaTable size={20} />,
      step: 8,
      subRoutes: [
        { label: 'Pending Bill Reports', path: '/report', step: '8.I' },
        {
          label: 'Store Reports',
          path: '/rawmaterialreport',
          step: '8.I',
        },
        { label: 'Wastage Reports', path: '/westagereport', step: '8.I' },
        { label: 'Disposal Reports', path: '/disposalreport', step: '8.I' },
        { label: 'Utensils Reports', path: '/utensilsreport', step: '8.I' },
      ],
    },

    {
      label: 'Banquat Management',
      path: '/createbanquet',
      icon: <IoNotificationsCircle size={22} />,
      step: 14,
    },

    {
      label: 'Setting',
      icon: <FiSettings size={20} />,
      step: 15,
      subRoutes: [
        // {label: 'Firm Details', path: '/detail', step: '15.I'},
        // {label: 'Payment Details', path: '/pdetails', step: '15.II'},
        // {label: 'Terms & Conditions', path: '/tandc', step: '15.III'},
        // {label: 'Letter Head', path: '/image', step: '15.V'},

        // {
        //   label: 'Expense Master',
        //   path: '/expensemaster',
        //   step: '15.VII',
        // },
        {
          label: 'Fuel Master',
          path: '/fuelmaster',
          step: '15.VII',
        },
      ],
    },
    {
      label: 'Create Employee',
      path: '/createemployee',
      icon: <IoPersonAddOutline size={22} />,
      step: 14,
    },
    {
      label: 'Employee Setting',
      path: '/employeesetting',
      icon: <IoSettingsOutline size={22} />,
      step: 14,
    },
  ];

  const getRoutesForPlan = (plan: string | undefined) => {
    switch (plan) {
      case 'FREE':
        return freePlanRoutes;
      case 'BASIC':
        return basicPlanRoutes;
      case 'PRO':
        return proPlanRoutes;
      case 'PREMIUM':
        return premiumPlanRoutes;
      case 'ULTRAPREMIUM':
        return ultrapremiumPlanRoutes;
      default:
        return freePlanRoutes; // Default to free plan if plan is not recognized
    }
  };

  const sidebarRoutes =
    role === 'ADMIN'
      ? [
        {
          label: 'Events',
          path: '/admin/dashboard',
          icon: <PiSquaresFourLight size={22} />,
        },
        {
          label: 'Users',
          icon: <FiUsers size={22} />,
          subRoutes: [{ label: 'Cateror', path: '/admin/cateror' }],
        },

        // {
        //   label: 'Dish',
        //   icon: <FiUsers size={22} />,
        //   subRoutes: [{label: 'Cateror', path: '/admin/latestdish'}],
        // },

        {
          label: 'Dish',
          icon: <BiSolidDish size={22} />,
          subRoutes: [
            { label: 'Dish Category', path: '/admin/dish/dishCategory' },
            { label: 'Add Dish', path: '/admin/dish/AddDish' },
            { label: 'Dish Display', path: '/admin/dish/AdminDishDisplay' },
            { label: 'Add Raw Material', path: '/admin/dish/AddRawMaterial' },
            {
              label: 'Raw Material Category',
              path: '/admin/dish/RawMaterialCategory',
            },
            { label: 'Process', path: '/admin/dish/process' },
            { label: 'Inventory', path: '/inventorydisplay' }, //added
          ],
        },
        {
          label: 'Language',
          icon: <BiCalendarEvent size={22} />,
          subRoutes: [{ label: 'Add Language', path: '/admin/language' }],
        },
        {
          label: 'Utensil',
          icon: <FaUtensils size={22} />,
          subRoutes: [
            {
              label: 'Utensils Category',
              path: '/admin/utensils/utensilCategory',
            },
            { label: 'Utensils', path: '/admin/utensils/utensils' },
            { label: 'Copy Data', path: '/admin/utensils/copydata' },
          ],
        },
        {
          label: 'Disposal',
          icon: <IoTrashBin size={22} />,
          subRoutes: [
            { label: 'Disposal', path: '/admin/disposals/disposal' },
            {
              label: 'Disposal Category',
              path: '/admin/disposals/disposalcategory',
            },
            { label: 'Copy Data', path: '/admin/disposals/copydatadisposal' },
          ],
        },
        {
          label: 'Copy Data',
          path: '/admin/dish/CopyData',
          icon: <PiSquaresFourLight size={22} />,
        },
        {
          label: 'Module Wise',
          path: '/modelswise',
          icon: <FaLayerGroup size={22} />,
        },
      ]
      : role === 'EMPLOYEE'
        ? (() => {
          const menuItems = [];

          menuItems.push({
            label: 'Dashboard',
            path: '/dashboard',
            icon: <BiCalendar size={22} />,
          });

          if (
            user?.employeeRestriction?.clientPage === 'EDIT' ||
            user?.employeeRestriction?.clientPage === 'VIEW'
          ) {
            menuItems.push({
              label: 'Client',
              path: '/client',
              icon: <ProfileIcon size={22} />,
            });
          }

          const dishSubRoutes = [];

          if (
            user?.employeeRestriction?.rawMaterialCategoryPage === 'EDIT' ||
            user?.employeeRestriction?.rawMaterialCategoryPage === 'VIEW'
          ) {
            dishSubRoutes.push({
              label: 'Raw Material Category',
              path: '/RawMaterialCategory',
            });
          }

          if (
            user?.employeeRestriction?.rawMaterialPage === 'EDIT' ||
            user?.employeeRestriction?.rawMaterialPage === 'VIEW'
          ) {
            dishSubRoutes.push({
              label: 'Raw Material',
              path: '/AddRawMaterial',
            });
          }

          if (
            user?.employeeRestriction?.rawMaterialProcessPage === 'EDIT' ||
            user?.employeeRestriction?.rawMaterialProcessPage === 'VIEW'
          ) {
            dishSubRoutes.push({
              label: 'Raw Material Process',
              path: '/process',
            });
          }

          if (
            user?.employeeRestriction?.dishCategoryPage === 'EDIT' ||
            user?.employeeRestriction?.dishCategoryPage === 'VIEW'
          ) {
            dishSubRoutes.push({
              label: 'Dish Category',
              path: '/dishCategory',
            });
          }

          if (
            user?.employeeRestriction?.dishPage === 'EDIT' ||
            userRole === 'CATEROR'
          ) {
            dishSubRoutes.push({
              label: 'Create Dish',
              path: '/AddDish',
            });
          }

          if (
            user?.employeeRestriction?.dishPage === 'VIEW' ||
            user?.employeeRestriction?.dishPage === 'EDIT' ||
            userRole === 'CATEROR'
          ) {
            dishSubRoutes.push({
              label: 'All Dishes',
              path: '/Alldishes',
            });
          }


          dishSubRoutes.push({
            label: 'Inventory',
            path: '/inventorydisplay',
          });


          if (dishSubRoutes.length > 0) {
            menuItems.push({
              label: 'Dish',
              icon: <BiSolidDish size={22} />,
              subRoutes: dishSubRoutes,
            });
          }

          if (
            user?.employeeRestriction?.addonServicePage === 'EDIT' ||
            user?.employeeRestriction?.addonServicePage === 'VIEW'
          ) {
            menuItems.push({
              label: 'Add on service',
              path: '/addonservice',
              icon: <BsLayers size={22} />,
            });
          }
          const packageSubRoutes = [];

          if (user?.employeeRestriction?.packagePage === 'EDIT') {
            packageSubRoutes.push({
              label: 'Create Package',
              path: '/packages/createpackage',
            });
          }

          if (
            user?.employeeRestriction?.packagePage === 'EDIT' ||
            user?.employeeRestriction?.packagePage === 'VIEW'
          ) {
            packageSubRoutes.push({
              label: 'Display Package',
              path: '/packages/displaypackage',
            });
          }

          if (packageSubRoutes.length > 0) {
            menuItems.push({
              label: 'Package',
              icon: <BsCashCoin size={22} />,
              subRoutes: packageSubRoutes,
            });
          }

          const staffSubRoutes = [];

          if (
            user?.employeeRestriction?.dresscodepage === 'EDIT' ||
            user?.employeeRestriction?.dresscodepage === 'VIEW'
          ) {
            staffSubRoutes.push({
              label: 'Dress code',
              path: '/dresscode',
            });
          }

          if (
            user?.employeeRestriction?.counterpage === 'EDIT' ||
            user?.employeeRestriction?.counterpage === 'VIEW'
          ) {
            staffSubRoutes.push({
              label: 'Counter Management',
              path: '/countermanagement',
            });
          }

          if (
            user?.employeeRestriction?.vendorPage === 'EDIT' ||
            user?.employeeRestriction?.vendorPage === 'VIEW'
          ) {
            staffSubRoutes.push({
              label: 'Vendor',
              path: '/vendor',
              icon: <FiUsers size={22} />,
            });
          }

          if (staffSubRoutes.length > 0) {
            menuItems.push({
              label: 'Staff Management',
              icon: <BsCashCoin size={22} />,
              subRoutes: staffSubRoutes,
            });
          }

          if (
            user?.employeeRestriction?.foodVendorPage === 'EDIT' ||
            user?.employeeRestriction?.foodVendorPage === 'VIEW'
          ) {
            menuItems.push({
              label: 'Food Vendor',
              path: '/foodvendor',
              icon: <MdFastfood size={22} />,
            });
          }

          const utensilanddisposalSubRoutes = [];

          if (
            user?.employeeRestriction?.utensilCategoryPage === 'EDIT' ||
            user?.employeeRestriction?.utensilCategoryPage === 'VIEW'
          ) {
            utensilanddisposalSubRoutes.push({
              label: 'Utensils Category',
              path: '/utensilCategory',
            });
          }

          if (
            user?.employeeRestriction?.utensilPage === 'EDIT' ||
            user?.employeeRestriction?.utensilPage === 'VIEW'
          ) {
            utensilanddisposalSubRoutes.push({
              label: 'Create Utensils',
              path: '/utensils',
            });
          }

          if (
            user?.employeeRestriction?.utensilpeoplepage === 'EDIT' ||
            user?.employeeRestriction?.utensilpeoplepage === 'VIEW'
          ) {
            utensilanddisposalSubRoutes.push({
              label: 'Utensils People Assign',
              path: '/utensilpeopleassign',
            });
          }

          if (
            user?.employeeRestriction?.disposalCategoryPage === 'EDIT' ||
            user?.employeeRestriction?.disposalCategoryPage === 'VIEW'
          ) {
            utensilanddisposalSubRoutes.push({
              label: 'Disposal Category',
              path: '/disposalcategory',
            });
          }

          if (
            user?.employeeRestriction?.disposalPage === 'EDIT' ||
            user?.employeeRestriction?.disposalPage === 'VIEW'
          ) {
            utensilanddisposalSubRoutes.push({
              label: 'Create Disposal',
              path: '/disposal',
            });
          }

          if (
            user?.employeeRestriction?.disposalpeoplepage === 'EDIT' ||
            user?.employeeRestriction?.disposalpeoplepage === 'VIEW'
          ) {
            utensilanddisposalSubRoutes.push({
              label: 'Disposal People Assign',
              path: '/disposalpeopleassign',
            });
          }

          if (utensilanddisposalSubRoutes.length > 0) {
            menuItems.push({
              label: 'Utensil',
              icon: <FaUtensils size={22} />,
              subRoutes: utensilanddisposalSubRoutes,
            });
          }

          if (
            user?.employeeRestriction?.dishCountandRMOrder === 'EDIT' ||
            user?.employeeRestriction?.dishCountandRMOrder === 'VIEW'
          ) {
            menuItems.push({
              label: 'Purchase Order',
              path: '/dishcountreport',
              icon: <FaCoins size={22} />,
            });
          }

          const cutlerySubRoutes = [];

          if (
            user?.employeeRestriction?.cutlerypage === 'EDIT' ||
            user?.employeeRestriction?.cutlerypage === 'VIEW'
          ) {
            cutlerySubRoutes.push({
              label: 'Create Cutlery',
              path: '/cutlery',
              icon: <ProfileIcon size={22} />,
            });
          }

          if (
            user?.employeeRestriction?.mastercutlerypage === 'EDIT' ||
            user?.employeeRestriction?.mastercutlerypage === 'VIEW'
          ) {
            cutlerySubRoutes.push({
              label: 'Create Master Cutlery',
              path: '/createcutlery',
              icon: <ProfileIcon size={22} />,
            });
          }

          if (
            user?.employeeRestriction?.cutlerycategorypage === 'EDIT' ||
            user?.employeeRestriction?.cutlerycategorypage === 'VIEW'
          ) {
            cutlerySubRoutes.push({
              label: 'Cutlery Category',
              path: '/cutlerymanagment',
              icon: <ProfileIcon size={22} />,
            });
          }

          if (cutlerySubRoutes.length > 0) {
            menuItems.push({
              label: 'Cutlery',
              icon: <MdRestaurantMenu size={22} />,
              subRoutes: cutlerySubRoutes,
            });
          }

          if (
            user?.employeeRestriction?.rawmaterialvendorpage === 'EDIT' ||
            user?.employeeRestriction?.rawmaterialvendorpage === 'VIEW'
          ) {
            menuItems.push({
              label: 'Vendor Management',
              path: '/vendormanagement',
              icon: <BsLayers size={22} />,
            });
          }

          if (
            user?.employeeRestriction?.storeInventory === 'EDIT' ||
            user?.employeeRestriction?.storeInventory === 'VIEW'
          ) {
            menuItems.push({
              label: 'Store',
              path: '/store',
              icon: <FaCoins size={22} />,
            });
          }

          if (
            user?.employeeRestriction?.vehiclepage === 'EDIT' ||
            user?.employeeRestriction?.vehiclepage === 'VIEW'
          ) {
            menuItems.push({
              label: 'Vehicle',
              path: '/vehicle',
              icon: <BsTruck size={22} />,
            });
          }

          if (
            user?.employeeRestriction?.crmdashboardpage === 'EDIT' ||
            user?.employeeRestriction?.crmdashboardpage === 'VIEW'
          ) {
            menuItems.push({
              label: 'CRM Dashboard',
              path: '/eventcrm',
              icon: <BsCashCoin size={22} />,
            });
          }

          if (
            user?.employeeRestriction?.incomeExpenditurePage === 'EDIT' ||
            user?.employeeRestriction?.incomeExpenditurePage === 'VIEW'
          ) {
            menuItems.push({
              label: 'Income & Expenditure',
              path: '/incomeexpenditure',
              icon: <FaCoins size={22} />,
            });
          }

          const reportSubroutes = [];

          if (
            user?.employeeRestriction?.pendingBillReport === 'EDIT' ||
            user?.employeeRestriction?.pendingBillReport === 'VIEW'
          ) {
            reportSubroutes.push({
              label: 'Pending Report ',
              path: '/report',
            });
          }

          if (
            user?.employeeRestriction?.storeReport === 'EDIT' ||
            user?.employeeRestriction?.storeReport === 'VIEW'
          ) {
            reportSubroutes.push({
              label: 'Store Report',
              path: '/rawmaterialreport',
            });
          }

          if (
            user?.employeeRestriction?.wastageReport === 'EDIT' ||
            user?.employeeRestriction?.wastageReport === 'VIEW'
          ) {
            reportSubroutes.push({
              label: 'Wastage Report',
              path: '/westagereport',
            });
          }

          if (
            user?.employeeRestriction?.disposalReport === 'EDIT' ||
            user?.employeeRestriction?.disposalReport === 'VIEW'
          ) {
            reportSubroutes.push({
              label: 'Disposal Report',
              path: '/disposalreport',
            });
          }

          if (
            user?.employeeRestriction?.utensilsReport === 'EDIT' ||
            user?.employeeRestriction?.utensilsReport === 'VIEW'
          ) {
            reportSubroutes.push({
              label: 'Utensil Report',
              path: '/utensilsreport',
            });
          }

          if (reportSubroutes.length > 0) {
            menuItems.push({
              label: 'Report',
              icon: <MdReport size={22} />,
              subRoutes: reportSubroutes,
            });
          }

          if (
            user?.employeeRestriction?.banquetpage === 'EDIT' ||
            user?.employeeRestriction?.banquetpage === 'VIEW'
          ) {
            menuItems.push({
              label: 'Banquet Management',
              path: '/createbanquet',
              icon: <BsLayers size={22} />,
            });
          }

          if (
            user?.employeeRestriction?.fuelMaster === 'EDIT' ||
            user?.employeeRestriction?.fuelMaster === 'VIEW'
          ) {
            menuItems.push({
              label: 'Fuel Master',
              path: '/fuelmaster',
              icon: <BsLayers size={22} />,
            });
          }

          return menuItems;
        })()
        : role === 'CATEROR'
          ? getRoutesForPlan(user?.plan)
          : [];

  const trigger = useRef<HTMLButtonElement>(null);
  const sidebar = useRef<HTMLDivElement>(null);
  const [hoveredLabel, setHoveredLabel] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{
    top: number;
    left: number;
  } | null>(null);

  const storedSidebarExpanded = localStorage.getItem('sidebar-expanded');
  const [sidebarExpanded, setSidebarExpanded] = useState(
    storedSidebarExpanded === null ? false : storedSidebarExpanded === 'true',
  );

  const [isHovered, setIsHovered] = useState(false);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const clickHandler = (event: MouseEvent) => {
      const { target } = event;
      if (!sidebar.current || !trigger.current) return;
      if (
        !sidebarOpen ||
        sidebar.current.contains(target as Node) ||
        trigger.current.contains(target as Node)
      )
        return;
      setSidebarOpen(false);
      setHoveredRoute(null);
      setShowSubRoutes(null);
    };
    document.addEventListener('click', clickHandler);
    return () => document.removeEventListener('click', clickHandler);
  }, [sidebarOpen, setSidebarOpen]);

  useEffect(() => {
    const keyHandler = ({ keyCode }: KeyboardEvent) => {
      if (!sidebarOpen || keyCode !== 27) return;
      setSidebarOpen(false);
      setHoveredRoute(null);
      setShowSubRoutes(null);
    };
    document.addEventListener('keydown', keyHandler);
    return () => document.removeEventListener('keydown', keyHandler);
  }, [sidebarOpen, setSidebarOpen]);

  useEffect(() => {
    localStorage.setItem('sidebar-expanded', sidebarExpanded.toString());
    if (sidebarExpanded) {
      document.querySelector('body')?.classList.add('sidebar-expanded');
    } else {
      document.querySelector('body')?.classList.remove('sidebar-expanded');
    }
  }, [sidebarExpanded]);

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);
  // Handle screen resize for responsiveness
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
        setIsFixedOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="relative z-50">
      {/* SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-screen flex-col bg-black transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:static lg:translate-x-0`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-2 py-2 lg:py-6">
          <button
            className="flex items-center gap-2"
            onClick={() => {
              const nextState = !isExpanded;

              setSidebarOpen(nextState);
              setIsFixedOpen(nextState);
              setHoveredRoute(null);
              setShowSubRoutes(null);
              setHoveredRect(null);
            }}
          >
            {isExpanded ? (
              <img src={Logo} alt="Logo" className="h-18" />
            ) : (
              <div className="flex items-center rounded-full p-1">
                <img src={SmallLogo} alt="Logo" className="h-10 w-10" />
              </div>
            )}
          </button>
        </div>

        {/* SUB-MENUBAR */}
        <div className="no-scrollbar flex flex-col overflow-y-auto px-2 duration-300 ease-linear">
          <nav className="mt-4 space-y-1 p-2">
            <ul>
              {sidebarRoutes.map((route, index) =>
                route.subRoutes ? (
                  <SidebarLinkGroup activeCondition={isExpanded} key={index}>
                    {(handleClick, open) => (
                      <div className="relative">
                        <button
                          onMouseEnter={(e) => {
                            if (!isExpanded) {
                              const rect =
                                e.currentTarget.getBoundingClientRect();
                              setHoveredLabel(route.label);
                              setTooltipPos({
                                top: rect.top + rect.height / 2,
                                left: rect.right + 8,
                              });
                            }
                          }}
                          onMouseLeave={() => {
                            setHoveredLabel(null);
                            setTooltipPos(null);
                          }}
                          onClick={(e) => {
                            e.preventDefault();
                            const rect = (
                              e.currentTarget as HTMLElement
                            ).getBoundingClientRect();

                            setHoveredRect({
                              top: rect.top,
                              left: rect.right + 5,
                            });
                            setHoveredRoute(route.label);

                            setShowSubRoutes({
                              label: route.label,
                              subRoutes: route.subRoutes || [],
                            });
                          }}
                          className={`group flex w-full items-center gap-2.5 rounded px-3 py-2 text-sm font-medium text-white hover:bg-graydark ${pathname.includes(route.path!) ? 'bg-graydark' : ''
                            }`}
                        >
                          {route.icon}
                          {isExpanded && route.label}
                          {isExpanded && (
                            <IoIosArrowDown
                              className={`ml-auto transform duration-200 ${open ? 'rotate-180' : ''}`}
                            />
                          )}
                        </button>
                        {isExpanded && open && (
                          <ul className="ml-6 mt-1 space-y-1">
                            {route.subRoutes.map((subRoute, subIndex) => (
                              <li key={subIndex}>
                                <Link
                                  to={subRoute.path}
                                  onClick={() => {
                                    setHoveredRoute(null);
                                    setShowSubRoutes(null);
                                    setSidebarOpen(false);
                                  }}
                                  className="block rounded px-3 py-2 text-sm text-white hover:bg-black"
                                >
                                  {subRoute.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                  </SidebarLinkGroup>
                ) : (
                  <li key={index}>
                    <Link
                      to={route.path}
                      onMouseEnter={(e) => {
                        if (!isExpanded) {
                          // <-- add this
                          const rect = e.currentTarget.getBoundingClientRect();
                          setHoveredLabel(route.label);
                          setTooltipPos({
                            top: rect.top + rect.height / 2,
                            left: rect.right + 8,
                          });
                        }
                      }}
                      onMouseLeave={() => {
                        if (!isExpanded) {
                          // <-- add this
                          setHoveredLabel(null);
                          setTooltipPos(null);
                        }
                      }}
                      onClick={() => {
                        setHoveredRoute(null);
                        setShowSubRoutes(null);
                        setSidebarOpen(false);
                      }}
                      className={`group flex w-full items-center gap-2.5 rounded px-3 py-2 text-sm font-medium text-white hover:bg-graydark ${pathname.includes(route.path) ? 'bg-graydark' : ''
                        }`}
                    >
                      {route.icon}
                      {isExpanded && route.label}
                    </Link>
                  </li>
                ),
              )}
            </ul>
          </nav>
        </div>
      </aside>

      {hoveredLabel && tooltipPos && (
        <div
          className="fixed z-50 rounded bg-black px-2 py-1 text-xs text-white shadow"
          style={{
            top: tooltipPos.top,
            left: tooltipPos.left,
            transform: 'translateY(-50%)',
          }}
        >
          {hoveredLabel}
        </div>
      )}

      {/* Floating Subroute Menu when sidebar is collapsed */}
      {showSubRoutes && hoveredRect && (
        <div
          className="fixed z-[999] w-56 overflow-y-auto rounded-md bg-graydark p-2 shadow-lg"
          style={{
            top: (() => {
              const menuItemCount = showSubRoutes.subRoutes.length;
              const estimatedHeight = menuItemCount * 40 + 20; // 40px per item + padding
              const maxTop = window.innerHeight - estimatedHeight - 20;

              return Math.min(hoveredRect.top, maxTop);
            })(),
            left: hoveredRect.left + 5,
            maxHeight: 'calc(100vh - 100px)', // Reserve space for weather widget
          }}
          onMouseEnter={() => {
            if (closeTimeoutRef.current) {
              clearTimeout(closeTimeoutRef.current);
            }
          }}
          onMouseLeave={() => {
            closeTimeoutRef.current = setTimeout(() => {
              setHoveredRoute(null);
              setShowSubRoutes(null);
              setHoveredRect(null);
            }, 300);
          }}
        >
          {showSubRoutes.subRoutes.map((subRoute, subIndex) => (
            <Link
              key={subIndex}
              to={subRoute.path}
              onClick={() => {
                setHoveredRect(null);
                setHoveredRoute(null);
                setShowSubRoutes(null);
                if (window.innerWidth < 1024) {
                  setSidebarOpen(false);
                }
              }}
              className="flex items-center gap-2 rounded px-3 py-2 text-sm text-white hover:bg-black"
            >
              {subRoute.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Sidebar;
