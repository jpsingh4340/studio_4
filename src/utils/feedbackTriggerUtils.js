// src/utils/feedbackTriggerUtils.js

/**
 * Utility functions for managing and testing Smart Feedback Triggers
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

/**
 * Reset all feedback trigger states
 * Useful for testing or when user wants to see triggers again
 */
export const resetAllTriggers = () => {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });

  // Clear all post-rental shown flags
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith(STORAGE_KEYS.POST_RENTAL_SHOWN)) {
      localStorage.removeItem(key);
    }
  });

  console.log('✅ All feedback triggers have been reset');
};

/**
 * Reset specific trigger
 */
export const resetTrigger = (triggerName) => {
  const triggerMap = {
    'post-rental': STORAGE_KEYS.POST_RENTAL_SHOWN,
    'engagement': STORAGE_KEYS.FIRST_FEEDBACK_SHOWN,
    'milestone': STORAGE_KEYS.MILESTONE_SHOWN,
    'inactivity': STORAGE_KEYS.INACTIVITY_SHOWN,
    'login': STORAGE_KEYS.LOGIN_COUNT,
  };

  const key = triggerMap[triggerName];
  if (key) {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
    console.log(`✅ ${triggerName} trigger has been reset`);
  } else {
    console.warn(`⚠️ Unknown trigger: ${triggerName}`);
  }
};

/**
 * Force show engagement banner (for testing)
 */
export const forceEngagementBanner = () => {
  localStorage.removeItem(STORAGE_KEYS.FIRST_FEEDBACK_SHOWN);
  localStorage.setItem(STORAGE_KEYS.LOGIN_COUNT, '3');
  console.log('✅ Engagement banner will show on next dashboard load');
};

/**
 * Force show milestone toast (for testing)
 */
export const forceMilestoneToast = (type = 'rentals') => {
  localStorage.removeItem(STORAGE_KEYS.MILESTONE_SHOWN);
  console.log(`✅ ${type} milestone toast will show on next dashboard load`);
  console.log('Note: Ensure your stats match the milestone threshold');
};

/**
 * Force show inactivity reminder (for testing)
 */
export const forceInactivityReminder = () => {
  const oldDate = new Date(Date.now() - 31 * 24 * 60 * 60 * 1000);
  localStorage.setItem(STORAGE_KEYS.LAST_RENTAL_DATE, oldDate.toISOString());
  sessionStorage.removeItem(STORAGE_KEYS.INACTIVITY_SHOWN);
  console.log('✅ Inactivity reminder will show on next dashboard load');
};

/**
 * Get current trigger states
 */
export const getTriggerStates = () => {
  const states = {
    loginCount: parseInt(localStorage.getItem(STORAGE_KEYS.LOGIN_COUNT) || '0'),
    lastLogin: localStorage.getItem(STORAGE_KEYS.LAST_LOGIN),
    lastRentalDate: localStorage.getItem(STORAGE_KEYS.LAST_RENTAL_DATE),
    engagementBannerShown: !!localStorage.getItem(STORAGE_KEYS.FIRST_FEEDBACK_SHOWN),
    milestoneShown: localStorage.getItem(STORAGE_KEYS.MILESTONE_SHOWN),
    inactivityShownThisSession: !!sessionStorage.getItem(STORAGE_KEYS.INACTIVITY_SHOWN),
  };

  console.table(states);
  return states;
};

/**
 * Set login count (for testing)
 */
export const setLoginCount = (count) => {
  localStorage.setItem(STORAGE_KEYS.LOGIN_COUNT, String(count));
  console.log(`✅ Login count set to ${count}`);
};

/**
 * Simulate rental completion (for testing post-rental trigger)
 */
export const simulateRentalCompletion = (rentalId = 'test-rental-001') => {
  localStorage.removeItem(`${STORAGE_KEYS.POST_RENTAL_SHOWN}_${rentalId}`);
  console.log(`✅ Post-rental prompt will show for rental ID: ${rentalId}`);
  console.log('Navigate to "My Rentals" tab and ensure rental status is "completed"');
};

/**
 * Clear all rental-specific tracking
 */
export const clearRentalTracking = () => {
  Object.keys(localStorage).forEach(key => {
    if (key.includes('rental')) {
      localStorage.removeItem(key);
    }
  });
  console.log('✅ All rental tracking cleared');
};

/**
 * Enable debug mode for triggers
 * Logs all trigger events to console
 */
export const enableTriggerDebug = () => {
  window.RENTMATE_DEBUG_TRIGGERS = true;
  console.log('🐛 Trigger debug mode enabled');
  console.log('All trigger events will be logged to console');
};

/**
 * Disable debug mode
 */
export const disableTriggerDebug = () => {
  window.RENTMATE_DEBUG_TRIGGERS = false;
  console.log('🐛 Trigger debug mode disabled');
};

/**
 * Export all trigger data (for debugging)
 */
export const exportTriggerData = () => {
  const data = {
    localStorage: {},
    sessionStorage: {},
  };

  Object.keys(localStorage).forEach(key => {
    if (key.includes('rentmate')) {
      data.localStorage[key] = localStorage.getItem(key);
    }
  });

  Object.keys(sessionStorage).forEach(key => {
    if (key.includes('rentmate')) {
      data.sessionStorage[key] = sessionStorage.getItem(key);
    }
  });

  console.log('📦 Trigger Data Export:');
  console.log(JSON.stringify(data, null, 2));
  return data;
};

/**
 * Import trigger data (for debugging)
 */
export const importTriggerData = (data) => {
  if (data.localStorage) {
    Object.entries(data.localStorage).forEach(([key, value]) => {
      localStorage.setItem(key, value);
    });
  }

  if (data.sessionStorage) {
    Object.entries(data.sessionStorage).forEach(([key, value]) => {
      sessionStorage.setItem(key, value);
    });
  }

  console.log('✅ Trigger data imported successfully');
};

// Make utilities available in browser console for testing
if (typeof window !== 'undefined') {
  window.RentMateTriggers = {
    reset: resetAllTriggers,
    resetTrigger,
    forceEngagement: forceEngagementBanner,
    forceMilestone: forceMilestoneToast,
    forceInactivity: forceInactivityReminder,
    getStates: getTriggerStates,
    setLoginCount,
    simulateRental: simulateRentalCompletion,
    clearRentals: clearRentalTracking,
    enableDebug: enableTriggerDebug,
    disableDebug: disableTriggerDebug,
    export: exportTriggerData,
    import: importTriggerData,
  };

  console.log(`
🎯 RentMate Trigger Utils Loaded!

Available commands in console:
  RentMateTriggers.reset()              - Reset all triggers
  RentMateTriggers.forceEngagement()    - Force engagement banner
  RentMateTriggers.forceMilestone()     - Force milestone toast
  RentMateTriggers.forceInactivity()    - Force inactivity reminder
  RentMateTriggers.getStates()          - View current states
  RentMateTriggers.setLoginCount(n)     - Set login count
  RentMateTriggers.simulateRental(id)   - Simulate rental completion
  RentMateTriggers.enableDebug()        - Enable debug logging
  RentMateTriggers.export()             - Export trigger data
  `);
}

export default {
  resetAllTriggers,
  resetTrigger,
  forceEngagementBanner,
  forceMilestoneToast,
  forceInactivityReminder,
  getTriggerStates,
  setLoginCount,
  simulateRentalCompletion,
  clearRentalTracking,
  enableTriggerDebug,
  disableTriggerDebug,
  exportTriggerData,
  importTriggerData,
};
