import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { getFirestore, enableNetwork } from "firebase/firestore";

let app;
let auth;
let db;

// ✅ Only initialize Firebase if NOT in test (CI)
if (process.env.NODE_ENV !== "test") {
  const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID,
    measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
  };

  try {
    app = initializeApp(firebaseConfig);
    console.log("Firebase initialized successfully");

    auth = getAuth(app);
    db = getFirestore(app);

    // Enable network only if db exists
    enableNetwork(db).catch((err) => {
      console.log("Failed to enable network:", err);
    });

  } catch (error) {
    console.error("Firebase initialization error:", error);
  }
} else {
  // ✅ CI / test safe fallback
  console.log("Firebase skipped in test environment");

  auth = {};
  db = {};
}

// Providers
export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();

// Sign-In Methods
export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);
export const signInWithFacebook = () => signInWithPopup(auth, facebookProvider);

export { auth, db };