import type { Player, ResultPlayer } from "../types";

const RETURN_SCORE = 30000;
const UMA_OKA = [50, 10, -10, -30];
const YEN_PER_POINT = 50;

export function calculateResult(players: Player[]): ResultPlayer[] {
  const scores = players.map((player) => ({
    ...player,
    score: player.scoreInput * 100,
  }));

  const sorted = [...scores].sort((a, b) => b.score - a.score);

  const results: ResultPlayer[] = [];

  let index = 0;

  while (index < sorted.length) {
    const currentScore = sorted[index].score;

    const samePlayers = sorted.filter(
      (player) => player.score === currentScore,
    );

    const rankBonus =
      UMA_OKA.slice(index, index + samePlayers.length).reduce(
        (sum, value) => sum + value,
        0,
      ) / samePlayers.length;

    samePlayers.forEach((player) => {
      const point = (player.score - RETURN_SCORE) / 1000 + rankBonus;

      results.push({
        id: player.id,
        name: player.name,
        score: player.score,
        point,
        yen: Math.round(point * YEN_PER_POINT),
      });
    });

    index += samePlayers.length;
  }

  return results.sort((a, b) => b.score - a.score);
}
