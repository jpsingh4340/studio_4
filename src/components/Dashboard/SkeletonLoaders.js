// src/components/Dashboard/SkeletonLoaders.js
import React from "react";
import "./SkeletonLoaders.css";

/**
 * Skeleton Loading Components
 * Professional loading states for better perceived performance
 */

// Hero Section Skeleton
export const HeroSkeleton = () => (
  <div className="skeleton-hero">
    <div className="skeleton-content">
      <div className="skeleton-left">
        <div className="skeleton-avatar" />
        <div className="skeleton-text-group">
          <div className="skeleton-text skeleton-greeting" />
          <div className="skeleton-text skeleton-title" />
          <div className="skeleton-text skeleton-subtitle" />
        </div>
      </div>
      <div className="skeleton-right">
        <div className="skeleton-stats">
          <div className="skeleton-stat-card" />
          <div className="skeleton-stat-card" />
        </div>
        <div className="skeleton-buttons">
          <div className="skeleton-button skeleton-button-primary" />
          <div className="skeleton-button skeleton-button-secondary" />
        </div>
      </div>
    </div>
  </div>
);

// Equipment Card Skeleton
export const EquipmentCardSkeleton = () => (
  <div className="skeleton-equipment-card">
    <div className="skeleton-card-image" />
    <div className="skeleton-card-body">
      <div className="skeleton-text skeleton-card-title" />
      <div className="skeleton-text skeleton-card-desc" />
      <div className="skeleton-text skeleton-card-desc short" />
      <div className="skeleton-card-footer">
        <div className="skeleton-text skeleton-price" />
        <div className="skeleton-button skeleton-button-small" />
      </div>
    </div>
  </div>
);

// Equipment Grid Skeleton
export const EquipmentGridSkeleton = ({ count = 8 }) => (
  <div className="skeleton-equipment-grid">
    {Array.from({ length: count }).map((_, index) => (
      <EquipmentCardSkeleton key={index} />
    ))}
  </div>
);

// Stats Card Skeleton
export const StatsCardSkeleton = () => (
  <div className="skeleton-stats-card">
    <div className="skeleton-stats-icon" />
    <div className="skeleton-stats-content">
      <div className="skeleton-text skeleton-stat-value" />
      <div className="skeleton-text skeleton-stat-label" />
    </div>
  </div>
);

// Stats Dashboard Skeleton
export const StatsDashboardSkeleton = () => (
  <div className="skeleton-stats-dashboard">
    {Array.from({ length: 4 }).map((_, index) => (
      <StatsCardSkeleton key={index} />
    ))}
  </div>
);

// Rental History Item Skeleton
export const RentalHistorySkeleton = ({ count = 3 }) => (
  <div className="skeleton-rental-list">
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className="skeleton-rental-item">
        <div className="skeleton-rental-image" />
        <div className="skeleton-rental-details">
          <div className="skeleton-text skeleton-rental-name" />
          <div className="skeleton-text skeleton-rental-date" />
          <div className="skeleton-text skeleton-rental-price" />
        </div>
        <div className="skeleton-rental-actions">
          <div className="skeleton-button skeleton-button-small" />
          <div className="skeleton-button skeleton-button-small" />
        </div>
      </div>
    ))}
  </div>
);

// Search Bar Skeleton
export const SearchBarSkeleton = () => (
  <div className="skeleton-search-bar">
    <div className="skeleton-search-input" />
    <div className="skeleton-search-filter" />
    <div className="skeleton-search-filter" />
    <div className="skeleton-search-button" />
  </div>
);

// Activity Feed Skeleton
export const ActivityFeedSkeleton = ({ count = 5 }) => (
  <div className="skeleton-activity-feed">
    <div className="skeleton-text skeleton-feed-title" />
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className="skeleton-activity-item">
        <div className="skeleton-activity-icon" />
        <div className="skeleton-activity-content">
          <div className="skeleton-text skeleton-activity-text" />
          <div className="skeleton-text skeleton-activity-time" />
        </div>
      </div>
    ))}
  </div>
);

// Table Skeleton
export const TableSkeleton = ({ rows = 5, columns = 6 }) => (
  <div className="skeleton-table">
    <div className="skeleton-table-header">
      {Array.from({ length: columns }).map((_, index) => (
        <div key={index} className="skeleton-text skeleton-table-heading" />
      ))}
    </div>
    <div className="skeleton-table-body">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="skeleton-table-row">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div key={colIndex} className="skeleton-text skeleton-table-cell" />
          ))}
        </div>
      ))}
    </div>
  </div>
);

// Modal Skeleton
export const ModalSkeleton = () => (
  <div className="skeleton-modal-overlay">
    <div className="skeleton-modal">
      <div className="skeleton-modal-header">
        <div className="skeleton-text skeleton-modal-title" />
        <div className="skeleton-modal-close" />
      </div>
      <div className="skeleton-modal-body">
        <div className="skeleton-text skeleton-modal-text" />
        <div className="skeleton-text skeleton-modal-text" />
        <div className="skeleton-text skeleton-modal-text short" />
      </div>
      <div className="skeleton-modal-footer">
        <div className="skeleton-button skeleton-button-cancel" />
        <div className="skeleton-button skeleton-button-confirm" />
      </div>
    </div>
  </div>
);

// Compact wrapper for inline loading states
export const SkeletonText = ({ width = "100%", height = "16px", className = "" }) => (
  <div
    className={`skeleton-text ${className}`}
    style={{ width, height }}
  />
);

export const SkeletonCircle = ({ size = "40px", className = "" }) => (
  <div
    className={`skeleton-circle ${className}`}
    style={{ width: size, height: size }}
  />
);

export const SkeletonRectangle = ({ width = "100%", height = "200px", className = "" }) => (
  <div
    className={`skeleton-rectangle ${className}`}
    style={{ width, height }}
  />
);

export default {
  HeroSkeleton,
  EquipmentCardSkeleton,
  EquipmentGridSkeleton,
  StatsCardSkeleton,
  StatsDashboardSkeleton,
  RentalHistorySkeleton,
  SearchBarSkeleton,
  ActivityFeedSkeleton,
  TableSkeleton,
  ModalSkeleton,
  SkeletonText,
  SkeletonCircle,
  SkeletonRectangle,
};
