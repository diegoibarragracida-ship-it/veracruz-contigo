import { useState, useEffect, createContext, useContext, useRef } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { Toaster } from "@/components/ui/sonner";
import { LanguageProvider } from "@/i18n/LanguageContext";
import OnboardingModal from "@/components/OnboardingModal";
import ChatBot from "@/components/ChatBot";

// Pages
import HomePage from "@/pages/HomePage";
import ExplorePage from "@/pages/ExplorePage";
import MunicipioPage from "@/pages/MunicipioPage";
import PrestadoresPage from "@/pages/PrestadoresPage";
import EventosPage from "@/pages/EventosPage";
import EmergenciaPage from "@/pages/EmergenciaPage";
import GuiaPage from "@/pages/GuiaPage";
import RutasPage from "@/pages/RutasPage";
import LoginPage from "@/pages/LoginPage";
import PerfilPage from "@/pages/PerfilPage";

// Admin Pages
import AdminDashboard from "@/pages/admin/AdminDashboard";
import EncargadoDashboard from "@/pages/admin/EncargadoDashboard";
import PrestadorDashboard from "@/pages/admin/PrestadorDashboard";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Configure axios
axios.defaults.withCredentials = true;

// Auth Context
const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

// REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const checkAuth = async () => {
    // CRITICAL: If returning from OAuth callback, skip the /me check.
    // AuthCallback will exchange the session_id and establish the session first.
    if (window.location.hash?.includes('session_id=')) {
      setLoading(false);
      return;
    }
    
    try {
      const response = await axios.get(`${API}/auth/me`);
      setUser(response.data);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const triggerOnboarding = (userData) => {
    const onboardingKey = `vc_onboarding_${userData.user_id || userData.email}`;
    if (!localStorage.getItem(onboardingKey)) {
      localStorage.setItem(onboardingKey, "true");
      setShowOnboarding(true);
    }
  };

  const login = async (email, password) => {
    const response = await axios.post(`${API}/auth/login`, { email, password });
    setUser(response.data);
    triggerOnboarding(response.data);
    return response.data;
  };

  const loginWithGoogle = () => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const redirectUrl = window.location.origin + '/auth/callback';
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  const logout = async () => {
    try {
      await axios.post(`${API}/auth/logout`);
    } catch (error) {
      console.error("Logout error:", error);
    }
    setUser(null);
    setShowOnboarding(false);
  };

  const value = {
    user,
    setUser,
    loading,
    login,
    loginWithGoogle,
    logout,
    showOnboarding,
    setShowOnboarding,
    triggerOnboarding,
    isAuthenticated: !!user,
    isSuperAdmin: user?.rol === "superadmin",
    isEncargado: user?.rol === "encargado",
    isPrestador: user?.rol === "prestador",
    isTurista: user?.rol === "turista",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Auth Callback Component
const AuthCallback = () => {
  const navigate = useNavigate();
  const { setUser, triggerOnboarding } = useAuth();
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const processAuth = async () => {
      const hash = window.location.hash;
      const sessionId = hash.split('session_id=')[1]?.split('&')[0];

      if (!sessionId) {
        navigate('/login');
        return;
      }

      try {
        const response = await axios.post(`${API}/auth/session`, { session_id: sessionId });
        setUser(response.data);
        triggerOnboarding(response.data);
        
        // Redirect based on role
        const role = response.data.rol;
        if (role === 'superadmin') {
          navigate('/admin', { replace: true });
        } else if (role === 'encargado') {
          navigate('/encargado', { replace: true });
        } else if (role === 'prestador') {
          navigate('/prestador-panel', { replace: true });
        } else {
          navigate('/', { replace: true });
        }
      } catch (error) {
        console.error("Auth callback error:", error);
        navigate('/login');
      }
    };

    processAuth();
  }, [navigate, setUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F5F5]">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-[#1B5E20] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Iniciando sesión...</p>
      </div>
    </div>
  );
};

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5F5]">
        <div className="w-16 h-16 border-4 border-[#1B5E20] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.rol)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// App Router
function AppRouter() {
  const location = useLocation();

  // Check URL fragment for session_id - must be synchronous during render
  if (location.hash?.includes('session_id=')) {
    return <AuthCallback />;
  }

  // Check path for auth callback
  if (location.pathname === '/auth/callback') {
    return <AuthCallback />;
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/explorar" element={<ExplorePage />} />
      <Route path="/municipio/:slug" element={<MunicipioPage />} />
      <Route path="/prestadores" element={<PrestadoresPage />} />
      <Route path="/eventos" element={<EventosPage />} />
      <Route path="/emergencia" element={<EmergenciaPage />} />
      <Route path="/guia" element={<GuiaPage />} />
      <Route path="/rutas" element={<RutasPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/auth/callback" element={<AuthCallback />} />

      {/* Protected Routes - Turista */}
      <Route path="/perfil" element={
        <ProtectedRoute allowedRoles={["turista", "superadmin", "encargado", "prestador"]}>
          <PerfilPage />
        </ProtectedRoute>
      } />

      {/* Protected Routes - Super Admin */}
      <Route path="/admin/*" element={
        <ProtectedRoute allowedRoles={["superadmin"]}>
          <AdminDashboard />
        </ProtectedRoute>
      } />

      {/* Protected Routes - Encargado Municipal */}
      <Route path="/encargado/*" element={
        <ProtectedRoute allowedRoles={["encargado", "superadmin"]}>
          <EncargadoDashboard />
        </ProtectedRoute>
      } />

      {/* Protected Routes - Prestador */}
      <Route path="/prestador-panel/*" element={
        <ProtectedRoute allowedRoles={["prestador", "superadmin"]}>
          <PrestadorDashboard />
        </ProtectedRoute>
      } />

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

// 404 Page
const NotFoundPage = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#1B5E20] to-[#0277BD] text-white p-8">
    <h1 className="text-8xl font-bold mb-4" style={{ fontFamily: 'Playfair Display' }}>404</h1>
    <p className="text-2xl mb-8">Página no encontrada</p>
    <a href="/" className="btn-gold px-8 py-4 rounded-xl text-lg font-semibold">
      Volver al inicio
    </a>
  </div>
);

// Onboarding Wrapper
const OnboardingWrapper = () => {
  const { user, showOnboarding, setShowOnboarding } = useAuth();
  if (!showOnboarding || !user) return null;
  return <OnboardingModal role={user.rol} onClose={() => setShowOnboarding(false)} />;
};

function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <AppRouter />
          <OnboardingWrapper />
          <ChatBot />
          <Toaster position="top-right" richColors />
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}

export default App;
export { API, BACKEND_URL };
