import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/Layout';

// Pages
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Customers } from './pages/Customers';
import { CustomerDetail } from './pages/CustomerDetail';
import { Vehicles } from './pages/Vehicles';
import { VehicleDetail } from './pages/VehicleDetail';
import { Estimates } from './pages/Estimates';
import { RepairOrders } from './pages/RepairOrders';
import { RepairOrderDetail } from './pages/RepairOrderDetail';
import { TechnicianWorksheets } from './pages/TechnicianWorksheets';
import { WorksheetDetail } from './pages/WorksheetDetail';
import { Invoices } from './pages/Invoices';
import { InvoiceDetail } from './pages/InvoiceDetail';
import { CashUp } from './pages/CashUp';
import { SecurityManagement } from './pages/SecurityManagement';
import { TaskManagement } from './pages/TaskManagement';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900 text-slate-100">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-mono text-slate-400">Loading Freedom Workshop Systems...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Login Route */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />

          {/* Protected Workshop Routes inside Layout */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            {/* Dashboard */}
            <Route index element={<Dashboard />} />

            {/* SOP Task Management */}
            <Route path="tasks" element={<TaskManagement />} />

            {/* Customers & Vehicles */}
            <Route path="customers" element={<Customers />} />
            <Route path="customers/:id" element={<CustomerDetail />} />
            <Route path="vehicles" element={<Vehicles />} />
            <Route path="vehicles/:id" element={<VehicleDetail />} />

            {/* Estimates & Pricing */}
            <Route path="estimates" element={<Estimates />} />

            {/* Repair Orders */}
            <Route path="repair-orders" element={<RepairOrders />} />
            <Route path="repair-orders/:id" element={<RepairOrderDetail />} />

            {/* Technician Worksheets */}
            <Route path="worksheets" element={<TechnicianWorksheets />} />
            <Route path="worksheets/:id" element={<WorksheetDetail />} />

            {/* Billing & Cash-Up */}
            <Route path="invoices" element={<Invoices />} />
            <Route path="invoices/:id" element={<InvoiceDetail />} />
            <Route path="cash-up" element={<CashUp />} />

            {/* Security & Information Systems */}
            <Route path="security" element={<SecurityManagement />} />

            {/* Reports & Management Controls */}
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
