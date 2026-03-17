import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./FeedbackModal.css";

// Define icons for different modal statuses
const ICONS = {
  success: (
    <svg
      className="icon success"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M5 13l4 4L19 7"
      />
    </svg>
  ),
  error: (
    <svg
      className="icon error"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  ),
  info: (
    <svg
      className="icon info"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12" y2="16" />
    </svg>
  ),
};

const FeedbackModal = ({
  isOpen, // Controls visibility of modal
  onClose, // Function to close modal
  title = "Success!", // Modal title
  message = "Action completed successfully.", // Modal message
  redirectPath = null, // Optional path to redirect on close
  status = "success", // success | error | info
  autoClose = true, // Automatically close modal after delay
  delay = 5000, // Delay before auto-close in ms
}) => {
  const [visible, setVisible] = useState(false); // Local visibility state for animation
  const navigate = useNavigate(); // React Router navigation hook

  // Effect: Show modal and start timer if autoClose is enabled
  useEffect(() => {
    let timer;
    if (isOpen) {
      setVisible(true);
      if (autoClose) {
        timer = setTimeout(() => handleClose(), delay);
      }
    }
    return () => clearTimeout(timer); // Cleanup on unmount or isOpen change
  }, [isOpen, autoClose, delay]);

  // Handle closing modal and redirect if needed
  const handleClose = () => {
    setVisible(false);
    setTimeout(() => {
      onClose(); // Trigger parent onClose handler
      if (redirectPath) navigate(redirectPath); // Redirect if specified
    }, 300); // Delay to allow fade-out animation
  };

  // Don't render if not open
  if (!isOpen) return null;

  return (
    <div
      className={`feedback-overlay ${visible ? "visible" : ""}`}
      onClick={handleClose}
    >
      <div
        className={`feedback-modal ${visible ? "visible" : ""} ${status}`}
        onClick={e => e.stopPropagation()} // Prevent closing when clicking inside modal
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <header className="modal-header">
          {ICONS[status]} {/* Display appropriate status icon */}
          <button
            className="close-btn"
            onClick={handleClose}
            aria-label="Close"
          >
            ×
          </button>
        </header>

        {/* Modal Body */}
        <main className="modal-body">
          <h2>{title}</h2>
          <p>{message}</p>
        </main>

        {/* Modal Footer */}
        <footer className="modal-footer">
          <button className="primary-button" onClick={handleClose}>
            Continue
          </button>
        </footer>

        {/* Progress bar animation for auto-close */}
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ animationDuration: `${delay}ms` }}
           />
        </div>
      </div>
    </div>
  );
};

export default FeedbackModal;
