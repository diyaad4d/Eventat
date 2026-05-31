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
- ❌ Event type selection (Wedding, Graduation, Milestone Birthdays, Corporate, General)
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
| `event_type` | Wedding, Graduation, Milestone Birthdays, Corporate, etc. |
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
  - Dropdown: event type (Wedding, Graduation, Milestone Birthdays, Corporate, General)
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
Visual cards for each event type (Wedding, Graduation, Milestone Birthdays, Corporate):
- Each card: atmospheric image, event name, "Plan This Event" CTA button
- Clicking navigates to `/services?event_type=wedding`

#### Step 2.6 — Build Testimonials / Reviews Strip
- 3 static customer testimonials with star ratings, name, event type
- Subtle card carousel with auto-play (or simple grid for MVP)

---

### PHASE 1 — STEP 3: Services Listing Page (Full Rebuild)

This is the most critical discovery page. It must be built to a very high standard.

#### ✅ Step 3.1 — Build the Services Page Layout *(COMPLETE)*
Two-column layout:
- **Left sidebar (280px):** All filters
- **Right main content:** Results grid + sort/count bar

Mobile: filters collapse into a slide-up drawer triggered by a "Filters" button.

#### ✅ Step 3.2 — Build the Filter Sidebar *(COMPLETE)*

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
  - Event Type dropdown (Wedding, Graduation, Milestone Birthdays, Corporate, General)
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

### PHASE 1 — STEP 7: Admin Panel (Completed)

All pages under `/admin/*`. Uses a distinct, darker admin layout (no hero images, data-dense).

#### ✅ Step 7.1 — Build Admin Dashboard (`/admin/dashboard`)
- Platform-wide stats: Total Users, Total Vendors, Total Bookings, Total Revenue
- Recent registrations (last 10 users/vendors)
- Pending vendor approvals alert count with quick link

#### ✅ Step 7.2 — Build Vendor Approval Queue (`/admin/vendors`)
- Table: Vendor Name, Company, Registration Date, Status badge, Actions
- "Approve" and "Reject" buttons
- Filter by status: Pending / Approved / Rejected / Updates Pending
- Clicking a vendor row shows a side panel with their full profile details
- Support vendor pending changes workflow (review profile updates)

#### ✅ Step 7.3 — Build User Management (`/admin/users`)
- Data table of all users with role, join date, status (active/banned)
- Search by name or email
- Ban/Unban user action

#### ✅ Step 7.4 — Build Category Management (`/admin/categories`)
- List of all categories with subcategories expandable
- Add Category button → simple form modal
- Add Subcategory button per category
- Edit and delete (soft delete only)
- Uses Zustand store for global category state

#### ✅ Step 7.5 — Build Analytics & Notifications
- `AdminAnalytics.jsx`: Revenue charts, Bookings charts, Top performing vendors using Recharts.
- `AdminNotifications.jsx`: System alerts, vendor approvals, unread tracking.

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
> **Note (Updated 2026-05-30):** This section has been comprehensively updated following a deep-dive architectural assessment of the Phase 1 codebase. All schema gaps, endpoint mismatches, and the dual booking model conflict (resolved via Option A) have been corrected in this plan.

---

### PHASE 2 — LAYER 0: Package Installation

#### Step 2.0.1 — Install Production Middleware & Tools
```bash
cd server
npm install bcryptjs jsonwebtoken express-rate-limit helmet morgan winston multer
npm install --save-dev node-pg-migrate
```

---

### PHASE 2 — LAYER 1: Server Foundation & Middleware

#### Step 2.1.1 — Create Database Pool (`server/db.js`)
- Extract pg Pool configuration into a centralized exported module.

#### Step 2.1.2 — Add Security & Error Middleware
- `server/middleware/errorHandler.js` — Centralized error handler returning JSON.
- `server/middleware/validate.middleware.js` — express-validator field-level error formatter.
- `server/middleware/auth.middleware.js` — JWT verification stub with Phase 2 test fallbacks.
- `server/middleware/role.middleware.js` — RBAC middleware factory (e.g., `requireRole('admin')`).

#### Step 2.1.3 — Restructure Server into MVC Pattern
- Rewrite `server/index.js` to serve solely as an Express bootstrap file importing routes.

---

### PHASE 2 — LAYER 2: Database Schema & Seeds

#### Step 2.2.1 — Write Migration: Drop and Rebuild Full Schema
Create `server/migrations/001_initial_schema.sql` incorporating **ALL GAP FIXES**:

- **users** & **customer_profiles** (Standard).
- **event_types**: Added `slug VARCHAR(80) UNIQUE NOT NULL`.
- **categories**: Added `slug VARCHAR(100) UNIQUE NOT NULL` and `is_active BOOLEAN DEFAULT TRUE`.
- **subcategories**: Added `slug VARCHAR(100)` and `is_active BOOLEAN DEFAULT TRUE`.
- **vendor_profiles**: 
  - Added `preferred_category_id INTEGER REFERENCES categories(category_id)`.
  - Replaced `portfolio_instagram` with `social_links JSONB DEFAULT '[]'`.
  - Added `pending_changes JSONB`, `pending_changes_at TIMESTAMP`, `pending_changes_approved_at TIMESTAMP`.
- **vendor_documents** (normalized storage).
- **services** & **service_images** (Standard).
- **event_plans** (Standard).
- **event_plan_items** ("bookings" — **Option A Model Fix**):
  - Added `event_date DATE`, `guest_count INTEGER`, `special_requests TEXT` to support single-item auto-created plans.
- **reviews** (Standard).
- **notifications**: Added `action_url VARCHAR(255)`.
- **payment_methods**, **payments**, **escrow_transactions** (Standard).
- **saved_services** (New table for wishlist feature).

#### Step 2.2.2 — Seed Initial Data
Create `server/seeds/seed.js`:
- Seed **10 categories** (with exact slugs matching frontend) and subcategories.
- Seed **5 event types**.
- Seed test users, vendors (company + freelancer), and customers.
- Seed **12 realistic services** with images.

---

### PHASE 2 — LAYER 3: Routes & Controllers (~37 Endpoints)

#### Step 2.3.1 — Auth Routes (`auth.routes.js` / `auth.controller.js`)
- `POST /api/auth/register` — Handle vendor/customer creation with proper profiles.
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me` (Alias for `/users/me`)
- `POST /api/auth/forgot-password` (Stub)
- `POST /api/auth/reset-password` (Stub)

#### Step 2.3.2 — Categories Routes (`categories.routes.js` / `categories.controller.js`)
- `GET /api/categories` — Return all active categories with subcategories and service counts.
- `GET /api/categories/:id/subcategories`
- `GET /api/event-types`

#### Step 2.3.3 — Services Routes (`services.routes.js` / `services.controller.js`)
- `GET /api/services` — Advanced query supporting `category` (slug), `subcategory` (slug), search, price, sort. *Must* include `primary_image_url` computed column.
- `GET /api/services/featured` — Top 8 rated services.
- `GET /api/services/:id` — Full service detail (images, reviews, similar).
- `GET /api/vendors/:vendorId/services` — Public vendor services.

#### Step 2.3.4 — Bookings/Event Plans Routes (`bookings.routes.js` / `bookings.controller.js`)
*Uses Option A Model: All bookings are event_plan_items.*
- `POST /api/bookings` — Direct "Book Now". Auto-creates single-item event plan.
- `GET /api/bookings/my` — Customer's items (joins event_plans & services).
- `GET /api/bookings/:id` — Single booking item detail.
- `PATCH /api/bookings/:id/cancel` — Customer cancel.
- `POST /api/event-plans` — Create empty plan.
- `GET /api/event-plans/my` — Customer plans.
- `GET /api/event-plans/:id` — Plan detail.
- `PATCH /api/event-plans/:id`
- `DELETE /api/event-plans/:id`
- `POST /api/event-plans/:id/items` — "Add to Cart".
- `DELETE /api/event-plans/:planId/items/:itemId`
- `POST /api/event-plans/:id/submit`

#### Step 2.3.5 — Vendor Specific Routes (`vendors.routes.js` / `vendors.controller.js`)
- `GET /api/vendor/services` — Auth'd: all own services (active + inactive).
- `POST /api/vendor/services` — Create service.
- `PATCH /api/vendor/services/:id` — Update service.
- `PATCH /api/vendor/services/:id/status` — Toggle active.
- `POST /api/vendor/services/:id/images` — Upload images.
- `DELETE /api/vendor/services/:id/images/:imageId`
- `GET /api/vendor/bookings` — All `event_plan_items` for vendor's services.
- `PATCH /api/vendor/bookings/:itemId/accept`
- `PATCH /api/vendor/bookings/:itemId/reject`
- `GET /api/vendor/profile` — Auth'd full profile.
- `PATCH /api/vendor/profile` — Writes to `pending_changes` workflow.
- `POST /api/vendor/profile/logo`
- `GET /api/vendor/analytics` — Monthly bookings, revenue, KPI stats.
- `GET /api/vendors/me/payment` — Escrow balance & IBAN.
- `POST /api/vendors/me/payment/change-request`

#### Step 2.3.6 — Reviews Routes (`reviews.routes.js` / `reviews.controller.js`)
- `POST /api/services/:id/reviews`
- `GET /api/services/:id/reviews`
- `PATCH /api/reviews/:reviewId` — Update own review text/rating.
- `DELETE /api/reviews/:reviewId`
- `GET /api/services/:id/reviews/eligibility` — Returns `{ canReview: bool, hasReviewed: bool }`.

#### Step 2.3.7 — Notifications Routes (`notifications.routes.js` / `notifications.controller.js`)
- `GET /api/notifications`
- `PUT /api/notifications/:id/read`
- `PUT /api/notifications/read-all`

#### Step 2.3.8 — Users Profile Routes (`users.routes.js` / `users.controller.js`)
- `GET /api/users/me`
- `PUT /api/users/me`
- `PUT /api/users/me/password`
- `DELETE /api/users/me`

#### Step 2.3.9 — Admin Routes (`admin.routes.js` / `admin.controller.js`)
- `GET /api/admin/stats` — Platform aggregates.
- `GET /api/admin/vendors` — Supports `?status=pending|approved|rejected`.
- `GET /api/admin/vendors/:id`
- `PUT /api/admin/vendors/:id/approve-changes` — Process pending profile edits.
- `PUT /api/admin/vendors/:id/approve`
- `PUT /api/admin/vendors/:id/reject`
- `GET /api/admin/users`
- `PUT /api/admin/users/:userId/ban`
- `GET /api/admin/categories` — All categories with subcategories.
- `POST /api/admin/categories`
- `PUT /api/admin/categories/:id`
- `DELETE /api/admin/categories/:id`
- `POST /api/admin/categories/:id/subcategories`
- `PUT /api/admin/subcategories/:subId`
- `DELETE /api/admin/subcategories/:subId`
- `GET /api/admin/analytics` — Revenue/Booking charts.

#### Step 2.3.10 — Upload Routes (`upload.routes.js` / `upload.controller.js`)
- `POST /api/upload/documents` — Two-phase Cloudinary upload for vendor registration docs.
- `POST /api/upload/images`

---

### PHASE 2 — LAYER 4: Frontend Service Files & Pre-Wiring

#### Step 2.4.1 — Create/Update Frontend Services
- Create `client/src/services/notifications.service.js`
- Create `client/src/services/admin.service.js`
- Create `client/src/services/upload.service.js`
- Update `auth.service.js` (`getMe` calls `/users/me`)

---

### PHASE 2 — LAYER 5: Frontend API Wiring

Go through each Phase 1 page component and replace mock/hardcoded data with React Query hooks connected to the services built in Layer 4.

#### Step 2.5.1 — Wire Services Listing Page
- Replace `axios.get` with `useQuery(['services', filters], () => servicesService.getAll(filters))`
- Make filters reactive: changing any filter triggers a new query
- URL params update on filter change (debounced)

#### Step 2.5.2 — Wire Service Detail Page
- `useQuery(['service', serviceId], () => servicesService.getById(serviceId))`
- `useQuery(['reviews', serviceId], () => reviewsService.getForService(serviceId))`
- `useMutation` for submitting a review

#### Step 2.5.3 — Wire Customer Dashboard Pages
- `useQuery` for bookings, event plans, notifications
- `useMutation` for cancel booking, create event plan, add/remove cart items
- Invalidate relevant queries on mutation success

#### Step 2.5.4 — Wire Vendor Dashboard Pages
- `useQuery` for vendor's services, booking requests, analytics
- `useMutation` for accept/reject booking, add/edit/delete service, profile updates

#### Step 2.5.5 — Wire Auth (Login/Register)
- `useMutation` for login — on success, call `authStore.login(user, token)`
- `useMutation` for register — on success, redirect to login
- Replace all remaining `localStorage` direct access with `authStore`

#### Step 2.5.6 — Wire Notifications
- `useQuery(['notifications'], notificationsService.getAll, { refetchInterval: 30000 })` — polling every 30s
- Update Navbar unread count badge dynamically

---

### PHASE 2 — LAYER 6: Infrastructure Finalization

#### Step 2.6.1 — Environment Variable Cleanup
- Create `client/.env.development` with `VITE_API_BASE_URL=http://localhost:5000`
- Create `client/.env.production` with `VITE_API_BASE_URL=https://eventat-backend.onrender.com`
- Remove all hardcoded URLs from every component file

#### Step 2.6.2 — Setup Cloudinary for Image Uploads
- Create Cloudinary account (free tier for development)
- Install `multer` + `cloudinary` SDK on server
- Wire up the `upload.controller.js` to process memory storage and upload directly to Cloudinary.

#### Step 2.6.3 — Update GitHub Actions CI/CD
- Add `VITE_API_BASE_URL` as a GitHub Actions secret
- Inject into Vite build step: `VITE_API_BASE_URL=${{ secrets.VITE_API_BASE_URL }} npm run build`
- Add Vercel deployment step after successful build

#### Step 2.6.4 — Database Migrations in CI/CD
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

---

<a name="section-5"></a>
## SECTION 5 — VENDOR REGISTRATION & PAYMENT BUSINESS REQUIREMENTS

> Added: 2026-05-28. These requirements come from the GP_5.pdf finalized business rules.
> All UI changes (Signup, AdminVendors, VendorProfile) have been implemented in Phase 1 using mock data.
> Phase 2 must persist these to the database.

---

### 5.1 — Vendor Types

There are two distinct vendor registration flows.

#### 5.1.1 — Company / Establishment
- Must provide: **Commercial Register** OR **Occupational License** (PDF/image, max 5 MB)
- Must provide: **National ID** of the authorized signatory (front + back, image)
- Company name in the IBAN must match the name in the Commercial Register
- Registration status is `pending` until an admin manually approves

#### 5.1.2 — Freelancer / Individual
- Must provide: **National ID** (front + back, image)
- Full name in the account must match the National ID **exactly**
- **Portfolio is mandatory** — at least one of: Instagram link, website URL, or portfolio PDF
- IBAN name must match the National ID name

#### 5.1.3 — Registration Status Flow
```
Draft → Submitted → [Admin Review] → Approved | Rejected
```
- Vendor can log in but cannot create services until status = `Approved`
- Admin sees all submitted documents in the vendor detail panel
- Admin can Approve, Reject, or Revoke at any time

---

### 5.2 — Escrow & Commission Model

#### 5.2.1 — Platform Commission Rate
- **10%** of every transaction
- Deducted automatically before vendor payout
- Never negotiable — fixed platform fee

#### 5.2.2 — Payment Method: Full Online (Escrow)
- Customer pays **100%** of booking total online at checkout
- Funds held in the Eventat escrow account
- On event confirmation (both parties confirm event occurred):
  - Platform deducts 10% commission
  - Vendor receives 90% of the booking total
- If event is cancelled BEFORE the event date:
  - Customer receives full refund (within cancellation window)
  - No commission charged

#### 5.2.3 — Payment Method: Cash + Online Deposit
- Customer pays **20% deposit** online at checkout
  - This deposit is designed to cover the 10% commission with a buffer
  - Deposit held in escrow
- Customer pays remaining **80% cash directly** to the vendor on event day
- After event confirmation:
  - Platform takes 10% commission from the escrow deposit
  - Remaining deposit balance (10%) released to vendor
- If event is cancelled:
  - Deposit is forfeited (or partially refunded depending on cancellation policy)

#### 5.2.4 — Edge Cases & Protection Logic
- **No-show vendor:** Customer dispute opens; escrow held until resolved; vendor may be penalized
- **No-show customer (cash model):** Vendor keeps the 20% deposit; platform takes 10% from it
- **Disputed events:** Admin intervenes; escrow frozen until resolution
- **Fraudulent vendors:** Admin revokes account; pending escrow balance frozen pending investigation

---

### 5.3 — Database Schema Additions Required (Phase 2)

These columns/tables need to be added to implement the above business rules.

#### 5.3.1 — Modifications to `vendor_profiles`

```sql
ALTER TABLE vendor_profiles
  ADD COLUMN vendor_type         VARCHAR(20)  NOT NULL DEFAULT 'company'
                                 CHECK (vendor_type IN ('company', 'freelancer')),
  ADD COLUMN signatory_name      VARCHAR(120),   -- for companies: authorized signatory
  ADD COLUMN commercial_register_url TEXT,        -- URL to uploaded document (Cloudinary)
  ADD COLUMN nid_front_url       TEXT,            -- National ID front photo URL
  ADD COLUMN nid_back_url        TEXT,            -- National ID back photo URL
  ADD COLUMN portfolio_instagram VARCHAR(255),    -- freelancer portfolio
  ADD COLUMN portfolio_website   VARCHAR(255),    -- freelancer portfolio
  ADD COLUMN portfolio_pdf_url   TEXT,            -- freelancer portfolio PDF URL
  ADD COLUMN iban                VARCHAR(50),     -- bank account IBAN
  ADD COLUMN payment_method      VARCHAR(30) NOT NULL DEFAULT 'full_online'
                                 CHECK (payment_method IN ('full_online', 'cash_deposit')),
  ADD COLUMN commission_rate     DECIMAL(5,2) NOT NULL DEFAULT 10.00;
```

#### 5.3.2 — New `escrow_transactions` Table

```sql
CREATE TABLE escrow_transactions (
  escrow_id        SERIAL PRIMARY KEY,
  event_id         INTEGER NOT NULL REFERENCES event_plans(event_id),
  vendor_id        INTEGER NOT NULL REFERENCES users(user_id),
  customer_id      INTEGER NOT NULL REFERENCES users(user_id),
  gross_amount     DECIMAL(10,2) NOT NULL,     -- full payment from customer
  deposit_amount   DECIMAL(10,2),              -- only for cash_deposit method
  commission_pct   DECIMAL(5,2) NOT NULL DEFAULT 10.00,
  commission_amount DECIMAL(10,2) NOT NULL,
  payout_amount    DECIMAL(10,2) NOT NULL,     -- vendor receives this
  status           VARCHAR(30) NOT NULL DEFAULT 'held'
                   CHECK (status IN ('held', 'released', 'refunded', 'disputed', 'frozen')),
  held_at          TIMESTAMP DEFAULT NOW(),
  released_at      TIMESTAMP,
  dispute_reason   TEXT,
  created_at       TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_escrow_event   ON escrow_transactions(event_id);
CREATE INDEX idx_escrow_vendor  ON escrow_transactions(vendor_id);
CREATE INDEX idx_escrow_status  ON escrow_transactions(status);
```

#### 5.3.3 — New `vendor_documents` Table (optional normalization)

> Alternative to the column approach above. Use if document types may expand.

```sql
CREATE TABLE vendor_documents (
  doc_id      SERIAL PRIMARY KEY,
  vendor_id   INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  doc_type    VARCHAR(50) NOT NULL,   -- 'commercial_register', 'nid_front', 'nid_back', 'portfolio_pdf'
  file_url    TEXT NOT NULL,
  uploaded_at TIMESTAMP DEFAULT NOW(),
  verified_at TIMESTAMP,
  verified_by INTEGER REFERENCES users(user_id)
);
```

---

### 5.4 — API Endpoints to Add (Phase 2 Extension)

#### 5.4.1 — `POST /api/auth/register` Updates
- Accept new vendor fields: `vendor_type`, `signatory_name`, `iban`, `payment_method`
- Handle document upload via Cloudinary (multipart form), store URLs
- Create `vendor_profiles` row with all new fields

#### 5.4.2 — `POST /api/upload/documents`
- Accepts: `commercial_register`, `nid_front`, `nid_back`, `portfolio_pdf`
- Uploads to Cloudinary under `eventat/vendor_docs/` folder
- Returns: `{ field: url }` map
- Only accessible to authenticated vendor users

#### 5.4.3 — `GET /api/admin/vendors/pending` Updates
- Include document URLs, payment method, IBAN (redacted), vendor_type

#### 5.4.4 — `GET /api/vendors/me/payment`
- Returns: payment method, masked IBAN, commission rate, escrow balance, pending payouts
- Restricted to authenticated vendor

#### 5.4.5 — `POST /api/vendors/me/payment/change-request`
- Creates an admin notification to review the payment method change
- Does NOT change the payment method directly (admin action required)

#### 5.4.6 — `POST /api/escrow/release/:escrowId` (Admin only)
- Marks escrow as `released`
- Triggers payout to vendor IBAN (or flags for manual bank transfer)

---

### 5.5 — Frontend Component Updates Completed (Phase 1 Mock)

| Component | Status | Changes Made |
|---|---|---|
| `Signup.jsx` | ✅ Done | Vendor type toggle, document upload fields, IBAN, payment method selector, portfolio links |
| `AdminVendors.jsx` | ✅ Done | Vendor type badge, doc status badge, IBAN reveal, payment method badge, portfolio links in side panel |
| `VendorProfile.jsx` | ✅ Done | Payment & Banking tab with escrow stats, IBAN reveal, commission rate, payout history |

All use **mock/placeholder data**. Phase 2 wires these to the real API.

---

### 5.6 — Vendor Onboarding UX Flow

```
Landing Page
  └─ Sign Up → Select "Vendor"
       └─ Step 1: Choose Vendor Type (Company | Freelancer)
       └─ Step 2: Business Info (name, description, city, category)
       └─ Step 3: Upload Documents (ID / Commercial Register)
       └─ Step 4: Portfolio (required for freelancers)
       └─ Step 5: Bank Account IBAN
       └─ Step 6: Payment Method Preference
       └─ Submit Application
            └─ Status: "Pending Review"
                 └─ Admin Reviews → Approves / Rejects
                      └─ Email notification sent
                           └─ Vendor can now access dashboard and create services
```

---

*This roadmap is a living document. Update it as features are completed by checking off tasks and adding new discoveries.*

