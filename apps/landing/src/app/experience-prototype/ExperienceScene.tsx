"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

/**
 * Cena 3D do protótipo de experiência do hero.
 *
 * Estrutura articulada abstrata inspirada na topologia de 21 landmarks do
 * MediaPipe Hands — os mesmos pontos e conexões que a captura experimental
 * desenha (referência tecnológica, NÃO um sinal de Libras).
 *
 * Narrativa em dois estados, controlada pelo scroll nativo:
 *   01 — O gesto: fragmentos convergem e formam a estrutura (entrada).
 *   02 — A conexão: a estrutura se abre em uma rede maior; eco nodes surgem.
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
const AMBER_NODE = 12; // único acento quente da cena (MASTER.md §2)
const FINGERS = [
  [1, 2, 3, 4],
  [5, 6, 7, 8],
  [9, 10, 11, 12],
  [13, 14, 15, 16],
  [17, 18, 19, 20],
];

// Nós "eco": a rede que a estrutura alcança no estado 02
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

// landmark → eco mais próximo, e cadeia de ecos (índices separados)
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
  particle: 0x8174f5,
};

// Traço do símbolo Sinaliza (public/brand/sinaliza-simbolo.svg):
// a mesma curva S, amostrada e desenhada em 3D — a convergência revela a marca.
const BRAND_PATH: [number, number, number, number, number, number, number, number][] = [
  [390, 126, 350, 82, 270, 76, 205, 105],
  [205, 105, 145, 132, 111, 181, 130, 225],
  [130, 225, 151, 273, 231, 279, 302, 253],
  [302, 253, 370, 228, 410, 253, 390, 302],
  [390, 302, 371, 348, 306, 384, 239, 387],
  [239, 387, 191, 389, 151, 372, 126, 343],
];
const BRAND_DOTS: [number, number][] = [
  [414, 112],
  [105, 365],
];
const BRAND_SCALE = 2.4 / 313; // altura do traço (~313 unidades SVG) → ~2.4 unidades de mundo
const svgToWorld = (x: number, y: number) =>
  new THREE.Vector3((x - 256) * BRAND_SCALE, (256 - y) * BRAND_SCALE, 0);

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
      Math.min(window.devicePixelRatio, isCompact ? 1.5 : 1.75),
    );
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);

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
    // Geometria base
    // ---------------------------------------------------------------
    const center = new THREE.Vector3();
    BASE_POINTS.forEach((p) => center.add(new THREE.Vector3(...p)));
    center.divideScalar(BASE_POINTS.length);

    const poseA = BASE_POINTS.map((p) =>
      new THREE.Vector3(...p).sub(center).multiplyScalar(1.05),
    );

    // Estado 02 — a estrutura vira "sinal": cada dedo endireita num raio
    // que parte da palma, e a rede de ecos o recebe em arco acima.
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

    // Pontos de partida: fragmentos dispersos (determinístico por índice)
    const scatter = poseA.map((_, i) => {
      const a = i * 2.39996; // ângulo áureo — dispersão estável entre renders
      const r = 2.6 + ((i * 37) % 23) / 9;
      return new THREE.Vector3(
        Math.cos(a) * r,
        Math.sin(a) * r * 0.8 + 0.6,
        -1.5 + ((i * 53) % 17) / 6,
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
    // Nós — Points para a malha, esferas pequenas nas pontas (profundidade)
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
    const nodeMat = trackMat(
      new THREE.PointsMaterial({
        size: isCompact ? 0.085 : 0.1,
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

    // Pontas como esferas pequenas — presença física no meio dos pontos
    const tipGeo = track(new THREE.IcosahedronGeometry(0.075, 1));
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

    // -------------------------------------------------------------
    // Traço da marca Sinaliza — desenhado pela convergência (o clímax)
    // -------------------------------------------------------------
    const brandCurve = new THREE.CurvePath<THREE.Vector3>();
    BRAND_PATH.forEach(([x0, y0, x1, y1, x2, y2, x3, y3]) => {
      brandCurve.add(
        new THREE.CubicBezierCurve3(
          svgToWorld(x0, y0),
          svgToWorld(x1, y1),
          svgToWorld(x2, y2),
          svgToWorld(x3, y3),
        ),
      );
    });

    const TUBE_SEGS = 72;
    const TUBE_RADIAL = 6;
    const brandGeo = track(
      new THREE.TubeGeometry(brandCurve, TUBE_SEGS, 0.03, TUBE_RADIAL, false),
    );
    // gradiente da marca ao longo do traço (ciano → azul → violeta)
    const brandColors = new Float32Array(brandGeo.attributes.position.count * 3);
    const brandStops = [
      new THREE.Color(0x35c9e8),
      new THREE.Color(0x287deb),
      new THREE.Color(0x6957e8),
    ];
    const tmpColor = new THREE.Color();
    const ringVerts = TUBE_RADIAL + 1;
    for (let s = 0; s <= TUBE_SEGS; s++) {
      const t = s / TUBE_SEGS;
      if (t <= 0.52) tmpColor.lerpColors(brandStops[0], brandStops[1], t / 0.52);
      else tmpColor.lerpColors(brandStops[1], brandStops[2], (t - 0.52) / 0.48);
      for (let r = 0; r < ringVerts; r++) {
        tmpColor.toArray(brandColors, (s * ringVerts + r) * 3);
      }
    }
    brandGeo.setAttribute("color", new THREE.BufferAttribute(brandColors, 3));
    brandGeo.setDrawRange(0, 0);
    const brandMat = trackMat(
      new THREE.MeshBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.95,
      }),
    );
    const brandMesh = new THREE.Mesh(brandGeo, brandMat);
    brandMesh.frustumCulled = false;

    const brandGroup = new THREE.Group();
    brandGroup.add(brandMesh);

    // Pontos terminais do símbolo — os dois "sinais" ciano da marca
    const dotGeo = track(new THREE.IcosahedronGeometry(0.1, 1));
    const dotMat = trackMat(
      new THREE.MeshBasicMaterial({
        color: COLORS.tip,
        transparent: true,
        opacity: 0,
      }),
    );
    BRAND_DOTS.forEach(([dx, dy]) => {
      const dot = new THREE.Mesh(dotGeo, dotMat);
      dot.position.copy(svgToWorld(dx, dy));
      brandGroup.add(dot);
    });

    brandGroup.position.set(0.08, -0.35, 0.45);
    brandGroup.scale.setScalar(0.9);
    group.add(brandGroup);

    // Anel âmbar — pulso único quando a estrutura converge
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
    // Arestas — topologia (estado 01) e rede de ecos (estado 02)
    // ---------------------------------------------------------------
    const edgePositions = new Float32Array(CONNECTIONS.length * 6);
    const edgeAttr = new THREE.BufferAttribute(edgePositions, 3);
    edgeAttr.setUsage(THREE.DynamicDrawUsage);
    const edgeGeo = track(new THREE.BufferGeometry());
    edgeGeo.setAttribute("position", edgeAttr);
    const edgeMat = trackMat(
      new THREE.LineBasicMaterial({
        color: COLORS.edge,
        transparent: true,
        opacity: 0,
      }),
    );
    const edges = new THREE.LineSegments(edgeGeo, edgeMat);
    edges.frustumCulled = false;
    group.add(edges);

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

    // Pontos eco (aparecem só no estado 02)
    const echoPositions = new Float32Array(echoes.length * 3);
    const echoAttr = new THREE.BufferAttribute(echoPositions, 3);
    echoAttr.setUsage(THREE.DynamicDrawUsage);
    const echoGeo = track(new THREE.BufferGeometry());
    echoGeo.setAttribute("position", echoAttr);
    const echoMat = trackMat(
      new THREE.PointsMaterial({
        color: COLORS.tip,
        size: 0.08,
        transparent: true,
        opacity: 0,
        depthWrite: false,
      }),
    );
    const echoPoints = new THREE.Points(echoGeo, echoMat);
    echoPoints.frustumCulled = false;
    group.add(echoPoints);

    // ---------------------------------------------------------------
    // Partículas de fundo — profundidade contida, não protagonistas
    // ---------------------------------------------------------------
    const particlePositions = new Float32Array((isCompact ? 110 : 220) * 3);
    for (let i = 0; i < particlePositions.length; i += 3) {
      const a = Math.random() * Math.PI * 2;
      const r = 3.2 + Math.random() * 4.5;
      particlePositions[i] = Math.cos(a) * r;
      particlePositions[i + 1] = Math.sin(a) * r * 0.7;
      particlePositions[i + 2] = -2.5 + Math.random() * 3.5;
    }
    const particleGeo = track(new THREE.BufferGeometry());
    particleGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(particlePositions, 3),
    );
    const particles = new THREE.Points(
      particleGeo,
      trackMat(
        new THREE.PointsMaterial({
          color: COLORS.particle,
          size: 0.035,
          transparent: true,
          opacity: 0.55,
          depthWrite: false,
        }),
      ),
    );
    scene.add(particles);

    // ---------------------------------------------------------------
    // Estado da narrativa
    // ---------------------------------------------------------------
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let prefersReducedMotion = motionQuery.matches;
    let isInViewport = true;
    let isPageVisible = document.visibilityState === "visible";

    let entrance = prefersReducedMotion ? 1 : 0; // 0..1 (~2.6s)
    let morph = 0; // 0..1 scroll-driven
    let morphTarget = 0;

    const pointer = new THREE.Vector2();
    const pointerTarget = new THREE.Vector2();
    let elapsed = 0;

    const ENTRANCE_SECONDS = 2.6;

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

      // Nós: scatter → poseA (entrada) → poseB (scroll)
      for (let i = 0; i < nodeCount; i++) {
        const nodeDelay = i * 0.045;
        const p = easeOutCubic(
          clamp01((entrance * 3.1 - nodeDelay) / 0.9),
        );
        nodes[i].lerpVectors(scatter[i], poseA[i], p);

        if (m > 0) {
          nodes[i].lerp(poseB[i], m);
        }

        // respiração sutil — desligada com reduced-motion
        if (!prefersReducedMotion && entrance >= 1) {
          nodes[i].x += Math.sin(elapsed * 0.7 + i * 1.7) * 0.014;
          nodes[i].y += Math.cos(elapsed * 0.55 + i * 1.3) * 0.014;
        }

        nodes[i].toArray(nodePositions, i * 3);
      }
      nodeAttr.needsUpdate = true;

      tipMeshes.forEach(({ mesh, index }) => mesh.position.copy(nodes[index]));

      // Anel âmbar: pulso único ao convergir, depois acompanha o nó 12
      const ringPhase = clamp01((entrance - 0.82) / 0.18);
      const ringExpand = easeOutCubic(ringPhase);
      ring.position.copy(nodes[AMBER_NODE]);
      ring.scale.setScalar(0.4 + ringExpand * 2.4);
      ringMat.opacity = m > 0.05 ? 0 : 0.45 * (1 - ringExpand);
      ring.lookAt(camera.position);

      // Arestas da topologia: desenho progressivo + acompanham os nós
      const edgeDraw = prefersReducedMotion
        ? 1
        : clamp01((entrance - 0.45) / 0.5);
      for (let e = 0; e < CONNECTIONS.length; e++) {
        const [a, b] = CONNECTIONS[e];
        const pEdge = easeOutCubic(
          clamp01(edgeDraw * 1.6 - (e / CONNECTIONS.length) * 0.6),
        );
        tmp.lerpVectors(nodes[a], nodes[b], pEdge);
        nodes[a].toArray(edgePositions, e * 6);
        tmp.toArray(edgePositions, e * 6 + 3);
      }
      edgeAttr.needsUpdate = true;
      edgeMat.opacity = edgeDraw * (0.72 - 0.3 * m);

      // Traço da marca: desenhado no clímax da convergência, permanece
      // como identidade no estado 01 e persiste no centro do estado 02
      const brandDraw = easeOutCubic(clamp01((entrance - 0.72) / 0.26));
      brandGeo.setDrawRange(
        0,
        Math.floor(brandDraw * brandGeo.index!.count),
      );
      dotMat.opacity = clamp01((entrance - 0.96) / 0.04);
      brandGroup.position.z = 0.45 + m * 0.35;
      brandGroup.scale.setScalar(0.9 * (1 - m * 0.18));
      brandMat.opacity = 0.95 - m * 0.2;

      // Ecos do estado 02
      for (let i = 0; i < echoes.length; i++) {
        echoCurrent[i].copy(echoes[i]);
        if (!prefersReducedMotion) {
          echoCurrent[i].y += Math.sin(elapsed * 0.5 + i) * 0.05;
        }
        echoCurrent[i].toArray(echoPositions, i * 3);
      }
      echoAttr.needsUpdate = true;
      echoMat.opacity = m * 0.9;

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
      echoEdgeMat.opacity = m * 0.55;

      // Câmera e grupo
      pointer.lerp(pointerTarget, 0.06);
      const idle = prefersReducedMotion ? 0 : 1;

      group.rotation.y =
        -0.22 +
        Math.sin(elapsed * 0.22) * 0.06 * idle +
        pointer.x * 0.35 * (1 - m) +
        m * 0.7;
      group.rotation.x =
        -0.08 + pointer.y * 0.18 * (1 - m) - m * 0.18;
      group.position.x = 0.9 - m * 0.55;
      group.position.y =
        0.32 + m * 0.28 + Math.sin(elapsed * 0.4) * 0.05 * idle;
      group.scale.setScalar(isCompact ? 0.52 : isTablet ? 0.58 : 0.68);
      if (isTablet) group.position.x += 0.35;

      // dolly cinematográfico: a câmera se aproxima durante o clímax da
      // convergência e fica mais próxima até o scroll começar
      const dolly = smooth(clamp01((entrance - 0.8) / 0.2)) * 0.55;
      camera.position.set(
        0.15 + m * -0.3,
        0.15 + m * 0.5,
        7.4 - dolly + m * 2.3,
      );
      camera.lookAt(0.2, 0.3, 0);

      particles.rotation.z = elapsed * 0.012 * idle;
      particles.rotation.y = elapsed * 0.02 * idle + m * 0.3;

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
