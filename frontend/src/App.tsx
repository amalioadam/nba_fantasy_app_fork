import React from "react";
import { Routes, Route, Link, useNavigate, Outlet, Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { PlayersPage } from "./pages/PlayersPage"; // Import PlayersPage
import { PrivateRoute } from "./components/PrivateRoute";

function App() {
  const { isAuthenticated, logout } = useAuth();

  return (
    <div>
      <nav>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          {!isAuthenticated ? (
            <>
              <li>
                <Link to="/login">Login</Link>
              </li>
              <li>
                <Link to="/register">Register</Link>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/players">Players</Link> {/* Add Players link */}
              </li>
              <li>
                <button onClick={logout}>Logout</button>
              </li>
            </>
          )}
        </ul>
      </nav>
      <hr />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        {/* Protect the HomePage */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <HomePage />
            </PrivateRoute>
          }
        />
        {/* Protect the PlayersPage */}
        <Route
          path="/players"
          element={
            <PrivateRoute>
              <PlayersPage />
            </PrivateRoute>
          }
        />
        {/* Add a catch-all for unknown routes, redirecting to home or login */}
        <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />} />
      </Routes>
    </div>
  );
}

export default App;
