/**
 * Notification Management Cloud Functions
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');

const db = admin.firestore();

/**
 * Callable Function: Send Email Notification
 */
exports.sendEmailNotification = functions.https.onCall(async (data, context) => {
  try {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { to, subject, message } = data;

    // Validate inputs
    if (!to || !subject || !message) {
      throw new functions.https.HttpsError('invalid-argument', 'Missing required fields');
    }

    // Import email service
    const { sendGenericEmail } = require('./emailService');

    // Send email
    await sendGenericEmail(to, subject, message);

    console.log(`✅ Email sent to ${to}`);
    return { success: true, message: 'Email sent successfully' };
  } catch (error) {
    console.error('❌ Error in sendEmailNotification:', error);
    throw error;
  }
});

/**
 * Callable Function: Create In-App Notification
 */
exports.createInAppNotification = functions.https.onCall(async (data, context) => {
  try {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { userId, type, title, message, metadata } = data;

    // Validate inputs
    if (!userId || !title || !message) {
      throw new functions.https.HttpsError('invalid-argument', 'Missing required fields');
    }

    // Check if caller is admin or the target user
    const callerDoc = await db.collection('users').doc(context.auth.uid).get();
    const isAdmin = callerDoc.data()?.role === 'admin';

    if (!isAdmin && context.auth.uid !== userId) {
      throw new functions.https.HttpsError('permission-denied', 'Permission denied');
    }

    // Create notification
    const notification = {
      userId,
      type: type || 'general',
      title,
      message,
      metadata: metadata || {},
      read: false,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection('notifications').add(notification);

    console.log(`✅ Notification created for user ${userId}`);
    return { success: true, notificationId: docRef.id };
  } catch (error) {
    console.error('❌ Error in createInAppNotification:', error);
    throw error;
  }
});
