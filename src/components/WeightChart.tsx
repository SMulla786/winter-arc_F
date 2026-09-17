import React from 'react';
import { TrendingDown, Scale } from 'lucide-react';

interface WeightEntry {
  date: string;
  weightKg: number;
}

interface WeightChartProps {
  logs: WeightEntry[];
  targetWeightKg?: number;
}

export default function WeightChart({ logs, targetWeightKg = 68 }: WeightChartProps) {
  if (!logs || logs.length === 0) {
    logs = [
      { date: 'W1', weightKg: 74.2 },
      { date: 'W2', weightKg: 73.5 },
      { date: 'W3', weightKg: 72.8 },
      { date: 'W4', weightKg: 72.0 },
    ];
  }

  const minWeight = Math.min(...logs.map((l) => l.weightKg), targetWeightKg) - 1;
  const maxWeight = Math.max(...logs.map((l) => l.weightKg)) + 1;
  const range = maxWeight - minWeight;

  const currentWeight = logs[logs.length - 1]?.weightKg || 72;
  const startWeight = logs[0]?.weightKg || 74.2;
  const weightChange = (currentWeight - startWeight).toFixed(1);

  return (
    <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
            <Scale className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100">Weight Progression History</h3>
            <p className="text-xs text-slate-400">Target Goal: {targetWeightKg} kg</p>
          </div>
        </div>

        <div className="text-right">
          <div className="text-lg font-extrabold text-slate-100">{currentWeight} kg</div>
          <div className="text-xs text-emerald-400 font-semibold flex items-center gap-1 justify-end">
            <TrendingDown className="h-3.5 w-3.5" /> {weightChange} kg total change
          </div>
        </div>
      </div>

      {/* SVG Line Chart */}
      <div className="relative h-40 w-full pt-4">
        <svg className="w-full h-full overflow-visible" viewBox="0 0 300 120">
          {/* Target Line */}
          {targetWeightKg && (
            <line
              x1="0"
              y1={120 - ((targetWeightKg - minWeight) / range) * 100}
              x2="300"
              y2={120 - ((targetWeightKg - minWeight) / range) * 100}
              stroke="#06b6d4"
              strokeDasharray="4 4"
              strokeWidth="1.5"
            />
          )}

          {/* Polyline */}
          <polyline
            fill="none"
            stroke="#10b981"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={logs
              .map((l, idx) => {
                const x = (idx / (logs.length - 1)) * 300;
                const y = 120 - ((l.weightKg - minWeight) / range) * 100;
                return `${x},${y}`;
              })
              .join(' ')}
          />

          {/* Points */}
          {logs.map((l, idx) => {
            const x = (idx / (logs.length - 1)) * 300;
            const y = 120 - ((l.weightKg - minWeight) / range) * 100;
            return (
              <g key={idx}>
                <circle cx={x} cy={y} r="5" fill="#10b981" stroke="#0f172a" strokeWidth="2" />
                <text x={x} y={y - 10} textAnchor="middle" fill="#cbd5e1" fontSize="9" fontWeight="bold">
                  {l.weightKg}
                </text>
              </g>
            );
          })}
        </svg>

        {/* X Axis Labels */}
        <div className="flex justify-between text-[10px] text-slate-400 mt-2 px-1 font-mono">
          {logs.map((l, idx) => (
            <span key={idx}>{l.date}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
