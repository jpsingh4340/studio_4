// src/components/Favorites/Favorites.js
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  collection,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
  addDoc,
} from "firebase/firestore";
import { db } from "../../firebase";
import EquipmentDetailModal from "../Equipment/EquipmentDetailModal";
import FeedbackModal from "../FeedbackModal";

function Favorites() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackData, setFeedbackData] = useState({
    title: "",
    message: "",
    redirectPath: "",
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
      return;
    }
  }, [currentUser, navigate]);

  // Fetch user's favorites from Firebase
  useEffect(() => {
    const fetchFavorites = async () => {
      if (!currentUser) return;

      try {
        setLoading(true);

        const favoritesQuery = query(
          collection(db, "favorites"),
          where("userId", "==", currentUser.uid),
        );

        const favoritesSnapshot = await getDocs(favoritesQuery);
        const userFavorites = favoritesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        setFavorites(userFavorites);
        console.log(`✅ Loaded ${userFavorites.length} favorites`);
      } catch (error) {
        console.error("❌ Error fetching favorites:", error);
        setFavorites([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [currentUser]);

  const removeFromFavorites = async (favoriteId, equipmentName) => {
    try {
      await deleteDoc(doc(db, "favorites", favoriteId));

      // Update local state
      setFavorites(prev => prev.filter(fav => fav.id !== favoriteId));

      // Show success feedback
      setFeedbackData({
        title: "Removed from Favorites",
        message: `"${equipmentName}" has been removed from your favorites.`,
        redirectPath: "/favorites",
      });
      setShowFeedbackModal(true);

      console.log("✅ Removed from favorites:", equipmentName);
    } catch (error) {
      console.error("❌ Error removing from favorites:", error);
      alert("Failed to remove from favorites. Please try again.");
    }
  };

  // Handle rent equipment
  const handleRentEquipment = equipmentId => {
    navigate(`/rent/${equipmentId}`);
  };

  // Handle view equipment details
  const handleViewDetails = favorite => {
    // Create equipment object from favorite data
    const equipmentData = {
      id: favorite.equipmentId,
      name: favorite.equipmentName,
      imageUrl: favorite.equipmentImage,
      ratePerDay: favorite.equipmentPrice,
      category: favorite.equipmentCategory,
      location: favorite.equipmentLocation,
      // Add any other fields you need for the detail modal
    };

    setSelectedEquipment(equipmentData);
    setShowDetailModal(true);
  };

  const formatDate = dateObj => {
    if (!dateObj) return "Unknown";
    if (dateObj.toDate) return dateObj.toDate().toLocaleDateString();
    if (dateObj.seconds)
      return new Date(dateObj.seconds * 1000).toLocaleDateString();
    return new Date(dateObj).toLocaleDateString();
  };

  if (!currentUser) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-vh-100" style={{ backgroundColor: "#f8fafc" }}>
      <div className="container py-4">
        {/* Feedback Modal */}
        <FeedbackModal
          isOpen={showFeedbackModal}
          onClose={() => setShowFeedbackModal(false)}
          title={feedbackData.title}
          message={feedbackData.message}
          redirectPath={feedbackData.redirectPath}
        />

        {/* Equipment Detail Modal */}
        <EquipmentDetailModal
          equipment={selectedEquipment}
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          currentUserId={currentUser?.uid}
        />

        {/* Header */}
        <div className="row mb-4">
          <div className="col">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h1 className="h3 fw-bold text-dark mb-1">
                  <i className="bi bi-heart-fill text-danger me-2" />
                  My Favorites
                </h1>
                <p className="text-muted mb-0">
                  Equipment you've saved for later
                </p>
              </div>
              <div>
                <Link
                  to="/renter-dashboard"
                  className="btn btn-outline-primary"
                >
                  <i className="bi bi-arrow-left me-2" />
                  Back to Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Favorites Count */}
        <div className="row mb-4">
          <div className="col">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="bg-danger bg-opacity-10 p-3 rounded-3 me-3">
                    <i className="bi bi-heart-fill fs-4 text-danger" />
                  </div>
                  <div>
                    <h4 className="mb-1 fw-bold">{favorites.length}</h4>
                    <p className="text-muted mb-0">
                      {favorites.length === 1
                        ? "Favorite Item"
                        : "Favorite Items"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Favorites Content */}
        {loading ? (
          <div className="text-center py-5">
            <div
              className="spinner-border text-primary"
              style={{ width: "3rem", height: "3rem" }}
            >
              <span className="visually-hidden">Loading...</span>
            </div>
            <h5 className="mt-3">Loading your favorites...</h5>
          </div>
        ) : favorites.length > 0 ? (
          <div className="row">
            {favorites.map(favorite => (
              <div
                key={favorite.id}
                className="col-xl-3 col-lg-4 col-md-6 mb-4"
              >
                <div className="card border-0 shadow-sm h-100 favorite-card">
                  <div className="position-relative">
                    <div
                      style={{
                        height: "200px",
                        overflow: "hidden",
                        backgroundColor: "#f8f9fa",
                      }}
                    >
                      {favorite.equipmentImage ? (
                        <img
                          src={favorite.equipmentImage}
                          alt={favorite.equipmentName}
                          className="card-img-top"
                          style={{
                            height: "100%",
                            width: "100%",
                            objectFit: "cover",
                          }}
                          onError={e => {
                            e.target.style.display = "none";
                            e.target.nextSibling.style.display = "flex";
                          }}
                        />
                      ) : null}
                      <div
                        className="d-flex align-items-center justify-content-center h-100"
                        style={{
                          display: favorite.equipmentImage ? "none" : "flex",
                        }}
                      >
                        <i className="bi bi-tools display-4 text-muted" />
                      </div>
                    </div>

                    {/* Added to favorites date */}
                    <div className="position-absolute top-0 end-0 m-2">
                      <span className="badge bg-danger">
                        <i className="bi bi-heart-fill me-1" />
                        Favorite
                      </span>
                    </div>

                    {/* Quick actions */}
                    <div className="position-absolute top-0 start-0 m-2">
                      <button
                        className="btn btn-light btn-sm rounded-circle me-1"
                        onClick={() => handleViewDetails(favorite)}
                        title="View details"
                      >
                        <i className="bi bi-eye" />
                      </button>
                    </div>
                  </div>

                  <div className="card-body d-flex flex-column">
                    <div className="flex-grow-1">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h6 className="card-title mb-0 fw-bold">
                          {favorite.equipmentName}
                        </h6>
                        <span className="badge bg-primary bg-opacity-10 text-primary small">
                          {favorite.equipmentCategory}
                        </span>
                      </div>

                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <div>
                          <span className="h5 text-success fw-bold">
                            ${favorite.equipmentPrice}
                          </span>
                          <small className="text-muted">/day</small>
                        </div>
                      </div>
                    </div>

                    {/* Location */}
                    <div className="d-flex align-items-center text-muted small mb-3">
                      <i className="bi bi-geo-alt me-1" />
                      <span>{favorite.equipmentLocation}</span>
                    </div>

                    {/* Added date */}
                    <div className="d-flex align-items-center text-muted small mb-3">
                      <i className="bi bi-calendar-plus me-1" />
                      <span>Added: {formatDate(favorite.dateAdded)}</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="d-flex gap-2">
                      <button
                        onClick={() =>
                          handleRentEquipment(favorite.equipmentId)
                        }
                        className="btn btn-primary btn-sm flex-grow-1"
                      >
                        <i className="bi bi-calendar-plus me-1" />
                        Rent Now
                      </button>
                      <button
                        onClick={() =>
                          removeFromFavorites(
                            favorite.id,
                            favorite.equipmentName,
                          )
                        }
                        className="btn btn-outline-danger btn-sm"
                        title="Remove from favorites"
                      >
                        <i className="bi bi-heart-fill" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-5">
            <div className="card border-0 shadow-sm">
              <div className="card-body py-5">
                <div className="mb-4">
                  <i className="bi bi-heart display-1 text-muted" />
                </div>
                <h4>No favorites yet</h4>
                <p className="text-muted mb-4">
                  Start browsing equipment and click the heart icon to save
                  items you like!
                </p>
                <Link to="/renter-dashboard" className="btn btn-primary btn-lg">
                  <i className="bi bi-search me-2" />
                  Browse Equipment
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Tips Section */}
        {favorites.length > 0 && (
          <div className="row mt-5">
            <div className="col">
              <div className="card border-0 shadow-sm bg-light">
                <div className="card-body">
                  <h6 className="fw-bold mb-3">
                    <i className="bi bi-lightbulb text-warning me-2" />
                    Tips for Managing Favorites
                  </h6>
                  <div className="row">
                    <div className="col-md-4">
                      <div className="d-flex align-items-start mb-3 mb-md-0">
                        <i className="bi bi-check-circle text-success me-2 mt-1" />
                        <div>
                          <small className="fw-semibold">Quick Booking</small>
                          <br />
                          <small className="text-muted">
                            Rent directly from your favorites for faster booking
                          </small>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="d-flex align-items-start mb-3 mb-md-0">
                        <i className="bi bi-bell text-info me-2 mt-1" />
                        <div>
                          <small className="fw-semibold">Price Changes</small>
                          <br />
                          <small className="text-muted">
                            Get notified when prices drop on favorited items
                          </small>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="d-flex align-items-start">
                        <i className="bi bi-share text-primary me-2 mt-1" />
                        <div>
                          <small className="fw-semibold">Share Lists</small>
                          <br />
                          <small className="text-muted">
                            Share your favorite equipment with friends
                          </small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .favorite-card {
          transition: all 0.3s ease;
        }
        .favorite-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15) !important;
        }
      `}</style>
    </div>
  );
}

export default Favorites;
