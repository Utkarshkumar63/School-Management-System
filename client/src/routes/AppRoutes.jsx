import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Layout } from '../components/layout/Layout.jsx';
import { ProtectedRoute } from './ProtectedRoute.jsx';

// Pages
import { Login } from '../pages/auth/Login.jsx';

// Admin Pages
import { AdminDashboard } from '../pages/admin/AdminDashboard.jsx';
import { StudentsList } from '../pages/admin/StudentsList.jsx';
import { TeachersList } from '../pages/admin/TeachersList.jsx';
import { GuardiansList } from '../pages/admin/GuardiansList.jsx';
import { ClassesAndSubjects } from '../pages/admin/ClassesAndSubjects.jsx';
import { TeacherAssignments } from '../pages/admin/TeacherAssignments.jsx';
import { AttendanceAdmin } from '../pages/admin/AttendanceAdmin.jsx';
import { ExamsAndResults } from '../pages/admin/ExamsAndResults.jsx';
import { GradingRules } from '../pages/admin/GradingRules.jsx';
import { FeeManagement } from '../pages/admin/FeeManagement.jsx';
import { ReportsPage } from '../pages/admin/ReportsPage.jsx';
import { AuditLogs } from '../pages/admin/AuditLogs.jsx';

// Teacher Pages
import { TeacherDashboard } from '../pages/teacher/TeacherDashboard.jsx';
import { MarkAttendance } from '../pages/teacher/MarkAttendance.jsx';
import { EnterMarks } from '../pages/teacher/EnterMarks.jsx';
import { TeacherReports } from '../pages/teacher/TeacherReports.jsx';

// Guardian Pages
import { GuardianDashboard } from '../pages/guardian/GuardianDashboard.jsx';
import { ChildAttendance } from '../pages/guardian/ChildAttendance.jsx';
import { ChildReportCard } from '../pages/guardian/ChildReportCard.jsx';
import { ChildFees } from '../pages/guardian/ChildFees.jsx';

// Common Pages
import { HomePage } from '../pages/common/HomePage.jsx';
import { NotFound } from '../pages/common/NotFound.jsx';
import { Unauthorized } from '../pages/common/Unauthorized.jsx';

function RootRedirect() {
  const { user, isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (user?.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
  if (user?.role === 'TEACHER') return <Navigate to="/teacher/dashboard" replace />;
  if (user?.role === 'GUARDIAN') return <Navigate to="/guardian/dashboard" replace />;
  return <Navigate to="/login" replace />;
}

export function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<RootRedirect />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Authenticated Layout */}
      <Route element={<Layout />}>
        {/* Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/students" element={<StudentsList />} />
          <Route path="/admin/teachers" element={<TeachersList />} />
          <Route path="/admin/guardians" element={<GuardiansList />} />
          <Route path="/admin/academic" element={<ClassesAndSubjects />} />
          <Route path="/admin/assignments" element={<TeacherAssignments />} />
          <Route path="/admin/attendance" element={<AttendanceAdmin />} />
          <Route path="/admin/exams" element={<ExamsAndResults />} />
          <Route path="/admin/grading-rules" element={<GradingRules />} />
          <Route path="/admin/fees" element={<FeeManagement />} />
          <Route path="/admin/reports" element={<ReportsPage />} />
          <Route path="/admin/audit-logs" element={<AuditLogs />} />
        </Route>

        {/* Teacher Routes */}
        <Route element={<ProtectedRoute allowedRoles={['TEACHER']} />}>
          <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
          <Route path="/teacher/attendance" element={<MarkAttendance />} />
          <Route path="/teacher/marks" element={<EnterMarks />} />
          <Route path="/teacher/reports" element={<TeacherReports />} />
        </Route>

        {/* Guardian Routes */}
        <Route element={<ProtectedRoute allowedRoles={['GUARDIAN']} />}>
          <Route path="/guardian/dashboard" element={<GuardianDashboard />} />
          <Route path="/guardian/attendance" element={<ChildAttendance />} />
          <Route path="/guardian/reports" element={<ChildReportCard />} />
          <Route path="/guardian/fees" element={<ChildFees />} />
        </Route>
      </Route>

      {/* Catch-all 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

