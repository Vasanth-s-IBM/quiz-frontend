import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './routes/ProtectedRoute';
import Toast from './components/Toast';

// Auth
import Login from './pages/Login';

// User pages
import Topics from './pages/Topics';
import Instructions from './pages/Instructions';
import Exam from './pages/Exam';
import Completion from './pages/Completion';
import UserProfile from './pages/UserProfile';

// Admin pages
import AdminDashboard from './pages/AdminDashboard';
import AdminResults from './pages/AdminResults';
import AdminUsers from './pages/AdminUsers';
import AdminTopics from './pages/AdminTopics';
import AdminQuestions from './pages/AdminQuestions';
import AdminProctoringConfig from './pages/AdminProctoringConfig';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Toast />
          <Routes>
            {/* ---------------- PUBLIC ROUTES ---------------- */}
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* ---------------- USER ROUTES ---------------- */}
            <Route
              path="/topics"
              element={
                <ProtectedRoute allowedRoles={['User']}>
                  <Topics />
                </ProtectedRoute>
              }
            />

            <Route
              path="/instructions/:topicId"
              element={
                <ProtectedRoute allowedRoles={['User']}>
                  <Instructions />
                </ProtectedRoute>
              }
            />

            <Route
              path="/exam/:topicId"
              element={
                <ProtectedRoute allowedRoles={['User']}>
                  <Exam />
                </ProtectedRoute>
              }
            />

            <Route
              path="/completion"
              element={
                <ProtectedRoute allowedRoles={['User']}>
                  <Completion />
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute allowedRoles={['User']}>
                  <UserProfile />
                </ProtectedRoute>
              }
            />

            {/* ---------------- ADMIN ROUTES ---------------- */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/users"
              element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <AdminUsers />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/topics"
              element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <AdminTopics />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/questions"
              element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <AdminQuestions />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/proctoring"
              element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <AdminProctoringConfig />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/results"
              element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <AdminResults />
                </ProtectedRoute>
              }
            />

            {/* ---------------- FALLBACK ---------------- */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
};

export default App;
