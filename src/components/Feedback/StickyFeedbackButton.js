// src/components/Feedback/StickyFeedbackButton.js
import React from "react";
import "./StickyFeedbackButton.css";

/**
 * Sticky Feedback Button for Mobile
 * Always visible at the bottom of the screen on mobile devices
 * Provides easy access to feedback system
 */
const StickyFeedbackButton = ({ onClick, isMobile = false }) => {
  if (!isMobile) return null;

  return (
    <button
      className="sticky-feedback-btn"
      onClick={onClick}
      aria-label="Share Feedback"
    >
      <div className="btn-icon">
        <i className="bi bi-chat-square-text" />
      </div>
      <span className="btn-text">Share Feedback</span>
      <div className="pulse-ring" />
    </button>
  );
};

export default StickyFeedbackButton;
