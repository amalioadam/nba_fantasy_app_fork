export interface Player {
  id: number;
  full_name: string;
  position: string | null;
  team_name: string | null;
  average_fantasy_points: number;
  last_game_fantasy_points: number | null;
}

export interface UserTeam {
  id: number;
  email: string;
  role: string;
  players: Player[];
  total_fantasy_points: number;
}
