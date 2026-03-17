import React, { useState } from 'react';

// Temporary QR Scanner component for CI/CD compatibility
const QRScanner = ({ onResult, onError, width = 300, height = 300 }) => {
  const [scanning, setScanning] = useState(false);

  const simulateScan = () => {
    setScanning(true);
    // Simulate scanning delay
    setTimeout(() => {
      setScanning(false);
      if (onResult) {
        onResult('demo-equipment-12345'); // Demo QR code result
      }
    }, 2000);
  };

  return (
    <div style={{ 
      width: width, 
      height: height,
      border: '2px dashed #007bff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '10px auto',
      backgroundColor: '#f8f9fa'
    }}>
      {scanning ? (
        <div>
          <div style={{ 
            width: '50px', 
            height: '50px', 
            border: '4px solid #007bff',
            borderTop: '4px solid transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p>📱 Scanning...</p>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      ) : (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '10px' }}>📱</div>
          <p>QR Code Scanner</p>
          <button 
            onClick={simulateScan}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Start Scan (Demo)
          </button>
          <p style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
            Demo mode - will return: demo-equipment-12345
          </p>
        </div>
      )}
    </div>
  );
};

export default QRScanner;

// Export alternative names for compatibility
export const QrReader = QRScanner;
export const Html5QrcodeReader = QRScanner;
