import { Navigate } from "react-router-dom";

export default function ProtectedRoute({
  isLoggedIn,
  isAuthChecking,
  children,
}) {
  if (isAuthChecking) {
    return null;
  }

  if (isLoggedIn) {
    return children;
  } else {
    return <Navigate to="/" replace />;
  }
}