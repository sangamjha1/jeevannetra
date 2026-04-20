'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface AccidentDetectionOptions {
  threshold?: number; // G-force threshold
  onDetected?: () => void;
  enabled?: boolean;
}

export const useAccidentDetection = (options: AccidentDetectionOptions = {}) => {
  const { threshold = 25, onDetected, enabled = false } = options;
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);
  const [lastAcceleration, setLastAcceleration] = useState({ x: 0, y: 0, z: 0 });
  const [maxGForce, setMaxGForce] = useState(0);
  const listenerRef = useRef<((event: DeviceMotionEvent) => void) | null>(null);
  const detectedRef = useRef(false); // Prevent multiple rapid detections

  const requestPermission = async () => {
    // DeviceMotionEvent.requestPermission is required for iOS 13+
    if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
      try {
        const permissionState = await (DeviceMotionEvent as any).requestPermission();
        if (permissionState === 'granted') {
          setIsPermissionGranted(true);
          return true;
        }
      } catch (error) {
        console.error('Error requesting motion permission:', error);
      }
      return false;
    } else {
      // Android / Older browsers
      setIsPermissionGranted(true);
      return true;
    }
  };

  const handleMotion = useCallback((event: DeviceMotionEvent) => {
    // Prevent rapid multiple detections
    if (detectedRef.current) return;

    const acc = event.accelerationIncludingGravity;
    if (!acc) return;

    const { x, y, z } = acc;
    if (x === null || y === null || z === null) return;

    // Calculate total G-Force
    const totalAcceleration = Math.sqrt(x * x + y * y + z * z);
    
    setMaxGForce((prev) => (totalAcceleration > prev ? totalAcceleration : prev));

    // Debug logging only for high G-forces
    if (totalAcceleration > 8) {
      console.log(`⚠️ G-Force: ${totalAcceleration.toFixed(2)}G (Threshold: ${threshold}G)`);
    }

    if (totalAcceleration > threshold) {
      console.log(`🚨 ACCIDENT DETECTED! ${totalAcceleration.toFixed(2)}G > ${threshold}G`);
      
      // Mark as detected to prevent duplicate calls
      detectedRef.current = true;
      
      // Call detection callback
      if (onDetected) onDetected();
    }

    setLastAcceleration({ x, y, z });
  }, [threshold, onDetected]);

  useEffect(() => {
    if (enabled) {
      // Reset detection flag when enabled
      detectedRef.current = false;
      
      const handleMotionWrapper = (event: DeviceMotionEvent) => {
        handleMotion(event);
      };
      
      listenerRef.current = handleMotionWrapper;
      window.addEventListener('devicemotion', handleMotionWrapper);
      
      return () => {
        window.removeEventListener('devicemotion', handleMotionWrapper);
        listenerRef.current = null;
      };
    }
  }, [enabled, handleMotion]);

  return {
    isPermissionGranted,
    requestPermission,
    lastAcceleration,
    maxGForce,
  };
};
