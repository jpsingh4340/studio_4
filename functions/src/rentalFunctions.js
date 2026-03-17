/**
 * Rental Workflow Cloud Functions
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { sendRentalRequestEmail, sendRentalApprovalEmail, sendRentalRejectionEmail } = require('./emailService');

const db = admin.firestore();

/**
 * Trigger: When a new rental is created
 * Action: Notify equipment owner
 */
exports.onRentalCreate = functions.firestore
  .document('rentals/{rentalId}')
  .onCreate(async (snap, context) => {
    try {
      const rental = snap.data();
      const { ownerId, renterId, equipmentId, equipmentName, startDate, endDate, totalPrice } = rental;

      // Get owner and renter details
      const [ownerDoc, renterDoc, equipmentDoc] = await Promise.all([
        db.collection('users').doc(ownerId).get(),
        db.collection('users').doc(renterId).get(),
        db.collection('equipment').doc(equipmentId).get(),
      ]);

      const owner = ownerDoc.data();
      const renter = renterDoc.data();
      const equipment = equipmentDoc.data();

      // Create notification for owner
      await db.collection('notifications').add({
        userId: ownerId,
        type: 'rental_request',
        title: 'New Rental Request 📥',
        message: `${renter.displayName} wants to rent your ${equipmentName}`,
        rentalId: context.params.rentalId,
        equipmentId,
        read: false,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Send email to owner
      if (owner.email) {
        await sendRentalRequestEmail({
          to: owner.email,
          ownerName: owner.displayName,
          renterName: renter.displayName,
          equipmentName,
          startDate: startDate.toDate ? startDate.toDate() : new Date(startDate.seconds * 1000),
          endDate: endDate.toDate ? endDate.toDate() : new Date(endDate.seconds * 1000),
          totalPrice,
          rentalId: context.params.rentalId,
        });
      }

      console.log(`✅ Rental request notifications sent for ${context.params.rentalId}`);
      return { success: true };
    } catch (error) {
      console.error('❌ Error in onRentalCreate:', error);
      return { success: false, error: error.message };
    }
  });

/**
 * Trigger: When rental status is updated
 * Action: Notify relevant parties and update equipment availability
 */
exports.onRentalUpdate = functions.firestore
  .document('rentals/{rentalId}')
  .onUpdate(async (change, context) => {
    try {
      const before = change.before.data();
      const after = change.after.data();

      // Check if status changed
      if (before.status !== after.status) {
        const { renterId, ownerId, equipmentId, equipmentName, status } = after;

        // Get user details
        const [renterDoc, ownerDoc] = await Promise.all([
          db.collection('users').doc(renterId).get(),
          db.collection('users').doc(ownerId).get(),
        ]);

        const renter = renterDoc.data();
        const owner = ownerDoc.data();

        // Handle status-specific actions
        switch (status) {
          case 'approved':
            // Update equipment availability
            await db.collection('equipment').doc(equipmentId).update({
              available: false,
              currentRentalId: context.params.rentalId,
            });

            // Notify renter
            await db.collection('notifications').add({
              userId: renterId,
              type: 'rental_approved',
              title: 'Rental Approved ✅',
              message: `Your rental request for ${equipmentName} has been approved!`,
              rentalId: context.params.rentalId,
              read: false,
              timestamp: admin.firestore.FieldValue.serverTimestamp(),
            });

            // Send approval email
            if (renter.email) {
              await sendRentalApprovalEmail({
                to: renter.email,
                renterName: renter.displayName,
                equipmentName,
                ownerName: owner.displayName,
                ownerEmail: owner.email,
                rentalId: context.params.rentalId,
              });
            }
            break;

          case 'rejected':
            // Notify renter
            await db.collection('notifications').add({
              userId: renterId,
              type: 'rental_rejected',
              title: 'Rental Request Rejected',
              message: `Your rental request for ${equipmentName} has been rejected.`,
              rentalId: context.params.rentalId,
              read: false,
              timestamp: admin.firestore.FieldValue.serverTimestamp(),
            });

            // Send rejection email
            if (renter.email) {
              await sendRentalRejectionEmail({
                to: renter.email,
                renterName: renter.displayName,
                equipmentName,
                rentalId: context.params.rentalId,
              });
            }
            break;

          case 'completed':
            // Update equipment availability
            await db.collection('equipment').doc(equipmentId).update({
              available: true,
              currentRentalId: null,
            });

            // Update equipment stats
            await db.collection('equipment').doc(equipmentId).update({
              bookings: admin.firestore.FieldValue.increment(1),
              totalRevenue: admin.firestore.FieldValue.increment(after.totalPrice || 0),
            });

            // Notify both parties
            await Promise.all([
              db.collection('notifications').add({
                userId: renterId,
                type: 'rental_completed',
                title: 'Rental Completed',
                message: `Your rental of ${equipmentName} is complete. Please leave a review!`,
                rentalId: context.params.rentalId,
                read: false,
                timestamp: admin.firestore.FieldValue.serverTimestamp(),
              }),
              db.collection('notifications').add({
                userId: ownerId,
                type: 'rental_completed',
                title: 'Rental Completed',
                message: `Rental of ${equipmentName} is complete. Revenue has been added to your account.`,
                rentalId: context.params.rentalId,
                read: false,
                timestamp: admin.firestore.FieldValue.serverTimestamp(),
              }),
            ]);
            break;

          default:
            break;
        }

        console.log(`✅ Rental ${context.params.rentalId} status updated: ${status}`);
      }

      return { success: true };
    } catch (error) {
      console.error('❌ Error in onRentalUpdate:', error);
      return { success: false, error: error.message };
    }
  });

/**
 * Callable Function: Approve rental (Owner only)
 */
exports.approveRental = functions.https.onCall(async (data, context) => {
  try {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { rentalId } = data;
    const rentalDoc = await db.collection('rentals').doc(rentalId).get();

    if (!rentalDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Rental not found');
    }

    const rental = rentalDoc.data();

    // Verify caller is the owner
    if (rental.ownerId !== context.auth.uid) {
      throw new functions.https.HttpsError('permission-denied', 'Only the equipment owner can approve rentals');
    }

    // Update rental status
    await db.collection('rentals').doc(rentalId).update({
      status: 'approved',
      approvedAt: admin.firestore.FieldValue.serverTimestamp(),
      approvedBy: context.auth.uid,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log(`✅ Rental ${rentalId} approved by owner ${context.auth.uid}`);
    return { success: true, message: 'Rental approved successfully' };
  } catch (error) {
    console.error('❌ Error in approveRental:', error);
    throw error;
  }
});

/**
 * Callable Function: Reject rental (Owner only)
 */
exports.rejectRental = functions.https.onCall(async (data, context) => {
  try {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { rentalId, reason } = data;
    const rentalDoc = await db.collection('rentals').doc(rentalId).get();

    if (!rentalDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Rental not found');
    }

    const rental = rentalDoc.data();

    // Verify caller is the owner
    if (rental.ownerId !== context.auth.uid) {
      throw new functions.https.HttpsError('permission-denied', 'Only the equipment owner can reject rentals');
    }

    // Update rental status
    await db.collection('rentals').doc(rentalId).update({
      status: 'rejected',
      rejectedAt: admin.firestore.FieldValue.serverTimestamp(),
      rejectedBy: context.auth.uid,
      rejectionReason: reason || 'No reason provided',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log(`✅ Rental ${rentalId} rejected by owner ${context.auth.uid}`);
    return { success: true, message: 'Rental rejected successfully' };
  } catch (error) {
    console.error('❌ Error in rejectRental:', error);
    throw error;
  }
});
