'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { useAccidentSystem } from '@/context/AccidentDetectionContext';
import { useAccidentDetection } from '@/hooks/useAccidentDetection';

export default function AccidentDetectionIndicator() {
  const { isMonitoring, isPermissionGranted } = useAccidentSystem();
  const { maxGForce } = useAccidentDetection({ enabled: isMonitoring });
  const [gForceAlert, setGForceAlert] = useState(false);

  // Alert if G-force is high
  useEffect(() => {
    if (maxGForce > 10) {
      setGForceAlert(true);
      setTimeout(() => setGForceAlert(false), 2000);
    }
  }, [maxGForce]);

  if (!isPermissionGranted || !isMonitoring) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2"
    >
      {/* G-Force Display */}
      <motion.div
        animate={gForceAlert ? { scale: 1.1 } : { scale: 1 }}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono font-bold backdrop-blur transition-colors ${
          maxGForce > 15
            ? 'bg-red-500/90 text-white'
            : maxGForce > 10
            ? 'bg-amber-500/90 text-white'
            : 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400'
        }`}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <AlertTriangle size={12} />
        </motion.div>
        <span>
          {maxGForce.toFixed(1)}G
          {maxGForce > 15 && ' 🚨 HIGH'}
          {maxGForce > 10 && maxGForce <= 15 && ' ⚠️ ALERT'}
        </span>
      </motion.div>

      {/* Status Indicator */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900/80 dark:bg-slate-800/80 text-emerald-400 backdrop-blur border border-emerald-500/20">
        <motion.div
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="w-2 h-2 rounded-full bg-emerald-500"
        />
        <span>Accident Detection Active</span>
      </div>
    </motion.div>
  );
}
