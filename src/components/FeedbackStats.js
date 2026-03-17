// src/components/FeedbackStats.js
import React from "react";

/**
 * FeedbackStats - Component to display feedback statistics
 *
 * @param {Object} props - Component properties
 * @param {Object} props.stats - Statistics data
 * @param {number} props.stats.avgRating - Average rating (1-5)
 * @param {number} props.stats.totalCount - Total number of feedback entries
 * @param {number} props.stats.positiveCount - Count of positive feedback entries (rating > 3)
 * @param {number} props.stats.negativeCount - Count of negative feedback entries (rating <= 3)
 * @param {string} props.title - Title for the stats section
 * @param {boolean} props.showActionButton - Whether to show the action button
 * @param {string} props.actionButtonText - Text for the action button
 * @param {Function} props.onActionButtonClick - Handler for action button click
 * @returns {JSX.Element}
 */
const FeedbackStats = ({
  stats = {
    avgRating: 0,
    totalCount: 0,
    positiveCount: 0,
    negativeCount: 0,
  },
  title = "Feedback Statistics",
  showActionButton = false,
  actionButtonText = "Give Feedback",
  onActionButtonClick = () => {},
}) => {
  // Calculate the percentage of positive feedback
  const positivePercentage = stats.totalCount
    ? Math.round((stats.positiveCount / stats.totalCount) * 100)
    : 0;

  // Determine color based on average rating
  const getRatingColor = rating => {
    if (rating >= 4.5) return "#28a745"; // Excellent - Green
    if (rating >= 4.0) return "#5cb85c"; // Very Good - Lighter Green
    if (rating >= 3.5) return "#17a2b8"; // Good - Blue
    if (rating >= 3.0) return "#ffc107"; // Average - Yellow
    if (rating >= 2.0) return "#fd7e14"; // Below Average - Orange
    return "#dc3545"; // Poor - Red
  };

  const ratingColor = getRatingColor(stats.avgRating);

  return (
    <div className="card border-0 shadow-sm mb-4">
      <div className="card-body">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h5 className="card-title mb-0 fw-bold">{title}</h5>
          {showActionButton && (
            <button
              className="btn btn-outline-primary btn-sm"
              onClick={onActionButtonClick}
            >
              <i className="bi bi-chat-square-text me-1" />
              {actionButtonText}
            </button>
          )}
        </div>

        <div className="row g-4">
          {/* Average Rating */}
          <div className="col-md-3 col-6">
            <div className="d-flex align-items-center">
              <div
                className="display-4 me-2 fw-bold"
                style={{ color: ratingColor }}
              >
                {stats.avgRating.toFixed(1)}
              </div>
              <div className="ms-2">
                <div className="d-flex mb-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <i
                      key={star}
                      className={`bi bi-star${star <= Math.round(stats.avgRating) ? "-fill" : ""} text-warning`}
                     />
                  ))}
                </div>
                <div className="text-muted small">Average Rating</div>
              </div>
            </div>
          </div>

          {/* Total Feedback */}
          <div className="col-md-3 col-6">
            <div className="text-center border-start border-end">
              <div className="h2 fw-bold text-primary mb-1">
                {stats.totalCount}
              </div>
              <div className="text-muted small">Total Feedback</div>
            </div>
          </div>

          {/* Positive Percentage */}
          <div className="col-md-3 col-6">
            <div className="text-center">
              <div className="h2 fw-bold text-success mb-1">
                {positivePercentage}%
              </div>
              <div className="text-muted small">Positive Feedback</div>
            </div>
          </div>

          {/* Recent Trend */}
          <div className="col-md-3 col-6">
            <div className="text-center border-start">
              <div className="h5 mb-1">
                {stats.positiveCount > stats.negativeCount ? (
                  <span className="text-success">
                    <i className="bi bi-arrow-up-circle me-1" />
                    Positive Trend
                  </span>
                ) : stats.positiveCount === 0 && stats.negativeCount === 0 ? (
                  <span className="text-muted">
                    <i className="bi bi-dash-circle me-1" />
                    No Data Yet
                  </span>
                ) : (
                  <span className="text-warning">
                    <i className="bi bi-exclamation-circle me-1" />
                    Needs Improvement
                  </span>
                )}
              </div>
              <div className="text-muted small">Feedback Trend</div>
            </div>
          </div>
        </div>

        {stats.totalCount === 0 && (
          <div className="alert alert-info mt-3 mb-0">
            <i className="bi bi-info-circle me-2" />
            No feedback has been submitted yet. Be the first to share your
            experience!
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackStats;
