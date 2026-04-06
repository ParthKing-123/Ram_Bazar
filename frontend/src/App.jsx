import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Components
import Layout from './components/Layout';
import AdminLayout from './components/AdminLayout';

// Lazy Load Customer Pages
const Auth = lazy(() => import('./pages/customer/Auth'));
const Home = lazy(() => import('./pages/customer/Home'));
const Checkout = lazy(() => import('./pages/customer/Checkout'));
const Success = lazy(() => import('./pages/customer/Success'));
const Orders = lazy(() => import('./pages/customer/Orders'));
const About = lazy(() => import('./pages/customer/About'));

// Lazy Load Admin Pages
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));

// Lazy Load Rider Pages
const RiderLayout = lazy(() => import('./components/RiderLayout'));
const RiderLogin = lazy(() => import('./pages/rider/RiderLogin'));
const RiderDashboard = lazy(() => import('./pages/rider/RiderDashboard'));

// Loader Fallback
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="w-10 h-10 border-4 border-brand-100 border-t-brand-600 rounded-full animate-spin"></div>
  </div>
);

function App() {
  return (
    <Router>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Customer Routes */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="login" element={<Auth />} />
            <Route path="onboarding" element={<Auth />} />
            <Route path="checkout" element={<Checkout />} />
            <Route path="success" element={<Success />} />
            <Route path="orders" element={<Orders />} />
            <Route path="about" element={<About />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="login" element={<AdminLogin />} />
            <Route path="dashboard" element={<AdminDashboard />} />
          </Route>

          {/* Rider Routes */}
          <Route path="/rider" element={<RiderLayout />}>
            <Route index element={<Navigate to="/rider/dashboard" replace />} />
            <Route path="login" element={<RiderLogin />} />
            <Route path="dashboard" element={<RiderDashboard />} />
          </Route>
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
