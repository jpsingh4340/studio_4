import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { TermsModal, PrivacyModal } from "./LegalModals";

export default function Signup() {
  // Form data state
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    passwordConfirm: "",
    role: "renter", // Default role
    termsChecked: false,
    privacyChecked: false,
  });

  // UI state
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [touched, setTouched] = useState({});
  const [formErrors, setFormErrors] = useState({});
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  const { signup, signInWithGoogle, currentUser } = useAuth();
  const navigate = useNavigate();

  // Handle input changes
  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;
    setFormData(prev => ({
      ...prev,
      [name]: newValue,
    }));
  };

  // Mark field as touched
  const handleBlur = field => {
    setTouched(prev => ({
      ...prev,
      [field]: true,
    }));
  };

  // Password strength calculation
  const getPasswordStrength = password => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    return strength;
  };

  // Get password strength info
  const getStrengthInfo = strength => {
    if (strength <= 1)
      return { text: "Very weak", color: "danger", width: "25%" };
    if (strength === 2) return { text: "Weak", color: "warning", width: "50%" };
    if (strength === 3) return { text: "Good", color: "info", width: "75%" };
    return { text: "Strong", color: "success", width: "100%" };
  };

  // Form validation
  useEffect(() => {
    const errors = {};
    if (touched.fullName && !formData.fullName.trim()) {
      errors.fullName = "Name is required";
    }
    if (touched.email) {
      if (!formData.email) {
        errors.email = "Email is required";
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        errors.email = "Please enter a valid email address";
      }
    }
    if (touched.password) {
      if (!formData.password) {
        errors.password = "Password is required";
      } else if (formData.password.length < 8) {
        errors.password = "Password must be at least 8 characters";
      } else if (!/[A-Z]/.test(formData.password)) {
        errors.password = "Password must contain at least one uppercase letter";
      } else if (!/[0-9]/.test(formData.password)) {
        errors.password = "Password must contain at least one number";
      } else if (!/[^A-Za-z0-9]/.test(formData.password)) {
        errors.password =
          "Password must contain at least one special character";
      }
    }
    if (touched.passwordConfirm) {
      if (!formData.passwordConfirm) {
        errors.passwordConfirm = "Please confirm your password";
      } else if (formData.password !== formData.passwordConfirm) {
        errors.passwordConfirm = "Passwords do not match";
      }
    }
    setFormErrors(errors);
  }, [formData, touched]);

  // Role-based redirection
  const redirectUserByRole = role => {
    console.log("📍 Redirecting user with role:", role);

    // Force role to string and trim to handle any unexpected inputs
    const normalizedRole = String(role || "")
      .trim()
      .toLowerCase();
    console.log("🔄 Normalized role:", normalizedRole);

    switch (normalizedRole) {
      case "admin":
        console.log("🔐 Redirecting to admin dashboard");
        navigate("/admin-dashboard");
        break;
      case "owner":
        console.log("🏠 Redirecting to owner dashboard");
        navigate("/owner-dashboard");
        break;
      case "renter":
        console.log("👤 Redirecting to renter dashboard");
        navigate("/renter-dashboard");
        break;
      default:
        console.log(
          "⚠️ No specific role found, defaulting to renter dashboard",
        );
        navigate("/renter-dashboard");
        break;
    }
  };

  // Continue to next step
  const handleContinue = e => {
    e.preventDefault();
    // Mark all fields in current step as touched
    const stepFields =
      step === 1
        ? ["fullName", "email"]
        : ["password", "passwordConfirm", "termsChecked", "privacyChecked"];
    const newTouched = { ...touched };
    stepFields.forEach(field => {
      newTouched[field] = true;
    });
    setTouched(newTouched);

    // Check for errors in current step
    const hasErrors = stepFields.some(field => {
      if (field === "termsChecked" && !formData.termsChecked) return true;
      if (field === "privacyChecked" && !formData.privacyChecked) return true;
      return formErrors[field];
    });

    // For step 1, check if terms/privacy would be valid
    if (step === 1 && !hasErrors) {
      setStep(2);
    }

    // For final step, submit the form
    if (step === 2 && !hasErrors) {
      handleSubmit(e);
    }
  };

  // Go back to previous step
  const handleBack = () => {
    setStep(1);
  };

  // Form submission
  const handleSubmit = async e => {
    if (e) e.preventDefault();

    // Check terms and privacy
    if (!formData.termsChecked || !formData.privacyChecked) {
      setError("You must accept the Terms of Service and Privacy Policy");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Double check that we're using the correct role for signup
      console.log("🔍 Selected role before email signup:", formData.role);

      const result = await signup(
        formData.email,
        formData.password,
        formData.fullName,
        formData.role, // Make sure role is being passed correctly
      );

      console.log("📝 Email signup result:", result);

      // Explicitly use the role from form data if not in result
      const roleToUse = result?.role || formData.role;
      console.log("🎯 Using role for redirection:", roleToUse);

      // Add more detailed logging for debugging
      console.log(
        `🚀 Email signup redirecting to ${roleToUse === "owner" ? "owner" : roleToUse === "admin" ? "admin" : "renter"} dashboard`,
      );

      // Redirect based on role - use the role from formData if not in result
      redirectUserByRole(roleToUse);
    } catch (err) {
      console.error("❌ Signup error:", err);
      setError(err.message || "Failed to create account");
      window.scrollTo(0, 0); // Scroll to top to show error
    } finally {
      setLoading(false);
    }
  };

  // Google Sign-In handler
  const handleGoogleSignUp = async () => {
    setLoading(true);
    setError("");
    try {
      // Double check that we have the correct role from form data
      console.log("🔍 Selected role before Google signup:", formData.role);

      // Explicitly pass the selected role to Google sign-in
      const result = await signInWithGoogle(formData.role);
      console.log("📝 Google signup result:", result);

      // Use the role returned from the API if available, otherwise fall back to form data
      const roleToUse = result?.role || formData.role;
      console.log("🎯 Using role for redirection:", roleToUse);

      // Redirect based on role with diagnostic
      console.log(
        `🚀 Google signup redirecting to ${roleToUse === "owner" ? "owner" : "renter"} dashboard`,
      );
      redirectUserByRole(roleToUse);
    } catch (error) {
      setError("Failed to sign up with Google. Please try again.");
      console.error("❌ Google Sign-Up Error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  // Password strength data
  const strengthInfo = getStrengthInfo(getPasswordStrength(formData.password));

  return (
    <div
      className="min-vh-100 d-flex align-items-center py-5 position-relative"
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
          <div className="col-lg-5 col-md-8">
            <div
              className="card border-0 shadow-lg"
              style={{
                borderRadius: "1.5rem",
                backdropFilter: "blur(20px)",
                backgroundColor: "rgba(255, 255, 255, 0.95)",
              }}
            >
              {/* Card Header */}
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
                  <h2 className="fw-bold mb-2">Create Your Account</h2>
                  <p className="text-muted mb-0">
                    Join RentMate today to start renting equipment
                  </p>
                </div>

                {/* Progress Steps */}
                <div className="d-flex justify-content-center mb-4">
                  <div className="position-relative d-flex align-items-center w-75">
                    <div
                      className="position-relative rounded-circle text-white d-flex align-items-center justify-content-center"
                      style={{
                        width: "40px",
                        height: "40px",
                        zIndex: 1,
                        background:
                          step >= 1
                            ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                            : "#6c757d",
                      }}
                    >
                      <i className="bi bi-person-fill" />
                    </div>
                    <div className="flex-grow-1 mx-3 progress" style={{ height: "4px" }}>
                      <div
                        className="progress-bar"
                        style={{
                          width: step >= 2 ? "100%" : "0%",
                          transition: "width 0.5s",
                          background:
                            "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        }}
                      />
                    </div>
                    <div
                      className="position-relative rounded-circle text-white d-flex align-items-center justify-content-center"
                      style={{
                        width: "40px",
                        height: "40px",
                        zIndex: 1,
                        background:
                          step >= 2
                            ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                            : "#6c757d",
                      }}
                    >
                      <i className="bi bi-shield-lock-fill" />
                    </div>
                  </div>
                </div>
                {/* Error Display */}
                {error && (
                  <div
                    className="alert alert-danger d-flex align-items-center mb-4"
                    role="alert"
                    style={{ borderRadius: "0.75rem" }}
                  >
                    <i className="bi bi-exclamation-triangle-fill me-2 flex-shrink-0" />
                    <div>{error}</div>
                  </div>
                )}
                {/* Step 1: Account Info */}
                {step === 1 && (
                  <>
                    {/* Role Selection */}
                    <div className="mb-4">
                      <label htmlFor="role" className="form-label fw-semibold">
                        I want to:
                      </label>
                      <select
                        id="role"
                        name="role"
                        className="form-select form-select-lg"
                        value={formData.role}
                        onChange={e => {
                          const selectedRole = e.target.value;
                          console.log("📝 Role changed to:", selectedRole);
                          setFormData(prev => ({
                            ...prev,
                            role: selectedRole,
                          }));
                        }}
                        disabled={loading}
                        style={{ borderRadius: "0.75rem" }}
                      >
                        <option value="renter">Rent Equipment</option>
                        <option value="owner">List My Equipment</option>
                        {currentUser && currentUser.role === "admin" && (
                          <option value="admin">Admin Access</option>
                        )}
                      </select>
                    </div>
                    {/* Social Sign Up */}
                    <div className="mb-4">
                      <button
                        type="button"
                        className="btn btn-outline-secondary btn-lg w-100 d-flex align-items-center justify-content-center"
                        onClick={handleGoogleSignUp}
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
                        <span>Sign up with Google</span>
                      </button>
                    </div>
                    {/* Divider */}
                    <div className="position-relative my-4">
                      <hr />
                      <div
                        className="position-absolute top-50 start-50 translate-middle bg-white px-3 text-muted fw-semibold"
                        style={{ fontSize: "0.875rem" }}
                      >
                        OR
                      </div>
                    </div>
                    {/* Form */}
                    <form onSubmit={handleContinue}>
                      {/* Full Name Field */}
                      <div className="mb-3">
                        <label
                          htmlFor="fullName"
                          className="form-label fw-semibold"
                        >
                          Full Name
                        </label>
                        <div className="input-group input-group-lg mb-1">
                          <span
                            className="input-group-text bg-light border-end-0"
                            style={{ borderRadius: "0.75rem 0 0 0.75rem" }}
                          >
                            <i className="bi bi-person text-muted" />
                          </span>
                          <input
                            type="text"
                            className={`form-control border-start-0 ps-0 ${touched.fullName ? (formErrors.fullName ? "is-invalid" : "is-valid") : ""}`}
                            id="fullName"
                            name="fullName"
                            placeholder="John Doe"
                            value={formData.fullName}
                            onChange={handleChange}
                            onBlur={() => handleBlur("fullName")}
                            disabled={loading}
                            autoFocus
                            style={{ borderRadius: "0 0.75rem 0.75rem 0" }}
                          />
                          {touched.fullName && formErrors.fullName && (
                            <div className="invalid-feedback">
                              {formErrors.fullName}
                            </div>
                          )}
                        </div>
                      </div>
                      {/* Email Field */}
                      <div className="mb-4">
                        <label
                          htmlFor="email"
                          className="form-label fw-semibold"
                        >
                          Email Address
                        </label>
                        <div className="input-group input-group-lg mb-1">
                          <span
                            className="input-group-text bg-light border-end-0"
                            style={{ borderRadius: "0.75rem 0 0 0.75rem" }}
                          >
                            <i className="bi bi-envelope text-muted" />
                          </span>
                          <input
                            type="email"
                            className={`form-control border-start-0 ps-0 ${touched.email ? (formErrors.email ? "is-invalid" : "is-valid") : ""}`}
                            id="email"
                            name="email"
                            placeholder="you@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            onBlur={() => handleBlur("email")}
                            disabled={loading}
                            style={{ borderRadius: "0 0.75rem 0.75rem 0" }}
                          />
                          {touched.email && formErrors.email && (
                            <div className="invalid-feedback">
                              {formErrors.email}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="d-grid">
                        <button
                          type="submit"
                          className="btn btn-lg w-100 py-3 fw-semibold text-white border-0"
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
                          Continue
                        </button>
                      </div>
                    </form>
                  </>
                )}
                {/* Step 2: Password and Terms */}
                {step === 2 && (
                  <form onSubmit={handleContinue}>
                    {/* Password Field */}
                    <div className="mb-3">
                      <label
                        htmlFor="password"
                        className="form-label fw-semibold"
                      >
                        Create Password
                      </label>
                      <div className="input-group input-group-lg mb-1">
                        <span
                          className="input-group-text bg-light border-end-0"
                          style={{ borderRadius: "0.75rem 0 0 0.75rem" }}
                        >
                          <i className="bi bi-lock text-muted" />
                        </span>
                        <input
                          type={showPassword ? "text" : "password"}
                          className={`form-control border-start-0 border-end-0 ps-0 ${touched.password ? (formErrors.password ? "is-invalid" : "is-valid") : ""}`}
                          id="password"
                          name="password"
                          placeholder="Create a secure password"
                          value={formData.password}
                          onChange={handleChange}
                          onBlur={() => handleBlur("password")}
                          disabled={loading}
                          autoComplete="new-password"
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
                        {touched.password && formErrors.password && (
                          <div className="invalid-feedback">
                            {formErrors.password}
                          </div>
                        )}
                      </div>
                      {/* Password Strength Meter */}
                      {formData.password && (
                        <div className="mt-2 mb-3">
                          <div className="d-flex justify-content-between align-items-center mb-1">
                            <small>Password strength:</small>
                            <small className={`text-${strengthInfo.color}`}>
                              {strengthInfo.text}
                            </small>
                          </div>
                          <div className="progress" style={{ height: "6px" }}>
                            <div
                              className={`progress-bar bg-${strengthInfo.color}`}
                              role="progressbar"
                              style={{ width: strengthInfo.width }}
                              aria-valuenow="25"
                              aria-valuemin="0"
                              aria-valuemax="100"
                             />
                          </div>
                        </div>
                      )}
                      {/* Password Requirements */}
                      <div className="card bg-light border-0 p-3 mb-3" style={{ borderRadius: "0.75rem" }}>
                        <small className="text-muted mb-2">
                          Password requirements:
                        </small>
                        <div className="d-flex flex-wrap gap-2">
                          <span
                            className={`badge ${formData.password.length >= 8 ? "bg-success" : "bg-secondary"}`}
                          >
                            <i
                              className={`bi bi-${formData.password.length >= 8 ? "check-circle" : "x-circle"} me-1`}
                            />
                            8+ characters
                          </span>
                          <span
                            className={`badge ${/[A-Z]/.test(formData.password) ? "bg-success" : "bg-secondary"}`}
                          >
                            <i
                              className={`bi bi-${/[A-Z]/.test(formData.password) ? "check-circle" : "x-circle"} me-1`}
                            />
                            Uppercase
                          </span>
                          <span
                            className={`badge ${/[0-9]/.test(formData.password) ? "bg-success" : "bg-secondary"}`}
                          >
                            <i
                              className={`bi bi-${/[0-9]/.test(formData.password) ? "check-circle" : "x-circle"} me-1`}
                            />
                            Number
                          </span>
                          <span
                            className={`badge ${/[^A-Za-z0-9]/.test(formData.password) ? "bg-success" : "bg-secondary"}`}
                          >
                            <i
                              className={`bi bi-${/[^A-Za-z0-9]/.test(formData.password) ? "check-circle" : "x-circle"} me-1`}
                            />
                            Special character
                          </span>
                        </div>
                      </div>
                    </div>
                    {/* Confirm Password Field */}
                    <div className="mb-4">
                      <label
                        htmlFor="passwordConfirm"
                        className="form-label fw-semibold"
                      >
                        Confirm Password
                      </label>
                      <div className="input-group input-group-lg mb-1">
                        <span
                          className="input-group-text bg-light border-end-0"
                          style={{ borderRadius: "0.75rem 0 0 0.75rem" }}
                        >
                          <i className="bi bi-shield-lock text-muted" />
                        </span>
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          className={`form-control border-start-0 border-end-0 ps-0 ${touched.passwordConfirm ? (formErrors.passwordConfirm ? "is-invalid" : "is-valid") : ""}`}
                          id="passwordConfirm"
                          name="passwordConfirm"
                          placeholder="Re-enter your password"
                          value={formData.passwordConfirm}
                          onChange={handleChange}
                          onBlur={() => handleBlur("passwordConfirm")}
                          disabled={loading}
                          autoComplete="new-password"
                        />
                        <button
                          className="input-group-text bg-light border-start-0"
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          style={{
                            borderRadius: "0 0.75rem 0.75rem 0",
                            cursor: "pointer",
                          }}
                          tabIndex="-1"
                        >
                          <i
                            className={`bi bi-eye${showConfirmPassword ? "-slash" : ""} text-muted`}
                          />
                        </button>
                        {touched.passwordConfirm &&
                          formErrors.passwordConfirm && (
                            <div className="invalid-feedback">
                              {formErrors.passwordConfirm}
                            </div>
                          )}
                      </div>
                    </div>
                    {/* Terms and Privacy */}
                    <div className="mb-4">
                      <div className="form-check mb-2">
                        <input
                          type="checkbox"
                          className={`form-check-input ${touched.termsChecked && !formData.termsChecked ? "is-invalid" : ""}`}
                          id="termsChecked"
                          name="termsChecked"
                          checked={formData.termsChecked}
                          onChange={handleChange}
                          onBlur={() => handleBlur("termsChecked")}
                          disabled={loading}
                        />
                        <label
                          className="form-check-label"
                          htmlFor="termsChecked"
                        >
                          I agree to the{" "}
                          <button
                            type="button"
                            className="btn btn-link p-0 text-decoration-none fw-semibold"
                            onClick={() => setShowTermsModal(true)}
                          >
                            Terms of Service
                          </button>
                        </label>
                      </div>
                      <div className="form-check">
                        <input
                          type="checkbox"
                          className={`form-check-input ${touched.privacyChecked && !formData.privacyChecked ? "is-invalid" : ""}`}
                          id="privacyChecked"
                          name="privacyChecked"
                          checked={formData.privacyChecked}
                          onChange={handleChange}
                          onBlur={() => handleBlur("privacyChecked")}
                          disabled={loading}
                        />
                        <label
                          className="form-check-label"
                          htmlFor="privacyChecked"
                        >
                          I agree to the{" "}
                          <button
                            type="button"
                            className="btn btn-link p-0 text-decoration-none fw-semibold"
                            onClick={() => setShowPrivacyModal(true)}
                          >
                            Privacy Policy
                          </button>
                        </label>
                      </div>
                    </div>
                    {/* Action Buttons */}
                    <div className="d-grid gap-2">
                      <button
                        type="submit"
                        className="btn btn-lg w-100 py-3 fw-semibold text-white border-0"
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
                            Creating Account...
                          </>
                        ) : (
                          "Create Account"
                        )}
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-secondary btn-lg"
                        onClick={handleBack}
                        disabled={loading}
                        style={{
                          borderRadius: "0.75rem",
                          transition: "all 0.2s",
                        }}
                        onMouseOver={e => {
                          e.currentTarget.style.backgroundColor = "#f8f9fa";
                        }}
                        onMouseOut={e => {
                          e.currentTarget.style.backgroundColor = "transparent";
                        }}
                      >
                        Back
                      </button>
                    </div>
                  </form>
                )}
                {/* Login Link */}
                <div className="mt-4 text-center">
                  <p className="mb-0 text-muted">
                    Already have an account?{" "}
                    <Link
                      to="/login"
                      className="text-decoration-none fw-bold"
                      style={{ color: "#667eea" }}
                    >
                      Log in
                    </Link>
                  </p>
                </div>
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

      {/* Legal Document Modals */}
      <TermsModal
        show={showTermsModal}
        onHide={() => setShowTermsModal(false)}
      />
      <PrivacyModal
        show={showPrivacyModal}
        onHide={() => setShowPrivacyModal(false)}
      />
    </div>
  );
}
