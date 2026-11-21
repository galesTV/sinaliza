"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

/**
 * Cena 3D do Ato 1 — "Dentro do Gesto".
 *
 * A topologia real de 21 landmarks do MediaPipe Hands (referência
 * tecnológica, NÃO um sinal de Libras) é escalada ~4x e tombada para trás:
 * o punho vira a entrada, a palma o dossel, os dedos uma colonnada de
 * vigas de luz. A câmera entra no espaço em vez de observá-lo de fora.
 *
 * Single-canvas: a palavra monumental "GESTO" é um plano com CanvasTexture
 * dentro da cena — alphaTest + depthWrite dão oclusão real por fragmento
 * (as vigas passam na frente das letras, os vãos continuam transparentes).
 * Texto essencial permanece no DOM, sempre legível.
 *
 * Scroll nativo: o morph avança a câmera para dentro do corredor enquanto
 * os dedos endireitam em raios (demonstração preliminar do Ato 2).
 */

// Pose de mão aberta, topologia real do MediaPipe (x → direita, y → cima)
const BASE_POINTS: [number, number, number][] = [
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

const CONNECTIONS: [number, number][] = [
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

const TIPS = [4, 8, 12, 16, 20];
const AMBER_NODE = 12; // único acento quente — a luz que preside o dossel
const FINGERS = [
  [1, 2, 3, 4],
  [5, 6, 7, 8],
  [9, 10, 11, 12],
  [13, 14, 15, 16],
  [17, 18, 19, 20],
];

// Nós "eco": a rede que a estrutura alcança ao fundo do corredor (ato 2)
const ECHO_POINTS: [number, number, number][] = [
  [-4.4, 1.6, -0.6],
  [-3.6, 3.0, -1.0],
  [-2.0, 3.9, -0.4],
  [-0.4, 4.2, -1.2],
  [1.2, 3.9, -0.5],
  [2.9, 3.1, -0.9],
  [4.1, 1.9, -0.4],
  [3.4, -1.4, -1.1],
  [-3.9, -1.9, -0.8],
];

const TIP_ECHO_LINKS: [number, number][] = [
  [4, 0],
  [8, 1],
  [12, 3],
  [16, 5],
  [20, 6],
  [17, 8],
];
const ECHO_CHAIN: [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [4, 5],
  [5, 6],
  [8, 0],
];
const ECHO_CONNECTIONS = TIP_ECHO_LINKS.length + ECHO_CHAIN.length;

const COLORS = {
  node: 0xb9aef5,
  tip: 0x35c9e8,
  amber: 0xf0a848,
  edge: 0x8f83f2,
  echoEdge: 0x35c9e8,
};

const WORD = "GESTO";
const WORD_FONT = "Sora, Inter, system-ui, sans-serif";

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const smooth = (t: number) => t * t * (3 - 2 * t);
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));

function ConstellationFallback() {
  // Mesma topologia em 2D, para ambientes sem WebGL.
  const xs = BASE_POINTS.map((p) => p[0]);
  const ys = BASE_POINTS.map((p) => p[1]);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const px = (x: number) => 30 + ((x - minX) / (maxX - minX)) * 260;
  const py = (y: number) => 270 - ((y - minY) / (maxY - minY)) * 240;

  return (
    <svg
      viewBox="0 0 320 300"
      className="xp-fallback-figure"
      role="img"
      aria-label="Figura abstrata de pontos e conexões inspirada na topologia de 21 pontos do MediaPipe"
    >
      {CONNECTIONS.map(([a, b]) => (
        <line
          key={`${a}-${b}`}
          x1={px(BASE_POINTS[a][0])}
          y1={py(BASE_POINTS[a][1])}
          x2={px(BASE_POINTS[b][0])}
          y2={py(BASE_POINTS[b][1])}
          stroke="#8f83f2"
          strokeOpacity={0.4}
          strokeWidth={1.1}
        />
      ))}
      {BASE_POINTS.map((p, i) => (
        <circle
          key={i}
          cx={px(p[0])}
          cy={py(p[1])}
          r={i === AMBER_NODE ? 5 : TIPS.includes(i) ? 4 : 3}
          fill={
            i === AMBER_NODE ? "#f0a848" : TIPS.includes(i) ? "#35c9e8" : "#b9aef5"
          }
        />
      ))}
    </svg>
  );
}

export function ExperienceScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  // Componente client-only (ssr:false) — o initializer roda só no browser
  const [webglSupported] = useState(() => {
    try {
      const canvas = document.createElement("canvas");
      return Boolean(
        canvas.getContext("webgl2") ?? canvas.getContext("webgl"),
      );
    } catch {
      return false;
    }
  });
  const [webglFailed, setWebglFailed] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    const stage = container?.closest<HTMLElement>("[data-xp-stage]") ?? null;
    if (!container || !webglSupported) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      });
      if (!renderer.getContext()) throw new Error("no webgl context");
    } catch {
      // deferido: setState síncrono no effect dispara o lint react-hooks
      requestAnimationFrame(() => setWebglFailed(true));
      return;
    }

    const viewportW = container.clientWidth;
    const isCompact = viewportW < 760;
    const isTablet = viewportW >= 760 && viewportW < 1100;
    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio, isCompact ? 1.25 : 1.5),
    );
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const fog = new THREE.FogExp2(0x0b1122, 0.034); // o fundo do corredor some na névoa
    scene.fog = fog;
    const camera = new THREE.PerspectiveCamera(64, 1, 0.1, 120);

    const geometries: THREE.BufferGeometry[] = [];
    const materials: THREE.Material[] = [];
    const track = <T extends THREE.BufferGeometry>(g: T) => {
      geometries.push(g);
      return g;
    };
    const trackMat = <T extends THREE.Material>(m: T) => {
      materials.push(m);
      return m;
    };

    // ---------------------------------------------------------------
    // Geometria base — mesma malha, agora em escala arquitetônica
    // ---------------------------------------------------------------
    const center = new THREE.Vector3();
    BASE_POINTS.forEach((p) => center.add(new THREE.Vector3(...p)));
    center.divideScalar(BASE_POINTS.length);

    const poseA = BASE_POINTS.map((p) =>
      new THREE.Vector3(...p).sub(center).multiplyScalar(1.05),
    );

    // Estado 02 — os dedos endireitam em raios: o corredor que a câmera
    // atravessa no scroll (demonstração preliminar do Ato 2)
    const poseB = poseA.map((v, i) => {
      const out = v.clone().multiplyScalar(1.3);
      out.z += (i % 3) * 0.3 - 0.45;
      out.x += 0.2;
      return out;
    });
    FINGERS.forEach((chain) => {
      const root = poseA[chain[0]];
      const dir = poseA[chain[3]].clone().sub(root);
      const len = dir.length();
      dir.normalize();
      const rootB = poseB[chain[0]].clone();
      for (let k = 1; k < 4; k++) {
        const ray = rootB.clone().addScaledVector(dir, len * (k / 3) * 1.18);
        poseB[chain[k]].lerpVectors(poseB[chain[k]], ray, 0.75);
      }
    });

    // Estado 03 — a abertura: a estrutura expande radialmente para além
    // das bordas do quadro. Os fragmentos que sobram emolduram o espaço
    // onde o produto real assume o protagonismo (Ato 3)
    const poseC = poseB.map((v) => {
      const out = v.clone().multiplyScalar(1.95);
      out.z -= 0.6;
      return out;
    });

    // Estado 04 — o laboratório: a mesma topologia se recompõe em escala
    // menor, o "esqueleto de rastreamento" que anota o PoC real
    const poseD = poseA.map((v) => {
      const out = v.clone().multiplyScalar(0.3);
      out.x -= 0.7;
      out.y += 0.2;
      return out;
    });

    // Fragmentos de partida — convergem enquanto a câmera se aproxima
    const scatter = poseA.map((_, i) => {
      const a = i * 2.39996; // ângulo áureo — dispersão estável entre renders
      const r = 3.1 + ((i * 37) % 23) / 8;
      return new THREE.Vector3(
        Math.cos(a) * r,
        Math.sin(a) * r * 0.8 + 0.6,
        -2.2 + ((i * 53) % 17) / 5,
      );
    });

    const echoes = ECHO_POINTS.map(
      (p) => new THREE.Vector3(p[0] * 0.82, p[1] * 0.82, p[2]),
    );
    const echoCurrent = echoes.map((v) => v.clone());

    const nodeCount = poseA.length;
    const nodes = poseA.map((v) => v.clone());

    const group = new THREE.Group();
    scene.add(group);

    // ---------------------------------------------------------------
    // Nós — juntas de luz na estrutura; esferas nas pontas (presença física)
    // ---------------------------------------------------------------
    const nodePositions = new Float32Array(nodeCount * 3);
    const nodeColors = new Float32Array(nodeCount * 3);
    const cNode = new THREE.Color(COLORS.node);
    const cTip = new THREE.Color(COLORS.tip);
    const cAmber = new THREE.Color(COLORS.amber);
    for (let i = 0; i < nodeCount; i++) {
      const c = i === AMBER_NODE ? cAmber : TIPS.includes(i) ? cTip : cNode;
      c.toArray(nodeColors, i * 3);
    }
    const nodeGeo = track(new THREE.BufferGeometry());
    const nodeAttr = new THREE.BufferAttribute(nodePositions, 3);
    nodeAttr.setUsage(THREE.DynamicDrawUsage);
    nodeGeo.setAttribute("position", nodeAttr);
    nodeGeo.setAttribute("color", new THREE.BufferAttribute(nodeColors, 3));
    // sprite circular — sem ele, Points renderiza quadrados em escala
    // monumental e quebra a ilusão de "junta de luz"
    const dotCanvas = document.createElement("canvas");
    dotCanvas.width = 64;
    dotCanvas.height = 64;
    const dotCtx = dotCanvas.getContext("2d");
    if (dotCtx) {
      const g = dotCtx.createRadialGradient(32, 32, 0, 32, 32, 32);
      g.addColorStop(0, "rgba(255,255,255,1)");
      g.addColorStop(0.55, "rgba(255,255,255,0.85)");
      g.addColorStop(1, "rgba(255,255,255,0)");
      dotCtx.fillStyle = g;
      dotCtx.fillRect(0, 0, 64, 64);
    }
    const dotTexture = new THREE.CanvasTexture(dotCanvas);
    const nodeMat = trackMat(
      new THREE.PointsMaterial({
        size: 0.4,
        map: dotTexture,
        alphaTest: 0.05,
        vertexColors: true,
        transparent: true,
        opacity: 0.95,
        sizeAttenuation: true,
        depthWrite: false,
      }),
    );
    const nodePoints = new THREE.Points(nodeGeo, nodeMat);
    nodePoints.frustumCulled = false;
    group.add(nodePoints);

    // Pontas como juntas luminosas — os "capitéis" da colonnada
    const tipGeo = track(new THREE.IcosahedronGeometry(0.09, 1));
    const tipMeshes = TIPS.map((i) => {
      const mat = trackMat(
        new THREE.MeshBasicMaterial({
          color: i === AMBER_NODE ? COLORS.amber : COLORS.tip,
          transparent: true,
          opacity: 0.95,
        }),
      );
      const mesh = new THREE.Mesh(tipGeo, mat);
      group.add(mesh);
      return { mesh, index: i };
    });

    // Anel âmbar — pulso único no ponto mais alto do dossel
    const ringGeo = track(new THREE.RingGeometry(0.18, 0.2, 48));
    const ringMat = trackMat(
      new THREE.MeshBasicMaterial({
        color: COLORS.amber,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
    );
    const ring = new THREE.Mesh(ringGeo, ringMat);
    group.add(ring);

    // ---------------------------------------------------------------
    // Vigas — colunas de luz: cilindro cônico (base mais larga, como uma
    // coluna), textura de esmaecimento nas juntas e blending aditivo —
    // a interseção de duas vigas acumula luz em vez de cortar seco
    // ---------------------------------------------------------------
    const beamGeo = track(new THREE.CylinderGeometry(0.022, 0.048, 1, 10, 1, true));
    beamGeo.translate(0, 0.5, 0); // base em y=0 — a viga "cresce" de a→b
    const beamCanvas = document.createElement("canvas");
    beamCanvas.width = 8;
    beamCanvas.height = 128;
    const beamCtx = beamCanvas.getContext("2d");
    if (beamCtx) {
      const g = beamCtx.createLinearGradient(0, 0, 0, 128);
      g.addColorStop(0, "rgba(255,255,255,0)");
      g.addColorStop(0.14, "rgba(255,255,255,0.9)");
      g.addColorStop(0.86, "rgba(255,255,255,0.9)");
      g.addColorStop(1, "rgba(255,255,255,0)");
      beamCtx.fillStyle = g;
      beamCtx.fillRect(0, 0, 8, 128);
    }
    const beamTexture = new THREE.CanvasTexture(beamCanvas);
    const beamMat = trackMat(
      new THREE.MeshBasicMaterial({
        color: COLORS.edge,
        map: beamTexture,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    const beams = CONNECTIONS.map(() => {
      const mesh = new THREE.Mesh(beamGeo, beamMat);
      group.add(mesh);
      return mesh;
    });
    const UP = new THREE.Vector3(0, 1, 0);
    const beamDir = new THREE.Vector3();

    const echoEdgePositions = new Float32Array(ECHO_CONNECTIONS * 6);
    const echoEdgeAttr = new THREE.BufferAttribute(echoEdgePositions, 3);
    echoEdgeAttr.setUsage(THREE.DynamicDrawUsage);
    const echoEdgeGeo = track(new THREE.BufferGeometry());
    echoEdgeGeo.setAttribute("position", echoEdgeAttr);
    const echoEdgeMat = trackMat(
      new THREE.LineBasicMaterial({
        color: COLORS.echoEdge,
        transparent: true,
        opacity: 0,
      }),
    );
    const echoEdges = new THREE.LineSegments(echoEdgeGeo, echoEdgeMat);
    echoEdges.frustumCulled = false;
    group.add(echoEdges);

    const echoPositions = new Float32Array(echoes.length * 3);
    const echoAttr = new THREE.BufferAttribute(echoPositions, 3);
    echoAttr.setUsage(THREE.DynamicDrawUsage);
    const echoGeo = track(new THREE.BufferGeometry());
    echoGeo.setAttribute("position", echoAttr);
    const echoMat = trackMat(
      new THREE.PointsMaterial({
        color: COLORS.tip,
        size: 0.26,
        map: dotTexture,
        alphaTest: 0.05,
        transparent: true,
        opacity: 0,
        depthWrite: false,
      }),
    );
    const echoPoints = new THREE.Points(echoGeo, echoMat);
    echoPoints.frustumCulled = false;
    group.add(echoPoints);

    // ---------------------------------------------------------------
    // Chão — um único plano de gradiente para ancorar o espaço
    // (não é partícula decorativa: dá horizonte e recebe a luz da estrutura)
    // ---------------------------------------------------------------
    const floorCanvas = document.createElement("canvas");
    floorCanvas.width = 512;
    floorCanvas.height = 512;
    const floorCtx = floorCanvas.getContext("2d");
    if (floorCtx) {
      const g = floorCtx.createRadialGradient(256, 256, 0, 256, 256, 256);
      g.addColorStop(0, "rgba(105, 87, 232, 0.3)");
      g.addColorStop(0.45, "rgba(105, 87, 232, 0.12)");
      g.addColorStop(1, "rgba(105, 87, 232, 0)");
      floorCtx.fillStyle = g;
      floorCtx.fillRect(0, 0, 512, 512);
    }
    const floorTexture = new THREE.CanvasTexture(floorCanvas);
    const floorGeo = track(new THREE.CircleGeometry(52, 48));
    const floorMat = trackMat(
      new THREE.MeshBasicMaterial({
        map: floorTexture,
        transparent: true,
        opacity: 1,
        depthWrite: false,
        fog: false,
      }),
    );
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -2.6;
    scene.add(floor);

    // ---------------------------------------------------------------
    // Palavra monumental dentro da cena — oclusão real pelas vigas
    // alphaTest descarta os vãos (sem depth); depthWrite só nas letras
    // ---------------------------------------------------------------
    const wordCanvas = document.createElement("canvas");
    wordCanvas.width = 2048;
    wordCanvas.height = 512;
    const wordCtx = wordCanvas.getContext("2d");
    const wordTexture = new THREE.CanvasTexture(wordCanvas);
    wordTexture.colorSpace = THREE.SRGBColorSpace;
    const drawWord = () => {
      if (!wordCtx) return;
      wordCtx.clearRect(0, 0, 2048, 512);
      const grad = wordCtx.createLinearGradient(0, 60, 0, 470);
      grad.addColorStop(0, "#f4f6fc");
      grad.addColorStop(1, "#b9aef5");
      wordCtx.fillStyle = grad;
      wordCtx.font = `650 300px ${WORD_FONT}`;
      wordCtx.textAlign = "center";
      wordCtx.textBaseline = "middle";
      if ("letterSpacing" in wordCtx) {
        (wordCtx as CanvasRenderingContext2D & { letterSpacing: string })
          .letterSpacing = "-0.03em";
      }
      wordCtx.fillText(WORD, 1024, 268);
      wordTexture.needsUpdate = true;
    };
    drawWord();
    // redesenha quando a fonte display terminar de carregar
    document.fonts?.ready.then(drawWord).catch(() => undefined);

    const wordGeo = track(new THREE.PlaneGeometry(26, 6.5));
    const wordMat = trackMat(
      new THREE.MeshBasicMaterial({
        map: wordTexture,
        transparent: true,
        opacity: 0,
        depthWrite: true,
        alphaTest: 0.02,
        side: THREE.DoubleSide,
        fog: false, // a palavra é um letreiro luminoso — não some na névoa
      }),
    );
    const wordPlane = new THREE.Mesh(wordGeo, wordMat);
    wordPlane.position.set(4.0, 7.2, -12);
    wordPlane.rotation.y = 0.14;
    wordPlane.rotation.x = -0.05;
    scene.add(wordPlane);

    // ---------------------------------------------------------------
    // Estado da narrativa
    // ---------------------------------------------------------------
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let prefersReducedMotion = motionQuery.matches;
    let isInViewport = true;
    let isPageVisible = document.visibilityState === "visible";

    let entrance = prefersReducedMotion ? 1 : 0; // 0..1 (~3.4s)
    let morph = 0; // 0..1 scroll-driven
    let morphTarget = 0;

    const pointer = new THREE.Vector2();
    const pointerTarget = new THREE.Vector2();
    let elapsed = 0;

    const ENTRANCE_SECONDS = 3.4;

    // Escala arquitetônica + tombamento quase horizontal: o punho nasce
    // aos pés da câmera, a palma vira forro, os dedos sobem como uma
    // abóbada de vigas sobre a cabeça do visitante
    const ARCH_SCALE = isCompact ? 3.6 : isTablet ? 4.2 : 4.6;
    group.scale.setScalar(ARCH_SCALE);
    group.rotation.x = -0.62;
    group.rotation.y = 0.1;
    group.position.set(0, 2.4, -2.2);

    // Percurso da câmera: de fora (monumento distante) para o limiar
    // da abóbada — o punho passa sob os pés do visitante.
    // Mobile tem trajetória própria: câmera mais próxima e centralizada
    // para a colunata preencher o quadro vertical
    const camCurve = new THREE.CatmullRomCurve3(
      isCompact
        ? [
            new THREE.Vector3(1.2, 0.4, 19),
            new THREE.Vector3(0.5, -1.2, 10),
            new THREE.Vector3(0.0, -2.1, 5.6),
          ]
        : [
            new THREE.Vector3(2.6, 0.8, 22),
            new THREE.Vector3(1.0, -0.8, 13),
            new THREE.Vector3(-0.4, -2.2, 4.6),
          ],
    );
    const lookCurve = new THREE.CatmullRomCurve3(
      isCompact
        ? [
            new THREE.Vector3(0, 5.4, -14),
            new THREE.Vector3(0.2, 5.8, -7),
            new THREE.Vector3(0.3, 6.6, -7),
          ]
        : [
            new THREE.Vector3(0, 5.0, -14),
            new THREE.Vector3(0.4, 5.6, -7),
            new THREE.Vector3(0.8, 7.8, -7.2),
          ],
    );
    const camPos = new THREE.Vector3();
    const lookPos = new THREE.Vector3();

    const computeMorphTarget = () => {
      if (!stage) return;
      const rect = stage.getBoundingClientRect();
      const scrollable = rect.height - window.innerHeight;
      if (scrollable <= 0) {
        morphTarget = 0;
        return;
      }
      morphTarget = clamp01(-rect.top / scrollable);
    };

    const writeProgressVar = (p: number) => {
      stage?.style.setProperty("--xp", p.toFixed(4));
    };

    const tmp = new THREE.Vector3();

    const updateFrame = (dt: number) => {
      elapsed += dt;

      if (!prefersReducedMotion) {
        entrance = Math.min(1, entrance + dt / ENTRANCE_SECONDS);
        morph += (morphTarget - morph) * Math.min(1, dt * 5.5);
      } else {
        entrance = 1;
        morph = morphTarget;
      }
      const m = smooth(morph);
      // coreografia de atos: m1 = travessia Ato 1→2 (xp 0→0.55),
      // m2 = abertura Ato 2→3 (xp 0.6→0.9)
      const m1 = smooth(clamp01(m / 0.55));
      const m2 = smooth(clamp01((m - 0.6) / 0.3));
      // m3 = recomposição Ato 3→4 (xp 0.86→1): a malha volta como
      // esqueleto de laboratório enquanto o produto cede o palco
      const m3 = smooth(clamp01((m - 0.86) / 0.14));
      const idle = prefersReducedMotion ? 0 : 1;

      // Nós: scatter → poseA (entrada) → poseB (scroll)
      for (let i = 0; i < nodeCount; i++) {
        const nodeDelay = i * 0.045;
        const p = easeOutCubic(clamp01((entrance * 3.1 - nodeDelay) / 0.9));
        nodes[i].lerpVectors(scatter[i], poseA[i], p);

        if (m1 > 0) {
          nodes[i].lerp(poseB[i], m1);
        }
        if (m2 > 0) {
          nodes[i].lerp(poseC[i], m2);
        }
        if (m3 > 0) {
          nodes[i].lerp(poseD[i], m3);
        }

        if (!prefersReducedMotion && entrance >= 1) {
          nodes[i].x += Math.sin(elapsed * 0.7 + i * 1.7) * 0.014;
          nodes[i].y += Math.cos(elapsed * 0.55 + i * 1.3) * 0.014;
        }

        nodes[i].toArray(nodePositions, i * 3);
      }
      nodeAttr.needsUpdate = true;
      nodeMat.opacity = 0.95 * (1 - m2 * 0.6) + m3 * 0.35;

      tipMeshes.forEach(({ mesh, index }) => {
        mesh.position.copy(nodes[index]);
        mesh.visible = m2 < 0.7 || m3 > 0.3;
      });

      // Anel âmbar: pulso único no topo do dossel ao convergir
      const ringPhase = clamp01((entrance - 0.82) / 0.18);
      const ringExpand = easeOutCubic(ringPhase);
      ring.position.copy(nodes[AMBER_NODE]);
      ring.scale.setScalar(0.4 + ringExpand * 2.4);
      ringMat.opacity = m1 > 0.05 ? 0 : 0.45 * (1 - ringExpand);
      ring.lookAt(camera.position);

      // Vigas: crescem progressivamente (base → topo) e acompanham os nós
      const edgeDraw = prefersReducedMotion
        ? 1
        : clamp01((entrance - 0.45) / 0.5);
      for (let e = 0; e < CONNECTIONS.length; e++) {
        const [a, b] = CONNECTIONS[e];
        const pEdge = easeOutCubic(
          clamp01(edgeDraw * 1.6 - (e / CONNECTIONS.length) * 0.6),
        );
        tmp.lerpVectors(nodes[a], nodes[b], Math.max(pEdge, 0.0001));
        const beam = beams[e];
        beam.position.copy(nodes[a]);
        beamDir.subVectors(tmp, nodes[a]);
        const len = beamDir.length();
        beam.scale.y = len;
        beamDir.divideScalar(len || 1);
        beam.quaternion.setFromUnitVectors(UP, beamDir);
      }
      beamMat.opacity =
        edgeDraw * (0.78 - 0.2 * m1) * (1 - m2 * 0.72) +
        edgeDraw * m3 * 0.42;

      // Ecos do estado 02 — a rede lá no fundo do corredor
      for (let i = 0; i < echoes.length; i++) {
        echoCurrent[i].copy(echoes[i]);
        if (!prefersReducedMotion) {
          echoCurrent[i].y += Math.sin(elapsed * 0.5 + i) * 0.05;
        }
        echoCurrent[i].toArray(echoPositions, i * 3);
      }
      echoAttr.needsUpdate = true;
      echoMat.opacity = m1 * 0.9 * (1 - m2 * 0.55) + m3 * 0.55;

      for (let e = 0; e < TIP_ECHO_LINKS.length; e++) {
        const [a, b] = TIP_ECHO_LINKS[e];
        nodes[a].toArray(echoEdgePositions, e * 6);
        echoCurrent[b].toArray(echoEdgePositions, e * 6 + 3);
      }
      for (let e = 0; e < ECHO_CHAIN.length; e++) {
        const [a, b] = ECHO_CHAIN[e];
        const o = (TIP_ECHO_LINKS.length + e) * 6;
        echoCurrent[a].toArray(echoEdgePositions, o);
        echoCurrent[b].toArray(echoEdgePositions, o + 3);
      }
      echoEdgeAttr.needsUpdate = true;
      echoEdgeMat.opacity = m1 * 0.55 * (1 - m2 * 0.55) + m3 * 0.25;

      // Palavra monumental: aparece quando a câmera já está dentro e
      // dissolve durante a travessia do Ato 2
      wordMat.opacity = smooth(clamp01((entrance - 0.68) / 0.22)) * (1 - m1);
      wordPlane.position.y =
        7.2 + Math.sin(elapsed * 0.35) * 0.06 * idle + m1 * 1.8;

      // Ato 3: a névoa engole os restos da estrutura — o espaço abre;
      // Ato 4: ela recua um pouco para revelar o esqueleto do laboratório
      fog.density = 0.034 + m2 * 0.05 - m3 * 0.028;

      // Câmera: percurso de entrada + avanço do scroll + parallax
      pointer.lerp(pointerTarget, 0.05);
      const e = prefersReducedMotion
        ? 1
        : smooth(clamp01(entrance * 1.15));
      camCurve.getPoint(e, camPos);
      lookCurve.getPoint(e, lookPos);
      // scroll: a câmera atravessa a abóbada — as vigas dos dedos
      // passam pelas bordas do quadro enquanto o visitante avança
      camPos.z -= m1 * 8.0;
      camPos.y += m1 * 5.0;
      lookPos.z -= m1 * 9.0;
      lookPos.y += m1 * 2.2;
      // Ato 2→3: o visitante mergulha para dentro — a estrutura expande
      // para fora do quadro e a câmera atravessa o portal que ela abre
      camPos.z -= m2 * 7.0;
      camPos.y += m2 * 2.6;
      lookPos.z -= m2 * 8.5;
      lookPos.y += m2 * 1.4;
      // Ato 3→4: leve recuo — quem se move é o grupo (abaixo),
      // que desliza de volta para o corredor de visão como esqueleto
      // de laboratório flutuando à esquerda do quadro do PoC
      camPos.z += m3 * 2.0;
      lookPos.x -= m3 * 2.0;
      group.position.x = 0 - m3 * 3.6;
      group.position.y = 2.4 + m3 * 3.0;
      group.position.z = -2.2 - m3 * 14.0;
      // deriva suave de parallax
      camPos.x += pointer.x * 0.5;
      camPos.y += pointer.y * 0.35;
      lookPos.x += pointer.x * 0.9;
      camera.position.copy(camPos);
      camera.lookAt(lookPos);

      // a estrutura respira quase imperceptivelmente
      group.rotation.z = Math.sin(elapsed * 0.16) * 0.012 * idle;

      writeProgressVar(morph);
      renderer.render(scene, camera);
    };

    // ---------------------------------------------------------------
    // Loop, scroll, resize
    // ---------------------------------------------------------------
    let animationFrame: number | null = null;
    let lastTime = 0;

    const animate = (time: number) => {
      animationFrame = null;
      if (prefersReducedMotion) return; // render por evento
      const dt = Math.min(0.05, (time - lastTime) / 1000 || 0.016);
      lastTime = time;
      updateFrame(dt);
      if (isInViewport && isPageVisible) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    const renderOnce = () => {
      computeMorphTarget();
      updateFrame(0.016);
    };

    const syncAnimation = () => {
      if (prefersReducedMotion) {
        if (animationFrame !== null) {
          cancelAnimationFrame(animationFrame);
          animationFrame = null;
        }
        renderOnce();
        return;
      }
      if (animationFrame === null && isInViewport && isPageVisible) {
        lastTime = performance.now();
        animationFrame = requestAnimationFrame(animate);
      }
    };

    // morphTarget é recalculado só em eventos (scroll/resize), não por frame
    const onScroll = () => {
      computeMorphTarget();
      if (prefersReducedMotion) renderOnce();
    };

    const onPointerMove = (event: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      pointerTarget.set(
        (event.clientX - rect.left) / rect.width - 0.5,
        (event.clientY - rect.top) / rect.height - 0.5,
      );
    };
    const onPointerLeave = () => pointerTarget.set(0, 0);

    const resizeObserver = new ResizeObserver(() => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      if (!width || !height) return;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      computeMorphTarget();
      if (prefersReducedMotion) renderOnce();
    });
    resizeObserver.observe(container);

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        isInViewport = entry.isIntersecting;
        syncAnimation();
      },
      { threshold: 0.05 },
    );
    intersectionObserver.observe(container);

    const onVisibilityChange = () => {
      isPageVisible = document.visibilityState === "visible";
      syncAnimation();
    };
    const onMotionPreferenceChange = (event: MediaQueryListEvent) => {
      prefersReducedMotion = event.matches;
      syncAnimation();
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    motionQuery.addEventListener("change", onMotionPreferenceChange);
    window.addEventListener("scroll", onScroll, { passive: true });
    container.addEventListener("pointermove", onPointerMove);
    container.addEventListener("pointerleave", onPointerLeave);

    syncAnimation();

    return () => {
      if (animationFrame !== null) cancelAnimationFrame(animationFrame);
      intersectionObserver.disconnect();
      resizeObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      motionQuery.removeEventListener("change", onMotionPreferenceChange);
      window.removeEventListener("scroll", onScroll);
      container.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("pointerleave", onPointerLeave);
      wordTexture.dispose();
      floorTexture.dispose();
      dotTexture.dispose();
      beamTexture.dispose();
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      stage?.style.removeProperty("--xp");
    };
  }, [webglSupported]);

  return (
    <div ref={containerRef} className="xp-canvas" aria-hidden="true">
      {!webglSupported || webglFailed ? <ConstellationFallback /> : null}
    </div>
  );
}
