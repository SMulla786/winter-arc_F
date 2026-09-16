import {useAuthContext} from '@/context/AuthContext';
import {useModulewise} from '@/lib/react-query/queriesAndMutations/admin/module';
import React, {useState, useEffect} from 'react';
import toast from 'react-hot-toast';

const ModuleWise = () => {
  const {user} = useAuthContext();
  const {mutate: savemodule, isPending} = useModulewise();

  const [selectedModules, setSelectedModules] = useState([]);

  const [totalUsers, setTotalUsers] = useState('');
  const [totalPrice, setTotalPrice] = useState('');
  const [totalAmc, setTotalAmc] = useState('');

  // All modules
  const allModules = [
    {id: 'common', name: 'Common Module'},
    {id: 'crm', name: 'CRM'},
    {id: 'chatbot', name: 'Chatbot'},
    {id: 'marketing', name: 'Marketing'},
    {id: 'customer_menu', name: 'Customer Menu Selection'},
    {id: 'event_budgeting', name: 'Event Budgeting'},
    {id: 'vendor_management', name: 'Vendor Management'},
    {id: 'production', name: 'Production'},
    {id: 'multiple_production', name: 'Multiple Production'},
    {id: 'store_inventory', name: 'Store (Inventory) Management'},
    {id: 'floor_planning', name: 'Floor Planning'},
    {id: 'manager_menu', name: 'Manager Menu'},
    {id: 'cutting_list', name: 'Cutting List'},
    {id: 'utensils', name: 'Utensils and Disposal Management'},
    {id: 'billing', name: 'Billing and Quotation'},
    {id: 'wastage', name: 'Wastage Management'},
    {id: 'culinary', name: 'Culinary Management'},
    {id: 'income_expenditure', name: 'Income and Expenditure'},
    {id: 'advance_accounting', name: 'Advance Accounting and Analysis'},
    {id: 'staff_management', name: 'Staff Management'},
    {id: 'tendering', name: 'Raw Material Purchase Tendering System'},
    {id: 'website', name: 'Website'},
    {id: 'employee_sop', name: 'SOP and Office Management System'},
  ];

  // Load saved data
  useEffect(() => {
    const saved = localStorage.getItem('userModuleSelection');
    if (saved) {
      const data = JSON.parse(saved);
      setSelectedModules(data.selectedModules || []);

      setTotalUsers(data.totalUsers || '');
      setTotalPrice(data.totalPrice || '');
      setTotalAmc(data.totalAmc || '');
    }
  }, []);

  const toggleModule = (moduleId) => {
    setSelectedModules((prev) => {
      if (prev.includes(moduleId)) {
        return prev.filter((id) => id !== moduleId);
      } else {
        return [...prev, moduleId];
      }
    });
  };

  const calculateGrandTotal = () => {
    const price = parseFloat(totalPrice) || 0;
    const amc = parseFloat(totalAmc) || 0;
    return (price + amc).toFixed(2);
  };

  const handleSubmit = () => {
    if (selectedModules.length === 0) {
      toast.error('Please select at least one module');
      return;
    }

    if (!totalUsers || parseFloat(totalUsers) <= 0) {
      toast.error('Please enter valid number of users');
      return;
    }

    if (!totalPrice || parseFloat(totalPrice) <= 0) {
      toast.error('Please enter valid price');
      return;
    }

    const data = {
      selectedModules,
      totalUsers: parseInt(totalUsers) || 0,
      totalPrice: parseFloat(totalPrice) || 0,
      totalAmc: parseFloat(totalAmc) || 0,
      plan: 'CUSTOMPLAN',
      pages: [],
    };

    localStorage.setItem('userModuleSelection', JSON.stringify(data));
    savemodule(data);
  };

  const handleReset = () => {
    setSelectedModules([]);

    setTotalUsers('');
    setTotalPrice('');
    setTotalAmc('');
    toast.success('All reset');
  };

  // Get selected modules names for display
  const getSelectedModulesNames = () => {
    return selectedModules
      .map((id) => allModules.find((m) => m.id === id)?.name)
      .filter(Boolean)
      .join(', ');
  };

  return (
    <div className="mx-auto max-w-7xl p-4">
      {/* Header */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold">Custom Plan Configuration</h1>
        <div className="flex gap-2">
          <button
            onClick={handleReset}
            className="hover:bg-gray-50 rounded border px-3 py-1.5 text-sm"
          >
            Reset
          </button>
          <button
            onClick={handleSubmit}
            disabled={isPending}
            className="rounded bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isPending ? 'Saving...' : 'Save Plan'}
          </button>
        </div>
      </div>

      {/* Plan Details - Compact */}
      <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
        <h2 className="text-md mb-3 font-semibold text-blue-800">
          Plan Details
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <input
            type="number"
            value={totalUsers}
            onChange={(e) => setTotalUsers(e.target.value)}
            placeholder="Total Users *"
            className="border-gray-300 rounded border p-2 text-sm focus:border-blue-500 focus:outline-none"
          />
          <input
            type="number"
            value={totalPrice}
            onChange={(e) => setTotalPrice(e.target.value)}
            placeholder="Total Price (Rs) *"
            className="border-gray-300 rounded border p-2 text-sm focus:border-blue-500 focus:outline-none"
          />
          <input
            type="number"
            value={totalAmc}
            onChange={(e) => setTotalAmc(e.target.value)}
            placeholder="Total AMC (Rs/year)"
            className="border-gray-300 rounded border p-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* Grand Total - Compact */}
        <div className="mt-3 flex items-center justify-end gap-3 text-sm">
          <span className="font-semibold">Grand Total:</span>
          <span className="text-lg font-bold text-blue-600">
            ₹{calculateGrandTotal()}
          </span>
          {totalPrice && (
            <span className="text-gray-500 text-xs">
              (Price: ₹{parseFloat(totalPrice) || 0} + AMC: ₹
              {parseFloat(totalAmc) || 0})
            </span>
          )}
        </div>
      </div>

      {/* Selected Modules - Compact Chip View */}
      {selectedModules.length > 0 && (
        <div className="mb-3 rounded-lg border border-green-200 bg-green-50 p-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-green-800">
              ✓ {selectedModules.length} modules selected:
            </span>
            <span className="text-gray-700 text-sm">
              {getSelectedModulesNames()}
            </span>
          </div>
        </div>
      )}

      {/* Modules Selection - Simple Grid Layout (No Scrollbar) */}
      <div className="border-gray-200 rounded-lg border bg-white">
        <div className="border-gray-200 bg-gray-50 border-b p-3">
          <h3 className="text-md font-semibold">Select Modules</h3>
        </div>
        <div className="max-h-[500px] overflow-y-auto p-3">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
            {allModules.map((module) => (
              <label
                key={module.id}
                className="hover:bg-gray-50 flex cursor-pointer items-center rounded p-2"
              >
                <input
                  type="checkbox"
                  checked={selectedModules.includes(module.id)}
                  onChange={() => toggleModule(module.id)}
                  className="mr-2 h-4 w-4"
                />
                <span className="text-sm">
                  {module.name}
                  {module.id === 'common' && (
                    <span className="ml-1 rounded bg-blue-100 px-1.5 py-0.5 text-xs text-blue-700">
                      Core
                    </span>
                  )}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Selection Stats */}
      <div className="text-gray-500 mt-3 text-center text-xs">
        Selected {selectedModules.length} of {allModules.length} modules
      </div>
    </div>
  );
};

export default ModuleWise;
