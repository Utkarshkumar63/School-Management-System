# School Management System (Algions AI Labs Assessment)

> A production-quality, modular full-stack **School Management System** engineered for the Algions AI Labs internship assessment. Built with a modular monolith backend architecture, strict server-side Role-Based Access Control (RBAC), an idempotent financial fee ledger, automated grading rules engine, audit logging, and a glassmorphic user interface.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Render-brightgreen?style=for-the-badge&logo=render)](https://school-management-system-1-24yo.onrender.com/login)
[![Swagger API Docs](https://img.shields.io/badge/API%20Docs-Swagger-blue?style=for-the-badge&logo=swagger)](https://school-management-system-1-24yo.onrender.com/api/docs)
[![Tests Passing](https://img.shields.io/badge/Tests-19%2F19%20Passing-success?style=for-the-badge)](https://github.com/Utkarshkumar63/School-Management-System)

---

## 🌐 Live Deployment & Interactive Access

| Service | Live Link | Status |
| :--- | :--- | :--- |
| **Live Web Application (Portal)** | 🚀 **[https://school-management-system-1-24yo.onrender.com/login](https://school-management-system-1-24yo.onrender.com/login)** | **Online (Production)** |
| **Interactive Swagger API Docs** | 📖 **[https://school-management-system-1-24yo.onrender.com/api/docs](https://school-management-system-1-24yo.onrender.com/api/docs)** | **Active** |
| **Server Health Endpoint** | 🟢 **[https://school-management-system-1-24yo.onrender.com/health](https://school-management-system-1-24yo.onrender.com/health)** | **Healthy** |

### 🔑 Demo Portal Credentials

| Role | Email Address | Password | Permissions & Scope |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@school.test` | `Admin@123` | Institutional dashboard, academic setup, student/teacher roster, fee ledger, grading rules, audit logs |
| **Teacher** | `teacher@school.test` | `Teacher@123` | Assigned classes only (Grade 10-A Maths/Science), daily attendance recording, exam marks entry |
| **Parent / Guardian** | `guardian@school.test` | `Guardian@123` | Restricted strictly to linked children (Julian & Beatrice Vance), attendance record %, report card, online fee payment |

---

## 🌟 Key Highlights & Architecture

- **Backend Architecture**: Modular monolith built on Node.js (Express.js, ES Modules) separating routes, controllers, services, database models, validators, and middlewares.
- **Frontend Architecture**: Modern React.js (Vite) single-page application with React Router v6, Axios interceptors, React Hook Form, and Zod.
- **Strict Server-Side RBAC**: Authorization is strictly enforced via server middlewares (`authenticate`, `authorizeRoles`, `authorizeTeacherAssignment`, `authorizeGuardianStudent`). Never relies on merely hiding UI buttons.
- **Financial Fee Ledger with Idempotency**: Double-entry ledger tracking debits (invoices) and credits (payments). Enforces strict status transitions (`Pending` -> `Partially Paid` -> `Paid`), rejects overpayment, and provides idempotency keys to prevent duplicate payments on retries or double-clicks.
- **Configurable Grading Engine**: Grading policies stored in MongoDB and editable by administrators. Evaluates exam marks, percentages, letter grades, GPAs, and pass/fail thresholds.
- **Forensic Audit Trail**: Captures actor, role, action, target entity, entity ID, changes, IP address, and timestamps for all material events (logins, grading, attendance, invoices, payments).
- **Design System**: Global serif typography (`"Times New Roman", Times, serif`), white `#FFFFFF` canvas with subtle soft pastel gradient blobs, glassmorphic panels (`backdrop-filter: blur(14px)`), accessible forms, and responsive mobile-ready layouts.

---

## 🧱 Tech Stack

| Domain | Technology / Library |
| :--- | :--- |
| **Backend** | Node.js (v18+ / v20+ / v24+), Express.js (ES Modules) |
| **Database** | MongoDB with Mongoose ODM (indexes, validation, transactions/atomic updates) |
| **Authentication** | JSON Web Tokens (JWT) + bcrypt password hashing |
| **Request Validation** | Zod schemas on every endpoint |
| **Security** | Helmet, CORS, Express-Rate-Limit, Express-Mongo-Sanitize, Dotenv |
| **API Documentation** | Swagger / OpenAPI (`swagger-ui-express`, `swagger-jsdoc`) at `/api/docs` |
| **Testing** | Jest + Supertest + MongoDB-Memory-Server |
| **Frontend** | React 18, Vite, React Router 6, Axios, React Hook Form, Zod, Recharts, Lucide Icons |

---

## 📂 Project Structure

```text
├── server/
│   ├── src/
│   │   ├── config/          # Database, Environment, Swagger OpenAPI definitions
│   │   ├── controllers/     # HTTP endpoint handlers (Auth, Academic, Attendance, Exam, Fee, Dashboard, Reports, Audit)
│   │   ├── middlewares/     # JWT Auth, RBAC guards, Zod validator, Error handler, Audit logger
│   │   ├── models/          # 16 Mongoose models (User, Student, Guardian, Teacher, Attendance, Invoice, etc.)
│   │   ├── routes/          # Versioned REST routes (/api/v1/...)
│   │   ├── seed/            # Deterministic, repeatable seeding script (npm run seed)
│   │   ├── services/        # Pure business logic layer (Academic, Attendance, Exam, Fee, Ledger, Reports)
│   │   ├── tests/           # Unit tests & Supertest integration test suite
│   │   ├── utils/           # ApiResponse, GradingEngine, Idempotency, CsvExporter, Logger
│   │   ├── app.js           # Express app configuration & middleware pipeline
│   │   └── server.js        # Server listener and database connector
│   ├── .env.example
│   └── package.json
│
├── client/
│   ├── src/
│   │   ├── components/      # Glassmorphic UI library (Cards, Tables, Modals, Badges, Inputs, Layouts)
│   │   ├── context/         # AuthContext (JWT session) and ToastContext (Floating alerts)
│   │   ├── pages/
│   │   │   ├── admin/       # Dashboard, Students, Teachers, Guardians, Classes, Attendance, Exams, Fees, Reports, Audit
│   │   │   ├── teacher/     # Dashboard, My Classes, Mark Attendance, Enter Marks, Class Reports
│   │   │   ├── guardian/    # Dashboard, Child Attendance, Report Cards (Print/PDF), Fee Payments
│   │   │   ├── auth/        # Login page with 1-click demo credential fillers
│   │   │   └── common/      # 404 Not Found, 403 Unauthorized
│   │   ├── routes/          # ProtectedRoute & AppRoutes with role verification
│   │   ├── services/        # Axios API client with token interceptors
│   │   ├── styles/          # Times New Roman global typography & glassmorphism styling
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example
│   ├── vite.config.js
│   └── package.json
│
├── TECHNICAL_REPORT.md      # Deep-dive architecture and design decisions
└── README.md
```

---

## ⚙️ Quick Start & Local Run

### Prerequisites
- **Node.js** (v18 or higher)
- **MongoDB** (local mongod instance on `mongodb://localhost:27017` or MongoDB Atlas URI)

### 1. Clone & Install Dependencies

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Configure Environment Variables

Create `.env` in `server/` (or copy from `.env.example`):
```env
PORT=5001
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/school_management_db
JWT_SECRET=super_secret_jwt_key_school_management_2026
JWT_EXPIRES_IN=1d
CORS_ORIGIN=http://localhost:5173
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=1000
```

Create `.env` in `client/`:
```env
VITE_API_URL=http://localhost:5001/api/v1
```

### 3. Seed Demo Data

Run the repeatable seed script to populate realistic dummy data (1 Admin, 3 Teachers, 6 Guardians, 30 Students, Classes, Attendance, Exams, Invoices, Payments, and verified Ledger):

```bash
cd server
npm run seed
```

### 4. Run the Application

You can start backend and frontend in separate terminals:

```bash
# Terminal 1 - Backend Server (Port 5001)
cd server
npm start
# or for live watch: npm run dev

# Terminal 2 - Frontend Client (Port 5173)
cd client
npm run dev
```

Open your browser at **`http://localhost:5173`**.

---

## 🔑 Demo Credentials (Synthetic Only)

| Role | Email Address | Password | Permissions & Scope |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `admin@school.test` | `Admin@123` | Full system access: Students, Teachers, Guardians, Classes, Attendance, Exams, Grading Policy, Invoices, Reports, and Audit Trail. |
| **TEACHER** | `teacher@school.test` | `Teacher@123` | Restricted access: Only assigned classes (Grade 10 Sec A & Sec B Math). Marks daily attendance, enters exam marks for assigned subjects. |
| **GUARDIAN** | `guardian@school.test` | `Guardian@123` | Restricted access: Linked to Julian Sterling and Beatrice Sterling. Views only their attendance, report cards (printable view), and simulated fee payment. |

*Note: The login page includes 1-click credential buttons for immediate role testing.*

---

## 🧪 Automated Test Suite

The test suite includes comprehensive unit and integration tests powered by **Jest + Supertest + MongoDB-Memory-Server**:

```bash
cd server
npm test
```

### Verified Acceptance Scenarios (19/19 Passing):
1. **Teacher RBAC & Assignment Enforcement**: Teacher can access only assigned classes to record attendance; accessing an unassigned class returns **`403 Forbidden`**.
2. **Attendance Duplicate Handling**: Recording attendance for the same student, date, and session safely updates (upserts) the record without generating database duplicate errors.
3. **Exam Result Calculation**: Evaluates marks obtained against configured DB grading rules, calculates total score, percentage, letter grade, and pass/fail thresholds.
4. **Guardian Data Isolation**: Guardian views only linked children's records; requesting data for unlinked students is blocked with **`403 Forbidden`**.
5. **Fee Ledger Reconciliation**: Sum of debits (invoices) minus credits (payments) mathematically reconciles with running ledger balances.
6. **Negative / Conflict Handling**:
   - Duplicate payment requests with identical `idempotencyKey` are processed idempotently without double-billing.
   - Overpayment exceeding invoice outstanding balance is rejected (**`400 Bad Request`**).
   - Payments on fully paid or cancelled invoices are blocked (**`400 Bad Request`**).
   - Marks exceeding subject maximum marks are rejected (**`400 Bad Request`**).

---

## 📖 API Documentation & Endpoints

Swagger / OpenAPI documentation is hosted interactively at:
- **Production Live**: 👉 **[https://school-management-system-1-24yo.onrender.com/api/docs](https://school-management-system-1-24yo.onrender.com/api/docs)**
- **Local Dev**: 👉 `http://localhost:5001/api/docs`

### Summary of REST API Routes (`/api/v1`)
- **Authentication**: `POST /auth/login`, `GET /auth/me`
- **Academic Administration**:
  - `GET/POST /academic/classes`, `GET/PUT/DELETE /academic/classes/:id`
  - `GET/POST /academic/sections`, `GET/PUT/DELETE /academic/sections/:id`
  - `GET/POST /academic/subjects`, `GET/PUT/DELETE /academic/subjects/:id`
  - `GET/POST /academic/students`, `GET/PUT/DELETE /academic/students/:id`
  - `GET/POST /academic/guardians`, `POST /academic/guardians/link`
  - `GET/POST /academic/teachers`
  - `GET/POST /academic/assignments`, `GET /academic/assignments/my`, `DELETE /academic/assignments/:id`
- **Attendance**:
  - `POST /attendance/mark` (single upsert)
  - `POST /attendance/mark-batch` (class section roster upsert)
  - `GET /attendance` (query records)
  - `GET /attendance/student/:studentId/summary` (monthly percentage)
  - `GET /attendance/class/:classId/summary` (class daily percentage)
- **Examinations & Grading**:
  - `GET/POST /exams`, `GET/PUT/DELETE /exams/:id`
  - `GET/POST /exams/grading/rules`, `PUT/DELETE /exams/grading/rules/:id`
  - `POST /exams/marks` (enter marks with RBAC & validation)
  - `GET /exams/results/list` (query exam results)
  - `GET /exams/report-card/:studentId` (official transcript)
- **Fee Management & Ledger**:
  - `GET/POST /fees/structures`
  - `GET/POST /fees/invoices`, `POST /fees/invoices/batch`, `GET /fees/invoices/:id`
  - `POST /fees/payments` (simulated payment with idempotencyKey)
  - `GET /fees/payments`
  - `GET /fees/ledger/:studentId` (student running balance)
  - `GET /fees/reconciliation` (system-wide audit)
- **Dashboards & Reports**:
  - `GET /dashboard/admin`, `GET /dashboard/teacher`, `GET /dashboard/guardian`
  - `GET /reports/attendance` (JSON & CSV export)
  - `GET /reports/academic` (JSON & CSV export)
  - `GET /reports/fees` (JSON & CSV export)
- **Audit Trail**:
  - `GET /audit/logs` (Admin-only forensic log with pagination & filters)

---

## 🗺️ Database Entity Relationship (ER) Diagram

```mermaid
erDiagram
    User ||--o| Teacher : "profile"
    User ||--o| Guardian : "profile"
    User ||--o{ Attendance : "records"
    User ||--o{ ExamResult : "grades"
    User ||--o{ Payment : "authorizes"
    User ||--o{ AuditLog : "initiates"

    Class ||--|{ Section : "contains"
    Class ||--|{ Subject : "curriculum"
    Class ||--|{ Student : "enrolled"
    Class ||--|{ Exam : "schedules"
    Class ||--|{ FeeStructure : "bills"

    Guardian ||--|{ Student : "custody (1 to N)"
    
    Student ||--|{ Attendance : "marked"
    Student ||--|{ ExamResult : "achieves"
    Student ||--|{ Invoice : "billed"
    Student ||--|{ Payment : "credited"
    Student ||--|{ LedgerEntry : "ledger"

    Teacher ||--|{ TeacherAssignment : "assigned"
    Class ||--|{ TeacherAssignment : "class"
    Section ||--|{ TeacherAssignment : "section"
    Subject ||--|{ TeacherAssignment : "subject"

    Exam ||--|{ ExamResult : "computes"
    GradingRule ||..o{ ExamResult : "determines grade"

    FeeStructure ||--o{ Invoice : "template"
    Invoice ||--|{ Payment : "settles"
    Invoice ||--|| LedgerEntry : "debits"
    Payment ||--|| LedgerEntry : "credits"
```

---

## ⚠️ Known Limitations & Future Scope

1. **Simulated Payments**: Financial transactions are simulated using an internal accounting engine. No real banking or payment gateway (Stripe/PayPal) is integrated, by design for assessment isolation.
2. **Document Uploads**: Student photos and certificates currently store placeholder URLs rather than AWS S3 / Cloudinary cloud storage.
3. **SMS / Email Dispatch**: Guardian notification webhooks for absent attendance and overdue invoice reminders are logged to the audit trail rather than dispatched via external SMS providers (Twilio/SendGrid).
