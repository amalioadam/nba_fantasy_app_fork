import React, { useEffect, useState } from "react";
import { useAuth } from "../AuthContext";
import { getUsersMe, removePlayerFromTeam } from "../services/api"; // Usunięto getMyTeam
import { Player, User } from "../types"; // Dodano User
import { PlayerCard } from "../components/PlayerCard";

const teamListStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "center",
  gap: "10px",
  padding: "20px",
};

export const MyTeamPage = () => {
  const { token } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        setError("No authentication token found.");
        setLoading(false);
        return;
      }
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
    };

    fetchData();
  }, [token]);

  const handleRemoveFromTeam = async (playerId: number) => {
    if (!token) return;

    const originalPlayers = user ? [...user.players] : [];
    setUser((currentUser) => {
      if (!currentUser) return null;
      return {
        ...currentUser,
        players: currentUser.players.filter((player) => player.id !== playerId),
      };
    });

    try {
      await removePlayerFromTeam(token, playerId);
      const updatedUserData = await getUsersMe(token);
      setUser(updatedUserData);
    } catch (error) {
      alert("Failed to remove player from your team. Please try again.");
      setUser((currentUser) => {
        if (!currentUser) return null;
        return {
          ...currentUser,
          players: originalPlayers,
        };
      });
    }
  };

  if (loading) {
    return <div>Loading user data...</div>;
  }

  if (error) {
    return <div style={{ color: "red" }}>Error: {error}</div>;
  }

  const playersInTeam = user?.players || [];

  return (
    <div>
      <h2>My Team</h2>
      {user && (
        <p>Twoje całkowite punkty fantasy: {user.total_fantasy_points.toFixed(2)}</p>
      )}
      {playersInTeam.length === 0 ? (
        <p>
          You haven't selected any players yet. Go to the Players page to build
          your team!
        </p>
      ) : (
        <div style={teamListStyle}>
          {playersInTeam.map((player) => (
            <PlayerCard
              key={player.id}
              player={player}
              onAddToTeam={() => {}}
              onRemoveFromTeam={() => handleRemoveFromTeam(player.id)}
              isInTeam={true}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyTeamPage;
