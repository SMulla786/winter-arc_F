/*eslint-disable*/
import React, {useState, useMemo, useEffect} from 'react';
import Select from 'react-select';
import {FiPlus, FiPrinter} from 'react-icons/fi';
import {Route} from '@/routes/_app/_event/events.$id';
import {useGetHistoryeventPoById} from '@/lib/react-query/queriesAndMutations/cateror/PO/pomodule';
import {useAuthContext} from '@/context/AuthContext';
import {useNavigate} from '@tanstack/react-router';

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

const VendorReportPrint: React.FC<{
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
}> = ({data, selectedVendorIds, onClose, vendorOptions, user}) => {
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
          vendorData.materials.push({...material, categoryName: category.name});
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
    .vendor-block { break-inside: avoid; page-break-inside: avoid; margin-bottom: 30px; }
    .category-block { margin-bottom: 25px; }
    .print-table { width: 100%; border-collapse: collapse; page-break-inside: auto; font-size: 12px; }
    .print-table tr { page-break-inside: avoid; break-inside: avoid; }
    .print-table thead { display: table-header-group;  }

    /* Spacing between vendors (except after last) */
    .vendor-block + .vendor-block {
      margin-top: 10px;}
  </style>
</head>
<body>
  <div style="padding:12px;">
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

    const cleanupTimer = setTimeout(() => {
      if (document.body.contains(printIframe)) {
        document.body.removeChild(printIframe);
      }
      onClose();
    }, 6000);

    return () => {
      clearTimeout(cleanupTimer);
      if (document.body.contains(printIframe)) {
        document.body.removeChild(printIframe);
      }
    };
  }, []); // Runs only once on mount

  return null;
};

/* ================================================
   PrintLatestPO – Safe print on mount only
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

    const cleanupTimer = setTimeout(() => {
      if (document.body.contains(printIframe))
        document.body.removeChild(printIframe);
      onClose();
    }, 5000);

    return () => {
      clearTimeout(cleanupTimer);
      if (document.body.contains(printIframe))
        document.body.removeChild(printIframe);
    };
  }, []);

  return null;
};

/* ================================================
   MAIN POHeaderButtons – ONLY manual print on button click
   ================================================ */
const POHeaderButtons: React.FC<{
  setShowHistoryModal: (show: boolean) => void;
}> = ({setShowHistoryModal}) => {
  const {user} = useAuthContext();
  const {id} = Route.useParams();
  const navigate = useNavigate();

  const {data: eventPoData, isLoading} = useGetHistoryeventPoById(id);

  const [selectedVendorIds, setSelectedVendorIds] = useState<string[]>([]);

  // Triggers for mounting print components (only on button click)
  const [triggerVendorPrint, setTriggerVendorPrint] = useState<number | null>(
    null,
  );
  const [triggerLatestPrint, setTriggerLatestPrint] = useState<number | null>(
    null,
  );

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

  const handlePrintClick = () => {
    if (selectedVendorIds.length > 0) {
      setTriggerVendorPrint(Date.now());
    } else if (latestPO) {
      setTriggerLatestPrint(Date.now());
    }
  };

  return (
    <>
      {/* Hidden print components – only when button clicked */}
      {triggerVendorPrint !== null && poHistory.length > 0 && (
        <VendorReportPrint
          key={triggerVendorPrint}
          data={poHistory}
          selectedVendorIds={
            selectedVendorIds.length > 0
              ? selectedVendorIds
              : vendorOptions.map((o) => o.value)
          }
          onClose={() => setTriggerVendorPrint(null)}
          vendorOptions={vendorOptions}
          user={user}
        />
      )}

      {triggerLatestPrint !== null && latestPO && (
        <PrintLatestPO
          key={triggerLatestPrint}
          po={latestPO}
          user={user}
          onClose={() => setTriggerLatestPrint(null)}
        />
      )}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Vendor Selector – just for filtering */}
          <div className="min-w-[180px]">
            <Select
              isMulti
              isLoading={isLoading}
              options={vendorOptions}
              value={vendorOptions.filter((o) =>
                selectedVendorIds.includes(o.value),
              )}
              onChange={(options) =>
                setSelectedVendorIds(
                  options ? options.map((o: any) => o.value) : [],
                )
              }
              placeholder="Select vendors (optional)"
              className="text-xs"
              menuPortalTarget={document.body}
              classNames={{
                control: (state) =>
                  `border border-gray-300 bg-white text-black placeholder:text-gray-500
         dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-gray-400
         rounded-md px-3 py-1 min-h-[32px] text-xs
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
                  `bg-gray-200 text-black dark:bg-slate-700 dark:text-white rounded-md px-2 py-0.5 mx-0.5 my-0.5 flex items-center gap-0.5`,
                multiValueLabel: () => `text-black dark:text-white text-xs`,
                multiValueRemove: () =>
                  `text-gray-500 dark:text-gray-400 hover:bg-red-400 hover:text-white dark:hover:bg-red-600 rounded-sm px-1`,
                placeholder: () => `text-gray-500 dark:text-gray-400 text-xs`,
                input: () => `text-black dark:text-white text-xs`,
                singleValue: () => `text-black dark:text-white text-xs`,
                dropdownIndicator: () =>
                  `text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300`,
                clearIndicator: () =>
                  `text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300`,
                indicatorSeparator: () => `bg-gray-300 dark:bg-slate-700 mx-1`,
                valueContainer: () => `flex flex-wrap gap-0.5 px-2 py-0.5`,
              }}
              styles={{
                menuPortal: (base) => ({...base, zIndex: 9999}),
              }}
              menuShouldScrollIntoView={false}
            />
          </div>

          {/* Only ONE Print Button */}
          <button
            onClick={handlePrintClick}
            disabled={isLoading || poHistory.length === 0}
            className="flex items-center gap-2 rounded bg-blue-100 px-3 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-200"
          >
            Print PO
            {selectedVendorIds.length > 0 && (
              <span className="ml-2 rounded-full bg-white/20 px-2 py-0.5 text-xs font-bold">
                {selectedVendorIds.length}
                {selectedVendorIds.length > 1 ? 's' : ''}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => navigate({to: `/custompoevent/${id}`})}
            className="group flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-3 py-2 text-xs font-semibold text-white shadow-md transition-all duration-200 hover:from-blue-700 hover:to-blue-800 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 active:scale-95"
          >
            <FiPlus className="h-4 w-4 transition-transform group-hover:rotate-90" />
            Emergency PO
          </button>
        </div>
      </div>
    </>
  );
};

export default POHeaderButtons;
