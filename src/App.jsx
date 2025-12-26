import React from 'react';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { AuthProvider } from './context/AuthContext';

// Pages
import SelectCompany from './pages/SelectCompany';
import CompanyLogin from './pages/CompanyLogin';
import Login from './pages/Login'; // Keep for generic fallback or admin? Or replace. Keeping 'Login' as fallback or for super admin?
import Signup from './pages/Signup'; // We might need to make this company aware
import CompleteProfile from './pages/CompleteProfile';
import SeedData from './pages/SeedData'; // Can be removed later
import SuperAdminDashboard from './pages/SuperAdminDashboard';

// Dashboards
import EmployeeDashboard from './pages/EmployeeDashboard';
import ManagerDashboard from './pages/ManagerDashboard';

// Components
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <Toaster position="top-right" />
          <div className="min-h-screen bg-[var(--background-color)] text-[var(--text-primary)] font-sans">
            <Routes>

              {/* LANDING: Select Company */}
              {/* STATIC ROUTES */}
              <Route path="/seed" element={<SeedData />} />
              <Route path="/complete-profile" element={<CompleteProfile />} />

              {/* SUPER ADMIN (Hidden/Direct Access) */}
              <Route path="/login" element={<Login />} />

              {/* LANDING: Select Company */}
              <Route path="/" element={<SelectCompany />} />

              {/* TENANT AUTH */}
              <Route path="/:companyId/login" element={<CompanyLogin />} />
              <Route path="/:companyId/signup" element={<Signup />} />



              {/* SUPER ADMIN */}
              <Route
                path="/super-admin"
                element={
                  <ProtectedRoute>
                    <SuperAdminDashboard />
                    {/* ideally we check role='super_admin' here */}
                  </ProtectedRoute>
                }
              />

              {/* TENANT DASHBOARDS */}
              <Route
                path="/:companyId/employee"
                element={
                  <ProtectedRoute allowedRoles={['employee']}>
                    <EmployeeDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/:companyId/manager"
                element={
                  <ProtectedRoute allowedRoles={['manager']}>
                    <ManagerDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Fallbacks / Legacy Redirects from old bookmarks if needed, 
                  or just catch all to SelectCompany 
              */}
              <Route path="*" element={<SelectCompany />} />

            </Routes>
          </div>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
