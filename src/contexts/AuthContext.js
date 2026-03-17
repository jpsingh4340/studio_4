// src/contexts/AuthContext.js - Fix useEffect dependency warning

import React, { useContext, useState, useEffect, useCallback } from "react";
import {
  onAuthStateChanged,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  sendPasswordResetEmail,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";

const AuthContext = React.createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  console.log("🔥 AuthProvider State:", {
    currentUser: currentUser?.email,
    userRole,
    loading,
    authChecked,
    timestamp: new Date().toISOString(),
  });

  async function createUserDocument(user, additionalData = {}) {
    if (!user) return null;

    const userDocRef = doc(db, "users", user.uid);

    try {
      console.log("📄 Checking user document for UID:", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        // For new users, make sure we use the role passed from the signup component
        const roleToSet = additionalData.role || "renter";
        console.log("🔐 New user, setting role:", roleToSet);

        const userData = {
          displayName:
            user.displayName ||
            additionalData.fullName ||
            user.email.split("@")[0],
          email: user.email,
          role: roleToSet,
          createdAt: serverTimestamp(),
          // Exclude role from spread to prevent overrides with undefined
          ...Object.keys(additionalData)
            .filter(key => key !== "role")
            .reduce((obj, key) => {
              obj[key] = additionalData[key];
              return obj;
            }, {}),
        };

        console.log("✍️ Creating new user document with role:", userData.role);
        await setDoc(userDocRef, userData);
        console.log("✅ User document created successfully");
        return userData.role;
      } else {
        const existingData = userDoc.data();
        console.log("📋 Existing user document found:", existingData);

        // If a specific role is provided and it's different from the stored one,
        // update the user's role (useful for role switches)
        if (additionalData.role && additionalData.role !== existingData.role) {
          console.log(
            "🔄 Updating user role from",
            existingData.role,
            "to",
            additionalData.role,
          );
          await setDoc(
            userDocRef,
            { role: additionalData.role },
            { merge: true },
          );
          return additionalData.role;
        }

        return existingData.role || "renter";
      }
    } catch (error) {
      console.error("❌ Error with user document:", error);
      return additionalData.role || "renter";
    }
  }

  async function getUserRole(uid) {
    if (!uid) return "renter";

    try {
      console.log("🔍 Getting user role for UID:", uid);

      const userDocRef = doc(db, "users", uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const role = userData.role || "renter";
        console.log("👤 User role found:", role);
        return role;
      } else {
        console.log("⚠️ No user document found, defaulting to renter");
        return "renter";
      }
    } catch (error) {
      console.error("❌ Error getting user role:", error);
      return "renter";
    }
  }

  async function signup(email, password, fullName, role = "renter") {
    console.log("🚀 Starting signup process:", { email, fullName, role });

    try {
      setLoading(true);
      const result = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      console.log("✅ Firebase user created:", result.user.uid);

      if (fullName) {
        await updateProfile(result.user, { displayName: fullName });
        console.log("✅ Display name updated");
      }

      const actualRole = await createUserDocument(result.user, {
        role,
        fullName,
      });
      console.log("✅ User document created with role:", actualRole);

      return { user: result.user, role: actualRole };
    } catch (error) {
      console.error("❌ Signup error:", error);
      setLoading(false);
      throw error;
    }
  }

  async function login(email, password) {
    console.log("🔑 Starting login process for:", email);

    try {
      setLoading(true);
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log("✅ Login successful:", result.user.uid);

      const role = await getUserRole(result.user.uid);
      console.log("✅ Role retrieved:", role);

      return { user: result.user, role };
    } catch (error) {
      console.error("❌ Login error:", error);
      setLoading(false);
      throw error;
    }
  }

  async function signInWithGoogle(role = "renter") {
    console.log("🔍 Starting Google signin with role:", role);

    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      const result = await signInWithPopup(auth, provider);
      console.log("✅ Google signin successful:", result.user.uid);

      // IMPORTANT: Make sure we're using the role passed from the signup component
      const explicitRole = role || "renter";
      console.log("🔐 Using explicit role for Google signin:", explicitRole);

      const actualRole = await createUserDocument(result.user, {
        role: explicitRole,
      });
      console.log("✅ Google user role:", actualRole);

      // Set the user role immediately to avoid async issues
      setUserRole(actualRole);

      return { user: result.user, role: actualRole };
    } catch (error) {
      console.error("❌ Google signin error:", error);
      setLoading(false);
      throw error;
    }
  }

  async function resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error("❌ Reset password error:", error);
      throw error;
    }
  }

  async function logout() {
    try {
      console.log("🚪 Logging out...");
      await signOut(auth);
      setUserRole(null);
      setCurrentUser(null);
      console.log("✅ Logout successful");
    } catch (error) {
      console.error("❌ Logout error:", error);
      throw error;
    }
  }

  const handleAuthStateChange = useCallback(async user => {
    console.log(
      "🔄 Auth state changed:",
      user ? `${user.email} (${user.uid})` : "No user",
    );

    try {
      if (user) {
        console.log("👤 User authenticated, getting role...");
        setCurrentUser(user);

        const role = await getUserRole(user.uid);
        console.log("✅ Role set:", role);
        setUserRole(role);
      } else {
        console.log("👤 No user, clearing state...");
        setCurrentUser(null);
        setUserRole(null);
      }
    } catch (error) {
      console.error("❌ Error in auth state observer:", error);
      if (user) {
        setCurrentUser(user);
        setUserRole("renter"); // Fallback
      }
    } finally {
      setLoading(false);
      setAuthChecked(true);
      console.log("✅ Auth check completed");
    }
  }, []);

  useEffect(() => {
    console.log("👂 Setting up auth state listener...");

    const unsubscribe = onAuthStateChanged(auth, handleAuthStateChange);

    const timeout = setTimeout(() => {
      if (!authChecked) {
        console.log("⏰ Auth timeout, setting checked to true");
        setLoading(false);
        setAuthChecked(true);
      }
    }, 10000);

    return () => {
      clearTimeout(timeout);
      unsubscribe();
    };
  }, [handleAuthStateChange, authChecked]); // <-- Added authChecked here

  const value = {
    currentUser,
    userRole,
    loading,
    authChecked,
    signup,
    login,
    logout,
    signInWithGoogle,
    resetPassword,
  };

  console.log("🎯 AuthProvider final state:", {
    currentUser: currentUser?.email,
    userRole,
    loading,
    authChecked,
  });

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
