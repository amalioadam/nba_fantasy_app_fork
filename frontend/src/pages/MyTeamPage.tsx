import React from "react";
import { useAuth } from "../AuthContext";
import { removePlayerFromTeam } from "../services/api";
import { PlayerCard } from "../components/PlayerCard";

const teamListStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "center",
  gap: "10px",
  padding: "20px",
};

export const MyTeamPage = () => {
  const { token, user, login } = useAuth(); // Get user and login (for refresh) from context

  const handleRemoveFromTeam = async (playerId: number) => {
    if (!token) return;

    try {
      await removePlayerFromTeam(token, playerId);
      // Refresh the user data in the context to reflect the change in team and total points
      await login(token); 
    } catch (error) {
      alert("Failed to remove player from your team. Please try again.");
    }
  };
  
  if (!user) {
    return <div>Loading user data...</div>;
  }

  const playersInTeam = user.players || [];

  return (
    <div>
      <h2>My Team</h2>
      <p>Twoje całkowite punkty fantasy: {user.total_fantasy_points.toFixed(2)}</p>
      
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
