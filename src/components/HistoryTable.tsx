import { useRef } from "react";
import { toBlob } from "html-to-image";
import type { Player, SavedGame } from "../types";

type Total = {
  id: number;
  name: string;
  point: number;
  yen: number;
};

type Props = {
  players: Player[];
  games: SavedGame[];
  totals: Total[];
  onDeleteGame: (gameId: number) => void;
  onFinishSession: () => void;
};

export default function HistoryTable({
  players,
  games,
  totals,
  onDeleteGame,
  onFinishSession,
}: Props) {
  const tableRef = useRef<HTMLDivElement>(null);

  const handleShare = async () => {
    if (!tableRef.current) {
      return;
    }

    const blob = await toBlob(tableRef.current);

    if (!blob) {
      return;
    }

    const file = new File([blob], "mahjong-result.png", {
      type: "image/png",
    });

    if (
      navigator.share &&
      navigator.canShare?.({
        files: [file],
      })
    ) {
      await navigator.share({
        title: "麻雀結果",
        files: [file],
      });

      return;
    }

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "mahjong-result.png";
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <section className="card">
      <h2>半荘履歴</h2>

      <div className="history-table-wrapper" ref={tableRef}>
        <table className="history-table">
          <thead>
            <tr>
              <th></th>

              {players.map((player) => (
                <th key={player.id}>{player.name}</th>
              ))}

              <th></th>
            </tr>
          </thead>

          <tbody>
            {games.map((game, index) => (
              <tr key={game.id}>
                <td className="game-number">{index + 1}</td>

                {players.map((player) => {
                  const result = game.results.find(
                    (gameResult) => gameResult.id === player.id,
                  );

                  const point = result?.point ?? 0;

                  return (
                    <td
                      key={player.id}
                      className={point >= 0 ? "plus" : "minus"}
                    >
                      {point >= 0 ? "+" : ""}
                      {point.toFixed(1)}
                    </td>
                  );
                })}

                <td>
                  <button
                    className="delete-small"
                    type="button"
                    aria-label={`${index + 1}半荘目を削除`}
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
                const total = totals.find((item) => item.id === player.id);

                const point = total?.point ?? 0;

                return (
                  <td key={player.id} className={point >= 0 ? "plus" : "minus"}>
                    {point >= 0 ? "+" : ""}
                    {point.toFixed(1)}
                  </td>
                );
              })}

              <td></td>
            </tr>
          </tbody>
        </table>
      </div>

      <button className="share-button" type="button" onClick={handleShare}>
        📤 結果を画像で保存
      </button>

      <button
        className="finish-session-button"
        type="button"
        onClick={onFinishSession}
      >
        今日の対局を終了・保存
      </button>
    </section>
  );
}
