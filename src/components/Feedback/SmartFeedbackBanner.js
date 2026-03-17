// src/components/Feedback/SmartFeedbackBanner.js
import React, { useState } from "react";
import "./SmartFeedbackBanner.css";

/**
 * Smart Feedback Banner Component
 * Shows contextual feedback prompts based on user behavior
 *
 * Banner Types:
 * - engagement: First feedback encouragement
 * - inactivity: Reminder after 30 days
 * - compact: Replaces full feedback overview when count = 0
 */
const SmartFeedbackBanner = ({
  type = 'engagement',
  onAction,
  onDismiss,
  isVisible = true
}) => {
  const [dismissed, setDismissed] = useState(false);

  if (!isVisible || dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  const getBannerContent = () => {
    switch (type) {
      case 'engagement':
        return {
          icon: '⭐',
          title: 'Leave your first review!',
          message: 'Share your rental experience and unlock renter badges',
          actionText: 'Share Feedback',
          gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          bgColor: '#f0f4ff'
        };

      case 'inactivity':
        return {
          icon: '🔍',
          title: "Haven't rented recently?",
          message: 'Browse new equipment and share feedback on your last experience',
          actionText: 'Browse Equipment',
          gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          bgColor: '#fff5f8'
        };

      case 'compact':
        return {
          icon: '💬',
          title: 'No feedback yet',
          message: 'Be the first to share your rental experience',
          actionText: 'Share Feedback',
          gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          bgColor: '#f0fbff'
        };

      default:
        return {
          icon: '📝',
          title: 'Share Your Feedback',
          message: 'Help us improve your experience',
          actionText: 'Give Feedback',
          gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
          bgColor: '#fff9f0'
        };
    }
  };

  const content = getBannerContent();

  return (
    <div className="smart-feedback-banner" style={{ backgroundColor: content.bgColor }}>
      <div className="banner-content">
        <div className="banner-icon" style={{ background: content.gradient }}>
          {content.icon}
        </div>

        <div className="banner-text">
          <h4>{content.title}</h4>
          <p>{content.message}</p>
        </div>
      </div>

      <div className="banner-actions">
        <button
          className="banner-action-btn"
          onClick={onAction}
          style={{ background: content.gradient }}
        >
          {content.actionText}
          <i className="bi bi-arrow-right ms-2" />
        </button>

        <button className="banner-dismiss-btn" onClick={handleDismiss}>
          <i className="bi bi-x-lg" />
        </button>
      </div>
    </div>
  );
};

export default SmartFeedbackBanner;
