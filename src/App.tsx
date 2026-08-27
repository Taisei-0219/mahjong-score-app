import { useEffect, useState } from "react";
import "./App.css";
import { calculateResult } from "./utils/calculateResult";
import type { Player, ResultPlayer, SavedGame } from "./types";
import ScoreInput from "./components/ScoreInput";
import ResultCard from "./components/ResultCard";

const START_SCORE = 25000;
const YEN_PER_POINT = 50;

const STORAGE_KEY = "mahjong-score-games";
const PLAYER_STORAGE_KEY = "mahjong-score-player-names";

function App() {
  const [players, setPlayers] = useState<Player[]>(() => {
    const savedNames = localStorage.getItem(PLAYER_STORAGE_KEY);

    const defaultPlayers: Player[] = [
      { id: 1, name: "プレイヤー1", scoreInput: START_SCORE / 100 },
      { id: 2, name: "プレイヤー2", scoreInput: START_SCORE / 100 },
      { id: 3, name: "プレイヤー3", scoreInput: START_SCORE / 100 },
      { id: 4, name: "プレイヤー4", scoreInput: START_SCORE / 100 },
    ];

    if (!savedNames) {
      return defaultPlayers;
    }

    try {
      const names: string[] = JSON.parse(savedNames);

      return defaultPlayers.map((player, index) => ({
        ...player,
        name: names[index] ?? player.name,
      }));
    } catch {
      return defaultPlayers;
    }
  });

  const [results, setResults] = useState<ResultPlayer[]>([]);
  const [games, setGames] = useState<SavedGame[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return [];
    }

    try {
      return JSON.parse(saved);
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(games));
  }, [games]);

  useEffect(() => {
    const names = players.map((player) => player.name);

    localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(names));
  }, [players]);

  const updatePlayer = (
    id: number,
    field: "name" | "scoreInput",
    value: string,
  ) => {
    setPlayers((currentPlayers) =>
      currentPlayers.map((player) =>
        player.id === id
          ? {
              ...player,
              [field]: field === "scoreInput" ? Number(value) : value,
            }
          : player,
      ),
    );

    setResults([]);
  };

  const scores = players.map((player) => ({
    ...player,
    score: player.scoreInput * 100,
  }));

  const totalScore = scores.reduce((sum, player) => sum + player.score, 0);

  const calculateResults = () => {
    if (totalScore !== 100000) {
      return;
    }

    setResults(calculateResult(players));
  };

  const saveGame = () => {
    if (results.length === 0) {
      return;
    }

    const newGame: SavedGame = {
      id: Date.now(),
      createdAt: new Date().toISOString(),
      results,
    };

    setGames((currentGames) => [...currentGames, newGame]);

    setResults([]);

    setPlayers((currentPlayers) =>
      currentPlayers.map((player) => ({
        ...player,
        scoreInput: START_SCORE / 100,
      })),
    );
  };

  const deleteGame = (gameId: number) => {
    const shouldDelete = window.confirm("この半荘の記録を削除しますか？");

    if (!shouldDelete) {
      return;
    }

    setGames((currentGames) =>
      currentGames.filter((game) => game.id !== gameId),
    );
  };

  const resetAllGames = () => {
    const shouldReset = window.confirm(
      "今日の半荘履歴と累計をすべて削除しますか？",
    );

    if (!shouldReset) {
      return;
    }

    setGames([]);
    setResults([]);
  };

  const totals = players.map((player) => {
    const point = games.reduce((sum, game) => {
      const result = game.results.find(
        (gamePlayer) => gamePlayer.id === player.id,
      );

      return sum + (result?.point ?? 0);
    }, 0);

    return {
      id: player.id,
      name: player.name,
      point,
      yen: Math.round(point * YEN_PER_POINT),
    };
  });

  return (
    <main className="app">
      <h1>🀄 麻雀スコア管理</h1>

      <ScoreInput
        players={players}
        totalScore={totalScore}
        onUpdatePlayer={updatePlayer}
        onCalculate={calculateResults}
      />

      <ResultCard results={results} onSaveGame={saveGame} />

      {games.length > 0 && (
        <section className="card">
          <h2>今日の累計</h2>

          <div className="result-list">
            {[...totals]
              .sort((a, b) => b.point - a.point)
              .map((player, index) => (
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

          <p className="game-count">半荘数：{games.length}</p>

          <button
            className="reset-button"
            type="button"
            onClick={resetAllGames}
          >
            今日の記録をリセット
          </button>
        </section>
      )}

      {games.length > 0 && (
        <section className="card">
          <h2>半荘履歴</h2>

          <div className="history-list">
            {[...games].reverse().map((game, gameIndex) => (
              <div className="history-card" key={game.id}>
                <div className="history-header">
                  <strong>
                    第{games.length - gameIndex}
                    半荘
                  </strong>

                  <button
                    className="delete-button"
                    type="button"
                    onClick={() => deleteGame(game.id)}
                  >
                    削除
                  </button>
                </div>

                <div className="history-results">
                  {game.results.map((player, index) => (
                    <div className="history-row" key={player.id}>
                      <span>
                        {index + 1}位 {player.name}
                      </span>

                      <span className={player.point >= 0 ? "plus" : "minus"}>
                        {player.point >= 0 ? "+" : ""}
                        {player.point.toFixed(1)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

export default App;
