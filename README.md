# UniTender Portal
### Online Tender Management System for Schools & Universities
**Compliant with General Financial Rules (GFR 2017) & CVC Procurement Guidelines**

---

## 🏛️ Project Overview
UniTender is a complete, full-stack e-Procurement and Tender Management application tailored for educational institutions, colleges, and central/state universities. It implements the two-envelope bidding system (technical & financial), role-based evaluation committees, automated L1/QCBS scoring, SHA-256 cryptographic audit trails, anti-collusion checks, and vendor KYC management.

---

## 🚀 How to Run on Any Laptop (Step-by-Step)

### Prerequisites:
Make sure the laptop has **Node.js** installed (version 18 or higher recommended).
- Check by running: `node -v` and `npm -v` in your terminal.
- If not installed, download from [nodejs.org](https://nodejs.org).

---

### Step 1: Extract the Zip File
1. Right-click `unitender-system.zip` and select **Extract All...** (or run `unzip unitender-system.zip`).
2. Open your terminal / command prompt and navigate into the extracted folder:
   ```bash
   cd unitender-system
   ```

---

### Step 2: One-Step Setup & Run

#### Option A: Quick 1-Command Start (Fastest)
Since the production frontend bundle (`client/dist`) is already pre-compiled inside the project:
```bash
# 1. Install server dependencies
cd server
npm install

# 2. Start the server
node index.js
```
Now open your browser and navigate to:
👉 **`http://localhost:5000`**

---

#### Option B: Full Development Setup (If you want to edit code)
To install dependencies for both the backend and frontend:
```bash
# From the root directory:
npm run setup

# Start the full stack server:
npm start
```
Now open **`http://localhost:5000`**.

---

## 🔑 Test Accounts & Credentials

Every login requires a **Username** and **Password**, followed by a **Two-Factor Authentication (2FA OTP)** step.

| Persona Role | Username / Identifier | Password | Test 2FA OTP |
| :--- | :--- | :--- | :--- |
| **Procurement Admin** | `admin` *(or `procurement@univ.edu.in`)* | `admin123` *(or `password123`)* | `742910` |
| **Department Requester (HOD)** | `hod.cse@univ.edu.in` | `hod123` *(or `password123`)* | `742910` |
| **Evaluation Committee Chair** | `vikram.rao@univ.edu.in` | `comm123` *(or `password123`)* | `742910` |
| **Finance Officer / Approver** | `finance.officer@univ.edu.in` | `approver123` *(or `password123`)* | `742910` |
| **Registered MSME Bidder** | `bid@techsolindia.com` | `vendor123` *(or `password123`)* | `742910` |
| **CAG Auditor** | `internal.audit@univ.edu.in` | `auditor123` *(or `password123`)* | `742910` |

> 💡 **Tip**: Check the **"Remember login and password"** box on the login screen to keep your credentials saved on your laptop!

---

## 🌟 First-Time Users / New Bidders
If you don't have an account, click the **"First-Time Sign Up"** tab on the login screen to create a new bidder or departmental staff account with your name, desired username, email, phone, GSTIN, PAN, and MSME/Udyam exemption waiver.

---

## 📂 Project Architecture

```
unitender-system/
├── client/                     # React 18 + Tailwind CSS + Lucide Frontend
│   ├── public/                 # Static assets (university building graphic)
│   ├── src/
│   │   ├── components/         # Navbar, Sidebar, Modals
│   │   ├── context/            # AuthContext, LanguageContext
│   │   ├── pages/              # LoginPage, Dashboard, NoticeBoard, BidOpeningRoom...
│   │   ├── App.jsx             # Main Application Routing & Auth Gate
│   │   └── index.css           # Global Tailwind CSS Styles
│   ├── package.json
│   └── vite.config.js
│
├── server/                     # Node.js + Express Backend REST API
│   ├── db/                     # In-memory JSON database store & seed data
│   ├── routes/                 # Auth, Tenders, Bids, Evaluation, Audit, Payments...
│   ├── utils/                  # SHA-256 Crypto Ledger, Anti-Collusion Engine
│   ├── index.js                # Express entrypoint on port 5000
│   └── package.json
│
├── package.json                # Root orchestration scripts
└── README.md                   # Setup guide and instructions
```

---

## 🛠️ Troubleshooting

- **Port 5000 is already in use:**
  You can run with a custom port:
  ```bash
  PORT=5050 node server/index.js
  ```
  *(On Windows PowerShell: `$env:PORT=5050; node server/index.js`)*

- **Making edits to the frontend:**
  After editing any React files in `client/src`, rebuild the bundle:
  ```bash
  cd client
  npm run build
  ```
  Then refresh your browser at `http://localhost:5000`.
