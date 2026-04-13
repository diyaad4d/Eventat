# EVENTAT — Production Roadmap
### From Academic MVP → Industry-Grade SaaS Marketplace

**Prepared by:** Senior Software Architect Review  
**Codebase Baseline:** React 19 + Express + PostgreSQL (MVP)  
**Source Document:** GP_5.pdf — "Eventat: A Web-Based Marketplace for Centralized Event Planning Services" (JUST, Fall 2025)  
**Target:** A high-end, real-world event planning marketplace competitive with Weddified, The Knot, and regional MENA equivalents.

---

## TABLE OF CONTENTS

1. [Gap Analysis](#gap-analysis)
2. [Phase 1 — Massive Frontend Expansion (UI-First)](#phase-1)
3. [Phase 2 — Backend & Database Architecture](#phase-2)
4. [Phase 3 — Security & AI Enhancements ⛔ POSTPONED](#phase-3)

---

<a name="gap-analysis"></a>
## SECTION 1 — GAP ANALYSIS

> A brutally honest comparison between the current MVP codebase and a production-grade marketplace, informed by the PDF's vision and industry benchmarks.

---

### 1.1 Architecture Gaps

| Area | Current State | Production Standard | Gap Severity |
|---|---|---|---|
| **Routing** | Basic React Router v7 with 5 routes | 20+ routes with lazy loading, protected routes, and nested layouts | 🔴 Critical |
| **State Management** | `useState` + `localStorage` only | Zustand or React Context with persistence + React Query for server state | 🔴 Critical |
| **API Layer** | Inline `axios.get/post` in every component | Centralized API service layer with interceptors, error boundaries, retry logic | 🔴 Critical |
| **Component Architecture** | Monolithic page components with inline styles | Atomic Design system: atoms → molecules → organisms → pages | 🔴 Critical |
| **Styling** | 100% inline JavaScript style objects | Tailwind CSS utility classes + CSS variables for theming | 🟠 High |
| **Environment Config** | Hardcoded `https://eventat-backend.onrender.com` URLs in every file | `.env` driven config with `VITE_API_BASE_URL` | 🟠 High |
| **Error Handling** | `alert()` popups for all errors | Toast notification system + form-level validation errors | 🟠 High |
| **Loading States** | "Loading services..." plain text | Skeleton screens, shimmer loaders, optimistic UI | 🟡 Medium |
| **Responsive Design** | No mobile breakpoints | Mobile-first responsive design across all pages | 🟠 High |
| **Code Splitting** | All routes load simultaneously | `React.lazy()` + `Suspense` for route-level code splitting | 🟡 Medium |

---

### 1.2 Feature Gaps — What the PDF Specified vs. What Was Built

#### Features Specified in PDF but Completely Missing from Code:

**User & Auth System:**
- ❌ Password hashing (plaintext passwords stored in DB — critical security hole)
- ❌ JWT token authentication (no session management)
- ❌ Role-based access control (customer, vendor, admin roles unguarded)
- ❌ Profile management page (wireframed in PDF, not built)
- ❌ Change password flow
- ❌ Delete account flow
- ❌ Vendor registration extended profile (company name, logo, description)

**Service Discovery:**
- ❌ Advanced search with text query
- ❌ Category-based filtering (the PDF shows Venue → Hotels/Halls/Farms/Indoor/Outdoor subcategories)
- ❌ Price range slider filter
- ❌ Location/city filter
- ❌ Rating filter
- ❌ Subcategory filter chips
- ❌ Sort by (price, rating, newest)
- ❌ Service detail page (the PDF shows a full detail page with gallery, description, "Shop Similar" section)

**Booking & Planning:**
- ❌ Cart system (PDF explicitly shows a cart page for multi-service selection)
- ❌ Event Plan builder (customer can build an event with multiple services)
- ❌ Event type selection (Wedding, Graduation, Gender Reveal, Corporate, General)
- ❌ Booking status flow (pending → accepted/rejected by vendor)
- ❌ Booking cancellation
- ❌ Booking history / order history page

**Vendor Capabilities:**
- ❌ Vendor dashboard (zero vendor-side UI exists)
- ❌ Add/Edit/Delete services (vendors cannot manage their own listings)
- ❌ Service image upload
- ❌ Accept/Reject booking requests
- ❌ Vendor analytics / earnings overview
- ❌ Vendor profile page (public-facing)

**Customer Dashboard:**
- ❌ Customer dashboard (no dedicated customer home after login)
- ❌ My Events / My Plans section
- ❌ My Bookings section
- ❌ Saved/Wishlist services
- ❌ Profile edit page

**Reviews & Ratings:**
- ❌ Star rating system for services
- ❌ Written reviews
- ❌ Review display on service cards and detail pages

**Notifications:**
- ❌ In-app notification system (PDF includes a `NOTIFICATION` table)
- ❌ Notification bell in navbar with unread count

**Admin Panel:**
- ❌ Admin dashboard (entire admin flow is absent)
- ❌ Vendor verification / approval workflow
- ❌ User management
- ❌ Category management
- ❌ Platform-wide analytics

**Navigation & UX:**
- ❌ Navbar is static — no dynamic login/logout state handling
- ❌ No user avatar / profile dropdown in navbar
- ❌ No breadcrumb navigation
- ❌ No 404 page
- ❌ No empty states (empty cart, no results, etc.)

---

### 1.3 Database Gaps

The PDF defines a rich schema. The current `server/index.js` only uses 3 tables (`users`, `services`, `event_plans`). Missing entirely:

| Missing Table | Purpose |
|---|---|
| `customer_profile` | Extended customer data (address, city) |
| `vendor_profile` | Company info, logo, registration status, admin approval |
| `event_type` | Wedding, Graduation, Gender Reveal, Corporate, etc. |
| `subcategory` | Sub-categorization under main categories (Hotels under Venue) |
| `service_image` | Multiple images per service |
| `event_plan_item` | Individual service items within an event plan (the "cart") |
| `notification` | In-app notifications per user |
| `payment_method` | Supported payment methods |
| `payment` | Payment transaction records |
| `reviews` | Star ratings and written reviews per service |

---

### 1.4 Backend API Gaps

| Missing Endpoint Group | Count of Missing Routes |
|---|---|
| Vendor service CRUD | ~6 routes |
| Booking management (vendor accept/reject) | ~4 routes |
| Cart / Event Plan Items | ~5 routes |
| Reviews & Ratings | ~4 routes |
| User Profile management | ~4 routes |
| Categories & Subcategories (full hierarchy) | ~3 routes |
| Notifications | ~3 routes |
| Admin routes | ~8 routes |
| Search & Filter (advanced query builder) | ~2 routes |
| **Total missing** | **~39 routes** |

---

### 1.5 Infrastructure & DevOps Gaps

| Area | Current State | Required |
|---|---|---|
| **Frontend Deployment** | Not configured (Vercel/Netlify absent) | Vercel deployment with preview environments |
| **Environment Variables** | Hardcoded URLs | `VITE_API_BASE_URL` in `.env.production` |
| **DB Migrations** | No migration system | `node-pg-migrate` or `Flyway` for schema versioning |
| **File/Image Storage** | `image_url` is just a text string | Cloudinary or AWS S3 integration for real image uploads |
| **CI/CD** | GitHub Actions pipeline exists ✅ | Add Vercel deploy step + DB migration step |
| **Logging** | `console.error` only | Winston/Pino structured logging |
| **Rate Limiting** | None | `express-rate-limit` middleware |

---

<a name="phase-1"></a>
## SECTION 2 — PHASE 1: MASSIVE FRONTEND EXPANSION

> **Approach:** UI-First. Build every page and component to be fully functional with realistic mock/hardcoded data first. Then wire up to the API in Phase 2. This ensures visual quality is never held back by backend readiness.

> **Technology Decisions:**
> - **Styling:** Migrate from inline styles → **Tailwind CSS** (install + configure)
> - **State:** **Zustand** for global client state (user session, cart) + **React Query (TanStack Query)** for server state
> - **Forms:** **React Hook Form** + **Zod** for validation
> - **Notifications:** **React Hot Toast** for toast alerts
> - **Icons:** **Lucide React** (already available)
> - **Date Picker:** **React Day Picker** for event date selection

---

### PHASE 1 — STEP 0: Project Foundation & Design System

These steps must be done first. Everything else builds on them.

---

#### Step 0.1 — Install Core Dependencies
```bash
cd client
npm install tailwindcss @tailwindcss/vite zustand @tanstack/react-query axios react-hook-form zod @hookform/resolvers react-hot-toast lucide-react react-day-picker date-fns
```

#### Step 0.2 — Configure Tailwind CSS
- Create `client/tailwind.config.js` with the Eventat brand color palette:
  ```js
  // Key custom colors to define:
  gold: { DEFAULT: '#C9A24D', light: '#E8C97A', dark: '#A07830' }
  hero-blue: '#CEDBE2'
  dark: { DEFAULT: '#2C2C2C', soft: '#333333' }
  surface: '#F9F9F9'
  ```
- Update `vite.config.js` to add `@tailwindcss/vite` plugin
- Replace `client/src/index.css` with Tailwind directives (`@tailwind base/components/utilities`)
- Define CSS custom properties for theming in `:root`

#### Step 0.3 — Create the Global API Service Layer
- Create `client/src/services/api.js`:
  - Axios instance with `baseURL` from `import.meta.env.VITE_API_BASE_URL`
  - Request interceptor: attach `Authorization: Bearer <token>` from localStorage
  - Response interceptor: handle 401 (redirect to login), 500 (show toast)
- Create service modules:
  - `client/src/services/auth.service.js` — register, login, logout
  - `client/src/services/services.service.js` — fetch services with filters
  - `client/src/services/bookings.service.js` — create, fetch, cancel bookings
  - `client/src/services/vendor.service.js` — vendor-specific calls
  - `client/src/services/reviews.service.js` — post and fetch reviews

#### Step 0.4 — Configure Global State (Zustand)
- Create `client/src/store/authStore.js`:
  - State: `user`, `token`, `isAuthenticated`
  - Actions: `login(user, token)`, `logout()`, `updateUser(data)`
  - Persistence: sync to `localStorage`
- Create `client/src/store/cartStore.js`:
  - State: `items[]` (array of services with eventDate, quantity)
  - Actions: `addItem()`, `removeItem()`, `clearCart()`, `getTotalCost()`

#### Step 0.5 — Setup React Query Provider
- Wrap `App.jsx` with `QueryClientProvider`
- Configure: `staleTime: 5 * 60 * 1000`, `retry: 1`
- Add `ReactQueryDevtools` for development

#### Step 0.6 — Create the Reusable Component Library (Design System)
Create `client/src/components/ui/` directory with atomic components:

- **`Button.jsx`** — variants: `primary` (gold), `secondary` (dark), `outline`, `ghost`, `danger`; sizes: `sm`, `md`, `lg`; supports `loading` prop with spinner
- **`Input.jsx`** — styled input with label, error message display, icon slot
- **`Select.jsx`** — styled select dropdown
- **`Badge.jsx`** — colored pill for categories, statuses
- **`Card.jsx`** — base card wrapper with shadow and rounded corners
- **`Modal.jsx`** — accessible modal with backdrop click to close, portal rendering
- **`Spinner.jsx`** — loading spinner in gold/dark variants
- **`StarRating.jsx`** — interactive star rating (1-5) + read-only display mode
- **`SkeletonCard.jsx`** — shimmer placeholder matching ServiceCard dimensions
- **`Avatar.jsx`** — circular user avatar with fallback initials
- **`EmptyState.jsx`** — illustration + message for empty lists
- **`Toast.jsx`** — configure React Hot Toast with brand styles
- **`RangeSlider.jsx`** — dual-handle price range slider

#### Step 0.7 — Create the Shared Layout Components
- **`client/src/components/layout/Navbar.jsx`** — full responsive navbar:
  - Left: EVENTAT logo (links to `/`)
  - Center: Nav links (Home, Services, About, Suppliers)
  - Right: dynamic based on auth state:
    - Guest: `Login` + `Sign Up` buttons
    - Customer: notification bell (🔔 with badge), cart icon (🛒 with count), user avatar dropdown (Profile, My Events, Logout)
    - Vendor: notification bell, `Dashboard` link, avatar dropdown
  - Mobile: hamburger menu → slide-out drawer
- **`client/src/components/layout/Footer.jsx`** — branded footer with links, social icons, copyright
- **`client/src/components/layout/PageLayout.jsx`** — wraps Navbar + children + Footer
- **`client/src/components/layout/DashboardLayout.jsx`** — sidebar layout for customer/vendor dashboards

#### Step 0.8 — Setup React Router with Protected Routes
Refactor `App.jsx` to the full route structure:
```
/ → Landing
/login → Login
/signup → Signup (with role state)

/home → Home (public)
/services → Services listing (public)
/services/:serviceId → Service Detail (public)
/vendors/:vendorId → Vendor Public Profile (public)

/customer/* → Protected (customer role)
  /customer/dashboard → Customer Dashboard
  /customer/events → My Events / Plans
  /customer/bookings → My Bookings
  /customer/cart → Cart / Checkout
  /customer/profile → Edit Profile
  /customer/notifications → Notifications

/vendor/* → Protected (vendor role)
  /vendor/dashboard → Vendor Dashboard
  /vendor/services → Manage My Services
  /vendor/services/new → Add New Service
  /vendor/services/:id/edit → Edit Service
  /vendor/bookings → Booking Requests
  /vendor/profile → Vendor Public Profile Editor
  /vendor/analytics → Earnings & Analytics

/admin/* → Protected (admin role)
  /admin/dashboard → Admin Overview
  /admin/vendors → Vendor Approval Queue
  /admin/users → User Management
  /admin/categories → Category Management

* → 404 NotFound page
```

Create `client/src/components/auth/ProtectedRoute.jsx`:
- Reads from `authStore`
- Redirects to `/login` if not authenticated
- Redirects to role-appropriate page if wrong role

---

### PHASE 1 — STEP 1: Landing & Auth Pages (Redesigned)

#### Step 1.1 — Redesign Landing Page (`/`)
Transform from basic card selection to a premium, full-screen experience:
- **Hero section:** Full-viewport background video or high-quality image overlay with animated headline "Plan Your Perfect Event"
- **Role selection cards:** Keep the Client/Vendor dual-card concept but with premium micro-animations (scale on hover, gold border glow on select)
- **Value proposition strip:** 3 icons below cards — "Verified Vendors", "Transparent Pricing", "Easy Booking"
- **Social proof numbers:** "500+ Vendors · 2,000+ Events Planned · 4.8★ Average Rating" (static display for now)
- **CTA:** "Join as Client" / "Join as Vendor" gold buttons

#### Step 1.2 — Redesign Signup Page (`/signup`)
- Replace `alert()` with React Hook Form + Zod validation
- Real-time inline error messages under each field
- Password strength indicator
- Phone number formatting
- For **vendor signup**: show additional fields after role selection: Company Name, Company Description, City
- Loading state on submit button
- Success: redirect to login with a success toast, not `alert()`

#### Step 1.3 — Redesign Login Page (`/login`)
- Replace `alert()` with toast notifications
- "Remember me" checkbox
- "Forgot password?" link (leads to a placeholder page for now)
- After login: redirect based on role (`customer` → `/home`, `vendor` → `/vendor/dashboard`, `admin` → `/admin/dashboard`)
- Store JWT token in `authStore` (when Phase 3 backend is ready, the field is already there)

---

### PHASE 1 — STEP 2: Home Page (Redesigned)

#### Step 2.1 — Redesign Home Hero Section
- Fix the existing full-viewport hero
- Replace static button text "Plan Your Graduation Party" with a **smart search bar** centered in the hero:
  - Dropdown: event type (Wedding, Graduation, Gender Reveal, Corporate, General)
  - Input: "What are you looking for?" (service title / vendor name)
  - Date picker: event date
  - "Search" gold button → navigates to `/services` with query params populated

#### Step 2.2 — Build the Event Category Grid
Replace the current static image grid with a **dynamic, clickable category system**:
- Fetch categories from `/api/categories`
- Render as a visually rich grid (masonry or asymmetric layout as in original)
- Each category card: full-bleed image, category name overlay, hover animation
- Clicking a category navigates to `/services?category=venue` (etc.)
- Categories: Venue, Catering, Photography, Entertainment, Decoration, Transport, Accommodation, Fireworks

#### Step 2.3 — Build "Featured Services" Horizontal Scroll Section
- Heading: "Top Rated Services"
- Fetch top 8 services sorted by rating
- Render as horizontally scrollable row of `ServiceCard` components
- "View All" button → `/services`

#### Step 2.4 — Build "How It Works" Section
Three-step visual flow for Customers:
1. 🔍 Browse verified vendors
2. 📅 Book your date
3. 🎉 Celebrate perfectly

And a separate three-step flow for Vendors:
1. 📝 List your services
2. ✅ Get approved
3. 💰 Grow your business

#### Step 2.5 — Build "Event Type Showcase" Section
Visual cards for each event type (Wedding, Graduation, Gender Reveal, Corporate):
- Each card: atmospheric image, event name, "Plan This Event" CTA button
- Clicking navigates to `/services?event_type=wedding`

#### Step 2.6 — Build Testimonials / Reviews Strip
- 3 static customer testimonials with star ratings, name, event type
- Subtle card carousel with auto-play (or simple grid for MVP)

---

### PHASE 1 — STEP 3: Services Listing Page (Full Rebuild)

This is the most critical discovery page. It must be built to a very high standard.

#### Step 3.1 — Build the Services Page Layout
Two-column layout:
- **Left sidebar (280px):** All filters
- **Right main content:** Results grid + sort/count bar

Mobile: filters collapse into a slide-up drawer triggered by a "Filters" button.

#### Step 3.2 — Build the Filter Sidebar
Implement all filters visible in the PDF wireframes:
- **Search bar** at the top — free-text search
- **Event Type** — radio group (Wedding, Graduation, Gender Reveal, Corporate, General)
- **Category** — checkbox list with icons (Venue, Catering, Photography, Entertainment, Decoration, Transport, Fireworks, Accommodation)
- **Subcategory** — dynamically renders based on selected category (e.g., if Venue: Hotels, Halls, Farms, Indoor, Outdoor, Pool, Parking, View)
- **Price Range** — dual-handle range slider (0 JOD — 5,000 JOD)
- **Location / City** — checkbox list (Amman, Zarqa, Irbid, Aqaba, Dead Sea)
- **Rating** — star filter (4★+, 3★+, Any)
- **Availability Date** — date picker
- "Apply Filters" + "Clear All" buttons

#### Step 3.3 — Build the Services Results Area
- **Sort bar:** "Showing 24 results" + Sort By dropdown (Recommended, Price: Low-High, Price: High-Low, Highest Rated, Newest)
- **View toggle:** Grid view (3 cols) / List view toggle buttons
- **Service Card (Grid):** Image, category badge, title, vendor name, location (📍), star rating + count, base price, "Book Now" button
- **Service Card (List):** Wider card with more description text visible
- **Skeleton loader:** Show 6 skeleton cards while fetching
- **Empty state:** Illustration + "No services match your filters" + "Clear Filters" button
- **Pagination:** Load More button (or classic numbered pagination)

#### Step 3.4 — Build the URL-Driven Filter System
- All active filters serialized to URL query params: `/services?category=venue&city=amman&min_price=100&max_price=2000&rating=4`
- On page load, parse URL params and pre-populate filter sidebar
- Browser back button restores previous filter state
- Shareable filtered URLs

---

### PHASE 1 — STEP 4: Service Detail Page

#### Step 4.1 — Build the Service Detail Page Layout (`/services/:serviceId`)
- **Image Gallery:** Large primary image + thumbnail strip (4 images). Clicking thumbnails swaps main image. Optional lightbox on click.
- **Breadcrumb:** Home > Services > Venue > Salon A

#### Step 4.2 — Build the Service Info Panel
- Service title (H1)
- Vendor name as a clickable link → vendor public profile
- Star rating display (e.g., ⭐ 4.6 · 28 reviews) — clickable scrolls to reviews section
- Location (📍 Amman, Jordan)
- Category + Subcategory badges
- Capacity (if applicable)
- Description paragraphs

#### Step 4.3 — Build the Booking Sidebar (Sticky)
Sticky right-side panel while scrolling:
- Price display: "From **250 JOD**"
- Event date picker
- Guest count input (number)
- Special requests textarea
- "Add to Cart" gold button
- "Book Now" dark button (direct booking without cart)
- Vendor contact info (phone number displayed)

#### Step 4.4 — Build the Reviews Section
At the bottom of the detail page:
- Overall rating summary (large number + star breakdown bar chart: 5★ ████ 60%, 4★ ███ 30%, etc.)
- Individual review cards: avatar, reviewer name, date, star rating, review text
- "Write a Review" form (only visible if logged-in customer with a past booking for this service):
  - Interactive star selector
  - Review text area
  - Submit button

#### Step 4.5 — Build the "Shop Similar" / "You Might Also Like" Section
- Horizontal scroll row of 4-6 related service cards (same category)
- "View All in This Category" link

---

### PHASE 1 — STEP 5: Customer Dashboard

All pages under `/customer/*`. Wrapped in `DashboardLayout` with sidebar navigation.

#### Step 5.1 — Build Customer Dashboard Layout
`DashboardLayout` sidebar items for customer:
- 🏠 Overview
- 📅 My Events
- 🛒 My Bookings
- ❤️ Saved Services
- 🔔 Notifications
- 👤 My Profile

#### Step 5.2 — Build Customer Overview Page (`/customer/dashboard`)
- **Welcome banner:** "Welcome back, {name}!" with their profile photo
- **Stats row:** 3 cards — Active Events, Total Bookings, Upcoming Events
- **Upcoming bookings:** List of next 3 upcoming bookings with service name, date, status badge, vendor contact
- **Recent activity feed:** Last 5 actions (booked X, reviewed Y, etc.)
- **Quick action buttons:** "Plan New Event", "Browse Services"

#### Step 5.3 — Build My Events Page (`/customer/events`)
The **Event Plan Builder** — the core product feature from the PDF:
- List of the customer's event plans (cards showing: event type, date, location, status, estimated total cost, number of services added)
- "Create New Event Plan" modal:
  - Event Type dropdown (Wedding, Graduation, Gender Reveal, Corporate, General)
  - Event Name / Title
  - Event Date
  - Estimated Guest Count
  - Event Location (text)
  - Special Requests / Notes
- Clicking an event plan card opens the **Event Plan Detail Page:**
  - Event summary header
  - List of services added (Event Plan Items) with their individual status
  - "Add More Services" button → navigates to `/services` with event context
  - Total estimated cost breakdown
  - Submit Event Plan button

#### Step 5.4 — Build My Bookings Page (`/customer/bookings`)
- **Tab bar:** All · Pending · Confirmed · Completed · Cancelled
- Booking card: service image, service title, vendor name, event date, booking date, status badge, estimated cost
- Status badge colors: Pending (yellow), Confirmed (green), Completed (blue), Cancelled (red)
- Per booking actions:
  - "Cancel" button (for Pending only)
  - "Write a Review" button (for Completed only)
  - "View Details" expander

#### Step 5.5 — Build Cart Page (`/customer/cart`)
The multi-service cart as described in the PDF:
- **Cart items list:** Service image, title, vendor, event date, quantity, unit price, line total, remove button
- **Order summary sidebar:**
  - Subtotal
  - "Proceed to Checkout" button
  - "Continue Shopping" link
- **Empty cart state:** Illustration + "Your cart is empty" + "Browse Services" button

#### Step 5.6 — Build Customer Profile Page (`/customer/profile`)
- Profile photo upload (with preview)
- Edit form: Full Name, Username, Email, Phone
- Change Email section
- Change Password section (current + new + confirm)
- Address / City fields
- Save Changes button with loading state
- Danger zone: "Delete Account" button with confirmation modal

#### Step 5.7 — Build Notifications Page (`/customer/notifications`)
- List of all notifications, newest first
- Each notification: icon (booking update, review reminder, etc.), message text, relative timestamp, unread indicator dot
- "Mark all as read" button
- Click on a notification navigates to the relevant page

---

### PHASE 1 — STEP 6: Vendor Dashboard

All pages under `/vendor/*`. Wrapped in the same `DashboardLayout` with vendor-specific sidebar items.

#### Step 6.1 — Build Vendor Dashboard Sidebar
Sidebar items for vendor:
- 📊 Overview
- 🛍️ My Services
- 📋 Booking Requests
- 📈 Analytics
- 🏢 My Profile / Store
- 🔔 Notifications

#### Step 6.2 — Build Vendor Overview Page (`/vendor/dashboard`)
- **KPI Cards row:** Total Services Listed, Pending Requests, This Month's Confirmed Bookings, Total Revenue (placeholder)
- **Pending Booking Requests:** Top 5 most urgent pending requests with Accept/Reject actions
- **Recent Activity:** Last 5 notifications/events
- **Quick actions:** "Add New Service", "View All Requests"

#### Step 6.3 — Build Manage Services Page (`/vendor/services`)
- Services listed in a data table (not cards): image thumbnail, title, category, price, status (active/inactive), bookings count, actions
- Toggle service active/inactive with a switch
- Edit and Delete buttons per row
- "Add New Service" primary button → navigates to `/vendor/services/new`
- Empty state for new vendors

#### Step 6.4 — Build Add / Edit Service Form (`/vendor/services/new` and `/vendor/services/:id/edit`)
Multi-step form wizard (3 steps with a progress indicator):

**Step 1 — Basic Info:**
- Service Title
- Category dropdown (fetched from API)
- Subcategory dropdown (dynamically filtered based on category)
- Description (rich text area — minimum 100 characters)
- Pricing Unit (Per Event, Per Hour, Per Person, Per Day)
- Base Price (JOD)
- Service Location / City

**Step 2 — Details & Capacity:**
- Capacity (number of guests if applicable)
- Tags / Keywords (multi-select chips)
- Is Active toggle

**Step 3 — Images:**
- Image upload area (drag-and-drop or click to select)
- Support up to 8 images
- Image preview grid with remove buttons
- Mark one image as "Primary" (will be shown as main card image)

**Submit:** Shows a review summary before final submission.

#### Step 6.5 — Build Booking Requests Page (`/vendor/bookings`)
- **Tab bar:** Incoming · Confirmed · Completed · Cancelled
- Booking request card: Customer name, avatar, event type, event date, service requested, guest count, special requests text, estimated cost
- **Accept** (green) and **Reject** (red) buttons on Incoming tab
- Status history timeline per booking

#### Step 6.6 — Build Vendor Analytics Page (`/vendor/analytics`)
- Monthly bookings bar chart (using Recharts)
- Revenue over time line chart (using Recharts)
- Top performing services list
- Booking acceptance rate stat
- Average rating across all services
- All charts use placeholder/mock data until Phase 2 wires real data

#### Step 6.7 — Build Vendor Public Profile Page (`/vendors/:vendorId`)
The publicly visible vendor profile (viewed by customers):
- Cover banner image + vendor logo/avatar
- Company name, city, "Verified Vendor" badge (if approved)
- About / description section
- Services grid (all active services by this vendor)
- Average rating + review count
- Contact info

---

### PHASE 1 — STEP 7: Admin Panel

All pages under `/admin/*`. Uses a distinct, darker admin layout (no hero images, data-dense).

#### Step 7.1 — Build Admin Dashboard (`/admin/dashboard`)
- Platform-wide stats: Total Users, Total Vendors, Total Bookings, Total Revenue
- Recent registrations (last 10 users/vendors)
- Pending vendor approvals alert count with quick link

#### Step 7.2 — Build Vendor Approval Queue (`/admin/vendors`)
- Table: Vendor Name, Company, Registration Date, Status badge, Actions
- "Approve" and "Reject" buttons
- Filter by status: Pending / Approved / Rejected
- Clicking a vendor row shows a side panel with their full profile details

#### Step 7.3 — Build User Management (`/admin/users`)
- Data table of all users with role, join date, status (active/banned)
- Search by name or email
- Ban/Unban user action

#### Step 7.4 — Build Category Management (`/admin/categories`)
- List of all categories with subcategories expandable
- Add Category button → simple form modal
- Add Subcategory button per category
- Edit and delete (soft delete only)

---

### PHASE 1 — STEP 8: Additional Pages & UX Polish

#### Step 8.1 — Build the 404 Not Found Page
- Branded illustration or animation
- "Oops, this page doesn't exist"
- "Go Back Home" button

#### Step 8.2 — Build Global Empty States
Create reusable `EmptyState` component variants:
- Empty cart
- No bookings yet
- No services listed
- No results match filters
- No notifications

#### Step 8.3 — Implement Toast Notification System
Replace all `alert()` calls with React Hot Toast:
- Success (green): "Booking confirmed! ✅"
- Error (red): "Something went wrong. Please try again."
- Info (blue): "Please login to book a service."
- Warning (amber): "Your session has expired."
Configure custom toast style matching the Eventat gold brand.

#### Step 8.4 — Add Page Transition Animations
Using CSS transitions or Framer Motion (lightweight):
- Fade-in on route change
- Slide-up on modal open
- Stagger animation on service card list load

#### Step 8.5 — Implement Full Responsive Design Pass
Go through every single page/component and add Tailwind responsive breakpoints:
- Mobile (< 768px): single column, stacked nav, drawer menus
- Tablet (768px–1024px): 2-column grids, condensed sidebars
- Desktop (> 1024px): full layouts as designed

#### Step 8.6 — Implement Accessibility (a11y) Basics
- All interactive elements have `aria-label` attributes
- Focus rings visible on keyboard navigation
- Color contrast ratios meet WCAG AA standard
- Form inputs have associated `<label>` elements
- Modal has focus trap and Escape key close

---

<a name="phase-2"></a>
## SECTION 3 — PHASE 2: BACKEND & DATABASE ARCHITECTURE

> Build after Phase 1 UI is complete. Wire the already-built UI components to real API endpoints.

---

### PHASE 2 — STEP 0: Database Migration & Schema Rebuild

#### Step 2.0.1 — Install Migration Tool
```bash
cd server
npm install node-pg-migrate
```
Configure `package.json` with `"migrate": "node-pg-migrate"` script.

#### Step 2.0.2 — Write Migration: Drop and Rebuild Full Schema
Create `server/migrations/001_initial_schema.sql`:

```sql
-- USERS (extended from MVP)
CREATE TABLE users (
    user_id       SERIAL PRIMARY KEY,
    role          VARCHAR(20) NOT NULL CHECK (role IN ('customer', 'vendor', 'admin')),
    username      VARCHAR(50) UNIQUE NOT NULL,
    email         VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,  -- bcrypt hash (Phase 3)
    full_name     VARCHAR(120),
    phone         VARCHAR(20),
    preferred_language VARCHAR(5) DEFAULT 'en',
    is_active     BOOLEAN DEFAULT TRUE,
    created_at    TIMESTAMP DEFAULT NOW(),
    updated_at    TIMESTAMP DEFAULT NOW()
);

-- CUSTOMER PROFILES
CREATE TABLE customer_profiles (
    customer_id   INTEGER PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
    address       VARCHAR(255),
    city          VARCHAR(100),
    avatar_url    VARCHAR(500)
);

-- VENDOR PROFILES
CREATE TABLE vendor_profiles (
    vendor_id             INTEGER PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
    company_name          VARCHAR(150),
    company_description   TEXT,
    address               VARCHAR(255),
    city                  VARCHAR(100),
    logo_url              VARCHAR(500),
    registration_status   VARCHAR(20) DEFAULT 'pending' CHECK (registration_status IN ('pending', 'approved', 'rejected')),
    approved_by_admin_id  INTEGER REFERENCES users(user_id),
    approved_at           TIMESTAMP,
    created_at            TIMESTAMP DEFAULT NOW()
);

-- EVENT TYPES
CREATE TABLE event_types (
    event_type_id SERIAL PRIMARY KEY,
    name          VARCHAR(80) NOT NULL,   -- 'Wedding', 'Graduation', 'Gender Reveal', 'Corporate', 'General'
    description   TEXT,
    is_active     BOOLEAN DEFAULT TRUE
);

-- CATEGORIES
CREATE TABLE categories (
    category_id   SERIAL PRIMARY KEY,
    name          VARCHAR(80) NOT NULL,   -- 'Venue', 'Catering', 'Photography', etc.
    description   TEXT,
    icon_name     VARCHAR(50),            -- Lucide icon name
    image_url     VARCHAR(500),
    sort_order    INTEGER DEFAULT 0
);

-- SUBCATEGORIES
CREATE TABLE subcategories (
    subcategory_id SERIAL PRIMARY KEY,
    category_id    INTEGER NOT NULL REFERENCES categories(category_id) ON DELETE CASCADE,
    name           VARCHAR(80) NOT NULL,   -- 'Hotels', 'Halls', 'Farms', 'DJs', 'Bands', etc.
    description    TEXT,
    sort_order     INTEGER DEFAULT 0
);

-- SERVICES
CREATE TABLE services (
    service_id        SERIAL PRIMARY KEY,
    vendor_id         INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    category_id       INTEGER NOT NULL REFERENCES categories(category_id),
    subcategory_id    INTEGER REFERENCES subcategories(subcategory_id),
    title             VARCHAR(150) NOT NULL,
    description       TEXT,
    base_price        DECIMAL(10,2) NOT NULL,
    pricing_unit      VARCHAR(30) DEFAULT 'per_event',  -- 'per_event', 'per_hour', 'per_person', 'per_day'
    service_location  VARCHAR(255),
    city              VARCHAR(100),
    capacity          INTEGER,
    is_active         BOOLEAN DEFAULT TRUE,
    avg_rating        DECIMAL(3,2) DEFAULT 0,
    review_count      INTEGER DEFAULT 0,
    created_at        TIMESTAMP DEFAULT NOW(),
    updated_at        TIMESTAMP DEFAULT NOW()
);

-- SERVICE IMAGES
CREATE TABLE service_images (
    image_id    SERIAL PRIMARY KEY,
    service_id  INTEGER NOT NULL REFERENCES services(service_id) ON DELETE CASCADE,
    image_url   VARCHAR(500) NOT NULL,
    is_primary  BOOLEAN DEFAULT FALSE,
    sort_order  INTEGER DEFAULT 0,
    created_at  TIMESTAMP DEFAULT NOW()
);

-- EVENT PLANS ("My Events" created by customers)
CREATE TABLE event_plans (
    event_id             SERIAL PRIMARY KEY,
    customer_id          INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    event_type_id        INTEGER REFERENCES event_types(event_type_id),
    name                 VARCHAR(150),
    event_date           DATE NOT NULL,
    event_location       VARCHAR(255),
    guest_count          INTEGER,
    special_requests     TEXT,
    status               VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'confirmed', 'completed', 'cancelled')),
    estimated_total_cost DECIMAL(10,2) DEFAULT 0,
    created_at           TIMESTAMP DEFAULT NOW(),
    updated_at           TIMESTAMP DEFAULT NOW()
);

-- EVENT PLAN ITEMS (services inside an event plan = the "cart" items)
CREATE TABLE event_plan_items (
    event_item_id      SERIAL PRIMARY KEY,
    event_id           INTEGER NOT NULL REFERENCES event_plans(event_id) ON DELETE CASCADE,
    service_id         INTEGER NOT NULL REFERENCES services(service_id),
    quantity           INTEGER DEFAULT 1,
    unit_price_at_time DECIMAL(10,2) NOT NULL,  -- price snapshot at booking time
    line_total         DECIMAL(10,2) NOT NULL,
    vendor_item_status VARCHAR(20) DEFAULT 'pending' CHECK (vendor_item_status IN ('pending', 'accepted', 'rejected', 'completed')),
    vendor_note        TEXT,
    created_at         TIMESTAMP DEFAULT NOW()
);

-- REVIEWS
CREATE TABLE reviews (
    review_id    SERIAL PRIMARY KEY,
    service_id   INTEGER NOT NULL REFERENCES services(service_id) ON DELETE CASCADE,
    customer_id  INTEGER NOT NULL REFERENCES users(user_id),
    event_item_id INTEGER REFERENCES event_plan_items(event_item_id),
    rating       INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    review_text  TEXT,
    created_at   TIMESTAMP DEFAULT NOW(),
    UNIQUE(service_id, customer_id)  -- one review per customer per service
);

-- NOTIFICATIONS
CREATE TABLE notifications (
    notification_id   SERIAL PRIMARY KEY,
    user_id           INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    event_id          INTEGER REFERENCES event_plans(event_id),
    title             VARCHAR(150),
    message_body      TEXT,
    notification_type VARCHAR(30),  -- 'booking_update', 'review_reminder', 'approval', 'general'
    is_read           BOOLEAN DEFAULT FALSE,
    created_at        TIMESTAMP DEFAULT NOW()
);

-- PAYMENT METHODS (lookup table)
CREATE TABLE payment_methods (
    method_id  SERIAL PRIMARY KEY,
    name       VARCHAR(50) NOT NULL,   -- 'Credit Card', 'Cash on Delivery', 'CliQ'
    provider   VARCHAR(50),
    is_active  BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- PAYMENTS
CREATE TABLE payments (
    payment_id      SERIAL PRIMARY KEY,
    event_id        INTEGER NOT NULL REFERENCES event_plans(event_id),
    method_id       INTEGER REFERENCES payment_methods(method_id),
    amount          DECIMAL(10,2) NOT NULL,
    currency        CHAR(3) DEFAULT 'JOD',
    status          VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    transaction_ref VARCHAR(100),
    paid_at         TIMESTAMP,
    created_at      TIMESTAMP DEFAULT NOW()
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX idx_services_category ON services(category_id);
CREATE INDEX idx_services_vendor ON services(vendor_id);
CREATE INDEX idx_services_city ON services(city);
CREATE INDEX idx_services_active ON services(is_active);
CREATE INDEX idx_event_plans_customer ON event_plans(customer_id);
CREATE INDEX idx_event_plan_items_event ON event_plan_items(event_id);
CREATE INDEX idx_reviews_service ON reviews(service_id);
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);
```

#### Step 2.0.3 — Seed Initial Data
Create `server/seeds/seed.js`:
- Insert 5 categories (Venue, Catering, Photography, Entertainment, Decoration)
- Insert subcategories for each
- Insert 5 event types (Wedding, Graduation, Gender Reveal, Corporate, General)
- Insert 3 payment methods (Cash on Delivery, Credit Card, CliQ)
- Insert 2 test vendor users + vendor_profiles
- Insert 10 test services across categories with realistic Jordanian data
- Insert 3 test customer users
- `npm run seed` script in `package.json`

---

### PHASE 2 — STEP 1: Middleware & Server Hardening

#### Step 2.1.1 — Install Production Middleware
```bash
npm install bcryptjs jsonwebtoken express-rate-limit helmet morgan winston
```
(Note: JWT + bcrypt implementation is Phase 3. Install now, configure stubs.)

#### Step 2.1.2 — Add Security Middleware to `index.js`
```javascript
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

app.use(helmet());  // Secure HTTP headers
app.use(morgan('combined'));  // Request logging

// Rate limiting: 100 requests per 15 minutes per IP
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use('/api/', limiter);
```

#### Step 2.1.3 — Add Input Validation Middleware
Install `express-validator`:
```bash
npm install express-validator
```
Create `server/middleware/validate.js` — a middleware factory that runs validation chains and returns 422 with field-level errors.

#### Step 2.1.4 — Add Centralized Error Handler
Create `server/middleware/errorHandler.js`:
- Catches all errors propagated via `next(err)`
- Returns consistent `{ error: string, details: [...] }` JSON
- Logs error with stack trace in development, suppresses stack in production

#### Step 2.1.5 — Restructure Server into MVC Pattern
Refactor from single `index.js` to:
```
server/
├── index.js          (app bootstrap only — requires routes, starts server)
├── db.js             (Pool instance, exported)
├── routes/
│   ├── auth.routes.js
│   ├── services.routes.js
│   ├── bookings.routes.js
│   ├── vendors.routes.js
│   ├── users.routes.js
│   ├── categories.routes.js
│   ├── reviews.routes.js
│   ├── notifications.routes.js
│   └── admin.routes.js
├── controllers/
│   ├── auth.controller.js
│   ├── services.controller.js
│   ├── bookings.controller.js
│   ├── vendors.controller.js
│   ├── users.controller.js
│   ├── categories.controller.js
│   ├── reviews.controller.js
│   ├── notifications.controller.js
│   └── admin.controller.js
├── middleware/
│   ├── auth.middleware.js     (JWT verification stub for Phase 3)
│   ├── role.middleware.js     (RBAC check stub for Phase 3)
│   ├── validate.middleware.js
│   └── errorHandler.js
└── seeds/
    └── seed.js
```

---

### PHASE 2 — STEP 2: Auth Routes (Production-Ready Structure)

> Note: Full JWT + bcrypt implementation is Phase 3. In Phase 2, build the route structure and wire to DB. Phase 3 upgrades the implementation without changing the API contract.

#### Step 2.2.1 — `POST /api/auth/register`
- Validate: all required fields, valid email format, password min 8 chars, role in allowed values
- Check: email uniqueness, username uniqueness
- **Phase 2 (temporary):** store raw password. Phase 3 replaces with bcrypt hash.
- Create `users` row + `customer_profiles` or `vendor_profiles` row based on role
- Return user object (without password_hash)

#### Step 2.2.2 — `POST /api/auth/login`
- Validate: email + password present
- Find user by email
- **Phase 2 (temporary):** direct password comparison. Phase 3 replaces with bcrypt.compare()
- Return user object + `token: null` (Phase 3 fills in JWT)

#### Step 2.2.3 — `POST /api/auth/logout`
- Stateless for now (client deletes token). Phase 3 adds token blacklist/refresh token.

---

### PHASE 2 — STEP 3: Categories & Subcategories API

#### Step 2.3.1 — `GET /api/categories`
- Return all active categories with sort_order
- Include subcategory count per category

#### Step 2.3.2 — `GET /api/categories/:id/subcategories`
- Return all subcategories for a given category_id

#### Step 2.3.3 — `GET /api/event-types`
- Return all active event types

---

### PHASE 2 — STEP 4: Services API (Advanced)

#### Step 2.4.1 — `GET /api/services` (Advanced Query with Filters)
This is the most complex query. Build a dynamic SQL query builder:

Supported query params:
- `search` — full-text search against `services.title` and `services.description` (use `ILIKE %term%`)
- `category_id` — filter by category
- `subcategory_id` — filter by subcategory
- `city` — filter by city (case-insensitive)
- `min_price`, `max_price` — price range filter
- `min_rating` — minimum avg_rating filter
- `event_date` — filter out services with conflicting bookings on that date (advanced)
- `sort` — `price_asc`, `price_desc`, `rating_desc`, `newest`
- `page`, `limit` — pagination (default: page=1, limit=12)

Return: `{ services: [...], total: N, page: N, totalPages: N }`

#### Step 2.4.2 — `GET /api/services/:id`
Return full service object with:
- All images (from `service_images`)
- Vendor info (company_name, logo_url, avg_rating from vendor's services)
- Category + subcategory names
- Average rating + review count
- Last 5 reviews (joined from `reviews` + `users`)
- "Similar services" (same category, different vendor, limit 4)

#### Step 2.4.3 — `POST /api/services` (Vendor only — Phase 3 adds auth guard)
- Validate all required fields
- Create `services` row
- Create `service_images` rows for uploaded URLs
- Return created service

#### Step 2.4.4 — `PUT /api/services/:id` (Vendor only — owner check)
- Update service fields
- Handle image additions/deletions (array diff)
- Update `updated_at`

#### Step 2.4.5 — `DELETE /api/services/:id` (Vendor only — soft delete)
- Set `is_active = false` (never hard delete — preserves historical booking records)

#### Step 2.4.6 — `GET /api/vendor/:vendorId/services`
- Return all active services for a given vendor
- Used by vendor public profile page

---

### PHASE 2 — STEP 5: Event Plans & Bookings API

#### Step 2.5.1 — `POST /api/event-plans`
- Create a new event plan for the logged-in customer
- Required: `event_type_id`, `event_date`, `name`
- Return created event plan

#### Step 2.5.2 — `GET /api/event-plans` (Customer's own plans)
- Return all event plans for the customer (from `customer_id`)
- Include item count per plan
- Support `status` filter

#### Step 2.5.3 — `GET /api/event-plans/:id`
- Return full plan with all `event_plan_items` joined with service info and vendor info

#### Step 2.5.4 — `PUT /api/event-plans/:id`
- Update plan fields (name, date, guest_count, special_requests)
- Update status (e.g., submit plan: `draft` → `submitted`)
- Recalculate `estimated_total_cost` from sum of `event_plan_items.line_total`

#### Step 2.5.5 — `DELETE /api/event-plans/:id`
- Soft cancel: set status to `cancelled`

#### Step 2.5.6 — `POST /api/event-plans/:id/items`
Adding a service to an event plan (the "Add to Cart" action):
- Body: `{ service_id, quantity }`
- Look up current `base_price` for `unit_price_at_time` snapshot
- Calculate `line_total = unit_price_at_time * quantity`
- Insert into `event_plan_items`
- Update `estimated_total_cost` on the parent `event_plans` row
- Trigger a notification to the vendor (INSERT into `notifications`)

#### Step 2.5.7 — `DELETE /api/event-plans/:planId/items/:itemId`
- Remove item, recalculate plan total

#### Step 2.5.8 — `PUT /api/event-plan-items/:itemId/status` (Vendor action)
- Vendor accepts or rejects a booking item
- Body: `{ status: 'accepted' | 'rejected', vendor_note: '...' }`
- Trigger notification to customer

---

### PHASE 2 — STEP 6: Reviews API

#### Step 2.6.1 — `POST /api/services/:serviceId/reviews`
- Validate: customer must have a completed booking for this service (check `event_plan_items` for completed status)
- Validate: rating 1–5, review_text optional
- Check: no duplicate review (UNIQUE constraint on service_id + customer_id)
- Insert review
- Recalculate `services.avg_rating` and `services.review_count` (UPDATE with AVG query)

#### Step 2.6.2 — `GET /api/services/:serviceId/reviews`
- Return paginated reviews for a service
- Include reviewer's name and avatar
- Include overall rating breakdown (count per star level)

#### Step 2.6.3 — `DELETE /api/reviews/:reviewId`
- Customer can delete their own review
- Admin can delete any review
- Recalculate service avg_rating after deletion

---

### PHASE 2 — STEP 7: User Profile API

#### Step 2.7.1 — `GET /api/users/me`
- Return current user's full profile (joins with customer_profile or vendor_profile)

#### Step 2.7.2 — `PUT /api/users/me`
- Update: full_name, phone, address, city, avatar_url
- Cannot change: email, username, role via this endpoint

#### Step 2.7.3 — `PUT /api/users/me/password`
- Body: `{ current_password, new_password }`
- Phase 2 (temporary): plain text comparison + update
- Phase 3: bcrypt.compare() + bcrypt.hash()

#### Step 2.7.4 — `DELETE /api/users/me`
- Soft delete: set `is_active = false` on the `users` row
- Does NOT hard-delete (preserves booking history data integrity)

---

### PHASE 2 — STEP 8: Vendor Profile API

#### Step 2.8.1 — `GET /api/vendors/:vendorId/profile`
Public vendor profile. Returns:
- User info (name, username)
- Vendor profile (company_name, description, logo, city, registration_status)
- All active services
- Average rating across all their services

#### Step 2.8.2 — `PUT /api/vendors/me/profile`
- Vendor updates their own company profile (company_name, description, logo_url, address, city)

---

### PHASE 2 — STEP 9: Notifications API

#### Step 2.9.1 — `GET /api/notifications`
- Return all notifications for the current user
- Support `unread_only=true` query param
- Return `unread_count` in response header or body

#### Step 2.9.2 — `PUT /api/notifications/:id/read`
- Mark a single notification as read

#### Step 2.9.3 — `PUT /api/notifications/read-all`
- Mark all of user's notifications as read

---

### PHASE 2 — STEP 10: Admin API

#### Step 2.10.1 — `GET /api/admin/stats`
Platform-wide aggregate stats: total users, total vendors, total bookings, pending approvals count.

#### Step 2.10.2 — `GET /api/admin/vendors/pending`
Return all vendors with `registration_status = 'pending'`.

#### Step 2.10.3 — `PUT /api/admin/vendors/:vendorId/approve`
- Set `registration_status = 'approved'`, set `approved_by_admin_id`, set `approved_at`
- Trigger notification to vendor

#### Step 2.10.4 — `PUT /api/admin/vendors/:vendorId/reject`
- Set `registration_status = 'rejected'`
- Trigger notification to vendor

#### Step 2.10.5 — `GET /api/admin/users`
- Paginated list of all users, supports search and role filter

#### Step 2.10.6 — `PUT /api/admin/users/:userId/ban`
- Toggle `is_active` on user

#### Step 2.10.7 — `POST /api/admin/categories`
- Create new category

#### Step 2.10.8 — `PUT /api/admin/categories/:id`
- Edit category name/description/icon

---

### PHASE 2 — STEP 11: Frontend API Wiring

Go through each Phase 1 page component and replace mock/hardcoded data with React Query hooks:

#### Step 2.11.1 — Wire Services Listing Page
- Replace `axios.get` with `useQuery(['services', filters], () => servicesService.getAll(filters))`
- Make filters reactive: changing any filter triggers a new query
- URL params update on filter change (debounced)

#### Step 2.11.2 — Wire Service Detail Page
- `useQuery(['service', serviceId], () => servicesService.getById(serviceId))`
- `useQuery(['reviews', serviceId], () => reviewsService.getForService(serviceId))`
- `useMutation` for submitting a review

#### Step 2.11.3 — Wire Customer Dashboard Pages
- `useQuery` for bookings, event plans, notifications
- `useMutation` for cancel booking, create event plan, add/remove cart items
- Invalidate relevant queries on mutation success

#### Step 2.11.4 — Wire Vendor Dashboard Pages
- `useQuery` for vendor's services, booking requests
- `useMutation` for accept/reject booking, add/edit/delete service

#### Step 2.11.5 — Wire Auth (Login/Register)
- `useMutation` for login — on success, call `authStore.login(user, token)`
- `useMutation` for register — on success, redirect to login
- Replace all remaining `localStorage` direct access with `authStore`

#### Step 2.11.6 — Wire Notifications
- `useQuery(['notifications'], notificationsService.getAll, { refetchInterval: 30000 })` — polling every 30s
- Update Navbar unread count badge dynamically

---

### PHASE 2 — STEP 12: Infrastructure Finalization

#### Step 2.12.1 — Environment Variable Cleanup
- Create `client/.env.development` with `VITE_API_BASE_URL=http://localhost:5000`
- Create `client/.env.production` with `VITE_API_BASE_URL=https://eventat-backend.onrender.com`
- Remove all hardcoded URLs from every component file

#### Step 2.12.2 — Setup Cloudinary for Image Uploads
- Create Cloudinary account (free tier for development)
- Install `multer` + `cloudinary` SDK on server
- Create `POST /api/upload` endpoint that accepts multipart form data, uploads to Cloudinary, returns URL
- Frontend file upload component calls this endpoint and stores returned URL

#### Step 2.12.3 — Update GitHub Actions CI/CD
- Add `VITE_API_BASE_URL` as a GitHub Actions secret
- Inject into Vite build step: `VITE_API_BASE_URL=${{ secrets.VITE_API_BASE_URL }} npm run build`
- Add Vercel deployment step after successful build

#### Step 2.12.4 — Database Migrations in CI/CD
- Add migration run step to GitHub Actions: `npm run migrate up`
- Ensures DB schema is always in sync with code deployments

---

<a name="phase-3"></a>
## SECTION 4 — PHASE 3: SECURITY & AI ENHANCEMENTS

> ⛔ **THIS ENTIRE PHASE IS POSTPONED.**
> 
> **Reason:** The architectural foundations (Phase 1 UI + Phase 2 API + DB) must be fully stable before layering on security and AI. Attempting JWT/security in the MVP phase has historically caused scope creep and unstable foundations. Every item below is designed to be a drop-in upgrade to Phase 2's stubs without breaking any API contracts.
> 
> **When to Start Phase 3:** After Phase 2 is complete, all pages are wired to real data, and the app has been demo-tested end-to-end.

---

### ⛔ PHASE 3 — STEP 1: Password Security (bcrypt)

- [ ] Install `bcryptjs`
- [ ] Update `POST /api/auth/register`: replace `password` storage with `bcrypt.hash(password, 12)`
- [ ] Update `POST /api/auth/login`: replace plain comparison with `bcrypt.compare(password, user.password_hash)`
- [ ] Update `PUT /api/users/me/password`: `bcrypt.compare()` + `bcrypt.hash()`
- [ ] Write a one-time migration script to hash all existing plaintext passwords in the DB

---

### ⛔ PHASE 3 — STEP 2: JWT Authentication

- [ ] Create `server/utils/jwt.js` with `signToken(userId, role)` and `verifyToken(token)` utilities
- [ ] Update `POST /api/auth/login` to return `{ user, token: signToken(user.user_id, user.role) }`
- [ ] Create `server/middleware/auth.middleware.js`:
  - Reads `Authorization: Bearer <token>` header
  - Calls `jwt.verify(token, process.env.JWT_SECRET)`
  - Attaches `req.user = { user_id, role }` to the request
  - Returns `401 Unauthorized` if token invalid or missing
- [ ] Add `refreshToken` flow: separate long-lived refresh token stored in `httpOnly` cookie, short-lived access token in memory
- [ ] Add `POST /api/auth/refresh` endpoint
- [ ] Add `POST /api/auth/logout` that invalidates the refresh token

---

### ⛔ PHASE 3 — STEP 3: Role-Based Access Control (RBAC)

- [ ] Create `server/middleware/role.middleware.js`:
  ```javascript
  const requireRole = (...roles) => (req, res, next) => {
    if (!roles.includes(req.user.role)) return res.status(403).json({ error: 'Forbidden' });
    next();
  };
  ```
- [ ] Apply `authMiddleware` + `requireRole('vendor')` to all vendor routes
- [ ] Apply `authMiddleware` + `requireRole('customer')` to all customer booking/plan routes
- [ ] Apply `authMiddleware` + `requireRole('admin')` to all admin routes
- [ ] Add ownership checks (vendor can only edit their own services, customer can only see their own bookings)
- [ ] Update frontend `ProtectedRoute` to validate actual JWT expiry, not just localStorage presence

---

### ⛔ PHASE 3 — STEP 4: Frontend Security Hardening

- [ ] Move token from `localStorage` to `httpOnly` cookie (prevents XSS token theft)
- [ ] Implement automatic token refresh on 401 response (Axios interceptor upgrade)
- [ ] Add CSRF protection (`csurf` middleware on state-changing routes)
- [ ] Sanitize all user-generated text rendered in the UI (prevent XSS via reviews, descriptions)
- [ ] Implement Content Security Policy headers via `helmet`

---

### ⛔ PHASE 3 — STEP 5: AI — Smart Search & Recommendations

- [ ] Integrate **OpenAI API** (or use Claude API) for natural language service search:
  - User types: "I need a photographer for my daughter's wedding in Amman, budget under 500 JOD"
  - AI parses intent → extracts `category: photography`, `city: Amman`, `max_price: 500`
  - Auto-populates the filter sidebar and fires a filtered search
- [ ] Build `POST /api/ai/parse-search` endpoint that wraps the AI call
- [ ] Add a "Smart Search" toggle in the Services page search bar

---

### ⛔ PHASE 3 — STEP 6: AI — Personalized Recommendations

- [ ] Track customer browsing behavior: viewed services, categories searched, event types created
- [ ] Build `GET /api/recommendations` endpoint:
  - Uses collaborative filtering (users who booked X also booked Y)
  - Uses content-based filtering (customer's event type history → similar category services)
- [ ] Add "Recommended for You" section on the Home page (logged-in customers only)
- [ ] Add "Frequently Booked Together" section on Service Detail page

---

### ⛔ PHASE 3 — STEP 7: AI — Vendor AI Assistant

- [ ] Add an AI writing assistant to the Vendor "Add Service" form:
  - Vendor fills in basic info (title, category, price)
  - Clicks "✨ Generate Description" → AI writes a professional service description
  - Vendor can edit before saving
- [ ] Build `POST /api/ai/generate-description` endpoint

---

### ⛔ PHASE 3 — STEP 8: AI — Event Budget Estimator

- [ ] Add an "AI Budget Planner" tool on the customer My Events page:
  - Customer inputs: event type, guest count, city, style preference (Luxury / Mid-range / Budget)
  - AI returns an itemized budget breakdown by category
  - Each line item links to real services in that budget range
- [ ] Build `POST /api/ai/estimate-budget` endpoint

---

### ⛔ PHASE 3 — STEP 9: Performance & Scalability

- [ ] Add **Redis caching** for:
  - Category list (rarely changes — cache for 1 hour)
  - Top-rated services per category (cache for 15 minutes)
  - Individual service detail pages (cache for 5 minutes, invalidate on edit)
- [ ] Add **database connection pooling** tuning (current `pg.Pool` is fine, tune `max`, `idleTimeoutMillis`)
- [ ] Implement **full-text search** using PostgreSQL `tsvector`/`tsquery` for production-grade search (replaces `ILIKE %term%`)
- [ ] Add **WebSocket** support (Socket.io) for real-time notifications instead of 30s polling

---

### ⛔ PHASE 3 — STEP 10: Payments Integration

- [ ] Integrate **Stripe** (or a MENA-appropriate gateway like **Telr** or **MyFatoorah**) for card payments
- [ ] Build payment flow: Cart → Order Summary → Payment Page → Success/Failure page
- [ ] Implement webhook listener for async payment confirmation
- [ ] Record all transactions in the `payments` table
- [ ] Generate PDF receipts on payment completion

---

## IMPLEMENTATION PRIORITY SUMMARY

```
WEEK 1-2:   Phase 1, Steps 0.1–0.8  (Foundation + Design System)
WEEK 3:     Phase 1, Step 1          (Landing + Auth Redesign)
WEEK 4:     Phase 1, Step 2          (Home Page)
WEEK 5-6:   Phase 1, Steps 3-4       (Services Listing + Detail Pages)
WEEK 7-8:   Phase 1, Steps 5-6       (Customer + Vendor Dashboards)
WEEK 9:     Phase 1, Steps 7-8       (Admin Panel + UX Polish)
WEEK 10:    Phase 2, Steps 0-1       (DB Schema + Server Restructure)
WEEK 11:    Phase 2, Steps 2-5       (Auth + Services + Bookings API)
WEEK 12:    Phase 2, Steps 6-9       (Reviews + Users + Notifications API)
WEEK 13:    Phase 2, Steps 10-11     (Admin API + Frontend Wiring)
WEEK 14:    Phase 2, Step 12         (Infrastructure + Cloudinary + CI/CD)
WEEK 15+:   Phase 3                  (Security + AI — When Ready)
```

---

*This roadmap is a living document. Update it as features are completed by checking off tasks and adding new discoveries.*
