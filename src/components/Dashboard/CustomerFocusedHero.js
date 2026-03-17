// src/components/Dashboard/CustomerFocusedHero.js
import React, { useState, useEffect } from "react";
import "./CustomerFocusedHero.css";

/**
 * Ultra-Professional Customer-Focused Hero
 *
 * UX STRATEGY:
 * 1. Remove distracting stats from top
 * 2. Lead with VALUE PROPOSITION
 * 3. Single, clear PRIMARY ACTION
 * 4. Show EQUIPMENT first (what they came for)
 * 5. Stats hidden in user menu/profile
 */
const CustomerFocusedHero = ({
  user,
  onSearchFocus,
  featuredEquipment = [],
  onBrowseClick,
}) => {
  const [searchValue, setSearchValue] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-rotate featured equipment
  useEffect(() => {
    if (featuredEquipment.length > 0) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % featuredEquipment.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [featuredEquipment]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearchFocus?.(searchValue);
  };

  return (
    <div className="customer-hero">
      {/* SECTION 1: Immediate Value Proposition */}
      <div className="hero-value-section">
        <div className="value-content">
          <h1 className="value-headline">
            Rent Professional Equipment
            <span className="headline-highlight">Save 70% vs Buying</span>
          </h1>

          <p className="value-subheadline">
            From power tools to heavy machinery — get what you need, when you need it
          </p>

          {/* PRIMARY ACTION: Search */}
          <form className="hero-search-form" onSubmit={handleSearchSubmit}>
            <div className="search-input-wrapper">
              <i className="bi bi-search search-icon" />
              <input
                type="text"
                className="hero-search-input"
                placeholder="What equipment do you need? (e.g., drill, excavator, generator)"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                autoFocus
              />
              <button type="submit" className="search-submit-btn">
                Search
              </button>
            </div>

            {/* Popular searches */}
            <div className="popular-searches">
              <span className="popular-label">Popular:</span>
              {['Power Drill', 'Ladder', 'Pressure Washer', 'Generator'].map((term) => (
                <button
                  key={term}
                  type="button"
                  className="popular-tag"
                  onClick={() => {
                    setSearchValue(term);
                    onSearchFocus?.(term);
                  }}
                >
                  {term}
                </button>
              ))}
            </div>
          </form>

          {/* Trust Signals (minimal, non-distracting) */}
          <div className="trust-signals">
            <div className="trust-item">
              <i className="bi bi-shield-check" />
              <span>Verified Equipment</span>
            </div>
            <div className="trust-item">
              <i className="bi bi-clock" />
              <span>Same-Day Pickup</span>
            </div>
            <div className="trust-item">
              <i className="bi bi-star-fill" />
              <span>4.8★ Average Rating</span>
            </div>
          </div>
        </div>

        {/* Featured Equipment Visual (Hero Image) */}
        <div className="hero-visual">
          {featuredEquipment.length > 0 ? (
            <div className="featured-carousel">
              {featuredEquipment.map((item, index) => (
                <div
                  key={item.id}
                  className={`featured-item ${index === currentSlide ? 'active' : ''}`}
                  style={{ display: index === currentSlide ? 'block' : 'none' }}
                >
                  <img
                    src={item.imageUrl || '/placeholder-equipment.jpg'}
                    alt={item.name}
                    className="featured-image"
                  />
                  <div className="featured-info">
                    <span className="featured-badge">Featured</span>
                    <h3 className="featured-name">{item.name}</h3>
                    <div className="featured-price">
                      <span className="price-amount">${item.ratePerDay}</span>
                      <span className="price-period">/day</span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Carousel dots */}
              {featuredEquipment.length > 1 && (
                <div className="carousel-dots">
                  {featuredEquipment.map((_, index) => (
                    <button
                      key={index}
                      className={`dot ${index === currentSlide ? 'active' : ''}`}
                      onClick={() => setCurrentSlide(index)}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="hero-illustration">
              <i className="bi bi-tools hero-icon" />
            </div>
          )}
        </div>
      </div>

      {/* SECTION 2: Category Quick Links */}
      <div className="category-quick-links">
        <h2 className="section-title">Browse by Category</h2>
        <div className="category-grid">
          {[
            { name: 'Power Tools', icon: 'bi-tools', color: '#667eea' },
            { name: 'Ladders & Scaffolding', icon: 'bi-ladder', color: '#10b981' },
            { name: 'Generators', icon: 'bi-lightning-charge', color: '#f59e0b' },
            { name: 'Heavy Equipment', icon: 'bi-truck', color: '#ef4444' },
            { name: 'Lawn & Garden', icon: 'bi-tree', color: '#8b5cf6' },
            { name: 'Cleaning Equipment', icon: 'bi-droplet', color: '#06b6d4' },
          ].map((category) => (
            <button
              key={category.name}
              className="category-card"
              onClick={() => onSearchFocus?.(category.name)}
              style={{ '--category-color': category.color }}
            >
              <i className={`bi ${category.icon} category-icon`} />
              <span className="category-name">{category.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* SECTION 3: Social Proof (subtle) */}
      <div className="social-proof-bar">
        <div className="proof-item">
          <span className="proof-number">10,000+</span>
          <span className="proof-label">Happy Renters</span>
        </div>
        <div className="proof-divider" />
        <div className="proof-item">
          <span className="proof-number">5,000+</span>
          <span className="proof-label">Equipment Items</span>
        </div>
        <div className="proof-divider" />
        <div className="proof-item">
          <span className="proof-number">24/7</span>
          <span className="proof-label">Customer Support</span>
        </div>
      </div>
    </div>
  );
};

export default CustomerFocusedHero;
