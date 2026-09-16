/* eslint-disable */
import React, {useState, useEffect, useMemo, useRef} from 'react';
import Select from 'react-select';
import {
  FiX,
  FiAlertCircle,
  FiChevronDown,
  FiChevronRight,
  FiPhone,
  FiMapPin,
  FiPrinter,
  FiUsers,
  FiMail,
} from 'react-icons/fi';
import {useGetHistoryeventPoById} from '@/lib/react-query/queriesAndMutations/cateror/PO/pomodule';

// Updated Types
export interface PurchaseOrderHistory {
  id: string;
  listNo: number;
  caterorId: string;
  eventId: string;
  createdAt: string;
  updatedAt: string;
  event: {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    caterorId: string;
    clientId: string;
  };
  PurchaseMaterial: Array<{
    id: string;
    name: string;
    materials: Array<{
      id: string;
      name: string;
      quantity: number;
      date: string;
      time: string;
      price: number;
      unit: string;
      vendorId: string;
      vendorName: string | null;
      venue: string;
      vendor?: {
        id: string;
        name: string;
        phone: string;
        address: string;
        email: string | null;
      };
    }>;
  }>;
}

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  id: string;
}

interface VendorReportPrintProps {
  data: PurchaseOrderHistory | PurchaseOrderHistory[] | null;
  selectedVendorIds: string[];
  onClose: () => void;
  vendorOptions?: {value: string; label: string}[];
}

const VendorReportPrint: React.FC<VendorReportPrintProps> = ({
  data,
  selectedVendorIds,
  onClose,
  vendorOptions,
}) => {
  if (!data) return null;

  const formatDisplayDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const formatDisplayTime = (timeString: string) => {
    try {
      const date = new Date(timeString);
      let hours = date.getHours();
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';

      hours = hours % 12;
      hours = hours ? hours : 12;

      return `${hours}:${minutes} ${ampm}`;
    } catch (error) {
      return 'Invalid Time';
    }
  };

  // Process the data structure you provided
  const getVendorWiseData = useMemo(() => {
    // Convert to array if single PO
    const purchaseData = Array.isArray(data) ? data : [data];
    const vendorMap = new Map<
      string,
      {
        vendorId: string;
        vendorName: string;
        vendorPhone: string;
        vendorAddress: string;
        vendorEmail: string;
        materials: any[];
        categories: Set<string>;
        totalQuantity: number;
        totalAmount: number;
      }
    >();

    // Process each purchase order
    purchaseData.forEach((po) => {
      if (po.PurchaseMaterial && Array.isArray(po.PurchaseMaterial)) {
        po.PurchaseMaterial.forEach((category) => {
          if (category.materials && Array.isArray(category.materials)) {
            category.materials.forEach((material) => {
              const vendorId = material.vendorId || material.vendor?.id;
              const vendorName =
                material.vendorName ||
                material.vendor?.name ||
                'Unknown Vendor';
              const vendorPhone = material.vendor?.phone || 'N/A';
              const vendorAddress = material.vendor?.address || 'N/A';
              const vendorEmail = material.vendor?.email || 'N/A';

              if (!vendorId) return;

              // Check if vendor is in selected list
              if (
                selectedVendorIds.length > 0 &&
                !selectedVendorIds.includes(vendorId)
              ) {
                return;
              }

              if (!vendorMap.has(vendorId)) {
                vendorMap.set(vendorId, {
                  vendorId,
                  vendorName,
                  vendorPhone,
                  vendorAddress,
                  vendorEmail,
                  materials: [],
                  categories: new Set(),
                  totalQuantity: 0,
                  totalAmount: 0,
                });
              }

              const vendorData = vendorMap.get(vendorId)!;

              // Add material with category info
              const materialWithCategory = {
                ...material,
                categoryName: category.name,
                categoryId: category.id,
                purchaseOrderNo: po.listNo,
                purchaseDate: po.createdAt,
              };

              vendorData.materials.push(materialWithCategory);
              vendorData.categories.add(category.name);

              // Calculate totals
              const quantity = material.quantity || 0;
              const price = material.price || 0;
              vendorData.totalQuantity += quantity;
              vendorData.totalAmount += quantity * price;
            });
          }
        });
      }
    });

    // Convert map to array and sort by vendor name
    return Array.from(vendorMap.values())
      .map((vendor) => ({
        ...vendor,
        categories: Array.from(vendor.categories),
      }))
      .sort((a, b) =>
        a.vendorName.localeCompare(b.vendorName, 'hi', {sensitivity: 'base'}),
      );
  }, [data, selectedVendorIds]);

  // Group materials by category for each vendor
  const getGroupedMaterialsByVendor = (vendorMaterials: any[]) => {
    const categoryMap: Record<
      string,
      {
        materials: any[];
        totalQuantity: number;
        totalAmount: number;
      }
    > = {};

    // Remove duplicates by material id
    const uniqueMaterials = Array.from(
      new Map(vendorMaterials.map((item) => [item.id, item])).values(),
    );

    // Group by category only
    uniqueMaterials.forEach((material) => {
      const categoryName = material.categoryName || 'Uncategorized';

      if (!categoryMap[categoryName]) {
        categoryMap[categoryName] = {
          materials: [],
          totalQuantity: 0,
          totalAmount: 0,
        };
      }

      categoryMap[categoryName].materials.push(material);

      // Calculate category totals
      const quantity = material.quantity || 0;
      const price = material.price || 0;
      categoryMap[categoryName].totalQuantity += quantity;
      categoryMap[categoryName].totalAmount += quantity * price;
    });

    // Convert to sorted structure
    const sortedCategories = Object.entries(categoryMap).sort(
      ([catA], [catB]) => catA.localeCompare(catB, 'hi', {sensitivity: 'base'}),
    );

    // Sort materials within each category
    sortedCategories.forEach(([_, categoryData]) => {
      categoryData.materials.sort((a, b) => {
        const nameA = a.name || '';
        const nameB = b.name || '';
        return nameA.localeCompare(nameB, 'hi', {sensitivity: 'base'});
      });
    });

    return Object.fromEntries(sortedCategories);
  };

  // Get selected vendor names for display
  const getSelectedVendorNames = () => {
    if (selectedVendorIds.length === 0) {
      return 'All Vendors';
    }

    if (vendorOptions) {
      const selectedNames = selectedVendorIds
        .map((vendorId) => {
          const vendorOption = vendorOptions.find(
            (opt) => opt.value === vendorId,
          );
          return vendorOption ? vendorOption.label : '';
        })
        .filter((name) => name);

      if (selectedNames.length > 0) {
        return selectedNames.join(', ');
      }
    }

    return `${selectedVendorIds.length} Selected Vendors`;
  };

  // Get event info for header
  const getEventInfo = () => {
    const purchaseData = Array.isArray(data) ? data : [data];
    if (purchaseData.length === 0) return 'No Data';

    if (purchaseData.length === 1) {
      const po = purchaseData[0];
      return `PO #${po.listNo} | Event: ${po.event?.name || 'N/A'} | Date: ${po.event?.startDate ? formatDisplayDate(po.event.startDate) : 'N/A'}`;
    } else {
      const firstPO = purchaseData[0];
      const poCount = purchaseData.length;
      return `Multiple POs (${poCount}) | Event: ${firstPO.event?.name || 'Multiple Events'}`;
    }
  };

  // Calculate overall totals
  const calculateOverallTotals = () => {
    const vendorData = getVendorWiseData;
    let totalVendors = vendorData.length;
    let totalMaterials = 0;
    let totalQuantity = 0;
    let totalAmount = 0;

    vendorData.forEach((vendor) => {
      totalMaterials += vendor.materials.length;
      totalQuantity += vendor.totalQuantity;
      totalAmount += vendor.totalAmount;
    });

    return {totalVendors, totalMaterials, totalQuantity, totalAmount};
  };

  const {totalVendors, totalMaterials, totalQuantity, totalAmount} =
    calculateOverallTotals();

  const vendorData = getVendorWiseData;

  useEffect(() => {
    const printIframe = document.createElement('iframe');
    printIframe.style.position = 'fixed';
    printIframe.style.top = '0';
    printIframe.style.left = '0';
    printIframe.style.width = '0';
    printIframe.style.height = '0';
    printIframe.style.border = 'none';
    printIframe.style.zIndex = '-9999';
    printIframe.title = 'Vendor-wise PO Report';

    document.body.appendChild(printIframe);

    const iframeDoc =
      printIframe.contentDocument || printIframe.contentWindow?.document;

    if (!iframeDoc) {
      console.error('Cannot open print preview');
      onClose();
      return;
    }

    // Write HTML content optimized for direct printing
    iframeDoc.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Vendor-wise PO Report</title>
        <style>
          @media print {
            @page {
              margin: 2mm !important;
              size: auto;
            }
            
            body {
              margin: 0 !important;
              padding: 0 !important;
              font-family: Arial, sans-serif;
              color: #000;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              font-size: 10px;
            }
            
            .print-container {
              margin: 0 !important;
              padding: 0 !important;
              width: 100% !important;
            }
            
            .print-header {
              padding: 5px 0 !important;
              border-bottom: 2px solid #1E40AF;
              text-align: center;
              margin-bottom: 10px !important;
            }
            
            .print-header h1 {
              margin: 0 !important;
              font-weight: bold;
              font-size: 18px;
              color: #000;
            }
            
            .print-header .info {
              margin: 5px 0 !important;
              font-size: 11px;
              line-height: 1.3;
            }
            
            .print-header .summary {
              margin: 5px 0 !important;
              font-size: 10px;
              color: #333;
            }
            
            /* Main table styling */
            .print-table {
              width: 100% !important;
              border-collapse: collapse;
              margin-top: 5px !important;
              margin-bottom: 5px !important;
              font-size: 9px;
              page-break-inside: auto;
            }
            
            .print-table th {
              background: #1E3A8A !important;
              color: white !important;
              padding: 6px 4px !important;
              text-align: center;
              border: 1px solid #ccc;
              font-weight: bold;
              font-size: 9px;
            }
            
            .print-table td {
              border: 1px solid #ddd;
              padding: 5px 4px !important;
              text-align: center;
              vertical-align: middle;
            }
            
            /* Vendor header */
            .vendor-header {
              background: #e0e7ff !important;
              font-weight: bold;
              font-size: 11px;
              padding: 8px 6px !important;
              border: 1px solid #1E40AF;
              margin-top: 15px !important;
              margin-bottom: 8px !important;
              border-radius: 3px;
              page-break-before: always;
            }
            
            .vendor-header:first-child {
              page-break-before: auto;
            }
            
            .vendor-contact {
              font-size: 9px;
              margin-top: 3px !important;
              color: #555;
            }
            
            .vendor-contact span {
              margin-right: 10px;
            }
            
            /* Category header */
            .category-header {
              background: #f1f5f9 !important;
              font-weight: 600;
              font-size: 10px;
              padding: 7px 6px !important;
              border: 1px solid #ccc;
              margin-top: 8px !important;
            }
            
            /* Material rows */
            .material-name-cell {
              text-align: left !important;
              font-weight: 600;
              width: 120px;
            }
            
            .quantity-cell {
              text-align: center !important;
              width: 40px;
            }
            
            .unit-cell {
              text-align: center !important;
              width: 40px;
            }
            
            .date-cell {
              text-align: center !important;
              width: 65px;
            }
            
            .time-cell {
              text-align: center !important;
              width: 60px;
            }
            
            .location-cell {
              text-align: center !important;
              max-width: 80px;
              word-wrap: break-word;
            }
            
            .price-cell {
              text-align: right !important;
              width: 65px;
            }
            
            .total-cell {
              text-align: right !important;
              width: 75px;
              font-weight: bold;
            }
            
            /* Totals */
            .vendor-total {
              background: #dbeafe !important;
              font-weight: bold;
              border: 1px solid #1E40AF;
            }
            
            .vendor-total td {
              border-color: #1E40AF;
            }
            
            .grand-total {
              background: #1E3A8A !important;
              color: white !important;
              font-weight: bold;
              border: 1px solid #000;
            }
            
            .grand-total td {
              color: white !important;
              border-color: #000;
              padding: 8px 4px !important;
            }
            
            /* Page break control */
            .page-break {
              page-break-before: always;
            }
            
            /* For empty state */
            .empty-state {
              text-align: center;
              padding: 30px 15px;
              font-size: 11px;
              color: #666;
            }
          }
          
          /* Non-print styles */
          body {
            margin: 0 !important;
            padding: 5px !important;
            font-family: Arial, sans-serif;
          }
        </style>
      </head>
      <body>
        <div class="print-container">
          <div class="print-header">
            <h1>Vendor-wise Purchase Order Report</h1>
            <div class="info">
              ${getEventInfo()}
              <br>
              ${selectedVendorIds.length > 0 ? `Selected Vendors: ${getSelectedVendorNames()}` : 'All Vendors'}
            </div>
            <div class="summary">
              Vendors: ${totalVendors} | Materials: ${totalMaterials} | Total Qty: ${totalQuantity} | Grand Total: ₹${totalAmount.toFixed(2)}
            </div>
          </div>

          ${
            vendorData.length > 0
              ? vendorData
                  .map((vendor, vendorIndex) => {
                    // Get grouped materials for this vendor
                    const groupedMaterials = getGroupedMaterialsByVendor(
                      vendor.materials,
                    );

                    let vendorTotalQty = 0;
                    let vendorTotalAmt = 0;

                    // Calculate vendor totals
                    Object.values(groupedMaterials).forEach((category) => {
                      vendorTotalQty += category.totalQuantity;
                      vendorTotalAmt += category.totalAmount;
                    });

                    return `
                    <div style="margin-top: ${vendorIndex > 0 ? '20px' : '5px'}; page-break-inside: avoid;">
                      <div class="vendor-header">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                          <div>
                            <strong>Vendor:</strong> ${vendor.vendorName}
                          </div>
                          <div style="font-size: 9px;">
                            Categories: ${vendor.categories.length} | Materials: ${vendor.materials.length} | Qty: ${vendorTotalQty} | Total: ₹${vendorTotalAmt.toFixed(2)}
                          </div>
                        </div>
                        <div class="vendor-contact">
                          <span><strong>Phone:</strong> ${vendor.vendorPhone}</span>
                          <span><strong>Address:</strong> ${vendor.vendorAddress}</span>
                          ${vendor.vendorEmail !== 'N/A' ? `<span><strong>Email:</strong> ${vendor.vendorEmail}</span>` : ''}
                        </div>
                      </div>
                      
                      ${
                        Object.keys(groupedMaterials).length > 0
                          ? Object.entries(groupedMaterials)
                              .map(([categoryName, category]) => {
                                return `
                                <div style="margin-top: 10px;">
                                  <div class="category-header">
                                    ${categoryName} — Materials: ${category.materials.length} | Qty: ${category.totalQuantity} | Total: ₹${category.totalAmount.toFixed(2)}
                                  </div>
                                  <table class="print-table">
                                    <thead>
                                      <tr>
                                        <th>Material</th>
                                        <th>Qty</th>
                                        <th>Unit</th>
                                        <th>Date</th>
                                        <th>Time</th>
                                        <th>Location</th>
                                        <th>Price</th>
                                        <th>Total</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      ${(() => {
                                        // Group materials by name within this category
                                        const materialGroups = {};
                                        category.materials.forEach((mat) => {
                                          const name =
                                            mat.name || 'Unknown Material';
                                          if (!materialGroups[name])
                                            materialGroups[name] = [];
                                          materialGroups[name].push(mat);
                                        });

                                        return Object.entries(materialGroups)
                                          .sort(([a], [b]) =>
                                            a.localeCompare(b),
                                          )
                                          .map(([materialName, entries]) => {
                                            const rowspan = entries.length;

                                            return entries
                                              .map((entry, idx) => {
                                                const total =
                                                  (entry.quantity || 0) *
                                                  (entry.price || 0);
                                                const poNo =
                                                  entry.purchaseOrderNo ||
                                                  'N/A';

                                                return `
            <tr>
              ${
                idx === 0
                  ? `<td rowspan="${rowspan}" class="material-name-cell" style="font-weight: 600;">${materialName}</td>`
                  : ''
              }
              <td class="quantity-cell">${entry.quantity || 0}</td>
              <td class="unit-cell">${entry.unit || '-'}</td>
              <td class="date-cell">${entry.date ? formatDisplayDate(entry.date) : '-'}</td>
              <td class="time-cell">${entry.time ? formatDisplayTime(entry.time) : '-'}</td>
              <td class="location-cell">${entry.venue || '—'}</td>
              <td class="price-cell">${entry.price ? '₹' + Number(entry.price).toFixed(2) : '-'}</td>
              <td class="total-cell">₹${total.toFixed(2)}</td>
            </tr>
          `;
                                              })
                                              .join('');
                                          })
                                          .join('');
                                      })()}
                                    </tbody>
                                  </table>
                                </div>
                              `;
                              })
                              .join('')
                          : '<div class="empty-state"><h3>No Materials Found</h3><p>No materials found for this vendor.</p></div>'
                      }
                    </div>
                    ${vendorIndex < vendorData.length - 1 ? '<div style="page-break-before: always;"></div>' : ''}
                  `;
                  })
                  .join('')
              : `
                <div class="empty-state">
                  <h3>No Materials Found</h3>
                  <p>No materials found for the selected vendors.</p>
                </div>
              `
          }
          
          <!-- Footer -->
          <div style="margin-top: 20px; padding-top: 8px; border-top: 1px solid #ccc; text-align: center; font-size: 8px; color: #666;">
            <p>Generated on ${formatDisplayDate(new Date().toISOString())}</p>
            <p>${vendorData.length === 1 ? `Purchase Order #${vendorData[0].purchaseOrderNo}` : `Multiple Purchase Orders Report (${vendorData.length} vendors)`}</p>
          </div>
        </div>
        <script>
          // Auto-print immediately with no delay
          (function() {
            try {
              // Wait a moment for content to render
              setTimeout(function() {
                window.print();
                
                // Close after printing
                setTimeout(function() {
                  window.close();
                }, 500);
              }, 100);
            } catch(e) {
              console.error('Print error:', e);
              window.close();
            }
          })();
        </script>
      </body>
      </html>
    `);

    iframeDoc.close();

    // Auto-remove iframe after printing
    setTimeout(() => {
      if (document.body.contains(printIframe)) {
        document.body.removeChild(printIframe);
      }
      onClose();
    }, 3000);

    // Clean up iframe when component unmounts
    return () => {
      if (document.body.contains(printIframe)) {
        document.body.removeChild(printIframe);
      }
    };
  }, [data, onClose, selectedVendorIds, vendorOptions]);

  // This component doesn't render anything visible
  return null;
};

// Detail View Component with Category-wise grouping
interface PODetailViewProps {
  data: PurchaseOrderHistory | null;
  onClose: () => void;
  allPOs?: PurchaseOrderHistory[];
}

const PODetailView: React.FC<PODetailViewProps> = ({data, onClose, allPOs}) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(),
  );
  const [showVendorReport, setShowVendorReport] = useState<boolean>(false);
  const [selectedVendorIds, setSelectedVendorIds] = useState<string[]>([]);
  const [vendorReportData, setVendorReportData] = useState<
    PurchaseOrderHistory[]
  >([]);
  const printRef = useRef<HTMLDivElement>(null);

  if (!data) return null;

  const formatDisplayDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const formatDisplayTime = (timeString: string) => {
    try {
      const date = new Date(timeString);
      let hours = date.getHours();
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';

      hours = hours % 12;
      hours = hours ? hours : 12;

      return `${hours}:${minutes} ${ampm}`;
    } catch (error) {
      return 'Invalid Time';
    }
  };

  // Get all vendors for multi-select
  const getAllVendorsForSelection = useMemo(() => {
    const vendorsMap = new Map<string, {id: string; name: string}>();

    // Function to process a single PO
    const processPO = (poData: PurchaseOrderHistory) => {
      if (!poData.PurchaseMaterial || !Array.isArray(poData.PurchaseMaterial)) {
        return;
      }

      poData.PurchaseMaterial.forEach((category) => {
        if (category.materials && Array.isArray(category.materials)) {
          category.materials.forEach((material) => {
            const vendorId = material.vendorId || material.vendor?.id;
            const vendorName =
              material.vendorName || material.vendor?.name || 'Unknown Vendor';

            if (vendorId && !vendorsMap.has(vendorId)) {
              vendorsMap.set(vendorId, {
                id: vendorId,
                name: vendorName,
              });
            }
          });
        }
      });
    };

    // Process all POs if available, otherwise process single PO
    if (allPOs && Array.isArray(allPOs) && allPOs.length > 0) {
      allPOs.forEach(processPO);
    } else if (data) {
      processPO(data);
    }

    return Array.from(vendorsMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name, 'hi', {sensitivity: 'base'}),
    );
  }, [data, allPOs]);

  // Create options for react-select
  const vendorOptions = useMemo(() => {
    return getAllVendorsForSelection.map((vendor) => ({
      value: vendor.id,
      label: vendor.name,
    }));
  }, [getAllVendorsForSelection]);

  // Handle vendor selection change for react-select
  const handleVendorSelectionChange = (selectedOptions: any) => {
    const selectedIds = selectedOptions
      ? selectedOptions.map((opt: any) => opt.value)
      : [];
    setSelectedVendorIds(selectedIds);
  };

  // Handle print vendor details
  const handlePrintVendorDetails = () => {
    // Use allPOs if available, otherwise use single PO data
    const dataToUse = allPOs && allPOs.length > 0 ? allPOs : data ? [data] : [];

    // Show all vendors if none selected
    const vendorIdsToUse =
      selectedVendorIds.length > 0
        ? selectedVendorIds
        : getAllVendorsForSelection.map((v) => v.id);

    // Set selectedVendorIds to show in PDF (even if empty, we'll show all)
    setVendorReportData(dataToUse);
    setSelectedVendorIds(vendorIdsToUse);
    setShowVendorReport(true);
  };

  // Handle print PO details
  const handlePrint = () => {
    // Create a print iframe
    const printIframe = document.createElement('iframe');
    printIframe.style.position = 'fixed';
    printIframe.style.top = '0';
    printIframe.style.left = '0';
    printIframe.style.width = '100vw';
    printIframe.style.height = '100vh';
    printIframe.style.border = 'none';
    printIframe.style.zIndex = '999999';
    printIframe.style.backgroundColor = 'white';
    printIframe.title = 'Print Preview';
    printIframe.style.visibility = 'hidden';

    document.body.appendChild(printIframe);

    const iframeDoc =
      printIframe.contentDocument || printIframe.contentWindow?.document;

    if (!iframeDoc) {
      alert('Cannot open print preview. Please check browser settings.');
      return;
    }

    // Get data for print
    const groupedMaterials = getGroupedMaterialsForDisplay();
    const overallTotals = calculateOverallTotals();
    const totalMaterialsCount = Object.values(groupedMaterials).reduce(
      (total, groups) => total + groups.length,
      0,
    );
    const uniqueCategoriesCount = Object.keys(groupedMaterials).length;
    let totalQuantity = 0;

    Object.entries(groupedMaterials).forEach(([categoryName, groups]) => {
      const categoryTotals = groups.reduce(
        (acc, group) => {
          acc.totalQty += group.totalQuantity;
          acc.totalAmt += group.totalAmount;
          return acc;
        },
        {totalQty: 0, totalAmt: 0},
      );
      totalQuantity += categoryTotals.totalQty;
    });

    // Write HTML content
    iframeDoc.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Purchase Order #${data.listNo}</title>
      <style>
        @media print {
          body {
            margin: 0 !important;
            padding: 0 !important;
            font-family: Arial, sans-serif;
            color: #000 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          * {
            color: #000 !important;
            box-sizing: border-box;
          }
          
          .print-container {
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white;
            font-family: Arial, sans-serif;
            font-size: 12px;
            color: black;
            text-align: center;
            width: 100% !important;
          }
          
          .print-header {
            padding: 10px 0 !important;
            border: 1px solid #0D47A1;
            text-align: center;
            color: black;
            margin-bottom: 10px !important;
            width: 100% !important;
          }
          
          .print-header h1 {
            margin: 0 !important;
            font-weight: 800;
            font-size: 28px;
            color: black !important;
            padding: 0 !important;
          }
          
          .print-header .divider {
            background: #0D47A1;
            height: 2px;
            margin: 4px auto !important;
            width: 80%;
          }
          
          .print-header p {
            margin: 0 !important;
            font-size: 14px;
            font-weight: bold;
            color: black !important;
            padding: 0 !important;
          }
          
          .print-table {
            width: 100% !important;
            border-collapse: collapse;
            margin-top: 10px !important;
            font-size: 11px;
            background: white;
            table-layout: fixed;
          }
          
          .print-table th {
            border: 1px solid #ccc;
            padding: 8px 4px !important;
            background-color: #1E3A8A !important;
            color: white !important;
            text-align: center;
            font-weight: bold;
            font-size: 11px;
          }
          
          .print-table td {
            border: 1px solid #ddd;
            padding: 6px 3px !important;
            font-size: 10px;
            color: black !important;
            vertical-align: middle;
            word-wrap: break-word;
          }
          
          .category-header {
            background-color: #e8e8e8 !important;
            font-weight: 700;
            color: black !important;
            padding: 6px 3px !important;
            border: 1px solid #000;
            text-align: left;
            font-size: 12px;
          }
          
          .material-name-cell {
            font-weight: 600;
            text-align: left;
            max-width: 150px;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          
          .quantity-cell {
            text-align: center;
            width: 50px;
          }
          
          .unit-cell {
            text-align: center;
            width: 40px;
          }
          
          .date-cell {
            text-align: center;
            width: 70px;
          }
          
          .time-cell {
            text-align: center;
            width: 60px;
          }
          
          .location-cell {
            text-align: center;
            width: 80px;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          
          .vendor-cell {
            text-align: center;
            width: 100px;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          
          .price-cell {
            text-align: right;
            width: 60px;
          }
          
          .total-cell {
            text-align: right;
            width: 70px;
            font-weight: bold;
          }
          
          @page {
            margin: 5mm !important;
            size: auto;
          }
          
          /* Remove default browser margins */
          @page :first {
            margin: 5mm !important;
          }
          
          @page :left {
            margin: 5mm !important;
          }
          
          @page :right {
            margin: 5mm !important;
          }
        }
        
        /* Screen preview styles */
        @media screen {
          body {
            margin: 0 !important;
            padding: 10px !important;
            background: white;
            font-family: Arial, sans-serif;
          }
          
          .print-container {
            max-width: 100% !important;
            margin: 0 auto !important;
            padding: 0 !important;
          }
        }
      </style>
    </head>
    <body>
      <div class="print-container">
        <div class="print-header">
          <h1>Purchase Order #${data.listNo}</h1>
          <div class="divider"></div>
          <p>
            Event: ${data.event.name}<br/>
            Start Date: ${formatDisplayDate(data.event.startDate)} • Created: ${formatDisplayDate(data.createdAt)}
          </p>
        </div>
        
        <table class="print-table">
          <thead>
            <tr>
              <th class="material-name-cell">Material</th>
              <th class="quantity-cell">Qty</th>
              <th class="unit-cell">Unit</th>
              <th class="date-cell">Date</th>
              <th class="time-cell">Time</th>
              <th class="location-cell">Location</th>
              <th class="vendor-cell">Vendor</th>
              <th class="price-cell">Unit Price</th>
              <th class="total-cell">Total</th>
            </tr>
          </thead>
          <tbody>
            ${Object.entries(groupedMaterials)
              .map(([categoryName, groups]) => {
                const categoryTotals = groups.reduce(
                  (acc, group) => {
                    acc.totalQty += group.totalQuantity;
                    acc.totalAmt += group.totalAmount;
                    return acc;
                  },
                  {totalQty: 0, totalAmt: 0},
                );

                return `
                <tr class="category-header">
                  <td colspan="9">
                    ${categoryName} (${groups.length} materials) - Qty: ${categoryTotals.totalQty} | Total: ₹${categoryTotals.totalAmt.toFixed(2)}
                  </td>
                </tr>
                
                ${groups
                  .map((group) => {
                    const materialName = group.materialName;
                    const entries = group.entries || [];

                    return entries
                      .map((item, itemIndex) => {
                        const totalAmount =
                          (item.price || 0) * (item.quantity || 0);

                        return `
                      <tr>
                        ${
                          itemIndex === 0
                            ? `
                          <td rowspan="${entries.length}" class="material-name-cell">
                            ${materialName}
                          </td>
                        `
                            : ''
                        }
                        <td class="quantity-cell">${item.quantity || 0}</td>
                        <td class="unit-cell">${item.unit || '-'}</td>
                        <td class="date-cell">${item.date ? formatDisplayDate(item.date) : '-'}</td>
                        <td class="time-cell">${item.time ? formatDisplayTime(item.time) : '-'}</td>
                        <td class="location-cell">${item.venue || 'Not specified'}</td>
                        <td class="vendor-cell">${item.vendorName || 'Unknown'}</td>
                        <td class="price-cell">${item.price ? `₹${item.price.toFixed(2)}` : '-'}</td>
                        <td class="total-cell">₹${totalAmount.toFixed(2)}</td>
                      </tr>
                    `;
                      })
                      .join('');
                  })
                  .join('')}
              `;
              })
              .join('')}
          </tbody>
        </table>
      </div>
      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 500);
        }
        
        window.onafterprint = function() {
          setTimeout(function() {
            window.close();
          }, 100);
        };
      </script>
    </body>
    </html>
  `);

    iframeDoc.close();
  };

  // Get purchase materials from the data
  const getPurchaseMaterials = () => {
    if (!data.PurchaseMaterial || !Array.isArray(data.PurchaseMaterial)) {
      return [];
    }

    const categoryMap = new Map<string, any>();

    data.PurchaseMaterial.forEach((category) => {
      const categoryId = category.id;
      const categoryName = category.name || 'Uncategorized';

      if (categoryMap.has(categoryId)) {
        const existingCategory = categoryMap.get(categoryId);
        if (category.materials && Array.isArray(category.materials)) {
          const existingMaterialIds = new Set(
            existingCategory.materials.map((m: any) => m.id),
          );
          category.materials.forEach((material: any) => {
            if (!existingMaterialIds.has(material.id)) {
              existingCategory.materials.push(material);
            }
          });
        }
      } else {
        categoryMap.set(categoryId, {
          id: categoryId,
          name: categoryName,
          materials: category.materials ? [...category.materials] : [],
        });
      }
    });

    const materials: any[] = [];

    categoryMap.forEach((category) => {
      const categoryName = category.name;
      const categoryId = category.id;

      if (category.materials && Array.isArray(category.materials)) {
        category.materials.forEach((material: any) => {
          materials.push({
            ...material,
            category: categoryName,
            categoryId: categoryId,
            materialName: material.name,
            materialId: material.id,
            vendorName:
              material.vendorName || material.vendor?.name || 'Unknown',
            venue: material.venue || 'Not specified',
            price: material.price || 0,
            quantity: material.quantity || 0,
            unit: material.unit || 'GRAM',
            date: material.date,
            time: material.time,
            vendorId: material.vendorId,
            vendorDetails: material.vendor,
          });
        });
      }
    });

    return materials;
  };

  // Group materials by category and material name for display
  const getGroupedMaterialsForDisplay = () => {
    const purchaseMaterials = getPurchaseMaterials();
    const categories: Record<string, any[]> = {};

    purchaseMaterials.forEach((material) => {
      const categoryName = material.category || 'Uncategorized';
      if (!categories[categoryName]) {
        categories[categoryName] = [];
      }
      categories[categoryName].push(material);
    });

    const result: Record<
      string,
      Array<{
        materialName: string;
        entries: any[];
        totalQuantity: number;
        totalAmount: number;
      }>
    > = {};

    Object.entries(categories).forEach(([categoryName, materials]) => {
      const materialGroups: Record<string, any[]> = {};

      materials.forEach((material) => {
        const materialName =
          material.materialName || material.name || 'Unknown Material';
        if (!materialGroups[materialName]) {
          materialGroups[materialName] = [];
        }
        materialGroups[materialName].push(material);
      });

      result[categoryName] = Object.entries(materialGroups).map(
        ([materialName, entries]) => {
          const totalQuantity = entries.reduce(
            (sum, item) => sum + (item.quantity || 0),
            0,
          );
          const totalAmount = entries.reduce(
            (sum, item) => sum + (item.price || 0) * (item.quantity || 0),
            0,
          );

          return {
            materialName,
            entries,
            totalQuantity,
            totalAmount,
          };
        },
      );

      result[categoryName].sort((a, b) =>
        a.materialName.localeCompare(b.materialName, 'hi', {
          sensitivity: 'base',
        }),
      );
    });

    const sortedEntries = Object.entries(result).sort(
      ([categoryA], [categoryB]) => {
        return categoryA.localeCompare(categoryB, 'hi', {sensitivity: 'base'});
      },
    );

    return Object.fromEntries(sortedEntries);
  };

  const groupedMaterialsForDisplay = useMemo(
    () => getGroupedMaterialsForDisplay(),
    [data],
  );

  // Toggle category expansion
  const toggleCategoryExpansion = (categoryName: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryName)) {
        newSet.delete(categoryName);
      } else {
        newSet.add(categoryName);
      }
      return newSet;
    });
  };

  // Calculate category totals
  const calculateCategoryTotals = (category: string) => {
    let totalQty = 0;
    let totalAmt = 0;

    (groupedMaterialsForDisplay[category] || []).forEach((group) => {
      totalQty += group.totalQuantity;
      totalAmt += group.totalAmount;
    });

    return {totalQty, totalAmt};
  };

  // Calculate overall totals
  const calculateOverallTotals = () => {
    let totalQty = 0;
    let totalAmt = 0;

    Object.values(groupedMaterialsForDisplay).forEach((groups) => {
      groups.forEach((group) => {
        totalQty += group.totalQuantity;
        totalAmt += group.totalAmount;
      });
    });

    return {totalQty, totalAmt};
  };

  const {totalQty, totalAmt} = calculateOverallTotals();
  const totalMaterialsCount = Object.values(groupedMaterialsForDisplay).reduce(
    (total, groups) => total + groups.length,
    0,
  );
  const uniqueCategoriesCount = Object.keys(groupedMaterialsForDisplay).length;

  // Count unique vendors
  const uniqueVendorsCount = useMemo(() => {
    const vendorIds = new Set<string>();
    if (data.PurchaseMaterial && Array.isArray(data.PurchaseMaterial)) {
      data.PurchaseMaterial.forEach((category) => {
        if (category.materials && Array.isArray(category.materials)) {
          category.materials.forEach((material) => {
            if (material.vendorId) {
              vendorIds.add(material.vendorId);
            }
          });
        }
      });
    }
    return vendorIds.size;
  }, [data]);

  return (
    <>
      {/* Vendor Report PDF Preview */}
      {showVendorReport && (
        <VendorReportPrint
          data={vendorReportData}
          selectedVendorIds={selectedVendorIds}
          onClose={() => {
            setShowVendorReport(false);
            setSelectedVendorIds([]); // Clear selection after closing
            setVendorReportData([]);
          }}
          vendorOptions={vendorOptions}
        />
      )}

      {/* Main PO Detail View */}
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50 p-6">
        <div className="max-h-[90vh] w-full max-w-7xl overflow-y-auto rounded-xl bg-white shadow-xl">
          {/* Modal Header - Responsive Design */}
          <div className="rounded-md bg-gradient-to-r from-blue-800 to-indigo-900 p-4 shadow-xl">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              {/* Left Side: PO Info */}
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-bold text-white md:text-lg">
                  PO #{data.listNo}
                </h2>
                <div className="flex flex-wrap gap-2">
                  <div className="flex items-center gap-1.5 rounded-lg bg-white/20 px-2 py-1">
                    <span className="text-xs text-blue-100">Event:</span>
                    <span className="text-xs font-semibold text-white">
                      {data.event.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-lg bg-white/20 px-2 py-1">
                    <span className="text-xs text-blue-100">Date:</span>
                    <span className="text-xs font-semibold text-white">
                      {formatDisplayDate(data.event.startDate)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-lg bg-white/20 px-2 py-1">
                    <span className="text-xs text-blue-100">Total:</span>
                    <span className="text-xs font-semibold text-white">
                      ₹{totalAmt.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Side: Action Buttons */}
              <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center md:mt-0">
                <div className="min-w-[150px] md:min-w-[180px]">
                  <Select
                    isMulti
                    options={vendorOptions}
                    value={vendorOptions.filter((o) =>
                      selectedVendorIds.includes(o.value),
                    )}
                    onChange={handleVendorSelectionChange}
                    placeholder="Select vendors..."
                    className="text-xs"
                    menuPortalTarget={document.body}
                    styles={{
                      control: (base) => ({
                        ...base,
                        background: 'white',
                        borderRadius: '6px',
                        borderColor: '#cbd5e0',
                        minHeight: '32px',
                        fontSize: '12px',
                        boxShadow: 'none',
                        '&:hover': {borderColor: '#3182ce'},
                      }),
                      menuPortal: (base) => ({
                        ...base,
                        zIndex: 9999,
                      }),
                      menu: (base) => ({
                        ...base,
                        fontSize: '12px',
                      }),
                      multiValue: (base) => ({
                        ...base,
                        backgroundColor: '#3182ce',
                        color: 'white',
                        fontSize: '11px',
                      }),
                      multiValueLabel: (base) => ({
                        ...base,
                        color: 'white',
                        fontSize: '11px',
                      }),
                      multiValueRemove: (base) => ({
                        ...base,
                        color: 'white',
                        ':hover': {backgroundColor: '#2b6cb0', color: 'white'},
                      }),
                    }}
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handlePrintVendorDetails}
                    className="flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-emerald-700"
                    title="Vendors PDF"
                  >
                    <FiUsers className="h-3 w-3" />
                    Vendors
                    <span className="ml-1 rounded-full bg-white/20 px-1 py-0.5 text-[10px]">
                      {selectedVendorIds.length === 0
                        ? getAllVendorsForSelection.length
                        : selectedVendorIds.length}
                    </span>
                  </button>

                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-1 rounded-lg bg-white px-2.5 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-50"
                  >
                    <FiPrinter className="h-3 w-3" />
                    Print PO
                  </button>
                  <button
                    onClick={onClose}
                    className="rounded-lg p-1.5 text-white transition-colors hover:bg-white/20"
                  >
                    <FiX className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="p-6">
            {/* Screen View - Complete Materials Table */}
            <div className="overflow-hidden rounded-xl border border-stroke bg-white shadow-sm">
              <div className="bg-blue-50 px-4 py-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-gray-800 text-lg font-semibold">
                    Purchase Order Details
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 text-sm">
                      {uniqueCategoriesCount} Categories • {totalMaterialsCount}{' '}
                      Materials • {uniqueVendorsCount} Vendors
                    </span>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-stroke">
                  <thead className="h-16 rounded-t-md bg-blue-900 text-white">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold">
                        Category / Material
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">
                        Qty
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">
                        Unit
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">
                        Time
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">
                        Location
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">
                        Vendor
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">
                        Price
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">
                        Total Amt
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stroke bg-white">
                    {Object.entries(groupedMaterialsForDisplay).map(
                      ([categoryName, groups], categoryIndex) => {
                        const isCategoryExpanded =
                          expandedCategories.has(categoryName);
                        const categoryTotals =
                          calculateCategoryTotals(categoryName);

                        return (
                          <React.Fragment key={categoryName}>
                            {/* Category Header Row */}
                            <tr className="bg-gray-2 px-4 py-4 font-bold text-black">
                              <td colSpan={9} className="px-4 py-3">
                                <div className="flex items-center justify-between">
                                  <div
                                    className="flex cursor-pointer items-center gap-2"
                                    onClick={() =>
                                      toggleCategoryExpansion(categoryName)
                                    }
                                  >
                                    {isCategoryExpanded ? (
                                      <FiChevronDown className="h-4 w-4" />
                                    ) : (
                                      <FiChevronRight className="h-4 w-4" />
                                    )}
                                    <span className="text-gray-800 font-semibold">
                                      {categoryName}
                                    </span>
                                    <span className="text-gray-600 text-sm">
                                      ({groups.length} materials)
                                    </span>
                                    <span className="text-gray-600 ml-2 text-sm">
                                      • Qty: {categoryTotals.totalQty} • Amt: ₹
                                      {categoryTotals.totalAmt.toFixed(2)}
                                    </span>
                                  </div>
                                </div>
                              </td>
                            </tr>

                            {/* Category Details - Show when expanded */}
                            {isCategoryExpanded &&
                              groups.map((group, groupIndex) => {
                                const materialName = group.materialName;
                                const rowspan = group.entries.length;

                                return (
                                  <React.Fragment
                                    key={`${categoryName}-${materialName}`}
                                  >
                                    {group.entries.map(
                                      (item: any, itemIndex: number) => {
                                        const totalAmount =
                                          (item.price || 0) *
                                          (item.quantity || 0);

                                        return (
                                          <tr
                                            key={`${item.id}-${itemIndex}`}
                                            className={`hover:bg-gray-100 ${groupIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                                          >
                                            {/* Material Name with rowspan */}
                                            {itemIndex === 0 ? (
                                              <td
                                                rowSpan={rowspan}
                                                className="text-gray-800 px-4 py-3 text-center align-middle text-sm font-medium"
                                                style={{
                                                  verticalAlign: 'middle',
                                                }}
                                              >
                                                {materialName}
                                              </td>
                                            ) : null}

                                            <td className="px-4 py-3 text-center">
                                              <span className="rounded bg-blue-50 px-2 py-1 text-sm font-medium">
                                                {item.quantity || 0}
                                              </span>
                                            </td>
                                            <td className="px-4 py-3 text-center text-sm">
                                              {item.unit || '-'}
                                            </td>
                                            <td className="px-4 py-3 text-center text-sm">
                                              {item.date
                                                ? formatDisplayDate(item.date)
                                                : '-'}
                                            </td>
                                            <td className="px-4 py-3 text-center text-sm">
                                              {item.time
                                                ? formatDisplayTime(item.time)
                                                : '-'}
                                            </td>
                                            <td className="max-w-[100px] truncate px-4 py-3 text-center text-sm">
                                              {item.venue || 'Not specified'}
                                            </td>
                                            <td className="max-w-[120px] truncate px-4 py-3 text-center text-sm">
                                              {item.vendorName || 'Unknown'}
                                            </td>
                                            <td className="px-4 py-3 text-right text-sm font-bold text-blue-700">
                                              {item.price
                                                ? `₹${item.price.toFixed(2)}`
                                                : '-'}
                                            </td>
                                            <td className="px-4 py-3 text-right text-sm font-bold text-green-700">
                                              ₹{totalAmount.toFixed(2)}
                                            </td>
                                          </tr>
                                        );
                                      },
                                    )}
                                  </React.Fragment>
                                );
                              })}
                          </React.Fragment>
                        );
                      },
                    )}

                    {Object.keys(groupedMaterialsForDisplay).length === 0 && (
                      <tr>
                        <td
                          colSpan={9}
                          className="border-gray-300 text-gray-700 border-t px-4 py-8 text-center text-sm"
                        >
                          <div className="py-4">
                            <FiAlertCircle className="text-gray-400 mx-auto h-12 w-12" />
                            <p className="text-gray-600 mt-2 text-lg font-medium">
                              No materials found
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Info Footer */}
            <div className="text-gray-600 mt-4 flex items-center justify-between text-sm">
              <div>
                <p>
                  Generated on {formatDisplayDate(new Date().toISOString())}
                </p>
              </div>
              <div>
                <p>
                  {uniqueCategoriesCount} Categories • {totalMaterialsCount}{' '}
                  Materials • {totalQty} Total Quantity • ₹{totalAmt.toFixed(2)}{' '}
                  Total
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const ExternalHistoryModel: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  id,
}) => {
  const {
    data: eventPoData,
    isLoading: eventLoading,
    error: eventError,
  } = useGetHistoryeventPoById(id);

  const [eventPoHistory, setEventPoHistory] = useState<PurchaseOrderHistory[]>(
    [],
  );

  // Process event PO data
  useEffect(() => {
    if (eventPoData) {
      if (eventPoData.formatted && Array.isArray(eventPoData.formatted)) {
        setEventPoHistory(eventPoData.formatted);
      } else if (Array.isArray(eventPoData)) {
        setEventPoHistory(eventPoData);
      } else {
        setEventPoHistory([]);
      }
    }
  }, [eventPoData]);

  if (!isOpen) return null;

  if (eventLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
        <div className="rounded-xl bg-white p-8 shadow-2xl">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
            <span className="text-gray-700">Loading purchase history...</span>
          </div>
        </div>
      </div>
    );
  }

  if (eventError) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
        <div className="rounded-xl bg-white p-8 shadow-2xl">
          <div className="flex items-center space-x-3 text-red-600">
            <FiAlertCircle className="h-8 w-8" />
            <div>
              <h3 className="font-semibold">Error loading data</h3>
              <p className="text-gray-600 text-sm">Please try again later.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Sort POs by listNo descending
  const sortedEventPoHistory = [...eventPoHistory].sort(
    (a, b) => b.listNo - a.listNo,
  );

  const latestPO = sortedEventPoHistory[0];

  // If there are multiple POs, show the latest one but pass all POs
  return (
    <>
      {latestPO ? (
        <PODetailView
          data={latestPO}
          onClose={onClose}
          allPOs={sortedEventPoHistory} // Pass all POs here
        />
      ) : (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="rounded-xl bg-white p-8 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-gray-800 text-xl font-bold">
                Purchase Order History
              </h3>
              <button
                onClick={onClose}
                className="hover:bg-gray-100 rounded-lg p-2 transition-colors"
              >
                <FiX className="text-gray-500 h-6 w-6" />
              </button>
            </div>
            <div className="py-8 text-center">
              <FiAlertCircle className="text-gray-400 mx-auto mb-4 h-12 w-12" />
              <h4 className="text-gray-700 font-semibold">
                No Purchase Orders Found
              </h4>
              <p className="text-gray-500 mt-2 text-sm">
                There are no purchase orders for this event.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ExternalHistoryModel;
