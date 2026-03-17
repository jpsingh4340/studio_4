// src/hooks/useFeedbackTriggers.js
import { useState, useEffect, useCallback } from "react";

/**
 * Smart Feedback Trigger System
 * Manages behavioral UX patterns for the feedback system
 *
 * Trigger Types:
 * 1. Post-Rental: After completing a rental
 * 2. Engagement: Based on login frequency without feedback
 * 3. Dashboard Relevance: Show/hide based on feedback count
 * 4. Emotional Timing: Celebrate milestones
 * 5. Inactivity: Remind after extended inactivity
 */

const STORAGE_KEYS = {
  LOGIN_COUNT: 'rentmate_login_count',
  LAST_LOGIN: 'rentmate_last_login',
  LAST_RENTAL_DATE: 'rentmate_last_rental_date',
  FIRST_FEEDBACK_SHOWN: 'rentmate_first_feedback_shown',
  POST_RENTAL_SHOWN: 'rentmate_post_rental_shown',
  MILESTONE_SHOWN: 'rentmate_milestone_shown',
  INACTIVITY_SHOWN: 'rentmate_inactivity_shown',
};

const DELAYS = {
  POST_RENTAL: 3000, // 3 seconds after viewing completed rental
  ENGAGEMENT_BANNER: 2000, // 2 seconds on dashboard load
  MILESTONE_TOAST: 1500, // 1.5 seconds after detecting milestone
};

const THRESHOLDS = {
  MIN_LOGIN_FOR_ENGAGEMENT: 3,
  MILESTONE_RENTALS: 3,
  MILESTONE_SPENDING: 1000,
  INACTIVITY_DAYS: 30,
};

export const useFeedbackTriggers = ({
  currentUser,
  rentalHistory = [],
  feedbackStats = { totalCount: 0 },
  stats = { totalRentals: 0, totalSpent: 0 },
}) => {
  const [triggers, setTriggers] = useState({
    showPostRentalPrompt: false,
    showEngagementBanner: false,
    showMilestoneToast: false,
    showInactivityReminder: false,
    selectedRental: null,
    milestoneType: null,
    showFeedbackOverview: true,
  });

  // Track login count
  useEffect(() => {
    if (!currentUser) return;

    const loginCount = parseInt(localStorage.getItem(STORAGE_KEYS.LOGIN_COUNT) || '0');
    const lastLogin = localStorage.getItem(STORAGE_KEYS.LAST_LOGIN);
    const today = new Date().toDateString();

    // Only increment if it's a new day
    if (lastLogin !== today) {
      localStorage.setItem(STORAGE_KEYS.LOGIN_COUNT, String(loginCount + 1));
      localStorage.setItem(STORAGE_KEYS.LAST_LOGIN, today);
    }
  }, [currentUser]);

  // 1. POST-RENTAL TRIGGER
  // Show prompt 3 seconds after viewing completed rental summary
  useEffect(() => {
    if (!currentUser || !rentalHistory.length) return;

    const completedRentals = rentalHistory.filter(r => r.status === 'completed');
    const lastCompleted = completedRentals[0];

    if (lastCompleted) {
      const hasShownForRental = localStorage.getItem(
        `${STORAGE_KEYS.POST_RENTAL_SHOWN}_${lastCompleted.id}`
      );

      if (!hasShownForRental) {
        const timer = setTimeout(() => {
          setTriggers(prev => ({
            ...prev,
            showPostRentalPrompt: true,
            selectedRental: lastCompleted,
          }));
        }, DELAYS.POST_RENTAL);

        return () => clearTimeout(timer);
      }
    }
  }, [currentUser, rentalHistory]);

  // 2. ENGAGEMENT TRIGGER
  // Show banner if user has logged in 3+ times but has no feedback
  useEffect(() => {
    if (!currentUser) return;

    const loginCount = parseInt(localStorage.getItem(STORAGE_KEYS.LOGIN_COUNT) || '0');
    const hasShownBanner = localStorage.getItem(STORAGE_KEYS.FIRST_FEEDBACK_SHOWN);

    if (
      loginCount >= THRESHOLDS.MIN_LOGIN_FOR_ENGAGEMENT &&
      feedbackStats.totalCount === 0 &&
      !hasShownBanner
    ) {
      const timer = setTimeout(() => {
        setTriggers(prev => ({
          ...prev,
          showEngagementBanner: true,
        }));
      }, DELAYS.ENGAGEMENT_BANNER);

      return () => clearTimeout(timer);
    }
  }, [currentUser, feedbackStats.totalCount]);

  // 3. DASHBOARD RELEVANCE TRIGGER
  // Show/hide feedback overview based on feedback count
  useEffect(() => {
    if (feedbackStats.totalCount > 0) {
      setTriggers(prev => ({ ...prev, showFeedbackOverview: true }));
    } else {
      setTriggers(prev => ({ ...prev, showFeedbackOverview: false }));
    }
  }, [feedbackStats.totalCount]);

  // 4. EMOTIONAL TIMING TRIGGER
  // Celebrate milestones (3 rentals or $1000 spent)
  useEffect(() => {
    if (!currentUser) return;

    const hasShownMilestone = localStorage.getItem(STORAGE_KEYS.MILESTONE_SHOWN);

    // Check for rental milestone
    if (
      stats.totalRentals === THRESHOLDS.MILESTONE_RENTALS &&
      !hasShownMilestone
    ) {
      const timer = setTimeout(() => {
        setTriggers(prev => ({
          ...prev,
          showMilestoneToast: true,
          milestoneType: 'rentals',
        }));
        localStorage.setItem(STORAGE_KEYS.MILESTONE_SHOWN, 'rentals');
      }, DELAYS.MILESTONE_TOAST);

      return () => clearTimeout(timer);
    }

    // Check for spending milestone
    if (
      stats.totalSpent >= THRESHOLDS.MILESTONE_SPENDING &&
      !hasShownMilestone
    ) {
      const timer = setTimeout(() => {
        setTriggers(prev => ({
          ...prev,
          showMilestoneToast: true,
          milestoneType: 'spending',
        }));
        localStorage.setItem(STORAGE_KEYS.MILESTONE_SHOWN, 'spending');
      }, DELAYS.MILESTONE_TOAST);

      return () => clearTimeout(timer);
    }
  }, [currentUser, stats.totalRentals, stats.totalSpent]);

  // 5. INACTIVITY TRIGGER
  // Show reminder after 30 days of no rentals
  useEffect(() => {
    if (!currentUser) return;

    const lastRentalDate = localStorage.getItem(STORAGE_KEYS.LAST_RENTAL_DATE);
    const hasShownInactivity = sessionStorage.getItem(STORAGE_KEYS.INACTIVITY_SHOWN);

    if (lastRentalDate && !hasShownInactivity) {
      const daysSinceLastRental = Math.floor(
        (new Date() - new Date(lastRentalDate)) / (1000 * 60 * 60 * 24)
      );

      if (daysSinceLastRental >= THRESHOLDS.INACTIVITY_DAYS) {
        setTriggers(prev => ({
          ...prev,
          showInactivityReminder: true,
        }));
        sessionStorage.setItem(STORAGE_KEYS.INACTIVITY_SHOWN, 'true');
      }
    }

    // Update last rental date when rentals exist
    if (rentalHistory.length > 0) {
      const latestRental = rentalHistory.reduce((latest, rental) => {
        const rentalDate = rental.endDate?.toDate?.() || new Date(rental.endDate);
        const latestDate = latest?.toDate?.() || new Date(latest);
        return rentalDate > latestDate ? rental.endDate : latest;
      }, rentalHistory[0].endDate);

      const latestDateString = (latestRental?.toDate?.() || new Date(latestRental)).toISOString();
      localStorage.setItem(STORAGE_KEYS.LAST_RENTAL_DATE, latestDateString);
    }
  }, [currentUser, rentalHistory]);

  // Action handlers
  const dismissPostRentalPrompt = useCallback((rentalId) => {
    if (rentalId) {
      localStorage.setItem(`${STORAGE_KEYS.POST_RENTAL_SHOWN}_${rentalId}`, 'true');
    }
    setTriggers(prev => ({
      ...prev,
      showPostRentalPrompt: false,
      selectedRental: null,
    }));
  }, []);

  const dismissEngagementBanner = useCallback(() => {
    localStorage.setItem(STORAGE_KEYS.FIRST_FEEDBACK_SHOWN, 'true');
    setTriggers(prev => ({
      ...prev,
      showEngagementBanner: false,
    }));
  }, []);

  const dismissMilestoneToast = useCallback(() => {
    setTriggers(prev => ({
      ...prev,
      showMilestoneToast: false,
      milestoneType: null,
    }));
  }, []);

  const dismissInactivityReminder = useCallback(() => {
    setTriggers(prev => ({
      ...prev,
      showInactivityReminder: false,
    }));
  }, []);

  return {
    triggers,
    dismissPostRentalPrompt,
    dismissEngagementBanner,
    dismissMilestoneToast,
    dismissInactivityReminder,
  };
};

export default useFeedbackTriggers;
