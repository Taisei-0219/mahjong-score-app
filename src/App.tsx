import { useEffect, useState } from "react";
import "./App.css";

type Player = {
  id: number;
  name: string;
  scoreInput: number;
};

type ResultPlayer = {
  id: number;
  name: string;
  score: number;
  point: number;
  yen: number;
};

type SavedGame = {
  id: number;
  createdAt: string;
  results: ResultPlayer[];
};

const START_SCORE = 25000;
const RETURN_SCORE = 30000;
const UMA_OKA = [50, 10, -10, -30];
const YEN_PER_POINT = 50;

const STORAGE_KEY = "mahjong-score-games";

function App() {
  const [players, setPlayers] = useState<Player[]>([
    { id: 1, name: "プレイヤー1", scoreInput: START_SCORE / 100 },
    { id: 2, name: "プレイヤー2", scoreInput: START_SCORE / 100 },
    { id: 3, name: "プレイヤー3", scoreInput: START_SCORE / 100 },
    { id: 4, name: "プレイヤー4", scoreInput: START_SCORE / 100 },
  ]);

  const [results, setResults] = useState<ResultPlayer[]>([]);
  const [games, setGames] = useState<SavedGame[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      setGames(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(games));
  }, [games]);

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
  };

  const scores = players.map((player) => ({
    ...player,
    score: player.scoreInput * 100,
  }));

  const totalScore = scores.reduce((sum, player) => sum + player.score, 0);

  const calculateResults = () => {
    const sorted = [...scores].sort((a, b) => b.score - a.score);

    const calculatedResults: ResultPlayer[] = [];

    let index = 0;

    while (index < sorted.length) {
      const currentScore = sorted[index].score;

      const sameScorePlayers = sorted.filter(
        (player) => player.score === currentScore,
      );

      const alreadyProcessed = calculatedResults.some(
        (result) => result.score === currentScore,
      );

      if (alreadyProcessed) {
        index += 1;
        continue;
      }

      const startRankIndex = index;
      const endRankIndex = index + sameScorePlayers.length - 1;

      const rankBonus =
        UMA_OKA.slice(startRankIndex, endRankIndex + 1).reduce(
          (sum, value) => sum + value,
          0,
        ) / sameScorePlayers.length;

      sameScorePlayers.forEach((player) => {
        const basePoint = (player.score - RETURN_SCORE) / 1000;
        const point = basePoint + rankBonus;

        calculatedResults.push({
          id: player.id,
          name: player.name,
          score: player.score,
          point,
          yen: Math.round(point * YEN_PER_POINT),
        });
      });

      index += sameScorePlayers.length;
    }

    calculatedResults.sort((a, b) => b.score - a.score);

    setResults(calculatedResults);
  };

  const saveGame = () => {
    if (results.length === 0) return;

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
    setGames((currentGames) =>
      currentGames.filter((game) => game.id !== gameId),
    );
  };

  const totals = players.map((player) => {
    const playerName = player.name;

    const point = games.reduce((sum, game) => {
      const result = game.results.find(
        (gamePlayer) => gamePlayer.name === playerName,
      );

      return sum + (result?.point ?? 0);
    }, 0);

    const yen = Math.round(point * YEN_PER_POINT);

    return {
      name: playerName,
      point,
      yen,
    };
  });

  return (
    <main className="app">
      <h1>🀄 麻雀スコア管理</h1>

      <section className="card">
        <h2>半荘結果</h2>

        <div className="player-list">
          {players.map((player) => (
            <div className="player-row" key={player.id}>
              <input
                className="name-input"
                type="text"
                value={player.name}
                onChange={(event) =>
                  updatePlayer(player.id, "name", event.target.value)
                }
              />

              <div className="score-area">
                <input
                  className="score-input"
                  type="number"
                  inputMode="numeric"
                  value={player.scoreInput}
                  step={1}
                  onChange={(event) =>
                    updatePlayer(player.id, "scoreInput", event.target.value)
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
          onClick={calculateResults}
          disabled={totalScore !== 100000}
        >
          計算する
        </button>
      </section>

      {results.length > 0 && (
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

          <button className="save-button" type="button" onClick={saveGame}>
            この半荘を保存
          </button>
        </section>
      )}

      {games.length > 0 && (
        <section className="card">
          <h2>今日の累計</h2>

          <div className="result-list">
            {[...totals]
              .sort((a, b) => b.point - a.point)
              .map((player, index) => (
                <div className="result-row" key={player.name}>
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
        </section>
      )}

      {games.length > 0 && (
        <section className="card">
          <h2>半荘履歴</h2>

          <div className="history-list">
            {[...games].reverse().map((game, gameIndex) => (
              <div className="history-card" key={game.id}>
                <div className="history-header">
                  <strong>第{games.length - gameIndex}半荘</strong>

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
