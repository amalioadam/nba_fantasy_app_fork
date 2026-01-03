import React from "react";
import { useAuth } from "../AuthContext";

export const HomePage = () => {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <div>
      <h1>Witaj w NBA Fantasy!</h1>
      {isAuthenticated && user ? (
        <>
          <p>Witaj, {user.email}!</p>
          <p>Twoje całkowite punkty fantasy: {user.total_fantasy_points.toFixed(2)}</p>
          <button onClick={logout}>Wyloguj się</button>
        </>
      ) : (
        <p>Proszę się zalogować, aby zobaczyć swoją stronę główną.</p>
      )}
    </div>
  );
};

export default HomePage;
