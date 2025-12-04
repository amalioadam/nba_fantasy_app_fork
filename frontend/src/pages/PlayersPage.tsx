import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "../AuthContext";
import { getPlayers, getMyTeam, updateMyTeam } from "../services/api";
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
  const { token } = useAuth();
  const [players, setPlayers] = useState<Player[]>([]);
  const [teamPlayerIds, setTeamPlayerIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      if (!token) {
        setError("No authentication token found.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const [allPlayers, myTeam] = await Promise.all([
          getPlayers(token),
          getMyTeam(token),
        ]);
        setPlayers(allPlayers);
        setTeamPlayerIds(new Set(myTeam.map((p: Player) => p.id)));
      } catch (err) {
        setError("Failed to fetch data.");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [token]);

  const handleAddToTeam = (playerId: number) => {
    if (teamPlayerIds.size >= 10) {
      alert("You can select a maximum of 10 players.");
      return;
    }
    setTeamPlayerIds((prev) => new Set(prev).add(playerId));
  };

  const handleRemoveFromTeam = (playerId: number) => {
    setTeamPlayerIds((prev) => {
      const newSet = new Set(prev);
      newSet.delete(playerId);
      return newSet;
    });
  };

  const handleSaveTeam = async () => {
    if (!token) return;
    try {
      setSaveMessage("Saving...");
      await updateMyTeam(token, Array.from(teamPlayerIds));
      setSaveMessage("Team saved successfully!");
    } catch (error) {
      setSaveMessage("Failed to save team.");
    } finally {
      setTimeout(() => setSaveMessage(null), 3000);
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
        <div>
          <button onClick={handleSaveTeam}>Save Team</button>
          {saveMessage && <span style={{ marginLeft: '10px' }}>{saveMessage}</span>}
        </div>
      </div>
      {players.length === 0 ? (
        <p>No players found.</p>
      ) : (
        <div style={playerListStyle}>
          {players.map((player) => (
            <PlayerCard
              key={player.id}
              player={player}
              onAddToTeam={handleAddToTeam}
              onRemoveFromTeam={handleRemoveFromTeam}
              isInTeam={teamPlayerIds.has(player.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PlayersPage;
