// Enhanced OwnerDashboard.jsx with Rental Approval and Feedback - FIXED
import React, { useState, useEffect, createContext, useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../firebase";
import FeedbackModal from "../FeedbackModal";
import GeneralFeedbackForm from "../GeneralFeedbackForm";
import RentalFeedbackForm from "../RentalFeedbackForm";

// Dark Mode Context (keeping it simple for now)
const DarkModeContext = createContext();
const DarkModeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);
  return (
    <DarkModeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      {children}
    </DarkModeContext.Provider>
  );
};
const useDarkMode = () => useContext(DarkModeContext);

// ✅ FIXED: Rental Approval Component
const RentalApprovalSection = ({ currentUser, onApprovalChange }) => {
  const [pendingRentals, setPendingRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (currentUser) {
      fetchPendingRentals();
    }
  }, [currentUser]);

  const fetchPendingRentals = async () => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      // Fetch rentals where current user is the owner and status is pending
      const rentalsSnapshot = await getDocs(collection(db, "rentals"));
      const allRentals = rentalsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Filter for pending rentals where current user is the equipment owner
      const pendingForOwner = allRentals.filter(
        rental =>
          rental.ownerId === currentUser.uid && rental.status === "pending",
      );

      console.log(
        `📥 Found ${pendingForOwner.length} pending rentals for approval`,
      );
      setPendingRentals(pendingForOwner);
    } catch (error) {
      console.error("❌ Error fetching pending rentals:", error);
      setError("Failed to load rental requests. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (rentalId, action) => {
    if (!rentalId || !action) {
      setError("Invalid rental ID or action");
      return;
    }

    try {
      const newStatus = action === "approve" ? "approved" : "rejected";

      await updateDoc(doc(db, "rentals", rentalId), {
        status: newStatus,
        updatedAt: serverTimestamp(),
        [`${action}dAt`]: serverTimestamp(),
        [`${action}dBy`]: currentUser.uid,
      });

      // Remove from local state
      setPendingRentals(prev => prev.filter(rental => rental.id !== rentalId));

      // Notify parent component
      if (onApprovalChange) {
        onApprovalChange();
      }

      console.log(`✅ Rental ${action}d successfully`);

      // Show success message
      alert(`Rental request ${action}d successfully!`);
    } catch (error) {
      console.error(`❌ Error ${action}ing rental:`, error);
      setError(`Failed to ${action} rental request. Please try again.`);
    }
  };

  const formatDate = dateObj => {
    if (!dateObj) return "Unknown";

    try {
      // Handle Firestore Timestamp
      if (dateObj.toDate && typeof dateObj.toDate === "function") {
        return dateObj.toDate().toLocaleDateString();
      }
      // Handle timestamp with seconds
      if (dateObj.seconds) {
        return new Date(dateObj.seconds * 1000).toLocaleDateString();
      }
      // Handle regular Date object or string
      return new Date(dateObj).toLocaleDateString();
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid Date";
    }
  };

  if (loading) {
    return (
      <div className="card border-0 shadow-sm">
        <div className="card-header">
          <h5 className="mb-0">📥 Pending Rental Requests</h5>
        </div>
        <div className="card-body text-center py-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2 text-muted">Loading rental requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card border-0 shadow-sm">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="mb-0">
          📥 Pending Rental Requests ({pendingRentals.length})
        </h5>
        <button
          className="btn btn-outline-secondary btn-sm"
          onClick={fetchPendingRentals}
          disabled={loading}
        >
          🔄 Refresh
        </button>
      </div>
      <div className="card-body">
        {error && (
          <div className="alert alert-danger">
            <i className="bi bi-exclamation-triangle me-2" />
            {error}
            <button
              className="btn btn-sm btn-outline-danger ms-2"
              onClick={() => setError("")}
            >
              Dismiss
            </button>
          </div>
        )}

        {pendingRentals.length > 0 ? (
          <div className="row">
            {pendingRentals.map(rental => (
              <div key={rental.id} className="col-md-6 mb-3">
                <div className="card border border-warning">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div>
                        <h6 className="fw-bold mb-1">
                          {rental.equipmentName || "Unknown Equipment"}
                        </h6>
                        <small className="text-muted">
                          <i className="bi bi-person me-1" />
                          {rental.renterName || "Unknown Renter"} (
                          {rental.renterEmail || "No email"})
                        </small>
                      </div>
                      <span className="badge bg-warning text-dark">
                        Pending
                      </span>
                    </div>

                    <div className="row g-2 mb-3 small">
                      <div className="col-6">
                        <strong>Start Date:</strong>
                        <br />
                        <span className="text-muted">
                          {formatDate(rental.startDate)}
                        </span>
                      </div>
                      <div className="col-6">
                        <strong>End Date:</strong>
                        <br />
                        <span className="text-muted">
                          {formatDate(rental.endDate)}
                        </span>
                      </div>
                      <div className="col-6">
                        <strong>Duration:</strong>
                        <br />
                        <span className="text-muted">
                          {rental.totalDays || 0} day
                          {rental.totalDays !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <div className="col-6">
                        <strong>Total Price:</strong>
                        <br />
                        <span className="text-success fw-bold">
                          ${rental.totalPrice || 0}
                        </span>
                      </div>
                    </div>

                    {rental.notes && (
                      <div className="mb-3">
                        <strong className="small">Renter Notes:</strong>
                        <p className="small text-muted mb-0 mt-1">
                          {rental.notes}
                        </p>
                      </div>
                    )}

                    <div className="mb-3">
                      <strong className="small">Contact Info:</strong>
                      <div className="small text-muted">
                        📞 {rental.renterPhone || "Not provided"}
                        <br />
                        📍 {rental.renterAddress || "Not provided"}
                      </div>
                    </div>

                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-success btn-sm flex-fill"
                        onClick={() => handleApproval(rental.id, "approve")}
                        disabled={!rental.id}
                      >
                        <i className="bi bi-check-circle me-1" />
                        Approve
                      </button>
                      <button
                        className="btn btn-danger btn-sm flex-fill"
                        onClick={() => handleApproval(rental.id, "reject")}
                        disabled={!rental.id}
                      >
                        <i className="bi bi-x-circle me-1" />
                        Reject
                      </button>
                    </div>

                    <small className="text-muted d-block mt-2">
                      Request ID: #{rental.id ? rental.id.slice(-6) : "Unknown"}
                    </small>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <div className="display-1 mb-3">📭</div>
            <h6>No Pending Requests</h6>
            <p className="text-muted mb-0">
              All rental requests have been processed. New requests will appear
              here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Main Owner Dashboard Component
function OwnerDashboard() {
  const { currentUser, logout } = useAuth();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const navigate = useNavigate();
  const location = useLocation();

  // State management
  const [equipmentItems, setEquipmentItems] = useState([]);
  const [activeRentals, setActiveRentals] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");

  // ✅ NEW: Quick Stats Widget State
  const [quickStatsCollapsed, setQuickStatsCollapsed] = useState(false);

  // ✅ NEW: Feedback state
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showGeneralFeedback, setShowGeneralFeedback] = useState(false);
  const [showRentalFeedback, setShowRentalFeedback] = useState(false);
  const [selectedRentalForFeedback, setSelectedRentalForFeedback] =
    useState(null);
  const [feedbackData, setFeedbackData] = useState({
    title: "",
    message: "",
    redirectPath: "",
  });

  // Calculated stats
  const [stats, setStats] = useState({
    totalEquipment: 0,
    availableEquipment: 0,
    rentedEquipment: 0,
    totalRevenue: 0,
    pendingRequests: 0,
    activeRentals: 0,
    completedRentals: 0,
    avgRating: 0,
    pendingApproval: 0,
  });

  // Check for success message
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    if (urlParams.get("equipmentAdded") === "true") {
      // Refresh data when coming back from add equipment
      window.location.reload();
    }
  }, [location]);

  // ✅ FIXED: Handle approval changes
  const handleApprovalChange = () => {
    // Refresh the dashboard data when approvals change
    fetchOwnerData();
  };

  // ✅ FIXED: Extracted fetch function to be reusable
  const fetchOwnerData = async () => {
    if (!currentUser) {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      setError("");

      console.log("🔍 Fetching data for owner:", currentUser.uid);

      // Fetch equipment
      console.log("📦 Fetching equipment...");
      const equipmentSnapshot = await getDocs(collection(db, "equipment"));
      const allEquipmentData = equipmentSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      console.log(`📊 Total equipment in database: ${allEquipmentData.length}`);

      // 2. Fetch owner's equipment
      let ownerEquipment = [];

      try {
        console.log("🎯 Fetching equipment with ownerId filter...");
        const equipmentQuery = query(
          collection(db, "equipment"),
          where("ownerId", "==", currentUser.uid),
        );

        const equipmentSnapshot = await getDocs(equipmentQuery);
        ownerEquipment = equipmentSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          views: doc.data().views || 0,
          bookings: doc.data().bookings || 0,
          totalRevenue: doc.data().totalRevenue || 0,
          rating: doc.data().rating || 0,
        }));

        console.log(`📦 Found ${ownerEquipment.length} equipment items`);
      } catch (queryError) {
        console.error("❌ Equipment query failed:", queryError);

        // Fallback: filter client-side
        ownerEquipment = allEquipmentData.filter(
          item => item.ownerId === currentUser.uid,
        );
        console.log(
          `📦 Fallback: Found ${ownerEquipment.length} equipment items`,
        );
      }

      setEquipmentItems(ownerEquipment);

      // 3. Fetch rentals
      let ownerRentals = [];
      try {
        const rentalsSnapshot = await getDocs(collection(db, "rentals"));
        ownerRentals = rentalsSnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(rental => rental.ownerId === currentUser.uid);

        console.log(`📅 Found ${ownerRentals.length} rentals`);
        setActiveRentals(ownerRentals);
      } catch (rentalsError) {
        console.log("ℹ️ Error fetching rentals:", rentalsError);
        setActiveRentals([]);
      }

      // 4. Filter pending requests
      const pendingRentals = ownerRentals.filter(
        rental => rental.status === "pending",
      );
      setPendingRequests(pendingRentals);

      // 5. Calculate statistics
      const totalEquipment = ownerEquipment.length;
      const availableEquipment = ownerEquipment.filter(
        item => item.available !== false,
      ).length;
      const rentedEquipment = ownerEquipment.filter(
        item => item.available === false,
      ).length;
      const pendingApproval = ownerEquipment.filter(
        item => item.approvalStatus === "pending",
      ).length;

      // Calculate revenue
      const rentalRevenue = ownerRentals.reduce((sum, rental) => {
        const price =
          parseFloat(rental.totalPrice) || parseFloat(rental.totalCost) || 0;
        return sum + price;
      }, 0);

      const equipmentRevenue = ownerEquipment.reduce((sum, eq) => {
        const revenue = parseFloat(eq.totalRevenue) || 0;
        return sum + revenue;
      }, 0);

      const totalRevenue = Math.max(rentalRevenue, equipmentRevenue);

      const activeRentalsCount = ownerRentals.filter(
        r => r.status === "active" || r.status === "approved",
      ).length;

      const completedRentalsCount = ownerRentals.filter(
        r => r.status === "completed",
      ).length;

      const pendingRequestsCount = pendingRentals.length;

      // Calculate average rating
      const ratingsSum = ownerEquipment.reduce((sum, eq) => {
        const rating = parseFloat(eq.rating) || 0;
        return sum + rating;
      }, 0);
      const avgRating = totalEquipment > 0 ? ratingsSum / totalEquipment : 0;

      const calculatedStats = {
        totalEquipment,
        availableEquipment,
        rentedEquipment,
        totalRevenue: totalRevenue.toFixed(2),
        pendingRequests: pendingRequestsCount,
        activeRentals: activeRentalsCount,
        completedRentals: completedRentalsCount,
        avgRating: avgRating.toFixed(1),
        pendingApproval,
      };

      setStats(calculatedStats);
      console.log("📊 Calculated stats:", calculatedStats);
    } catch (error) {
      console.error("❌ Error fetching owner dashboard data:", error);
      setError(
        "Failed to load dashboard data. Please try refreshing the page.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch all data from Firebase
  useEffect(() => {
    fetchOwnerData();
  }, [currentUser, navigate]);

  // Filter equipment based on search
  const filteredEquipment = equipmentItems.filter(
    item =>
      (item.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.category || "").toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleDeleteEquipment = async equipmentId => {
    if (!equipmentId) return;
    if (!window.confirm("Are you sure you want to delete this equipment?"))
      return;

    try {
      await deleteDoc(doc(db, "equipment", equipmentId));
      setEquipmentItems(prev => prev.filter(item => item.id !== equipmentId));
      console.log("✅ Equipment deleted successfully");
    } catch (error) {
      console.error("❌ Error deleting equipment:", error);
      setError("Failed to delete equipment. Please try again.");
    }
  };

  const handleToggleAvailability = async (equipmentId, currentAvailability) => {
    if (!equipmentId) return;

    try {
      const newAvailability = !currentAvailability;
      await updateDoc(doc(db, "equipment", equipmentId), {
        available: newAvailability,
        updatedAt: serverTimestamp(),
      });

      setEquipmentItems(prev =>
        prev.map(item =>
          item.id === equipmentId
            ? { ...item, available: newAvailability }
            : item,
        ),
      );

      console.log(
        `✅ Equipment ${newAvailability ? "activated" : "deactivated"}`,
      );
    } catch (error) {
      console.error("❌ Error updating equipment availability:", error);
      setError("Failed to update equipment availability. Please try again.");
    }
  };

  // ✅ NEW: Analytics & Insights calculations
  const calculateAnalytics = () => {
    if (equipmentItems.length === 0) {
      return {
        topPerformer: null,
        utilizationRate: 0,
        averageRevenue: 0,
        mostPopularCategory: "None",
      };
    }

    // Find top performer by revenue
    const topPerformer = equipmentItems.reduce((best, item) => {
      const itemRevenue = parseFloat(item.totalRevenue) || 0;
      const bestRevenue = parseFloat(best?.totalRevenue) || 0;
      return itemRevenue > bestRevenue ? item : best;
    }, equipmentItems[0]);

    // Calculate overall utilization rate (rented / total)
    const rentedCount = equipmentItems.filter(
      item => item.available === false,
    ).length;
    const utilizationRate =
      equipmentItems.length > 0
        ? (rentedCount / equipmentItems.length) * 100
        : 0;

    // Calculate average revenue per equipment
    const totalRevenue = equipmentItems.reduce(
      (sum, item) => sum + (parseFloat(item.totalRevenue) || 0),
      0,
    );
    const averageRevenue =
      equipmentItems.length > 0 ? totalRevenue / equipmentItems.length : 0;

    // Find most popular category
    const categoryCount = {};
    equipmentItems.forEach(item => {
      const category = item.category || "Uncategorized";
      categoryCount[category] = (categoryCount[category] || 0) + 1;
    });

    const mostPopularCategory =
      Object.keys(categoryCount).length > 0
        ? Object.keys(categoryCount).reduce((a, b) =>
            categoryCount[a] > categoryCount[b] ? a : b,
          )
        : "None";

    return {
      topPerformer,
      utilizationRate: utilizationRate.toFixed(1),
      averageRevenue: averageRevenue.toFixed(2),
      mostPopularCategory,
    };
  };

  // ✅ NEW: Quick Stats Widget calculations
  const calculateQuickStats = () => {
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Recent rentals (last 30 days)
    const recentRentals = activeRentals.filter(rental => {
      try {
        let createdDate;
        if (rental.createdAt?.toDate) {
          createdDate = rental.createdAt.toDate();
        } else if (rental.createdAt?.seconds) {
          createdDate = new Date(rental.createdAt.seconds * 1000);
        } else {
          createdDate = new Date(rental.createdAt);
        }
        return createdDate >= thirtyDaysAgo;
      } catch {
        return false;
      }
    });

    // Weekly growth
    const weeklyRentals = activeRentals.filter(rental => {
      try {
        let createdDate;
        if (rental.createdAt?.toDate) {
          createdDate = rental.createdAt.toDate();
        } else if (rental.createdAt?.seconds) {
          createdDate = new Date(rental.createdAt.seconds * 1000);
        } else {
          createdDate = new Date(rental.createdAt);
        }
        return createdDate >= sevenDaysAgo;
      } catch {
        return false;
      }
    });

    // Most booked equipment
    const bookingCounts = {};
    activeRentals.forEach(rental => {
      const equipmentId = rental.equipmentId;
      if (equipmentId) {
        bookingCounts[equipmentId] = (bookingCounts[equipmentId] || 0) + 1;
      }
    });

    const mostBookedEquipmentId = Object.keys(bookingCounts).reduce(
      (a, b) => (bookingCounts[a] > bookingCounts[b] ? a : b),
      Object.keys(bookingCounts)[0],
    );

    const mostBookedEquipment =
      equipmentItems.find(item => item.id === mostBookedEquipmentId) || null;

    // Revenue this month
    const thisMonthRevenue = recentRentals.reduce((sum, rental) => {
      return sum + (parseFloat(rental.totalPrice) || 0);
    }, 0);

    // Average rating
    const ratingsSum = equipmentItems.reduce(
      (sum, item) => sum + (parseFloat(item.rating) || 0),
      0,
    );
    const avgRating =
      equipmentItems.length > 0 ? ratingsSum / equipmentItems.length : 0;

    return {
      recentBookings: recentRentals.length,
      weeklyGrowth: weeklyRentals.length,
      mostBookedEquipment,
      thisMonthRevenue: thisMonthRevenue.toFixed(2),
      avgRating: avgRating.toFixed(1),
      totalBookings: activeRentals.length,
    };
  };

  const quickStats = calculateQuickStats();

  // ✅ NEW: Smart Notifications - Rental Calendar Widget
  const getUpcomingRentalEndDates = () => {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    return activeRentals
      .filter(
        rental => rental.status === "active" || rental.status === "approved",
      )
      .map(rental => {
        let endDate;
        try {
          if (rental.endDate?.toDate) {
            endDate = rental.endDate.toDate();
          } else if (rental.endDate?.seconds) {
            endDate = new Date(rental.endDate.seconds * 1000);
          } else {
            endDate = new Date(rental.endDate);
          }
        } catch (error) {
          return null;
        }

        if (endDate && endDate >= today && endDate <= nextWeek) {
          const daysUntilEnd = Math.ceil(
            (endDate - today) / (24 * 60 * 60 * 1000),
          );
          return {
            ...rental,
            endDate,
            daysUntilEnd,
            isEndingSoon: daysUntilEnd <= 3,
            isEndingToday: daysUntilEnd === 0,
          };
        }
        return null;
      })
      .filter(Boolean)
      .sort((a, b) => a.daysUntilEnd - b.daysUntilEnd);
  };

  const upcomingEndDates = getUpcomingRentalEndDates();

  const analytics = calculateAnalytics();

  // ✅ NEW: Export Equipment List as CSV
  const exportEquipmentList = () => {
    try {
      // Prepare data for export
      const exportData = filteredEquipment.map(item => ({
        "Equipment Name": item.name || "Unnamed",
        Category: item.category || "Uncategorized",
        "Rate Per Day": `${item.ratePerDay || 0}`,
        Status: item.available !== false ? "Available" : "Rented",
        Description: item.description || "No description",
        "Total Revenue": `${item.totalRevenue || 0}`,
        Rating: item.rating || 0,
        Views: item.views || 0,
        Bookings: item.bookings || 0,
        "Date Added": item.createdAt
          ? item.createdAt.toDate
            ? item.createdAt.toDate().toLocaleDateString()
            : new Date(item.createdAt).toLocaleDateString()
          : "Unknown",
      }));

      // Convert to CSV
      const headers = Object.keys(exportData[0] || {});
      const csvContent = [
        headers.join(","),
        ...exportData.map(row =>
          headers
            .map(header => {
              const value = row[header] || "";
              // Escape commas and quotes
              return `"${String(value).replace(/"/g, "\"\"")}"`;
            })
            .join(","),
        ),
      ].join("\n");

      // Create and download file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");

      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute(
          "download",
          `equipment-list-${new Date().toISOString().split("T")[0]}.csv`,
        );
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        console.log("✅ Equipment list exported successfully");

        // Show success message
        const originalButton = document.querySelector("[data-export-btn]");
        if (originalButton) {
          const originalText = originalButton.textContent;
          originalButton.textContent = "✅ Exported!";
          originalButton.disabled = true;
          setTimeout(() => {
            originalButton.textContent = originalText;
            originalButton.disabled = false;
          }, 2000);
        }
      }
    } catch (error) {
      console.error("❌ Error exporting equipment list:", error);
      setError("Failed to export equipment list. Please try again.");
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      setError("Failed to logout. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div
            className="spinner-border text-primary"
            style={{ width: "3rem", height: "3rem" }}
          >
            <span className="visually-hidden">Loading...</span>
          </div>
          <h5 className="mt-3">Loading your dashboard...</h5>
          <p className="text-muted">Fetching your equipment and rental data</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <h5>Access Denied</h5>
          <p className="text-muted">Please log in to access the dashboard.</p>
          <Link to="/login" className="btn btn-primary">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  // ✅ NEW: Handle general feedback submission
  const handleGeneralFeedbackSubmit = async feedbackData => {
    try {
      console.log("General feedback submitted:", feedbackData);

      // TODO: Save to Firebase
      // await addDoc(collection(db, 'generalFeedbacks'), {
      //   ...feedbackData,
      //   userId: currentUser?.uid,
      //   userEmail: currentUser?.email,
      //   createdAt: new Date()
      // });

      // For now, save to localStorage
      const existingFeedbacks = JSON.parse(
        localStorage.getItem("generalFeedbacks") || "[]",
      );
      const newFeedback = {
        ...feedbackData,
        userId: currentUser?.uid,
        userEmail: currentUser?.email,
        submittedAt: new Date().toISOString(),
        userType: "owner", // Mark as owner feedback
      };
      existingFeedbacks.push(newFeedback);
      localStorage.setItem(
        "generalFeedbacks",
        JSON.stringify(existingFeedbacks),
      );

      // Show success message
      setFeedbackData({
        title: "Thank You for Your Feedback! 📝",
        message:
          "We appreciate your input. Your feedback helps us improve our platform for equipment owners!",
        redirectPath: "",
      });

      // Hide the general feedback form
      setShowGeneralFeedback(false);
      // Show the success modal
      setShowFeedbackModal(true);
    } catch (error) {
      console.error("Error submitting general feedback:", error);
      throw error;
    }
  };

  // ✅ NEW: Handle rental feedback submission
  const handleRentalFeedbackSubmit = async feedbackData => {
    try {
      console.log("Rental feedback submitted:", feedbackData);

      // For now, save to localStorage
      const existingFeedbacks = JSON.parse(
        localStorage.getItem("rentalFeedbacks") || "[]",
      );
      const newFeedback = {
        ...feedbackData,
        userId: currentUser?.uid,
        userType: "owner", // Mark as owner feedback
        submittedAt: new Date().toISOString(),
      };
      existingFeedbacks.push(newFeedback);
      localStorage.setItem(
        "rentalFeedbacks",
        JSON.stringify(existingFeedbacks),
      );

      // Show success message
      setFeedbackData({
        title: "Thank You for Your Feedback! 🌟",
        message:
          "Your review of the rental experience helps us improve our service for all users.",
        redirectPath: "",
      });

      // Reset feedback form state
      setSelectedRentalForFeedback(null);
      setShowRentalFeedback(false);
      // Show the success modal
      setShowFeedbackModal(true);
    } catch (error) {
      console.error("Error submitting rental feedback:", error);
      throw error;
    }
  };

  // ✅ NEW: Handle opening the rental feedback form
  const handleOpenRentalFeedback = rental => {
    setSelectedRentalForFeedback(rental);
    setShowRentalFeedback(true);
  };

  return (
    <div className="container-fluid py-4" style={{ paddingTop: "120px" }}>
      {/* Header */}
      <div className="row mb-4">
        <div className="col">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h3 fw-bold text-dark mb-1">Owner Dashboard 🏢</h1>
              <p className="text-muted mb-0">
                Welcome back, {currentUser?.displayName || currentUser?.email}
              </p>
            </div>
            <div className="d-flex gap-2">
              <Link to="/add-equipment" className="btn btn-primary">
                ➕ Add Equipment
              </Link>
              <button
                className="btn btn-outline-secondary"
                onClick={handleLogout}
              >
                🚪 Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div
          className="alert alert-danger alert-dismissible fade show"
          role="alert"
        >
          {error}
          <button
            type="button"
            className="btn-close"
            onClick={() => setError("")}
           />
        </div>
      )}

      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-lg-3 col-md-6 mb-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="p-3 bg-primary bg-opacity-10 rounded-3 me-3">
                  <div className="fs-3">🔧</div>
                </div>
                <div>
                  <h2 className="mb-1">{stats.totalEquipment}</h2>
                  <p className="text-muted mb-0 small">Your Equipment</p>
                  <small className="text-success">
                    {stats.availableEquipment} available
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-3 col-md-6 mb-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="p-3 bg-success bg-opacity-10 rounded-3 me-3">
                  <div className="fs-3">💰</div>
                </div>
                <div>
                  <h2 className="mb-1">${stats.totalRevenue}</h2>
                  <p className="text-muted mb-0 small">Total Revenue</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-3 col-md-6 mb-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="p-3 bg-info bg-opacity-10 rounded-3 me-3">
                  <div className="fs-3">📅</div>
                </div>
                <div>
                  <h2 className="mb-1">{stats.activeRentals}</h2>
                  <p className="text-muted mb-0 small">Active Rentals</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-3 col-md-6 mb-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="p-3 bg-warning bg-opacity-10 rounded-3 me-3">
                  <div className="fs-3">📥</div>
                </div>
                <div>
                  <h2 className="mb-1">{stats.pendingRequests}</h2>
                  <p className="text-muted mb-0 small">Pending Requests</p>
                  {stats.pendingRequests > 0 && (
                    <small className="text-warning">⚠️ Needs attention</small>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ NEW: Quick Stats Widget */}
      <div className="row mb-4">
        <div className="col">
          <div className="card border-0 shadow-sm">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">⚡ Quick Stats</h5>
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={() => setQuickStatsCollapsed(!quickStatsCollapsed)}
                title={quickStatsCollapsed ? "Expand" : "Collapse"}
              >
                {quickStatsCollapsed ? "📈 Show" : "📉 Hide"}
              </button>
            </div>

            {!quickStatsCollapsed && (
              <div className="card-body">
                <div className="row g-3">
                  {/* Recent Activity */}
                  <div className="col-lg-2 col-md-4 col-sm-6">
                    <div className="text-center p-2 bg-primary bg-opacity-10 rounded">
                      <div className="fs-5 fw-bold text-primary">
                        {quickStats.recentBookings}
                      </div>
                      <div className="small text-muted">Bookings (30d)</div>
                    </div>
                  </div>

                  {/* Weekly Growth */}
                  <div className="col-lg-2 col-md-4 col-sm-6">
                    <div className="text-center p-2 bg-success bg-opacity-10 rounded">
                      <div className="fs-5 fw-bold text-success">
                        {quickStats.weeklyGrowth}
                      </div>
                      <div className="small text-muted">This Week</div>
                    </div>
                  </div>

                  {/* Monthly Revenue */}
                  <div className="col-lg-2 col-md-4 col-sm-6">
                    <div className="text-center p-2 bg-info bg-opacity-10 rounded">
                      <div className="fs-5 fw-bold text-info">
                        ${quickStats.thisMonthRevenue}
                      </div>
                      <div className="small text-muted">Month Revenue</div>
                    </div>
                  </div>

                  {/* Average Rating */}
                  <div className="col-lg-2 col-md-4 col-sm-6">
                    <div className="text-center p-2 bg-warning bg-opacity-10 rounded">
                      <div className="fs-5 fw-bold text-warning">
                        {quickStats.avgRating > 0
                          ? `⭐ ${quickStats.avgRating}`
                          : "N/A"}
                      </div>
                      <div className="small text-muted">Avg Rating</div>
                    </div>
                  </div>

                  {/* Total Bookings */}
                  <div className="col-lg-2 col-md-4 col-sm-6">
                    <div className="text-center p-2 bg-secondary bg-opacity-10 rounded">
                      <div className="fs-5 fw-bold text-secondary">
                        {quickStats.totalBookings}
                      </div>
                      <div className="small text-muted">Total Bookings</div>
                    </div>
                  </div>

                  {/* Most Popular */}
                  <div className="col-lg-2 col-md-4 col-sm-6">
                    <div className="text-center p-2 bg-danger bg-opacity-10 rounded">
                      <div
                        className="fs-6 fw-bold text-danger"
                        title={quickStats.mostBookedEquipment?.name || "None"}
                      >
                        {quickStats.mostBookedEquipment ? (
                          <>
                            🔥
                            <div
                              className="small"
                              style={{ fontSize: "0.7rem" }}
                            >
                              {quickStats.mostBookedEquipment.name.length > 12
                                ? `${quickStats.mostBookedEquipment.name.substring(
                                    0,
                                    12,
                                  )}...`
                                : quickStats.mostBookedEquipment.name}
                            </div>
                          </>
                        ) : (
                          "N/A"
                        )}
                      </div>
                      <div className="small text-muted">Most Popular</div>
                    </div>
                  </div>
                </div>

                {/* Quick Insights */}
                <div className="row mt-3">
                  <div className="col">
                    <div className="p-2 bg-light rounded">
                      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                        <small className="text-muted">
                          <i className="bi bi-lightbulb me-1" />
                          <strong>Quick Insight:</strong>
                          {quickStats.weeklyGrowth >
                          quickStats.recentBookings / 4 ? (
                            <span className="text-success">
                              {" "}
                              📈 Great week! Above average activity.
                            </span>
                          ) : quickStats.weeklyGrowth === 0 ? (
                            <span className="text-warning">
                              {" "}
                              ⚠️ Slow week. Consider promoting your equipment.
                            </span>
                          ) : (
                            <span className="text-info">
                              {" "}
                              📊 Steady activity this week.
                            </span>
                          )}
                        </small>

                        <small className="text-muted">
                          Last updated: {new Date().toLocaleTimeString()}
                        </small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ✅ NEW: Smart Notifications - Rental Calendar Widget */}
      {upcomingEndDates.length > 0 && (
        <div className="row mb-4">
          <div className="col">
            <div className="card border-0 shadow-sm">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">📅 Upcoming Rental End Dates</h5>
                <span className="badge bg-primary">
                  {upcomingEndDates.length} ending soon
                </span>
              </div>
              <div className="card-body">
                <div className="row">
                  {upcomingEndDates.slice(0, 4).map(rental => (
                    <div key={rental.id} className="col-lg-3 col-md-6 mb-3">
                      <div
                        className={`card border-2 h-100 ${
                          rental.isEndingToday
                            ? "border-danger"
                            : rental.isEndingSoon
                              ? "border-warning"
                              : "border-info"
                        }`}
                      >
                        <div className="card-body p-3">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <h6 className="card-title mb-0 small fw-bold">
                              {rental.equipmentName || "Unknown Equipment"}
                            </h6>
                            <span
                              className={`badge ${
                                rental.isEndingToday
                                  ? "bg-danger"
                                  : rental.isEndingSoon
                                    ? "bg-warning text-dark"
                                    : "bg-info"
                              }`}
                            >
                              {rental.isEndingToday
                                ? "Today!"
                                : rental.isEndingSoon
                                  ? "Soon"
                                  : `${rental.daysUntilEnd}d`}
                            </span>
                          </div>

                          <div className="small text-muted mb-2">
                            <i className="bi bi-person me-1" />
                            {rental.renterName || "Unknown Renter"}
                          </div>

                          <div className="small">
                            <div className="fw-semibold">
                              {rental.isEndingToday
                                ? "🔴 Ends Today"
                                : `⏰ Ends in ${rental.daysUntilEnd} day${rental.daysUntilEnd !== 1 ? "s" : ""}`}
                            </div>
                            <div className="text-muted">
                              {rental.endDate.toLocaleDateString()}
                            </div>
                          </div>

                          {rental.isEndingToday && (
                            <div className="mt-2">
                              <small className="text-danger fw-bold">
                                <i className="bi bi-exclamation-triangle me-1" />
                                Contact renter today!
                              </small>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {upcomingEndDates.length > 4 && (
                  <div className="text-center mt-2">
                    <small className="text-muted">
                      And {upcomingEndDates.length - 4} more rental
                      {upcomingEndDates.length - 4 !== 1 ? "s" : ""} ending this
                      week
                    </small>
                  </div>
                )}

                <div className="mt-3 p-2 bg-light rounded">
                  <small className="text-muted">
                    <i className="bi bi-lightbulb me-1" />
                    <strong>Tip:</strong> Contact renters 1-2 days before rental
                    ends to arrange equipment return.
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ✅ NEW: Analytics & Insights Section */}
      {equipmentItems.length > 0 && (
        <div className="row mb-4">
          <div className="col">
            <div className="card border-0 shadow-sm">
              <div className="card-header">
                <h5 className="mb-0">📊 Analytics & Insights</h5>
              </div>
              <div className="card-body">
                <div className="row">
                  {/* Top Performer */}
                  <div className="col-lg-3 col-md-6 mb-3">
                    <div className="d-flex align-items-center p-3 bg-success bg-opacity-10 rounded-3">
                      <div className="me-3">
                        <div className="fs-4">🏆</div>
                      </div>
                      <div className="flex-grow-1">
                        <div className="fw-bold text-success">
                          Top Performer
                        </div>
                        <div className="small text-muted">
                          {analytics.topPerformer ? (
                            <>
                              <div className="fw-semibold">
                                {analytics.topPerformer.name}
                              </div>
                              <div>
                                ${analytics.topPerformer.totalRevenue || 0}{" "}
                                revenue
                              </div>
                            </>
                          ) : (
                            "No data yet"
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Utilization Rate */}
                  <div className="col-lg-3 col-md-6 mb-3">
                    <div className="d-flex align-items-center p-3 bg-info bg-opacity-10 rounded-3">
                      <div className="me-3">
                        <div className="fs-4">📈</div>
                      </div>
                      <div className="flex-grow-1">
                        <div className="fw-bold text-info">
                          Utilization Rate
                        </div>
                        <div className="small text-muted">
                          <div className="fw-semibold">
                            {analytics.utilizationRate}%
                          </div>
                          <div>of equipment rented</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Average Revenue */}
                  <div className="col-lg-3 col-md-6 mb-3">
                    <div className="d-flex align-items-center p-3 bg-primary bg-opacity-10 rounded-3">
                      <div className="me-3">
                        <div className="fs-4">💎</div>
                      </div>
                      <div className="flex-grow-1">
                        <div className="fw-bold text-primary">Avg Revenue</div>
                        <div className="small text-muted">
                          <div className="fw-semibold">
                            ${analytics.averageRevenue}
                          </div>
                          <div>per equipment</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Popular Category */}
                  <div className="col-lg-3 col-md-6 mb-3">
                    <div className="d-flex align-items-center p-3 bg-warning bg-opacity-10 rounded-3">
                      <div className="me-3">
                        <div className="fs-4">🔥</div>
                      </div>
                      <div className="flex-grow-1">
                        <div className="fw-bold text-warning">
                          Popular Category
                        </div>
                        <div className="small text-muted">
                          <div className="fw-semibold">
                            {analytics.mostPopularCategory}
                          </div>
                          <div>most items</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ✅ FIXED: Rental Approval Section */}
      {stats.pendingRequests > 0 && (
        <div className="row mb-4">
          <div className="col">
            <RentalApprovalSection
              currentUser={currentUser}
              onApprovalChange={handleApprovalChange}
            />
          </div>
        </div>
      )}

      {/* Equipment Section */}
      <div className="row mb-4">
        <div className="col">
          <div className="card border-0 shadow-sm">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                🔧 Your Equipment ({filteredEquipment.length})
              </h5>
              <div className="d-flex gap-2">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search equipment..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{ maxWidth: "250px" }}
                />
                {filteredEquipment.length > 0 && (
                  <button
                    className="btn btn-outline-success btn-sm"
                    onClick={exportEquipmentList}
                    data-export-btn
                    title="Export equipment list as CSV"
                  >
                    📊 Export CSV
                  </button>
                )}
                <Link to="/add-equipment" className="btn btn-primary">
                  ➕ Add New
                </Link>
              </div>
            </div>
            <div className="card-body">
              {filteredEquipment.length > 0 ? (
                <div className="row">
                  {filteredEquipment.map(item => (
                    <div key={item.id} className="col-lg-4 col-md-6 mb-4">
                      <div className="card border-0 shadow-sm h-100">
                        <div className="position-relative">
                          <div
                            style={{
                              height: "200px",
                              overflow: "hidden",
                              backgroundColor: "#f8f9fa",
                            }}
                          >
                            {item.imageUrl ? (
                              <img
                                src={item.imageUrl}
                                alt={item.name || "Equipment"}
                                className="card-img-top"
                                style={{
                                  height: "100%",
                                  width: "100%",
                                  objectFit: "cover",
                                }}
                                onError={e => {
                                  e.target.src =
                                    "https://via.placeholder.com/300x200?text=No+Image";
                                }}
                              />
                            ) : (
                              <div className="d-flex align-items-center justify-content-center h-100">
                                <i className="bi bi-tools display-4 text-muted" />
                              </div>
                            )}
                          </div>

                          <div className="position-absolute top-0 end-0 m-2">
                            <span
                              className={`badge ${item.available !== false ? "bg-success" : "bg-danger"}`}
                            >
                              {item.available !== false
                                ? "✅ Available"
                                : "🔴 Rented"}
                            </span>
                          </div>
                        </div>

                        <div className="card-body d-flex flex-column">
                          <h6 className="card-title fw-bold">
                            {item.name || "Unnamed Equipment"}
                          </h6>
                          <p className="text-muted small mb-3 flex-grow-1">
                            {item.description || "No description"}
                          </p>

                          {/* ✅ NEW: Equipment Performance Indicators */}
                          <div className="mb-2">
                            {analytics.topPerformer &&
                              analytics.topPerformer.id === item.id && (
                                <span
                                  className="badge bg-success me-1"
                                  title="Top Revenue Generator"
                                >
                                  🏆 Top Performer
                                </span>
                              )}
                            {item.available === false && (
                              <span
                                className="badge bg-info me-1"
                                title="Currently Rented"
                              >
                                📈 In Use
                              </span>
                            )}
                            {(parseFloat(item.totalRevenue) || 0) >
                              parseFloat(analytics.averageRevenue) && (
                              <span
                                className="badge bg-primary me-1"
                                title="Above Average Revenue"
                              >
                                💎 High Earner
                              </span>
                            )}
                          </div>

                          <div className="d-flex justify-content-between align-items-center mb-3">
                            <div className="h5 text-success mb-0">
                              ${item.ratePerDay || 0}/day
                            </div>
                            <small className="text-muted">
                              {item.category || "Uncategorized"}
                            </small>
                          </div>

                          <div className="d-flex gap-1">
                            <Link
                              to={`/edit-equipment/${item.id}`}
                              className="btn btn-outline-primary btn-sm flex-grow-1"
                            >
                              ✏️ Edit
                            </Link>
                            <button
                              className={`btn btn-sm ${item.available !== false ? "btn-warning" : "btn-success"}`}
                              onClick={() =>
                                handleToggleAvailability(
                                  item.id,
                                  item.available !== false,
                                )
                              }
                            >
                              {item.available !== false ? "⏸️" : "▶️"}
                            </button>
                            <button
                              className="btn btn-outline-danger btn-sm"
                              onClick={() => handleDeleteEquipment(item.id)}
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-5">
                  <div className="display-1 mb-3">🔧</div>
                  <h4>No Equipment Found</h4>
                  <p className="text-muted mb-4">
                    {searchQuery
                      ? "Try adjusting your search terms."
                      : "Start by adding your first piece of equipment."}
                  </p>
                  {!searchQuery && (
                    <Link to="/add-equipment" className="btn btn-primary">
                      ➕ Add Your First Equipment
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OwnerDashboardWithProvider() {
  return (
    <DarkModeProvider>
      <OwnerDashboard />
    </DarkModeProvider>
  );
}
