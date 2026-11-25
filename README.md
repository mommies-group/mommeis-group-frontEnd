<div align="center">
  <img src="./public/mindbloom-logo.png" alt="MindBloom Logo" width="120" />
  <h1>MindBloom Specialist Portal</h1>
  <p>
    A modern pediatric telehealth and clinical care workspace built with React, TypeScript, Vite, Tailwind CSS, TanStack Query, and Jitsi Meet.
  </p>
</div>

---

## 🛠️ Built With

<div align="center">
  <p>
    <img src="https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React 19" />
    <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
    <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Tailwind_CSS_v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS v4" />
    <img src="https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=reactrouter&logoColor=white" alt="React Router" />
  </p>
  <p>
    <img src="https://img.shields.io/badge/TanStack_Query-FF4154?style=for-the-badge&logo=reactquery&logoColor=white" alt="TanStack Query" />
    <img src="https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white" alt="Axios" />
    <img src="https://img.shields.io/badge/Jitsi_Meet_SDK-1D76BA?style=for-the-badge&logo=jitsi&logoColor=white" alt="Jitsi Meet SDK" />
    <img src="https://img.shields.io/badge/React_Hot_Toast-FFCB2B?style=for-the-badge&logo=react&logoColor=1F2937" alt="React Hot Toast" />
  </p>
  <p>
    <img src="https://img.shields.io/badge/React_Compiler-149ECA?style=for-the-badge&logo=react&logoColor=white" alt="React Compiler" />
    <img src="https://img.shields.io/badge/Jest-C21325?style=for-the-badge&logo=jest&logoColor=white" alt="Jest" />
    <img src="https://img.shields.io/badge/Testing_Library-E33332?style=for-the-badge&logo=testinglibrary&logoColor=white" alt="Testing Library" />
    <img src="https://img.shields.io/badge/ESLint-4B32C3?style=for-the-badge&logo=eslint&logoColor=white" alt="ESLint" />
    <img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel" />
  </p>
</div>

---

## ✨ Key Features

- **Specialist Dashboard:** Overview cards for upcoming appointments, pending booking requests (with quick approve/reject and modal review), recent clinical notes, and quick navigation.
- **Bookings & Monthly Schedule:** Interactive calendar paired with paginated sessions, status filtering, booking review modal (approve, reject, propose alternative time, no-show, complete), and direct meeting entry.
- **Live Telehealth Meetings (`@jitsi/react-sdk`):** Embedded Jitsi video sessions where specialists can write clinical notes and create treatment plans while the call stays active, then complete the session cleanly.
- **Consent-Aware Patient Records:** Patient directory with search, clinical records (milestones, observations, assessments, triage history, and clinical notes CRUD), and graceful lock/empty states when consent or eligibility is restricted.
- **Treatment Plans Management:** Create, edit, submit, cancel, and track multi-session treatment plans with per-session scheduling, pricing calculation, discounts, and invoices.
- **Activity Library & Weekly Availability:** Manage recommended pediatric activities and configure recurring weekly consultation/session availability slots.
- **Specialist Profile, Pricing & Privacy:** View specialist profile details and specialties, manage consultation/session fees, and review consent/privacy notices.

---

## 🧭 Application Routes

| Route | View |
| --- | --- |
| `/login` | Specialist sign-in |
| `/dashboard` | Overview dashboard & pending requests |
| `/bookings` | Monthly schedule calendar & bookings list |
| `/bookings/:bookingId/meeting` | Embedded Jitsi telehealth session room |
| `/availability` | Weekly availability slots management |
| `/patients` | Patient directory |
| `/patients/record` | Patient clinical record & clinical notes |
| `/activities` | Specialist activity catalog |
| `/treatment-plans` | Treatment plans & session tracking |
| `/profile` | Specialist profile & session pricing |
| `/privacy` | Clinical access & privacy guidance |

---

## 🗂️ Project Structure

```text
specialist-portal/
├── public/
│   ├── favicon.png
│   ├── mindbloom-logo.png
│   └── icons.svg
├── src/
│   ├── components/       # UI primitives, icons, layout, and domain modals/panels
│   ├── hooks/            # TanStack Query hooks, mutations, and pagination hook
│   ├── lib/              # Axios instance, API error mapping, formatting, toasts
│   ├── pages/            # Route-level page components
│   ├── providers/        # App-wide providers (QueryClient, auth, toasts)
│   ├── router/           # Route definitions and navigation helpers
│   ├── services/         # Typed REST API service modules
│   └── types/            # TypeScript domain and API contracts
├── tests/                # Jest + React Testing Library test suites
├── .env.example          # Environment variable template
├── index.html            # HTML entry point & favicon metadata
├── package.json          # Dependencies and npm scripts
└── vercel.json           # SPA rewrite rules for Vercel
```

---

## ⚙️ Environment Variables

| Variable | Description | Example |
| --- | --- | --- |
| `VITE_API_BASE_URL` | Base URL for the MindBloom backend API | `https://mommeis-group-backend.com` |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** `20+`
- **npm**

### Installation & Local Development

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create your `.env` file from `.env.example` and configure `VITE_API_BASE_URL`:

   ```bash
   cp .env.example .env
   ```

3. Start the Vite development server:

   ```bash
   npm run dev
   ```

---

## 📜 Available Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the local Vite development server with HMR |
| `npm run build` | Type-check with `tsc -b` and build the production bundle with Vite |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint across the codebase |
| `npm test` | Run the Jest test suite |
| `npm run test:watch` | Run Jest in watch mode |

---

## 🧪 Testing & Deployment

- **Automated Tests:** 12 Jest + React Testing Library suites (100 tests) covering UI primitives, sidebar navigation, booking review flows, Jitsi meeting lifecycle, clinical notes, treatment plan forms, availability, activities, and profile pricing.
- **Deployment:** Configured with [`vercel.json`](./vercel.json) SPA rewrites (`/(.*) -> /index.html`) for client-side routing on Vercel.
