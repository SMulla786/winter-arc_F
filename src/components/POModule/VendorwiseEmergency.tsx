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
  FiFileText,
} from 'react-icons/fi';

// Emergency PO Types
export interface EmergencyPO {
  poNumber: number;
  eventName: string;
  eventId: string;
  purchaseMaterials: PurchaseMaterial[];
  createdAt?: string;
}

export interface PurchaseMaterial {
  materialId: string;
  materialName: string;
  quantity: number;
  time: string;
  date: string;
  venue: string;
  createdAt: string;
  vendor: {
    id: string;
    name: string;
    phone: string;
    address: string;
    email: string | null;
    caterorId: string;
  };
}

interface EmergencyVendorReportPrintProps {
  data: EmergencyPO[];
  selectedVendorIds: string[];
  onClose: () => void;
  vendorOptions?: {value: string; label: string}[];
}

// Vendor-wise Emergency PO Report Print Component
const EmergencyVendorReportPrint: React.FC<EmergencyVendorReportPrintProps> = ({
  data,
  selectedVendorIds,
  onClose,
  vendorOptions,
}) => {
  if (!data || data.length === 0) {
    onClose();
    return null;
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

  // Get all materials grouped by vendor
  const getMaterialsByVendor = useMemo(() => {
    // Flatten all materials from all emergency POs
    const allMaterials: any[] = [];

    data.forEach((po) => {
      if (po.purchaseMaterials && Array.isArray(po.purchaseMaterials)) {
        po.purchaseMaterials.forEach((material) => {
          allMaterials.push({
            ...material,
            poNumber: po.poNumber,
            eventName: po.eventName,
            createdAt: po.createdAt,
            materialName: material.materialName,
            vendorId: material.vendor.id,
            vendorName: material.vendor.name,
          });
        });
      }
    });

    // Filter by selected vendors
    const filteredMaterials =
      selectedVendorIds.length === 0
        ? allMaterials
        : allMaterials.filter((m) => selectedVendorIds.includes(m.vendorId));

    // Group by vendor
    const vendorMap = new Map<string, any>();

    filteredMaterials.forEach((material) => {
      const vendorId = material.vendorId;
      const vendorName = material.vendorName;

      if (!vendorMap.has(vendorId)) {
        vendorMap.set(vendorId, {
          vendorId,
          vendorName,
          vendorDetails: material.vendor,
          materials: [],
          totalQuantity: 0,
          emergencyPOs: new Set<number>(),
        });
      }

      const vendorData = vendorMap.get(vendorId);
      vendorData.materials.push(material);
      vendorData.totalQuantity += material.quantity || 0;
      vendorData.emergencyPOs.add(material.poNumber);
    });

    // Convert to array and sort by vendor name
    return Array.from(vendorMap.values())
      .map((vendor) => ({
        ...vendor,
        emergencyPOs: Array.from(vendor.emergencyPOs),
        emergencyPOCount: vendor.emergencyPOs.size,
      }))
      .sort((a, b) =>
        a.vendorName.localeCompare(b.vendorName, 'hi', {sensitivity: 'base'}),
      );
  }, [data, selectedVendorIds]);

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

  // Calculate overall totals
  const calculateOverallTotals = () => {
    let totalVendors = getMaterialsByVendor.length;
    let totalMaterials = 0;
    let totalQuantity = 0;
    let totalEmergencyPOs = new Set<number>();

    getMaterialsByVendor.forEach((vendor) => {
      totalMaterials += vendor.materials.length;
      totalQuantity += vendor.totalQuantity;
      vendor.emergencyPOs.forEach((poNumber) =>
        totalEmergencyPOs.add(poNumber),
      );
    });

    return {
      totalVendors,
      totalMaterials,
      totalQuantity,
      totalEmergencyPOs: totalEmergencyPOs.size,
      emergencyPOList: Array.from(totalEmergencyPOs).sort((a, b) => b - a),
    };
  };

  const {
    totalVendors,
    totalMaterials,
    totalQuantity,
    totalEmergencyPOs,
    emergencyPOList,
  } = calculateOverallTotals();

  // Get unique emergency POs
  const uniqueEmergencyPOs = useMemo(() => {
    const poSet = new Set<number>();
    data.forEach((po) => poSet.add(po.poNumber));
    return Array.from(poSet).sort((a, b) => b - a);
  }, [data]);

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

    // Write HTML content optimized for direct printing
    iframeDoc.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Vendor-wise Emergency PO Report</title>
        <style>
          @media print {
            @page {
              margin: 10mm !important;
              size: auto;
            }
            
            body {
              margin: 0 !important;
              padding: 0 !important;
              font-family: Arial, sans-serif;
              color: #000;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              font-size: 12px;
            }
            
            .print-container {
              margin: 0 !important;
              padding: 0 !important;
              width: 100% !important;
            }
            
            .print-header {
              padding: 10px 0 !important;
              border-bottom: 3px solid #2563EB;
              text-align: center;
              margin-bottom: 15px !important;
            }
            
            .print-header h1 {
              margin: 0 !important;
              font-weight: bold;
              font-size: 24px;
              color: #000;
            }
            
            .print-header .info {
              margin: 10px 0 !important;
              font-size: 14px;
              line-height: 1.4;
            }
            
            .print-header .summary {
              margin: 10px 0 !important;
              font-size: 13px;
              color: #333;
            }
            
            .emergency-badge {
              background: #2563EB !important;
              color: white !important;
              padding: 2px 8px !important;
              border-radius: 4px;
              font-weight: bold;
              font-size: 11px;
              margin-left: 10px;
            }
            
            /* Main table styling */
            .print-table {
              width: 100% !important;
              border-collapse: collapse;
              margin-top: 10px !important;
              margin-bottom: 10px !important;
              font-size: 10pt;
              page-break-inside: auto;
            }
            
            .print-table th {
              background: #1E40AF !important;
              color: white !important;
              padding: 10px 6px !important;
              text-align: center;
              border: 1px solid #ccc;
              font-weight: bold;
              font-size: 10pt;
            }
            
            .print-table td {
              border: 1px solid #ddd;
              padding: 8px 6px !important;
              text-align: center;
              vertical-align: middle;
            }
            
            /* Vendor header */
            .vendor-header {
              background: #DBEAFE !important;
              font-weight: bold;
              font-size: 12pt;
              text-align: left !important;
              padding: 12px 8px !important;
              border: 2px solid #2563EB;
              margin-top: 20px !important;
              margin-bottom: 10px !important;
              border-radius: 4px;
              page-break-before: always;
            }
            
            .vendor-header:first-child {
              page-break-before: auto;
            }
            
            .vendor-info {
              margin: 5px 0 !important;
              font-size: 11px;
              color: #666;
            }
            
            .vendor-info span {
              margin-right: 15px;
            }
            
            /* PO header */
            .po-header {
              background: #EFF6FF !important;
              font-weight: 600;
              font-size: 11pt;
              text-align: left !important;
              padding: 10px 8px !important;
              border: 1px solid #93C5FD;
              margin-top: 15px !important;
              border-radius: 3px;
            }
            
            /* Material rows */
            .material-name-cell {
              text-align: left !important;
              font-weight: 600;
            }
            
            .quantity-cell {
              text-align: center !important;
            }
            
            .unit-cell {
              text-align: center !important;
              width: 60px;
            }
            
            .date-cell {
              text-align: center !important;
              width: 80px;
            }
            
            .time-cell {
              text-align: center !important;
              width: 70px;
            }
            
            .location-cell {
              text-align: center !important;
              max-width: 100px;
              word-wrap: break-word;
            }
            
            .po-cell {
              text-align: center !important;
              width: 80px;
              font-weight: bold;
              color: #2563EB;
            }
            
            /* Totals */
            .vendor-total {
              background: #DBEAFE !important;
              font-weight: bold;
              border: 1px solid #2563EB;
            }
            
            .vendor-total td {
              border-color: #2563EB;
            }
            
            .grand-total {
              background: #1E40AF !important;
              color: white !important;
              font-weight: bold;
              border: 2px solid #000;
            }
            
            .grand-total td {
              color: white !important;
              border-color: #000;
              padding: 12px 6px !important;
            }
            
            /* Page break control */
            .page-break {
              page-break-before: always;
            }
            
            /* For empty state */
            .empty-state {
              text-align: center;
              padding: 40px 20px;
              font-size: 14px;
              color: #666;
            }
          }
          
          /* Non-print styles */
          body {
            margin: 0 !important;
            padding: 10px !important;
            font-family: Arial, sans-serif;
          }
        </style>
      </head>
      <body>
        <div class="print-container">
          <div class="print-header">
            <h1>Vendor-wise Emergency Purchase Order Report <span class="emergency-badge">EMERGENCY</span></h1>
            <div class="info">
              Event: ${data[0]?.eventName || 'Unknown Event'}
              <br>
              ${selectedVendorIds.length > 0 ? `Selected Vendors: ${getSelectedVendorNames()}` : 'All Vendors'}
              <br>
              Emergency POs Included: ${emergencyPOList.map((po) => `#${po}`).join(', ')}
            </div>
            <div class="summary">
              Vendors: ${totalVendors} | Materials: ${totalMaterials} | Total Qty: ${totalQuantity} | Emergency POs: ${totalEmergencyPOs}
            </div>
          </div>

          ${
            getMaterialsByVendor.length > 0
              ? getMaterialsByVendor
                  .map((vendor, vendorIndex) => {
                    // Group vendor materials by PO
                    const poMap = new Map<number, any[]>();

                    vendor.materials.forEach((material: any) => {
                      const poNumber = material.poNumber;
                      if (!poMap.has(poNumber)) {
                        poMap.set(poNumber, []);
                      }
                      poMap.get(poNumber)!.push(material);
                    });

                    // Sort POs by number (descending)
                    const sortedPOs = Array.from(poMap.entries()).sort(
                      ([poA], [poB]) => poB - poA,
                    );

                    return `
                    <div style="margin-top: ${vendorIndex > 0 ? '30px' : '10px'}; page-break-inside: avoid;">
                      <div class="vendor-header">
                        <div>Vendor: ${vendor.vendorName}</div>
                        <div class="vendor-info">
                          <span><strong>Contact:</strong> ${vendor.vendorDetails?.phone || 'N/A'}</span>
                          ${vendor.vendorDetails?.email ? `<span><strong>Email:</strong> ${vendor.vendorDetails.email}</span>` : ''}
                          <span><strong>Emergency POs:</strong> ${vendor.emergencyPOs.map((po) => `#${po}`).join(', ')}</span>
                          <span style="float: right;">
                            Materials: ${vendor.materials.length} | Total Qty: ${vendor.totalQuantity}
                          </span>
                        </div>
                      </div>
                      
                      ${sortedPOs
                        .map(([poNumber, materials]) => {
                          const poData = data.find(
                            (po) => po.poNumber === poNumber,
                          );
                          const poTotalQty = materials.reduce(
                            (sum, m) => sum + (m.quantity || 0),
                            0,
                          );

                          return `
                          <div style="margin-top: 15px;">
                            <div class="po-header">
                              Emergency PO #${poNumber} 
                              <span style="float: right; font-size: 10pt;">
                                Materials: ${materials.length} | Qty: ${poTotalQty} | Date: ${poData?.createdAt ? formatDisplayDate(poData.createdAt) : 'N/A'}
                              </span>
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
                                  <th>Emergency PO #</th>
                                </tr>
                              </thead>
                              <tbody>
                                ${materials
                                  .map((material: any) => {
                                    return `
                                      <tr>
                                        <td class="material-name-cell">${material.materialName}</td>
                                        <td class="quantity-cell">${material.quantity || 0}</td>
                                        <td class="unit-cell">units</td>
                                        <td class="date-cell">${material.date ? formatDisplayDate(material.date) : '-'}</td>
                                        <td class="time-cell">${material.time ? formatDisplayTime(material.time) : '-'}</td>
                                        <td class="location-cell">${material.venue || '—'}</td>
                                        <td class="po-cell">#${poNumber}</td>
                                      </tr>
                                    `;
                                  })
                                  .join('')}
                              </tbody>
                            </table>
                          </div>
                        `;
                        })
                        .join('')}
                      
                      <!-- Vendor Summary -->
                      <div style="margin-top: 15px;">
                        <table class="print-table vendor-total">
                          <tr>
                            <td colspan="5" style="text-align: left; padding-left: 20px;">
                              <strong>Vendor Summary: ${vendor.vendorName}</strong>
                            </td>
                            <td style="text-align: right;"><strong>Total Qty:</strong></td>
                            <td class="quantity-cell"><strong>${vendor.totalQuantity}</strong></td>
                          </tr>
                          <tr>
                            <td colspan="5" style="text-align: left; padding-left: 20px;">
                              <span style="font-size: 10px;">Emergency POs: ${vendor.emergencyPOs.map((po) => `#${po}`).join(', ')}</span>
                            </td>
                            <td style="text-align: right;"><strong>Materials:</strong></td>
                            <td class="quantity-cell"><strong>${vendor.materials.length}</strong></td>
                          </tr>
                        </table>
                      </div>
                    </div>
                    ${vendorIndex < getMaterialsByVendor.length - 1 ? '<div style="page-break-before: always;"></div>' : ''}
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
          
          <!-- Grand Total Section -->
          ${
            getMaterialsByVendor.length > 0
              ? `
                <div style="margin-top: 30px; page-break-before: avoid;">
                  <table class="print-table grand-total">
                    <tr>
                      <td colspan="5" style="text-align: left; padding-left: 20px;">
                        <strong>GRAND SUMMARY - EMERGENCY POS</strong>
                      </td>
                      <td style="text-align: right;"><strong>Total Vendors:</strong></td>
                      <td class="quantity-cell">${totalVendors}</td>
                    </tr>
                    <tr>
                      <td colspan="5" style="padding-left: 20px;"></td>
                      <td style="text-align: right;"><strong>Emergency POs:</strong></td>
                      <td class="quantity-cell">${totalEmergencyPOs}</td>
                    </tr>
                    <tr>
                      <td colspan="5" style="padding-left: 20px;"></td>
                      <td style="text-align: right;"><strong>Total Materials:</strong></td>
                      <td class="quantity-cell">${totalMaterials}</td>
                    </tr>
                    <tr>
                      <td colspan="5" style="padding-left: 20px;"></td>
                      <td style="text-align: right;"><strong>Total Quantity:</strong></td>
                      <td class="quantity-cell"><strong>${totalQuantity}</strong></td>
                    </tr>
                  </table>
                </div>
              `
              : ''
          }
          
          <!-- Footer -->
          <div style="margin-top: 30px; padding-top: 10px; border-top: 1px solid #ccc; text-align: center; font-size: 10px; color: #666;">
            <p>Generated on ${formatDisplayDate(new Date().toISOString())}</p>
            <p>Event: ${data[0]?.eventName || 'Unknown'} • Total Emergency POs: ${uniqueEmergencyPOs.length}</p>
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

// Main Component - Vendorwise Emergency PO Report
interface VendorwiseEmergencyProps {
  emergencyPOData: EmergencyPO[];
  vendors: any[];
}

const VendorwiseEmergency: React.FC<VendorwiseEmergencyProps> = ({
  emergencyPOData,
  vendors,
}) => {
  const [selectedVendorIds, setSelectedVendorIds] = useState<string[]>([]);
  const [showVendorReport, setShowVendorReport] = useState<boolean>(false);
  const [expandedPOs, setExpandedPOs] = useState<Set<number>>(new Set());
  const [expandedVendors, setExpandedVendors] = useState<Set<string>>(
    new Set(),
  );

  // Format date for display
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

  // Get all vendors from emergency PO data
  const getAllVendorsForSelection = useMemo(() => {
    const vendorsMap = new Map<
      string,
      {id: string; name: string; phone: string; email?: string}
    >();

    emergencyPOData.forEach((po) => {
      po.purchaseMaterials?.forEach((material) => {
        const vendorId = material.vendor.id;
        const vendorName = material.vendor.name || 'Unknown Vendor';

        if (vendorId && !vendorsMap.has(vendorId)) {
          vendorsMap.set(vendorId, {
            id: vendorId,
            name: vendorName,
            phone: material.vendor.phone || '',
            email: material.vendor.email || undefined,
          });
        }
      });
    });

    return Array.from(vendorsMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name, 'hi', {sensitivity: 'base'}),
    );
  }, [emergencyPOData]);

  // Create options for react-select
  const vendorOptions = useMemo(() => {
    return getAllVendorsForSelection.map((vendor) => ({
      value: vendor.id,
      label: vendor.name,
      phone: vendor.phone,
      email: vendor.email,
    }));
  }, [getAllVendorsForSelection]);

  // Handle vendor selection change
  const handleVendorSelectionChange = (selectedOptions: any) => {
    const selectedIds = selectedOptions
      ? selectedOptions.map((opt: any) => opt.value)
      : [];
    setSelectedVendorIds(selectedIds);
  };

  // Handle print vendor details
  const handlePrintVendorDetails = () => {
    // Show all vendors if none selected
    const vendorIdsToUse =
      selectedVendorIds.length > 0
        ? selectedVendorIds
        : getAllVendorsForSelection.map((v) => v.id);

    setSelectedVendorIds(vendorIdsToUse);
    setShowVendorReport(true);
  };

  // Toggle PO expansion
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

  // Toggle vendor expansion
  const toggleVendorExpansion = (vendorId: string) => {
    setExpandedVendors((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(vendorId)) {
        newSet.delete(vendorId);
      } else {
        newSet.add(vendorId);
      }
      return newSet;
    });
  };

  // Group materials by vendor
  const getMaterialsByVendor = useMemo(() => {
    const vendorMap = new Map<string, any>();

    emergencyPOData.forEach((po) => {
      po.purchaseMaterials?.forEach((material) => {
        const vendorId = material.vendor.id;
        const vendorName = material.vendor.name;

        if (!vendorMap.has(vendorId)) {
          vendorMap.set(vendorId, {
            vendorId,
            vendorName,
            vendorDetails: material.vendor,
            materials: [],
            totalQuantity: 0,
            emergencyPOs: new Set<number>(),
          });
        }

        const vendorData = vendorMap.get(vendorId);
        vendorData.materials.push({
          ...material,
          poNumber: po.poNumber,
          eventName: po.eventName,
          createdAt: po.createdAt,
        });
        vendorData.totalQuantity += material.quantity || 0;
        vendorData.emergencyPOs.add(po.poNumber);
      });
    });

    // Convert to array and sort
    return Array.from(vendorMap.values())
      .map((vendor) => ({
        ...vendor,
        emergencyPOs: Array.from(vendor.emergencyPOs),
        emergencyPOCount: vendor.emergencyPOs.size,
      }))
      .sort((a, b) =>
        a.vendorName.localeCompare(b.vendorName, 'hi', {sensitivity: 'base'}),
      );
  }, [emergencyPOData]);

  // Calculate totals
  const calculateTotals = () => {
    let totalVendors = getMaterialsByVendor.length;
    let totalMaterials = 0;
    let totalQuantity = 0;
    let totalEmergencyPOs = new Set<number>();

    getMaterialsByVendor.forEach((vendor) => {
      totalMaterials += vendor.materials.length;
      totalQuantity += vendor.totalQuantity;
      vendor.emergencyPOs.forEach((poNumber) =>
        totalEmergencyPOs.add(poNumber),
      );
    });

    return {
      totalVendors,
      totalMaterials,
      totalQuantity,
      totalEmergencyPOs: totalEmergencyPOs.size,
    };
  };

  const {totalVendors, totalMaterials, totalQuantity, totalEmergencyPOs} =
    calculateTotals();

  // Sort emergency POs by number (descending)
  const sortedEmergencyPOs = useMemo(() => {
    return [...emergencyPOData].sort((a, b) => b.poNumber - a.poNumber);
  }, [emergencyPOData]);

  return (
    <div className="space-y-6">
      {/* Vendor Report PDF Preview */}
      {showVendorReport && (
        <EmergencyVendorReportPrint
          data={emergencyPOData}
          selectedVendorIds={selectedVendorIds}
          onClose={() => {
            setShowVendorReport(false);
            setSelectedVendorIds([]);
          }}
          vendorOptions={vendorOptions}
        />
      )}

      {/* Main Report Header with Controls */}
      <div className="border-gray-200 p-6 shadow-sm">
        {/* Vendor Selection and Print Controls */}

        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          {/* Vendor Dropdown with decreased width */}
          <div className="w-full md:w-2/3 lg:w-3/5">
            <Select
              isMulti
              options={vendorOptions}
              value={vendorOptions.filter((o) =>
                selectedVendorIds.includes(o.value),
              )}
              onChange={handleVendorSelectionChange}
              placeholder="Select vendors to include in report..."
              className="text-sm"
              styles={{
                control: (base) => ({
                  ...base,
                  background: 'white',
                  borderRadius: '8px',
                  borderColor: '#cbd5e0',
                  minHeight: '42px',
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

          {/* Generate Vendor Report PDF Button */}
          <div className="mt-4 flex items-center gap-1 md:mt-0">
            <button
              onClick={handlePrintVendorDetails}
              className="flex items-center gap-2 whitespace-nowrap rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700"
              title="Generate Vendor Report PDF"
            >
              <FiPrinter className="h-4 w-4" />
              Vendor PDF
              <span className="ml-2 rounded-full bg-white/30 px-2 py-1 text-xs">
                {selectedVendorIds.length === 0
                  ? getAllVendorsForSelection.length
                  : selectedVendorIds.length}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorwiseEmergency;
