import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// ── Layouts ────────────────────────────────────────────────────
import PageLayout from './components/layout/PageLayout';
import DashboardLayout from './components/layout/DashboardLayout';

// ── Auth ───────────────────────────────────────────────────────
import ProtectedRoute from './components/auth/ProtectedRoute';
import Toast from './components/ui/Toast';

// ── Landing (new — pages/public) ─────────────────────────────
import Landing from './pages/public/Landing.jsx';

// ── Public pages (exist already) ──────────────────────────────
import Signup from './pages/public/Signup.jsx';
import Login from './pages/public/Login.jsx';
import Home from './pages/public/Home.jsx';
import Services from './pages/public/Services.jsx';
import EventTypePage from './pages/public/EventTypePage.jsx';

// ── Public detail pages ────────────────────────────────────────
import ServiceDetail from './pages/public/ServiceDetail.jsx';
import VendorPublicProfile from './pages/public/VendorPublicProfile.jsx';

// ── Customer dashboard pages ───────────────────────────────────
import CustomerDashboard from './pages/customer/CustomerDashboard.jsx';
import CustomerEvents from './pages/customer/CustomerEvents.jsx';
import CustomerBookings from './pages/customer/CustomerBookings.jsx';
import CustomerCart from './pages/customer/CustomerCart.jsx';
import CustomerProfile from './pages/customer/CustomerProfile.jsx';
import CustomerNotifications from './pages/customer/CustomerNotifications.jsx';

// ── Vendor dashboard pages ─────────────────────────────────────
import VendorDashboard from './pages/vendor/VendorDashboard.jsx';
import VendorServices from './pages/vendor/VendorServices.jsx';
import VendorServiceForm from './pages/vendor/VendorServiceForm.jsx';
import VendorBookings from './pages/vendor/VendorBookings.jsx';
import VendorAnalytics from './pages/vendor/VendorAnalytics.jsx';
import VendorProfile from './pages/vendor/VendorProfile.jsx';
import VendorNotifications from './pages/vendor/VendorNotifications.jsx';

// ── Admin dashboard pages ──────────────────────────────────────
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import AdminVendors from './pages/admin/AdminVendors.jsx';
import AdminUsers from './pages/admin/AdminUsers.jsx';
import AdminCategories from './pages/admin/AdminCategories.jsx';

// ── 404 ───────────────────────────────────────────────────────
import NotFound from './pages/NotFound.jsx';

// ─────────────────────────────────────────────────────────────
//  React Query — global client configuration
//  staleTime : 5 min  → cached data is considered fresh for 5 min
//  retry     : 1      → failed requests are retried once before error
// ─────────────────────────────────────────────────────────────
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

// ─────────────────────────────────────────────────────────────
//  App — Root Router
//
//  Route groups:
//  ┌─ Public (PageLayout: Navbar + Footer)
//  │   /            Landing (full-screen, no navbar/footer)
//  │   /signup      Signup
//  │   /login       Login
//  │   /home        Home
//  │   /services    Services listing
//  │   /services/:serviceId  Service Detail
//  │   /vendors/:vendorId    Vendor public profile
//  │
//  ├─ Customer (DashboardLayout, ProtectedRoute role=customer)
//  │   /customer/dashboard
//  │   /customer/events
//  │   /customer/bookings
//  │   /customer/cart
//  │   /customer/profile
//  │   /customer/notifications
//  │
//  ├─ Vendor (DashboardLayout, ProtectedRoute role=vendor)
//  │   /vendor/dashboard
//  │   /vendor/services
//  │   /vendor/services/new
//  │   /vendor/services/:id/edit
//  │   /vendor/bookings
//  │   /vendor/analytics
//  │   /vendor/profile
//  │   /vendor/notifications
//  │
//  ├─ Admin (DashboardLayout, ProtectedRoute role=admin)
//  │   /admin/dashboard
//  │   /admin/vendors
//  │   /admin/users
//  │   /admin/categories
//  │
//  └─ * → 404 NotFound
// ─────────────────────────────────────────────────────────────

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>

          {/* ── Landing (full-screen, no shared layout) ────────── */}
          <Route path="/" element={<Landing />} />

          {/* ── Auth pages (PageLayout, no footer for clean look) ─ */}
          <Route element={<PageLayout noFooter noNavbar />}>
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
          </Route>

          {/* ── Public pages (PageLayout with Navbar + Footer) ──── */}
          <Route element={<PageLayout />}>
            <Route path="/home" element={<Home />} />
            <Route path="/services/:eventType" element={<EventTypePage />} />
            <Route path="/services" element={<Services />} />
            <Route path="/services/:serviceId" element={<ServiceDetail />} />
            <Route path="/vendors/:vendorId" element={<VendorPublicProfile />} />
          </Route>

          {/* ── Customer dashboard (Protected: customer only) ────── */}
          <Route element={<ProtectedRoute allowedRoles={['customer']} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/customer/dashboard" element={<CustomerDashboard />} />
              <Route path="/customer/events" element={<CustomerEvents />} />
              <Route path="/customer/bookings" element={<CustomerBookings />} />
              <Route path="/customer/cart" element={<CustomerCart />} />
              <Route path="/customer/profile" element={<CustomerProfile />} />
              <Route path="/customer/notifications" element={<CustomerNotifications />} />
            </Route>
          </Route>

          {/* ── Vendor dashboard (Protected: vendor only) ───────── */}
          <Route element={<ProtectedRoute allowedRoles={['vendor']} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/vendor/dashboard" element={<VendorDashboard />} />
              <Route path="/vendor/services" element={<VendorServices />} />
              <Route path="/vendor/services/new" element={<VendorServiceForm />} />
              <Route path="/vendor/services/:id/edit" element={<VendorServiceForm />} />
              <Route path="/vendor/bookings" element={<VendorBookings />} />
              <Route path="/vendor/analytics" element={<VendorAnalytics />} />
              <Route path="/vendor/profile" element={<VendorProfile />} />
              <Route path="/vendor/notifications" element={<VendorNotifications />} />
            </Route>
          </Route>

          {/* ── Admin panel (Protected: admin only) ─────────────── */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/vendors" element={<AdminVendors />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/categories" element={<AdminCategories />} />
            </Route>
          </Route>

          {/* ── 404 Catch-all ────────────────────────────────────── */}
          <Route path="*" element={<NotFound />} />

        </Routes>
      </BrowserRouter>

      {/* React Query Devtools — only bundled in development */}
      <ReactQueryDevtools initialIsOpen={false} />

      {/* Global toast notifications */}
      <Toast />
    </QueryClientProvider>
  );
}

export default App;
