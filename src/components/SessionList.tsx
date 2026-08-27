import type { SavedSession } from "../types";

type Props = {
  sessions: SavedSession[];
  onDeleteSession: (sessionId: number) => void;
};

export default function SessionList({ sessions, onDeleteSession }: Props) {
  if (sessions.length === 0) {
    return null;
  }

  return (
    <section className="card">
      <h2>過去の対局</h2>

      <div className="session-list">
        {[...sessions].reverse().map((session) => {
          const date = new Date(session.date).toLocaleDateString("ja-JP");

          const totals = session.players.map((player) => {
            const point = session.games.reduce((sum, game) => {
              const result = game.results.find(
                (gameResult) => gameResult.id === player.id,
              );

              return sum + (result?.point ?? 0);
            }, 0);

            return {
              ...player,
              point,
            };
          });

          return (
            <div className="session-card" key={session.id}>
              <div className="session-header">
                <div>
                  <strong>{date}</strong>
                  <span>{session.games.length}半荘</span>
                </div>

                <button
                  type="button"
                  className="delete-session-button"
                  onClick={() => onDeleteSession(session.id)}
                >
                  削除
                </button>
              </div>

              <div className="session-summary">
                {totals.map((player) => (
                  <div className="session-player" key={player.id}>
                    <span>{player.name}</span>

                    <strong className={player.point >= 0 ? "plus" : "minus"}>
                      {player.point >= 0 ? "+" : ""}
                      {player.point.toFixed(1)}
                    </strong>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
