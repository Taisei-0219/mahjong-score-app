import type { Player, SavedGame } from "../types";

type Props = {
  players: Player[];
  games: SavedGame[];
  totals: {
    name: string;
    point: number;
    yen: number;
  }[];
  onDeleteGame: (gameId: number) => void;
};

export default function HistoryTable({
  players,
  games,
  totals,
  onDeleteGame,
}: Props) {
  return (
    <section className="card">
      <h2>半荘履歴</h2>

      <div className="history-table-wrapper">
        <table className="history-table">
          <thead>
            <tr>
              <th>半荘</th>

              {players.map((player) => (
                <th key={player.id}>{player.name}</th>
              ))}

              <th></th>
            </tr>
          </thead>

          <tbody>
            {[...games].map((game, index) => (
              <tr key={game.id}>
                <td>{index + 1}</td>

                {players.map((player) => {
                  const result = game.results.find(
                    (r) => r.name === player.name,
                  );

                  return (
                    <td
                      key={player.id}
                      className={(result?.point ?? 0) >= 0 ? "plus" : "minus"}
                    >
                      {(result?.point ?? 0) >= 0 ? "+" : ""}
                      {(result?.point ?? 0).toFixed(1)}
                    </td>
                  );
                })}

                <td>
                  <button
                    className="delete-small"
                    type="button"
                    onClick={() => onDeleteGame(game.id)}
                  >
                    ×
                  </button>
                </td>
              </tr>
            ))}

            <tr className="history-total">
              <td>合計</td>

              {players.map((player) => {
                const total = totals.find((t) => t.name === player.name);

                return (
                  <td
                    key={player.id}
                    className={(total?.point ?? 0) >= 0 ? "plus" : "minus"}
                  >
                    {(total?.point ?? 0) >= 0 ? "+" : ""}
                    {(total?.point ?? 0).toFixed(1)}
                  </td>
                );
              })}

              <td></td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
