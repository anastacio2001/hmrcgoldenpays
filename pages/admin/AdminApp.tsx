import React, { lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../../contexts/AuthContext';
import ProtectedRoute from '../../components/ProtectedRoute';
import AdminLayout from '../../components/AdminLayout';
import AdminLogin from './AdminLogin';

const Dashboard = lazy(() => import('./Dashboard'));
const Leads = lazy(() => import('./Leads'));
const Inquiries = lazy(() => import('./Inquiries'));
const Clients = lazy(() => import('./Clients'));
const Projects = lazy(() => import('./Projects'));
const Payments = lazy(() => import('./Payments'));
const Deliverables = lazy(() => import('./Deliverables'));
const Settings = lazy(() => import('./Settings'));
const Finances = lazy(() => import('./internal/Finances'));
const Documents = lazy(() => import('./internal/Documents'));
const Compliance = lazy(() => import('./internal/Compliance'));
const ComplianceReport = lazy(() => import('./internal/ComplianceReport'));

// Admin area: mounted under /admin/* and loaded only when visited.
const AdminApp: React.FC = () => (
  <AuthProvider>
    <Routes>
      <Route path="login" element={<AdminLogin />} />
      <Route path="*" element={
        <ProtectedRoute requireAdmin>
          <AdminLayout>
            <Routes>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="leads" element={<Leads />} />
              <Route path="inquiries" element={<Inquiries />} />
              <Route path="clients" element={<Clients />} />
              <Route path="projects" element={<Projects />} />
              <Route path="payments" element={<Payments />} />
              <Route path="deliverables" element={<Deliverables />} />
              <Route path="finances" element={<Finances />} />
              <Route path="documents" element={<Documents />} />
              <Route path="compliance" element={<Compliance />} />
              <Route path="compliance/report" element={<ComplianceReport />} />
              <Route path="settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="dashboard" replace />} />
            </Routes>
          </AdminLayout>
        </ProtectedRoute>
      } />
    </Routes>
  </AuthProvider>
);

export default AdminApp;
