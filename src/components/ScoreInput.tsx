import type { Player } from "../types";

type Props = {
  players: Player[];
  totalScore: number;
  onUpdatePlayer: (
    id: number,
    field: "name" | "scoreInput",
    value: string,
  ) => void;
  onCalculate: () => void;
};

export default function ScoreInput({
  players,
  totalScore,
  onUpdatePlayer,
  onCalculate,
}: Props) {
  return (
    <section className="card">
      <h2>半荘結果</h2>

      <div className="player-list">
        {players.map((player) => (
          <div className="player-row" key={player.id}>
            <input
              className="name-input"
              type="text"
              value={player.name}
              onChange={(e) =>
                onUpdatePlayer(player.id, "name", e.target.value)
              }
            />

            <div className="score-area">
              <input
                className="score-input"
                type="number"
                inputMode="numeric"
                value={player.scoreInput}
                step={1}
                onChange={(e) =>
                  onUpdatePlayer(player.id, "scoreInput", e.target.value)
                }
              />

              <span>00点</span>
            </div>
          </div>
        ))}
      </div>

      <p className="score-hint">例：423 → 42,300点</p>

      <div
        className={
          totalScore === 100000 ? "total-score valid" : "total-score invalid"
        }
      >
        合計：{totalScore.toLocaleString()}点
      </div>

      <button
        type="button"
        onClick={onCalculate}
        disabled={totalScore !== 100000}
      >
        計算する
      </button>
    </section>
  );
}
