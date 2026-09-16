/*eslint-disable*/
import React, {useEffect, useState, useRef} from 'react';
import {FormProvider, useForm, Controller} from 'react-hook-form';
import {
  useGetAllEmployee,
  useUpdateEmployeeSetting,
} from '@/lib/react-query/queriesAndMutations/cateror/Employee/employee';
import {employeeSettingValidationSchema} from '@/lib/validation/employeeSchema';
import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';
import GenericDropdown from '../Forms/DropDown/GenericDropDown';
import CategoryAccordion from '../Employeepanel/CategoryAccordion';

type FormValues = z.infer<typeof employeeSettingValidationSchema>;

// Define module groups
const MODULE_GROUPS = {
  CommonModule: ['clientPage', 'eventPage'],
  CRM: ['crmdashboardpage', 'eventwisecrm'],
  Marketing: ['subEventPage', 'googlereview'],
  Dashboard: [
    'eventPage',
    'subEventPage',
    'eventRateListPage',
    'quotation',
    'rawmaterialCalculator',
    'rawMaterialOrder',
    'dishProcess',
    'eventDisposals',
    'eventUtensils',
    'afterEvent',
    'bill',
    'headerIncomeExpense',
    'peopleCheck',
    'westageReport',
    'rawMaterialReturn',
    'utensilChecking',
    'afterEventDisposal',
    'packagePage',
    'addonServicePage',
  ],
  Client: ['clientPage'],
  Dish: [
    'dishPage',
    'rawMaterialCategoryPage',
    'rawMaterialPage',
    'rawMaterialProcessPage',
    'dishCategoryPage',
  ],
  AddOnServices: ['addonServicePage'],
  Package: ['packagePage'],
  StaffManagement: ['dresscodepage', 'counterpage', 'vendorPage'],
  UtensilsDisposal: [
    'utensilPage',
    'utensilCategoryPage',
    'utensilsInventoryPage',
    'utensilpeoplepage',
    'disposalCategoryPage',
    'disposalPage',
    'disposalInventoryPage',
    'disposalpeoplepage',
  ],
  Cutlery: ['cutlerypage', 'mastercutlerypage', 'cutlerycategorypage'],
  Vendor: [
    'foodVendorPage',
    'rawmaterialvendorpage',
    'displayvendorpage',
    'disposalvendorpage',
  ],
  Vehicle: ['vehiclepage'],

  PurchaseOrder: ['dishCountandRMOrder'],
  Store: [
    'storeInventory',
    'inwordStore',
    'outwordStore',
    'inwordHistory',
    'outwordHistory',
  ],
  IncomeExpenditure: ['incomeExpenditurePage'],
  Reports: [
    'pendingBillReport',
    'storeReport',
    'wastageReport',
    'disposalReport',
    'utensilsReport',
  ],
  BanquetManagement: ['banquetpage'],
  Setting: ['fuelMaster'],
  Expense: ['expenseMasterPage'],
  Settings: [
    'settingPage',
    'employeeSettingPage',
    'paymentDetailsPage',
    'termsConditionsPage',
    'vendorRolePage',
    'websiteContentPage',
    'imageUploadPage',
    'createEmployeePage',
  ],
};

// Convert module groups to dropdown options
const moduleOptions = Object.keys(MODULE_GROUPS).map((moduleName) => ({
  value: moduleName,
  label: moduleName.replace(/([A-Z])/g, ' $1').trim(),
}));

const EmployeeSetting = () => {
  const methods = useForm<FormValues>({
    resolver: zodResolver(employeeSettingValidationSchema),
  });

  const {data: employee} = useGetAllEmployee();
  const {mutate: updateEmployeeSetting, isPending} = useUpdateEmployeeSetting();

  const [employeeOptions, setEmployeeOptions] = useState<
    {value: string; label: string}[]
  >([]);
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [isModuleDropdownOpen, setIsModuleDropdownOpen] = useState(false);
  const [moduleSearchTerm, setModuleSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsModuleDropdownOpen(false);
        setModuleSearchTerm('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (employee?.data?.length) {
      const filtered = employee.data
        .filter((emp: any) => emp.fullname && emp.id)
        .map((emp: any) => ({
          value: emp.id,
          label: `${emp.fullname} (${emp.phoneNumber})`,
        }));
      setEmployeeOptions(filtered);
    }
  }, [employee]);

  const selectedEmployeeId = methods.watch('employeeId');

  // Filter modules based on search term
  const filteredModules = moduleOptions.filter((module) =>
    module.label.toLowerCase().includes(moduleSearchTerm.toLowerCase()),
  );

  // Toggle module selection in multi-select dropdown
  const toggleModule = (moduleValue: string) => {
    if (selectedModules.includes(moduleValue)) {
      setSelectedModules(selectedModules.filter((m) => m !== moduleValue));
    } else {
      setSelectedModules([...selectedModules, moduleValue]);
    }
  };

  // Select/Deselect all modules
  const toggleAllModules = () => {
    if (selectedModules.length === Object.keys(MODULE_GROUPS).length) {
      setSelectedModules([]);
    } else {
      setSelectedModules(Object.keys(MODULE_GROUPS));
    }
  };

  // Remove a module from selection
  const removeModule = (moduleToRemove: string) => {
    setSelectedModules(selectedModules.filter((m) => m !== moduleToRemove));
  };

  // Check if a field belongs to any selected module
  const isFieldVisible = (fieldName: string): boolean => {
    if (selectedModules.length === 0) return true; // Show all if none selected
    for (const moduleName of selectedModules) {
      const fields = MODULE_GROUPS[moduleName as keyof typeof MODULE_GROUPS];
      if (fields && fields.includes(fieldName)) {
        return true;
      }
    }
    return false;
  };

  useEffect(() => {
    if (selectedEmployeeId) {
      const selectedEmp = employee?.data?.find(
        (emp: any) => emp.id === selectedEmployeeId,
      );

      if (selectedEmp?.employeeRestriction) {
        const restriction = selectedEmp.employeeRestriction;
        methods.reset({
          cutlerypage: String(restriction.cutlerypage),
          crmdashboardpage: String(restriction.crmdashboardpage),
          employeeId: selectedEmployeeId,
          eventPage: String(restriction.eventPage),
          clientPage: String(restriction.clientPage),
          packagePage: String(restriction.packagePage),
          reportsPage: String(restriction.reportsPage),
          dishPage: String(restriction.dishPage),
          settingPage: String(restriction.settingPage),
          maharajPage: String(restriction.maharajPage),
          utensilPage: String(restriction.utensilPage),
          disposalPage: String(restriction.disposalPage),
          addonServicePage: String(restriction.addonServicePage),
          foodVendorPage: String(restriction.foodVendorPage),
          incomeExpenditurePage: String(restriction.incomeExpenditurePage),
          notificationDishPage: String(restriction.notificationDishPage),
          expenseMasterPage: String(restriction.expenseMasterPage),
          vendorPage: String(restriction.vendorPage),
          employeeSettingPage: String(restriction.employeeSettingPage),
          rawMaterialCategoryPage: String(restriction.rawMaterialCategoryPage),
          createPackagePage: String(restriction.createPackagePage),
          displayPackagePage: String(restriction.displayPackagePage),
          rawMaterialPage: String(restriction.rawMaterialPage),
          rawMaterialProcessPage: String(restriction.rawMaterialProcessPage),
          dishCategoryPage: String(restriction.dishCategoryPage),
          createDishPage: String(restriction.createDishPage),
          allDishesPage: String(restriction.allDishesPage),
          paymentDetailsPage: String(restriction.paymentDetailsPage),
          termsConditionsPage: String(restriction.termsConditionsPage),
          vendorRolePage: String(restriction.vendorRolePage),
          websiteContentPage: String(restriction.websiteContentPage),
          imageUploadPage: String(restriction.imageUploadPage),
          utensilCategoryPage: String(restriction.utensilCategoryPage),
          createUtensilsPage: String(restriction.createUtensilsPage),
          utensilsInventoryPage: String(restriction.utensilsInventoryPage),
          disposalCategoryPage: String(restriction.disposalCategoryPage),
          createDisposalPage: String(restriction.createDisposalPage),
          disposalInventoryPage: String(restriction.disposalInventoryPage),
          createEmployeePage: String(restriction.createEmployeePage),
          subEventPage: String(restriction.subEventPage),
          eventRateListPage: String(restriction.eventRateListPage),
          quotation: String(restriction.quotation),
          rawmaterialCalculator: String(restriction.rawmaterialCalculator),
          rawMaterialOrder: String(restriction.rawMaterialOrder),
          dishProcess: String(restriction.dishProcess),
          eventDisposals: String(restriction.eventDisposals),
          eventUtensils: String(restriction.eventUtensils),
          afterEvent: String(restriction.afterEvent),
          bill: String(restriction.bill),
          headerIncomeExpense: String(restriction.headerIncomeExpense),
          peopleCheck: String(restriction.peopleCheck),
          westageReport: String(restriction.westageReport),
          rawMaterialReturn: String(restriction.rawMaterialReturn),
          utensilChecking: String(restriction.utensilChecking),
          afterEventDisposal: String(restriction.afterEventDisposal),
          vehiclepage: String(restriction.vehiclepage),
          dresscodepage: String(restriction.dresscodepage),
          counterpage: String(restriction.counterpage),
          utensilpeoplepage: String(restriction.utensilpeoplepage),
          disposalpeoplepage: String(restriction.utensilpeoplepage),
          cutlerycategorypage: String(restriction.utensilpeoplepage),
          mastercutlerypage: String(restriction.utensilpeoplepage),
          rawmaterialvendorpage: String(restriction.rawmaterialvendorpage),
          displayvendorpage: String(restriction.displayvendorpage),
          disposalvendorpage: String(restriction.disposalvendorpage),
          dishCountandRMOrder: String(restriction.dishCountandRMOrder),
          storeInventory: String(restriction.storeInventory),
          inwordStore: String(restriction.inwordStore),
          outwordStore: String(restriction.outwordStore),
          inwordHistory: String(restriction.inwordHistory),
          outwordHistory: String(restriction.outwordHistory),
          pendingBillReport: String(restriction.pendingBillReport),
          storeReport: String(restriction.storeReport),
          wastageReport: String(restriction.wastageReport),
          disposalReport: String(restriction.disposalReport),
          utensilsReport: String(restriction.utensilsReport),
          fuelMaster: String(restriction.fuelMaster),
          banquetpage: String(restriction.banquetpage),
        });
      }
    }
  }, [selectedEmployeeId, employee, methods]);

  const onSubmit = async (data: FormValues) => {
    console.log('subdata', data);
    try {
      if (!data.employeeId) {
        return;
      }
      updateEmployeeSetting({
        id: data.employeeId,
        data: {
          eventPage: data.eventPage,
          clientPage: data.clientPage,
          packagePage: data.packagePage,
          reportsPage: data.reportsPage,
          dishPage: data.dishPage,
          settingPage: data.settingPage,
          maharajPage: data.maharajPage,
          utensilPage: data.utensilPage,
          disposalPage: data.disposalPage,
          addonServicePage: data.addonServicePage,
          foodVendorPage: data.foodVendorPage,
          incomeExpenditurePage: data.incomeExpenditurePage,
          notificationDishPage: data.notificationDishPage,
          expenseMasterPage: data.expenseMasterPage,
          vendorPage: data.vendorPage,
          employeeSettingPage: data.employeeSettingPage,
          createPackagePage: data.createPackagePage,
          displayPackagePage: data.displayPackagePage,
          rawMaterialCategoryPage: data.rawMaterialCategoryPage,
          rawMaterialPage: data.rawMaterialPage,
          rawMaterialProcessPage: data.rawMaterialProcessPage,
          dishCategoryPage: data.dishCategoryPage,
          createDishPage: data.createDishPage,
          allDishesPage: data.allDishesPage,
          paymentDetailsPage: data.paymentDetailsPage,
          termsConditionsPage: data.termsConditionsPage,
          vendorRolePage: data.vendorRolePage,
          websiteContentPage: data.websiteContentPage,
          imageUploadPage: data.imageUploadPage,
          utensilCategoryPage: data.utensilCategoryPage,
          createUtensilsPage: data.createUtensilsPage,
          utensilsInventoryPage: data.utensilsInventoryPage,
          disposalCategoryPage: data.disposalCategoryPage,
          createDisposalPage: data.createDisposalPage,
          disposalInventoryPage: data.disposalInventoryPage,
          createEmployeePage: data.createEmployeePage,
          vehiclepage: data.vehiclepage,
          cutlerypage: data.cutlerypage,
          crmprocesspage: data.crmprocesspage,
          crmdashboardpage: data.crmdashboardpage,
          dresscodepage: data.dresscodepage,
          counterpage: data.counterpage,
          utensilpeoplepage: data.utensilpeoplepage,
          disposalpeoplepage: data.disposalpeoplepage,
          cutlerycategorypage: data.cutlerycategorypage,
          mastercutlerypage: data.mastercutlerypage,
          rawmaterialvendorpage: data.rawmaterialvendorpage,
          displayvendorpage: data.displayvendorpage,
          disposalvendorpage: data.disposalvendorpage,
          dishCountandRMOrder: data.dishCountandRMOrder,
          storeInventory: data.storeInventory,
          inwordStore: data.inwordStore,
          outwordStore: data.outwordStore,
          inwordHistory: data.inwordHistory,
          outwordHistory: data.outwordHistory,
          pendingBillReport: data.pendingBillReport,
          storeReport: data.storeReport,
          wastageReport: data.wastageReport,
          disposalReport: data.disposalReport,
          utensilsReport: data.utensilsReport,
          fuelMaster: data.fuelMaster,
          banquetpage: data.banquetpage,
          subEventPage: data.subEventPage,
          eventRateListPage: data.eventRateListPage,
          quotation: data.quotation,
          rawmaterialCalculator: data.rawmaterialCalculator,
          rawMaterialOrder: data.rawMaterialOrder,
          dishProcess: data.dishProcess,
          eventDisposals: data.eventDisposals,
          eventUtensils: data.eventUtensils,
          afterEvent: data.afterEvent,
          bill: data.bill,
          headerIncomeExpense: data.headerIncomeExpense,
          peopleCheck: data.peopleCheck,
          westageReport: data.westageReport,
          rawMaterialReturn: data.rawMaterialReturn,
          utensilChecking: data.utensilChecking,
          afterEventDisposal: data.afterEventDisposal,
        },
      });
    } catch (error) {
      console.error(error);
    }
  };

  // Radio Group Component for permissions
  const PermissionRadioGroup = ({
    name,
    label,
  }: {
    name: string;
    label: string;
  }) => {
    const [selectedValue, setSelectedValue] = useState<string>('');

    useEffect(() => {
      const value = methods.getValues(name as any);
      if (value) setSelectedValue(value);
    }, [methods.watch(name as any)]);

    return (
      <div className="mb-4">
        <label className="text-gray-700 dark:text-gray-300 mb-2 block text-sm font-medium">
          {label}
        </label>
        <div className="flex gap-4">
          {['VIEW', 'EDIT', 'BLOCK'].map((option) => (
            <label key={option} className="flex items-center gap-2">
              <input
                type="radio"
                value={option}
                checked={selectedValue === option}
                onChange={(e) => {
                  setSelectedValue(e.target.value);
                  methods.setValue(name as any, e.target.value);
                }}
                className="h-4 w-4 text-blue-600"
              />
              <span className="text-gray-700 dark:text-gray-300 text-sm">
                {option}
              </span>
            </label>
          ))}
        </div>
      </div>
    );
  };

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className="space-y-8 bg-white p-6 dark:bg-black md:p-8"
      >
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-black dark:text-white">
            Employee Settings
          </h1>
          <div className="flex w-64 flex-col">
            <label className="mb-2 text-sm font-bold text-black dark:text-white">
              Select Employee
            </label>
            <Controller
              name="employeeId"
              control={methods.control}
              render={({field}) => (
                <GenericDropdown
                  {...field}
                  label=""
                  options={employeeOptions}
                  control={methods.control}
                />
              )}
            />
          </div>
        </div>

        {/* Module Selection - Searchable Multi-Select Dropdown */}
        <div className="bg-gray-50 dark:bg-gray-900 mb-8 rounded-lg border border-stroke p-4 dark:border-stroke">
          <div className="mb-3">
            <label className="text-gray-700 dark:text-gray-300 mb-2 block text-sm font-medium">
              Select Modules to Configure
            </label>
            <div className="relative" ref={dropdownRef}>
              {/* Dropdown Trigger */}
              <div
                onClick={() => setIsModuleDropdownOpen(!isModuleDropdownOpen)}
                className="dark:bg-gray-800 min-h-[42px] w-full cursor-pointer rounded-md border border-stroke bg-white px-3 py-2 text-left dark:border-stroke"
              >
                {selectedModules.length === 0 ? (
                  <span className="text-gray-400">Select modules...</span>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {selectedModules.map((module) => (
                      <span
                        key={module}
                        className="inline-flex items-center gap-1 rounded-md bg-blue-100 px-2 py-1 text-sm text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                      >
                        {module.replace(/([A-Z])/g, ' $1').trim()}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeModule(module);
                          }}
                          className="ml-1 text-blue-600 hover:text-blue-800 dark:text-blue-400"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Dropdown Menu with Search */}
              {isModuleDropdownOpen && (
                <div className="dark:border-gray-600 dark:bg-gray-800 absolute left-0 right-0 z-10 mt-1 rounded-md border border-stroke bg-white shadow-lg">
                  {/* Search Input */}
                  <div className="dark:border-gray-700 border-b border-stroke p-2">
                    <input
                      type="text"
                      placeholder="Search modules..."
                      value={moduleSearchTerm}
                      onChange={(e) => setModuleSearchTerm(e.target.value)}
                      className="dark:bg-gray-700 w-full rounded-md border border-stroke px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-stroke dark:text-white"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>

                  {/* Select All Button */}
                  <div className="bg-gray-50 dark:border-gray-700 dark:bg-gray-900 sticky top-0 border-b border-stroke p-2">
                    <button
                      type="button"
                      onClick={toggleAllModules}
                      className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400"
                    >
                      {selectedModules.length ===
                      Object.keys(MODULE_GROUPS).length
                        ? 'Deselect All'
                        : 'Select All'}
                    </button>
                  </div>

                  {/* Module List */}
                  <div className="max-h-60 overflow-auto">
                    {filteredModules.length > 0 ? (
                      filteredModules.map((module) => (
                        <label
                          key={module.value}
                          className="hover:bg-gray-100 dark:hover:bg-gray-700 flex cursor-pointer items-center gap-2 px-3 py-2"
                        >
                          <input
                            type="checkbox"
                            checked={selectedModules.includes(module.value)}
                            onChange={() => toggleModule(module.value)}
                            className="h-4 w-4 rounded border-stroke text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-gray-700 dark:text-gray-300 text-sm">
                            {module.label}
                          </span>
                        </label>
                      ))
                    ) : (
                      <div className="text-gray-500 px-3 py-4 text-center text-sm">
                        No modules found
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {isFieldVisible('eventPage') && (
          <CategoryAccordion
            title="Common Module"
            className="text-black dark:text-white"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {MODULE_GROUPS.CommonModule.map((fieldName) => (
                <PermissionRadioGroup
                  key={fieldName}
                  name={fieldName}
                  label={fieldName
                    .replace(/([A-Z])/g, ' $1')
                    .replace(/^./, (str) => str.toUpperCase())}
                />
              ))}
            </div>
          </CategoryAccordion>
        )}

        {/* CRM Section */}
        {isFieldVisible('crmdashboardpage') && (
          <CategoryAccordion title="CRM" className="text-black dark:text-white">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {MODULE_GROUPS.CRM.map((fieldName) => (
                <PermissionRadioGroup
                  key={fieldName}
                  name={fieldName}
                  label="CRM Dashboard"
                />
              ))}
            </div>
          </CategoryAccordion>
        )}

        {/* Dashboard Section */}
        {/* {isFieldVisible('eventPage') && (
          <CategoryAccordion
            title="Dashboard"
            className="text-black dark:text-white"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {MODULE_GROUPS.Dashboard.map((fieldName) => (
                <PermissionRadioGroup
                  key={fieldName}
                  name={fieldName}
                  label={fieldName
                    .replace(/([A-Z])/g, ' $1')
                    .replace(/^./, (str) => str.toUpperCase())}
                />
              ))}
            </div>
          </CategoryAccordion>
        )} */}

        {/* Client Section */}
        {/* {isFieldVisible('clientPage') && (
          <CategoryAccordion
            title="Client"
            className="text-black dark:text-white"
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {MODULE_GROUPS.Client.map((fieldName) => (
                <PermissionRadioGroup
                  key={fieldName}
                  name={fieldName}
                  label="Client Page"
                />
              ))}
            </div>
          </CategoryAccordion>
        )} */}

        {/* Dish Section */}
        {/* {isFieldVisible('dishPage') && (
          <CategoryAccordion
            title="Dish"
            className="text-black dark:text-white"
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {MODULE_GROUPS.Dish.map((fieldName) => (
                <PermissionRadioGroup
                  key={fieldName}
                  name={fieldName}
                  label={fieldName
                    .replace(/([A-Z])/g, ' $1')
                    .replace(/^./, (str) => str.toUpperCase())}
                />
              ))}
            </div>
          </CategoryAccordion>
        )} */}

        {/* Add On Services Section */}
        {/* {isFieldVisible('addonServicePage') && (
          <CategoryAccordion
            title="Add On Services"
            className="text-black dark:text-white"
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {MODULE_GROUPS.AddOnServices.map((fieldName) => (
                <PermissionRadioGroup
                  key={fieldName}
                  name={fieldName}
                  label="Add On Service"
                />
              ))}
            </div>
          </CategoryAccordion>
        )} */}

        {/* Package Section */}
        {/* {isFieldVisible('packagePage') && (
          <CategoryAccordion
            title="Package"
            className="text-black dark:text-white"
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {MODULE_GROUPS.Package.map((fieldName) => (
                <PermissionRadioGroup
                  key={fieldName}
                  name={fieldName}
                  label="Package Page"
                />
              ))}
            </div>
          </CategoryAccordion>
        )} */}

        {/* Staff Management Section */}
        {/* {isFieldVisible('dresscodepage') && (
          <CategoryAccordion
            title="Staff Management"
            className="text-black dark:text-white"
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {MODULE_GROUPS.StaffManagement.map((fieldName) => (
                <PermissionRadioGroup
                  key={fieldName}
                  name={fieldName}
                  label={fieldName
                    .replace(/([A-Z])/g, ' $1')
                    .replace(/^./, (str) => str.toUpperCase())}
                />
              ))}
            </div>
          </CategoryAccordion>
        )} */}

        {/* Utensils & Disposal Section */}
        {/* {isFieldVisible('utensilPage') && (
          <CategoryAccordion
            title="Utensils & Disposal"
            className="text-black dark:text-white"
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {MODULE_GROUPS.UtensilsDisposal.map((fieldName) => (
                <PermissionRadioGroup
                  key={fieldName}
                  name={fieldName}
                  label={fieldName
                    .replace(/([A-Z])/g, ' $1')
                    .replace(/^./, (str) => str.toUpperCase())}
                />
              ))}
            </div>
          </CategoryAccordion>
        )} */}

        {/* Cutlery Section */}
        {/* {isFieldVisible('cutlerypage') && (
          <CategoryAccordion
            title="Cutlery"
            className="text-black dark:text-white"
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {MODULE_GROUPS.Cutlery.map((fieldName) => (
                <PermissionRadioGroup
                  key={fieldName}
                  name={fieldName}
                  label={fieldName
                    .replace(/([A-Z])/g, ' $1')
                    .replace(/^./, (str) => str.toUpperCase())}
                />
              ))}
            </div>
          </CategoryAccordion>
        )} */}

        {/* Vendor Section */}
        {/* {isFieldVisible('foodVendorPage') && (
          <CategoryAccordion
            title="Vendor"
            className="text-black dark:text-white"
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {MODULE_GROUPS.Vendor.map((fieldName) => (
                <PermissionRadioGroup
                  key={fieldName}
                  name={fieldName}
                  label={fieldName
                    .replace(/([A-Z])/g, ' $1')
                    .replace(/^./, (str) => str.toUpperCase())}
                />
              ))}
            </div>
          </CategoryAccordion>
        )} */}

        {/* Vehicle Section */}
        {/* {isFieldVisible('vehiclepage') && (
          <CategoryAccordion
            title="Vehicle"
            className="text-black dark:text-white"
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {MODULE_GROUPS.Vehicle.map((fieldName) => (
                <PermissionRadioGroup
                  key={fieldName}
                  name={fieldName}
                  label="Vehicle Page"
                />
              ))}
            </div>
          </CategoryAccordion>
        )} */}

        {/* Purchase Order Section */}
        {/* {isFieldVisible('dishCountandRMOrder') && (
          <CategoryAccordion
            title="Purchase Order"
            className="text-black dark:text-white"
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {MODULE_GROUPS.PurchaseOrder.map((fieldName) => (
                <PermissionRadioGroup
                  key={fieldName}
                  name={fieldName}
                  label="Purchase Order"
                />
              ))}
            </div>
          </CategoryAccordion>
        )} */}

        {/* Store Section */}
        {/* {isFieldVisible('storeInventory') && (
          <CategoryAccordion
            title="Store"
            className="text-black dark:text-white"
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {MODULE_GROUPS.Store.map((fieldName) => (
                <PermissionRadioGroup
                  key={fieldName}
                  name={fieldName}
                  label={fieldName
                    .replace(/([A-Z])/g, ' $1')
                    .replace(/^./, (str) => str.toUpperCase())}
                />
              ))}
            </div>
          </CategoryAccordion>
        )} */}

        {/* Income Expenditure Section */}
        {/* {isFieldVisible('incomeExpenditurePage') && (
          <CategoryAccordion
            title="Income Expenditure"
            className="text-black dark:text-white"
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {MODULE_GROUPS.IncomeExpenditure.map((fieldName) => (
                <PermissionRadioGroup
                  key={fieldName}
                  name={fieldName}
                  label="Income Expense Report"
                />
              ))}
            </div>
          </CategoryAccordion>
        )} */}

        {/* Reports Section */}
        {/* {isFieldVisible('pendingBillReport') && (
          <CategoryAccordion
            title="Reports"
            className="text-black dark:text-white"
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {MODULE_GROUPS.Reports.map((fieldName) => (
                <PermissionRadioGroup
                  key={fieldName}
                  name={fieldName}
                  label={fieldName
                    .replace(/([A-Z])/g, ' $1')
                    .replace(/^./, (str) => str.toUpperCase())}
                />
              ))}
            </div>
          </CategoryAccordion>
        )} */}

        {/* Banquet Management Section */}
        {/* {isFieldVisible('banquetpage') && (
          <CategoryAccordion
            title="Banquet Management"
            className="text-black dark:text-white"
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {MODULE_GROUPS.BanquetManagement.map((fieldName) => (
                <PermissionRadioGroup
                  key={fieldName}
                  name={fieldName}
                  label="Banquet Page"
                />
              ))}
            </div>
          </CategoryAccordion>
        )} */}

        {/* Setting Section */}
        {/* {isFieldVisible('fuelMaster') && (
          <CategoryAccordion
            title="Setting"
            className="text-black dark:text-white"
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {MODULE_GROUPS.Setting.map((fieldName) => (
                <PermissionRadioGroup
                  key={fieldName}
                  name={fieldName}
                  label="Fuel Master"
                />
              ))}
            </div>
          </CategoryAccordion>
        )} */}

        {/* Expense Section */}
        {/* {isFieldVisible('expenseMasterPage') && (
          <CategoryAccordion
            title="Expense"
            className="text-black dark:text-white"
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {MODULE_GROUPS.Expense.map((fieldName) => (
                <PermissionRadioGroup
                  key={fieldName}
                  name={fieldName}
                  label="Expense Master"
                />
              ))}
            </div>
          </CategoryAccordion>
        )} */}

        {/* Settings Section */}
        {/* {isFieldVisible('settingPage') && (
          <CategoryAccordion
            title="Settings"
            className="text-black dark:text-white"
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {MODULE_GROUPS.Settings.map((fieldName) => (
                <PermissionRadioGroup
                  key={fieldName}
                  name={fieldName}
                  label={fieldName
                    .replace(/([A-Z])/g, ' $1')
                    .replace(/^./, (str) => str.toUpperCase())}
                />
              ))}
            </div>
          </CategoryAccordion>
        )} */}

        {/* Submit Button */}
        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={isPending}
            className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isPending ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </FormProvider>
  );
};

export default EmployeeSetting;
