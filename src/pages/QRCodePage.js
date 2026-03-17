// src/pages/QRCodePage.js - Fixed without problematic imports
import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

const QRCodePage = () => {
  const { currentUser, userRole } = useAuth();
  const [activeTab, setActiveTab] = useState("scanner");

  if (!currentUser) {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-6 text-center">
            <i className="bi bi-lock display-1 text-muted" />
            <h3 className="mt-3">Authentication Required</h3>
            <p className="text-muted">Please log in to access QR code tools.</p>
            <a href="/login" className="btn btn-primary">
              Go to Login
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="row">
        <div className="col">
          <div className="d-flex align-items-center mb-4">
            <i className="bi bi-qr-code display-6 text-primary me-3" />
            <div>
              <h2 className="mb-1">QR Code Tools</h2>
              <p className="text-muted mb-0">
                Generate and scan QR codes for equipment management
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <ul className="nav nav-tabs mb-4">
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === "scanner" ? "active" : ""}`}
                onClick={() => setActiveTab("scanner")}
                type="button"
              >
                <i className="bi bi-qr-code-scan me-2" />
                Scanner
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === "generator" ? "active" : ""}`}
                onClick={() => setActiveTab("generator")}
                type="button"
              >
                <i className="bi bi-qr-code me-2" />
                Generator
              </button>
            </li>
          </ul>

          {/* Tab Content */}
          <div className="tab-content">
            {activeTab === "scanner" && (
              <div className="tab-pane fade show active">
                <div className="row justify-content-center">
                  <div className="col-md-8 col-lg-6">
                    <QRScannerPlaceholder />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "generator" && (
              <div className="tab-pane fade show active">
                <div className="row justify-content-center">
                  <div className="col-md-8 col-lg-6">
                    <QRGeneratorPlaceholder />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Simple placeholder components
const QRScannerPlaceholder = () => {
  const [scanResult, setScanResult] = useState("");

  return (
    <div className="card">
      <div className="card-header">
        <h5 className="mb-0">
          <i className="bi bi-qr-code-scan me-2" />
          QR Code Scanner (Demo)
        </h5>
      </div>
      <div className="card-body text-center">
        <div 
          style={{
            width: "250px",
            height: "250px",
            border: "2px dashed #007bff",
            margin: "0 auto 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#f8f9fa",
            borderRadius: "8px"
          }}
        >
          <div>
            <div style={{ fontSize: "48px", marginBottom: "10px" }}>📱</div>
            <p className="mb-2">Camera Scanner</p>
            <button 
              className="btn btn-primary btn-sm"
              onClick={() => setScanResult("demo-equipment-12345")}
            >
              Simulate Scan
            </button>
          </div>
        </div>
        
        {scanResult && (
          <div className="alert alert-success">
            <strong>Scanned:</strong> {scanResult}
          </div>
        )}
        
        <div className="alert alert-info">
          <small>
            <i className="bi bi-info-circle me-1" />
            QR scanning functionality will be implemented with a React 19 compatible library.
          </small>
        </div>
      </div>
    </div>
  );
};

const QRGeneratorPlaceholder = () => {
  const [qrValue, setQrValue] = useState("");
  const [showQR, setShowQR] = useState(false);

  const handleGenerate = (e) => {
    e.preventDefault();
    if (qrValue.trim()) {
      setShowQR(true);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h5 className="mb-0">
          <i className="bi bi-qr-code me-2" />
          QR Code Generator (Demo)
        </h5>
      </div>
      <div className="card-body">
        <form onSubmit={handleGenerate}>
          <div className="mb-3">
            <label htmlFor="qrValue" className="form-label">
              Content
            </label>
            <textarea
              className="form-control"
              id="qrValue"
              rows="3"
              value={qrValue}
              onChange={(e) => setQrValue(e.target.value)}
              placeholder="Enter text or URL to generate QR code"
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Generate QR Code
          </button>
        </form>

        {showQR && qrValue && (
          <div className="mt-4 text-center">
            <hr />
            <div 
              style={{
                width: "200px",
                height: "200px",
                border: "1px solid #ddd",
                margin: "0 auto",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#f8f9fa"
              }}
            >
              <div>
                <div style={{ fontSize: "32px" }}>QR</div>
                <small>Placeholder</small>
              </div>
            </div>
            <p className="mt-2 text-muted">QR Code for: {qrValue}</p>
            <div className="alert alert-info">
              <small>QR generation will be implemented with a compatible library.</small>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRCodePage;
