export interface User {
  id: number;
  email: string;
  role: string;
  total_fantasy_points: number;
  players: Player[]; // Dodano graczy do interfejsu User
}

export interface Player {
  id: number;
  full_name: string;
  position: string | null;
  team_name: string | null;
  average_fantasy_points: number;
  last_game_fantasy_points: number | null;
}
