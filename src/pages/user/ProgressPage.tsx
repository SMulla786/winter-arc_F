import { TrendingUp, Trophy, Flame, Sparkles, Award, Zap, Calendar, CheckCircle, Plus, Scale, X } from 'lucide-react';
import WeightChart from '../../components/WeightChart';

interface ProgressPageProps {
  weightLogs: any[];
  onLogWeight?: (weightKg: number) => void;
}

export default function ProgressPage({ weightLogs, onLogWeight }: ProgressPageProps) {
  const [timeframe, setTimeframe] = useState<'week' | 'month' | '3months'>('week');
  const [showLogModal, setShowLogModal] = useState(false);
  const [inputWeight, setInputWeight] = useState('');

  const achievements = [
    { id: 'steps', title: '10K STEPS MASTER', desc: 'Reach 10,000 steps in a single day', xp: '+50 XP', unlocked: true, icon: '🏆' },
    { id: 'streak', title: '7-DAY STREAK', desc: 'Log meals & activity for 7 consecutive days', xp: '+100 XP', unlocked: true, icon: '🔥' },
    { id: 'workouts', title: 'WORKOUT HERO', desc: 'Complete 10 training sessions', xp: '+150 XP', unlocked: false, icon: '💪' },
    { id: 'nutrition', title: 'NUTRITION STREAK', desc: 'Hit daily protein target 5 days in a row', xp: '+80 XP', unlocked: true, icon: '🥗' },
  ];

  const handleWeightSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(inputWeight);
    if (val > 20 && val < 300) {
      if (onLogWeight) onLogWeight(val);
      setShowLogModal(false);
      setInputWeight('');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-[#0d0d0f] border border-red-600/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-red-400" />
            <h1 className="text-xl font-black uppercase text-white tracking-wider">PROGRESS & CHARACTER STATS</h1>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Track weight progression, consistency metrics, AI insights, and level achievements.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Log Weight Button */}
          <button
            onClick={() => setShowLogModal(true)}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg transition"
          >
            <Plus className="h-3.5 w-3.5" /> Log Weight
          </button>

          {/* Timeframe Selector */}
          <div className="flex items-center gap-1.5 p-1 bg-[#121216] rounded-xl border border-zinc-800">
            {(['week', 'month', '3months'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTimeframe(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition ${
                  timeframe === t
                    ? 'bg-red-950/60 text-white border border-red-600/40'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {t === '3months' ? '3 Months' : t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Log Weight Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121216] border border-red-600/40 w-full max-w-sm rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-red-500" />
                <h3 className="text-sm font-black text-white uppercase tracking-wider">Log Today's Weight</h3>
              </div>
              <button
                onClick={() => setShowLogModal(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleWeightSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase block mb-1">Body Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  placeholder="e.g. 72.5"
                  value={inputWeight}
                  onChange={(e) => setInputWeight(e.target.value)}
                  className="w-full bg-[#080808] border border-zinc-700 rounded-xl px-4 py-3 text-white text-lg font-bold focus:border-red-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold uppercase transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 text-white text-xs font-black uppercase tracking-wider transition shadow-lg shadow-red-600/30"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Metrics Overview Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#121216] border border-zinc-800">
          <div className="text-[10px] font-bold text-zinc-500 uppercase">Average Calories</div>
          <div className="text-xl font-black text-white mt-1">1,920 <span className="text-xs text-red-400">kcal/day</span></div>
        </div>
        <div className="p-4 rounded-xl bg-[#121216] border border-zinc-800">
          <div className="text-[10px] font-bold text-zinc-500 uppercase">Average Steps</div>
          <div className="text-xl font-black text-white mt-1">7,840 <span className="text-xs text-emerald-400">steps/day</span></div>
        </div>
        <div className="p-4 rounded-xl bg-[#121216] border border-zinc-800">
          <div className="text-[10px] font-bold text-zinc-500 uppercase">Workouts Done</div>
          <div className="text-xl font-black text-white mt-1">4 <span className="text-xs text-amber-400">sessions</span></div>
        </div>
        <div className="p-4 rounded-xl bg-[#121216] border border-zinc-800">
          <div className="text-[10px] font-bold text-zinc-500 uppercase">Food Spend</div>
          <div className="text-xl font-black text-white mt-1">₹1,850 <span className="text-xs text-zinc-400">this week</span></div>
        </div>
      </div>

      {/* Weight History Chart */}
      <div className="p-5 rounded-2xl bg-[#121216] border border-zinc-800 space-y-3 shadow-md">
        <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
          <h2 className="text-xs font-black uppercase text-white tracking-wider flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-red-400" /> WEIGHT PROGRESSION TREND (KG)
          </h2>
          <span className="text-xs font-bold text-emerald-400">-2.0 kg total loss</span>
        </div>

        <div className="h-56 pt-2">
          <WeightChart data={weightLogs} />
        </div>
      </div>

      {/* AI Insights & Weekly Improvements Card */}
      <div className="p-5 rounded-2xl bg-[#0d0d0f] border border-red-600/30 space-y-4 shadow-lg">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-red-400" />
          <h2 className="text-xs font-black uppercase text-white tracking-wider">🤖 AI WEEKLY INSIGHTS</h2>
        </div>

        <div className="p-4 rounded-xl bg-[#121216] border border-zinc-800 space-y-3 text-xs leading-relaxed text-zinc-300 font-medium">
          <p>
            "Your step activity was fairly consistent over the last 7 days (avg 7,840 steps). Protein intake was slightly below your 130g target on 3 out of 7 days. Food spending increased mainly because of 2 restaurant meals on the weekend."
          </p>

          <div className="pt-2 border-t border-zinc-800 space-y-2">
            <div className="font-extrabold text-white text-xs uppercase tracking-wider text-red-400">Focus Items For Next Week:</div>
            <ul className="space-y-1.5 text-zinc-300">
              <li className="flex items-center gap-2">✦ Add 2 boiled eggs or protein shake to breakfast</li>
              <li className="flex items-center gap-2">✦ Maintain regular 30-min walking after dinner</li>
              <li className="flex items-center gap-2">✦ Keep restaurant dining within ₹400 weekend cap</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Character Achievement Badges */}
      <div className="p-5 rounded-2xl bg-[#121216] border border-zinc-800 space-y-4">
        <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
          <h2 className="text-xs font-black uppercase text-white tracking-wider flex items-center gap-2">
            <Trophy className="h-4 w-4 text-amber-400" /> ACHIEVEMENTS & XP UNLOCKS
          </h2>
          <span className="text-xs font-bold text-amber-400">3 / 4 Unlocked</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {achievements.map((ach) => (
            <div
              key={ach.id}
              className={`p-4 rounded-xl border flex items-start gap-3 transition ${
                ach.unlocked
                  ? 'bg-red-950/30 border-red-600/40 shadow-[0_0_12px_rgba(220,38,38,0.15)]'
                  : 'bg-[#080808] border-zinc-800 opacity-60'
              }`}
            >
              <div className="text-2xl shrink-0">{ach.icon}</div>
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <h3 className="font-extrabold text-xs text-white">{ach.title}</h3>
                  <span className="text-[10px] font-black text-amber-400 px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/30">
                    {ach.xp}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-1">{ach.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
