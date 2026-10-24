# BlueSentinel — Maritime Decision Intelligence Platform

BlueSentinel is an editorial, human-designed maritime decision-support platform helping cargo and shipping companies make safer voyage decisions using port rules, vessel hydrodynamics, cost risk, and AI recommendations.

---

## 🎨 Visual Design System

BlueSentinel rejects generic AI SaaS dashboards, cyberpunk neon, and cluttered logistics tables in favor of a warm, human-crafted print editorial aesthetic inspired by maritime navigation gazettes:

* **Light Mode (Warm Paper)**:
  * Paper Background: `#F7F1DF`
  * Primary Text & Dark Elements: Deep Forest Green `#103B2D`
  * Primary Accent: Bright Coral Red `#F24B2A`
  * Secondary Accent: Muted Mustard `#D8A83C`
  * Soft Border: `#D8D0BD`
  * Subtle tactile paper-grain texture
* **Dark Mode (Forest Navy)**:
  * Deep Forest Navy: `#0B211C`
  * Warm Cream Typography: `#F7F1DF`
  * Accents: Coral Red `#F24B2A` & Muted Mustard `#D8A83C`
  * Preserves editorial identity without cold blue cyberpunk styling
* **Typography**:
  * Headings: *Fraunces* (Bold, expressive editorial serif display font)
  * Body: *Plus Jakarta Sans* (Clean, legible geometric sans-serif)
* **Illustration**:
  * Bespoke 3D paper-cut editorial cargo vessel illustration featuring layered hull geometry, coral waterline, container stacks, and minimal navigation route lines.

---

## 🗺️ Application Routes

### 1. Landing Page (`/`)
* **Header**: Minimal logo, compass + wave mark, editorial navigation links, and theme toggle.
* **Hero**: Full-width calm layout with the headline *"Every voyage deserves a safer decision."*, supporting text, *"Explore BlueSentinel"* CTA, and the 3D paper-cut vessel illustration.
* **Main Goal**: Large editorial statement: *"Clear decisions before costly mistakes."* (No generic card grids).
* **How It Works**: 3 numbered steps with custom line art:
  1. `01.` Add voyage details
  2. `02.` Check vessel, port, and cost risk
  3. `03.` Receive a clear recommendation
* **Impact Section**: Statement *"Less uncertainty at sea. Better decisions on shore."* with 3 pillars: Safer port calls, Lower avoidable cost, Clearer operational decisions.
* **Final CTA & Footer**: Direct entry to `/login` and privacy/terms links.

### 2. Login Page (`/login`)
* **Split Screen Layout**:
  * **Left**: Warm paper cargo vessel illustration navigating calm waters with the quote: *"A clearer course starts here."*
  * **Right**: Clean authentication card.
* **Authentication Options**:
  1. **Google OAuth**: Official Google sign-in button wired to `supabase.auth.signInWithOAuth({ provider: 'google' })`.
  2. **Phone Number SMS OTP**:
     * Country-code selector (+91, +1, +65, +44, +971, +61).
     * Dispatches secure 6-digit verification code.
     * Transitions smoothly into an **interactive 6-box OTP entry**:
       * Auto-advance on keystroke
       * Backspace reverse focus
       * Full clipboard paste support
       * 45-second resend countdown timer
       * Clear validation, error, and loading states
* **Supabase Integration**:
  * Reads from environment variables without hardcoded secrets.
  * In unconfigured environments, clearly notifies the evaluator while offering a Sandbox verification code (`123456`) and 1-Click Captain access for testing.

### 3. Workspace Page (`/workspace`)
* **Protected Route**: Unauthenticated users are redirected to `/login`.
* **Top Bar**: Minimal logo, Bulk & Tanker Operations Desk indicator, theme toggle, and profile dropdown with user metadata and **Log out**.
* **Main Welcome**: *"Good morning, Captain."* with supporting text *"What would you like to plan today?"*.
* **Three Spacious Service-Entry Tiles**:
  1. **Plan a voyage** (Speed cubic curves, fuel calculations, arrival ETA).
  2. **Check port compliance** (Draft limits, tidal clearance, UKC at Indian harbours).
  3. **Ask BlueAI** (Grounded RAG assistant citing port notices and spec sheets).
* **Recent Activity**: Spacious empty-state container with the message *"Your voyage decisions will appear here."*

---

## ⚙️ Environment Variables Setup

Create a `.env.local` file in the project root:

```env
# Supabase Project Credentials
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-public-key

# Application URL for OAuth redirects
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Setting up Supabase Authentication:

1. **Google OAuth**:
   * In the Supabase Dashboard, navigate to **Authentication** > **Providers** > **Google**.
   * Enable Google and add your Google Cloud OAuth Client ID and Secret.
   * Add `http://localhost:3000/workspace` to your **Redirect URLs**.

2. **Phone Number SMS OTP**:
   * Navigate to **Authentication** > **Providers** > **Phone**.
   * Enable Phone and configure your SMS provider (Twilio, MessageBird, or Vonage).
   * For local testing, add test phone numbers in Supabase under **Authentication** > **Phone** > **Test Phone Numbers**.

---

## 🚀 Running Locally

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Or build and run production server
npm run build
npm run start
```

The application will be accessible at `http://localhost:3000`.
