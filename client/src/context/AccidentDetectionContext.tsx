'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAccidentDetection } from '@/hooks/useAccidentDetection';
import EmergencyOverlay from '@/components/emergency/EmergencyOverlay';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';

interface AccidentDetectionContextType {
  isMonitoring: boolean;
  isPermissionGranted: boolean;
  triggerEmergencyManually: () => void;
}

const AccidentDetectionContext = createContext<AccidentDetectionContextType | undefined>(undefined);

export const AccidentDetectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);
  const [isSessionSilenced, setIsSessionSilenced] = useState(false);
  const [isDetectionActive, setIsDetectionActive] = useState(false); // Prevent multiple detections
  const { user } = useAuth();

  const handleDetected = useCallback(() => {
    if (!isVisible && !isSessionSilenced && !isDetectionActive) {
      setIsDetectionActive(true); // Lock further detections
      setIsVisible(true);
    }
  }, [isVisible, isSessionSilenced, isDetectionActive]);

  const { requestPermission } = useAccidentDetection({
    threshold: 25, // Real accident threshold (car crash typically 10-20G)
    onDetected: handleDetected,
    enabled: isMonitoring && !isVisible, // Disable motion detection while overlay is open
  });

  const triggerEmergencyManually = () => {
    handleDetected();
  };

  // Request permission on first touch for iOS, start immediately for Android
  useEffect(() => {
    let permissionRequested = false;

    // Check if iOS
    const isIOS = typeof (DeviceMotionEvent as any).requestPermission === 'function';

    if (!isIOS) {
      // Android - start immediately
      setIsPermissionGranted(true);
      setIsMonitoring(true);
    } else {
      // iOS - wait for first interaction
      const handleFirstInteraction = () => {
        if (permissionRequested) return;
        permissionRequested = true;

        (DeviceMotionEvent as any).requestPermission()
          .then((permission: string) => {
            if (permission === 'granted') {
              setIsPermissionGranted(true);
              setIsMonitoring(true);
            }
          })
          .catch((err: any) => console.error('Permission error:', err));

        document.removeEventListener('touchstart', handleFirstInteraction);
        document.removeEventListener('click', handleFirstInteraction);
      };

      document.addEventListener('touchstart', handleFirstInteraction);
      document.addEventListener('click', handleFirstInteraction);

      return () => {
        document.removeEventListener('touchstart', handleFirstInteraction);
        document.removeEventListener('click', handleFirstInteraction);
      };
    }
  }, []);

  const handleConfirm = async () => {
    setIsVisible(false);
    setIsDetectionActive(false);
    
    // Get location
    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        const { latitude, longitude } = position.coords;
        
        // Trigger backend emergency (if endpoint exists)
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const token = localStorage.getItem('token');
        
        try {
          await axios.post(`${API_URL}/emergency`, {
            latitude,
            longitude,
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });
          console.log('Emergency request sent to backend');
        } catch (apiError: any) {
          // Emergency endpoint may not exist - that's okay, the call was already made
          if (apiError.response?.status === 404) {
            console.log('Emergency endpoint not available on backend, but call was initiated');
          } else {
            console.error('Failed to send emergency request:', apiError);
          }
        }
      } catch (error) {
        console.error('Failed to get location for emergency:', error);
      }
    });
  };

  const handleCancel = () => {
    setIsVisible(false);
    setIsDetectionActive(false);
    setIsSessionSilenced(true); // Silence for this session
  };

  // Auto-reset detection system after 2 minutes
  useEffect(() => {
    if (isDetectionActive) {
      const resetTimer = setTimeout(() => {
        console.log('🔄 Auto-resetting detection system after 2 minutes');
        setIsDetectionActive(false);
        setIsSessionSilenced(false);
      }, 120000); // 2 minutes

      return () => clearTimeout(resetTimer);
    }
  }, [isDetectionActive]);

  return (
    <AccidentDetectionContext.Provider value={{ isMonitoring, isPermissionGranted, triggerEmergencyManually }}>
      {children}
      <EmergencyOverlay 
        isVisible={isVisible} 
        onCancel={handleCancel} 
        onConfirm={handleConfirm}
      />
    </AccidentDetectionContext.Provider>
  );
};

export const useAccidentSystem = () => {
  const context = useContext(AccidentDetectionContext);
  if (!context) throw new Error('useAccidentSystem must be used within AccidentDetectionProvider');
  return context;
};
