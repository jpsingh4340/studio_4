# RentMate API Documentation

## Overview

RentMate uses Firebase Cloud Functions for backend API operations. All functions are deployed to Firebase and can be invoked via the Firebase SDK.

---

## Base URL

**Production**: `https://us-central1-rentmate-c7360.cloudfunctions.net`

**Note**: Most functions are callable functions and should be invoked using Firebase SDK's `httpsCallable()` method.

---

## Authentication

All protected endpoints require a valid Firebase Auth token.

```javascript
import { getAuth } from 'firebase/auth';
import { getFunctions, httpsCallable } from 'firebase/functions';

const auth = getAuth();
const functions = getFunctions();

// Call a Cloud Function
const myFunction = httpsCallable(functions, 'functionName');
const result = await myFunction({ data: 'value' });
```

---

## User Management Functions

### `onUserCreate` (Trigger)

**Type**: Firebase Auth Trigger

**Description**: Automatically creates a user profile in Firestore when a new user signs up.

**Trigger**: `onCreate` for Firebase Authentication

**Actions**:
- Creates user document in `/users` collection
- Sets default role to 'renter'
- Sends welcome email
- Creates welcome notification

**Data Created**:
```javascript
{
  email: string,
  displayName: string,
  photoURL: string | null,
  role: 'renter',  // Default
  createdAt: Timestamp,
  updatedAt: Timestamp,
  isActive: true,
  emailVerified: boolean
}
```

---

### `setUserRole` (Callable)

**Type**: HTTPS Callable Function

**Description**: Changes a user's role (Admin only).

**Auth Required**: Yes (Admin only)

**Request**:
```javascript
{
  userId: string,      // Target user ID
  newRole: 'admin' | 'owner' | 'renter'
}
```

**Response**:
```javascript
{
  success: boolean,
  message: string
}
```

**Errors**:
- `unauthenticated`: User not logged in
- `permission-denied`: Caller is not admin
- `invalid-argument`: Invalid role specified

**Example**:
```javascript
const setUserRole = httpsCallable(functions, 'setUserRole');
const result = await setUserRole({
  userId: 'ABC123',
  newRole: 'owner'
});
```

---

## Rental Management Functions

### `onRentalCreate` (Trigger)

**Type**: Firestore Trigger

**Description**: Sends notifications when a new rental request is created.

**Trigger**: `onCreate` on `/rentals/{rentalId}`

**Actions**:
- Notifies equipment owner
- Sends email to owner
- Creates in-app notification

---

### `onRentalUpdate` (Trigger)

**Type**: Firestore Trigger

**Description**: Handles rental status changes and updates related data.

**Trigger**: `onUpdate` on `/rentals/{rentalId}`

**Status Change Actions**:

#### `approved`
- Updates equipment availability to false
- Notifies renter
- Sends approval email

#### `rejected`
- Notifies renter
- Sends rejection email

#### `completed`
- Updates equipment availability to true
- Updates equipment stats (bookings, revenue)
- Notifies both parties
- Requests review from renter

---

### `approveRental` (Callable)

**Type**: HTTPS Callable Function

**Description**: Approves a pending rental request (Owner only).

**Auth Required**: Yes (Owner of the equipment)

**Request**:
```javascript
{
  rentalId: string
}
```

**Response**:
```javascript
{
  success: boolean,
  message: string
}
```

**Errors**:
- `unauthenticated`: User not logged in
- `not-found`: Rental not found
- `permission-denied`: Caller is not the equipment owner

**Example**:
```javascript
const approveRental = httpsCallable(functions, 'approveRental');
const result = await approveRental({ rentalId: 'rental123' });
```

---

### `rejectRental` (Callable)

**Type**: HTTPS Callable Function

**Description**: Rejects a pending rental request (Owner only).

**Auth Required**: Yes (Owner of the equipment)

**Request**:
```javascript
{
  rentalId: string,
  reason?: string  // Optional rejection reason
}
```

**Response**:
```javascript
{
  success: boolean,
  message: string
}
```

**Example**:
```javascript
const rejectRental = httpsCallable(functions, 'rejectRental');
const result = await rejectRental({
  rentalId: 'rental123',
  reason: 'Equipment is under maintenance'
});
```

---

## Payment Functions

### `createPaymentIntent` (Callable)

**Type**: HTTPS Callable Function

**Description**: Creates a Stripe Payment Intent for rental payment.

**Auth Required**: Yes (Renter only)

**Request**:
```javascript
{
  rentalId: string,
  amount: number,      // Amount in dollars
  currency?: string    // Default: 'usd'
}
```

**Response**:
```javascript
{
  success: boolean,
  clientSecret: string,        // For Stripe payment
  paymentIntentId: string
}
```

**Errors**:
- `unauthenticated`: User not logged in
- `invalid-argument`: Invalid amount
- `not-found`: Rental not found
- `permission-denied`: User is not the renter

**Example**:
```javascript
const createPaymentIntent = httpsCallable(functions, 'createPaymentIntent');
const result = await createPaymentIntent({
  rentalId: 'rental123',
  amount: 250.00,
  currency: 'usd'
});

// Use clientSecret with Stripe.js
const { error } = await stripe.confirmCardPayment(result.data.clientSecret, {
  payment_method: {
    card: cardElement,
  }
});
```

---

### `handleStripeWebhook` (HTTP)

**Type**: HTTP Endpoint

**Description**: Handles Stripe webhook events for payment status updates.

**Method**: POST

**URL**: `/handleStripeWebhook`

**Headers**:
- `stripe-signature`: Stripe webhook signature

**Events Handled**:
- `payment_intent.succeeded`: Updates rental status to 'paid', creates notification
- `payment_intent.payment_failed`: Updates payment record, notifies user

**Note**: This endpoint is called by Stripe's servers, not by the frontend.

**Webhook Configuration**:
```bash
# Set in Stripe Dashboard
URL: https://us-central1-rentmate-c7360.cloudfunctions.net/handleStripeWebhook
Events: payment_intent.succeeded, payment_intent.payment_failed
```

---

### `processPayment` (Callable)

**Type**: HTTPS Callable Function

**Description**: Confirms manual payment (cash/check) by owner.

**Auth Required**: Yes (Owner only)

**Request**:
```javascript
{
  rentalId: string,
  paymentMethod: 'cash' | 'check',
  amount: number
}
```

**Response**:
```javascript
{
  success: boolean,
  message: string
}
```

**Example**:
```javascript
const processPayment = httpsCallable(functions, 'processPayment');
const result = await processPayment({
  rentalId: 'rental123',
  paymentMethod: 'cash',
  amount: 250.00
});
```

---

## Notification Functions

### `sendEmailNotification` (Callable)

**Type**: HTTPS Callable Function

**Description**: Sends an email notification to a user.

**Auth Required**: Yes

**Request**:
```javascript
{
  to: string,       // Email address
  subject: string,
  message: string   // HTML content
}
```

**Response**:
```javascript
{
  success: boolean,
  message: string
}
```

---

### `createInAppNotification` (Callable)

**Type**: HTTPS Callable Function

**Description**: Creates an in-app notification for a user.

**Auth Required**: Yes (Admin or target user)

**Request**:
```javascript
{
  userId: string,
  type: string,
  title: string,
  message: string,
  metadata?: object
}
```

**Response**:
```javascript
{
  success: boolean,
  notificationId: string
}
```

**Example**:
```javascript
const createInAppNotification = httpsCallable(functions, 'createInAppNotification');
const result = await createInAppNotification({
  userId: 'user123',
  type: 'general',
  title: 'New Feature Available',
  message: 'Check out our new QR code scanner!',
  metadata: { link: '/qr-tools' }
});
```

---

## Scheduled Functions

### `generateDailyReports`

**Type**: Scheduled Function

**Schedule**: Every day at 12:00 AM EST (`0 0 * * *`)

**Description**: Generates daily platform statistics and stores in `/dailyReports`.

**Data Generated**:
```javascript
{
  date: string,
  rentals: {
    total: number,
    approved: number,
    pending: number,
    rejected: number
  },
  equipment: {
    total: number,
    approved: number
  },
  users: {
    total: number,
    owners: number,
    renters: number
  },
  revenue: number,
  generatedAt: Timestamp
}
```

---

### `cleanupOldNotifications`

**Type**: Scheduled Function

**Schedule**: Every day at 2:00 AM EST (`0 2 * * *`)

**Description**: Deletes read notifications older than 30 days.

---

### `checkOverdueRentals`

**Type**: Scheduled Function

**Schedule**: Every hour (`0 * * * *`)

**Description**: Checks for overdue rentals and sends notifications.

**Actions**:
- Finds active rentals past end date
- Updates status to 'overdue'
- Notifies both renter and owner

---

## Error Handling

All Cloud Functions return standardized error responses:

### Error Response Format
```javascript
{
  code: string,      // Error code
  message: string,   // Human-readable message
  details?: object   // Additional error details
}
```

### Common Error Codes

| Code | Description |
|------|-------------|
| `unauthenticated` | User must be logged in |
| `permission-denied` | User lacks required permissions |
| `not-found` | Requested resource not found |
| `invalid-argument` | Invalid input parameters |
| `already-exists` | Resource already exists |
| `internal` | Internal server error |

---

## Rate Limits

- **Callable Functions**: 10,000 invocations/day (free tier)
- **HTTP Functions**: 125,000 invocations/day (free tier)
- **Email Sending**: 100 emails/day (Nodemailer limit)

---

## Testing

### Local Testing

```bash
# Start Firebase emulators
cd functions
npm run serve

# Functions will be available at:
# http://localhost:5001/rentmate-c7360/us-central1/functionName
```

### Testing with Postman

For callable functions, use the Firebase SDK. For HTTP functions:

```bash
POST https://us-central1-rentmate-c7360.cloudfunctions.net/handleStripeWebhook
Headers:
  stripe-signature: <signature>
Body: <webhook payload>
```

---

## Deployment

```bash
# Deploy all functions
firebase deploy --only functions

# Deploy specific function
firebase deploy --only functions:createPaymentIntent

# View logs
firebase functions:log
```

---

## Environment Variables

Set via Firebase Functions config:

```bash
# Email configuration
firebase functions:config:set email.user="your-email@gmail.com"
firebase functions:config:set email.password="your-app-password"

# Stripe configuration
firebase functions:config:set stripe.secret_key="sk_live_..."
firebase functions:config:set stripe.webhook_secret="whsec_..."

# View config
firebase functions:config:get
```

---

## Best Practices

1. **Always validate input** in callable functions
2. **Check authentication** before sensitive operations
3. **Use transactions** for atomic updates
4. **Log important actions** for audit trail
5. **Handle errors gracefully** with user-friendly messages
6. **Use batched writes** for multiple document updates
7. **Implement retry logic** for external API calls

---

## Support

For issues or questions about the API:
- **Documentation**: See `/docs` directory
- **Issues**: GitHub Issues
- **Email**: support@rentmate.com

---

## Changelog

### v1.0.0 (Current)
- Initial API release
- User management functions
- Rental workflow functions
- Payment processing with Stripe
- Notification system
- Scheduled reports and cleanup
