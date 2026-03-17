// src/components/GeneralFeedbackForm.js
import React, { useState } from "react";

function GeneralFeedbackForm({ isOpen, onClose, onSubmit }) {
  const [feedback, setFeedback] = useState({
    subject: "",
    message: "",
    rating: 5,
    feedbackType: "general",
    category: "",
    priority: "medium",
    userEmail: "",
    allowContact: true,
    attachments: [],
    deviceInfo: {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      timestamp: new Date().toISOString(),
    },
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Predefined feedback categories
  const feedbackTypes = [
    { value: "general", label: "General Feedback", icon: "bi-chat-dots" },
    { value: "bug", label: "Bug Report", icon: "bi-bug" },
    { value: "feature", label: "Feature Request", icon: "bi-lightbulb" },
    { value: "ui", label: "UI/UX Improvement", icon: "bi-palette" },
    {
      value: "performance",
      label: "Performance Issue",
      icon: "bi-speedometer2",
    },
    {
      value: "security",
      label: "Security Concern",
      icon: "bi-shield-exclamation",
    },
    { value: "content", label: "Content Issue", icon: "bi-file-text" },
    { value: "other", label: "Other", icon: "bi-three-dots" },
  ];

  const categories = {
    general: [
      "User Experience",
      "Platform Features",
      "Customer Service",
      "Documentation",
    ],
    bug: [
      "Login Issues",
      "Payment Problems",
      "Search Not Working",
      "Image Upload",
      "Mobile Issues",
    ],
    feature: [
      "New Tools",
      "Better Search",
      "Mobile App",
      "Notifications",
      "Social Features",
    ],
    ui: [
      "Navigation",
      "Colors/Theme",
      "Layout",
      "Accessibility",
      "Mobile Design",
    ],
    performance: ["Slow Loading", "Crashes", "Timeouts", "Memory Issues"],
    security: [
      "Data Privacy",
      "Account Security",
      "Payment Security",
      "Suspicious Activity",
    ],
    content: [
      "Inappropriate Content",
      "Missing Information",
      "Outdated Data",
      "Copyright",
    ],
    other: ["Billing", "Account", "Technical Support", "Partnership"],
  };

  const priorities = [
    { value: "low", label: "Low - Nice to have", color: "success" },
    { value: "medium", label: "Medium - Important", color: "warning" },
    { value: "high", label: "High - Urgent", color: "danger" },
    { value: "critical", label: "Critical - Blocking", color: "dark" },
  ];

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setFeedback(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
      // Reset category when feedback type changes
      ...(name === "feedbackType" && { category: "" }),
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess(false);

    try {
      // Validation
      if (!feedback.message.trim()) {
        throw new Error("Please enter your feedback message.");
      }
      if (!feedback.feedbackType) {
        throw new Error("Please select a feedback type.");
      }
      if (feedback.feedbackType !== "general" && !feedback.category) {
        throw new Error("Please select a category for your feedback.");
      }

      // Add additional metadata
      const enhancedFeedback = {
        ...feedback,
        submissionId: `FB-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        wordCount: feedback.message.trim().split(/\s+/).length,
        characterCount: feedback.message.length,
      };

      await onSubmit(enhancedFeedback);
      setSuccess(true);

      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (err) {
      setError(err.message || "Failed to submit feedback. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setFeedback({
      subject: "",
      message: "",
      rating: 5,
      feedbackType: "general",
      category: "",
      priority: "medium",
      userEmail: "",
      allowContact: true,
      attachments: [],
      deviceInfo: {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        timestamp: new Date().toISOString(),
      },
    });
    setError("");
    setSuccess(false);
    setCurrentStep(1);
    onClose();
  };

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const getStepProgress = () => {
    return (currentStep / 3) * 100;
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal fade show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <div className="d-flex align-items-center">
              <i className="bi bi-chat-square-text me-2 text-primary fs-5" />
              <div>
                <h5 className="modal-title mb-0">Share Your Feedback</h5>
                <small className="text-muted">
                  Help us improve your experience
                </small>
              </div>
            </div>
            <button
              type="button"
              className="btn-close"
              onClick={handleClose}
              disabled={submitting}
             />
          </div>

          {/* Progress Bar */}
          <div className="progress" style={{ height: "4px" }}>
            <div
              className="progress-bar bg-primary"
              style={{
                width: `${getStepProgress()}%`,
                transition: "width 0.3s ease",
              }}
             />
          </div>

          <div className="modal-body">
            {success ? (
              <div className="text-center py-4">
                <div className="mb-4">
                  <i
                    className="bi bi-check-circle-fill text-success"
                    style={{ fontSize: "4rem" }}
                   />
                </div>
                <h4 className="text-success mb-3">Thank You! 🌟</h4>
                <p className="text-muted mb-3">
                  Your feedback has been submitted successfully.
                  {feedback.submissionId && (
                    <>
                      <br />
                      <small>
                        Reference ID: <code>{feedback.submissionId}</code>
                      </small>
                    </>
                  )}
                </p>
                <div className="alert alert-info border-0">
                  <small>
                    <i className="bi bi-info-circle me-1" />
                    We'll review your feedback and get back to you if needed.
                  </small>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {error && (
                  <div className="alert alert-danger border-0 mb-4">
                    <i className="bi bi-exclamation-triangle me-2" />
                    {error}
                  </div>
                )}

                {/* Step 1: Feedback Type & Category */}
                {currentStep === 1 && (
                  <div className="step-content">
                    <div className="mb-4">
                      <h6 className="fw-bold mb-3">
                        <span className="badge bg-primary me-2">1</span>
                        What type of feedback do you have?
                      </h6>
                      <div className="row g-2">
                        {feedbackTypes.map(type => (
                          <div key={type.value} className="col-md-6">
                            <div className="form-check">
                              <input
                                className="form-check-input"
                                type="radio"
                                name="feedbackType"
                                id={type.value}
                                value={type.value}
                                checked={feedback.feedbackType === type.value}
                                onChange={handleChange}
                              />
                              <label
                                className="form-check-label w-100"
                                htmlFor={type.value}
                              >
                                <div className="p-3 border rounded hover-bg-light">
                                  <i
                                    className={`${type.icon} me-2 text-primary`}
                                   />
                                  <strong>{type.label}</strong>
                                </div>
                              </label>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Category Selection */}
                    {feedback.feedbackType &&
                      feedback.feedbackType !== "general" && (
                        <div className="mb-4">
                          <label
                            htmlFor="category"
                            className="form-label fw-bold"
                          >
                            Choose a specific category:
                          </label>
                          <select
                            className="form-select"
                            id="category"
                            name="category"
                            value={feedback.category}
                            onChange={handleChange}
                          >
                            <option value="">Select a category...</option>
                            {categories[feedback.feedbackType]?.map(cat => (
                              <option key={cat} value={cat}>
                                {cat}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                    {/* Priority Level */}
                    <div className="mb-4">
                      <label className="form-label fw-bold">
                        Priority Level:
                      </label>
                      <div className="row g-2">
                        {priorities.map(priority => (
                          <div key={priority.value} className="col-6">
                            <div className="form-check">
                              <input
                                className="form-check-input"
                                type="radio"
                                name="priority"
                                id={priority.value}
                                value={priority.value}
                                checked={feedback.priority === priority.value}
                                onChange={handleChange}
                              />
                              <label
                                className="form-check-label w-100"
                                htmlFor={priority.value}
                              >
                                <div
                                  className={"p-2 border rounded text-center hover-bg-light"}
                                >
                                  <span
                                    className={`badge bg-${priority.color} mb-1`}
                                  >
                                    {priority.value.toUpperCase()}
                                  </span>
                                  <div className="small">{priority.label}</div>
                                </div>
                              </label>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Detailed Feedback */}
                {currentStep === 2 && (
                  <div className="step-content">
                    <h6 className="fw-bold mb-3">
                      <span className="badge bg-primary me-2">2</span>
                      Tell us more about your feedback
                    </h6>

                    <div className="mb-3">
                      <label htmlFor="subject" className="form-label">
                        Subject <span className="text-muted">(optional)</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="subject"
                        name="subject"
                        placeholder="Brief summary of your feedback"
                        value={feedback.subject}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="message" className="form-label">
                        Detailed feedback <span className="text-danger">*</span>
                      </label>
                      <textarea
                        className="form-control"
                        id="message"
                        name="message"
                        rows="6"
                        placeholder="Please provide as much detail as possible. For bugs, include steps to reproduce. For features, describe the desired functionality."
                        value={feedback.message}
                        onChange={handleChange}
                        required
                       />
                      <div className="form-text d-flex justify-content-between">
                        <span>
                          <i className="bi bi-info-circle me-1" />
                          Be specific to help us understand and address your
                          feedback
                        </span>
                        <span className="text-muted">
                          {feedback.message.length} characters
                        </span>
                      </div>
                    </div>

                    <div className="mb-3">
                      <label htmlFor="rating" className="form-label">
                        Overall rating: {feedback.rating}
                        <span className="text-warning ms-2">
                          {"★".repeat(feedback.rating)}
                          {"☆".repeat(5 - feedback.rating)}
                        </span>
                      </label>
                      <input
                        type="range"
                        className="form-range"
                        id="rating"
                        name="rating"
                        min="1"
                        max="5"
                        step="1"
                        value={feedback.rating}
                        onChange={handleChange}
                      />
                      <div className="d-flex justify-content-between text-sm text-muted">
                        <span>1 - Very Poor</span>
                        <span>3 - Good</span>
                        <span>5 - Excellent</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Contact Information */}
                {currentStep === 3 && (
                  <div className="step-content">
                    <h6 className="fw-bold mb-3">
                      <span className="badge bg-primary me-2">3</span>
                      Contact preferences (optional)
                    </h6>

                    <div className="mb-3">
                      <label htmlFor="userEmail" className="form-label">
                        Email address{" "}
                        <span className="text-muted">(for follow-up)</span>
                      </label>
                      <input
                        type="email"
                        className="form-control"
                        id="userEmail"
                        name="userEmail"
                        placeholder="your.email@example.com"
                        value={feedback.userEmail}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="mb-4">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="allowContact"
                          name="allowContact"
                          checked={feedback.allowContact}
                          onChange={handleChange}
                        />
                        <label
                          className="form-check-label"
                          htmlFor="allowContact"
                        >
                          <strong>Allow us to contact you</strong> about this
                          feedback
                          <div className="text-muted small">
                            We may reach out if we need clarification or want to
                            notify you about updates
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* Feedback Summary */}
                    <div className="alert alert-light border">
                      <h6 className="alert-heading">
                        <i className="bi bi-clipboard-check me-2" />
                        Feedback Summary
                      </h6>
                      <div className="row text-sm">
                        <div className="col-6">
                          <strong>Type:</strong>{" "}
                          {
                            feedbackTypes.find(
                              t => t.value === feedback.feedbackType,
                            )?.label
                          }
                        </div>
                        <div className="col-6">
                          <strong>Priority:</strong>
                          <span
                            className={`badge bg-${priorities.find(p => p.value === feedback.priority)?.color} ms-1`}
                          >
                            {feedback.priority.toUpperCase()}
                          </span>
                        </div>
                        {feedback.category && (
                          <div className="col-6 mt-2">
                            <strong>Category:</strong> {feedback.category}
                          </div>
                        )}
                        <div className="col-6 mt-2">
                          <strong>Rating:</strong>
                          <span className="text-warning ms-1">
                            {"★".repeat(feedback.rating)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="d-flex justify-content-between mt-4">
                  <div>
                    {currentStep > 1 && (
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={prevStep}
                        disabled={submitting}
                      >
                        <i className="bi bi-arrow-left me-2" />
                        Previous
                      </button>
                    )}
                  </div>

                  <div className="d-flex gap-2">
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={handleClose}
                      disabled={submitting}
                    >
                      <i className="bi bi-x me-2" />
                      Cancel
                    </button>

                    {currentStep < 3 ? (
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={nextStep}
                        disabled={
                          !feedback.feedbackType ||
                          (feedback.feedbackType !== "general" &&
                            !feedback.category)
                        }
                      >
                        Next
                        <i className="bi bi-arrow-right ms-2" />
                      </button>
                    ) : (
                      <button
                        type="submit"
                        className="btn btn-success"
                        disabled={submitting || !feedback.message.trim()}
                      >
                        {submitting ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-send me-2" />
                            Submit Feedback
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .hover-bg-light:hover {
          background-color: #f8f9fa !important;
        }
        .step-content {
          min-height: 400px;
        }
        .modal-lg {
          max-width: 600px;
        }
      `}</style>
    </div>
  );
}

export default GeneralFeedbackForm;
