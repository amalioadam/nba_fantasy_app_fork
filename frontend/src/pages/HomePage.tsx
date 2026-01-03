import React, { useState, useEffect } from "react";
import { useAuth } from "../AuthContext";
import { getUsersMe } from "../services/api";
import { User } from "../types"; // Importujemy interfejs User

export const HomePage = () => {
  const { token, logout } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (token) {
        try {
          setLoading(true);
          const userData = await getUsersMe(token);
          setUser(userData);
        } catch (err) {
          setError("Failed to fetch user data.");
          console.error("Failed to fetch user data:", err);
        } finally {
          setLoading(false);
        }
      } else {
        setUser(null);
        setLoading(false);
      }
    };

    fetchUserData();
  }, [token]); // Re-run when token changes

  if (loading) {
    return <div>Loading user data...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>Witaj w NBA Fantasy!</h1>
      {token ? (
        <>
          {user ? (
            <>
              <p>Witaj, {user.email}!</p>
              <p>Twoje całkowite punkty fantasy: {user.total_fantasy_points.toFixed(2)}</p>
            </>
          ) : (
            <p>Brak danych użytkownika.</p>
          )}
          <button onClick={logout}>Wyloguj się</button>
        </>
      ) : (
        <p>Proszę się zalogować, aby zobaczyć swoją stronę główną.</p>
      )}
    </div>
  );
};

export default HomePage;
