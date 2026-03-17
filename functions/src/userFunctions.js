/**
 * User Management Cloud Functions
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { sendWelcomeEmail } = require('./emailService');

const db = admin.firestore();

/**
 * Trigger: When a new user is created in Firebase Auth
 * Action: Create user profile in Firestore and send welcome email
 */
exports.onUserCreate = functions.auth.user().onCreate(async (user) => {
  try {
    const { uid, email, displayName, photoURL } = user;

    // Create user profile in Firestore
    await db.collection('users').doc(uid).set({
      email,
      displayName: displayName || email.split('@')[0],
      photoURL: photoURL || null,
      role: 'renter', // Default role
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      isActive: true,
      emailVerified: user.emailVerified || false,
    });

    // Create welcome notification
    await db.collection('notifications').add({
      userId: uid,
      type: 'welcome',
      title: 'Welcome to RentMate! 🎉',
      message: 'Thank you for joining RentMate. Start browsing equipment or list your own to earn money!',
      read: false,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Send welcome email
    if (email) {
      await sendWelcomeEmail(email, displayName || 'User');
    }

    console.log(`✅ User profile created successfully for ${uid}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Error in onUserCreate:', error);
    throw new functions.https.HttpsError('internal', 'Failed to create user profile');
  }
});

/**
 * Callable Function: Set user role (Admin only)
 */
exports.setUserRole = functions.https.onCall(async (data, context) => {
  try {
    // Check authentication
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    // Check if caller is admin
    const callerDoc = await db.collection('users').doc(context.auth.uid).get();
    if (!callerDoc.exists || callerDoc.data().role !== 'admin') {
      throw new functions.https.HttpsError('permission-denied', 'Only admins can set user roles');
    }

    const { userId, newRole } = data;

    // Validate role
    if (!['admin', 'owner', 'renter'].includes(newRole)) {
      throw new functions.https.HttpsError('invalid-argument', 'Invalid role specified');
    }

    // Update user role
    await db.collection('users').doc(userId).update({
      role: newRole,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Log admin action
    await db.collection('adminActions').add({
      action: 'role_change',
      targetUserId: userId,
      newRole,
      adminId: context.auth.uid,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Notify user of role change
    await db.collection('notifications').add({
      userId,
      type: 'role_change',
      title: 'Your Role Has Been Updated',
      message: `Your account role has been changed to ${newRole}. You now have access to ${newRole} features.`,
      read: false,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log(`✅ User ${userId} role changed to ${newRole} by admin ${context.auth.uid}`);
    return { success: true, message: `User role updated to ${newRole}` };
  } catch (error) {
    console.error('❌ Error in setUserRole:', error);
    throw error;
  }
});
