export type Player = {
  id: number;
  name: string;
  scoreInput: number;
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
