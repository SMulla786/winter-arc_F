import {useEffect, useRef, useState} from 'react';
import type {CateringPackage, Dish, ExtraDish} from './types';
import {
  Calendar,
  ChefHat,
  ChevronDown,
  ChevronRight,
  Crown,
  Mail,
  MapPin,
  Package,
  PhoneCall,
  Sparkles,
  Users,
  UtensilsCrossed,
} from 'lucide-react';
import menucardbg from '@/assets/images/menucard/menucard1.jpg';
import {toast} from 'react-hot-toast';
import {BiSave} from 'react-icons/bi';
import {FaCircle} from 'react-icons/fa';
import {MdClose, MdMenuBook} from 'react-icons/md';
import {PiAddressBook} from 'react-icons/pi';
import {
  useGetExternalAddonServicesByCaterorId,
  useGetExternalAllPackagesByCaterorId,
  useGetExternalAllPackagesBySubEventId,
  useGetExternalDishesByCaterorId,
  useGetExternalSinglePackageById,
  useGetExternalSubeventById,
  useUpdateExternalSubevent,
} from '@/lib/api/externalForm';
import {useGetCaterorById} from '@/lib/react-query/queriesAndMutations/cateror/dish';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import DynamicLoader from '../../LoaderComponentExternalForm/DynamicLoader';
import {Route} from '@/routes/_externalform/subeventexternal.$id.$caterorid';
import {GlobalStyles} from './styles/GlobalStyles';
import {PremiumHeader} from './components/PremiumHeader';
import {CaterorDetailsCard} from './components/CaterorDetailsCard';
import {PremiumEventSummaryCard} from './components/PremiumEventSummaryCard';
import {PremiumMenuTypeSelection} from './components/PremiumMenuTypeSelection';
import {PremiumPackageSelection} from './components/PremiumPackageSelection';
import {PremiumSelectedPackageCard} from './components/PremiumSelectedPackageCard';
import {PremiumCustomDishSelection} from './components/PremiumCustomDishSelection';
import {PremiumPackageDishSelection} from './components/PremiumPackageDishSelection';
import {PremiumExtraDishesSection} from './components/PremiumExtraDishesSection';
import {PremiumAdditionalServicesSection} from './components/PremiumAdditionalServicesSection';
import {PremiumNoteInput} from './components/PremiumNoteInput';
import {PremiumQuickSummary} from './components/PremiumQuickSummary';
import {PremiumBottomActionBar} from './components/PremiumBottomActionBar';
import {PDFContent} from './components/PDFContent';

export type {CateringPackage, Dish, ExtraDish};
export {
  Calendar,
  ChefHat,
  ChevronDown,
  ChevronRight,
  Crown,
  Mail,
  MapPin,
  Package,
  PhoneCall,
  Sparkles,
  Users,
  UtensilsCrossed,
  menucardbg,
  toast,
  BiSave,
  FaCircle,
  MdClose,
  MdMenuBook,
  PiAddressBook,
  useGetExternalAddonServicesByCaterorId,
  useGetExternalAllPackagesByCaterorId,
  useGetExternalAllPackagesBySubEventId,
  useGetExternalDishesByCaterorId,
  useGetExternalSinglePackageById,
  useGetExternalSubeventById,
  useUpdateExternalSubevent,
  useGetCaterorById,
  html2canvas,
  jsPDF,
  DynamicLoader,
  Route,
  useEffect,
  useRef,
  useState,
  GlobalStyles,
  PremiumHeader,
  CaterorDetailsCard,
  PremiumEventSummaryCard,
  PremiumMenuTypeSelection,
  PremiumPackageSelection,
  PremiumSelectedPackageCard,
  PremiumCustomDishSelection,
  PremiumPackageDishSelection,
  PremiumExtraDishesSection,
  PremiumAdditionalServicesSection,
  PremiumNoteInput,
  PremiumQuickSummary,
  PremiumBottomActionBar,
  PDFContent,
};
