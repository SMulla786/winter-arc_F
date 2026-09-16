import React, {useState, useMemo} from 'react';
import {
  FiCalendar,
  FiEdit,
  FiTrash2,
  FiPlus,
  FiCheck,
  FiX,
  FiChevronDown,
} from 'react-icons/fi';
import GenericTable, {Column} from '../Forms/Table/GenericTable';

interface FoodVendorItem {
  id: string;
  eventList: string;
  dateTime: string;
  subEvent: string;
  event: string;
  category: string;
  dishes: string[];
  vendor: string;
  orderPeople: number;
  preparePeople: number;
  price: number;
  total: number;
  afterEventTotal: number;
}

const isValidDate = (dateString: string) => {
  if (!dateString) return false;
  const date = new Date(dateString);
  return !isNaN(date.getTime());
};

const formatDate = (dateString: string) => {
  if (!dateString) return 'DD/MM/YYYY';
  const date = new Date(dateString);
  return isNaN(date.getTime())
    ? 'DD/MM/YYYY'
    : date.toLocaleDateString('en-GB');
};

const FoodVendorModule = () => {
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedVendors, setSelectedVendors] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    orderPeople: 0,
    preparePeople: 0,
    price: 0,
    total: 0,
    afterEventTotal: 0,
  });
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isVendorDropdownOpen, setIsVendorDropdownOpen] = useState(false);

  // Static sample data
  const sampleData: FoodVendorItem[] = [
    {
      id: '1',
      eventList: 'Wedding Ceremony',
      dateTime: '2024-01-15T10:00:00',
      subEvent: 'Reception',
      event: 'Main Event',
      category: 'Vegetarian',
      dishes: ['Paneer Tikka', 'Butter Naan', 'Dal Makhani'],
      vendor: 'Spice Garden',
      orderPeople: 150,
      preparePeople: 145,
      price: 500,
      total: 75000,
      afterEventTotal: 72500,
    },
    {
      id: '2',
      eventList: 'Corporate Conference',
      dateTime: '2024-01-20T09:00:00',
      subEvent: 'Lunch',
      event: 'Business Meeting',
      category: 'Non-Vegetarian',
      dishes: ['Chicken Biryani', 'Fish Curry', 'Mutton Kebab'],
      vendor: 'Royal Kitchen',
      orderPeople: 200,
      preparePeople: 195,
      price: 650,
      total: 130000,
      afterEventTotal: 126750,
    },
    {
      id: '3',
      eventList: 'Birthday Party',
      dateTime: '2024-01-25T18:00:00',
      subEvent: 'Dinner',
      event: 'Celebration',
      category: 'Mixed',
      dishes: ['Pizza', 'Pasta', 'Garlic Bread'],
      vendor: 'Italian Bistro',
      orderPeople: 80,
      preparePeople: 78,
      price: 350,
      total: 28000,
      afterEventTotal: 27300,
    },
  ];

  const categories = ['Vegetarian', 'Non-Vegetarian', 'Mixed', 'Vegan', 'Jain'];
  const vendors = Array.from(new Set(sampleData.map((item) => item.vendor)));

  const selectAllCategories = () => {
    setSelectedCategories(categories);
  };

  const clearAllCategories = () => {
    setSelectedCategories([]);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category],
    );
  };

  const selectAllVendors = () => {
    setSelectedVendors(vendors);
  };

  const clearAllVendors = () => {
    setSelectedVendors([]);
  };

  const handleVendorChange = (vendor: string) => {
    setSelectedVendors((prev) =>
      prev.includes(vendor)
        ? prev.filter((v) => v !== vendor)
        : [...prev, vendor],
    );
  };

  const startEditing = (item: FoodVendorItem) => {
    setEditingId(item.id);
    setEditForm({
      orderPeople: item.orderPeople,
      preparePeople: item.preparePeople,
      price: item.price,
      total: item.total,
      afterEventTotal: item.afterEventTotal,
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm({
      orderPeople: 0,
      preparePeople: 0,
      price: 0,
      total: 0,
      afterEventTotal: 0,
    });
  };

  const saveEditing = (id: string) => {
    console.log('Saving data for:', id, editForm);
    setEditingId(null);
  };

  const handleInputChange = (field: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setEditForm((prev) => ({
      ...prev,
      [field]: numValue,
    }));
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      console.log('Deleting item:', id);
    }
  };

  const handleEdit = (item: FoodVendorItem) => {
    startEditing(item);
  };

  // Filter data based on selected vendors
  const filteredData = useMemo(() => {
    if (selectedVendors.length === 0) return sampleData;
    return sampleData.filter((item) => selectedVendors.includes(item.vendor));
  }, [sampleData, selectedVendors]);

  // Define columns for GenericTable
  const columns: Column<FoodVendorItem>[] = [
    {
      header: 'Event List',
      accessor: 'eventList',
      className: 'font-medium text-black dark:text-white min-w-[150px]',
      sortable: true,
    },
    {
      header: 'Date/Time',
      accessor: 'dateTime',
      sortable: true,
      className: 'min-w-[150px]',
      render: (item) => (
        <span className="text-black dark:text-white">
          {new Date(item.dateTime).toLocaleString('en-GB')}
        </span>
      ),
    },
    {
      header: 'Sub Event',
      accessor: 'subEvent',
      sortable: true,
      className: 'min-w-[120px]',
      render: (item) => (
        <span className="text-black dark:text-white">{item.subEvent}</span>
      ),
    },
    {
      header: 'Event',
      accessor: 'event',
      sortable: true,
      className: 'min-w-[120px]',
      render: (item) => (
        <span className="text-black dark:text-white">{item.event}</span>
      ),
    },
    {
      header: 'Category',
      accessor: 'category',
      sortable: true,
      className: 'min-w-[120px]',
      render: (item) => (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            item.category === 'Vegetarian'
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : item.category === 'Non-Vegetarian'
                ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
          }`}
        >
          {item.category}
        </span>
      ),
    },
    {
      header: 'Dishes',
      accessor: 'dishes',
      className: 'min-w-[180px]',
      render: (item) => (
        <div>
          <div className="flex flex-wrap gap-1">
            {item.dishes.slice(0, 2).map((dish, index) => (
              <span
                key={index}
                className="bg-gray-100 dark:bg-gray-700 inline-flex items-center rounded-md border border-stroke px-2 py-1 text-xs dark:border-strokedark"
              >
                {dish}
              </span>
            ))}
          </div>
          {item.dishes.length > 2 && (
            <span className="mt-1 inline-block text-xs text-blue-600 dark:text-blue-400">
              +{item.dishes.length - 2} more
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'Vendor',
      accessor: 'vendor',
      sortable: true,
      className: 'min-w-[130px]',
      render: (item) => (
        <div>
          <select className="w-full rounded border border-stroke px-2 py-1 text-sm focus:border-primary focus:outline-none dark:border-strokedark dark:bg-form-input dark:text-white">
            <option value="">Select Vendor</option>
            {vendors.map((vendor) => (
              <option key={vendor} value={vendor}>
                {vendor}
              </option>
            ))}
          </select>
        </div>
      ),
    },
    {
      header: 'Order People',
      accessor: 'orderPeople',
      sortable: true,
      className: 'min-w-[120px]',
      render: (item) => (
        <div>
          {editingId === item.id ? (
            <input
              type="number"
              value={editForm.orderPeople}
              onChange={(e) => handleInputChange('orderPeople', e.target.value)}
              className="w-20 rounded border border-stroke px-2 py-1 text-sm focus:border-primary focus:outline-none dark:border-strokedark dark:bg-form-input dark:text-white"
            />
          ) : (
            <span className="text-black dark:text-white">
              {item.orderPeople}
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'Prepare People',
      accessor: 'preparePeople',
      sortable: true,
      className: 'min-w-[120px]',
      render: (item) => (
        <div>
          {editingId === item.id ? (
            <input
              type="number"
              value={editForm.preparePeople}
              onChange={(e) =>
                handleInputChange('preparePeople', e.target.value)
              }
              className="w-20 rounded border border-stroke px-2 py-1 text-sm focus:border-primary focus:outline-none dark:border-strokedark dark:bg-form-input dark:text-white"
            />
          ) : (
            <span className="text-black dark:text-white">
              {item.preparePeople}
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'Price',
      accessor: 'price',
      sortable: true,
      className: 'min-w-[100px]',
      render: (item) => (
        <div>
          {editingId === item.id ? (
            <input
              type="number"
              value={editForm.price}
              onChange={(e) => handleInputChange('price', e.target.value)}
              className="w-20 rounded border border-stroke px-2 py-1 text-sm focus:border-primary focus:outline-none dark:border-strokedark dark:bg-form-input dark:text-white"
            />
          ) : (
            <span className="text-black dark:text-white">₹{item.price}</span>
          )}
        </div>
      ),
    },
    {
      header: 'Total',
      accessor: 'total',
      sortable: true,
      className: 'min-w-[120px]',
      render: (item) => (
        <div>
          {editingId === item.id ? (
            <input
              type="number"
              value={editForm.total}
              onChange={(e) => handleInputChange('total', e.target.value)}
              className="w-24 rounded border border-stroke px-2 py-1 text-sm focus:border-primary focus:outline-none dark:border-strokedark dark:bg-form-input dark:text-white"
            />
          ) : (
            <span className="text-black dark:text-white">
              ₹{item.total.toLocaleString()}
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'After Event Total',
      accessor: 'afterEventTotal',
      sortable: true,
      className: 'min-w-[150px]',
      render: (item) => (
        <div>
          {editingId === item.id ? (
            <input
              type="number"
              value={editForm.afterEventTotal}
              onChange={(e) =>
                handleInputChange('afterEventTotal', e.target.value)
              }
              className="w-24 rounded border border-stroke px-2 py-1 text-sm focus:border-primary focus:outline-none dark:border-strokedark dark:bg-form-input dark:text-white"
            />
          ) : (
            <span className="text-black dark:text-white">
              ₹{item.afterEventTotal.toLocaleString()}
            </span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="rounded-lg bg-white p-4 dark:bg-boxdark sm:p-6">
      <h2 className="mb-4 text-xl font-bold text-black dark:text-white sm:mb-6 sm:text-2xl">
        Food Vendor Module
      </h2>

      {/* Date Range Filter */}
      <div className="mb-6 rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 dark:border-blue-800 dark:from-blue-900/20 dark:to-indigo-900/20 sm:mb-8 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-800">
              <FiCalendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="font-medium text-black dark:text-white">
              Filter by Date Range:
            </span>
          </div>

          <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:gap-4">
            <div className="flex items-center gap-2">
              <label className="whitespace-nowrap text-sm font-medium text-black dark:text-white">
                From:
              </label>
              <div className="relative w-full sm:w-auto">
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                />
                <div className="flex w-full min-w-[120px] items-center justify-between rounded-lg border border-stroke px-3 py-2 text-black focus-within:border-primary dark:border-strokedark dark:bg-form-input dark:text-white sm:min-w-[140px]">
                  <span>
                    {isValidDate(fromDate)
                      ? formatDate(fromDate)
                      : 'DD/MM/YYYY'}
                  </span>
                  <FiCalendar className="text-gray-400 dark:text-gray-500 h-4 w-4" />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label className="whitespace-nowrap text-sm font-medium text-black dark:text-white">
                To:
              </label>
              <div className="relative w-full sm:w-auto">
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                />
                <div className="flex w-full min-w-[120px] items-center justify-between rounded-lg border border-stroke px-3 py-2 text-black focus-within:border-primary dark:border-strokedark dark:bg-form-input dark:text-white sm:min-w-[140px]">
                  <span>
                    {isValidDate(toDate) ? formatDate(toDate) : 'DD/MM/YYYY'}
                  </span>
                  <FiCalendar className="text-gray-400 dark:text-gray-500 h-4 w-4" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category and Vendor Filters */}
      <div className="mb-4 flex flex-col gap-4 sm:mb-6 sm:flex-row sm:items-start sm:gap-4">
        {/* Category Dropdown */}
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="whitespace-nowrap font-medium text-black dark:text-white">
            Category:
          </span>
          <div className="relative w-full sm:w-auto">
            <button
              onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
              className="hover:bg-gray-50 flex w-full min-w-[160px] items-center justify-between gap-2 rounded-lg border border-stroke bg-white px-3 py-2 dark:border-strokedark dark:bg-form-input dark:hover:bg-meta-4 sm:min-w-[200px]"
            >
              <span className="truncate text-sm text-black dark:text-white">
                {selectedCategories.length === 0
                  ? 'Select Categories'
                  : `${selectedCategories.length} selected`}
              </span>
              <FiChevronDown
                className={`text-gray-400 transition-transform ${isCategoryDropdownOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {isCategoryDropdownOpen && (
              <div className="absolute left-0 top-full z-10 mt-1 w-full min-w-[160px] rounded-lg border border-stroke bg-white shadow-lg dark:border-strokedark dark:bg-form-input sm:w-64">
                <div className="border-b border-stroke p-2 dark:border-strokedark">
                  <div className="mb-2 flex items-center justify-between">
                    <button
                      onClick={selectAllCategories}
                      className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400"
                    >
                      Select All
                    </button>
                    <button
                      onClick={clearAllCategories}
                      className="text-xs text-red-600 hover:text-red-800 dark:text-red-400"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {categories.map((category) => (
                      <label
                        key={category}
                        className="hover:bg-gray-100 flex cursor-pointer items-center gap-2 rounded p-2 dark:hover:bg-meta-4"
                      >
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(category)}
                          onChange={() => handleCategoryChange(category)}
                          className="rounded border-stroke text-blue-600 focus:ring-blue-500 dark:border-strokedark"
                        />
                        <span className="text-sm text-black dark:text-white">
                          {category}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Selected Categories and Vendors Pills */}
        {(selectedCategories.length > 0 || selectedVendors.length > 0) && (
          <div className="flex flex-wrap gap-2">
            {selectedCategories.map((category) => (
              <span
                key={`category-${category}`}
                className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200"
              >
                {category}
                <button
                  onClick={() => handleCategoryChange(category)}
                  className="ml-1.5 hover:text-blue-600"
                >
                  <FiX className="h-3 w-3" />
                </button>
              </span>
            ))}
            {selectedVendors.map((vendor) => (
              <span
                key={`vendor-${vendor}`}
                className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-1 text-xs font-medium text-purple-800 dark:bg-purple-900 dark:text-purple-200"
              >
                {vendor}
                <button
                  onClick={() => handleVendorChange(vendor)}
                  className="ml-1.5 hover:text-purple-600"
                >
                  <FiX className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Generic Table with horizontal scrolling */}
      <div className="relative w-full overflow-x-auto">
        <div className="min-w-[1200px]">
          <GenericTable
            data={filteredData}
            columns={columns}
            itemsPerPage={10}
            searchAble={true}
            title="Food Vendor Details"
            action={true}
            onEdit={handleEdit}
            onDelete={handleDelete}
            paginationOff={false}
          />
        </div>
      </div>

      {/* Edit/Save Controls */}
      {editingId && (
        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={() => saveEditing(editingId)}
            className="flex items-center gap-2 rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
          >
            <FiCheck className="h-4 w-4" />
            Save Changes
          </button>
          <button
            onClick={cancelEditing}
            className="flex items-center gap-2 rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          >
            <FiX className="h-4 w-4" />
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default FoodVendorModule;
