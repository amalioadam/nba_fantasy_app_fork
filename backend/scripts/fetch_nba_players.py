from nba_api.stats.endpoints import commonallplayers, commonteamroster, leaguegamelog
from nba_api.stats.static import teams
from sqlalchemy.orm import joinedload
from datetime import datetime, timedelta
import time
import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from models import Player, PlayerGameStats, User, SessionLocal, create_tables

MAX_WORKERS = 5
BATCH_SIZE = 20  # liczba graczy na batch
SEASON = "2025-26"


def fetch_latest_game_logs(player_ids, target_date):
    """
    Pobiera statystyki wszystkich graczy dla konkretnego dnia jednym zapytaniem.
    Zwraca dict {player_id: row} z ostatniego meczu danego dnia.
    """
    try:
        df = leaguegamelog.LeagueGameLog(
            player_or_team_abbreviation="P",
            date_from_nullable=target_date,
            date_to_nullable=target_date,
            season=SEASON,
            timeout=60
        ).get_data_frames()[0]

        player_latest_game = {}
        for _, row in df.iterrows():
            pid = row["PLAYER_ID"]
            if pid in player_ids:
                # zostawiamy tylko ostatni mecz danego dnia
                if pid not in player_latest_game:
                    player_latest_game[pid] = row
        return player_latest_game

    except Exception as e:
        print(f"Failed to fetch game logs: {e}")
        return {}


def sync_all_players_from_api():
    """
    Sync wszystkich aktywnych zawodników z API
    """
    print("Syncing all players from NBA API...")
    db = SessionLocal()
    try:
        all_players_df = commonallplayers.CommonAllPlayers(is_only_current_season=1).get_data_frames()[0]

        team_list = teams.get_teams()
        roster_data = {}
        print("Fetching team rosters to get player positions...")
        for t in team_list:
            try:
                roster = commonteamroster.CommonTeamRoster(team_id=t["id"]).get_data_frames()[0]
                for _, row in roster.iterrows():
                    roster_data[row["PLAYER_ID"]] = row.get("POSITION")
                time.sleep(1.0)
            except Exception as e:
                print(f"Could not fetch roster for team {t['full_name']}: {e}")

        print("Updating database with player info...")
        added_count = 0
        updated_count = 0
        db_players = {p.id: p for p in db.query(Player).all()}

        for _, p_row in all_players_df.iterrows():
            player_id = p_row["PERSON_ID"]
            position = roster_data.get(player_id, "N/A")

            if player_id in db_players:
                player = db_players[player_id]
                player.full_name = p_row["DISPLAY_FIRST_LAST"]
                player.is_active = p_row["ROSTERSTATUS"] == 1
                player.team_name = p_row["TEAM_ABBREVIATION"]
                player.position = position
                updated_count += 1
            else:
                new_player = Player(
                    id=player_id,
                    full_name=p_row["DISPLAY_FIRST_LAST"],
                    is_active=p_row["ROSTERSTATUS"] == 1,
                    team_name=p_row["TEAM_ABBREVIATION"],
                    position=position,
                )
                db.add(new_player)
                added_count += 1
        
        db.commit()
        print(f"Sync completed. Added: {added_count}, Updated: {updated_count}")

    except Exception as e:
        print(f"An error occurred during player sync: {e}")
        db.rollback()
    finally:
        db.close()


def update_stats_for_active_players():
    """
    Aktualizacja fantasy points dla aktywnych zawodników.
    Pobiera statystyki wszystkich graczy z ostatniego dnia jednym zapytaniem.
    """
    print("Updating stats using single daily query...")
    db = SessionLocal()
    try:
        active_players = db.query(Player).options(joinedload(Player.game_stats), joinedload(Player.users)).filter(Player.is_active == True).all()
        if not active_players:
            print("No active players found.")
            return

        player_map = {p.id: p for p in active_players}
        player_ids = list(player_map.keys())
        total_players = len(player_ids)
        print(f"Active players: {total_players}")

        # Ustalamy datę ostatniego dnia (UTC)
        target_date = (datetime.utcnow() - timedelta(days=1)).strftime("%Y-%m-%d")
        print(f"Fetching games for {target_date}...")

        latest_games = fetch_latest_game_logs(player_ids, target_date)

        updated_count = 0

        for pid, latest_game in latest_games.items():
            if latest_game is None:
                continue

            player = player_map[pid]
            game_id = latest_game["GAME_ID"]

            # sprawdzamy czy gra już jest w DB
            existing_game = next((g for g in player.game_stats if g.game_id == game_id), None)
            if existing_game:
                continue

            points = int(latest_game["PTS"])
            rebounds = int(latest_game["REB"])
            assists = int(latest_game["AST"])
            fp = points + 1.2 * rebounds + 1.5 * assists

            new_game = PlayerGameStats(
                player_id=player.id,
                game_id=game_id,
                game_date=latest_game["GAME_DATE"],
                points=points,
                rebounds=rebounds,
                assists=assists,
                fantasy_points=fp
            )
            db.add(new_game)
            player.game_stats.append(new_game)

            # aktualizacja średnich FP
            total_fp = sum(stat.fantasy_points for stat in player.game_stats)
            player.average_fantasy_points = total_fp / len(player.game_stats)

            # aktualizacja punktów fantasy użytkowników
            for user in player.users:
                user.total_fantasy_points += fp
                print(f"      - Updating user {user.email}, new total FP: {user.total_fantasy_points:.2f}")

            updated_count += 1
            print(f"Updated {player.full_name} ({game_id}), avg FP: {player.average_fantasy_points:.2f}")

        db.commit()
        print(f"\nUpdated stats for {updated_count} games.")

    except Exception as e:
        print(f"Error during stats update: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    print("Initializing database...")
    create_tables()
    print("Database initialized.")

    args = sys.argv[1:]
    if not args:
        print("\n--- Running Full Sync (Players and Stats) ---")
        sync_all_players_from_api()
        update_stats_for_active_players()
    elif "sync" in args:
        print("\n--- Running Player Sync Only ---")
        sync_all_players_from_api()
    elif "stats" in args:
        print("\n--- Running Stats Update Only ---")
        update_stats_for_active_players()
    else:
        print(f"Invalid argument: {args[0]}")
        print("Usage: python fetch_nba_players.py [sync|stats]")

    print("\nScript finished.")
