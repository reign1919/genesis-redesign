import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './lib/authContext';
import LoadingScreen from './components/LoadingScreen';
import useIsMobile from './lib/useIsMobile';

// Desktop Pages
const HomePage = React.lazy(() => import('./pages/HomePage'));
const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const ContactPage = React.lazy(() => import('./pages/ContactPage'));
const SchoolDashboardPage = React.lazy(() => import('./pages/SchoolDashboardPage'));
const AdminPage = React.lazy(() => import('./pages/AdminPage'));
const DocumentationPage = React.lazy(() => import('./pages/DocumentationPage'));
const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage'));

// Mobile Pages
const MobileHomePage = React.lazy(() => import('./pages/mobile/MobileHomePage'));
const MobileLoginPage = React.lazy(() => import('./pages/mobile/MobileLoginPage'));
const MobileContactPage = React.lazy(() => import('./pages/mobile/MobileContactPage'));
const MobileSchoolDashboardPage = React.lazy(() => import('./pages/mobile/MobileSchoolDashboardPage'));
const MobileDocumentationPage = React.lazy(() => import('./pages/mobile/MobileDocumentationPage'));
const MobileWarningPopup = React.lazy(() => import('./components/mobile/MobileWarningPopup'));

function AppRouter() {
  const isMobile = useIsMobile();

  return (
    <Suspense fallback={<LoadingScreen />}>
      {isMobile && <MobileWarningPopup />}
      <Routes>
        <Route path="/" element={isMobile ? <MobileHomePage /> : <HomePage />} />
        <Route path="/login" element={isMobile ? <MobileLoginPage /> : <LoginPage />} />
        <Route path="/dashboard" element={isMobile ? <MobileSchoolDashboardPage /> : <SchoolDashboardPage />} />
        <Route path="/contact" element={isMobile ? <MobileContactPage /> : <ContactPage />} />
        <Route path="/docs" element={isMobile ? <MobileDocumentationPage /> : <DocumentationPage />} />
        
        {/* Admin stays desktop only */}
        <Route path="/admin" element={<AdminPage />} />

        {/* Catch-all 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
