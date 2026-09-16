// import React, {useState} from 'react';

// type AnalysisSection = {
//   reasons: string;
//   learnings: string;
// };

// const EventCostAnalysisDashboard: React.FC = () => {
//   const [analysis, setAnalysis] = useState<Record<string, AnalysisSection>>({
//     material: {
//       reasons:
//         'Pre Event showed 49.27% due to last-minute vendor changes and premium ingredient requirements. After Event reduced to 38.51% through better vendor negotiations and inventory planning.',
//       learnings:
//         '1. Lock vendor prices 30 days before event\n2. Implement portion control training for kitchen staff\n3. Source 60% raw materials locally\n4. Reduce outsource vendors from 80% to 60%\n5. Create approved vendor list with negotiated rates',
//     },
//     fuel: {
//       reasons:
//         'Achieved 2.14% vs 3% target due to efficient route planning and reduced trips. Pre Event was higher at 3.33% due to multiple last-minute supply runs.',
//       learnings:
//         '1. Continue consolidated delivery approach\n2. Use route optimization software\n3. Schedule all major deliveries 48 hours before event\n4. Maintain fuel efficiency logs per vehicle',
//     },
//     transport: {
//       reasons:
//         'Achieved 1.67% vs 3% budget by maximizing in-house vehicle usage (18.29% of trips).',
//       learnings:
//         '1. Continue prioritizing in-house vehicles\n2. Negotiate better rates with regular transport vendors\n3. Create transport schedule template',
//     },
//     labour: {
//       reasons:
//         'At 16.60% vs 15% target due to menu complexity, VIP service requirements, and overtime.',
//       learnings:
//         '1. Standardize service staff ratios\n2. Simplify menu\n3. Better shift planning\n4. Cross-train staff',
//     },
//     overhead: {
//       reasons: 'Stable at 1.02% vs 1% target with well-managed fixed costs.',
//       learnings:
//         '1. Maintain current overhead allocation\n2. Review rental contracts annually',
//     },
//   });

//   const handleChange = (
//     key: string,
//     field: keyof AnalysisSection,
//     value: string,
//   ) => {
//     setAnalysis((prev) => ({
//       ...prev,
//       [key]: {...prev[key], [field]: value},
//     }));
//   };

//   return (
//     <div className="min-h-screen p-6 text-neutral-800 dark:bg-neutral-900 dark:text-neutral-100">
//       <div className="mx-auto max-w-[1600px] space-y-10">
//         {/* Header */}
//         <h1 className="text-3xl font-semibold">
//           Event Cost Analysis Dashboard
//         </h1>

//         {/* Summary Cards */}
//         <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
//           {[
//             {
//               label: 'After Event Total',
//               value: '₹9,47,072',
//               note: '59.94% of Revenue',
//             },
//             {
//               label: 'Pre Event Total',
//               value: '₹11,04,705',
//               note: '69.04% of Revenue',
//             },
//             {
//               label: 'Proposed Target',
//               value: '₹8,00,000',
//               note: '50.00% of Revenue',
//             },
//             {
//               label: 'Savings Achieved',
//               value: '₹1,57,633',
//               note: 'From Pre Event',
//               highlight: true,
//             },
//           ].map((item) => (
//             <div
//               key={item.label}
//               className={`rounded-xl border p-5 shadow-sm ${
//                 item.highlight
//                   ? 'bg-gradient-to-br from-teal-600 to-teal-400 text-white'
//                   : 'bg-white dark:border-neutral-700 dark:bg-neutral-800'
//               }`}
//             >
//               <p className="text-xs uppercase tracking-wide opacity-70">
//                 {item.label}
//               </p>
//               <p className="mt-2 text-2xl font-bold">{item.value}</p>
//               <p className="text-sm opacity-70">{item.note}</p>
//             </div>
//           ))}
//         </div>

//         {/* Cost Table */}
//         <div className="overflow-hidden rounded-xl border bg-white shadow-sm dark:border-neutral-700 dark:bg-neutral-800">
//           <table className="w-full text-sm">
//             <thead className="dark:bg-neutral-700">
//               <tr>
//                 {[
//                   'Cost Category',
//                   'After Event',
//                   'Pre Event',
//                   'Proposed',
//                   'Variance',
//                 ].map((h) => (
//                   <th key={h} className="px-4 py-3 text-left font-semibold">
//                     {h}
//                   </th>
//                 ))}
//               </tr>
//             </thead>
//             <tbody>
//               {[
//                 [
//                   'Material Cost',
//                   '₹6,08,495',
//                   '38.51%',
//                   '₹7,88,279',
//                   '₹4,48,000',
//                   '+₹1,60,495',
//                   false,
//                 ],
//                 [
//                   'Fuel Cost',
//                   '₹33,768',
//                   '2.14%',
//                   '₹53,250',
//                   '₹48,000',
//                   '-₹14,232',
//                   true,
//                 ],
//                 [
//                   'Transport Cost',
//                   '₹26,458',
//                   '1.67%',
//                   '₹13,826',
//                   '₹48,000',
//                   '-₹21,542',
//                   true,
//                 ],
//                 [
//                   'Labour Cost',
//                   '₹2,62,250',
//                   '16.60%',
//                   '₹2,33,250',
//                   '₹2,40,000',
//                   '+₹22,250',
//                   false,
//                 ],
//                 [
//                   'Overhead Cost',
//                   '₹16,100',
//                   '1.02%',
//                   '₹16,100',
//                   '₹16,000',
//                   '+₹100',
//                   false,
//                 ],
//               ].map(
//                 ([
//                   name,
//                   after,
//                   afterPct,
//                   pre,
//                   proposed,
//                   variance,
//                   positive,
//                 ]) => (
//                   <tr
//                     key={name}
//                     className="border-t dark:border-neutral-700 dark:hover:bg-neutral-700"
//                   >
//                     <td className="px-4 py-3 font-semibold">{name}</td>
//                     <td className="px-4 py-3">
//                       <div className="font-mono font-semibold">{after}</div>
//                       <div className="text-xs opacity-70">{afterPct}</div>
//                     </td>
//                     <td className="font-mono px-4 py-3">{pre}</td>
//                     <td className="font-mono px-4 py-3">{proposed}</td>
//                     <td className="px-4 py-3">
//                       <span
//                         className={`rounded px-2 py-1 text-xs font-semibold ${
//                           positive
//                             ? 'bg-green-500/15 text-green-600'
//                             : 'bg-red-500/15 text-red-500'
//                         }`}
//                       >
//                         {variance}
//                       </span>
//                     </td>
//                   </tr>
//                 ),
//               )}
//             </tbody>
//           </table>
//         </div>

//         {/* Analysis Section */}
//         <div className="space-y-8 rounded-xl border bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-800">
//           <h2 className="border-b pb-4 text-xl font-semibold dark:border-neutral-600">
//             Cost Analysis & Action Items
//           </h2>

//           {Object.entries(analysis).map(([key, value]) => (
//             <div key={key} className="space-y-3">
//               <h3 className="text-lg font-semibold capitalize">{key} Cost</h3>

//               <div>
//                 <label className="text-sm font-medium opacity-70">
//                   Reasons
//                 </label>
//                 <textarea
//                   className="mt-1 w-full rounded-md border p-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 dark:border-neutral-700 dark:bg-neutral-900"
//                   rows={3}
//                   value={value.reasons}
//                   onChange={(e) => handleChange(key, 'reasons', e.target.value)}
//                 />
//               </div>

//               <div>
//                 <label className="text-sm font-medium opacity-70">
//                   Learnings & Improvements
//                 </label>
//                 <textarea
//                   className="mt-1 w-full rounded-md border p-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 dark:border-neutral-700 dark:bg-neutral-900"
//                   rows={4}
//                   value={value.learnings}
//                   onChange={(e) =>
//                     handleChange(key, 'learnings', e.target.value)
//                   }
//                 />
//               </div>
//             </div>
//           ))}

//           <div className="flex gap-3 pt-4">
//             <button className="rounded-md bg-teal-600 px-6 py-2 text-sm font-semibold text-white hover:bg-teal-500">
//               Save Analysis
//             </button>
//             <button className="rounded-md border px-6 py-2 text-sm font-semibold dark:border-neutral-600 dark:hover:bg-neutral-700">
//               Export Report
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default EventCostAnalysisDashboard;

/*eslint-disable*/
import React, {useState} from 'react';
import {motion, AnimatePresence} from 'framer-motion';

// ===================== Types =====================
type AnalysisBlock = {
  reasons: string;
  learnings: string;
};

type AnalysisState = {
  material: AnalysisBlock;
  fuel: AnalysisBlock;
  transport: AnalysisBlock;
  labour: AnalysisBlock;
  overhead: AnalysisBlock;
};

// ===================== Component =====================
const EventCostAnalysisDashboardExact: React.FC = () => {
  const [analysis, setAnalysis] = useState<AnalysisState>({
    material: {
      reasons:
        'Pre Event showed 49.27% due to last-minute vendor changes and premium ingredient requirements. After Event reduced to 38.51% through better vendor negotiations and inventory planning.',
      learnings:
        '1. Lock vendor prices 30 days before event\n2. Implement portion control training for kitchen staff\n3. Source 60% raw materials locally to reduce costs\n4. Reduce outsource vendors from 80% to 60%\n5. Create approved vendor list with negotiated rates',
    },
    fuel: {
      reasons:
        'Achieved 2.14% vs 3% target due to efficient route planning and reduced trips. Pre Event was higher at 3.33% due to multiple last-minute supply runs.',
      learnings:
        '1. Continue consolidated delivery approach\n2. Use route optimization software\n3. Schedule all major deliveries 48 hours before event\n4. Maintain fuel efficiency logs per vehicle',
    },
    transport: {
      reasons:
        'Achieved 1.67% vs 3% budget by maximizing in-house vehicle usage (18.29% of trips). Lower vendor dependency reduced costs significantly.',
      learnings:
        '1. Continue prioritizing in-house vehicles\n2. Negotiate better rates with regular transport vendors\n3. Consider adding one more vehicle to fleet\n4. Create transport schedule template for future events',
    },
    labour: {
      reasons:
        'At 16.60% vs 15% target. Kitchen labour was 43.04% due to menu complexity. Service staff costs increased for VIP section requirements. Overtime for setup crew added 8% extra cost.',
      learnings:
        '1. Standardize service staff ratios (1:25 guests)\n2. Simplify menu to reduce kitchen labour requirements\n3. Better shift planning to minimize overtime\n4. Cross-train staff for multiple roles\n5. Use 20% outsource vendor labour only for peak demands',
    },
    overhead: {
      reasons:
        'Stable at 1.02% vs 1% target. Fixed costs well managed with proper allocation across equipment rental and utilities.',
      learnings:
        '1. Maintain current overhead allocation method\n2. Review equipment rental contracts annually\n3. Track utility costs per event for better forecasting',
    },
  });

  const [reasonsShow, setReasonsShow] = useState(false);

  const rows = [
    {
      name: 'Material Cost',
      after: {amount: '₹6,08,495', percent: '38.51%'},
      pre: {amount: '₹7,88,279', percent: '49.27%'},
      proposed: {amount: '₹4,48,000', percent: '28.00%'},
      variance: '+₹1,60,495',
      varianceClass: 'bg-red-100 text-red-500',
    },
    {
      name: 'Fuel Cost',
      after: {amount: '₹33,768', percent: '2.14%'},
      pre: {amount: '₹53,250', percent: '3.33%'},
      proposed: {amount: '₹48,000', percent: '3.00%'},
      variance: '-₹14,232',
      varianceClass: 'bg-green-100 text-green-600',
    },
    {
      name: 'Transport Cost',
      after: {amount: '₹26,458', percent: '1.67%'},
      pre: {amount: '₹13,826', percent: '0.86%'},
      proposed: {amount: '₹48,000', percent: '3.00%'},
      variance: '-₹21,542',
      varianceClass: 'bg-green-100 text-green-600',
    },
    {
      name: 'Labour Cost',
      after: {amount: '₹2,62,250', percent: '16.60%'},
      pre: {amount: '₹2,33,250', percent: '14.58%'},
      proposed: {amount: '₹2,40,000', percent: '15.00%'},
      variance: '+₹22,250',
      varianceClass: 'bg-red-100 text-red-500',
    },
    {
      name: 'Overhead Cost',
      after: {amount: '₹16,100', percent: '1.02%'},
      pre: {amount: '₹16,100', percent: '1.01%'},
      proposed: {amount: '₹16,000', percent: '1.00%'},
      variance: '+₹100',
      varianceClass: 'bg-red-100 text-red-500',
    },
  ];

  const analysisConfig = [
    {
      key: 'material',
      title: 'Material Cost - Critical Attention Required',
      dot: 'bg-red-500',
    },
    {key: 'fuel', title: 'Fuel Cost - Performing Well', dot: 'bg-green-500'},
    {
      key: 'transport',
      title: 'Transport Cost - Excellent Performance',
      dot: 'bg-green-500',
    },
    {
      key: 'labour',
      title: 'Labour Cost - Needs Optimization',
      dot: 'bg-yellow-400',
    },
    {key: 'overhead', title: 'Overhead Cost - On Target', dot: 'bg-green-500'},
  ] as const;

  const SummaryCard = ({label, value, note}: any) => (
    <motion.div
      variants={{
        hidden: {opacity: 0, y: 10},
        visible: {opacity: 1, y: 0},
      }}
      transition={{duration: 0.25, ease: 'easeOut'}}
      className="rounded-xl border border-black/10 bg-white p-5 shadow dark:bg-[#262828]"
    >
      <div className="text-gray-500 text-xs uppercase">{label}</div>
      <div className="mt-2 text-[28px] font-bold">{value}</div>
      <div className="text-gray-500 text-sm">{note}</div>
    </motion.div>
  );

  const InsightCard = ({icon, color, title, value, desc}: any) => (
    <motion.div
      initial={{opacity: 0, y: 50}}
      animate={{opacity: 1, y: 0}}
      transition={{duration: 0.5, ease: 'backOut'}}
      className="rounded-xl border border-black/10 bg-white p-5 shadow dark:bg-[#262828]"
    >
      {/* <div
      className={`w-10 h-10 flex items-center justify-center rounded mb-3 text-lg font-bold ${
        color === "red"
          ? "bg-red-100 text-red-500"
          : "bg-green-100 text-green-600"
      }`}
    >
      {icon}
    </div> */}
      <div className="text-sm font-semibold">{title}</div>
      <div className="mt-1 text-xl font-bold">{value}</div>
      <div className="text-gray-500 mt-1 text-xs">{desc}</div>
    </motion.div>
  );

  const CostCell = ({amount, percent}: any) => (
    <td className="px-4 py-4">
      <div className="font-mono font-semibold">{amount}</div>
      <div className="text-gray-500 text-xs">{percent}</div>
    </td>
  );

  const updateField = (
    key: keyof AnalysisState,
    field: keyof AnalysisBlock,
    value: string,
  ) => {
    setAnalysis((prev) => ({
      ...prev,
      [key]: {...prev[key], [field]: value},
    }));
  };

  return (
    <motion.div
      initial={{opacity: 0, y: 8}}
      animate={{opacity: 1, y: 0}}
      transition={{duration: 0.35, ease: 'easeOut'}}
      className="dark:text-gray-100 min-h-screen bg-[#FCFCF9] p-6 text-[#1F2121] dark:bg-[#1F2121]"
    >
      <div className="mx-auto max-w-[1600px] space-y-8">
        {/* Header */}
        <h1 className="text-[32px] font-semibold">
          Event Cost Analysis Dashboard
        </h1>

        {/* Summary */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            visible: {transition: {staggerChildren: 0.08}},
          }}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          <SummaryCard
            label="After Event Total"
            value="₹9,47,072"
            note="59.94% of Revenue"
          />
          <SummaryCard
            label="Pre Event Total"
            value="₹11,04,705"
            note="69.04% of Revenue"
          />
          <SummaryCard
            label="Proposed Target"
            value="₹8,00,000"
            note="50.00% of Revenue"
          />
          <motion.div
            variants={{
              hidden: {opacity: 0, y: 10},
              visible: {opacity: 1, y: 0},
            }}
            transition={{duration: 0.25, ease: 'easeOut'}}
          >
            <div className="rounded-xl bg-gradient-to-br from-[#21808D] to-[#32B8C6] p-5 text-white shadow">
              <div className="text-xs uppercase opacity-90">
                Savings Achieved
              </div>
              <div className="mt-2 text-[28px] font-bold">₹1,57,633</div>
              <div className="text-sm opacity-90">From Pre Event</div>
            </div>
          </motion.div>
        </motion.div>

        {/* Insights */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <InsightCard
            icon="↑"
            color="red"
            title="Highest Cost Increase"
            value="Material Cost"
            desc="Up by ₹3,40,279 (28% → 49.27% in Pre Event)"
          />
          <InsightCard
            icon="↓"
            color="green"
            title="Biggest Savings Opportunity"
            value="Material Cost"
            desc="Target: ₹4,48,000 (28%) - Current: ₹6,08,495 (38.51%)"
          />
          <InsightCard
            icon="↓"
            color="green"
            title="Best Performing Category"
            value="Transport Cost"
            desc="Below budget at 1.67% vs 3.00% target"
          />
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-black/10 bg-white shadow dark:bg-[#262828]">
          <table className="w-full text-sm">
            <thead className="bg-[#FCFCF9] dark:bg-[#1F2121]">
              <tr>
                {[
                  'Cost Category',
                  'After Event',
                  'Pre Event',
                  'Proposed',
                  'Variance',
                ].map((h) => (
                  <th
                    key={h}
                    className="border-b px-4 py-4 text-left font-semibold"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <motion.tr
                  key={r.name}
                  whileHover={{backgroundColor: 'rgba(0,0,0,0.04)'}}
                  transition={{duration: 0.15, ease: 'easeOut'}}
                  className="dark:hover:bg-white/5"
                >
                  <td className="px-4 py-4 font-semibold">{r.name}</td>
                  <CostCell {...r.after} />
                  <CostCell {...r.pre} />
                  <CostCell {...r.proposed} />
                  <td className="px-4 py-4">
                    <span
                      className={`rounded px-2 py-1 text-xs font-semibold ${r.varianceClass}`}
                    >
                      {r.variance}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-center">
          <button
            className="rounded bg-[#21808D] px-6 py-2 font-semibold text-white"
            onClick={() => setReasonsShow(!reasonsShow)}
          >
            {reasonsShow ? 'Hide' : 'View Detailed Report'}
          </button>
        </div>

        {/* Analysis */}
        <AnimatePresence>
          {reasonsShow && (
            <motion.div
              initial={{opacity: 0, height: 0}}
              animate={{opacity: 1, height: 'auto'}}
              exit={{opacity: 0, height: 0}}
              transition={{duration: 0.3, ease: 'easeInOut'}}
              className="overflow-hidden"
            >
              <div className="space-y-6 rounded-xl border border-black/10 bg-white p-6 shadow dark:bg-[#262828]">
                <h2 className="border-b pb-4 text-xl font-semibold">
                  Cost Analysis & Action Items
                </h2>

                {analysisConfig.map((item) => (
                  <div key={item.key} className="space-y-3">
                    <div className="flex items-center gap-2 font-semibold">
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${item.dot}`}
                      />
                      {item.title}
                    </div>

                    <label className="text-gray-500 text-sm">
                      Reasons for Cost Increase/Decrease:
                    </label>
                    <textarea
                      className="min-h-[90px] w-full rounded border bg-[#FCFCF9] p-3 dark:bg-[#1F2121]"
                      value={analysis[item.key].reasons}
                      onChange={(e) =>
                        updateField(item.key, 'reasons', e.target.value)
                      }
                    />

                    <label className="text-gray-500 text-sm">
                      Learnings & Improvements for Next Event:
                    </label>
                    <textarea
                      className="min-h-[120px] w-full rounded border bg-[#FCFCF9] p-3 dark:bg-[#1F2121]"
                      value={analysis[item.key].learnings}
                      onChange={(e) =>
                        updateField(item.key, 'learnings', e.target.value)
                      }
                    />
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default EventCostAnalysisDashboardExact;
