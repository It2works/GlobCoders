import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { DataProvider } from '@/components/DataProvider';
import { AuthProvider } from '@/contexts/AuthContext';

// Import pages
import Index from '@/pages/Index';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Courses from '@/pages/Courses';
import About from '@/pages/About';
import Contact from '@/pages/Contact';
import StudentDashboard from '@/pages/StudentDashboard';
import TeacherDashboard from '@/pages/TeacherDashboard';
import TeacherPendingApproval from '@/pages/TeacherPendingApproval';
import AdminDashboard from '@/pages/AdminDashboard';
import AdminCertificateVerification from '@/pages/AdminCertificateVerification';
import NotFound from '@/pages/NotFound';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-background">
          <DataProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/courses" element={<Courses />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/student-dashboard" element={<StudentDashboard />} />
              <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
              <Route path="/teacher-pending-approval" element={<TeacherPendingApproval />} />
              <Route path="/admin-dashboard" element={<AdminDashboard />} />
              <Route path="/admin-certificate-verification" element={<AdminCertificateVerification />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </DataProvider>
        </div>
        <Toaster />
      </AuthProvider>
    </Router>
  );
}

export default App;
