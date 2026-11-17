// Topologia MediaPipe Hands usada como referência de visão computacional.
// Não representa Libras nem um sinal.

export const LANDMARK_CONNECTIONS: [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [0, 5],
  [5, 6],
  [6, 7],
  [7, 8],
  [5, 9],
  [9, 10],
  [10, 11],
  [11, 12],
  [9, 13],
  [13, 14],
  [14, 15],
  [15, 16],
  [13, 17],
  [17, 18],
  [18, 19],
  [19, 20],
  [0, 17],
];

export const LANDMARK_TIPS = [4, 8, 12, 16, 20];
export const LANDMARK_AMBER = 12;

export const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
export const smooth = (value: number) => value * value * (3 - 2 * value);
