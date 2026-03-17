// src/components/Feedback/PostRentalPrompt.js
import React, { useEffect, useState } from "react";
import "./PostRentalPrompt.css";

/**
 * Post-Rental Feedback Prompt
 * Appears 3 seconds after viewing completed rental
 * Can be displayed as modal (desktop) or bottom sheet (mobile)
 */
const PostRentalPrompt = ({
  isOpen,
  rental,
  onSubmitFeedback,
  onDismiss,
  isMobile = false
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Delay for smooth animation
      setTimeout(() => setIsVisible(true), 100);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  if (!isOpen || !rental) return null;

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(onDismiss, 300);
  };

  const handleSubmit = () => {
    setIsVisible(false);
    setTimeout(() => onSubmitFeedback(rental), 300);
  };

  return (
    <div
      className={`post-rental-overlay ${isVisible ? 'visible' : ''}`}
      onClick={handleDismiss}
    >
      <div
        className={`post-rental-prompt ${isMobile ? 'bottom-sheet' : 'modal'} ${isVisible ? 'visible' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="prompt-header">
          <div className="icon-circle">
            <i className="bi bi-star-fill" />
          </div>
          <button className="close-btn" onClick={handleDismiss} aria-label="Close">
            <i className="bi bi-x-lg" />
          </button>
        </div>

        {/* Content */}
        <div className="prompt-content">
          <h3>How was your rental experience?</h3>
          <p className="equipment-name">{rental.equipmentName}</p>
          <p className="owner-name">from {rental.ownerName}</p>

          <p className="prompt-message">
            Your feedback helps other renters make informed decisions and helps owners improve their service.
          </p>

          {/* Quick rating preview */}
          <div className="quick-rating">
            {[1, 2, 3, 4, 5].map((star) => (
              <i key={star} className="bi bi-star" />
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="prompt-actions">
          <button
            className="btn-submit"
            onClick={handleSubmit}
          >
            <i className="bi bi-chat-square-text me-2" />
            Share Feedback
          </button>
          <button
            className="btn-later"
            onClick={handleDismiss}
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostRentalPrompt;
