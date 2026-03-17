// src/firebase.js - Remove unused imports

import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
  // Remove unused emulator imports:
  // connectAuthEmulator - not used
  // connectFirestoreEmulator - not used
} from "firebase/auth";
import {
  getFirestore,
  enableNetwork,
  // Remove unused emulator import:
  // connectFirestoreEmulator - not used
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

let app;
try {
  app = initializeApp(firebaseConfig);
  console.log("Firebase initialized successfully");
} catch (error) {
  console.error("Firebase initialization error:", error);
}

const auth = getAuth(app);
const db = getFirestore(app);

// Set up providers
export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();

// Sign-In Methods
export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);
export const signInWithFacebook = () => signInWithPopup(auth, facebookProvider);

// Enable offline persistence
enableNetwork(db).catch(err => {
  console.log("Failed to enable network persistence:", err);
});

// Optional: Connect to emulators (commented out since not used)
// if (process.env.NODE_ENV === 'development' && window.location.hostname === 'localhost') {
//   // Uncomment these lines if you want to use Firebase emulators in development
//   // const { connectAuthEmulator } = require("firebase/auth");
//   // const { connectFirestoreEmulator } = require("firebase/firestore");
//   // connectAuthEmulator(auth, "http://localhost:9099");
//   // connectFirestoreEmulator(db, 'localhost', 8080);
// }

export { auth, db };
