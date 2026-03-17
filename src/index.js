import React from "react";
import { createRoot } from "react-dom/client";
import "bootstrap/dist/css/bootstrap.min.css"; // Keep if you need Bootstrap
import "bootstrap-icons/font/bootstrap-icons.css"; // Keep if you need Bootstrap icons
import "./index.css";
import "./styles/globals.css"; // Enhanced global styles
import App from "./App";
import reportWebVitals from "./reportWebVitals";

console.log("index.js loading...");
const rootElement = document.getElementById("root");
console.log("Root element found:", rootElement);

// Create a root using the new React 18 API
const root = createRoot(rootElement);

// Render your app into the root (ThemeProvider is now in App.js)
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

console.log("App rendered!");

reportWebVitals();
