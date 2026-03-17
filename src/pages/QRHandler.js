// src/pages/QRHandler.js - Fixed without problematic imports
import React, { useState } from "react";

const QRHandler = () => {
  const [scanResult, setScanResult] = useState(null);

  const simulateScan = () => {
    setScanResult("demo-equipment-12345");
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h2>QR Code Scanner (Demo Mode)</h2>
      
      <div style={{
        width: "300px",
        height: "300px",
        border: "2px dashed #007bff",
        margin: "20px auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f8f9fa"
      }}>
        <div>
          <div style={{ fontSize: "48px", marginBottom: "10px" }}>📱</div>
          <p>QR Scanner Placeholder</p>
          <button 
            onClick={simulateScan}
            style={{
              padding: "10px 20px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer"
            }}
          >
            Simulate Scan
          </button>
        </div>
      </div>

      {scanResult && (
        <div style={{ marginTop: "20px", padding: "15px", backgroundColor: "#d4edda", borderRadius: "5px" }}>
          <h3>Scanned Result:</h3>
          <p><strong>{scanResult}</strong></p>
          <small>This is a demo result. Real QR scanning will be implemented later.</small>
        </div>
      )}
    </div>
  );
};

export default QRHandler;
