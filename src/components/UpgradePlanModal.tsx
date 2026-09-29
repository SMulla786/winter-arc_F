import React from 'react';
import { Check, Zap, Sparkles, X, ShieldCheck } from 'lucide-react';

interface UpgradePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlanName?: string;
  onSelectPlan: (planName: string) => void;
}

export default function UpgradePlanModal({
  isOpen,
  onClose,
  currentPlanName = 'Free',
  onSelectPlan,
}: UpgradePlanModalProps) {
  if (!isOpen) return null;

  const plans = [
    {
      name: 'Free',
      price: '₹0',
      period: 'forever',
      scans: '10 food scans / mo',
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
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-[#0d0d0f] border border-red-600/40 rounded-2xl shadow-[0_0_50px_rgba(220,38,38,0.2)] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-zinc-800 bg-[#121216] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-red-950/80 text-red-400 border border-red-600/40">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase text-white tracking-wider">UPGRADE SUBSCRIPTION PLAN</h2>
              <p className="text-xs text-zinc-400">Unlock higher Gemini AI vision limits & location-aware meal recommendations</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800">
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
                    ? 'bg-[#121216] border-red-600/60 shadow-xl shadow-red-950/40'
                    : 'bg-[#080808] border-zinc-800'
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-black uppercase bg-red-600 text-white shadow-md">
                    Most Popular
                  </span>
                )}

                <div className="space-y-3">
                  <div>
                    <h3 className="text-sm font-black uppercase text-white">{plan.name} Tier</h3>
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="text-3xl font-black text-white">{plan.price}</span>
                      <span className="text-xs text-zinc-400">/{plan.period}</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#080808] text-xs space-y-1 border border-zinc-800">
                    <div className="text-red-400 font-bold">⚡ {plan.scans}</div>
                    <div className="text-amber-400 font-bold">💬 {plan.aiChat}</div>
                  </div>

                  <ul className="space-y-2 pt-2">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-zinc-300 font-medium">
                        <Check className="h-3.5 w-3.5 text-red-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-5 mt-auto">
                  {isCurrent ? (
                    <button
                      disabled
                      className="w-full py-2.5 rounded-xl bg-zinc-800 text-zinc-500 text-xs font-bold cursor-default uppercase"
                    >
                      Current Plan
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        onSelectPlan(plan.name);
                        onClose();
                      }}
                      className={`w-full py-2.5 rounded-xl text-xs font-black uppercase transition shadow-md ${
                        plan.popular
                          ? 'bg-gradient-to-r from-red-600 to-red-800 text-white hover:from-red-500'
                          : 'bg-zinc-800 hover:bg-zinc-700 text-white'
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
        <div className="p-4 border-t border-zinc-800 bg-[#121216] flex items-center justify-between text-xs text-zinc-400">
          <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
            <ShieldCheck className="h-4 w-4" /> Secure Razorpay Payment Gateway
          </div>
          <span>Cancel anytime</span>
        </div>
      </div>
    </div>
  );
}
