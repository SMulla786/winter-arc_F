/* eslint-disable */
import {useGetAccountAnylysis} from '@/lib/react-query/accountanalysis';
import React, {useRef} from 'react';
import {Route} from '@/routes/_app/_event/events.$id';
import GenericTable, {Column} from '../Forms/Table/GenericTable';
import {
  FiAward,
  FiTrendingUp,
  FiTrendingDown,
  FiFileText,
  FiPrinter,
  FiActivity,
  FiPackage,
  FiTruck,
} from 'react-icons/fi';
import {MdTrendingUp, MdTrendingDown} from 'react-icons/md';
import {FaGasPump} from 'react-icons/fa';
import {useAuthContext} from '@/context/AuthContext';
import toast from 'react-hot-toast';

// ---------- Updated API response type ----------
interface ApiResponse {
  totalAmount: number; // Bill Amount (After Event revenue)
  quatationAmount: number; // Quotation Amount (Pre Event revenue)
  manpower: {
    preEvent: {
      kitchenManpower: number;
      serviceManpower: number;
      vendorCost: number;
      total: number;
    };
    afterEvent: {
      kitchenManpower: number;
      serviceManpower: number;
      vendorCost: number;
      total: number;
    };
  };
  transport: {
    preEvent: {inhouse: number; outsource: number; total: number};
    afterEvent: {inhouse: number; outsource: number; total: number};
  };
  fuelCost: {
    preEvent: {total: number};
    afterEvent: {total: number};
  };
  materialCost: {
    afterEvent: {
      storeAmount: number;
      vendorCost: number;
      disposalCost: number;
      total: number;
    };
    preEvent: {
      storeAmount: number;
      vendorCost: number;
      disposalCost: number;
      total: number;
    };
  };
  subeventCount: number;
}

// ---------- FLAT row structure (safe for GenericTable) ----------
interface CostComparisonRow {
  category: string;
  afterAmount: string;
  afterPercent: string;
  afterPercentValue: number; // % of Bill Amount
  preAmount: string;
  prePercent: string;
  prePercentValue: number; // % of Quotation Amount
  proposedAmount: string;
  proposedPercent: string;
  proposedPercentValue: number; // fixed target %
  variance: string;
  isFavorable: boolean;
  isDash?: boolean;
}

// ---------- CONSTANTS (target % of Bill Amount) ----------
const PROPOSED_PERCENTS = {
  'MATERIAL COST': 28,
  'FUEL COST': 3,
  'TRANSPORT COST': 3,
  'LABOUR COST': 15,
  'OVERHEAD COST': 1,
  'TOTAL COST': 50,
};

// ---------- UTILITIES ----------
const formatCurrency = (amount: number): string => {
  if (amount < 0) {
    return `₹${Math.abs(amount).toLocaleString('en-IN', {maximumFractionDigits: 0})}`;
  }
  return `₹${amount.toLocaleString('en-IN', {maximumFractionDigits: 0})}`;
};

const formatPercent = (value: number): string => {
  return `${value.toFixed(2)}%`;
};

// ---------- MAIN COMPONENT ----------
const CostAnalysisDashboard: React.FC = () => {
  const {id: EventId} = Route.useParams<{id: string}>();
  const getdata = useGetAccountAnylysis(EventId);
  const apiResponse = getdata?.data as any;
  const apiData: ApiResponse | undefined = apiResponse?.data;
  const {user} = useAuthContext();

  // ----- Two revenue bases -----
  const billAmount = apiData?.totalAmount ?? 0; // After Event revenue
  const quotationAmount = apiData?.quatationAmount ?? 0; // Pre Event revenue

  // ----- Extract API values -----
  const materialAfter = apiData?.materialCost?.afterEvent?.total ?? 0;
  const materialPre = apiData?.materialCost?.preEvent?.total ?? 0;

  const fuelAfter = apiData?.fuelCost?.afterEvent?.total ?? 0;
  const fuelPre = apiData?.fuelCost?.preEvent?.total ?? 0;

  const transportAfter = apiData?.transport?.afterEvent?.total ?? 0;
  const transportPre = apiData?.transport?.preEvent?.total ?? 0;

  const labourAfter = apiData?.manpower?.afterEvent?.total ?? 0;
  const labourPre = apiData?.manpower?.preEvent?.total ?? 0;

  const overheadAfter = 0; // not in API yet
  const overheadPre = 0;

  // ----- Totals -----
  const totalAfter =
    materialAfter + fuelAfter + transportAfter + labourAfter + overheadAfter;
  const totalPre =
    materialPre + fuelPre + transportPre + labourPre + overheadPre;

  // ----- Proposed amounts (always % of Bill Amount) -----
  const materialProposed =
    quotationAmount * (PROPOSED_PERCENTS['MATERIAL COST'] / 100);
  const fuelProposed = quotationAmount * (PROPOSED_PERCENTS['FUEL COST'] / 100);
  const transportProposed =
    quotationAmount * (PROPOSED_PERCENTS['TRANSPORT COST'] / 100);
  const labourProposed =
    quotationAmount * (PROPOSED_PERCENTS['LABOUR COST'] / 100);
  const overheadProposed =
    quotationAmount * (PROPOSED_PERCENTS['OVERHEAD COST'] / 100);
  const totalProposed =
    quotationAmount * (PROPOSED_PERCENTS['TOTAL COST'] / 100);
  const gopproposed = quotationAmount * (50 / 100);

  // ----- Percentages (different bases) -----
  const percentOfBill = (amt: number) =>
    billAmount ? (amt / billAmount) * 100 : 0;
  const percentOfQuotation = (amt: number) =>
    quotationAmount ? (amt / quotationAmount) * 100 : 0;

  // ----- Favorability (after <= proposed) -----
  const isFavorable = (after: number, proposed: number) => after <= proposed;

  // ----- Build FLAT rows for GenericTable -----
  const tableRows: CostComparisonRow[] = [
    // MATERIAL COST
    {
      category: 'MATERIAL COST',
      afterAmount: formatCurrency(materialAfter),
      afterPercent: formatPercent(percentOfBill(materialAfter)),
      afterPercentValue: percentOfBill(materialAfter),
      preAmount: formatCurrency(materialPre),
      prePercent: formatPercent(percentOfQuotation(materialPre)),
      prePercentValue: percentOfQuotation(materialPre),
      proposedAmount: formatCurrency(materialProposed),
      proposedPercent: formatPercent(PROPOSED_PERCENTS['MATERIAL COST']),
      proposedPercentValue: PROPOSED_PERCENTS['MATERIAL COST'],
      variance: formatCurrency(materialAfter - materialProposed),
      isFavorable: isFavorable(materialAfter, materialProposed),
    },
    // FUEL COST
    {
      category: 'FUEL COST',
      afterAmount: formatCurrency(fuelAfter),
      afterPercent: formatPercent(percentOfBill(fuelAfter)),
      afterPercentValue: percentOfBill(fuelAfter),
      preAmount: formatCurrency(fuelPre),
      prePercent: formatPercent(percentOfQuotation(fuelPre)),
      prePercentValue: percentOfQuotation(fuelPre),
      proposedAmount: formatCurrency(fuelProposed),
      proposedPercent: formatPercent(PROPOSED_PERCENTS['FUEL COST']),
      proposedPercentValue: PROPOSED_PERCENTS['FUEL COST'],
      variance: formatCurrency(fuelAfter - fuelProposed),
      isFavorable: isFavorable(fuelAfter, fuelProposed),
    },
    // TRANSPORT COST
    {
      category: 'TRANSPORT COST',
      afterAmount: formatCurrency(transportAfter),
      afterPercent: formatPercent(percentOfBill(transportAfter)),
      afterPercentValue: percentOfBill(transportAfter),
      preAmount: formatCurrency(transportPre),
      prePercent: formatPercent(percentOfQuotation(transportPre)),
      prePercentValue: percentOfQuotation(transportPre),
      proposedAmount: formatCurrency(transportProposed),
      proposedPercent: formatPercent(PROPOSED_PERCENTS['TRANSPORT COST']),
      proposedPercentValue: PROPOSED_PERCENTS['TRANSPORT COST'],
      variance: formatCurrency(transportAfter - transportProposed),
      isFavorable: isFavorable(transportAfter, transportProposed),
    },
    // LABOUR COST
    {
      category: 'LABOUR COST',
      afterAmount: formatCurrency(labourAfter),
      afterPercent: formatPercent(percentOfBill(labourAfter)),
      afterPercentValue: percentOfBill(labourAfter),
      preAmount: formatCurrency(labourPre),
      prePercent: formatPercent(percentOfQuotation(labourPre)),
      prePercentValue: percentOfQuotation(labourPre),
      proposedAmount: formatCurrency(labourProposed),
      proposedPercent: formatPercent(PROPOSED_PERCENTS['LABOUR COST']),
      proposedPercentValue: PROPOSED_PERCENTS['LABOUR COST'],
      variance: formatCurrency(labourAfter - labourProposed),
      isFavorable: isFavorable(labourAfter, labourProposed),
    },
    // OVERHEAD COST
    {
      category: 'OVERHEAD COST',
      afterAmount: formatCurrency(overheadAfter),
      afterPercent: formatPercent(percentOfBill(overheadAfter)),
      afterPercentValue: percentOfBill(overheadAfter),
      preAmount: formatCurrency(overheadPre),
      prePercent: formatPercent(percentOfQuotation(overheadPre)),
      prePercentValue: percentOfQuotation(overheadPre),
      proposedAmount: formatCurrency(overheadProposed),
      proposedPercent: formatPercent(PROPOSED_PERCENTS['OVERHEAD COST']),
      proposedPercentValue: PROPOSED_PERCENTS['OVERHEAD COST'],
      variance: formatCurrency(overheadAfter - overheadProposed),
      isFavorable: isFavorable(overheadAfter, overheadProposed),
    },
    // TOTAL COST
    {
      category: 'TOTAL COST',
      afterAmount: formatCurrency(totalAfter),
      afterPercent: formatPercent(percentOfBill(totalAfter)),
      afterPercentValue: percentOfBill(totalAfter),
      preAmount: formatCurrency(totalPre),
      prePercent: formatPercent(percentOfQuotation(totalPre)),
      prePercentValue: percentOfQuotation(totalPre),
      proposedAmount: formatCurrency(totalProposed),
      proposedPercent: formatPercent(PROPOSED_PERCENTS['TOTAL COST']),
      proposedPercentValue: PROPOSED_PERCENTS['TOTAL COST'],
      variance: formatCurrency(totalAfter - totalProposed),
      isFavorable: isFavorable(totalAfter, totalProposed),
    },
    // GOP (special row)
    {
      category: 'GOP',
      afterAmount: formatCurrency(
        (billAmount * (100 - percentOfBill(totalAfter))) / 100,
      ),
      afterPercent: formatPercent(100 - percentOfBill(totalAfter)),
      afterPercentValue: 100 - percentOfBill(totalAfter),
      preAmount: formatCurrency(
        (quotationAmount * (100 - percentOfQuotation(totalPre))) / 100,
      ),
      prePercent: formatPercent(100 - percentOfQuotation(totalPre)),
      prePercentValue: 100 - percentOfQuotation(totalPre),
      proposedAmount: formatCurrency(gopproposed),
      proposedPercent: formatPercent(100 - PROPOSED_PERCENTS['TOTAL COST']),
      proposedPercentValue: gopproposed,
      variance: formatCurrency(
        gopproposed -
          (quotationAmount * (100 - percentOfQuotation(totalPre))) / 100,
      ),
      isFavorable: true,
      isDash: true,
    },
  ];

  // ---------- SUMMARY TOTALS (for cards) ----------
  const totals = {
    billAmount: formatCurrency(billAmount),
    quotationAmount: formatCurrency(quotationAmount),
    afterEventTotal: formatCurrency(totalAfter),
    preEventTotal: formatCurrency(totalPre),
    proposedTotal: formatCurrency(totalProposed),
    savings: formatCurrency(
      (billAmount * (100 - percentOfBill(totalAfter))) / 100,
    ),
    afterEventPercentage: formatPercent(percentOfBill(totalAfter)),
    preEventPercentage: formatPercent(percentOfQuotation(totalPre)),
    proposedPercentage: formatPercent(PROPOSED_PERCENTS['TOTAL COST']),
  };

  // ---------- INSIGHTS (highest / lowest / best) ----------
  const categories = tableRows.slice(0, -2); // exclude TOTAL COST and GOP
  const highest = categories.reduce((max, row) => {
    const amount = parseFloat(row.afterAmount.replace(/[₹,()]/g, '')) || 0;
    const maxAmount = parseFloat(max.afterAmount.replace(/[₹,()]/g, '')) || 0;
    return amount > maxAmount ? row : max;
  }, categories[0]);

  const lowest = categories.reduce((min, row) => {
    const amount = parseFloat(row.afterAmount.replace(/[₹,()]/g, '')) || 0;
    const minAmount = parseFloat(min.afterAmount.replace(/[₹,()]/g, '')) || 0;
    return amount < minAmount ? row : min;
  }, categories[0]);

  const best = categories.reduce((best, row) => {
    const variance = parseFloat(row.variance.replace(/[₹,()]/g, '')) || 0;
    const bestVariance = parseFloat(best.variance.replace(/[₹,()]/g, '')) || 0;
    return variance < bestVariance ? row : best;
  }, categories[0]);

  // ---------- PRINT FUNCTIONALITY ----------
  const handlePrint = () => {
    if (!apiData) {
      toast.error('No data available to print');
      return;
    }

    const printedDate = new Date();
    const printedDateStr = printedDate.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
    const printedTimeStr = printedDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    // Build HTML content for printing
    let htmlContent = `
      <div style="border:1px solid #0D47A1; padding:10px; margin-bottom:12px; background:#E3F2FD; font-family: Arial, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td width="10%" align="left" valign="middle">
              ${
                user?.image
                  ? `<img 
                      src="${user.image}" 
                      alt="Caterer Logo"
                      style="max-height:60px; max-width:150px; object-fit:contain;"
                    />`
                  : ''
              }
            </td>
            <td width="90%" align="center">
              <h1 style="margin:0; font-size:24px; color:#0D47A1; font-weight:800;">
                ${user?.fullname || 'Caterer Name'}
              </h1>
              <p style="margin:6px 0 0; font-weight:bold; font-size:11px; color:#000;">
                ${user?.address ? `Address - ${user.address}` : ''} ${
                  user?.email ? ` | Email - ${user.email}` : ''
                } | Mob.${user?.phoneNumber || ''}
              </p>
            </td>
          </tr>
        </table>
      </div>

      <!-- TITLE BAR -->
      <div style="text-align:center; background:#0D47A1; color:white; padding:10px 6px; margin-bottom:12px; font-weight:bold; font-family: Arial, sans-serif;">
        <h2 style="margin:0; font-size:16px;">Event Cost Analysis Dashboard</h2>
        <div style="font-size:11px; margin-top:4px; opacity:0.95;">
         
          Date: ${printedDateStr} ${printedTimeStr}
        </div>
      </div>

      <!-- SUMMARY CARDS SECTION -->
      <div style="margin-bottom: 20px;">
        <table style="width:100%; border-collapse: collapse; font-family: Arial, sans-serif;">
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; background: #f9f9f9;">
              <div style="font-size: 11px; color: #666;">Total Bill Amount</div>
              <div style="font-size: 18px; font-weight: bold;">${totals.billAmount}</div>
              <div style="font-size: 10px; color: #999;">After Event Revenue</div>
            </td>
            <td style="padding: 8px; border: 1px solid #ddd; background: #f9f9f9;">
              <div style="font-size: 11px; color: #666;">Total Quotation Amount</div>
              <div style="font-size: 18px; font-weight: bold;">${totals.quotationAmount}</div>
              <div style="font-size: 10px; color: #999;">Pre Event Revenue</div>
            </td>
            <td style="padding: 8px; border: 1px solid #ddd; background: #f9f9f9;">
              <div style="font-size: 11px; color: #666;">After Event Total</div>
              <div style="font-size: 18px; font-weight: bold;">${totals.afterEventTotal}</div>
              <div style="font-size: 10px; color: #999;">${totals.afterEventPercentage} of Bill</div>
            </td>
            <td style="padding: 8px; border: 1px solid #ddd; background: #f9f9f9;">
              <div style="font-size: 11px; color: #666;">Pre Event Total</div>
              <div style="font-size: 18px; font-weight: bold;">${totals.preEventTotal}</div>
              <div style="font-size: 10px; color: #999;">${totals.preEventPercentage} of Quotation</div>
            </td>
            <td style="padding: 8px; border: 1px solid #ddd; background: #f9f9f9;">
              <div style="font-size: 11px; color: #666;">Proposed Target</div>
              <div style="font-size: 18px; font-weight: bold;">${totals.proposedTotal}</div>
              <div style="font-size: 10px; color: #999;">${totals.proposedPercentage} of Bill</div>
            </td>
            <td style="padding: 8px; border: 1px solid #ddd; background: #21808d; color: white;">
              <div style="font-size: 11px;">Savings Achieved</div>
              <div style="font-size: 18px; font-weight: bold;">${totals.savings}</div>
              <div style="font-size: 10px;">From Pre Event</div>
            </td>
          </tr>
        </table>
      </div>

      <!-- KEY INSIGHTS -->
      <div style="margin-bottom: 20px;">
        <table style="width:100%; border-collapse: collapse; font-family: Arial, sans-serif;">
          <tr>
            <td style="padding: 12px; border: 1px solid #ddd; text-align: center;">
             
              <div style="font-size: 12px; font-weight: bold;">Highest Cost Category</div>
              <div style="font-size: 16px; font-weight: bold; margin-top: 8px;">${highest?.category}</div>
              <div style="font-size: 11px; color: #666;">${highest?.afterAmount} (${highest?.afterPercent} of Bill)</div>
            </td>
            <td style="padding: 12px; border: 1px solid #ddd; text-align: center;">
             
              <div style="font-size: 12px; font-weight: bold;">Lowest Cost Category</div>
              <div style="font-size: 16px; font-weight: bold; margin-top: 8px;">${lowest?.category}</div>
              <div style="font-size: 11px; color: #666;">${lowest?.afterAmount} (${lowest?.afterPercent} of Bill)</div>
            </td>
            <td style="padding: 12px; border: 1px solid #ddd; text-align: center;">
             
              <div style="font-size: 12px; font-weight: bold;">Best Performing Category</div>
              <div style="font-size: 16px; font-weight: bold; margin-top: 8px;">${best?.category}</div>
              <div style="font-size: 11px; color: #666;">${best?.variance} variance from target</div>
            </td>
          </tr>
        </table>
      </div>

      <!-- COST COMPARISON TABLE -->
      <div style="margin-bottom: 20px;">
        <h3 style="margin: 0 0 10px 0; font-size: 14px; font-weight: bold;">Cost Comparison Analysis</h3>
        <table style="width:100%; border-collapse: collapse; font-size: 11px;">
          <thead>
            <tr style="background: #0D47A1; color: white;">
              <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Cost Category</th>
              <th style="padding: 8px; border: 1px solid #ddd; text-align: center;">After Event</th>
              <th style="padding: 8px; border: 1px solid #ddd; text-align: center;">Pre Event</th>
              <th style="padding: 8px; border: 1px solid #ddd; text-align: center;">Proposed</th>
              <th style="padding: 8px; border: 1px solid #ddd; text-align: center;">DIFF</th>
            </tr>
          </thead>
          <tbody>
    `;

    tableRows.forEach((row, idx) => {
      const isEven = idx % 2 === 0;
      htmlContent += `
        <tr style="background: ${isEven ? '#ffffff' : '#f8f8f8'};">
          <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">${row.category}</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">
            <div style="font-size: 10px; ${row.afterPercentValue > row.proposedPercentValue ? 'color: red;' : 'color: #666;'}">${row.afterPercent}</div>
            <div style="font-weight: bold;">${row.afterAmount}</div>
          </td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">
            <div style="font-size: 10px; ${row.prePercentValue > row.proposedPercentValue ? 'color: red;' : 'color: #666;'}">${row.prePercent}</div>
            <div style="font-weight: bold;">${row.preAmount}</div>
          </td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">
            <div style="font-size: 10px; color: #666;">${row.proposedPercent}</div>
            <div style="font-weight: bold;">${row.proposedAmount}</div>
          </td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">
            <span style="background: ${row.isFavorable ? '#d4edda' : '#f8d7da'}; color: ${row.isFavorable ? '#155724' : '#721c24'}; padding: 4px 8px; border-radius: 4px; font-weight: bold;">
              ${row.variance}
            </span>
          </td>
        </tr>
      `;
    });

    htmlContent += `
          </tbody>
        </table>
      </div>

      <!-- ANALYSIS SECTION -->
      <div style="margin-top: 20px;">
        <h3 style="margin: 0 0 10px 0; font-size: 14px; font-weight: bold;">Cost Analysis & Action Items</h3>
    `;

    const analysisItems = [
      {
        title: 'Material Cost - Critical Attention Required',
        status: 'high',
        reasons:
          'Pre Event showed 49.27% due to last-minute vendor changes and premium ingredient requirements. After Event reduced to 38.51% through better vendor negotiations and inventory planning.',
        learnings:
          '1. Lock vendor prices 30 days before event\n2. Implement portion control training for kitchen staff\n3. Source 60% raw materials locally to reduce costs\n4. Reduce outsource vendors from 80% to 60%\n5. Create approved vendor list with negotiated rates',
      },
      {
        title: 'Fuel Cost - Performing Well',
        status: 'low',
        reasons:
          'Achieved 2.14% vs 3% target due to efficient route planning and reduced trips. Pre Event was higher at 3.33% due to multiple last-minute supply runs.',
        learnings:
          '1. Continue consolidated delivery approach\n2. Use route optimization software\n3. Schedule all major deliveries 48 hours before event\n4. Maintain fuel efficiency logs per vehicle',
      },
      {
        title: 'Transport Cost - Excellent Performance',
        status: 'low',
        reasons:
          'Achieved 1.67% vs 3% budget by maximizing in-house vehicle usage (18.29% of trips). Lower vendor dependency reduced costs significantly.',
        learnings:
          '1. Continue prioritizing in-house vehicles\n2. Negotiate better rates with regular transport vendors\n3. Consider adding one more vehicle to fleet\n4. Create transport schedule template for future events',
      },
      {
        title: 'Labour Cost - Needs Optimization',
        status: 'medium',
        reasons:
          'At 16.60% vs 15% target. Kitchen labour was 43.04% due to menu complexity. Service staff costs increased for VIP section requirements. Overtime for setup crew added 8% extra cost.',
        learnings:
          '1. Standardize service staff ratios (1:25 guests)\n2. Simplify menu to reduce kitchen labour requirements\n3. Better shift planning to minimize overtime\n4. Cross-train staff for multiple roles\n5. Use 20% outsource vendor labour only for peak demands',
      },
      {
        title: 'Overhead Cost - On Target',
        status: 'low',
        reasons:
          'Stable at 1.02% vs 1% target. Fixed costs well managed with proper allocation across equipment rental and utilities.',
        learnings:
          '1. Maintain current overhead allocation method\n2. Review equipment rental contracts annually\n3. Track utility costs per event for better forecasting',
      },
    ];

    analysisItems.forEach((item) => {
      htmlContent += `
        <div style="margin-bottom: 16px; page-break-inside: avoid;">
          <div style="margin-bottom: 8px;">
            <div style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: ${
              item.status === 'high'
                ? '#ef4444'
                : item.status === 'medium'
                  ? '#eab308'
                  : '#22c55e'
            }; margin-right: 8px;"></div>
            <strong style="font-size: 13px;">${item.title}</strong>
          </div>
          <div style="margin-bottom: 12px;">
            <div style="font-size: 11px; font-weight: bold; margin-bottom: 4px;">Reasons:</div>
            <div style="font-size: 10px; line-height: 1.4;">${item.reasons}</div>
          </div>
          <div>
            <div style="font-size: 11px; font-weight: bold; margin-bottom: 4px;">Learnings for Next Event:</div>
            <div style="font-size: 10px; line-height: 1.4; white-space: pre-line;">${item.learnings}</div>
          </div>
        </div>
      `;
    });

    htmlContent += `
      </div>
    `;

    // Open print window
    const printWindow = window.open(
      '',
      'printWindow',
      'width=1200,height=800,scrollbars=yes',
    );
    if (!printWindow) {
      toast.error('Please allow popups for this site to generate print');
      return;
    }

    printWindow.document.write(`<!doctype html>
    <html>
    <head>
      <meta charset="utf-8" />
      <title>Event Cost Analysis Report</title>
      <style>
        html, body { margin:0; padding:0; font-family: Arial, sans-serif; color:#000; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        @media print {
          @page { margin: 12mm 8mm; }
          body { margin: 0; }
        }
      </style>
    </head>
    <body>
      <div style="padding:12px;">
        ${htmlContent}
      </div>
      <script>
        setTimeout(() => {
          window.print();
          setTimeout(() => window.close(), 600);
        }, 400);
      </script>
    </body>
    </html>
  `);

    printWindow.document.close();
  };

  // ---------- COLUMNS FOR GENERIC TABLE ----------
  const columns: Column<CostComparisonRow>[] = [
    {
      header: 'Cost Category',
      accessor: 'category',
      className: 'min-w-[180px] font-semibold',
      render: (item) => (
        <span
          className={item.category === 'GOP' ? 'font-bold' : 'font-semibold'}
        >
          {item.category}
        </span>
      ),
    },
    {
      header: 'After Event',
      accessor: 'afterAmount',
      render: (item) => (
        <div className="justify-center">
          <div
            className={`font-mono text-xs ${
              item.afterPercentValue > item.proposedPercentValue
                ? 'font-semibold text-red-600'
                : 'text-gray-500'
            }`}
          >
            {item.afterPercent}
          </div>
          <div className="font-mono font-semibold">{item.afterAmount}</div>
        </div>
      ),
    },
    {
      header: 'Pre Event',
      accessor: 'preAmount',
      render: (item) => (
        <div className="justify-center">
          <div
            className={`font-mono text-xs ${
              item.prePercentValue > item.proposedPercentValue
                ? 'font-semibold text-red-600'
                : 'text-gray-500'
            }`}
          >
            {item.prePercent}
          </div>
          <div className="font-mono font-semibold">{item.preAmount}</div>
        </div>
      ),
    },
    {
      header: 'Proposed',
      accessor: 'proposedAmount',
      render: (item) => (
        <div className="justify-center">
          <div className="font-mono text-gray-500 text-xs">
            {item.proposedPercent}
          </div>
          <div className="font-mono font-semibold">{item.proposedAmount}</div>
        </div>
      ),
    },
    {
      header: 'DIFF',
      accessor: 'variance',
      render: (item) => {
        return (
          <span
            className={`inline-block rounded px-3 py-1 font-semibold ${
              item.isFavorable
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {item.variance}
          </span>
        );
      },
    },
  ];

  // ---------- LOADING & ERROR ----------
  if (getdata.isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-[#21808d]" />
          <p className="text-gray-500">Loading cost analysis...</p>
        </div>
      </div>
    );
  }

  if (getdata.error || !apiData) {
    return (
      <div className="flex h-screen items-center justify-center text-red-600">
        <p>Error loading data. Please try again.</p>
      </div>
    );
  }

  // ---------- RENDER ----------
  return (
    <div>
      {/* Header */}
      <div className="mb-4 flex items-center justify-between rounded-t-lg bg-blue-900 px-4 py-5 text-white">
        <h2 className="text-xl font-bold">Event Cost Analysis Dashboard</h2>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 rounded bg-blue-100 px-3 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-200"
        >
          Download PDF
        </button>
      </div>

      {/* Summary Cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
        {/* Total Bill Amount */}
        <div className="rounded-xl border border-[rgba(94,82,64,0.12)] bg-[#fffffd] p-5 shadow-md dark:bg-boxdark dark:text-white">
          <div className="mb-3 flex items-start justify-between">
            <div className="text-gray-500 text-xs uppercase tracking-wider">
              Total Bill Amount
            </div>
            <div className="text-[#084ecf]">
              <FiActivity />
            </div>
          </div>
          <div className="mb-1 text-2xl font-bold md:text-3xl">
            {totals.billAmount}
          </div>
          <div className="text-gray-500 text-sm">After Event Revenue</div>
        </div>

        {/* Total Quotation Amount */}
        <div className="rounded-xl border border-[rgba(94,82,64,0.12)] bg-[#fffffd] p-5 shadow-md dark:bg-boxdark dark:text-white">
          <div className="mb-3 flex items-start justify-between">
            <div className="text-gray-500 text-xs uppercase tracking-wider">
              Total Quotation Amount
            </div>
            <div className="text-[#084ecf]">
              <FiPackage />
            </div>
          </div>
          <div className="mb-1 text-2xl font-bold md:text-3xl">
            {totals.quotationAmount}
          </div>
          <div className="text-gray-500 text-sm">Pre Event Revenue</div>
        </div>

        {/* After Event Total */}
        <div className="rounded-xl border border-[rgba(94,82,64,0.12)] bg-[#fffffd] p-5 shadow-md dark:bg-boxdark dark:text-white">
          <div className="mb-3 flex items-start justify-between">
            <div className="text-gray-500 text-xs uppercase tracking-wider">
              After Event Total
            </div>
            <div className="text-[#084ecf]">
              <FiPackage />
            </div>
          </div>
          <div className="mb-1 text-2xl font-bold md:text-3xl">
            {totals.afterEventTotal}
          </div>
          <div className="text-gray-500 text-sm">
            {totals.afterEventPercentage} of Bill
          </div>
        </div>

        {/* Pre Event Total */}
        <div className="rounded-xl border border-[rgba(94,82,64,0.12)] bg-[#fffffd] p-5 shadow-md dark:bg-boxdark dark:text-white">
          <div className="mb-3 flex items-start justify-between">
            <div className="text-gray-500 text-xs uppercase tracking-wider">
              Pre Event Total
            </div>
            <div className="text-[#084ecf]">
              <FiActivity />
            </div>
          </div>
          <div className="mb-1 text-2xl font-bold md:text-3xl">
            {totals.preEventTotal}
          </div>
          <div className="text-gray-500 text-sm">
            {totals.preEventPercentage} of Quotation
          </div>
        </div>

        {/* Proposed Target */}
        <div className="rounded-xl border border-[rgba(94,82,64,0.12)] bg-[#fffffd] p-5 shadow-md dark:bg-boxdark dark:text-white">
          <div className="mb-3 flex items-start justify-between">
            <div className="text-gray-500 text-xs uppercase tracking-wider">
              Proposed Target
            </div>
            <div className="text-[#084ecf]">
              <FaGasPump />
            </div>
          </div>
          <div className="mb-1 text-2xl font-bold md:text-3xl">
            {totals.proposedTotal}
          </div>
          <div className="text-gray-500 text-sm">
            {totals.proposedPercentage} of Bill
          </div>
        </div>

        {/* Savings Achieved */}
        <div className="rounded-xl border bg-gradient-to-br from-[#21808d] to-[#32b8c6] p-5 text-white shadow-md">
          <div className="mb-3 flex items-start justify-between">
            <div className="text-xs uppercase tracking-wider text-white/90">
              Savings Achieved
            </div>
            <div className="text-white">
              <FiTruck />
            </div>
          </div>
          <div className="mb-1 text-2xl font-bold md:text-3xl">
            {totals.savings}
          </div>
          <div className="text-sm text-white/90">From Pre Event</div>
        </div>
      </div>

      {/* Key Insights */}
      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-[rgba(94,82,64,0.12)] bg-[#fffffd] p-5 shadow-md dark:bg-boxdark dark:text-white">
          <MdTrendingUp className="mb-3 text-2xl text-amber-500" />
          <div className="mb-2 text-sm font-semibold">
            Highest Cost Category
          </div>
          <div className="mb-2 text-xl font-bold">{highest?.category}</div>
          <div className="text-gray-500 text-sm">
            {highest?.afterAmount} ({highest?.afterPercent} of Bill)
          </div>
        </div>
        <div className="rounded-xl border border-[rgba(94,82,64,0.12)] bg-[#fffffd] p-5 shadow-md dark:bg-boxdark dark:text-white">
          <MdTrendingDown className="mb-3 text-2xl text-emerald-500" />
          <div className="mb-2 text-sm font-semibold">Lowest Cost Category</div>
          <div className="mb-2 text-xl font-bold">{lowest?.category}</div>
          <div className="text-gray-500 text-sm">
            {lowest?.afterAmount} ({lowest?.afterPercent} of Bill)
          </div>
        </div>
        <div className="rounded-xl border border-[rgba(94,82,64,0.12)] bg-[#fffffd] p-5 shadow-md dark:bg-boxdark dark:text-white">
          <FiAward className="mb-3 text-2xl text-blue-500" />
          <div className="mb-2 text-sm font-semibold">
            Best Performing Category
          </div>
          <div className="mb-2 text-xl font-bold">{best?.category}</div>
          <div className="text-gray-500 text-sm">
            {best?.variance} variance from target
          </div>
        </div>
      </div>

      {/* ---------- GENERIC TABLE ---------- */}
      <div className="mb-8 rounded-xl border border-[rgba(94,82,64,0.12)] bg-[#fffffd] p-6 shadow-md dark:bg-boxdark dark:text-white">
        <h3 className="mb-4 flex items-center gap-2 font-semibold text-black dark:text-white">
          <FiFileText /> Cost Comparison Analysis
        </h3>
        <GenericTable<CostComparisonRow>
          data={tableRows}
          columns={columns}
          searchAble={false}
          paginationOff={true}
          action={false}
        />
      </div>

      {/* ---------- ANALYSIS SECTION ---------- */}
      <div className="rounded-xl border border-[rgba(94,82,64,0.12)] bg-[#fffffd] p-6 shadow-md dark:bg-boxdark dark:text-white">
        <h2 className="mb-5 flex items-center gap-2 border-b-2 border-[rgba(94,82,64,0.2)] pb-4 text-xl font-semibold dark:text-white">
          <FiFileText /> Cost Analysis & Action Items
        </h2>

        {[
          {
            id: 'material',
            title: 'Material Cost - Critical Attention Required',
            status: 'high',
            reasons:
              'Pre Event showed 49.27% due to last-minute vendor changes and premium ingredient requirements. After Event reduced to 38.51% through better vendor negotiations and inventory planning.',
            learnings:
              '1. Lock vendor prices 30 days before event\n2. Implement portion control training for kitchen staff\n3. Source 60% raw materials locally to reduce costs\n4. Reduce outsource vendors from 80% to 60%\n5. Create approved vendor list with negotiated rates',
            after: materialAfter,
            proposed: materialProposed,
          },
          {
            id: 'fuel',
            title: 'Fuel Cost - Performing Well',
            status: 'low',
            reasons:
              'Achieved 2.14% vs 3% target due to efficient route planning and reduced trips. Pre Event was higher at 3.33% due to multiple last-minute supply runs.',
            learnings:
              '1. Continue consolidated delivery approach\n2. Use route optimization software\n3. Schedule all major deliveries 48 hours before event\n4. Maintain fuel efficiency logs per vehicle',
            after: fuelAfter,
            proposed: fuelProposed,
          },
          {
            id: 'transport',
            title: 'Transport Cost - Excellent Performance',
            status: 'low',
            reasons:
              'Achieved 1.67% vs 3% budget by maximizing in-house vehicle usage (18.29% of trips). Lower vendor dependency reduced costs significantly.',
            learnings:
              '1. Continue prioritizing in-house vehicles\n2. Negotiate better rates with regular transport vendors\n3. Consider adding one more vehicle to fleet\n4. Create transport schedule template for future events',
            after: transportAfter,
            proposed: transportProposed,
          },
          {
            id: 'labour',
            title: 'Labour Cost - Needs Optimization',
            status: 'medium',
            reasons:
              'At 16.60% vs 15% target. Kitchen labour was 43.04% due to menu complexity. Service staff costs increased for VIP section requirements. Overtime for setup crew added 8% extra cost.',
            learnings:
              '1. Standardize service staff ratios (1:25 guests)\n2. Simplify menu to reduce kitchen labour requirements\n3. Better shift planning to minimize overtime\n4. Cross-train staff for multiple roles\n5. Use 20% outsource vendor labour only for peak demands',
            after: labourAfter,
            proposed: labourProposed,
          },
          {
            id: 'overhead',
            title: 'Overhead Cost - On Target',
            status: 'low',
            reasons:
              'Stable at 1.02% vs 1% target. Fixed costs well managed with proper allocation across equipment rental and utilities.',
            learnings:
              '1. Maintain current overhead allocation method\n2. Review equipment rental contracts annually\n3. Track utility costs per event for better forecasting',
            after: overheadAfter,
            proposed: overheadProposed,
          },
        ].map((item) => {
          const statusDot =
            item.status === 'high'
              ? 'bg-red-500'
              : item.status === 'medium'
                ? 'bg-yellow-500'
                : 'bg-green-500';

          return (
            <div key={item.id} className="mb-6 last:mb-0">
              <div className="mb-3 flex items-center gap-2">
                <div className={`h-2.5 w-2.5 rounded-full ${statusDot}`} />
                <h3 className="text-base font-semibold">{item.title}</h3>
              </div>
              <div className="mb-4">
                <label className="text-gray-500 mb-2 block text-sm font-semibold">
                  Reasons for Cost Increase/Decrease:
                </label>
                <textarea
                  defaultValue={item.reasons}
                  className="min-h-[80px] w-full resize-y rounded-lg border border-[rgba(94,82,64,0.2)] bg-[#fcfcf9] p-3 text-sm focus:ring-2 focus:ring-[#21808d] dark:bg-boxdark dark:text-white"
                  placeholder="Add your analysis..."
                />
              </div>
              <div>
                <label className="text-gray-500 mb-2 block text-sm font-semibold">
                  Learnings & Improvements for Next Event:
                </label>
                <textarea
                  defaultValue={item.learnings}
                  className="min-h-[80px] w-full resize-y rounded-lg border border-[rgba(94,82,64,0.12)] bg-[#fcfcf9] p-3 text-sm focus:ring-2 focus:ring-[#21808d] dark:bg-boxdark dark:text-white"
                  placeholder="Add your learnings..."
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CostAnalysisDashboard;
