import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import { getPlayers } from '../services/api';

interface Player {
  id: number;
  full_name: string;
  position: string | null;
  team_name: string | null;
  points: number;
  rebounds: number;
  assists: number;
}

export const PlayersPage = () => {
  const { token } = useAuth();
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlayers = async () => {
      if (!token) {
        setError("No authentication token found.");
        setLoading(false);
        return;
      }
      try {
        const data = await getPlayers(token);
        setPlayers(data);
      } catch (err) {
        let errorMessage = 'Failed to fetch players.';
        if (err instanceof Error) {
          errorMessage = err.message;
        } else if (typeof err === 'object' && err !== null && 'response' in err && typeof err.response === 'object' && err.response !== null && 'data' in err.response && typeof err.response.data === 'object' && err.response.data !== null && 'detail' in err.response.data) {
          errorMessage = (err.response.data as { detail: string }).detail;
        }
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();
  }, [token]);

  if (loading) {
    return <div>Loading players...</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>Error: {error}</div>;
  }

  return (
    <div>
      <h2>Available Players</h2>
      {players.length === 0 ? (
        <p>No players found.</p>
      ) : (
        <ul>
          {players.map((player) => (
            <li key={player.id}>
              {player.full_name} ({player.team_name} - {player.position}) - Points: {player.points}, Rebounds: {player.rebounds}, Assists: {player.assists}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PlayersPage;
