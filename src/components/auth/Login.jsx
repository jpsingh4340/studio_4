import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login, signInWithGoogle, currentUser, userRole } = useAuth();
  const navigate = useNavigate();

  // Memoized role-based redirection function
  const redirectUserByRole = useCallback(
    role => {
      console.log("🎯 Redirecting user with role:", role);

      // Check for pending actions first (with security validation)
      const pendingAction = localStorage.getItem("pendingAction");
      const pendingNavigation = localStorage.getItem("pendingNavigation");

      if (pendingAction) {
        try {
          const action = JSON.parse(pendingAction);
          localStorage.removeItem("pendingAction");

          // Validate action object structure
          if (action && typeof action === "object" && typeof action.action === "string") {
            switch (action.action) {
              case "rent":
                // Sanitize equipmentId to prevent XSS
                if (action.equipmentId && /^[a-zA-Z0-9_-]+$/.test(action.equipmentId)) {
                  navigate(`/rent/${action.equipmentId}`, { replace: true });
                  return;
                }
                break;
              case "favorites":
                navigate("/favorites", { replace: true });
                return;
              case "rental-history":
                navigate("/rental-history", { replace: true });
                return;
              default:
                break;
            }
          }
        } catch (error) {
          console.error("Error parsing pending action:", error);
          localStorage.removeItem("pendingAction");
        }
      }

      if (pendingNavigation) {
        localStorage.removeItem("pendingNavigation");
        // Sanitize navigation path - only allow alphanumeric, hyphens, slashes
        const sanitizedPath = pendingNavigation.replace(/[^a-zA-Z0-9/_-]/g, '');
        if (sanitizedPath && sanitizedPath.startsWith('/')) {
          navigate(sanitizedPath, { replace: true });
          return;
        }
      }

      // Default role-based redirection
      switch (role) {
        case "admin":
          navigate("/admin-dashboard", { replace: true });
          break;
        case "owner":
          navigate("/owner-dashboard", { replace: true });
          break;
        case "renter":
        default:
          navigate("/", { replace: true }); // Redirect to public dashboard for renters
          break;
      }
    },
    [navigate],
  );

  // Redirect logged-in users based on role
  useEffect(() => {
    if (currentUser && userRole) {
      redirectUserByRole(userRole);
    }
  }, [currentUser, userRole, redirectUserByRole]);

  // Handle form submit for email/password login
  const handleSubmit = async e => {
    e.preventDefault();

    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      console.log("🔑 Attempting login for:", email);
      await login(email, password);
      // Redirection handled in useEffect on successful login
    } catch (error) {
      console.error("❌ Login error:", error);
      setError(error.message || "Failed to log in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Google Sign-In handler
  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");

    try {
      console.log("🔍 Attempting Google login...");
      // Use the existing role from Firestore if the user exists
      // or default to renter for new users
      const result = await signInWithGoogle();
      console.log("✅ Google login successful with role:", result?.role);
      // Redirection handled in useEffect on successful login
    } catch (error) {
      console.error("❌ Google login error:", error);
      setError("Failed to sign in with Google. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="d-flex align-items-center min-vh-100 position-relative"
      style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      }}
    >
      {/* Background Pattern */}
      <div
        className="position-absolute top-0 start-0 w-100 h-100"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          opacity: 0.3,
        }}
      />

      <div className="container position-relative" style={{ zIndex: 1 }}>
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div
              className="card border-0 shadow-lg"
              style={{
                borderRadius: "1.5rem",
                backdropFilter: "blur(20px)",
                backgroundColor: "rgba(255, 255, 255, 0.95)",
              }}
            >
              <div className="card-body p-4 p-md-5">
                {/* Logo & Title */}
                <div className="text-center mb-4">
                  <div className="mb-3">
                    <img
                      src="/logo.png"
                      alt="RentMate Logo"
                      style={{
                        width: "80px",
                        height: "80px",
                        objectFit: "contain",
                      }}
                    />
                  </div>
                  <h2 className="fw-bold mb-2">Welcome Back</h2>
                  <p className="text-muted mb-0">
                    Sign in to your RentMate account
                  </p>
                </div>

                {error && (
                  <div
                    className="alert alert-danger d-flex align-items-center mb-4"
                    role="alert"
                    style={{ borderRadius: "0.75rem" }}
                  >
                    <i className="bi bi-exclamation-triangle-fill me-2" />
                    <div>{error}</div>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label fw-semibold">
                      Email Address
                    </label>
                    <div className="input-group input-group-lg">
                      <span
                        className="input-group-text bg-light border-end-0"
                        style={{ borderRadius: "0.75rem 0 0 0.75rem" }}
                      >
                        <i className="bi bi-envelope text-muted" />
                      </span>
                      <input
                        type="email"
                        className="form-control border-start-0 ps-0"
                        id="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        disabled={loading}
                        required
                        style={{ borderRadius: "0 0.75rem 0.75rem 0" }}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label
                      htmlFor="password"
                      className="form-label fw-semibold"
                    >
                      Password
                    </label>
                    <div className="input-group input-group-lg">
                      <span
                        className="input-group-text bg-light border-end-0"
                        style={{ borderRadius: "0.75rem 0 0 0.75rem" }}
                      >
                        <i className="bi bi-lock text-muted" />
                      </span>
                      <input
                        type={showPassword ? "text" : "password"}
                        className="form-control border-start-0 border-end-0 ps-0"
                        id="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        disabled={loading}
                        required
                      />
                      <button
                        className="input-group-text bg-light border-start-0"
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                          borderRadius: "0 0.75rem 0.75rem 0",
                          cursor: "pointer",
                        }}
                        tabIndex="-1"
                      >
                        <i
                          className={`bi bi-eye${showPassword ? "-slash" : ""} text-muted`}
                        />
                      </button>
                    </div>
                  </div>

                  <div className="d-flex justify-content-end mb-4">
                    <Link
                      to="/forgot-password"
                      className="text-decoration-none fw-semibold"
                      style={{ color: "#667eea", fontSize: "0.875rem" }}
                    >
                      Forgot password?
                    </Link>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-lg w-100 py-3 fw-semibold text-white border-0 mb-3"
                    disabled={loading}
                    style={{
                      background:
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      borderRadius: "0.75rem",
                      transition: "transform 0.2s, box-shadow 0.2s",
                    }}
                    onMouseOver={e => {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow =
                        "0 12px 24px rgba(102, 126, 234, 0.4)";
                    }}
                    onMouseOut={e => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    {loading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        />
                        Signing in...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </button>
                </form>

                <div className="position-relative my-4">
                  <hr />
                  <div
                    className="position-absolute top-50 start-50 translate-middle bg-white px-3 text-muted fw-semibold"
                    style={{ fontSize: "0.875rem" }}
                  >
                    OR
                  </div>
                </div>

                <button
                  type="button"
                  className="btn btn-outline-secondary btn-lg w-100 d-flex align-items-center justify-content-center"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  style={{
                    borderRadius: "0.75rem",
                    transition: "all 0.2s",
                  }}
                  onMouseOver={e => {
                    e.currentTarget.style.backgroundColor = "#f8f9fa";
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 12px rgba(0, 0, 0, 0.1)";
                  }}
                  onMouseOut={e => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <img
                    src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                    alt="Google"
                    width="20"
                    height="20"
                    className="me-2"
                  />
                  Continue with Google
                </button>

                <p className="text-center mt-4 mb-0 text-muted">
                  Don't have an account?{" "}
                  <Link
                    to="/signup"
                    className="text-decoration-none fw-bold"
                    style={{ color: "#667eea" }}
                  >
                    Sign up
                  </Link>
                </p>

                {process.env.NODE_ENV === "development" && (
                  <div
                    className="mt-3 p-2 bg-info bg-opacity-10 rounded"
                    style={{ fontSize: "0.75rem" }}
                  >
                    <strong>Debug:</strong> currentUser:{" "}
                    {currentUser?.email || "None"}, userRole:{" "}
                    {userRole || "None"}
                  </div>
                )}
              </div>
            </div>

            {/* Security Notice */}
            <div className="text-center mt-3">
              <small className="text-white d-flex align-items-center justify-content-center">
                <i className="bi bi-shield-lock-fill me-2" />
                <span>Secured with industry-standard encryption</span>
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
