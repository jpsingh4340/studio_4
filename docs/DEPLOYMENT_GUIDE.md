# RentMate Deployment Guide

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Initial Setup](#initial-setup)
3. [Firebase Configuration](#firebase-configuration)
4. [Cloud Functions Setup](#cloud-functions-setup)
5. [Firestore Security Rules](#firestore-security-rules)
6. [Environment Variables](#environment-variables)
7. [Stripe Integration](#stripe-integration)
8. [Deployment](#deployment)
9. [CI/CD Pipeline](#cicd-pipeline)
10. [Monitoring & Maintenance](#monitoring--maintenance)
11. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

- **Node.js**: v20.x or higher
- **npm**: v10.x or higher
- **Git**: Latest version
- **Firebase CLI**: Latest version

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Verify installations
node --version
npm --version
firebase --version
```

### Required Accounts

- **Firebase Project**: Create at [console.firebase.google.com](https://console.firebase.google.com)
- **Stripe Account**: Sign up at [stripe.com](https://stripe.com)
- **GitHub Account**: For CI/CD
- **Email Service**: Gmail with App Password (for Nodemailer)

---

## Initial Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/rentmate.git
cd rentmate
```

### 2. Install Dependencies

```bash
# Install frontend dependencies
npm install --legacy-peer-deps

# Install Cloud Functions dependencies
cd functions
npm install
cd ..
```

### 3. Firebase Login

```bash
firebase login
```

---

## Firebase Configuration

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add Project"
3. Enter project name: `rentmate-production`
4. Enable Google Analytics (optional)
5. Create project

### 2. Enable Services

#### Enable Authentication

1. Go to **Authentication** → **Sign-in method**
2. Enable **Email/Password**
3. Enable **Google OAuth**
   - Add your project's authorized domains

#### Enable Firestore

1. Go to **Firestore Database**
2. Click **Create Database**
3. Start in **Production mode**
4. Choose location (e.g., `us-central1`)

#### Enable Cloud Functions

1. Go to **Functions**
2. Click **Get Started**
3. Upgrade to **Blaze Plan** (pay-as-you-go)

#### Enable Storage (Optional)

1. Go to **Storage**
2. Click **Get Started**
3. Use default rules for now

### 3. Get Firebase Config

1. Go to **Project Settings** → **General**
2. Scroll to "Your apps"
3. Click **Web** icon (</> symbol)
4. Register app name: "RentMate Web"
5. Copy the `firebaseConfig` object

### 4. Initialize Firebase in Project

```bash
# Initialize Firebase (choose existing project)
firebase init

# Select:
# ✓ Firestore
# ✓ Functions
# ✓ Hosting

# Firestore Rules file: firestore.rules
# Firestore indexes file: firestore.indexes.json
# Functions language: JavaScript
# Use ESLint: Yes
# Install dependencies: Yes
# Public directory: build
# Single-page app: Yes
# GitHub Actions: No (we use custom workflow)
```

### 5. Update Firebase Config in Code

Create `.env` file in project root:

```env
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=rentmate-c7360.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=rentmate-c7360
REACT_APP_FIREBASE_STORAGE_BUCKET=rentmate-c7360.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id
REACT_APP_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

---

## Cloud Functions Setup

### 1. Install Functions Dependencies

```bash
cd functions
npm install
```

### 2. Configure Environment Variables

```bash
# Email Configuration (Gmail)
firebase functions:config:set email.user="your-gmail@gmail.com"
firebase functions:config:set email.password="your-app-password"

# Stripe Configuration
firebase functions:config:set stripe.secret_key="sk_test_..." # Use test key first
firebase functions:config:set stripe.webhook_secret="whsec_..."

# Verify configuration
firebase functions:config:get
```

#### How to Get Gmail App Password

1. Enable 2-Factor Authentication on Google Account
2. Go to [Google Account](https://myaccount.google.com)
3. Security → 2-Step Verification → App passwords
4. Generate new app password for "Mail"
5. Use this password in `email.password` config

---

## Firestore Security Rules

### Deploy Security Rules

The project includes comprehensive security rules in `firestore.rules`.

```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Firestore indexes
firebase deploy --only firestore:indexes
```

### Verify Rules

1. Go to **Firestore Database** → **Rules**
2. Verify rules were deployed
3. Test rules in **Rules Playground**

---

## Environment Variables

### Frontend Environment Variables

Create `.env.production` for production:

```env
# Firebase
REACT_APP_FIREBASE_API_KEY=your-production-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=rentmate-c7360.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=rentmate-c7360
REACT_APP_FIREBASE_STORAGE_BUCKET=rentmate-c7360.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id
REACT_APP_FIREBASE_MEASUREMENT_ID=your-measurement-id

# Stripe
REACT_APP_STRIPE_PUBLIC_KEY=pk_live_...

# App Settings
REACT_APP_ENV=production
```

### Functions Environment Variables

Set via Firebase Functions config:

```bash
# Production Stripe keys
firebase functions:config:set stripe.secret_key="sk_live_..."
firebase functions:config:set stripe.webhook_secret="whsec_..."

# Production Email
firebase functions:config:set email.user="noreply@rentmate.com"
firebase functions:config:set email.password="your-production-password"
```

---

## Stripe Integration

### 1. Create Stripe Account

1. Sign up at [stripe.com](https://stripe.com)
2. Complete account verification

### 2. Get API Keys

1. Go to **Developers** → **API keys**
2. Copy **Publishable key** (starts with `pk_`)
3. Copy **Secret key** (starts with `sk_`)

### 3. Configure Webhook

1. Go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Endpoint URL: `https://us-central1-rentmate-c7360.cloudfunctions.net/handleStripeWebhook`
4. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copy **Signing secret** (starts with `whsec_`)

### 4. Test Mode

Start with **test mode** keys:

```bash
firebase functions:config:set stripe.secret_key="sk_test_..."
```

Use test card numbers:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`

### 5. Go Live

When ready for production:

```bash
firebase functions:config:set stripe.secret_key="sk_live_..."
```

Update webhook URL to production endpoint.

---

## Deployment

### Local Development

```bash
# Start development server
npm start

# Start Firebase emulators (optional)
firebase emulators:start

# Run tests
npm test

# Run Playwright E2E tests
npx playwright test
```

### Build for Production

```bash
# Create production build
npm run build

# Test production build locally
npx serve -s build
```

### Deploy to Firebase

#### Deploy Everything

```bash
firebase deploy
```

#### Deploy Specific Services

```bash
# Deploy only hosting
firebase deploy --only hosting

# Deploy only functions
firebase deploy --only functions

# Deploy only Firestore rules
firebase deploy --only firestore:rules

# Deploy only Firestore indexes
firebase deploy --only firestore:indexes
```

#### Deploy Specific Function

```bash
# Deploy single function
firebase deploy --only functions:createPaymentIntent
```

---

## CI/CD Pipeline

### GitHub Actions Setup

The project includes a comprehensive CI/CD pipeline in `.github/workflows/main.yml`.

### 1. Required Secrets

Add these secrets to your GitHub repository:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Add secrets:

```
FIREBASE_SERVICE_ACCOUNT_RENTMATE_C7360
```

### 2. Get Firebase Service Account

```bash
# Generate service account key
firebase init hosting:github

# Or manually:
# 1. Go to Firebase Console → Project Settings → Service Accounts
# 2. Click "Generate new private key"
# 3. Copy the entire JSON content
# 4. Add as GitHub secret: FIREBASE_SERVICE_ACCOUNT_RENTMATE_C7360
```

### 3. Pipeline Triggers

- **main branch**: Deploys to production
- **develop branch**: Deploys to development channel
- **feature branches**: Creates preview deployments
- **Pull requests**: Runs tests and creates preview

### 4. Pipeline Stages

1. **OWASP Security Scan**: Checks for common vulnerabilities
2. **Build**: Creates optimized production build
3. **Deploy**: Deploys to Firebase Hosting
4. **Post-Deploy**: Verifies deployment

---

## Monitoring & Maintenance

### Firebase Console

1. **Analytics**: Track user behavior
2. **Performance**: Monitor app performance
3. **Crashlytics**: Track errors (if enabled)

### Cloud Functions Logs

```bash
# View recent logs
firebase functions:log

# View logs for specific function
firebase functions:log --only createPaymentIntent

# Stream logs in real-time
firebase functions:log --follow
```

### Firestore Usage

1. Go to **Firestore Database** → **Usage**
2. Monitor:
   - Read/Write operations
   - Storage usage
   - Network egress

### Cost Monitoring

1. Go to **Project Settings** → **Usage and billing**
2. Set up budget alerts
3. Monitor Blaze plan usage

**Free Tier Limits**:
- Firestore: 50K reads, 20K writes, 20K deletes per day
- Cloud Functions: 125K invocations, 40K GB-seconds, 40K CPU-seconds per month
- Hosting: 10 GB storage, 360 MB/day bandwidth

---

## Troubleshooting

### Common Issues

#### 1. Build Fails

```bash
# Clear cache and rebuild
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
npm run build
```

#### 2. Functions Deployment Fails

```bash
# Check Node version (must be 20)
node --version

# Reinstall functions dependencies
cd functions
rm -rf node_modules package-lock.json
npm install
cd ..

# Deploy again
firebase deploy --only functions
```

#### 3. Firestore Permission Denied

- Verify security rules are deployed
- Check user authentication
- Verify user role in Firestore

#### 4. Stripe Webhook Not Working

- Verify webhook URL is correct
- Check webhook signing secret
- View webhook logs in Stripe Dashboard
- Test with Stripe CLI:

```bash
stripe listen --forward-to localhost:5001/rentmate-c7360/us-central1/handleStripeWebhook
```

#### 5. Email Not Sending

- Verify Gmail app password
- Check functions config:

```bash
firebase functions:config:get
```

- View function logs for email errors
- Try different email provider (SendGrid, AWS SES)

### Getting Help

- **Firebase Docs**: [firebase.google.com/docs](https://firebase.google.com/docs)
- **Stack Overflow**: Tag with `firebase`, `firestore`, `cloud-functions`
- **Firebase Support**: [firebase.google.com/support](https://firebase.google.com/support)

---

## Checklist

### Before Going Live

- [ ] Update all API keys to production
- [ ] Deploy Firestore security rules
- [ ] Set up Stripe webhook with production keys
- [ ] Configure custom domain (optional)
- [ ] Set up budget alerts
- [ ] Test all user flows
- [ ] Run Playwright E2E tests
- [ ] Enable error tracking
- [ ] Set up monitoring alerts
- [ ] Review and test security rules
- [ ] Backup Firestore data (export to Cloud Storage)
- [ ] Document admin credentials securely
- [ ] Create first admin user

### Post-Deployment

- [ ] Verify all functions are deployed
- [ ] Test payment flow with real card
- [ ] Send test emails
- [ ] Check analytics tracking
- [ ] Monitor error logs for first 24 hours
- [ ] Test on multiple devices/browsers
- [ ] Review Firebase usage and costs

---

## Maintenance Schedule

### Daily
- Monitor error logs
- Check for failed payments
- Review pending equipment approvals

### Weekly
- Review analytics data
- Check security audit logs
- Update dependencies (if needed)

### Monthly
- Review Firebase costs
- Backup Firestore data
- Security audit
- Performance optimization

---

## Rollback Procedure

If deployment has issues:

```bash
# Rollback hosting
firebase hosting:clone SOURCE_SITE_ID:SOURCE_CHANNEL_ID TARGET_SITE_ID:live

# Rollback functions (redeploy previous version)
# There's no automatic rollback, so maintain version control and redeploy from previous commit

git checkout <previous-working-commit>
firebase deploy --only functions
git checkout main
```

---

## Support & Resources

- **Documentation**: `/docs` directory
- **Architecture**: `docs/ARCHITECTURE.md`
- **API Docs**: `docs/API_DOCUMENTATION.md`
- **GitHub**: [github.com/yourusername/rentmate](https://github.com/yourusername/rentmate)

---

**Happy Deploying! 🚀**
