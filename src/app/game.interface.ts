export enum GuessStatus {
  Wrong = 'x',
  Right = 'y',
  Partial = 'z',
  ActiveGuess = 'a',
  Empty = '_',
}

export interface GuessValue {
  value: string;
  status: GuessStatus;
}

export type Guess = [
  GuessValue,
  GuessValue,
  GuessValue,
  GuessValue,
  GuessValue
];

export interface Game {
  guesses: Guess[];
  date: string;
}
