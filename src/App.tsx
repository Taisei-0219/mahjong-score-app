import { useEffect, useState } from "react";
import "./App.css";

import { calculateResult } from "./utils/calculateResult";

import type { Player, ResultPlayer, SavedGame, SavedSession } from "./types";

import ScoreInput from "./components/ScoreInput";
import ResultCard from "./components/ResultCard";
import HistoryTable from "./components/HistoryTable";
import SessionList from "./components/SessionList";

const YEN_PER_POINT = 50;

const GAME_STORAGE_KEY = "mahjong-score-games";
const PLAYER_STORAGE_KEY = "mahjong-score-player-names";
const SESSION_STORAGE_KEY = "mahjong-score-sessions";

function App() {
  const [players, setPlayers] = useState<Player[]>(() => {
    const defaultPlayers: Player[] = [
      { id: 1, name: "プレイヤー1", scoreInput: "" },
      { id: 2, name: "プレイヤー2", scoreInput: "" },
      { id: 3, name: "プレイヤー3", scoreInput: "" },
      { id: 4, name: "プレイヤー4", scoreInput: "" },
    ];

    const savedNames = localStorage.getItem(PLAYER_STORAGE_KEY);

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
    const saved = localStorage.getItem(GAME_STORAGE_KEY);

    if (!saved) {
      return [];
    }

    try {
      return JSON.parse(saved);
    } catch {
      return [];
    }
  });

  const [sessions, setSessions] = useState<SavedSession[]>(() => {
    const saved = localStorage.getItem(SESSION_STORAGE_KEY);

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
    localStorage.setItem(GAME_STORAGE_KEY, JSON.stringify(games));
  }, [games]);

  useEffect(() => {
    const names = players.map((player) => player.name);

    localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(names));
  }, [players]);

  useEffect(() => {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessions));
  }, [sessions]);

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
              [field]: value,
            }
          : player,
      ),
    );

    setResults([]);
  };

  const scores = players.map((player) => ({
    ...player,
    score: Number(player.scoreInput || "0") * 100,
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
        scoreInput: "",
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

  const finishSession = () => {
    if (games.length === 0) {
      return;
    }

    const shouldSave = window.confirm(
      "今日の結果を保存して、現在の対局を終了しますか？",
    );

    if (!shouldSave) {
      return;
    }

    const newSession: SavedSession = {
      id: Date.now(),
      date: new Date().toISOString(),
      players: players.map((player) => ({
        id: player.id,
        name: player.name,
      })),
      games,
    };

    setSessions((currentSessions) => [...currentSessions, newSession]);

    setGames([]);
    setResults([]);

    setPlayers((currentPlayers) =>
      currentPlayers.map((player) => ({
        ...player,
        scoreInput: "",
      })),
    );
  };

  const deleteSession = (sessionId: number) => {
    const shouldDelete = window.confirm("この日の保存記録を削除しますか？");

    if (!shouldDelete) {
      return;
    }

    setSessions((currentSessions) =>
      currentSessions.filter((session) => session.id !== sessionId),
    );
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
        <HistoryTable
          players={players}
          games={games}
          totals={totals}
          onDeleteGame={deleteGame}
          onFinishSession={finishSession}
        />
      )}

      <SessionList sessions={sessions} onDeleteSession={deleteSession} />
    </main>
  );
}

export default App;
