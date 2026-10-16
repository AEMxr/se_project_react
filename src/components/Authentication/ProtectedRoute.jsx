import { Navigate } from "react-router-dom";

export default function ProtectedRoute({
  isLoggedIn,
  isAuthChecking,
  children,
}) {
  if (isAuthChecking)
    return (
      <main className="main" aria-busy="true">
        <h1 className="visually-hidden">Profile</h1>
        <p role="status">Checking your session...</p>
      </main>
    );
  return isLoggedIn ? children : <Navigate to="/" replace />;
}
