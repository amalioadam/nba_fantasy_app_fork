import React from "react";
import { Routes, Route, Link, Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { PlayersPage } from "./pages/PlayersPage";
import { MyTeamPage } from "./pages/MyTeamPage"; // Import MyTeamPage
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
                <Link to="/players">Players</Link>
              </li>
              <li>
                <Link to="/my-team">My Team</Link> {/* Add My Team link */}
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
        <Route
          path="/"
          element={
            <PrivateRoute>
              <HomePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/players"
          element={
            <PrivateRoute>
              <PlayersPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/my-team"
          element={
            <PrivateRoute>
              <MyTeamPage />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />} />
      </Routes>
    </div>
  );
}

export default App;