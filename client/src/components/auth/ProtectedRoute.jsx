import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

// ─────────────────────────────────────────────────────────────
//  ProtectedRoute
//
//  Usage (in App.jsx):
//    <Route element={<ProtectedRoute allowedRoles={['customer']} />}>
//      <Route path="/customer/dashboard" element={<CustomerDashboard />} />
//    </Route>
//
//  Behaviour:
//    1. Not authenticated → redirect to "/" (Landing page)
//    2. Authenticated but wrong role → redirect to their role home
//    3. Authenticated + correct role → render <Outlet />
//
//  Props:
//    allowedRoles : string[]  — e.g. ['customer'] | ['vendor'] | ['admin']
//                              If omitted, only checks authentication.
// ─────────────────────────────────────────────────────────────

const ROLE_HOME = {
  customer: '/customer/dashboard',
  vendor: '/vendor/dashboard',
  admin: '/admin/dashboard',
};

function ProtectedRoute({ allowedRoles }) {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  // ── 1. Not logged in → go to Landing ───────────────────────
  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // ── 2. Wrong role → redirect to their own dashboard ────────
  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = user?.role;
    if (!allowedRoles.includes(userRole)) {
      const redirectTo = ROLE_HOME[userRole] ?? '/';
      return <Navigate to={redirectTo} replace />;
    }
  }

  // ── 3. All checks pass → render child routes ───────────────
  return <Outlet />;
}

export default ProtectedRoute;
