import React, {useEffect} from 'react';
import {HiChevronLeft, HiChevronRight} from 'react-icons/hi2';
import {useAuthContext} from '@/context/AuthContext';
import toast from 'react-hot-toast';

// Your components
import MainEventCRMPage from '../CRM/EventsPageCRM';
import SubEventPackage from './SubEventPackage';
import EventRateListNew from './eventRateListComponents/EventRateListNew';
import Quotation from '../Quatation/Quatation';
import RawMaterialList from './RawMaterialList';
import RawMaterialOrder from './RawMaterialOrder';
import DisplayAllDishProcess from './DisplayAllDishProcess';
import AssignManger from '../ManagerPost/Assignmanager/AssignManger';
import ManagerMenu from './ManagerMenu';
import EventUtensilsDisposal from './EventUtensilsDisposal';
import AfterEvent from './AfterEvent';
import Bill from './Bill';
import MainIncomeExpense from '@/pages/MainIncomeExpense';
import EventPeopleCheck from './AfterEvent/EventPeopleCheck';
import WastageReport from './AfterEvent/WastageReport';
import RawMaterialReturn from './AfterEvent/RawMaterialReturn';
import UtensilChecking from './AfterEvent/UtensilChecking';
import EventDisposals from './AfterEvent/EventDisposals';
import Tender from './Tender';
import {Route} from '@/routes/_app/_event/events.$id';
import EventPoPage from './subEvent/EventPOPage';

import DishCalculatorWrapper from './RawMaterialCalculator/DishCalculatorWrapper';
import EventDisposalPo from '../DisposalPo/EventDisposalPo';
import CostAnalysisDashboard from '../AccountAnalysis/AccountAnalysis';
import SopManagement from '../sop/SopManagement';
import EventFloorPlan from '../EventPlanner/layout/EventFloorPlan';

const LazyFloorPlan = React.lazy(
  () => import('../EventPlanner/layout/EventFloorPlan'),
);

const EventManagement: React.FC = () => {
  const {user} = useAuthContext();
  const role = user?.role;
  const {id: EventId} = Route.useParams();
  const restriction = user?.employeeRestriction;

  const canAccessCRM = () => {
    if (role === 'CATEROR') return true;
    const crmAccess = restriction?.crmdashboardpage;
    return crmAccess === 'VIEW' || crmAccess === 'EDIT';
  };

  const hasCRMEditAccess = () => {
    if (role === 'CATEROR') return true;
    return restriction?.crmdashboardpage === 'EDIT';
  };

  // Create a conditional CRM component
  const ConditionalCRM = ({EventId}: {EventId: string}) => {
    const hasAccess = canAccessCRM();
    const hasEdit = hasCRMEditAccess();

    if (!hasAccess) {
      return (
        <div className="p-8 text-center">
          <div className="mb-4 flex justify-center">
            <svg
              className="text-gray-400 h-16 w-16"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h3 className="text-gray-700 dark:text-gray-300 mb-2 text-xl font-semibold">
            Access Restricted
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            You don't have permission to view the CRM module.
          </p>
        </div>
      );
    }

    return <MainEventCRMPage PropsEventId={EventId} hasEditAccess={hasEdit} />;
  };

  console.log('User Plan from context:', user?.plan);

  const userPlan = user?.plan?.toUpperCase();

  const isBasicPlan = userPlan === 'BASIC';
  const isProPlan = userPlan === 'PRO';
  const isPremiumPlan = userPlan === 'PREMIUM';
  const isUltraPremiumPlan = userPlan === 'ULTRAPREMIUM';

  // Color palette for groups (matching theme)
  const getGroupColors = () => {
    return ['blue', 'green', 'orange', 'purple', 'red', 'indigo'];
  };

  const groupColors = getGroupColors();

  const getGroups = () => {
    console.log('Getting groups for plan:', userPlan);

    // Helper function to check if a feature should be shown based on plan
    const shouldShowFeature = (feature: string) => {
      if (isUltraPremiumPlan) return true;
      if (isPremiumPlan) {
        // Premium has everything except SOP Management
        return feature !== 'sopmanagement';
      }
      if (isProPlan) {
        // Pro features - including After Event
        const proFeatures = [
          'subEventPage',
          'rawmaterialCalculator',
          'rawMaterialOrder',
          // 'eventRateListPage',
          'quotation',
          'bill',
          'headerIncomeExpense',
          'afterEvent', // Added After Event for Pro plan
        ];
        return proFeatures.includes(feature);
      }
      if (isBasicPlan) {
        // Basic has only core features
        const basicFeatures = [
          'subEventPage',
          'rawmaterialCalculator',
          'rawMaterialOrder',
        ];
        return basicFeatures.includes(feature);
      }
      return false;
    };

    // Define all possible tabs (same structure as UltraPremium)
    const groups = [
      {
        name: 'Sales & Planning',
        colorIndex: 0,
        steps: [
          {
            label: 'CRM',
            comp: isUltraPremiumPlan ? (
              <MainEventCRMPage PropsEventId={EventId} />
            ) : (
              <ConditionalCRM EventId={EventId} />
            ),
            key: 'crmPage',
            show: shouldShowFeature('crmPage'),
          },
          {
            label: 'Sub Event',
            comp: <SubEventPackage />,
            key: 'subEventPage',
            show: shouldShowFeature('subEventPage'),
          },
          {
            label: 'Event Budgeting',
            comp: <EventRateListNew />,
            key: 'eventRateListPage',
            show: shouldShowFeature('eventRateListPage'),
          },
          {
            label: 'Quotation',
            comp: <Quotation />,
            key: 'quotation',
            show: shouldShowFeature('quotation'),
          },
        ].filter((step) => step.show),
      },
      {
        name: 'Production',
        colorIndex: 1,
        steps: [
          {
            label: 'Raw Material Calculator',
            comp: <DishCalculatorWrapper />,
            key: 'rawmaterialCalculator',
            show: shouldShowFeature('rawmaterialCalculator'),
          },
          {
            label: 'Raw Material List',
            comp: <RawMaterialOrder />,
            key: 'rawMaterialOrder',
            show: shouldShowFeature('rawMaterialOrder'),
          },
          {
            label: 'Tender',
            comp: <Tender />,
            key: 'tender',
            show: shouldShowFeature('tender'),
          },
          {
            label: 'Purchase Order',
            comp: <EventPoPage />,
            key: 'purchaseOrder',
            show: shouldShowFeature('purchaseOrder'),
          },
        ].filter((step) => step.show),
      },
      {
        name: 'Execution',
        colorIndex: 2,
        steps: [
          {
            label: 'Cutting List',
            comp: <DisplayAllDishProcess />,
            key: 'dishProcess',
            show: shouldShowFeature('dishProcess'),
          },
          {
            label: 'Staff Summary',
            comp: <AssignManger />,
            key: 'assignManager',
            show: shouldShowFeature('assignManager'),
          },
          {
            label: 'Manager Report',
            comp: <ManagerMenu />,
            key: 'managerMenu',
            show: shouldShowFeature('managerMenu'),
          },
          {
            label: 'Utensils & Disposals',
            comp: <EventUtensilsDisposal />,
            key: 'utensilsDisposal',
            show: shouldShowFeature('utensilsDisposal'),
          },
          {
            label: 'Event Floor',
            comp: <EventFloorPlan />,
            key: 'eventfloor',
            show: shouldShowFeature('eventfloor'),
          },
          {
            label: 'SOP Management',
            comp: <SopManagement />,
            key: 'sopmanagement',
            show: shouldShowFeature('sopmanagement'),
          },
        ].filter((step) => step.show),
      },
      {
        name: 'After Event',
        colorIndex: 3,
        directComponent: <AfterEvent />,
        show: shouldShowFeature('afterEvent'),
      },
      {
        name: 'Billing & Analysis',
        colorIndex: 4,
        steps: [
          {
            label: 'Bill',
            comp: <Bill />,
            key: 'bill',
            show: shouldShowFeature('bill'),
          },
          {
            label: 'Income Expense',
            comp: <MainIncomeExpense />,
            key: 'headerIncomeExpense',
            show: shouldShowFeature('headerIncomeExpense'),
          },
          {
            label: 'Event Analysis',
            comp: <CostAnalysisDashboard />,
            key: 'costAnalysis',
            show: shouldShowFeature('costAnalysis'),
          },
        ].filter((step) => step.show),
      },
    ].filter((group) => {
      // Filter out groups that have no steps (for non-direct component groups)
      if (group.directComponent) {
        return group.show !== false;
      }
      return group.steps && group.steps.length > 0;
    });

    return groups;
  };

  const groups = getGroups();

  // Initialize state with proper values based on groups availability
  const [activeGroup, setActiveGroup] = React.useState(() => {
    const savedGroup = parseInt(
      sessionStorage.getItem('em-activeGroup') || '0',
      10,
    );
    // Ensure the saved group index is within the groups array bounds
    return savedGroup < groups.length ? savedGroup : 0;
  });

  const [activeSub, setActiveSub] = React.useState(() => {
    const savedSub = parseInt(
      sessionStorage.getItem('em-activeSub') || '0',
      10,
    );
    // Ensure the saved sub index is within the current group's steps bounds
    const currentGroupSteps = groups[activeGroup]?.steps;
    if (currentGroupSteps && savedSub < currentGroupSteps.length) {
      return savedSub;
    }
    return 0;
  });

  useEffect(() => {
    sessionStorage.setItem('em-activeGroup', activeGroup.toString());
    sessionStorage.setItem('em-activeSub', activeSub.toString());
  }, [activeGroup, activeSub]);

  // Get current group safely
  const currentGroup = groups[activeGroup];

  // Check if current group is a direct component (like After Event)
  const isDirectComponent = currentGroup && 'directComponent' in currentGroup;

  const currentStep = isDirectComponent
    ? null
    : currentGroup?.steps?.[activeSub];

  const canAccess = (key: string | null) => {
    if (!key) return true;
    if (role === 'CATEROR') return true;
    return restriction?.[key] !== 'BLOCK';
  };

  const getTabClasses = (
    colorIndex: number,
    isActive: boolean,
    isHover: boolean = false,
    isDisabled: boolean = false,
  ) => {
    const color = groupColors[colorIndex];
    const base = `transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-md whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium cursor-pointer select-none ${
      isDisabled ? 'opacity-50 cursor-not-allowed' : ''
    }`;

    if (isActive) {
      return `${base} border-${color}-600 bg-${color}-100 text-${color}-600 shadow-lg dark:border-${color}-500 dark:bg-${color}-900/30 dark:text-${color}-400`;
    }

    return `${base} border-transparent text-gray-500 hover:border-${color}-300 hover:bg-${color}-50 dark:text-gray-400 dark:hover:border-${color}-600 dark:hover:bg-${color}-800/50`;
  };

  const handleMainClick = (idx: number) => {
    if (activeGroup !== idx) {
      setActiveGroup(idx);
      setActiveSub(0);
    }
  };

  const handleSubClick = (idx: number) => {
    if (!canAccess(currentGroup.steps[idx].key)) {
      toast.error('Access restricted');
      return;
    }
    setActiveSub(idx);
  };

  console.log('Groups:', groups);
  console.log('Current Group:', currentGroup);
  console.log('Groups length:', groups.length);
  console.log('Active Group index:', activeGroup);

  if (!currentGroup || groups.length === 0) {
    return (
      <div className="p-8 text-center">
        No modules available for your plan. Current plan: {userPlan}
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* MAIN TABS */}
      <div className="flex w-full items-center border-b border-stroke dark:border-strokedark">
        <div id="main" className="scrollbar-hide w-full flex-1 overflow-x-auto">
          <div className="flex w-full gap-1">
            {groups.map((g, i) => (
              <button
                key={i}
                onClick={() => handleMainClick(i)}
                className={`${getTabClasses(g.colorIndex, activeGroup === i)} flex-1 text-center`}
              >
                {g.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* SUB TABS — Only show if NOT direct component */}
      {!isDirectComponent && currentGroup?.steps && (
        <div className="bg-gray-50 flex items-center border-b border-stroke dark:border-strokedark dark:bg-boxdark-2">
          <div id="sub" className="scrollbar-hide flex-1 overflow-x-auto">
            <div className="flex min-w-max gap-1">
              {currentGroup.steps.map((s, i) => (
                <button
                  key={i}
                  onClick={() => handleSubClick(i)}
                  disabled={!canAccess(s.key)}
                  className={getTabClasses(
                    currentGroup.colorIndex,
                    activeSub === i,
                    false,
                    !canAccess(s.key),
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CONTENT */}
      <div className="">
        <React.Suspense
          fallback={<div className="p-8 text-center">Loading...</div>}
        >
          {isDirectComponent ? (
            currentGroup.directComponent
          ) : currentStep && canAccess(currentStep.key) ? (
            currentStep.comp
          ) : (
            <div className="p-8 text-center text-red-500">Access Denied</div>
          )}
        </React.Suspense>
      </div>
    </div>
  );
};

export default EventManagement;
