'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, ShieldCheck, Phone, MapPin } from 'lucide-react';

interface EmergencyOverlayProps {
  isVisible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

const EmergencyOverlay: React.FC<EmergencyOverlayProps> = ({ isVisible, onCancel, onConfirm }) => {
  const [countdown, setCountdown] = useState(15);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);

  const triggerEmergencyCall = () => {
    // Simple: Just redirect to emergency dialer
    console.log('📞 Redirecting to emergency number 100...');
    window.location.href = 'tel:100';
  };

  // Initialize audio context and play beep
  useEffect(() => {
    if (isVisible) {
      let ctx: AudioContext;
      let beepIntervalId: NodeJS.Timeout;

      try {
        // Create audio context
        const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
        ctx = new AudioContextClass();

        // Immediately resume context
        if (ctx.state === 'suspended') {
          ctx.resume();
        }

        // Play beep sound
        const playBeep = () => {
          try {
            // Ensure context is running
            if (ctx.state === 'suspended') {
              ctx.resume();
            }

            const now = ctx.currentTime;
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);

            oscillator.frequency.value = 800; // Hz
            oscillator.type = 'sine';

            // Immediate full volume
            gainNode.gain.setValueAtTime(1.0, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

            oscillator.start(now);
            oscillator.stop(now + 0.4);
          } catch (error) {
            console.error('Beep error:', error);
            // Fallback: use vibration
            if (navigator.vibrate) {
              navigator.vibrate(100);
            }
          }
        };

        // Play immediately
        playBeep();

        // Play every 800ms
        beepIntervalId = setInterval(playBeep, 800);
        setAudioContext(ctx);
      } catch (error) {
        console.error('Audio context error:', error);
        // Fallback: use vibration
        if (navigator.vibrate) {
          const vibrationPattern = [100, 50, 100];
          beepIntervalId = setInterval(() => {
            navigator.vibrate(vibrationPattern);
          }, 800);
        }
      }

      return () => {
        if (beepIntervalId) clearInterval(beepIntervalId);
      };
    }
  }, [isVisible]);

  // Reset countdown when visible
  useEffect(() => {
    if (isVisible) {
      setCountdown(15);
    }
  }, [isVisible]);

  // Countdown timer - decrement every second
  useEffect(() => {
    if (!isVisible) return;

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isVisible]);

  // Handle countdown completion - trigger call and confirm
  useEffect(() => {
    if (countdown <= 0 && isVisible) {
      triggerEmergencyCall();
      // Defer onConfirm to next render cycle to avoid setState-in-render
      Promise.resolve().then(() => onConfirm());
    }
  }, [countdown, isVisible, onConfirm]);

  const handleConfirmClick = () => {
    triggerEmergencyCall();
    onConfirm();
  };

  if (!isVisible && countdown !== 0) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/80 backdrop-blur-xl px-4"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="max-w-md w-full bg-white dark:bg-slate-900 rounded-[40px] p-10 shadow-2xl shadow-rose-500/20 border border-rose-500/30 text-center"
          >
            {/* Warning Icon with Pulsing Effect */}
            <div className="relative mb-8">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="w-24 h-24 bg-rose-500 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-rose-500/40 relative z-10"
              >
                <AlertTriangle size={48} className="text-white" />
              </motion.div>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-24 bg-rose-500/20 rounded-full blur-2xl animate-pulse" />
            </div>

            <h2 className="text-3xl font-black text-rose-500 mb-2 uppercase tracking-tight">
              Accident Detected!
            </h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium mb-10 leading-relaxed">
              We detected a heavy impact. Calling emergency services in...
            </p>

            {/* Countdown Circle */}
            <div className="relative w-40 h-40 mx-auto mb-12 flex items-center justify-center">
              <svg className="w-full h-full rotate-[-90deg]">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-slate-100 dark:text-slate-800"
                />
                <motion.circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray="440"
                  initial={{ strokeDashoffset: 0 }}
                  animate={{ strokeDashoffset: 440 - (440 * countdown) / 15 }}
                  className="text-rose-500"
                />
              </svg>
              <span className="absolute text-6xl font-black tabular-nums">
                {countdown}
              </span>
            </div>

            <div className="flex flex-col gap-4">
              <button
                onClick={handleConfirmClick}
                className="w-full py-5 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2 border border-rose-600 active:scale-95"
              >
                <Phone className="text-white" size={20} /> CALL NOW (100)
              </button>

              <button
                onClick={onCancel}
                className="w-full py-5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700 active:scale-95"
              >
                <ShieldCheck className="text-green-500" /> I'M OKAY, CANCEL
              </button>
              
              <p className="text-xs text-slate-400 font-medium tracking-tight">
                📍 Your location will be sent to Apollo Premier Hospital and your emergency contacts.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EmergencyOverlay;
