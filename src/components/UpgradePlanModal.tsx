import React from 'react';
import { Check, Zap, Sparkles, X, ShieldCheck } from 'lucide-react';

interface UpgradePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlanName?: string;
  onSelectPlan: (planName: string) => void;
}

export default function UpgradePlanModal({ isOpen, onClose, currentPlanName = 'Free', onSelectPlan }: UpgradePlanModalProps) {
  if (!isOpen) return null;

  const plans = [
    {
      name: 'Free',
      price: '₹0',
      period: 'forever',
      scans: '5 food scans / mo',
      aiChat: '20 AI messages / mo',
      features: ['Basic calorie tracking', 'Manual activity logging', 'Water intake tracker', 'Weight history graph'],
      popular: false,
    },
    {
      name: 'Pro',
      price: '₹299',
      period: 'per month',
      scans: '100 food scans / mo',
      aiChat: '200 AI messages / mo',
      features: [
        'Everything in Free',
        'Budget & location meal recs',
        'Workout recommendation builder',
        'Food expense analytics',
        'Weekly AI health report',
      ],
      popular: true,
    },
    {
      name: 'Premium',
      price: '₹599',
      period: 'per month',
      scans: 'Unlimited food scans',
      aiChat: 'Unlimited AI messages',
      features: [
        'Everything in Pro',
        'Unlimited Gemini AI calls',
        'Priority AI response time',
        'Advanced historical trends',
        'Custom macro targets',
      ],
      popular: false,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">Upgrade Your Plan</h2>
              <p className="text-xs text-slate-400">Unlock higher AI limits & location-aware meal recommendations</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Plan Cards Grid */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((plan) => {
            const isCurrent = currentPlanName.toLowerCase() === plan.name.toLowerCase();
            return (
              <div
                key={plan.name}
                className={`rounded-2xl p-5 border flex flex-col justify-between relative transition-all ${
                  plan.popular
                    ? 'bg-gradient-to-b from-slate-800 to-slate-900 border-emerald-500/50 shadow-xl shadow-emerald-500/10'
                    : 'bg-slate-900/80 border-slate-800'
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500 text-slate-950 shadow-md">
                    Most Popular
                  </span>
                )}

                <div className="space-y-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-100">{plan.name} Plan</h3>
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="text-3xl font-extrabold text-slate-100">{plan.price}</span>
                      <span className="text-xs text-slate-400">/{plan.period}</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950/60 text-xs space-y-1 border border-slate-800">
                    <div className="text-emerald-400 font-medium">⚡ {plan.scans}</div>
                    <div className="text-cyan-400 font-medium">💬 {plan.aiChat}</div>
                  </div>

                  <ul className="space-y-2 pt-2">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                        <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-5 mt-auto">
                  {isCurrent ? (
                    <button
                      disabled
                      className="w-full py-2.5 rounded-xl bg-slate-800 text-slate-400 text-xs font-semibold cursor-default"
                    >
                      Current Plan
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        onSelectPlan(plan.name);
                        onClose();
                      }}
                      className={`w-full py-2.5 rounded-xl text-xs font-bold transition shadow-md ${
                        plan.popular
                          ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 hover:opacity-95'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-100'
                      }`}
                    >
                      Choose {plan.name}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <ShieldCheck className="h-4 w-4" /> Secure Razorpay Payment Gateway Ready
          </div>
          <span>Cancel anytime</span>
        </div>
      </div>
    </div>
  );
}
