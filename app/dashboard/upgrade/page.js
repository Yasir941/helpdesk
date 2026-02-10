"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Import the router
import { Check, Zap, Crown, Infinity, ShieldCheck, Loader2, CircleCheckBig } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

function UpgradePlans() {
  const router = useRouter();
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [paymentStatus, setPaymentStatus] = useState('idle');

  // Automatically redirect after success
  useEffect(() => {
    if (paymentStatus === 'success') {
      const timer = setTimeout(() => {
        router.push('/dashboard'); // Change this to your actual workspace path
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [paymentStatus, router]);

  const plans = [
    {
      name: "Free",
      prices: { weekly: "0", monthly: "0", yearly: "0" },
      features: ["5 PDF Uploads", "Basic AI Chat", "Standard Support"],
      isCurrent: true,
    },
    {
      name: "Pro",
      prices: { weekly: "15", monthly: "40", yearly: "400" },
      cycleFeatures: {
        weekly: ["Unlimited PDF Uploads", "Fast AI Processing", "7-Day History", "Email Support"],
        monthly: ["Unlimited PDF Uploads", "Priority AI", "30-Day History", "Priority Chat", "No Ads"],
        yearly: ["Unlimited PDF Uploads", "Instant AI (VIP)", "Lifetime History", "24/7 Support", "Early Access", "Offline Mode"]
      },
      isCurrent: false,
    }
  ];

  const handleMockPayment = () => {
    setPaymentStatus('processing');
    setTimeout(() => {
      setPaymentStatus('success');
    }, 2000);
  };

  return (
    <div className="relative h-full p-4 md:p-6 bg-[radial-gradient(circle_at_top,var(--tw-gradient-stops))] from-green-50 via-white to-white overflow-y-auto">
      
      {/* --- SUCCESS / PROCESSING OVERLAY --- */}
      <AnimatePresence>
        {paymentStatus !== 'idle' && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-100 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full text-center shadow-2xl"
            >
              {paymentStatus === 'processing' ? (
                <div className="flex flex-col items-center py-6">
                  <Loader2 className="h-16 w-16 text-green-500 animate-spin mb-4" />
                  <h3 className="text-xl font-bold text-slate-800">Verifying Payment...</h3>
                </div>
              ) : (
                <div className="flex flex-col items-center py-6">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
                    <CircleCheckBig className="h-20 w-20 text-green-600 mb-4" />
                  </motion.div>
                  <h3 className="text-2xl font-black text-slate-900">All Set!</h3>
                  <p className="text-slate-500 text-sm mt-2">Redirecting you to your upgraded workspace...</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mb-6">
        <h2 className="font-extrabold text-3xl text-slate-900 mb-1 tracking-tight">
          helpdesk <span className="text-green-600">Plan</span>
        </h2>
        <p className="text-gray-500 text-sm">Select a plan to unlock full potential.</p>
      </motion.div>

      {/* Cycle Selector */}
      <div className="flex justify-center mb-8">
        <div className="flex bg-slate-100/80 backdrop-blur-md p-1 rounded-2xl border border-slate-200">
          {['weekly', 'monthly', 'yearly'].map((cycle) => (
            <button
              key={cycle}
              onClick={() => setBillingCycle(cycle)}
              className={`relative px-6 py-1.5 rounded-xl text-xs font-bold capitalize transition-all duration-300
              ${billingCycle === cycle ? "text-green-700" : "text-gray-400 hover:text-gray-600"}`}
            >
              {billingCycle === cycle && (
                <motion.div layoutId="activeTab" className="absolute inset-0 bg-white rounded-xl shadow-sm border border-slate-100" />
              )}
              <span className="relative z-10">{cycle}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-6 max-w-5xl mx-auto pb-10">
        {plans.map((plan, index) => {
          const currentFeatures = plan.isCurrent ? plan.features : plan.cycleFeatures[billingCycle];
          
          return (
            <motion.div
              key={index}
              layout
              className={`relative group p-6 w-full max-w-77.5 rounded-[2rem] bg-white/70 backdrop-blur-xl border-2 transition-all duration-500
              ${!plan.isCurrent ? 'border-green-500 shadow-xl ring-1 ring-green-400 scale-105' : 'border-slate-100 shadow-md'}`}
            >
              <div className="mb-3">
                {plan.isCurrent ? <ShieldCheck className="text-slate-400 h-6 w-6" /> : (
                  <>
                    {billingCycle === 'weekly' && <Zap className="text-yellow-500 h-8 w-8" />}
                    {billingCycle === 'monthly' && <Crown className="text-green-600 h-8 w-8" />}
                    {billingCycle === 'yearly' && <Infinity className="text-purple-600 h-8 w-8" />}
                  </>
                )}
              </div>

              <h3 className="font-black text-xl text-slate-800">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-3xl font-black text-slate-900">AED {plan.prices[billingCycle]}</span>
                <span className="text-slate-400 text-xs font-bold">/{billingCycle}</span>
              </div>

              <ul className="space-y-3 mb-6 min-h-40">
                <AnimatePresence mode="popLayout">
                  {currentFeatures.map((feature, i) => (
                    <motion.li
                      key={feature}
                      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                      className="flex gap-2 items-center text-slate-600 font-medium text-xs"
                    >
                      <div className="bg-green-100 p-0.5 rounded-full shrink-0">
                        <Check className="h-2.5 w-2.5 text-green-700 stroke-[4px]" />
                      </div>
                      {feature}
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>

              <Button 
                disabled={plan.isCurrent}
                onClick={handleMockPayment}
                className={`w-full py-5 text-md font-bold rounded-xl transition-all
                ${plan.isCurrent ? "bg-slate-100 text-slate-400" : "bg-slate-900 hover:bg-green-600 text-white shadow-lg"}`}
              >
                {plan.isCurrent ? "Active Plan" : `Unlock ${billingCycle} Pro`}
              </Button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export default UpgradePlans;