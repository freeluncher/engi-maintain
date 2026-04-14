# 🛠️ EngiMaintain

**EngiMaintain** is a modern platform built with a *monorepo* architecture specifically designed for managing infrastructure assets and daily, weekly, or *preventive* maintenance scheduling. This platform empowers *Engineers* and *Managers* with full visibility over the operational status of field equipment.

---

## 🚀 Tech Stack

This project utilizes a Monorepo approach with a clear separation between the user interface system *(Frontend)* and the API database logic *(Backend)*.

**Frontend:**
- ⚛️ **React 19** via **Vite**
- 🎨 **Tailwind CSS v4** (Modern styling pipeline via PostCSS)
- 🛣️ **React Router v7** (Navigation protection & routing)
- 🐻 **Zustand** (Lightweight global state management)
- 📝 **React Hook Form & Zod** (Industry-standard form validation)
- 🔗 **TanStack Query (React Query)** (Asynchronous lifecycle & data fetching)

**Backend & Database:**
- 🟢 **Node.js**
- 🗄️ **PostgreSQL**
- 🔰 **Prisma ORM** (Advanced database schema validation and relations, supporting seamless migrations)

---

## 📂 Monorepo Structure

The project is maintained using a single-directory structure, separating domains based on *apps*:

```text
engi-maintain/
├── apps/
│   ├── frontend/         # Core User Interface Application (React + Vite)
│   └── backend/          # API server and Database controller setup (Prisma)
├── logs/                 # Debugger output logs (if generated)
├── package.json          # Root workspace dependency definitions
└── .gitignore            # Excludes sensitive files from the repository
```

---

## ⚙️ Prerequisites

Before executing the project on your local machine, ensure the following environments are installed:
- [Node.js](https://nodejs.org/en/) (Recommended `v18.x` or newer)
- Native Package Manager (`npm` is natively integrated into the ecosystem)
- A running **PostgreSQL** database on port 5432 (or a hosted instance URL)

---

## 🏁 Getting Started

Follow the steps below to spin up the local development servers.

### 1. Install Dependencies
Navigate to the root terminal directory and install the necessary package dependencies:
```bash
npm install
```

### 2. Backend Database Setup
This platform utilizes the power of Prisma. Create an `.env` file within the backend directory and ensure it supplies a valid `DATABASE_URL` targeting your PostgreSQL instance.

Afterward, execute the schema synchronization script via terminal:
```bash
cd apps/backend
npx prisma format       # Validates your schema.prisma syntax
npx prisma migrate dev  # Builds tables and infrastructure inside your local DB
```

### 3. Running the Local Environment
Both application environments can be executed concurrently. Run the primary development scripts from your target folder:
```bash
# Starts the Vite react server on the default port
npm run dev
```

*(Note: You're encouraged to define concurrent scripts within the root `package.json` to trigger both backend API and Frontend seamlessly later)*

---

## ✨ Core Features
- **User Authentication:** Login interface equipped with industry-standard validation and secure local storage sessions.
- **Asset Management Module:** Comprehensive cataloging of historical statuses, serial numbers, and locational tracing of corporate equipment.
- **Maintenance Logger:** Keep track of utilized/replaced spare parts and machinery downtime metrics (addressing both Preventive and Corrective maintenance).
- **Automation Scheduler Alerts:** Proactively monitor and receive insights on which machines are arriving at calibration periods (*Overdue and Due Date Alerts*).

---

<p align="center">
  <i>Built with ❤️ to automate the operational workflow of engineering practitioners.</i>
</p>
