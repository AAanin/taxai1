// ডা. মিমু (Dr. Mimu) - বাংলাদেশের জন্য AI চিকিৎসা সহায়ক
// Modern UI/UX Redesigned Application - Clean, minimalist, and user-friendly

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainPage from './pages/MainPage.tsx';
import ChatPage from './pages/ChatPage.tsx';
import LoginPage from './pages/auth/LoginPage.tsx';
import RegisterPage from './pages/auth/RegisterPage.tsx';
import DashboardPage from './pages/DashboardPage.tsx';
import AppointmentsPage from './pages/AppointmentsPage.tsx';
import PrescriptionsPage from './pages/PrescriptionsPage.tsx';
import MedicalTestSystem from './components/MedicalTestSystem.tsx';
import DoctorDashboard from './components/DoctorDashboard.tsx';
import DoctorAuth from './components/DoctorAuth.tsx';
import PatientPortal from './components/PatientPortal.tsx';
import TelemedicineSystem from './components/TelemedicineSystem';
import HealthAnalyticsDashboard from './components/HealthAnalyticsDashboard';
import ImageUploadSystem from './components/ImageUploadSystem';
import EmergencyServicesSystem from './components/EmergencyServicesSystem';
import ProductionReadyEnhancement from './components/ProductionReadyEnhancement';
import UserDashboard from './components/UserDashboard';
import ErrorBoundary from './components/ErrorBoundary';
import AdminApp from './AdminApp.tsx';
import { AuthProvider } from './contexts/AuthContext.tsx';
import { NotificationProvider } from './contexts/NotificationContext.tsx';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <ErrorBoundary>
            <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/appointments" element={<AppointmentsPage />} />
            <Route path="/prescriptions" element={<PrescriptionsPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/medical-tests" element={<MedicalTestSystem />} />
            <Route path="/patient-portal" element={<PatientPortal />} />
            <Route path="/patient" element={<PatientPortal />} />
            <Route path="/telemedicine" element={<TelemedicineSystem />} />
            <Route path="/health-analytics" element={<HealthAnalyticsDashboard />} />
            <Route path="/image-upload" element={<ImageUploadSystem />} />
            <Route path="/emergency" element={<EmergencyServicesSystem />} />
            <Route path="/production-enhancement" element={<ProductionReadyEnhancement />} />
          <Route path="/user-dashboard" element={<UserDashboard />} />
            <Route path="/doctor-login" element={<DoctorAuth />} />
            <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
            <Route path="/doctor" element={<DoctorDashboard />} />
            <Route path="/admin" element={<AdminApp />} />
            </Routes>
          </ErrorBoundary>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;