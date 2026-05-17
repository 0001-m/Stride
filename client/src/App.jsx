import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { PrivateRoute } from './components/PrivateRoute.jsx';
import { DashboardLayout } from './layouts/DashboardLayout.jsx';
import { Login } from './pages/Login.jsx';
import { Register } from './pages/Register.jsx';
import { Dashboard } from './pages/Dashboard.jsx';
import { Projects } from './pages/Projects.jsx';
import { ProjectTeam } from './pages/ProjectTeam.jsx';
import { ProjectTasks } from './pages/ProjectTasks.jsx';
import { ProjectKanban } from './pages/ProjectKanban.jsx';
import { ProjectAnalytics } from './pages/ProjectAnalytics.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route element={<PrivateRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/projects/:projectId/board" element={<ProjectKanban />} />
              <Route path="/projects/:projectId/tasks" element={<ProjectTasks />} />
              <Route path="/projects/:projectId/analytics" element={<ProjectAnalytics />} />
              <Route path="/projects/:projectId" element={<ProjectTeam />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
