# RentMate Architecture Documentation

## System Overview

RentMate is a full-stack rental platform built with React and Firebase, featuring three distinct user roles (Admin, Owner, Renter) with role-based access control.

## Technology Stack

### Frontend
- **Framework**: React 19.1.0
- **UI Libraries**: Material-UI 7.1.2, Bootstrap 5.3.7
- **Routing**: React Router 7.6.2
- **State Management**: React Context API
- **Charts**: Recharts, Chart.js

### Backend
- **Platform**: Firebase
- **Database**: Cloud Firestore
- **Authentication**: Firebase Auth (Email/Password, Google OAuth)
- **Functions**: Cloud Functions for Firebase (Node.js 20)
- **Hosting**: Firebase Hosting

### Testing
- **E2E Testing**: Playwright (@playwright/mcp 0.0.41)
- **Unit Testing**: React Testing Library

### Third-Party Services
- **Email**: Nodemailer
- **Payments**: Stripe
- **QR Codes**: qrcode.react, html5-qrcode

---

## Architecture Diagrams

### 1. High-Level System Architecture

\`\`\`mermaid
graph TB
    subgraph "Client Layer"
        Web[Web Browser]
        Mobile[Mobile Browser]
    end

    subgraph "Application Layer"
        React[React App<br/>React 19.1.0]
        Router[React Router]
        Context[Context API<br/>State Management]
        MUI[Material-UI Components]
    end

    subgraph "Firebase Backend"
        Auth[Firebase Auth]
        Firestore[(Cloud Firestore)]
        Functions[Cloud Functions]
        Hosting[Firebase Hosting]
        Storage[Firebase Storage]
    end

    subgraph "External Services"
        Stripe[Stripe<br/>Payment Processing]
        Email[Email Service<br/>Nodemailer]
    end

    Web --> React
    Mobile --> React
    React --> Router
    React --> Context
    React --> MUI

    React --> Auth
    React --> Firestore
    React --> Hosting

    Functions --> Firestore
    Functions --> Auth
    Functions --> Stripe
    Functions --> Email

    Auth --> Firestore
\`\`\`

### 2. User Flow Diagram

\`\`\`mermaid
graph LR
    Start([User Visits Site]) --> Guest{Authenticated?}

    Guest -->|No| PublicView[Browse Equipment<br/>Public View]
    PublicView --> Login[Login/Signup]
    Login --> RoleCheck{User Role?}

    Guest -->|Yes| RoleCheck

    RoleCheck -->|Admin| AdminDash[Admin Dashboard<br/>- User Management<br/>- Equipment Approval<br/>- Platform Analytics<br/>- Dispute Resolution]

    RoleCheck -->|Owner| OwnerDash[Owner Dashboard<br/>- Add Equipment<br/>- Manage Listings<br/>- Approve Rentals<br/>- View Earnings]

    RoleCheck -->|Renter| RenterDash[Renter Dashboard<br/>- Browse Equipment<br/>- Make Rentals<br/>- Payment<br/>- View History]

    OwnerDash --> ManageEquip[Manage Equipment]
    OwnerDash --> ApproveRental[Approve/Reject Rentals]

    RenterDash --> BrowseEquip[Browse & Filter]
    BrowseEquip --> RentEquip[Rent Equipment]
    RentEquip --> Payment[Payment Gateway]
    Payment --> RentalActive[Active Rental]

    AdminDash --> ApproveEquip[Approve Equipment]
    AdminDash --> ManageUsers[Manage Users & Roles]
\`\`\`

### 3. Database Schema (Firestore Collections)

\`\`\`mermaid
erDiagram
    USERS ||--o{ EQUIPMENT : owns
    USERS ||--o{ RENTALS : "rents/owns"
    USERS ||--o{ NOTIFICATIONS : receives
    USERS ||--o{ REVIEWS : writes
    EQUIPMENT ||--o{ RENTALS : "rented via"
    EQUIPMENT ||--o{ REVIEWS : "has"
    RENTALS ||--o{ PAYMENTS : "paid via"
    RENTALS ||--o{ DISPUTES : "may have"

    USERS {
        string uid PK
        string email
        string displayName
        string photoURL
        enum role "admin|owner|renter"
        boolean isActive
        timestamp createdAt
        timestamp updatedAt
    }

    EQUIPMENT {
        string id PK
        string ownerId FK
        string name
        string description
        string category
        number ratePerDay
        boolean available
        enum approvalStatus "pending|approved|rejected"
        string imageUrl
        number rating
        number views
        number bookings
        timestamp createdAt
    }

    RENTALS {
        string id PK
        string renterId FK
        string ownerId FK
        string equipmentId FK
        string equipmentName
        date startDate
        date endDate
        number totalPrice
        enum status "pending|approved|rejected|paid|active|completed|overdue"
        timestamp createdAt
    }

    PAYMENTS {
        string id PK
        string rentalId FK
        string paymentIntentId
        string renterId FK
        string ownerId FK
        number amount
        string currency
        enum status "pending|completed|failed"
        timestamp createdAt
    }

    NOTIFICATIONS {
        string id PK
        string userId FK
        string type
        string title
        string message
        boolean read
        timestamp timestamp
    }

    REVIEWS {
        string id PK
        string reviewerId FK
        string equipmentId FK
        string rentalId FK
        number rating
        string comment
        array images
        timestamp createdAt
    }

    DISPUTES {
        string id PK
        string rentalId FK
        string reportedBy FK
        string renterId FK
        string ownerId FK
        string reason
        enum status "open|investigating|resolved"
        string resolution
        timestamp createdAt
    }
\`\`\`

### 4. Rental Workflow

\`\`\`mermaid
sequenceDiagram
    participant R as Renter
    participant F as Frontend
    participant FS as Firestore
    participant CF as Cloud Functions
    participant O as Owner
    participant S as Stripe

    R->>F: Browse Equipment
    F->>FS: Query approved equipment
    FS-->>F: Return equipment list

    R->>F: Select & Rent Equipment
    F->>FS: Create rental (status: pending)
    FS-->>CF: Trigger onRentalCreate
    CF->>FS: Create notification for owner
    CF->>O: Send email notification

    O->>F: View pending rental
    O->>F: Approve rental
    F->>FS: Update rental (status: approved)
    FS-->>CF: Trigger onRentalUpdate
    CF->>FS: Update equipment (available: false)
    CF->>R: Send approval notification
    CF->>R: Send approval email

    R->>F: Proceed to payment
    F->>CF: createPaymentIntent
    CF->>S: Create Stripe Payment Intent
    S-->>CF: Return client secret
    CF-->>F: Return client secret

    R->>F: Enter payment details
    F->>S: Confirm payment
    S->>CF: Webhook: payment_intent.succeeded
    CF->>FS: Update rental (status: paid)
    CF->>FS: Create payment record
    CF->>R: Send payment confirmation

    Note over R,S: Rental is now active

    O->>F: Mark rental complete
    F->>FS: Update rental (status: completed)
    FS-->>CF: Trigger onRentalUpdate
    CF->>FS: Update equipment (available: true)
    CF->>FS: Update equipment stats
    CF->>R: Request review notification
\`\`\`

### 5. Authentication & Authorization Flow

\`\`\`mermaid
graph TD
    A[User Request] --> B{Authenticated?}

    B -->|No| C[Redirect to Login]
    C --> D[Firebase Auth Login]
    D --> E{Login Success?}

    E -->|No| F[Show Error Message]
    F --> C

    E -->|Yes| G[Create Auth Token]
    G --> H[Fetch User Profile from Firestore]
    H --> I{User Exists?}

    I -->|No| J[Create User Profile<br/>Default Role: Renter]
    J --> K[Cloud Function: onUserCreate]
    K --> L[Send Welcome Email]
    L --> M[Create Welcome Notification]

    I -->|Yes| N[Load User Role & Permissions]

    M --> N
    N --> O{Check Route Permissions}

    B -->|Yes| O

    O --> P{Has Permission?}

    P -->|No| Q[Redirect to Not Authorized]

    P -->|Yes - Admin| R[Access Admin Dashboard]
    P -->|Yes - Owner| S[Access Owner Dashboard]
    P -->|Yes - Renter| T[Access Renter Dashboard]

    R --> U[Admin Actions]
    U --> V{Firestore Rules Check}

    S --> W[Owner Actions]
    W --> V

    T --> X[Renter Actions]
    X --> V

    V -->|Allowed| Y[Execute Action]
    V -->|Denied| Z[403 Forbidden]

    Y --> AA[Log Admin Action<br/>if applicable]
\`\`\`

### 6. Cloud Functions Architecture

\`\`\`mermaid
graph TB
    subgraph "Trigger Types"
        T1[Auth Triggers]
        T2[Firestore Triggers]
        T3[HTTPS Callable]
        T4[HTTP Endpoints]
        T5[Scheduled Functions]
    end

    subgraph "User Functions"
        F1[onUserCreate]
        F2[setUserRole]
    end

    subgraph "Rental Functions"
        F3[onRentalCreate]
        F4[onRentalUpdate]
        F5[approveRental]
        F6[rejectRental]
    end

    subgraph "Payment Functions"
        F7[createPaymentIntent]
        F8[handleStripeWebhook]
        F9[processPayment]
    end

    subgraph "Notification Functions"
        F10[sendEmailNotification]
        F11[createInAppNotification]
    end

    subgraph "Scheduled Functions"
        F12[generateDailyReports<br/>0 0 * * *]
        F13[cleanupOldNotifications<br/>0 2 * * *]
        F14[checkOverdueRentals<br/>0 * * * *]
    end

    subgraph "External Services"
        E1[(Firestore)]
        E2[Email Service]
        E3[Stripe API]
    end

    T1 --> F1
    T2 --> F3
    T2 --> F4
    T3 --> F2
    T3 --> F5
    T3 --> F6
    T3 --> F7
    T3 --> F9
    T3 --> F10
    T3 --> F11
    T4 --> F8
    T5 --> F12
    T5 --> F13
    T5 --> F14

    F1 --> E1
    F1 --> E2
    F2 --> E1
    F3 --> E1
    F3 --> E2
    F4 --> E1
    F5 --> E1
    F6 --> E1
    F7 --> E3
    F7 --> E1
    F8 --> E1
    F9 --> E1
    F10 --> E2
    F11 --> E1
    F12 --> E1
    F13 --> E1
    F14 --> E1
\`\`\`

### 7. Component Hierarchy

\`\`\`mermaid
graph TD
    App[App.js] --> Auth[AuthProvider]
    App --> Router[React Router]

    Router --> Public[Public Routes]
    Router --> Protected[Protected Routes]

    Public --> Home[Home / Browse]
    Public --> Login[Login Page]
    Public --> Signup[Signup Page]
    Public --> EquipDetail[Equipment Detail]

    Protected --> AdminR[Admin Routes]
    Protected --> OwnerR[Owner Routes]
    Protected --> RenterR[Renter Routes]

    AdminR --> AdminDash[AdminDashboard.jsx<br/>- UserManagement<br/>- EquipmentApproval<br/>- PlatformAnalytics<br/>- DisputeResolution]

    OwnerR --> OwnerDash[OwnerDashboard.jsx<br/>- QuickStats<br/>- RentalApproval<br/>- EquipmentList<br/>- Analytics]

    OwnerR --> AddEquip[AddEquipment.js]

    RenterR --> RenterDash[RenterDashboard.js<br/>- EquipmentBrowser<br/>- MyRentals<br/>- Favorites]

    RenterR --> RentEquip[RentEquipment.js]
    RenterR --> Payment[PaymentPage.js]
    RenterR --> RentalHistory[RentalHistory.js]

    Auth --> AuthContext[AuthContext<br/>currentUser, role, logout]
\`\`\`

### 8. Security Architecture

\`\`\`mermaid
graph TB
    subgraph "Frontend Security"
        A[Route Guards<br/>RoleRoute.jsx]
        B[Protected Components]
        C[Conditional Rendering]
    end

    subgraph "Firebase Security Rules"
        D[Firestore Rules<br/>firestore.rules]
        E[Authentication Rules]
        F[Role-Based Access]
    end

    subgraph "Cloud Functions Security"
        G[Context.auth Check]
        H[Admin Verification]
        I[Input Validation]
        J[Audit Logging]
    end

    subgraph "API Security"
        K[HTTPS Only]
        L[CORS Configuration]
        M[Rate Limiting]
    end

    A --> D
    B --> D
    C --> D

    D --> F
    E --> F

    G --> H
    H --> I
    I --> J

    K --> L
    L --> M

    F -.->|Validates| G
\`\`\`

---

## Data Flow Patterns

### 1. Real-time Data Updates
- Uses Firestore `onSnapshot` listeners for real-time updates
- Components subscribe to relevant collections
- Auto-updates UI when data changes

### 2. State Management
- Global state via React Context (AuthContext)
- Local state via React useState/useReducer hooks
- No external state management library (Redux, MobX)

### 3. API Communication
- Direct Firestore SDK calls from frontend
- Cloud Functions for sensitive operations
- HTTP callable functions for complex logic

---

## Security Considerations

### 1. Authentication
- Firebase Auth handles all authentication
- Email/Password and OAuth (Google) supported
- Persistent sessions with refresh tokens

### 2. Authorization
- Role-based access control (RBAC)
- Firestore security rules enforce permissions
- Frontend route guards for UX
- Backend validation in Cloud Functions

### 3. Data Protection
- All API keys in environment variables
- Firestore rules prevent unauthorized reads/writes
- Sensitive operations (payments, role changes) require Cloud Functions
- Admin actions logged for audit trail

---

## Scalability Considerations

### 1. Database
- Firestore indexes for common queries
- Compound indexes for complex filtering
- Pagination for large datasets

### 2. Cloud Functions
- Stateless design for horizontal scaling
- Scheduled functions for batch operations
- Webhook handlers for async operations

### 3. Frontend
- Code splitting with React.lazy
- Image optimization
- Caching strategies

---

## Deployment Pipeline

### 1. CI/CD (GitHub Actions)
- OWASP security scanning
- Automated testing
- Build optimization
- Firebase deployment

### 2. Environments
- **Production**: main branch → Firebase Hosting (live)
- **Development**: develop branch → Firebase Hosting (develop channel)
- **Preview**: Feature branches → Temporary preview URLs

### 3. Monitoring
- Firebase Analytics
- Cloud Functions logs
- Error tracking (console errors logged)

---

## Future Enhancements

1. **Real-time Chat** - WebSocket-based messaging between renters and owners
2. **Push Notifications** - Firebase Cloud Messaging (FCM)
3. **Progressive Web App** - Service workers for offline support
4. **Multi-language** - i18n internationalization
5. **Mobile Apps** - React Native for iOS/Android
6. **AI Recommendations** - Equipment suggestions based on history
7. **Geolocation** - Distance-based equipment search
8. **Video Demos** - Equipment video previews

---

## Conclusion

RentMate is built on a solid, scalable architecture using modern web technologies. The separation of concerns between frontend (React), backend (Firebase), and business logic (Cloud Functions) ensures maintainability and allows for independent scaling of each layer.

The role-based access control system provides security while maintaining flexibility for different user types. Real-time capabilities via Firestore enable a responsive, collaborative platform experience.
