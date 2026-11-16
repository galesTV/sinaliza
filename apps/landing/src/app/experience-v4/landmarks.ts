// Topologia MediaPipe Hands usada como referência de visão computacional.
// Não representa Libras nem um sinal; é a malha interna dos estudos V4.

export const LANDMARK_POINTS: [number, number, number][] = [
  [0, -2.2, 0], // 0 pulso
  [-0.9, -1.5, 0.3], // 1-4 polegar
  [-1.55, -0.85, 0.45],
  [-2.0, -0.25, 0.5],
  [-2.35, 0.3, 0.5],
  [-0.8, 0.0, 0.1], // 5-8 indicador
  [-0.95, 0.9, 0.1],
  [-1.0, 1.5, 0.05],
  [-1.02, 2.05, 0],
  [-0.1, 0.1, 0.1], // 9-12 médio
  [-0.1, 1.15, 0.1],
  [-0.1, 1.85, 0.05],
  [-0.1, 2.5, 0],
  [0.6, 0.0, 0.05], // 13-16 anelar
  [0.72, 0.95, 0.05],
  [0.78, 1.6, 0],
  [0.82, 2.15, -0.02],
  [1.2, -0.3, 0], // 17-20 mínimo
  [1.5, 0.4, -0.02],
  [1.68, 0.9, -0.04],
  [1.82, 1.35, -0.06],
];

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
