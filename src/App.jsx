import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './lib/authContext';
import LoadingScreen from './components/LoadingScreen';
import Layout from './components/Layout';
import useIsMobile from './lib/useIsMobile';

// Desktop Pages
const HomePage = React.lazy(() => import('./pages/HomePage'));
const EventsPage = React.lazy(() => import('./pages/EventsPage'));
const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const ContactPage = React.lazy(() => import('./pages/ContactPage'));
const PartnerPage = React.lazy(() => import('./pages/PartnerPage'));
const SchoolDashboardPage = React.lazy(() => import('./pages/SchoolDashboardPage'));
const ReviewRegistrationPage = React.lazy(() => import('./pages/ReviewRegistrationPage'));
const EventDetailPage = React.lazy(() => import('./pages/EventDetailPage'));
const AdminPage = React.lazy(() => import('./pages/AdminPage'));
const DocumentationPage = React.lazy(() => import('./pages/DocumentationPage'));
const SponsorsPage = React.lazy(() => import('./pages/SponsorsPage'));
const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage'));

// Mobile Pages
const MobileHomePage = React.lazy(() => import('./pages/mobile/MobileHomePage'));
const MobileEventsPage = React.lazy(() => import('./pages/mobile/MobileEventsPage'));
const MobileLoginPage = React.lazy(() => import('./pages/mobile/MobileLoginPage'));
const MobileContactPage = React.lazy(() => import('./pages/mobile/MobileContactPage'));
const MobilePartnerPage = React.lazy(() => import('./pages/mobile/MobilePartnerPage'));
const MobileSchoolDashboardPage = React.lazy(() => import('./pages/mobile/MobileSchoolDashboardPage'));
const MobileReviewRegistrationPage = React.lazy(() => import('./pages/mobile/MobileReviewRegistrationPage'));
const MobileDocumentationPage = React.lazy(() => import('./pages/mobile/MobileDocumentationPage'));
const MobileSponsorsPage = React.lazy(() => import('./pages/mobile/MobileSponsorsPage'));
const MobileWarningPopup = React.lazy(() => import('./components/mobile/MobileWarningPopup'));

function AppRouter() {
  const isMobile = useIsMobile();

  return (
    <Layout>
      <Suspense fallback={<LoadingScreen />}>
        {isMobile && <MobileWarningPopup />}
        <Routes>
          <Route path="/" element={isMobile ? <MobileHomePage /> : <HomePage />} />
          <Route path="/events" element={isMobile ? <MobileEventsPage /> : <EventsPage />} />
          <Route path="/login" element={isMobile ? <MobileLoginPage /> : <LoginPage />} />
          <Route path="/contact" element={isMobile ? <MobileContactPage /> : <ContactPage />} />
          <Route path="/partnerships" element={isMobile ? <MobilePartnerPage /> : <PartnerPage />} />
          <Route path="/partner" element={<Navigate to="/partnerships" replace />} />
          <Route path="/sponsors" element={isMobile ? <MobileSponsorsPage /> : <SponsorsPage />} />
          <Route path="/sponsor" element={<Navigate to="/sponsors" replace />} />
          <Route path="/dashboard" element={isMobile ? <MobileSchoolDashboardPage /> : <SchoolDashboardPage />} />
          <Route path="/dashboard/review" element={isMobile ? <MobileReviewRegistrationPage /> : <ReviewRegistrationPage />} />
          <Route path="/dashboard/:eventSlug" element={<EventDetailPage />} />
          <Route path="/docs" element={isMobile ? <MobileDocumentationPage /> : <DocumentationPage />} />
          
          {/* Admin stays desktop only */}
          <Route path="/admin" element={<AdminPage />} />

          {/* Catch-all 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </Layout>
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
