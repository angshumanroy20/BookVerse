import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { ViewModeProvider } from '@/contexts/ViewModeContext';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { Toaster } from '@/components/ui/toaster';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import MusicPlayer from '@/components/common/MusicPlayer';
import routes from './routes';

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <ViewModeProvider>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow">
              <Routes>
                {routes.map((route, index) => {
                  const element = route.requireAuth ? (
                    <RequireAuth>{route.element}</RequireAuth>
                  ) : (
                    route.element
                  );
                  return (
                    <Route
                      key={index}
                      path={route.path}
                      element={element}
                    />
                  );
                })}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
          <MusicPlayer />
          <Toaster />
        </ViewModeProvider>
      </AuthProvider>
    </Router>
  );
}
