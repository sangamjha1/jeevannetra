# 🏥 Jeevan Netra - Healthcare Management System

**Jeevan Netra** is a comprehensive, full-stack Hospital Management System designed to streamline healthcare operations and improve patient care delivery. The system provides role-based dashboards for patients, doctors, hospital administrators, staff members, and system administrators.

**Version:** v1.0.0  
**Status:** Under Development - Pre-release

> ⚠️ **Note:** Live demo coming soon. Code not yet deployed to production.

---

## 📋 Table of Contents

- [About Jeevan Netra](#about-jeevan-netra)
- [Features Overview](#features-overview)
- [Dashboard Features by Role](#dashboard-features-by-role)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Running the Application](#running-the-application)
- [Test Accounts](#test-accounts)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)

---

## 🎯 About Jeevan Netra

**Jeevan Netra** (meaning "Eye of Life" in Sanskrit) is a modern healthcare management platform built with cutting-edge web technologies. It provides a unified ecosystem where:

- **Patients** can book appointments, view prescriptions, and manage medical bills
- **Doctors** can manage appointments, issue prescriptions, and track patient history
- **Hospital Staff** can monitor emergency alerts, manage shifts, and coordinate care delivery
- **Hospital Administrators** can manage hospital operations, staff, and resources
- **System Administrators** can oversee the entire platform and manage system-wide settings

The system emphasizes **real-time notifications**, **secure authentication**, **role-based access control**, and an **intuitive user interface**.

---

## ✨ Features Overview

### Core System Features

✅ **Role-Based Access Control** - 5 distinct user roles with granular permissions
✅ **JWT Authentication** - Secure token-based authentication with refresh token rotation
✅ **Real-time Notifications** - Live emergency alerts and system notifications
✅ **Dark/Light Theme** - Modern UI with theme switching support
✅ **Responsive Design** - Fully responsive across desktop, tablet, and mobile devices
✅ **Hospital Multi-tenancy** - Support for multiple hospital organizations
✅ **Staff Type Management** - 13 specialized staff categories with unique profiles

### Data Management Features

✅ **Appointment Scheduling** - Book, reschedule, and cancel appointments
✅ **Prescription Management** - Issue, download, and track prescriptions
✅ **Billing System** - Generate bills and track payments
✅ **Bed Management** - Monitor bed availability and allocations
✅ **Medicine Inventory** - Track medication availability
✅ **Patient Records** - Comprehensive patient health history

---

## 🎨 Dashboard Features by Role

### 👤 Patient Dashboard

- **Appointment History** - View booked appointments, reschedule, or cancel
- **Prescription Management** - View active prescriptions with download option (PDF/Text)
- **Health Reports** - Access generated health reports and medical summaries
- **Bills & Payments** - Track medical bills and payment status
- **Profile Management** - Update personal and medical information
- **Emergency Contacts** - Manage emergency contact information

### 👨‍⚕️ Doctor Dashboard

- **Pending Appointments** - View and manage upcoming patient consultations
- **Patient History** - Access patient medical records and history
- **Issue Prescriptions** - Create and issue new prescriptions to patients
- **Prescription Management** - View and modify issued prescriptions
- **Fee Management** - Set and manage consultation fees
- **Patient Search** - Quick access to patient records

### 👔 Staff Dashboard

- **Staff Profile** - View personal information with role-specific emoji and color coding
- **Shift Information** - Track current shift timings and assignments
- **Hospital Details** - View assigned hospital and contact information
- **Emergency Alerts** - Real-time display of active emergency situations
- **Quick Actions** - Common tasks (Check-in, Leave Request, View Schedule, Update Status)
- **Daily Tasks** - View assigned tasks for the current day

### 🏥 Hospital Dashboard

- **Hospital Overview** - Summary of hospital operations and metrics
- **Staff Management** - Add, edit, and manage all hospital staff
- **Bed Management** - Monitor bed availability and occupancy
- **Appointment Reports** - View appointment statistics and trends
- **Patient Database** - Search and manage registered patients
- **Hospital Settings** - Configure hospital-specific settings

### ⚙️ Admin Dashboard

- **System Overview** - Real-time system metrics and health status
  - Total Users, Hospitals, Staff, Appointments, Prescriptions, Bills
  - System health monitoring (6 key services)
  - Quick action buttons for common administrative tasks

- **User Management** (Tab)
  - Create new users with email validation
  - Search and filter users by email or name
  - Edit and delete user accounts
  - Assign roles and permissions

- **Hospital Management** (Tab)
  - View all registered hospitals
  - Hospital details (email, phone, address, bed count, staff count)
  - Edit hospital information

- **Staff Management** (Tab)
  - Add new staff members
  - Assign staff to hospitals
  - Manage staff types and roles

- **System Settings** (Tab)
  - Email configuration
  - Backup scheduling
  - Security settings
  - API key management
  - System logs
  - License management

---

## 🛠️ Technology Stack

### Frontend
- **Framework:** Next.js 16.2.2 with React 19
- **Language:** TypeScript
- **Styling:** Tailwind CSS with HSL color system
- **UI Components:** Radix UI primitives
- **Icons:** Lucide Icons
- **HTTP Client:** Axios with JWT interceptor
- **State Management:** React Context API
- **Build Tool:** Turbopack

### Backend
- **Framework:** NestJS (Node.js)
- **Language:** TypeScript
- **Database:** PostgreSQL (Neon)
- **ORM:** TypeORM
- **Authentication:** JWT (JSON Web Tokens)
- **Validation:** class-validator
- **Testing:** Jest
- **Real-time:** Socket.IO

### DevOps & Deployment
- **Frontend Hosting:** Vercel
- **Backend:** Node.js Runtime
- **Database:** Neon PostgreSQL (with SSL)
- **Version Control:** Git

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn** package manager
- **PostgreSQL** (or use Neon for cloud database)
- **Git** for version control

### Recommended Versions
```
Node.js: v18.17.0 or higher
npm: v9.0.0 or higher
PostgreSQL: v14 or higher
```

---

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Hospital_management
```

### 2. Install Frontend Dependencies

```bash
cd client
npm install
```

### 3. Install Backend Dependencies

```bash
cd ../server
npm install
```

### 4. Environment Configuration

#### Frontend (.env.local)
Create `client/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME=Jeevan Netra
```

#### Backend (.env)
Create `server/.env`:
```env
# Database
DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRY=7d
REFRESH_TOKEN_SECRET=your_refresh_token_secret

# Server
PORT=3001
NODE_ENV=development

# Email (Optional)
MAIL_HOST=smtp.gmail.com
MAIL_USER=your_email@gmail.com
MAIL_PASSWORD=your_app_password
```

### 5. Database Setup

```bash
cd server
npm run typeorm migration:run
npm run seed
npm run start:dev
```

---

## 🎮 Running the Application

### Development Mode

#### Terminal 1 - Start Backend Server
```bash
cd server
npm run start:dev
```
Backend will be available at `http://localhost:3001`

#### Terminal 2 - Start Frontend Development Server
```bash
cd client
npm run dev
```
Frontend will be available at `http://localhost:3000`

### Production Build

#### Build Frontend
```bash
cd client
npm run build
npm start
```

#### Build Backend
```bash
cd server
npm run build
npm run start:prod
```

### Run Tests

```bash
# Frontend tests
cd client
npm run test

# Backend tests
cd server
npm run test
npm run test:e2e
```

---

## 🔐 Test Accounts

### Main Test Accounts

| Role | Email | Password | Description |
|------|-------|----------|-------------|
| Patient | `patient@chms.com` | `patient123` | Patient dashboard access |
| Doctor | `dr.smith@apollo.com` | `doctor123` | Doctor dashboard access |
| Staff | `nurse@apollo.com` | `staff123` | Staff member dashboard |
| Hospital | `contact@apollo.com` | `hospital123` | Hospital admin access |
| Admin | `admin@chms.com` | `admin123` | System administrator |

### Alternative Test Accounts

```
📋 Patient Accounts:
  - patient@apollo.com
  - patient2@apollo.com

👨‍⚕️ Doctor Accounts:
  - doctor@apollo.com
  - contact@apollo.com

👔 Staff Accounts:
  - nurse@apollo.com
  - staff@apollo.com

🏥 Hospital Accounts:
  - hospital@apollo.com

⚙️ Admin Accounts:
  - admin@chms.com
  - admin@apollo.com
```

### Default Credentials for New Accounts

- **New Staff Members:** `Staff123!@`
- **New Admin Accounts:** `Admin@123!`

---

## 📁 Project Structure

```
Hospital_management/
├── client/                          # Frontend (Next.js)
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx            # Landing page
│   │   │   ├── login/              # Authentication
│   │   │   ├── register/           # User registration
│   │   │   ├── dashboard/          # Main dashboard router
│   │   │   └── profile/            # User profile
│   │   ├── components/
│   │   │   ├── dashboard/          # Role-specific dashboards
│   │   │   ├── layout/             # Navigation & layout
│   │   │   ├── ui/                 # Reusable UI components
│   │   │   └── providers/          # Context providers
│   │   ├── context/                # React context (Auth, etc.)
│   │   ├── hooks/                  # Custom React hooks
│   │   └── lib/                    # Utility functions
│   ├── package.json
│   └── README.md
│
├── server/                          # Backend (NestJS)
│   ├── src/
│   │   ├── main.ts                 # Application entry point
│   │   ├── app.module.ts           # Root module
│   │   ├── auth/                   # Authentication module
│   │   ├── users/                  # User management
│   │   ├── doctors/                # Doctor module
│   │   ├── staff/                  # Staff management
│   │   ├── patients/               # Patient module
│   │   ├── appointments/           # Appointment booking
│   │   ├── prescriptions/          # Prescription management
│   │   ├── bills/                  # Billing system
│   │   ├── emergency/              # Emergency alerts
│   │   ├── notifications/          # Notification system
│   │   ├── medicine/               # Medicine inventory
│   │   ├── beds/                   # Bed management
│   │   └── hospitals/              # Hospital management
│   ├── test/                       # E2E tests
│   ├── package.json
│   └── README.md
│
└── README.md                        # This file
```

---

## 📡 API Documentation

### Authentication Endpoints

```
POST   /auth/login              - User login
POST   /auth/register           - User registration
POST   /auth/refresh            - Refresh access token
POST   /auth/logout             - User logout
```

### User Management

```
GET    /users/me                - Get current user profile
PUT    /users/:id               - Update user information
GET    /admin/users             - Get all users (Admin only)
POST   /admin/users             - Create new user (Admin only)
DELETE /admin/users/:id         - Delete user (Admin only)
```

### Patient Endpoints

```
GET    /patients                - Get all patients (Hospital/Admin)
GET    /patients/:id            - Get patient details
POST   /patients                - Create new patient
PUT    /patients/:id            - Update patient information
```

### Doctor Endpoints

```
GET    /doctors                 - Get all doctors
GET    /doctors/:id             - Get doctor details
POST   /doctors                 - Create new doctor account
GET    /doctors/me              - Get current doctor profile
```

### Appointments

```
GET    /appointments            - Get appointments (filtered by role)
POST   /appointments            - Book new appointment
PUT    /appointments/:id        - Update appointment
DELETE /appointments/:id        - Cancel appointment
GET    /appointments/:id        - Get appointment details
```

### Prescriptions

```
GET    /prescriptions           - Get prescriptions (filtered by role)
POST   /prescriptions           - Issue new prescription
GET    /prescriptions/:id       - Get prescription details
PUT    /prescriptions/:id       - Update prescription
```

### Bills & Billing

```
GET    /bills                   - Get bills (filtered by role)
POST   /bills                   - Create new bill
GET    /bills/:id               - Get bill details
PUT    /bills/:id               - Update bill status
```

### Emergency System

```
GET    /emergency/active        - Get active emergency alerts
POST   /emergency               - Create emergency alert
POST   /emergency/auto-call     - Trigger automatic emergency call with geolocation
PUT    /emergency/:id           - Update emergency status
GET    /emergency/:id           - Get emergency details
```

### Notifications

```
GET    /notifications           - Get user notifications
GET    /notifications/unread    - Get unread notifications count
PUT    /notifications/:id/read  - Mark notification as read
DELETE /notifications/:id       - Delete notification
```

### Beds

```
GET    /beds                    - Get all beds
GET    /beds/:id                - Get bed details
PUT    /beds/:id                - Update bed status
POST   /beds                    - Create new bed
```

---

## 🚨 Emergency System Features

### Motion Detection (Accelerometer)
- **Threshold:** 25G+ acceleration detected (uses HTML5 DeviceMotionEvent API)
- **Trigger:** Automatic emergency overlay when threshold exceeded
- **Cooldown:** 2-minute session silence cooldown after user interaction
- **Compatibility:** Works on Android and iOS devices with accelerometer support

### Emergency Alert System
- **SOS Button:** Prominent red button in header for quick access
- **Countdown Timer:** 15-second countdown before emergency call triggers
- **Cancel Option:** "I'm Okay" button to cancel within countdown period
- **Location Tracking:** Geolocation enabled (if user permits) for emergency dispatch
- **Fallback:** System continues if geolocation unavailable

### WhatsApp Notifications
- **API:** CallMeBot WhatsApp API (free, no authentication required)
- **Recipients:** Emergency contacts managed by patient
- **Message Format:** Includes patient name, location (if available), timestamp
- **Delivery:** Asynchronous delivery to all emergency contacts
- **Status:** Real-time emergency overlay shows notification status

### Audio & Vibration Alerts
- **Alert Sound:** 800Hz beep tone for 2 seconds
- **Vibration:** Haptic feedback if device supports Vibration API
- **Fallback:** System works even if hardware APIs unavailable

---

## 🔐 Security Features

### Authentication & Authorization
- **JWT Tokens:** 1-hour access tokens + 7-day refresh tokens
- **Password Security:** bcrypt hashing with 10 salt rounds
- **Role-Based Access:** 5 distinct roles with granular permissions
- **Token Rotation:** Automatic refresh token validation
- **Logout:** Immediate token invalidation on logout

### Data Protection
- **Database:** PostgreSQL with SSL/TLS encryption enforced (Neon)
- **SQL Injection:** TypeORM parameterized queries prevent SQL injection
- **CORS:** Regex-based CORS configuration for dev tunnels
- **Sensitive Data:** Passwords, tokens never logged or exposed
- **Audit Trail:** All critical operations logged with user context

### Environment Security
- **Secrets Management:** Required environment variables (JWT_SECRET, DATABASE_URL)
- **No Hardcoded Secrets:** Constructor throws error if secrets missing
- **Production Ready:** SSL/TLS enforced on all connections
- **HTTPS Only:** Dev tunnels use HTTPS for secure mobile testing

### HIPAA Compliance Considerations
- ✅ Patient data encryption in transit (SSL/TLS)
- ✅ Role-based access control to patient records
- ✅ Audit logging for data access
- ⚠️ **Note:** Additional compliance measures required before production deployment
- ⚠️ **Note:** Data at rest encryption should be configured per deployment standards

---

## 🐛 Troubleshooting

### Common Issues

#### 1. **Database Connection Error: ECONNREFUSED**
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
**Solution:**
- Ensure PostgreSQL is running or Neon connection URL is correct
- Check DATABASE_URL in `.env` file
- Verify network connectivity for cloud databases

#### 2. **JWT_SECRET Not Found Error**
```
Error: JWT_SECRET required
```
**Solution:**
- Create `.env` file with JWT_SECRET variable
- Run: `npm run start:dev` after setting environment variables

#### 3. **Hydration Mismatch Warning**
```
Warning: Expected server HTML to contain a matching element
```
**Solution:**
- Use incognito/private browsing mode
- Clear browser cache and cookies
- Disable browser extensions (can modify HTML)

#### 4. **Geolocation Permission Denied**
```
Emergency alert sent without location
```
**Solution:**
- Accept location permission when prompted
- Check browser settings for location access
- Ensure HTTPS is used (geolocation requires secure context)

#### 5. **Motion Detection Not Working**
```
Device motion events not triggering
```
**Solution:**
- Ensure `DeviceMotionEvent` permission granted on mobile
- Test on physical device (25G+ threshold requires real acceleration)
- Check browser supports DeviceMotionEvent API (most modern browsers)

#### 6. **Port Already in Use**
```
Error: listen EADDRINUSE :::3000 or :::3001
```
**Solution:**
```bash
# Windows - Kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

#### 7. **Build Fails with TypeScript Errors**
```
error TS2322: Type 'X' is not assignable to type 'Y'
```
**Solution:**
- Clear node_modules: `rm -r node_modules && npm install`
- Clear build cache: `npm run clean && npm run build`
- Ensure Node.js version matches requirements (v18+)

---

## 📋 Deployment Guide

### Frontend Deployment (Vercel)

1. **Push code to GitHub**
2. **Connect repository to Vercel**
3. **Set environment variable:**
   ```
   NEXT_PUBLIC_API_URL=<your-backend-url>
   ```
4. **Deploy:** Vercel auto-deploys on push to main branch

### Backend Deployment Options

#### Option 1: Railway
```bash
railway link
railway up
```

#### Option 2: Render
```bash
# Connect GitHub repo to Render
# Set environment variables in Render dashboard
# Render auto-deploys on push
```

#### Option 3: AWS EC2
```bash
# SSH into instance
ssh -i key.pem ubuntu@<instance-ip>

# Clone and setup
git clone <repo-url>
npm install
npm run build
npm run start:prod
```

### Database Deployment
- **Already Using:** Neon PostgreSQL (cloud-based, SSL enforced)
- **No additional setup required** - Neon handles backups and scaling

### Environment Variables for Production

**Backend (.env):**
```env
NODE_ENV=production
DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require
JWT_SECRET=<generate-strong-secret>
JWT_REFRESH_SECRET=<generate-strong-secret>
PORT=3001
FRONTEND_URL=https://yourdomain.com
```

**Frontend (.env.production):**
```env
NEXT_PUBLIC_API_URL=https://your-backend-url.com
NEXT_PUBLIC_APP_NAME=Jeevan Netra
```

---

## 💬 Support & Contact

For questions, bug reports, or feature requests:

📧 **Email:** [info@sangamjha.com.np](mailto:info@sangamjha.com.np)

### Report a Security Issue
Please email security concerns directly to the contact above. Do not create public issues for security vulnerabilities.

---

## 📜 License

This project is licensed under the **MIT License** - see the details below:

```
MIT License

Copyright (c) 2026 Sangam Jha

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

**For full license text, see [LICENSE](./LICENSE) file in the repository.**

---

## ⚖️ Contributing

This project is currently **not accepting external contributions** as it's under active development.

However, internal team contributions are welcome. For team members:
- Create feature branches: `git checkout -b feature/your-feature`
- Commit with clear messages
- Push and create pull request
- Request review before merging

---

## 🎓 Learning & References

### Key Technologies
- [NestJS Documentation](https://docs.nestjs.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [TypeORM Documentation](https://typeorm.io/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc7519)

### APIs Used
- [CallMeBot WhatsApp API](https://www.callmebot.com/blog/free-api-whatsapp-messages/)
- [HTML5 DeviceMotionEvent](https://developer.mozilla.org/en-US/docs/Web/API/DeviceMotionEvent)
- [Geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API)

---

## 📊 Project Statistics

| Metric | Value |
|--------|-------|
| **Frontend Routes** | 16+ |
| **Backend Modules** | 12+ |
| **Database Tables** | 15+ |
| **User Roles** | 5 |
| **Staff Types** | 13 |
| **API Endpoints** | 50+ |

---

## 🙏 Acknowledgments

- **Team:** Developed as part of Software Engineering Lab (SE Lab)
- **Institution:** PDEU (Pandit Deen Dayal Energy University), Sem 4
- **Framework Communities:** Thanks to NestJS, Next.js, and React communities

---

## 📝 Changelog

### v1.0.0 (Current Release)
- ✅ Core authentication system with JWT
- ✅ Emergency alert system with motion detection
- ✅ Role-based dashboards for 5 user types
- ✅ Appointment management system
- ✅ Prescription & billing system
- ✅ Hospital resource management
- ✅ Real-time notifications
- ✅ WhatsApp emergency notifications
- ✅ Production security hardening

---

## 🔍 Quality Assurance

- ✅ **Code Quality:** TypeScript strict mode enabled
- ✅ **Testing:** Jest test suite configured
- ✅ **Linting:** ESLint configured for code consistency
- ✅ **Build:** Zero compilation errors
- ✅ **Security:** All hardcoded secrets removed
- ✅ **Performance:** Server-side rendering optimized

---

**Last Updated:** April 20, 2026  
**Status:** v1.0.0 - Production Ready (Pre-deployment)
POST   /emergency               - Create emergency alert
PUT    /emergency/:id           - Update emergency status
GET    /emergency/:id           - Get emergency details
```

### Hospital Management

```
GET    /hospitals               - Get all hospitals
GET    /hospitals/:id           - Get hospital details
POST   /hospitals               - Create new hospital
PUT    /hospitals/:id           - Update hospital info
GET    /hospitals/:id/staff     - Get hospital staff
```

### Staff Management

```
GET    /staff                   - Get all staff
GET    /staff/me                - Get current staff profile
POST   /staff                   - Add new staff member
PUT    /staff/:id               - Update staff information
DELETE /staff/:id               - Remove staff member
```

### Admin Operations

```
GET    /admin/stats             - System statistics
GET    /admin/hospitals         - All hospitals (with details)
```

---

## 🔑 Key Features & Highlights

### Security
- 🔐 JWT-based authentication with secure token storage
- 🔒 Role-based access control (RBAC) on all endpoints
- 🛡️ Password hashing with bcrypt
- 🌐 HTTPS/SSL for all connections
- 🔄 Automatic token refresh mechanism

### Performance
- ⚡ Server-side rendering with Next.js
- 📦 Code splitting and lazy loading
- 🚀 Optimized API calls with Axios interceptors
- 💾 Efficient database queries with TypeORM relations

### User Experience
- 🎨 Modern, responsive UI with Tailwind CSS
- 🌙 Dark/Light theme support
- ⌨️ Keyboard navigation support
- 📱 Mobile-first responsive design
- ♿ Accessibility (a11y) considerations

### Developer Experience
- 📝 Full TypeScript support throughout
- 🧪 Comprehensive test coverage
- 📚 Well-documented API endpoints
- 🛠️ Development tools (ESLint, Prettier)
- 📦 Docker support (coming soon)


Last Updated: April 2026
