# BlueSentinel — AI Maritime Decision Intelligence Platform

BlueSentinel is an AI-powered maritime decision-support platform for cargo teams, charterers, and bulk shipping operators. It provides deterministic hydrodynamic squat calculations, port draft compliance auditing, Under Keel Clearance (UKC) verification, speed-fuel sensitivity modeling, and RAG document intelligence before a vessel approaches Indian ports.

Repository: **[https://github.com/harshitgadre786/BlueSentinel](https://github.com/harshitgadre786/BlueSentinel)**  
Active Feature Branch: **`feature/core-maritime-services`**

---

## 🎨 Visual Design System

BlueSentinel maintains a warm, human-crafted print editorial aesthetic:
* **Light Mode (Warm Paper)**:
  * Paper background: `#F7F1DF`
  * Typography & dark elements: Deep forest green `#103B2D`
  * Accent: Bright coral red `#F24B2A`
  * Secondary detail: Muted mustard `#D8A83C`
  * Soft border: `#D8D0BD`
  * Subtle tactile paper-grain texture
* **Dark Mode (Forest Navy)**:
  * Deep forest navy: `#0B211C`
  * Typography: Warm cream `#F7F1DF`
  * Accents: Coral red `#F24B2A` & Muted mustard `#D8A83C`
* **Typography**:
  * Headings: *Fraunces* (Bold, expressive editorial serif)
  * Body: *Plus Jakarta Sans* (Clean, legible geometric sans)
* **Emotional Visual Anchor**:
  * Handcrafted 3D paper-cut cargo vessel illustration (`VesselIllustration.tsx`) with geometric container stacks, coral waterline, and nautical route markings.

---

## ⚓ Completed Maritime Services & Routes

All routes are fully functional and return `HTTP 200 OK`:

| Service / Route | Status | Description |
|---|---|---|
| **Landing Page** (`/`) | Complete | Full-width editorial layout, hero cargo vessel anchor, "Clear decisions before costly mistakes", 3-step methodology, impact pillars. |
| **Authentication** (`/login`) | Complete | Split-screen layout, Google OAuth button, Phone OTP with 6-digit auto-advancing boxes, resend countdown timer, and sandbox preview. |
| **Workspace Command Hub** (`/workspace`) | Complete | Protected workspace starting point with 6 functional service entry points, user profile menu, and audit trail. |
| **Voyage Planner** (`/workspace/voyage-planner`) | Complete | Cargo type & quantity, origin & destination port selection, laycan date, bunker fuel price, USD/INR conversion rate, and port waiting days. |
| **Vessel Comparison** (`/workspace/voyage-planner/results`) | Complete | Side-by-side performance matrix for Vessel A (Panamax), Vessel B (Eco-Ultramax), and Vessel C (Supramax). Deterministic landed cost in USD & INR, draft margin, and rejection analysis modal. |
| **Port Compliance** (`/workspace/compliance`) | Complete | Detailed Indian port rules (Paradip, Deendayal/Kandla, JNPT), tidal window selector, draft-limit verification with GREEN/AMBER/RED status, and mandatory document checklists. |
| **BlueAI Document Copilot** (`/workspace/blueai`) | Complete | Two-column RAG intelligence interface. Upload PDF specs/tariffs, extract chunks with page metadata, vector search, and Gemini REST API integration. Strictly cites filename and page number. |
| **What-If Simulator** (`/workspace/simulator`) | Complete | Interactive scenario sliders: speed (10.5–16.5 kts), fuel price shift (-15% to +15%), port wait days (0–7d), FX rate, and high spring tide toggle with Recharts cost & speed curves. |
| **Environmental Impact** (`/workspace/environment`) | Complete | Voyage route cartographic projection with Leaflet, CO2 emissions, speed-fuel trade-offs, and Underwater Radiated Noise (URN) sound pressure alerts for cetacean corridors. |
| **Decision Reports** (`/workspace/reports`) | Complete | Exportable official *BlueSentinel Voyage Decision Brief* with executive recommendation, comparative matrix, BlueAI citations, and 1-click jsPDF export. |

---

## 🚢 Three-Vessel Scenario Breakdown

1. **Vessel A (MV Ocean Titan - Post-Panamax)**:
   * Loaded Draft: **14.80 m** (Dynamic arrival draft: 14.98 m at 14 kts).
   * Paradip Channel Limit: **14.20 m CD**.
   * **Breaches Under Keel Clearance by 0.78 m**.
   * *The Commercial Trap*: Base freight appears $17,500/day, but non-compliance incurs **$68,000+** in compulsory offshore lightering and **3.5 days** in tidal delay demurrage ($77,000+), inflating true risk-adjusted cost to **$437,000+**.

2. **Vessel B (MV Nilgiri Wave - Eco-Ultramax)**:
   * Loaded Draft: **13.30 m** (Dynamic arrival draft: 13.42 m at 13.5 kts).
   * **Surplus UKC: +0.78 m safe clearance**.
   * Base charter: $21,500/day.
   * Zero lightering risk, prompt berthing, Tier III low-emission fuel burn, lowest risk-adjusted cost of **$328,000+**.
   * **Verdict: Recommended Candidate**.

3. **Vessel C (MV Bengal Pioneer - Aging Supramax)**:
   * Loaded Draft: **12.80 m** (Complies with draft).
   * Low initial base rate ($16,800/day).
   * Higher auxiliary fuel burn (4.8 MT/d) and steep charterparty demurrage penalty terms ($28,500/day).
   * As port waiting increases beyond 3.5 days in the What-If Simulator, Vessel C's demurrage escalates drastically, making it high-risk.

---

## 🔄 End-to-End Hackathon Demo Flow

1. **Log in**: Navigate to `/login`, enter any phone number and use verification code `123456`, or click *"Quick Pilot: Explore as Captain Sharma"*.
2. **Open Voyage Planner**: Click *"Plan a Voyage"* on `/workspace` or go to `/workspace/voyage-planner`.
3. **Configure Voyage**: Review cargo (75,000 MT Thermal Coal) bound for Paradip Port.
4. **Compare Candidates**: Click *"Compare Vessels & Run Audit"*. Notice Vessel A fails draft compliance (-0.78m breach) and Vessel B is recommended.
5. **Inspect Rejections**: Click *"Why was Vessel A rejected?"* to view the deterministic naval architecture audit trail.
6. **Query BlueAI Copilot**: Open `/workspace/blueai` and click *"Why was Vessel A rejected?"*. Observe BlueAI cite `[Paradip_Port_Notice_Marine_Circular_2026.pdf, Page 2]` and `[MV_Sagar_Samrat_Panamax_SpecSheet.pdf, Page 1]`.
7. **Simulate Scenarios**: Open `/workspace/simulator` and slide fuel price to `+15%` and port wait to `5.0 days`. Observe how Vessel C's demurrage balloons and Vessel B remains the lowest risk-adjusted option.
8. **Check Environmental Impact**: Open `/workspace/environment` and adjust speed to see how dropping below 11.5 knots achieves cetacean safety in the Sri Lanka marine corridor.
9. **Export Decision Brief**: Open `/workspace/reports` and click *"Export Official PDF"* to download the formatted *BlueSentinel Voyage Decision Brief*.

---

## 🛠️ Setup & Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Populate the keys:
```env
# Supabase Project Credentials (Authentication & Vector Storage)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Optional: Google Gemini API Key for Live AI Synthesis
NEXT_PUBLIC_GEMINI_API_KEY=your-gemini-api-key
GEMINI_API_KEY=your-gemini-api-key

# Site URL for OAuth callbacks
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

> **Note**: If live Supabase or Gemini keys are not configured, BlueSentinel automatically runs in **Grounded Deterministic Engine Mode**, ensuring zero mathematical hallucinations and flawless offline evaluation for judges.

---

## 📦 Local Installation & Run

```bash
# Install dependencies
npm install

# Build production bundle
npm run build

# Start production server on port 3000
npm run start -- -p 3000
```

Access the app at: **`http://localhost:3000`**

---

## 🔒 Known Limitations & Prototype Boundaries

1. **Simulated Data**: All bathymetry limits, weather zones, and lightering tariffs represent calibrated prototype data and must not be used for live navigation.
2. **Third-Party SMS Gateways**: Real SMS delivery requires Twilio/MessageBird credentials configured in Supabase. In development mode, test code `123456` enables instant verification.
3. **Map Tiles**: Basemap uses CartoDB Dark Matter / OpenStreetMap tiles. High-seas satellite bathymetry layers require active network connectivity.
