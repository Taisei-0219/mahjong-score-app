export type Player = {
  id: number;
  name: string;
  scoreInput: string;
};

export type ResultPlayer = {
  id: number;
  name: string;
  score: number;
  point: number;
  yen: number;
};

export type SavedGame = {
  id: number;
  createdAt: string;
  results: ResultPlayer[];
};

export type SessionPlayer = {
  id: number;
  name: string;
};

export type SavedSession = {
  id: number;
  date: string;
  players: SessionPlayer[];
  games: SavedGame[];
};
