/* eslint-disable */
import React, {useState, useMemo, useEffect} from 'react';
import {useNavigate} from '@tanstack/react-router';
import Select from 'react-select';
import {FiChevronDown, FiPlus, FiPrinter, FiUsers} from 'react-icons/fi';
import {RiFileHistoryFill} from 'react-icons/ri';
import {useGetHistoryeventPoById} from '@/lib/react-query/queriesAndMutations/cateror/PO/pomodule';
import {useAuthContext} from '@/context/AuthContext';

interface PurchaseOrderHistory {
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

interface VendorReportPrintProps {
  data: PurchaseOrderHistory | PurchaseOrderHistory[] | null;
  selectedVendorIds: string[];
  onClose: () => void;
  vendorOptions?: {value: string; label: string}[];
  user?: {
    fullname?: string;
    address?: string;
    email?: string;
    phoneNumber?: string;
  };
}

const VendorReportPrint: React.FC<VendorReportPrintProps> = ({
  data,
  selectedVendorIds,
  onClose,
  vendorOptions,
  user,
}) => {
  if (!data) return null;

  const formatDisplayDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const formatDisplayTime = (timeString: string) => {
    try {
      const date = new Date(`${timeString}`);
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return 'Invalid Time';
    }
  };

  const getVendorWiseData = useMemo(() => {
    const purchaseData = Array.isArray(data) ? data : [data];
    const vendorMap = new Map<string, any>();

    purchaseData.forEach((po) => {
      po.PurchaseMaterial?.forEach((category) => {
        category.materials?.forEach((material) => {
          const vendorId = material.vendorId || material.vendor?.id;
          const vendorName =
            material.vendorName || material.vendor?.name || 'Unknown Vendor';
          const vendorPhone = material.vendor?.phone || 'N/A';
          const vendorAddress = material.vendor?.address || 'N/A';
          const vendorEmail = material.vendor?.email || 'N/A';

          if (!vendorId) return;
          if (
            selectedVendorIds.length > 0 &&
            !selectedVendorIds.includes(vendorId)
          )
            return;

          if (!vendorMap.has(vendorId)) {
            vendorMap.set(vendorId, {
              vendorId,
              vendorName,
              vendorPhone,
              vendorAddress,
              vendorEmail,
              materials: [],
              categories: new Set(),
            });
          }

          const vendorData = vendorMap.get(vendorId)!;
          vendorData.materials.push({
            ...material,
            categoryName: category.name,
          });
          vendorData.categories.add(category.name);
        });
      });
    });

    return Array.from(vendorMap.values())
      .map((v) => ({...v, categories: Array.from(v.categories)}))
      .sort((a, b) =>
        a.vendorName.localeCompare(b.vendorName, 'hi', {sensitivity: 'base'}),
      );
  }, [data, selectedVendorIds]);

  const getGroupedMaterialsByVendor = (vendorMaterials: any[]) => {
    const categoryMap: Record<string, any> = {};
    const uniqueMaterials = Array.from(
      new Map(vendorMaterials.map((m: any) => [m.id, m])).values(),
    );

    uniqueMaterials.forEach((material) => {
      const catName = material.categoryName || 'Uncategorized';
      if (!categoryMap[catName]) {
        categoryMap[catName] = {
          materials: [],
          totalQuantity: 0,
          totalAmount: 0,
        };
      }
      categoryMap[catName].materials.push(material);
      categoryMap[catName].totalQuantity += material.quantity || 0;
      categoryMap[catName].totalAmount +=
        (material.quantity || 0) * (material.price || 0);
    });

    const sorted = Object.entries(categoryMap).sort(([a], [b]) =>
      a.localeCompare(b, 'hi', {sensitivity: 'base'}),
    );
    sorted.forEach(([_, cat]) => {
      cat.materials.sort((a: any, b: any) =>
        (a.name || '').localeCompare(b.name || '', 'hi', {sensitivity: 'base'}),
      );
    });

    return Object.fromEntries(sorted);
  };

  const getEventInfo = () => {
    const purchaseData = Array.isArray(data) ? data : [data];
    if (purchaseData.length === 1) {
      const po = purchaseData[0];
      return `PO #${po.listNo} | Event: ${po.event?.name || 'N/A'} | Date: ${formatDisplayDate(po.event.startDate)}`;
    }
    return `Multiple POs (${purchaseData.length}) | Mixed Events`;
  };

  const getSelectedVendorNames = () => {
    if (selectedVendorIds.length === 0) return 'All Vendors';
    if (!vendorOptions) return `${selectedVendorIds.length} Selected`;
    return selectedVendorIds
      .map((id) => vendorOptions.find((o) => o.value === id)?.label)
      .filter(Boolean)
      .join(', ');
  };

  const {totalVendors, totalMaterials, totalQuantity, totalAmount} =
    useMemo(() => {
      let v = 0,
        m = 0,
        q = 0,
        a = 0;
      getVendorWiseData.forEach((ven) => {
        v++;
        m += ven.materials.length;
        q += ven.materials.reduce(
          (s: number, mat: any) => s + (mat.quantity || 0),
          0,
        );
        a += ven.materials.reduce(
          (s: number, mat: any) => s + (mat.quantity || 0) * (mat.price || 0),
          0,
        );
      });
      return {
        totalVendors: v,
        totalMaterials: m,
        totalQuantity: q,
        totalAmount: a,
      };
    }, [getVendorWiseData]);

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
    document.body.appendChild(printIframe);

    const iframeDoc = printIframe.contentWindow?.document;
    if (!iframeDoc) {
      onClose();
      return;
    }

    let vendorContent = '';
    if (vendorData.length === 0) {
      vendorContent = `<div style="text-align:center;padding:60px;font-size:16px;color:#666;"><h3>No Materials Found</h3></div>`;
    } else {
      vendorData.forEach((vendor) => {
        const grouped = getGroupedMaterialsByVendor(vendor.materials);
        let venQty = 0,
          venAmt = 0;
        Object.values(grouped).forEach((c: any) => {
          venQty += c.totalQuantity;
          venAmt += c.totalAmount;
        });

        vendorContent += `
      <div class="vendor-block">
        <div class="vendor-header">
          <div style="background:#E3F2FD;border:1px solid #0D47A1;padding:10px 12px;border-radius:4px;margin-bottom:20px;">
            <div style="display:flex;justify-content:space-between;align-items:center;font-size:14px;">
              <div><strong style="color:#0D47A1;">Vendor:</strong> <strong style="font-size:15px;">${vendor.vendorName}</strong></div>
              <div style="font-size:12px;color:#0D47A1;">Categories: ${vendor.categories.length} | Materials: ${vendor.materials.length} | Qty: ${venQty} | Total: ₹${venAmt.toFixed(2)}</div>
            </div>
            <div style="margin-top:6px;font-size:11px;color:#333;">
              <span><strong>Phone:</strong> ${vendor.vendorPhone}</span> &nbsp;|&nbsp;
              <span><strong>Address:</strong> ${vendor.vendorAddress}</span>
              ${vendor.vendorEmail && vendor.vendorEmail !== 'N/A' ? `&nbsp;|&nbsp;<span><strong>Email:</strong> ${vendor.vendorEmail}</span>` : ''}
            </div>
          </div>
        </div>

        ${Object.entries(grouped)
          .map(([catName, cat]: [string, any]) => {
            const matGroups: Record<string, any[]> = {};
            cat.materials.forEach((m: any) => {
              const n = m.name || 'Unknown';
              if (!matGroups[n]) matGroups[n] = [];
              matGroups[n].push(m);
            });

            return `
            <div class="category-block">
              <div style="background:#E3F2FD;color:#0D47A1;border:1px solid #0D47A1;padding:8px 10px;font-weight:bold;font-size:13px;margin-bottom:8px;">
                ${catName} — Materials: ${cat.materials.length} | Qty: ${cat.totalQuantity} | Total: ₹${cat.totalAmount.toFixed(2)}
              </div>
              <table class="print-table">
                <thead>
                  <tr style="background:#1E3A8A;color:#fff;font-weight:700;">
                    <th style="padding:8px;border:1px solid #ccc;text-align:center;">Material</th>
                    <th style="padding:8px;border:1px solid #ccc;text-align:center;">Qty</th>
                    <th style="padding:8px;border:1px solid #ccc;text-align:center;">Unit</th>
                    <th style="padding:8px;border:1px solid #ccc;text-align:center;">Date</th>
                    <th style="padding:8px;border:1px solid #ccc;text-align:center;">Time</th>
                    <th style="padding:8px;border:1px solid #ccc;text-align:center;">Location</th>
                    <th style="padding:8px;border:1px solid #ccc;text-align:center;">Price</th>
                    <th style="padding:8px;border:1px solid #ccc;text-align:center;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${Object.entries(matGroups)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([name, entries]) =>
                      entries
                        .map((e: any, i: number) => {
                          const tot = (e.quantity || 0) * (e.price || 0);
                          const bg = i % 2 === 0 ? '#ffffff' : '#f8f8f8';
                          return `<tr style="background:${bg};">
                          ${i === 0 ? `<td rowspan="${entries.length}" style="padding:8px;border:1px solid #ddd;text-align:left;font-weight:700;vertical-align:middle;">${name}</td>` : ''}
                          <td style="padding:8px;border:1px solid #ddd;text-align:center;">${e.quantity || 0}</td>
                          <td style="padding:8px;border:1px solid #ddd;text-align:center;">${e.unit || '-'}</td>
                          <td style="padding:8px;border:1px solid #ddd;text-align:center;">${e.date ? formatDisplayDate(e.date) : '-'}</td>
                          <td style="padding:8px;border:1px solid #ddd;text-align:center;">${e.time ? formatDisplayTime(e.time) : '-'}</td>
                          <td style="padding:8px;border:1px solid #ddd;text-align:center;">${e.venue || '—'}</td>
                          <td style="padding:8px;border:1px solid #ddd;text-align:center;">${e.price ? '₹' + Number(e.price).toFixed(2) : '-'}</td>
                          <td style="padding:8px;border:1px solid #ddd;text-align:center;font-weight:bold;">₹${tot.toFixed(2)}</td>
                        </tr>`;
                        })
                        .join(''),
                    )
                    .join('')}
                </tbody>
              </table>
            </div>`;
          })
          .join('')}
      </div>`;
      });
    }

    const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>Vendor-wise PO Report</title>
  <style>
    @page { margin: 12mm 8mm; size: A4; }
    body { margin: 0; padding: 0; font-family: Arial, sans-serif; color: #000; -webkit-print-color-adjust: exact; print-color-adjust: exact; }

    /* CRITICAL: Entire vendor is one unbreakable block */
    .vendor-block {
      break-inside: avoid;           /* Modern browsers */
      page-break-inside: avoid;      /* Legacy support */
      margin-bottom: 30px;           /* Space AFTER each vendor */
    }

    /* Allow categories and tables to break naturally */
    .category-block {
      margin-bottom: 25px;
      /* Removed avoid rules — let long tables break across pages if needed */
    }

    .print-table {
      width: 100%;
      border-collapse: collapse;
      page-break-inside: auto;
      font-size: 12px;
    }

    .print-table tr {
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .print-table thead {
      display: table-header-group;   /* Repeat headers on new pages */
    }

    /* Spacing between vendors (except after last) */
    .vendor-block + .vendor-block {
      margin-top: 10px;
    }
  </style>
</head>
<body>
  <div style="padding:12px;">
    <!-- Your main header (unchanged) -->
    <div style="text-align:center;border:1px solid #0D47A1;padding:8px;margin-bottom:12px;background:#E3F2FD;">
      <h1 style="margin:0;font-size:24px;color:#0D47A1;font-weight:800;">${user?.fullname || 'Caterer Name'}</h1>
      <p style="margin:6px 0 0;font-weight:bold;font-size:11px;color:#000;">
        ${user?.address ? `Address - ${user.address}` : ''}${user?.email ? ` | Email - ${user.email}` : ''}${user?.phoneNumber ? ` | Mob. ${user.phoneNumber}` : ''}
      </p>
    </div>

    <div style="text-align:center;background:#0D47A1;color:white;padding:10px 6px;margin-bottom:20px;font-weight:bold;">
      <h2 style="margin:0;font-size:16px;">Vendor-wise Purchase Order Report</h2>
      <div style="font-size:11px;margin-top:4px;opacity:0.95;">${getEventInfo()}</div>
      <div style="font-size:11px;margin-top:2px;opacity:0.95;">
        ${selectedVendorIds.length > 0 ? `Selected: ${getSelectedVendorNames()}` : 'All Vendors'} | 
        Vendors: ${totalVendors} | Materials: ${totalMaterials} | Qty: ${totalQuantity} | Total: ₹${totalAmount.toFixed(2)}
      </div>
    </div>

    ${vendorContent}

    <div style="margin-top:30px;padding-top:10px;border-top:1px solid #ccc;text-align:center;font-size:10px;color:#666;">
      <p>Generated on: ${formatDisplayDate(new Date().toISOString())}</p>
    </div>
  </div>

  <script>
    setTimeout(() => { window.print(); setTimeout(() => window.close(), 600); }, 400);
  </script>
</body>
</html>`;

    iframeDoc.open();
    iframeDoc.write(fullHtml);
    iframeDoc.close();

    const timer = setTimeout(() => {
      if (document.body.contains(printIframe)) {
        document.body.removeChild(printIframe);
      }
      onClose();
    }, 5000);

    return () => {
      clearTimeout(timer);
      if (document.body.contains(printIframe)) {
        document.body.removeChild(printIframe);
      }
    };
  }, [
    vendorData,
    selectedVendorIds,
    user,
    totalVendors,
    totalMaterials,
    totalQuantity,
    totalAmount,
    onClose,
  ]);

  return null;
};

/* ================================================
   PrintLatestPO COMPONENT (with auto-unmount)
   ================================================ */

const PrintLatestPO: React.FC<{
  po: PurchaseOrderHistory;
  user?: {
    fullname?: string;
    address?: string;
    email?: string;
    phoneNumber?: string;
  };
  onClose: () => void;
}> = ({po, user, onClose}) => {
  useEffect(() => {
    const printIframe = document.createElement('iframe');
    printIframe.style.position = 'fixed';
    printIframe.style.top = '0';
    printIframe.style.left = '0';
    printIframe.style.width = '0';
    printIframe.style.height = '0';
    printIframe.style.border = 'none';
    document.body.appendChild(printIframe);

    const iframeDoc = printIframe.contentWindow?.document;
    if (!iframeDoc) {
      onClose();
      return;
    }

    const formatDisplayDate = (dateString: string) => {
      try {
        return new Date(dateString).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        });
      } catch {
        return 'Invalid Date';
      }
    };

    const formatDisplayTime = (timeString: string) => {
      try {
        const date = new Date(`${timeString}`);
        return date.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        });
      } catch {
        return 'Invalid Time';
      }
    };

    // Grouping logic same as before
    const groupedMaterials: Record<string, any[]> = {};
    po.PurchaseMaterial?.forEach((cat) => {
      const catName = cat.name || 'Uncategorized';
      if (!groupedMaterials[catName]) groupedMaterials[catName] = [];
      const matGroups: Record<string, any[]> = {};
      cat.materials?.forEach((m) => {
        const name = m.name || 'Unknown';
        if (!matGroups[name]) matGroups[name] = [];
        matGroups[name].push({
          ...m,
          vendorName: m.vendorName || m.vendor?.name || 'Unknown',
        });
      });
      Object.entries(matGroups).forEach(([name, entries]) => {
        const qty = entries.reduce((s, i) => s + (i.quantity || 0), 0);
        const amt = entries.reduce(
          (s, i) => s + (i.quantity || 0) * (i.price || 0),
          0,
        );
        groupedMaterials[catName].push({
          materialName: name,
          entries,
          totalQuantity: qty,
          totalAmount: amt,
        });
      });
    });

    const sortedCategories = Object.entries(groupedMaterials).sort(([a], [b]) =>
      a.localeCompare(b, 'hi', {sensitivity: 'base'}),
    );

    let tableContent = '';
    sortedCategories.forEach(([catName, groups]) => {
      const catTotals = groups.reduce(
        (a, g) => ({
          totalQty: a.totalQty + g.totalQuantity,
          totalAmt: a.totalAmt + g.totalAmount,
        }),
        {totalQty: 0, totalAmt: 0},
      );
      tableContent += `<tr><td colspan="9" style="background:#E3F2FD;color:#0D47A1;border:1px solid #0D47A1;padding:10px 8px;font-weight:bold;text-align:left;font-size:13px;">
        ${catName} (${groups.length} materials) - Total Qty: ${catTotals.totalQty} | Total: ₹${catTotals.totalAmt.toFixed(2)}
      </td></tr>`;
      groups.forEach((group) => {
        group.entries.forEach((item: any, idx: number) => {
          const total = (item.quantity || 0) * (item.price || 0);
          const bg = idx % 2 === 0 ? '#ffffff' : '#f8f8f8';
          tableContent += `<tr style="background:${bg};">
            ${idx === 0 ? `<td rowspan="${group.entries.length}" style="padding:8px;border:1px solid #ddd;text-align:left;font-weight:700;vertical-align:middle;">${group.materialName}</td>` : ''}
            <td style="padding:8px;border:1px solid #ddd;text-align:center;">${item.quantity || 0}</td>
            <td style="padding:8px;border:1px solid #ddd;text-align:center;">${item.unit || '-'}</td>
            <td style="padding:8px;border:1px solid #ddd;text-align:center;">${item.date ? formatDisplayDate(item.date) : '-'}</td>
            <td style="padding:8px;border:1px solid #ddd;text-align:center;">${item.time ? formatDisplayTime(item.time) : '-'}</td>
            <td style="padding:8px;border:1px solid #ddd;text-align:center;">${item.venue || 'Not specified'}</td>
            <td style="padding:8px;border:1px solid #ddd;text-align:center;">${item.vendorName || 'Unknown'}</td>
            <td style="padding:8px;border:1px solid #ddd;text-align:center;">₹${(item.price || 0).toFixed(2)}</td>
            <td style="padding:8px;border:1px solid #ddd;text-align:center;font-weight:bold;">₹${total.toFixed(2)}</td>
          </tr>`;
        });
      });
    });

    const fullHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Purchase Order #${po.listNo}</title>
<style>@page { margin: 12mm 8mm; size: A4; } body { margin:0; padding:0; font-family: Arial, sans-serif; color: #000; -webkit-print-color-adjust: exact; print-color-adjust: exact; }</style>
</head><body><div style="padding:12px;">
  <div style="text-align:center;border:1px solid #0D47A1;padding:8px;margin-bottom:12px;background:#E3F2FD;">
    <h1 style="margin:0;font-size:24px;color:#0D47A1;font-weight:800;">${user?.fullname || 'Caterer Name'}</h1>
    <p style="margin:6px 0 0;font-weight:bold;font-size:11px;color:#000;">
      ${user?.address ? `Address - ${user.address}` : ''}${user?.email ? ` | Email - ${user.email}` : ''}${user?.phoneNumber ? ` | Mob. ${user.phoneNumber}` : ''}
    </p>
  </div>
  <div style="text-align:center;background:#0D47A1;color:white;padding:10px 6px;margin-bottom:20px;font-weight:bold;">
    <h2 style="margin:0;font-size:16px;">Purchase Order #${po.listNo}</h2>
    <div style="font-size:11px;margin-top:4px;opacity:0.95;">
      Event: ${po.event.name || 'N/A'} | Start Date: ${formatDisplayDate(po.event.startDate)} | Created: ${formatDisplayDate(po.createdAt)}
    </div>
  </div>
  <table style="width:100%;border-collapse:collapse;font-size:12px;">
    <thead><tr style="background:#1E3A8A;color:#fff;font-weight:700;">
      <th style="padding:8px;border:1px solid #ccc;text-align:center;">Material</th>
      <th style="padding:8px;border:1px solid #ccc;text-align:center;">Qty</th>
      <th style="padding:8px;border:1px solid #ccc;text-align:center;">Unit</th>
      <th style="padding:8px;border:1px solid #ccc;text-align:center;">Date</th>
      <th style="padding:8px;border:1px solid #ccc;text-align:center;">Time</th>
      <th style="padding:8px;border:1px solid #ccc;text-align:center;">Location</th>
      <th style="padding:8px;border:1px solid #ccc;text-align:center;">Vendor</th>
      <th style="padding:8px;border:1px solid #ccc;text-align:center;">Unit Price</th>
      <th style="padding:8px;border:1px solid #ccc;text-align:center;">Total</th>
    </tr></thead>
    <tbody>${tableContent}</tbody>
  </table>
</div>
<script>setTimeout(() => { window.print(); setTimeout(() => window.close(), 600); }, 400);</script>
</body></html>`;

    iframeDoc.open();
    iframeDoc.write(fullHtml);
    iframeDoc.close();

    const timer = setTimeout(() => {
      if (document.body.contains(printIframe))
        document.body.removeChild(printIframe);
      onClose();
    }, 4000);

    return () => {
      clearTimeout(timer);
      if (document.body.contains(printIframe))
        document.body.removeChild(printIframe);
    };
  }, [po, user, onClose]);

  return null;
};

/* ================================================
   MAIN POHeaderButtons COMPONENT
   ================================================ */

const ExternalPoHeaderButtons: React.FC<{
  setShowHistoryModal: (show: boolean) => void;
  id: string;
}> = ({setShowHistoryModal, id}) => {
  const {user} = useAuthContext();
  const navigate = useNavigate();

  const {data: eventPoData, isLoading} = useGetHistoryeventPoById(id);

  const [selectedVendorIds, setSelectedVendorIds] = useState<string[]>([]);
  const [isVendorSelectOpen, setIsVendorSelectOpen] = useState(false);

  // Unique triggers for fresh mounting
  const [vendorPrintKey, setVendorPrintKey] = useState<number | null>(null);
  const [poPrintKey, setPoPrintKey] = useState<number | null>(null);

  const poHistory: PurchaseOrderHistory[] = useMemo(() => {
    if (!eventPoData) return [];
    if (eventPoData.formatted && Array.isArray(eventPoData.formatted))
      return eventPoData.formatted;
    if (Array.isArray(eventPoData)) return eventPoData;
    return [];
  }, [eventPoData]);

  const latestPO =
    poHistory.length > 0
      ? [...poHistory].sort((a, b) => b.listNo - a.listNo)[0]
      : null;

  const vendorOptions = useMemo(() => {
    const map = new Map<string, string>();
    poHistory.forEach((po) => {
      po.PurchaseMaterial?.forEach((cat) => {
        cat.materials?.forEach((mat) => {
          const vid = mat.vendorId || mat.vendor?.id;
          const name = mat.vendorName || mat.vendor?.name || 'Unknown Vendor';
          if (vid) map.set(vid, name);
        });
      });
    });
    return Array.from(map.entries())
      .map(([value, label]) => ({value, label}))
      .sort((a, b) =>
        a.label.localeCompare(b.label, 'hi', {sensitivity: 'base'}),
      );
  }, [poHistory]);

  const handleVendorChange = (options: any) => {
    setSelectedVendorIds(options ? options.map((o: any) => o.value) : []);
  };

  return (
    <>
      {/* Hidden print components */}
      {vendorPrintKey !== null && poHistory.length > 0 && (
        <VendorReportPrint
          key={vendorPrintKey}
          data={poHistory}
          selectedVendorIds={
            selectedVendorIds.length > 0
              ? selectedVendorIds
              : vendorOptions.map((o) => o.value)
          }
          onClose={() => setVendorPrintKey(null)}
          vendorOptions={vendorOptions}
          user={user}
        />
      )}

      {poPrintKey !== null && latestPO && (
        <PrintLatestPO
          key={poPrintKey}
          po={latestPO}
          user={user}
          onClose={() => setPoPrintKey(null)}
        />
      )}

      <div className="flex w-full flex-col gap-3 sm:w-auto">
        {/* Vendor Select and Action Buttons */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Vendor Select - Full width on mobile */}
          <div className="w-full sm:min-w-[180px]">
            <div className="sm:hidden">
              {/* Mobile select trigger */}
              <button
                onClick={() => setIsVendorSelectOpen(!isVendorSelectOpen)}
                className="border-gray-300 text-gray-700 hover:bg-gray-50 flex w-full items-center justify-between rounded-md border bg-white px-3 py-2 text-sm transition-colors dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700/50"
              >
                <span className="text-gray-700 dark:text-gray-300">
                  {selectedVendorIds.length === 0
                    ? 'Select vendors...'
                    : `${selectedVendorIds.length} vendor(s) selected`}
                </span>
                <FiChevronDown
                  className={`text-gray-500 dark:text-gray-400 h-4 w-4 transition-transform ${
                    isVendorSelectOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Mobile dropdown */}
              {isVendorSelectOpen && (
                <div className="border-gray-200 mt-2 max-h-48 overflow-y-auto rounded-md border bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800">
                  {vendorOptions.map((option) => (
                    <label
                      key={option.value}
                      className="border-gray-100 hover:bg-gray-50 flex items-center gap-2 border-b px-3 py-2 transition-colors last:border-b-0 dark:border-slate-700 dark:hover:bg-slate-700/50"
                    >
                      <input
                        type="checkbox"
                        checked={selectedVendorIds.includes(option.value)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedVendorIds([
                              ...selectedVendorIds,
                              option.value,
                            ]);
                          } else {
                            setSelectedVendorIds(
                              selectedVendorIds.filter(
                                (id) => id !== option.value,
                              ),
                            );
                          }
                        }}
                        className="border-gray-300 dark:border-gray-600 dark:bg-gray-700 h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-gray-700 dark:text-gray-300 text-sm">
                        {option.label}
                      </span>
                    </label>
                  ))}
                  <div className="border-gray-200 border-t p-2 dark:border-slate-700">
                    <button
                      onClick={() =>
                        setSelectedVendorIds(vendorOptions.map((o) => o.value))
                      }
                      className="w-full rounded bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
                    >
                      Select All
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Desktop select */}
            <div className="hidden sm:block">
              <Select
                isMulti
                isLoading={isLoading}
                options={vendorOptions}
                value={vendorOptions.filter((o) =>
                  selectedVendorIds.includes(o.value),
                )}
                onChange={handleVendorChange}
                placeholder="Select vendors..."
                className="text-xs"
                menuPortalTarget={document.body}
                classNames={{
                  control: (state) =>
                    `border border-gray-300 bg-white text-black placeholder:text-gray-500
           dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-gray-400
           rounded-md px-3 py-1 min-h-[38px] text-xs
           ${state.isFocused ? 'border-blue-500 ring-1 ring-blue-500 dark:border-blue-500' : ''}
           ${state.isDisabled ? 'bg-gray-100 dark:bg-slate-900 opacity-60' : ''}`,
                  menu: () =>
                    `bg-white text-black border border-gray-300 shadow-md rounded-md mt-1
           dark:bg-slate-800 dark:text-white dark:border-slate-700`,
                  option: (state) =>
                    `px-3 py-2 cursor-pointer text-xs
           ${state.isFocused ? 'bg-gray-200 dark:bg-slate-700' : ''}
           ${state.isSelected ? 'bg-gray-300 dark:bg-slate-900 text-black dark:text-white' : ''}`,
                  multiValue: () =>
                    `bg-gray-200 text-black dark:bg-slate-700 dark:text-white rounded-md px-2 py-1 mx-1 my-0.5 flex items-center gap-1`,
                  multiValueLabel: () => `text-black dark:text-white text-xs`,
                  multiValueRemove: () =>
                    `text-black dark:text-white hover:bg-red-400 hover:text-white dark:hover:bg-red-600 rounded-md px-1`,
                  placeholder: () => `text-gray-500 dark:text-gray-400 text-xs`,
                  input: () => `text-black dark:text-white text-xs`,
                  singleValue: () => `text-black dark:text-white text-xs`,
                  dropdownIndicator: () =>
                    `text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300`,
                  clearIndicator: () =>
                    `text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300`,
                  indicatorSeparator: () =>
                    `bg-gray-300 dark:bg-slate-700 mx-1`,
                  valueContainer: () => `flex flex-wrap gap-1 px-2 py-1`,
                }}
                styles={{
                  menuPortal: (base) => ({...base, zIndex: 9999}),
                }}
                menuShouldScrollIntoView={false}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {/* Vendors Button */}
            <button
              onClick={() => setVendorPrintKey(Date.now())}
              disabled={isLoading || poHistory.length === 0}
              className="group flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition-all duration-200 hover:bg-green-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-400 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-initial"
            >
              <FiUsers className="h-4 w-4 transition-transform group-hover:scale-110" />
              <span className="hidden sm:inline">Vendors</span>
              <span className="ml-1 rounded-full bg-white/20 px-1.5 py-0.5 text-[10px] font-bold">
                {selectedVendorIds.length === 0
                  ? vendorOptions.length
                  : selectedVendorIds.length}
              </span>
            </button>

            {/* Print PO Button */}
            <button
              onClick={() => setPoPrintKey(Date.now())}
              disabled={isLoading || !latestPO}
              className="group flex flex-1 items-center justify-center gap-2 rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs font-semibold text-blue-700 shadow-sm transition-all duration-200 hover:bg-blue-50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-initial"
            >
              <FiPrinter className="h-4 w-4 transition-transform group-hover:rotate-6" />
              <span className="hidden sm:inline">Print PO</span>
            </button>

            {/* Emergency PO */}
            <button
              type="button"
              onClick={() => navigate({to: `/custompoevent/${id}`})}
              className="group flex flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-3 py-2 text-xs font-semibold text-white shadow-md transition-all duration-200 hover:from-blue-700 hover:to-blue-800 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 active:scale-95 sm:flex-initial"
            >
              <FiPlus className="h-4 w-4 transition-transform group-hover:rotate-90" />
              <span className="hidden sm:inline">Emergency PO</span>
              <span className="sm:hidden">Emergency</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ExternalPoHeaderButtons;
