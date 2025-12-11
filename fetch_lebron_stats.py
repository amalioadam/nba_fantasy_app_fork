
import sys
import os
from nba_api.stats.endpoints import playergamelog

# Add the backend directory to the Python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 'backend')))

from backend.models import Player, SessionLocal

def fetch_and_store_lebron_stats():
    """
    Fetches the latest game stats for LeBron James, calculates his fantasy points,
    and updates his record in the database.
    """
    db = SessionLocal()
    lebron_id = 1642883  # Player ID for LeBron James

    try:
        # Find LeBron James in the database
        lebron = db.query(Player).filter(Player.id == lebron_id).first()

        if not lebron:
            print(f"Player with ID {lebron_id} (LeBron James) not found in the database.")
            return

        print(f"Fetching latest stats for {lebron.full_name}...")

        # Fetch the game log for the 2023-24 season
        log = playergamelog.PlayerGameLog(player_id=lebron_id, season="2025-26").get_data_frames()[0]

        if not log.empty:
            # Get the most recent game's stats
            latest_game = log.iloc[0]
            points = int(latest_game["PTS"])
            rebounds = int(latest_game["REB"])
            assists = int(latest_game["AST"])

            # Calculate fantasy points
            fantasy_points = float(points + 1.2 * rebounds + 1.5 * assists)

            # Update the player's record
            lebron.points = points
            lebron.rebounds = rebounds
            lebron.assists = assists
            lebron.fantasy_points = fantasy_points

            db.commit()

            print("\nSuccessfully updated stats:")
            print(f"  - Points: {lebron.points}")
            print(f"  - Rebounds: {lebron.rebounds}")
            print(f"  - Assists: {lebron.assists}")
            print(f"  - Fantasy Points: {lebron.fantasy_points:.2f}")
        else:
            print("No game logs found for the 2023-24 season.")

    except Exception as e:
        print(f"An error occurred: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    fetch_and_store_lebron_stats()
