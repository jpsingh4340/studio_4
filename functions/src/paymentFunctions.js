/**
 * Payment Processing Cloud Functions (Stripe Integration)
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const stripe = require('stripe')(functions.config().stripe?.secret_key || process.env.STRIPE_SECRET_KEY);

const db = admin.firestore();

/**
 * Callable Function: Create Payment Intent
 */
exports.createPaymentIntent = functions.https.onCall(async (data, context) => {
  try {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { rentalId, amount, currency = 'usd' } = data;

    // Validate amount
    if (!amount || amount <= 0) {
      throw new functions.https.HttpsError('invalid-argument', 'Invalid payment amount');
    }

    // Get rental details
    const rentalDoc = await db.collection('rentals').doc(rentalId).get();
    if (!rentalDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Rental not found');
    }

    const rental = rentalDoc.data();

    // Verify user is the renter
    if (rental.renterId !== context.auth.uid) {
      throw new functions.https.HttpsError('permission-denied', 'Only the renter can make payments');
    }

    // Create Stripe Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata: {
        rentalId,
        renterId: context.auth.uid,
        equipmentId: rental.equipmentId,
        equipmentName: rental.equipmentName,
      },
    });

    // Store payment intent in Firestore
    await db.collection('payments').add({
      paymentIntentId: paymentIntent.id,
      rentalId,
      renterId: context.auth.uid,
      ownerId: rental.ownerId,
      amount,
      currency,
      status: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log(`✅ Payment intent created for rental ${rentalId}`);
    return {
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    };
  } catch (error) {
    console.error('❌ Error in createPaymentIntent:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

/**
 * HTTP Function: Handle Stripe Webhook
 */
exports.handleStripeWebhook = functions.https.onRequest(async (req, res) => {
  try {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = functions.config().stripe?.webhook_secret || process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
      event = stripe.webhooks.constructEvent(req.rawBody, sig, webhookSecret);
    } catch (err) {
      console.error('❌ Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        await handlePaymentSuccess(paymentIntent);
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        await handlePaymentFailure(failedPayment);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('❌ Error in handleStripeWebhook:', error);
    res.status(500).send('Webhook handler failed');
  }
});

/**
 * Helper: Handle successful payment
 */
async function handlePaymentSuccess(paymentIntent) {
  try {
    const { rentalId, renterId } = paymentIntent.metadata;

    // Update rental status to paid
    await db.collection('rentals').doc(rentalId).update({
      status: 'paid',
      paymentStatus: 'completed',
      paidAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Update payment record
    const paymentQuery = await db.collection('payments')
      .where('paymentIntentId', '==', paymentIntent.id)
      .limit(1)
      .get();

    if (!paymentQuery.empty) {
      await paymentQuery.docs[0].ref.update({
        status: 'completed',
        completedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    // Create notification for renter
    await db.collection('notifications').add({
      userId: renterId,
      type: 'payment_success',
      title: 'Payment Successful! 💳',
      message: 'Your payment has been processed successfully. Enjoy your rental!',
      rentalId,
      read: false,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log(`✅ Payment succeeded for rental ${rentalId}`);
  } catch (error) {
    console.error('❌ Error handling payment success:', error);
  }
}

/**
 * Helper: Handle failed payment
 */
async function handlePaymentFailure(paymentIntent) {
  try {
    const { rentalId, renterId } = paymentIntent.metadata;

    // Update payment record
    const paymentQuery = await db.collection('payments')
      .where('paymentIntentId', '==', paymentIntent.id)
      .limit(1)
      .get();

    if (!paymentQuery.empty) {
      await paymentQuery.docs[0].ref.update({
        status: 'failed',
        failedAt: admin.firestore.FieldValue.serverTimestamp(),
        failureReason: paymentIntent.last_payment_error?.message || 'Unknown error',
      });
    }

    // Create notification for renter
    await db.collection('notifications').add({
      userId: renterId,
      type: 'payment_failed',
      title: 'Payment Failed',
      message: 'Your payment could not be processed. Please try again or contact support.',
      rentalId,
      read: false,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log(`❌ Payment failed for rental ${rentalId}`);
  } catch (error) {
    console.error('❌ Error handling payment failure:', error);
  }
}

/**
 * Callable Function: Process Manual Payment (Cash/Check)
 */
exports.processPayment = functions.https.onCall(async (data, context) => {
  try {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { rentalId, paymentMethod, amount } = data;

    // Get rental
    const rentalDoc = await db.collection('rentals').doc(rentalId).get();
    if (!rentalDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Rental not found');
    }

    const rental = rentalDoc.data();

    // Verify user is owner (for manual payment confirmation)
    if (rental.ownerId !== context.auth.uid) {
      throw new functions.https.HttpsError('permission-denied', 'Only owner can confirm manual payments');
    }

    // Update rental
    await db.collection('rentals').doc(rentalId).update({
      status: 'paid',
      paymentStatus: 'completed',
      paymentMethod: paymentMethod || 'cash',
      paidAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Create payment record
    await db.collection('payments').add({
      rentalId,
      renterId: rental.renterId,
      ownerId: context.auth.uid,
      amount,
      paymentMethod: paymentMethod || 'cash',
      status: 'completed',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      completedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log(`✅ Manual payment processed for rental ${rentalId}`);
    return { success: true, message: 'Payment confirmed successfully' };
  } catch (error) {
    console.error('❌ Error in processPayment:', error);
    throw error;
  }
});
