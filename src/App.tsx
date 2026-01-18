import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MantineProvider, createTheme } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { ModalsProvider } from '@mantine/modals';

import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';

import { useAuthStore } from './store';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import {
  LoginPage,
  RegisterPage,
  ProjectsPage,
  ProjectDetailPage,
  BoardPage,
  AuthCallbackPage,
  SetupPasswordPage,
  AuthErrorPage,
} from './pages';

const theme = createTheme({
  primaryColor: 'blue',
  fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  defaultRadius: 'md',
  components: {
    Button: {
      defaultProps: {
        radius: 'md',
      },
    },
    Card: {
      defaultProps: {
        radius: 'md',
      },
    },
    TextInput: {
      defaultProps: {
        radius: 'md',
      },
    },
    PasswordInput: {
      defaultProps: {
        radius: 'md',
      },
    },
  },
});

function App() {
  const { initialize, isAuthenticated } = useAuthStore();

  useEffect(() => {
    initialize().catch(() => {
      // Silently handle initialization errors
      // The initialize function already handles clearing tokens on failure
    });
  }, [initialize]);

  return (
    <MantineProvider theme={theme}>
      <Notifications position="top-right" />
      <ModalsProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route
              path="/login"
              element={
                isAuthenticated ? <Navigate to="/projects" replace /> : <LoginPage />
              }
            />
            <Route
              path="/register"
              element={
                isAuthenticated ? <Navigate to="/projects" replace /> : <RegisterPage />
              }
            />

            {/* OAuth & Invitation Routes */}
            <Route path="/auth/callback" element={<AuthCallbackPage />} />
            <Route path="/setup-password" element={<SetupPasswordPage />} />
            <Route path="/auth-error" element={<AuthErrorPage />} />

            {/* Protected Routes */}
            <Route
              path="/projects"
              element={
                <ProtectedRoute>
                  <ProjectsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/projects/:projectId"
              element={
                <ProtectedRoute>
                  <ProjectDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/boards/:boardId"
              element={
                <ProtectedRoute>
                  <BoardPage />
                </ProtectedRoute>
              }
            />

            {/* Redirect root to projects or login */}
            <Route
              path="/"
              element={
                <Navigate to={isAuthenticated ? '/projects' : '/login'} replace />
              }
            />

            {/* 404 - Redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ModalsProvider>
    </MantineProvider>
  );
}

export default App;
