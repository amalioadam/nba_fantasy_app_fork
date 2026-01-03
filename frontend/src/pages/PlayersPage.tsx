import React, { useEffect, useState } from "react";
import { useAuth } from "../AuthContext";
import { getPlayers, addPlayerToTeam, removePlayerFromTeam } from "../services/api";
import { Player } from "../types";
import { PlayerCard } from "../components/PlayerCard";

const playerListStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "center",
  gap: "10px",
  padding: "20px",
};

const topBarStyle: React.CSSProperties = {
  padding: "10px 20px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  backgroundColor: "#f0f0f0",
};

export const PlayersPage = () => {
  const { token, user, login } = useAuth(); // Get user and login (for refresh)
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Derive team player IDs from the user object in the context
  const teamPlayerIds = new Set(user?.players.map((p) => p.id) || []);

  useEffect(() => {
    const fetchPlayers = async () => {
      if (!token) {
        setError("No authentication token found.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const allPlayers = await getPlayers(token);
        setPlayers(allPlayers);
      } catch (err) {
        setError("Failed to fetch players.");
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();
  }, [token]);

  const handleAddToTeam = async (playerId: number) => {
    if (!token) return;

    try {
      await addPlayerToTeam(token, playerId);
      await login(token); // Refresh context user data
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.detail) {
        alert(err.response.data.detail);
      } else {
        alert("Failed to add player to your team. Please try again.");
      }
    }
  };

  const handleRemoveFromTeam = async (playerId: number) => {
    if (!token) return;

    try {
      await removePlayerFromTeam(token, playerId);
      await login(token); // Refresh context user data
    } catch (error) {
      alert("Failed to remove player from your team. Please try again.");
    }
  };

  if (loading) {
    return <div>Loading players...</div>;
  }

  if (error) {
    return <div style={{ color: "red" }}>Error: {error}</div>;
  }

  return (
    <div>
      <div style={topBarStyle}>
        <h2>Available Players ({teamPlayerIds.size} / 10 selected)</h2>
      </div>
      {players.length === 0 ? (
        <p>No players found.</p>
      ) : (
        <div style={playerListStyle}>
          {players.map((player) => (
            <PlayerCard
              key={player.id}
              player={player}
              onAddToTeam={() => handleAddToTeam(player.id)}
              onRemoveFromTeam={() => handleRemoveFromTeam(player.id)}
              isInTeam={teamPlayerIds.has(player.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PlayersPage;
