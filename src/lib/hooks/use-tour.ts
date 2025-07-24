import { useState, useEffect } from 'react';
import { tourApiResponse, tourQueryHistory } from '@/app/dummy-data/tour-data';

/**
 * Hook for managing onboarding tour state and functionality
 */
export function useTour() {
  const [showTour, setShowTour] = useState(false);
  const [isTourMode, setIsTourMode] = useState(false);
  const [showTourDelayed, setShowTourDelayed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Check for tour completion after component mounts
  useEffect(() => {
    if (!mounted) return;

    // Check if user has seen the tour before
    const hasSeenTour = localStorage.getItem("knowledge-base-tour-completed");
    if (!hasSeenTour) {
      setShowTour(true);
      setIsTourMode(true);
    }
  }, [mounted]);

  // Show tour data when tour is active
  useEffect(() => {
    if (showTour && !isTourMode) {
      setIsTourMode(true);
    }
  }, [showTour]);

  const handleTourComplete = () => {
    setShowTour(false);
    setIsTourMode(false);
    setShowTourDelayed(false);
    localStorage.setItem("knowledge-base-tour-completed", "true");
  };

  const startTour = () => {
    setShowTour(true);
    setIsTourMode(true);
  };

  const handleOpeningComplete = () => {
    // Show main UI immediately, but delay the tour
    setTimeout(() => {
      const hasSeenTour = localStorage.getItem("knowledge-base-tour-completed");
      if (!hasSeenTour) {
        setShowTourDelayed(true);
        setShowTour(true);
        setIsTourMode(true);
      }
    }, 3500); // 3.5 seconds delay
  };

  // Get tour data when in tour mode
  const getTourData = () => {
    if (isTourMode) {
      return {
        dbResponse: tourApiResponse,
        history: tourQueryHistory,
      };
    }
    return {
      dbResponse: null,
      history: [],
    };
  };

  return {
    showTour,
    isTourMode,
    showTourDelayed,
    mounted,
    handleTourComplete,
    startTour,
    handleOpeningComplete,
    getTourData,
  };
}