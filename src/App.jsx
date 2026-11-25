import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import Fx from "./components/Fx";

export default function App() {
  const { user, loading } = useAuth();
  if (loading) return <div className="loader-screen"><div className="spinner" /></div>;

  return (
    <>
      <Fx />
      <Routes>
        <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Auth start="login" />} />
        <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Auth start="register" />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}
