import React from "react";
import { Routes, Route, Link, useNavigate, Outlet, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./AuthContext";
import { HomePage } from "./pages/HomePage"; // Import actual HomePage
import { LoginPage } from "./pages/LoginPage"; // Import actual LoginPage (will be implemented next)

// A wrapper for <Route> that redirects to the login screen if you're not yet authenticated.
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { token } = useAuth();
  const navigate = useNavigate();

  if (!token) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to when they were redirected. This allows us to send them
    // along to that page after they login, which is a nicer user experience
    // than dropping them off on the home page.
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

function App() {
  const { token, logout } = useAuth(); // Use useAuth in App for navigation logic

  return (
    <AuthProvider>
      <div>
        <nav>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            {!token ? ( // Show Login link only if not logged in
              <li>
                <Link to="/login">Login</Link>
              </li>
            ) : ( // Show Logout button if logged in
              <li>
                <button onClick={logout}>Logout</button>
              </li>
            )}
            {/* We don't have a RegisterPage yet, so commenting it out for now */}
            {/* <li>
              <Link to="/register">Register</Link>
            </li> */}
          </ul>
        </nav>
        <hr />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          {/* Protect the HomePage */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />
          {/* Add a catch-all for unknown routes, redirecting to home or login */}
          <Route path="*" element={<Navigate to={token ? "/" : "/login"} replace />} />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;
