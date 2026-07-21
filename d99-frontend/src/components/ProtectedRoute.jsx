import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useSelector((s) => s.user);
  const location = useLocation();

  // Also check localStorage directly as a fallback for page refreshes
  // before Redux rehydrates
  const hasToken = isAuthenticated || !!localStorage.getItem("token");

  if (!hasToken) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return children;
}
