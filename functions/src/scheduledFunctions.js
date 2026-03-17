/**
 * Scheduled Cloud Functions
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { subDays } = require('date-fns');

const db = admin.firestore();

/**
 * Scheduled Function: Generate Daily Reports
 * Runs every day at midnight
 */
exports.generateDailyReports = functions.pubsub
  .schedule('0 0 * * *')
  .timeZone('America/New_York')
  .onRun(async (context) => {
    try {
      console.log('📊 Starting daily report generation...');

      const today = new Date();
      const yesterday = subDays(today, 1);

      // Get yesterday's rentals
      const rentalsSnapshot = await db.collection('rentals')
        .where('createdAt', '>=', yesterday)
        .where('createdAt', '<', today)
        .get();

      // Get yesterday's equipment listings
      const equipmentSnapshot = await db.collection('equipment')
        .where('createdAt', '>=', yesterday)
        .where('createdAt', '<', today)
        .get();

      // Get yesterday's users
      const usersSnapshot = await db.collection('users')
        .where('createdAt', '>=', yesterday)
        .where('createdAt', '<', today)
        .get();

      // Calculate metrics
      const metrics = {
        date: yesterday.toISOString(),
        rentals: {
          total: rentalsSnapshot.size,
          approved: rentalsSnapshot.docs.filter(doc => doc.data().status === 'approved').length,
          pending: rentalsSnapshot.docs.filter(doc => doc.data().status === 'pending').length,
          rejected: rentalsSnapshot.docs.filter(doc => doc.data().status === 'rejected').length,
        },
        equipment: {
          total: equipmentSnapshot.size,
          approved: equipmentSnapshot.docs.filter(doc => doc.data().approvalStatus === 'approved').length,
        },
        users: {
          total: usersSnapshot.size,
          owners: usersSnapshot.docs.filter(doc => doc.data().role === 'owner').length,
          renters: usersSnapshot.docs.filter(doc => doc.data().role === 'renter').length,
        },
        revenue: rentalsSnapshot.docs.reduce((sum, doc) => sum + (doc.data().totalPrice || 0), 0),
        generatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      // Store report
      await db.collection('dailyReports').add(metrics);

      console.log('✅ Daily report generated successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ Error generating daily reports:', error);
      return { success: false, error: error.message };
    }
  });

/**
 * Scheduled Function: Cleanup Old Notifications
 * Runs every day at 2 AM
 */
exports.cleanupOldNotifications = functions.pubsub
  .schedule('0 2 * * *')
  .timeZone('America/New_York')
  .onRun(async (context) => {
    try {
      console.log('🧹 Starting notification cleanup...');

      const thirtyDaysAgo = subDays(new Date(), 30);

      // Delete read notifications older than 30 days
      const oldNotifications = await db.collection('notifications')
        .where('read', '==', true)
        .where('timestamp', '<', thirtyDaysAgo)
        .get();

      const batch = db.batch();
      oldNotifications.docs.forEach(doc => {
        batch.delete(doc.ref);
      });

      await batch.commit();

      console.log(`✅ Deleted ${oldNotifications.size} old notifications`);
      return { success: true, deletedCount: oldNotifications.size };
    } catch (error) {
      console.error('❌ Error cleaning up notifications:', error);
      return { success: false, error: error.message };
    }
  });

/**
 * Scheduled Function: Check Overdue Rentals
 * Runs every hour
 */
exports.checkOverdueRentals = functions.pubsub
  .schedule('0 * * * *')
  .timeZone('America/New_York')
  .onRun(async (context) => {
    try {
      console.log('⏰ Checking for overdue rentals...');

      const now = new Date();

      // Get active rentals past their end date
      const overdueRentals = await db.collection('rentals')
        .where('status', 'in', ['active', 'approved', 'paid'])
        .where('endDate', '<', now)
        .get();

      // Process each overdue rental
      for (const doc of overdueRentals.docs) {
        const rental = doc.data();
        const { renterId, ownerId, equipmentName, id } = rental;

        // Update rental status
        await doc.ref.update({
          status: 'overdue',
          overdueAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Notify both parties
        await Promise.all([
          db.collection('notifications').add({
            userId: renterId,
            type: 'rental_overdue',
            title: 'Rental Overdue ⚠️',
            message: `Your rental of ${equipmentName} is overdue. Please return it as soon as possible.`,
            rentalId: doc.id,
            read: false,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
          }),
          db.collection('notifications').add({
            userId: ownerId,
            type: 'rental_overdue',
            title: 'Equipment Rental Overdue',
            message: `Rental of ${equipmentName} is overdue. Please contact the renter.`,
            rentalId: doc.id,
            read: false,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
          }),
        ]);
      }

      console.log(`✅ Processed ${overdueRentals.size} overdue rentals`);
      return { success: true, overdueCount: overdueRentals.size };
    } catch (error) {
      console.error('❌ Error checking overdue rentals:', error);
      return { success: false, error: error.message };
    }
  });
