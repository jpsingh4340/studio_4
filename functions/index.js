/**
 * RentMate Cloud Functions
 *
 * This file contains all Firebase Cloud Functions for the RentMate platform.
 * Functions include user management, rental workflows, notifications, and payments.
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize Firebase Admin
admin.initializeApp();

// Import function modules
const userFunctions = require('./src/userFunctions');
const rentalFunctions = require('./src/rentalFunctions');
const notificationFunctions = require('./src/notificationFunctions');
const paymentFunctions = require('./src/paymentFunctions');
const scheduledFunctions = require('./src/scheduledFunctions');

// Export all functions
module.exports = {
  // User Management Functions
  onUserCreate: userFunctions.onUserCreate,
  setUserRole: userFunctions.setUserRole,

  // Rental Workflow Functions
  onRentalCreate: rentalFunctions.onRentalCreate,
  onRentalUpdate: rentalFunctions.onRentalUpdate,
  approveRental: rentalFunctions.approveRental,
  rejectRental: rentalFunctions.rejectRental,

  // Notification Functions
  sendEmailNotification: notificationFunctions.sendEmailNotification,
  createInAppNotification: notificationFunctions.createInAppNotification,

  // Payment Functions
  createPaymentIntent: paymentFunctions.createPaymentIntent,
  handleStripeWebhook: paymentFunctions.handleStripeWebhook,
  processPayment: paymentFunctions.processPayment,

  // Scheduled Functions
  generateDailyReports: scheduledFunctions.generateDailyReports,
  cleanupOldNotifications: scheduledFunctions.cleanupOldNotifications,
  checkOverdueRentals: scheduledFunctions.checkOverdueRentals,
};
