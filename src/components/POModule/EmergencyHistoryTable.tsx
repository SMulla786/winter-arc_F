/* eslint-disable */
import React, {useState, useMemo, useEffect} from 'react';
import {
  FiAlertTriangle,
  FiChevronDown,
  FiChevronRight,
  FiFilter,
  FiX,
  FiPrinter,
  FiUsers,
  FiEye,
  FiFileText,
  FiDownload,
} from 'react-icons/fi';
import Select from 'react-select';

interface Vendor {
  id: string;
  name: string;
  phone: string;
  address: string;
  email: string | null;
  caterorId: string;
}

interface PurchaseMaterial {
  materialId: string;
  materialName: string;
  materialCategory: string; // Added this field
  quantity: number;
  time: string;
  date: string;
  venue: string;
  createdAt: string;
  price?: number;
  totalAmount?: number;
  vendor: Vendor;
}

interface EmergencyPO {
  poNumber: number;
  eventName: string;
  eventId: string;
  purchaseMaterials: PurchaseMaterial[];
  createdAt?: string;
}

interface EmergencyHistoryTableProps {
  data: EmergencyPO[];
  loading: boolean;
  error: any;
  vendors: Vendor[];
}

// ===========================================
// PRINT COMPONENTS
// ===========================================

interface PrintVendorWiseProps {
  data: EmergencyPO[];
  selectedVendorIds: string[];
  vendorOptions: any[];
  onClose: () => void;
}

const PrintVendorWise: React.FC<PrintVendorWiseProps> = ({
  data,
  selectedVendorIds,
  vendorOptions,
  onClose,
}) => {
  useEffect(() => {
    const printIframe = document.createElement('iframe');
    printIframe.style.position = 'fixed';
    printIframe.style.top = '0';
    printIframe.style.left = '0';
    printIframe.style.width = '0';
    printIframe.style.height = '0';
    printIframe.style.border = 'none';
    printIframe.style.zIndex = '-9999';
    printIframe.title = 'Vendor-wise Emergency PO Report';

    document.body.appendChild(printIframe);

    const iframeDoc =
      printIframe.contentDocument || printIframe.contentWindow?.document;

    if (!iframeDoc) {
      console.error('Cannot open print preview');
      onClose();
      return;
    }

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

    // Group data by vendor
    const vendorMap = new Map<string, EmergencyPO[]>();
    data.forEach((po) => {
      po.purchaseMaterials?.forEach((material) => {
        const vendorId = material.vendor?.id;
        if (vendorId) {
          if (!vendorMap.has(vendorId)) {
            vendorMap.set(vendorId, []);
          }
          const vendorPOs = vendorMap.get(vendorId)!;
          if (!vendorPOs.some((vpo) => vpo.poNumber === po.poNumber)) {
            vendorPOs.push(po);
          }
        }
      });
    });

    // Function to extract category - use materialCategory field directly
    const extractCategory = (material: PurchaseMaterial): string => {
      return material.materialCategory || 'Uncategorized';
    };

    // Function to group materials by category and material name
    const groupMaterialsByCategoryAndName = (materials: PurchaseMaterial[]) => {
      const grouped: Record<string, Record<string, PurchaseMaterial[]>> = {};

      materials.forEach((material) => {
        const category = extractCategory(material);
        const materialName = material.materialName;

        if (!grouped[category]) {
          grouped[category] = {};
        }

        if (!grouped[category][materialName]) {
          grouped[category][materialName] = [];
        }

        grouped[category][materialName].push(material);
      });

      return grouped;
    };

    // Calculate totals for a PO
    const calculateTotals = (po: EmergencyPO) => {
      let totalAmount = 0;
      let totalQuantity = 0;
      po.purchaseMaterials?.forEach((material) => {
        const quantity = material.quantity || 0;
        const price = material.price || 0;
        totalQuantity += quantity;
        totalAmount += quantity * price;
      });
      return {totalAmount, totalQuantity};
    };

    // Calculate category totals
    const calculateCategoryTotals = (materials: PurchaseMaterial[]) => {
      let totalAmount = 0;
      let totalQuantity = 0;
      materials.forEach((material) => {
        const quantity = material.quantity || 0;
        const price = material.price || 0;
        totalQuantity += quantity;
        totalAmount += quantity * price;
      });
      return {totalAmount, totalQuantity};
    };

    const overallTotals = data.reduce(
      (acc, po) => {
        const totals = calculateTotals(po);
        return {
          totalAmount: acc.totalAmount + totals.totalAmount,
          totalQuantity: acc.totalQuantity + totals.totalQuantity,
        };
      },
      {totalAmount: 0, totalQuantity: 0},
    );

    iframeDoc.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Vendor-wise Emergency PO Report</title>
        <style>
          @media print {
            @page {
              margin: 5mm !important;
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
              padding: 10px 0 !important;
              border-bottom: 2px solid #1E40AF;
              text-align: center;
              margin-bottom: 10px !important;
            }
            .print-header h1 {
              margin: 0 !important;
              font-size: 16px;
              font-weight: bold;
              color: #000;
            }
            .print-header .info {
              margin: 5px 0 !important;
              font-size: 10px;
              line-height: 1.3;
            }
            .vendor-header {
              background: #e0e7ff !important;
              font-weight: bold;
              font-size: 11px;
              padding: 8px 6px !important;
              border: 1px solid #1E40AF;
              margin-top: 15px !important;
              margin-bottom: 8px !important;
              border-radius: 3px;
            }
            .print-table {
              width: 100% !important;
              border-collapse: collapse;
              margin-top: 5px !important;
              margin-bottom: 5px !important;
              font-size: 9px;
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
            .po-header {
              background: #f0f0f0;
              font-weight: bold;
              margin-top: 10px;
              padding: 6px;
              border: 1px solid #ccc;
              font-size: 10px;
            }
            .category-header {
              background: #e8e8e8 !important;
              font-weight: 600;
              color: black !important;
              padding: 6px 4px !important;
              border: 1px solid #ccc;
              text-align: left;
              font-size: 10px;
            }
            .vendor-summary {
              background: #f8f8f8;
              padding: 8px;
              margin: 8px 0;
              border: 1px solid #ccc;
              font-size: 9px;
            }
            .grand-total {
              background: #1E3A8A !important;
              color: white !important;
              font-weight: bold;
              padding: 10px;
              margin-top: 15px;
              border: 1px solid #000;
              font-size: 11px;
            }
            .material-name-cell {
              font-weight: 600;
              text-align: left;
            }
            .total-row {
              background: #dbeafe !important;
              font-weight: bold;
            }
          }
        </style>
      </head>
      <body>
        <div class="print-container">
          <div class="print-header">
            <h1>Vendor-wise Emergency Purchase Order Report</h1>
            <div class="info">
              Generated on: ${new Date().toLocaleDateString()}
              ${
                selectedVendorIds.length > 0
                  ? `Showing ${selectedVendorIds.length} selected vendor(s)`
                  : 'Showing all vendors'
              }
              <br>
              Total POs: ${data.length} | Total Amount: ₹${overallTotals.totalAmount.toFixed(2)}
            </div>
          </div>

          ${Array.from(vendorMap.entries())
            .map(([vendorId, vendorPOs]) => {
              const vendor = vendorOptions.find((v) => v.value === vendorId);
              if (!vendor) return '';

              let vendorTotalAmount = 0;
              let vendorTotalMaterials = 0;

              return `
              <div class="vendor-header">
                ${vendor.label}
                <span style="float: right; font-size: 9px;">
                  ${vendor.phone} ${vendor.email ? '| ' + vendor.email : ''}
                </span>
              </div>
              
              ${vendorPOs
                .map((po) => {
                  const {totalAmount} = calculateTotals(po);
                  const materialsForVendor =
                    po.purchaseMaterials?.filter(
                      (m) => m.vendor?.id === vendorId,
                    ) || [];

                  // Group materials by category and material name
                  const groupedMaterials =
                    groupMaterialsByCategoryAndName(materialsForVendor);

                  const vendorPOAmount = materialsForVendor.reduce((sum, m) => {
                    const price = m.price || 0;
                    const quantity = m.quantity || 0;
                    return sum + price * quantity;
                  }, 0);

                  vendorTotalAmount += vendorPOAmount;
                  vendorTotalMaterials += materialsForVendor.length;

                  // Get all categories for this vendor in this PO
                  const categories = Object.keys(groupedMaterials).sort();

                  return `
                  <div class="po-header">
                    Emergency PO #${po.poNumber} - ${po.eventName}
                    <span style="float: right;">
                      Date: ${formatDisplayDate(po.createdAt || '')}
                      | Amount: ₹${vendorPOAmount.toFixed(2)}
                    </span>
                  </div>
                  
                  ${categories
                    .map((category) => {
                      const materialsByMaterialName =
                        groupedMaterials[category];
                      const materialNames = Object.keys(
                        materialsByMaterialName,
                      ).sort();

                      // Calculate category totals
                      const categoryMaterials = materialNames.flatMap(
                        (name) => materialsByMaterialName[name],
                      );
                      const categoryTotals =
                        calculateCategoryTotals(categoryMaterials);

                      return `
                    <div class="category-header">
                      ${category} - Total: ₹${categoryTotals.totalAmount.toFixed(2)}
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
                          <th>Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${materialNames
                          .map((materialName) => {
                            const materialEntries =
                              materialsByMaterialName[materialName];
                            const rowspan = materialEntries.length;

                            return materialEntries
                              .map((material, index) => {
                                const price = material.price || 0;
                                const quantity = material.quantity || 0;
                                const amount = price * quantity;

                                return `
                            <tr>
                              ${index === 0 ? `<td rowspan="${rowspan}" class="material-name-cell">${materialName}</td>` : ''}
                              <td>${quantity}</td>
                              <td>units</td>
                              <td>${formatDisplayDate(material.date)}</td>
                              <td>${formatDisplayTime(material.time)}</td>
                              <td>${material.venue}</td>
                              <td>₹${price.toFixed(2)}</td>
                              <td>₹${amount.toFixed(2)}</td>
                            </tr>
                          `;
                              })
                              .join('');
                          })
                          .join('')}
                        
                      </tbody>
                    </table>
                  `;
                    })
                    .join('')}
                  
                  
                `;
                })
                .join('')}
              
              
            `;
            })
            .join('')}
          
          <div class="grand-total">
            <table style="width: 100%;">
              <tr>
                <td>Total Vendors: ${vendorMap.size}</td>
                <td>Total Emergency POs: ${data.length}</td>
                <td>Grand Total Amount: ₹${overallTotals.totalAmount.toFixed(2)}</td>
              </tr>
            </table>
          </div>
        </div>
        <script>
          (function() {
            try {
              setTimeout(function() {
                window.print();
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

    setTimeout(() => {
      if (document.body.contains(printIframe)) {
        document.body.removeChild(printIframe);
      }
      onClose();
    }, 3000);

    return () => {
      if (document.body.contains(printIframe)) {
        document.body.removeChild(printIframe);
      }
    };
  }, [data, selectedVendorIds, vendorOptions, onClose]);

  return null;
};

interface PrintAllEmergencyProps {
  data: EmergencyPO[];
  onClose: () => void;
}

const PrintAllEmergency: React.FC<PrintAllEmergencyProps> = ({
  data,
  onClose,
}) => {
  useEffect(() => {
    const printIframe = document.createElement('iframe');
    printIframe.style.position = 'fixed';
    printIframe.style.top = '0';
    printIframe.style.left = '0';
    printIframe.style.width = '0';
    printIframe.style.height = '0';
    printIframe.style.border = 'none';
    printIframe.style.zIndex = '-9999';
    printIframe.title = 'All Emergency POs Report';

    document.body.appendChild(printIframe);

    const iframeDoc =
      printIframe.contentDocument || printIframe.contentWindow?.document;

    if (!iframeDoc) {
      console.error('Cannot open print preview');
      onClose();
      return;
    }

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

    // Function to extract category - use materialCategory field directly
    const extractCategory = (material: PurchaseMaterial): string => {
      return material.materialCategory || 'Uncategorized';
    };

    // Function to group materials by category and material name
    const groupMaterialsByCategoryAndName = (materials: PurchaseMaterial[]) => {
      const grouped: Record<string, Record<string, PurchaseMaterial[]>> = {};

      materials.forEach((material) => {
        const category = extractCategory(material);
        const materialName = material.materialName;

        if (!grouped[category]) {
          grouped[category] = {};
        }

        if (!grouped[category][materialName]) {
          grouped[category][materialName] = [];
        }

        grouped[category][materialName].push(material);
      });

      return grouped;
    };

    // Calculate totals
    const calculateTotals = (po: EmergencyPO) => {
      let totalAmount = 0;
      let totalQuantity = 0;
      po.purchaseMaterials?.forEach((material) => {
        const quantity = material.quantity || 0;
        const price = material.price || 0;
        totalQuantity += quantity;
        totalAmount += quantity * price;
      });
      return {totalAmount, totalQuantity};
    };

    // Calculate category totals
    const calculateCategoryTotals = (materials: PurchaseMaterial[]) => {
      let totalAmount = 0;
      let totalQuantity = 0;
      materials.forEach((material) => {
        const quantity = material.quantity || 0;
        const price = material.price || 0;
        totalQuantity += quantity;
        totalAmount += quantity * price;
      });
      return {totalAmount, totalQuantity};
    };

    const overallTotals = data.reduce(
      (acc, po) => {
        const totals = calculateTotals(po);
        return {
          totalAmount: acc.totalAmount + totals.totalAmount,
          totalQuantity: acc.totalQuantity + totals.totalQuantity,
        };
      },
      {totalAmount: 0, totalQuantity: 0},
    );

    iframeDoc.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Emergency Purchase Order Report</title>
        <style>
          @media print {
            @page {
              margin: 5mm !important;
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
              padding: 10px 0 !important;
              border-bottom: 2px solid #1E40AF;
              text-align: center;
              margin-bottom: 10px !important;
            }
            .print-header h1 {
              margin: 0 !important;
              font-size: 16px;
              font-weight: bold;
              color: #000;
            }
            .print-header .info {
              margin: 5px 0 !important;
              font-size: 10px;
              line-height: 1.3;
            }
            .po-header {
              background: #f0f0f0;
              font-weight: bold;
              margin-top: 15px;
              padding: 8px;
              border: 1px solid #ccc;
              font-size: 11px;
            }
            .category-header {
              background: #e8e8e8;
              font-weight: 600;
              padding: 6px;
              margin-top: 10px;
              border: 1px solid #ddd;
              font-size: 10px;
            }
            .print-table {
              width: 100% !important;
              border-collapse: collapse;
              margin-top: 5px !important;
              margin-bottom: 5px !important;
              font-size: 9px;
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
            .total-row {
              background: #dbeafe !important;
              font-weight: bold;
            }
            .grand-total {
              background: #1E3A8A !important;
              color: white !important;
              font-weight: bold;
              padding: 10px;
              margin-top: 15px;
              border: 1px solid #000;
              font-size: 11px;
            }
            .material-name-cell {
              font-weight: 600;
              text-align: left;
            }
          }
        </style>
      </head>
      <body>
        <div class="print-container">
          <div class="print-header">
            <h1>Emergency Purchase Order Report</h1>
            <div class="info">
              Generated on: ${new Date().toLocaleDateString()}
              <br>
              Total POs: ${data.length} | Total Amount: ₹${overallTotals.totalAmount.toFixed(2)}
            </div>
          </div>

          ${data
            .map((po) => {
              const {totalAmount, totalQuantity} = calculateTotals(po);

              // Group materials by category and material name
              const groupedMaterials = groupMaterialsByCategoryAndName(
                po.purchaseMaterials || [],
              );
              const categories = Object.keys(groupedMaterials).sort();

              return `
              <div class="po-header">
                Emergency PO #${po.poNumber} - ${po.eventName}
                <span style="float: right;">
                  Date: ${formatDisplayDate(po.createdAt || '')}
                  | Total: ₹${totalAmount.toFixed(2)}
                </span>
              </div>
              
              ${categories
                .map((category) => {
                  const materialsByMaterialName = groupedMaterials[category];
                  const materialNames = Object.keys(
                    materialsByMaterialName,
                  ).sort();

                  // Calculate category totals
                  const categoryMaterials = materialNames.flatMap(
                    (name) => materialsByMaterialName[name],
                  );
                  const categoryTotals =
                    calculateCategoryTotals(categoryMaterials);

                  return `
                <div class="category-header">
                  ${category} - Total: ₹${categoryTotals.totalAmount.toFixed(2)}
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
                      <th>Vendor</th>
                      <th>Price</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${materialNames
                      .map((materialName) => {
                        const materialEntries =
                          materialsByMaterialName[materialName];
                        const rowspan = materialEntries.length;

                        return materialEntries
                          .map((material, index) => {
                            const price = material.price || 0;
                            const quantity = material.quantity || 0;
                            const amount = price * quantity;

                            return `
                        <tr>
                          ${index === 0 ? `<td rowspan="${rowspan}" class="material-name-cell">${materialName}</td>` : ''}
                          <td>${quantity}</td>
                          <td>units</td>
                          <td>${formatDisplayDate(material.date)}</td>
                          <td>${formatDisplayTime(material.time)}</td>
                          <td>${material.venue}</td>
                          <td>${material.vendor?.name}</td>
                          <td>₹${price.toFixed(2)}</td>
                          <td>₹${amount.toFixed(2)}</td>
                        </tr>
                      `;
                          })
                          .join('');
                      })
                      .join('')}
                    
                  </tbody>
                </table>
              `;
                })
                .join('')}
              
              
            `;
            })
            .join('')}
          
         
        </div>
        <script>
          (function() {
            try {
              setTimeout(function() {
                window.print();
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

    setTimeout(() => {
      if (document.body.contains(printIframe)) {
        document.body.removeChild(printIframe);
      }
      onClose();
    }, 3000);

    return () => {
      if (document.body.contains(printIframe)) {
        document.body.removeChild(printIframe);
      }
    };
  }, [data, onClose]);

  return null;
};

// ===========================================
// MAIN COMPONENT
// ===========================================

const EmergencyHistoryTable: React.FC<EmergencyHistoryTableProps> = ({
  data,
  loading,
  error,
  vendors,
}) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(),
  );
  const [expandedPOs, setExpandedPOs] = useState<Set<number>>(new Set());
  const [selectedVendorIds, setSelectedVendorIds] = useState<string[]>([]);
  const [showVendorPrint, setShowVendorPrint] = useState(false);
  const [showAllEmergencyPrint, setShowAllEmergencyPrint] = useState(false);

  // Vendor options for dropdown
  const vendorOptions = useMemo(() => {
    const uniqueVendors = new Map<string, Vendor>();

    // Extract unique vendors from data
    data.forEach((po) => {
      po.purchaseMaterials?.forEach((material) => {
        const vendor = material.vendor;
        if (vendor && vendor.id && !uniqueVendors.has(vendor.id)) {
          uniqueVendors.set(vendor.id, vendor);
        }
      });
    });

    // Fallback to passed vendors if no vendors in data
    if (uniqueVendors.size === 0 && vendors && vendors.length > 0) {
      vendors.forEach((vendor) => {
        if (vendor && vendor.id) {
          uniqueVendors.set(vendor.id, vendor);
        }
      });
    }

    return Array.from(uniqueVendors.values())
      .filter((vendor) => vendor && vendor.name)
      .map((vendor) => ({
        value: vendor.id,
        label: vendor.name,
        phone: vendor.phone,
        email: vendor.email,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [data, vendors]);

  // Filter data based on selected vendors
  const filteredData = useMemo(() => {
    if (!data || data.length === 0) return [];
    if (selectedVendorIds.length === 0) return data;

    return data
      .map((po) => {
        // Filter purchase materials for this PO
        const filteredMaterials =
          po.purchaseMaterials?.filter((material) =>
            selectedVendorIds.includes(material.vendor?.id),
          ) || [];

        // Return PO only if it has materials after filtering
        if (filteredMaterials.length > 0) {
          return {
            ...po,
            purchaseMaterials: filteredMaterials,
          };
        }
        return null;
      })
      .filter((po) => po !== null) as EmergencyPO[];
  }, [data, selectedVendorIds]);

  // Handle vendor selection change
  const handleVendorSelectionChange = (selectedOptions: any) => {
    const selectedIds = selectedOptions
      ? selectedOptions.map((opt: any) => opt.value)
      : [];
    setSelectedVendorIds(selectedIds);
  };

  // Calculate total amounts
  const calculateTotals = (po: EmergencyPO) => {
    let totalAmount = 0;
    let totalQuantity = 0;

    po.purchaseMaterials?.forEach((material) => {
      const quantity = material.quantity || 0;
      const price = material.price || 0;
      totalQuantity += quantity;
      totalAmount += quantity * price;
    });

    return {totalAmount, totalQuantity};
  };

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

  // Group materials by category for each PO - FIXED: Use materialCategory field
  const getGroupedMaterials = (po: EmergencyPO) => {
    const grouped: {[category: string]: PurchaseMaterial[]} = {};

    po.purchaseMaterials?.forEach((material) => {
      const category = material.materialCategory || 'Uncategorized';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(material);
    });

    return grouped;
  };

  // Preview Vendor-wise Report
  const previewVendorWise = () => {
    setShowVendorPrint(true);
  };

  // Preview All Emergency List
  const previewAllEmergency = () => {
    setShowAllEmergencyPrint(true);
  };

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

  const togglePOExpansion = (poNumber: number) => {
    setExpandedPOs((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(poNumber)) {
        newSet.delete(poNumber);
      } else {
        newSet.add(poNumber);
      }
      return newSet;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="text-gray-600 dark:text-gray-400 mt-3">
            Loading emergency history...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-900/20">
        <div className="flex items-center text-red-800 dark:text-red-200">
          <FiAlertTriangle className="mr-2 h-5 w-5" />
          <span>Error loading emergency history: {error.message}</span>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900 rounded-lg border p-8 text-center">
        <FiAlertTriangle className="text-gray-400 dark:text-gray-500 mx-auto mb-4 h-12 w-12" />
        <h3 className="text-gray-900 dark:text-gray-100 mb-2 text-lg font-medium">
          No Emergency Purchase Orders Found
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Start by creating your first emergency purchase order.
        </p>
      </div>
    );
  }

  // Sort POs by number (descending)
  const sortedData = [...filteredData].sort((a, b) => b.poNumber - a.poNumber);
  const displayData = filteredData.length > 0 ? sortedData : [];

  return (
    <>
      {/* Print Components */}
      {showVendorPrint && (
        <PrintVendorWise
          data={filteredData.length > 0 ? filteredData : data}
          selectedVendorIds={selectedVendorIds}
          vendorOptions={vendorOptions}
          onClose={() => setShowVendorPrint(false)}
        />
      )}

      {showAllEmergencyPrint && (
        <PrintAllEmergency
          data={filteredData.length > 0 ? filteredData : data}
          onClose={() => setShowAllEmergencyPrint(false)}
        />
      )}
      <div className="space-y-6">
        {/* Print Preview Buttons Section - Right Side */}
        <div className="p-4 dark:border-blue-800 dark:bg-blue-900/20">
          <div className="flex items-center justify-end gap-3">
            {/* Vendor Filter Section */}
            <div className="flex items-center gap-3">
              <div className="min-w-[250px]">
                <Select
                  isMulti
                  options={vendorOptions}
                  value={vendorOptions.filter((o) =>
                    selectedVendorIds.includes(o.value),
                  )}
                  onChange={handleVendorSelectionChange}
                  placeholder="Select vendors..."
                  className="text-sm"
                  styles={{
                    control: (base) => ({
                      ...base,
                      background: 'white',
                      borderRadius: '8px',
                      borderColor: '#cbd5e0',
                      minHeight: '40px',
                      boxShadow: 'none',
                      '&:hover': {
                        borderColor: '#3182ce',
                      },
                    }),
                    menu: (base) => ({
                      ...base,
                      zIndex: 9999,
                    }),
                    multiValue: (base) => ({
                      ...base,
                      backgroundColor: '#3182ce',
                      color: 'white',
                    }),
                    multiValueLabel: (base) => ({
                      ...base,
                      color: 'white',
                    }),
                    multiValueRemove: (base) => ({
                      ...base,
                      color: 'white',
                      ':hover': {
                        backgroundColor: '#2b6cb0',
                        color: 'white',
                      },
                    }),
                  }}
                />
              </div>
            </div>

            {/* Preview Buttons */}
            <div className="flex gap-3">
              <button
                onClick={previewVendorWise}
                className="flex items-center justify-center gap-2 whitespace-nowrap rounded bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700"
              >
                <FiFileText className="h-4 w-4" />
                Vendor Report
                <span className="ml-2 rounded-full bg-white/20 px-2 py-0.5 text-xs">
                  {selectedVendorIds.length === 0
                    ? vendorOptions.length
                    : selectedVendorIds.length}
                </span>
              </button>

              <button
                onClick={previewAllEmergency}
                className="flex items-center justify-center gap-2 rounded bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
              >
                <FiPrinter className="h-4 w-4" />
                All Emergency POs
                <span className="ml-2 rounded-full bg-white/20 px-2 py-0.5 text-xs">
                  {selectedVendorIds.length > 0
                    ? filteredData.length
                    : data.length}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Emergency PO List */}
        {displayData.length === 0 && selectedVendorIds.length > 0 ? (
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-8 text-center dark:border-yellow-800 dark:bg-yellow-900/20">
            <FiAlertTriangle className="mx-auto mb-4 h-12 w-12 text-yellow-500 dark:text-yellow-400" />
            <h3 className="text-gray-900 dark:text-gray-100 mb-2 text-lg font-medium">
              No Emergency POs Match Your Filter
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try selecting different vendors or clear the filter to see all
              POs.
            </p>
          </div>
        ) : (
          displayData.map((po) => {
            const isPOExpanded = expandedPOs.has(po.poNumber);
            const groupedMaterials = getGroupedMaterials(po);
            const categories = Object.keys(groupedMaterials);
            const totalMaterials = po.purchaseMaterials?.length || 0;
            const {totalAmount, totalQuantity} = calculateTotals(po);

            // Get unique vendors in this PO
            const uniqueVendorsInPO = new Map<string, string>();
            po.purchaseMaterials?.forEach((material) => {
              if (material.vendor) {
                uniqueVendorsInPO.set(material.vendor.id, material.vendor.name);
              }
            });
            const vendorCount = uniqueVendorsInPO.size;

            return (
              <div
                key={po.poNumber}
                className="overflow-hidden rounded-xl border border-stroke bg-white shadow-sm dark:border-strokedark dark:bg-black"
              >
                {/* PO Header */}
                <div className="bg-blue-50 px-4 py-3 dark:bg-blue-900/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => togglePOExpansion(po.poNumber)}
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        {isPOExpanded ? (
                          <FiChevronDown className="h-5 w-5" />
                        ) : (
                          <FiChevronRight className="h-5 w-5" />
                        )}
                        <h3 className="text-gray-900 dark:text-gray-100 text-lg font-semibold">
                          Emergency PO #{po.poNumber} - {po.eventName}
                        </h3>
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-600 dark:text-gray-400">
                          {vendorCount} vendor(s) • {totalMaterials} materials
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* PO Details - Expandable Section */}
                {isPOExpanded && (
                  <div className="p-0">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-stroke dark:divide-strokedark">
                        <thead className="h-16 rounded-t-md bg-blue-900 text-white dark:bg-blue-950">
                          <tr>
                            <th className="px-4 py-3 text-left text-sm font-semibold">
                              Material
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-semibold">
                              Qty
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-semibold">
                              Date
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-semibold">
                              Time
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-semibold">
                              Venue
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-semibold">
                              Vendor
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-semibold">
                              Unit Price
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-semibold">
                              Total Price
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stroke bg-white dark:divide-strokedark dark:bg-black">
                          {categories.map((category) => {
                            const isCategoryExpanded =
                              expandedCategories.has(category);
                            const categoryMaterials =
                              groupedMaterials[category];
                            const categoryQuantity = categoryMaterials.reduce(
                              (sum, m) => sum + (m.quantity || 0),
                              0,
                            );
                            const categoryAmount = categoryMaterials.reduce(
                              (sum, m) =>
                                sum + (m.price || 0) * (m.quantity || 0),
                              0,
                            );

                            return (
                              <React.Fragment key={category}>
                                {/* Category Header Row */}
                                <tr className="dark:bg-gray-800 bg-gray-2 px-4 py-4 font-bold text-black dark:text-white">
                                  <td colSpan={8} className="px-4 py-3">
                                    <div className="flex items-center justify-between">
                                      <div
                                        className="flex cursor-pointer items-center gap-2"
                                        onClick={() =>
                                          toggleCategoryExpansion(category)
                                        }
                                      >
                                        {isCategoryExpanded ? (
                                          <FiChevronDown className="h-4 w-4" />
                                        ) : (
                                          <FiChevronRight className="h-4 w-4" />
                                        )}
                                        <span className="text-gray-800 dark:text-gray-200 font-semibold">
                                          {category}
                                        </span>
                                        <span className="text-gray-600 dark:text-gray-400 text-sm">
                                          ({categoryMaterials.length} materials)
                                        </span>
                                        <span className="text-gray-600 dark:text-gray-400 ml-2 text-sm">
                                          • Total Qty: {categoryQuantity}
                                        </span>
                                        <span className="ml-2 text-sm font-bold text-green-700 dark:text-green-400">
                                          • Total Amount: ₹
                                          {categoryAmount.toFixed(2)}
                                        </span>
                                      </div>
                                    </div>
                                  </td>
                                </tr>

                                {/* Category Details - Show when expanded */}
                                {isCategoryExpanded &&
                                  categoryMaterials.map((material, index) => {
                                    const price = material.price || 0;
                                    const quantity = material.quantity || 0;
                                    const totalPrice = price * quantity;

                                    return (
                                      <tr
                                        key={index}
                                        className={`hover:bg-gray-100 dark:hover:bg-gray-800 ${index % 2 === 0 ? 'bg-white dark:bg-black' : 'bg-gray-50 dark:bg-gray-900'}`}
                                      >
                                        <td className="text-gray-800 dark:text-gray-200 px-4 py-3 text-sm font-medium">
                                          <div>{material.materialName}</div>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                          <span className="rounded bg-blue-50 px-3 py-1.5 text-sm font-medium dark:bg-blue-900/20 dark:text-blue-300">
                                            {quantity}
                                          </span>
                                        </td>
                                        <td className="px-4 py-3 text-center text-sm">
                                          {material.date
                                            ? formatDisplayDate(material.date)
                                            : '-'}
                                        </td>
                                        <td className="px-4 py-3 text-center text-sm">
                                          {material.time
                                            ? formatDisplayTime(material.time)
                                            : '-'}
                                        </td>
                                        <td className="text-gray-600 dark:text-gray-400 max-w-[120px] truncate px-4 py-3 text-center text-sm">
                                          {material.venue}
                                        </td>
                                        <td className="max-w-[140px] px-4 py-3 text-center">
                                          <div className="flex flex-col items-center">
                                            <div className="text-sm font-medium">
                                              {material.vendor?.name}
                                            </div>
                                          </div>
                                        </td>
                                        <td className="px-4 py-3 text-center text-sm font-medium text-green-700 dark:text-green-400">
                                          ₹{price.toFixed(2)}
                                        </td>
                                        <td className="px-4 py-3 text-center text-sm font-bold text-green-800 dark:text-green-300">
                                          ₹{totalPrice.toFixed(2)}
                                        </td>
                                      </tr>
                                    );
                                  })}
                              </React.Fragment>
                            );
                          })}

                          {categories.length === 0 && (
                            <tr>
                              <td
                                colSpan={8}
                                className="border-gray-300 text-gray-700 dark:text-gray-300 border-t px-4 py-8 text-center text-sm dark:border-strokedark"
                              >
                                <div className="py-4">
                                  <FiAlertTriangle className="text-gray-400 dark:text-gray-500 mx-auto h-12 w-12" />
                                  <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg font-medium">
                                    No materials found
                                  </p>
                                </div>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* PO Footer Info */}
                    <div className="bg-gray-50 dark:bg-gray-900 border-t border-stroke px-4 py-3 dark:border-strokedark">
                      <div className="flex items-center justify-between">
                        <div className="text-gray-600 dark:text-gray-400 text-sm">
                          <p>
                            PO #{po.poNumber} • Event: {po.eventName}
                          </p>
                        </div>
                        <div className="flex items-center gap-6 text-sm">
                          <div className="text-gray-600 dark:text-gray-400">
                            {totalMaterials} materials in {categories.length}{' '}
                            categories
                          </div>
                          <div className="font-bold text-green-700 dark:text-green-400">
                            Grand Total: ₹{totalAmount.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* No Data Message when filtered */}
        {displayData.length === 0 && selectedVendorIds.length === 0 && (
          <div className="border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900 rounded-lg border p-8 text-center">
            <FiAlertTriangle className="text-gray-400 dark:text-gray-500 mx-auto mb-4 h-12 w-12" />
            <h3 className="text-gray-900 dark:text-gray-100 mb-2 text-lg font-medium">
              No Emergency Purchase Orders Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Start by creating your first emergency purchase order.
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default EmergencyHistoryTable;
export type {EmergencyPO, PurchaseMaterial};
