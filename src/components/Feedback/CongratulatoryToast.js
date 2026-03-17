// src/components/Feedback/CongratulatoryToast.js
import React, { useEffect, useState } from "react";
import "./CongratulatoryToast.css";

/**
 * Congratulatory Toast Component
 * Appears when user reaches milestones (3 rentals or $1000 spent)
 * Auto-dismisses after 8 seconds unless user interacts
 */
const CongratulatoryToast = ({
  isVisible,
  milestoneType,
  onAction,
  onDismiss
}) => {
  const [show, setShow] = useState(false);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (isVisible) {
      setShow(true);

      // Progress bar animation
      const duration = 8000; // 8 seconds
      const interval = 50;
      const decrement = (interval / duration) * 100;

      const timer = setInterval(() => {
        setProgress((prev) => {
          const next = prev - decrement;
          if (next <= 0) {
            clearInterval(timer);
            handleDismiss();
            return 0;
          }
          return next;
        });
      }, interval);

      return () => clearInterval(timer);
    }
  }, [isVisible]);

  const handleDismiss = () => {
    setShow(false);
    setTimeout(() => {
      onDismiss();
      setProgress(100);
    }, 300);
  };

  const handleAction = () => {
    setShow(false);
    setTimeout(() => {
      onAction();
      setProgress(100);
    }, 300);
  };

  if (!isVisible) return null;

  const getMilestoneContent = () => {
    switch (milestoneType) {
      case 'rentals':
        return {
          emoji: '🎉',
          title: "Congratulations!",
          message: "You've completed 3 rentals!",
          subtitle: "Tell us what you loved most.",
          gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        };

      case 'spending':
        return {
          emoji: '💎',
          title: "Amazing!",
          message: "You've spent over $1,000!",
          subtitle: "Share your favorite equipment experience.",
          gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        };

      default:
        return {
          emoji: '⭐',
          title: "Great Job!",
          message: "You're an active member!",
          subtitle: "We'd love to hear your thoughts.",
          gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        };
    }
  };

  const content = getMilestoneContent();

  return (
    <div className={`congratulatory-toast ${show ? 'visible' : ''}`}>
      <div className="toast-container" style={{ background: content.gradient }}>
        {/* Confetti animation */}
        <div className="confetti-container">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="confetti" style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 0.5}s`,
              animationDuration: `${2 + Math.random()}s`
            }} />
          ))}
        </div>

        {/* Content */}
        <div className="toast-content">
          <div className="toast-emoji">{content.emoji}</div>

          <div className="toast-text">
            <h3>{content.title}</h3>
            <p className="toast-message">{content.message}</p>
            <p className="toast-subtitle">{content.subtitle}</p>
          </div>

          <button className="toast-dismiss" onClick={handleDismiss}>
            <i className="bi bi-x-lg" />
          </button>
        </div>

        {/* Action button */}
        <button className="toast-action-btn" onClick={handleAction}>
          <i className="bi bi-chat-square-text me-2" />
          Share Feedback
        </button>

        {/* Progress bar */}
        <div className="toast-progress">
          <div
            className="toast-progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default CongratulatoryToast;
