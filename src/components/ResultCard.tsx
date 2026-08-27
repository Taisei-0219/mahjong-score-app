import type { ResultPlayer } from "../types";

type Props = {
  results: ResultPlayer[];
  onSaveGame: () => void;
};

export default function ResultCard({ results, onSaveGame }: Props) {
  if (results.length === 0) {
    return null;
  }

  return (
    <section className="card">
      <h2>計算結果</h2>

      <div className="result-list">
        {results.map((player, index) => (
          <div className="result-row" key={player.id}>
            <div className="result-name">
              <strong>{index + 1}位</strong>
              <span>{player.name}</span>
            </div>

            <div className="result-values">
              <span className={player.point >= 0 ? "plus" : "minus"}>
                {player.point >= 0 ? "+" : ""}
                {player.point.toFixed(1)}
              </span>

              <span>
                {player.yen >= 0 ? "+" : ""}
                {player.yen.toLocaleString()}円
              </span>
            </div>
          </div>
        ))}
      </div>

      <button className="save-button" type="button" onClick={onSaveGame}>
        この半荘を保存
      </button>
    </section>
  );
}
