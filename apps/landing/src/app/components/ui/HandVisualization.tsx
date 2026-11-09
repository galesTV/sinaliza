"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * Mão 3D low-poly no estilo do MediaPipe Hands.
 *
 * - 21 landmarks com a numeração oficial (0 = pulso, 4/8/12/16/20 = pontas)
 * - Conexões idênticas às do MediaPipe (HAND_CONNECTIONS)
 * - Pele low-poly triangulada (dedos + palma), ossos finos por dentro e
 *   juntas coloridas por dedo, com nós brilhando em cada vértice da malha
 * - Os dedos "respiram" (curl suave) e a mão acompanha o ponteiro
 */

// Pose de mão aberta, em unidades arbitrárias (x → direita, y → cima, z → câmera)
const BASE_POINTS: [number, number, number][] = [
  [0, -2.2, 0], // 0  Pulso

  [-0.9, -1.5, 0.3], // 1  Polegar CMC
  [-1.55, -0.85, 0.45], // 2  Polegar MCP
  [-2.0, -0.25, 0.5], // 3  Polegar IP
  [-2.35, 0.3, 0.5], // 4  Polegar ponta

  [-0.8, 0.0, 0.1], // 5  Indicador MCP
  [-0.95, 0.9, 0.1], // 6  Indicador PIP
  [-1.0, 1.5, 0.05], // 7  Indicador DIP
  [-1.02, 2.05, 0], // 8  Indicador ponta

  [-0.1, 0.1, 0.1], // 9  Médio MCP
  [-0.1, 1.15, 0.1], // 10 Médio PIP
  [-0.1, 1.85, 0.05], // 11 Médio DIP
  [-0.1, 2.5, 0], // 12 Médio ponta

  [0.6, 0.0, 0.05], // 13 Anelar MCP
  [0.72, 0.95, 0.05], // 14 Anelar PIP
  [0.78, 1.6, 0], // 15 Anelar DIP
  [0.82, 2.15, -0.02], // 16 Anelar ponta

  [1.2, -0.3, 0], // 17 Mínimo MCP
  [1.5, 0.4, -0.02], // 18 Mínimo PIP
  [1.68, 0.9, -0.04], // 19 Mínimo DIP
  [1.82, 1.35, -0.06], // 20 Mínimo ponta
];

// Mesmas conexões do MediaPipe (repare que NÃO existem 0-9, 0-13 nem 1-5)
const CONNECTIONS: [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4], // polegar
  [0, 5],
  [5, 6],
  [6, 7],
  [7, 8], // indicador
  [5, 9],
  [9, 10],
  [10, 11],
  [11, 12], // médio
  [9, 13],
  [13, 14],
  [14, 15],
  [15, 16], // anelar
  [13, 17],
  [17, 18],
  [18, 19],
  [19, 20], // mínimo
  [0, 17], // fecha a palma
];

const PALM_INDICES = [0, 1, 5, 9, 13, 17];
const TIP_INDICES = [4, 8, 12, 16, 20];

// Dedos que flexionam (MCP → ponta). O polegar fica fixo.
const CURLING_FINGERS = [
  [5, 6, 7, 8],
  [9, 10, 11, 12],
  [13, 14, 15, 16],
  [17, 18, 19, 20],
];

// Cor de cada landmark, agrupada por dedo
const FINGER_COLORS: Record<number, number> = {};
const colorGroups: [number[], number][] = [
  [[0], 0xe0f7fa],
  [[1, 2, 3, 4], 0x4dd0e1],
  [[5, 6, 7, 8], 0x8174f5],
  [[9, 10, 11, 12], 0x6ea8ff],
  [[13, 14, 15, 16], 0x35c9e8],
  [[17, 18, 19, 20], 0xb48cff],
];
colorGroups.forEach(([ids, color]) =>
  ids.forEach((id) => (FINGER_COLORS[id] = color)),
);

export function HandVisualization() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(0, 0, 7);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

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

    // ------------------------------------------------------------------
    // Iluminação
    // ------------------------------------------------------------------
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(4, 5, 6);
    scene.add(dirLight);

    const violetLight = new THREE.PointLight(0x6957e8, 25, 15);
    violetLight.position.set(-3, 2, 4);
    scene.add(violetLight);

    const cyanLight = new THREE.PointLight(0x35c9e8, 25, 15);
    cyanLight.position.set(3, -1, 3);
    scene.add(cyanLight);

    // ------------------------------------------------------------------
    // Materiais (metalness baixo: sem envMap, metal puro fica escuro e
    // gera aqueles reflexos estourados em faces isoladas)
    // ------------------------------------------------------------------
    const boneMaterial = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x2a3f9e,
        emissive: 0x13236e,
        emissiveIntensity: 0.8,
        roughness: 0.45,
        metalness: 0.1,
        flatShading: true,
        transparent: true,
        opacity: 0.92,
      }),
    );

    // Pele: faces planas translúcidas (o "volume" da mão)
    const skinMaterial = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x3350d8,
        emissive: 0x172a8a,
        emissiveIntensity: 0.7,
        roughness: 0.5,
        metalness: 0.1,
        flatShading: true,
        transparent: true,
        opacity: 0.32,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
    );

    // Rede de linhas que triangula a pele
    const skinLineMaterial = trackMat(
      new THREE.LineBasicMaterial({
        color: 0x6fd8ff,
        transparent: true,
        opacity: 0.5,
      }),
    );

    // Nós brilhantes em cada vértice da malha
    const nodeMaterial = trackMat(
      new THREE.PointsMaterial({
        color: 0xbdeeff,
        size: 0.11,
        transparent: true,
        opacity: 0.9,
        depthWrite: false,
      }),
    );

    // ------------------------------------------------------------------
    // Estado dos pontos (centralizados no próprio grupo)
    // ------------------------------------------------------------------
    const center = new THREE.Vector3();
    BASE_POINTS.forEach((p) => center.add(new THREE.Vector3(...p)));
    center.divideScalar(BASE_POINTS.length);

    const basePts = BASE_POINTS.map((p) => new THREE.Vector3(...p).sub(center));
    const pts = basePts.map((p) => p.clone());

    const handGroup = new THREE.Group();
    scene.add(handGroup);

    // ------------------------------------------------------------------
    // Pele low-poly: malha triangulada que envolve palma e dedos.
    // Todos os vértices vivem num único buffer compartilhado por três
    // objetos: faces (Mesh), arestas (LineSegments) e nós (Points).
    // ------------------------------------------------------------------
    const skinVerts: THREE.Vector3[] = [];
    const skinUpdaters: (() => void)[] = [];
    const tris: [number, number, number][] = [];

    const addVertex = () => skinVerts.push(new THREE.Vector3()) - 1;
    const addQuad = (a: number, b: number, c: number, d: number) => {
      tris.push([a, b, c], [a, c, d]);
    };

    // 1) Um vértice por landmark: índices 0..20 coincidem com o MediaPipe
    pts.forEach(() => addVertex());
    skinUpdaters.push(() => pts.forEach((p, i) => skinVerts[i].copy(p)));

    // 2) Palma com volume: frente e verso (centro + hexágono interno)
    const PALM_RING = [0, 1, 5, 9, 13, 17];
    [1, -1].forEach((sign) => {
      const center = addVertex();
      const inner = PALM_RING.map(() => addVertex());

      skinUpdaters.push(() => {
        skinVerts[center].set(0, 0, 0);
        PALM_RING.forEach((i) => skinVerts[center].add(pts[i]));
        skinVerts[center].divideScalar(PALM_RING.length);
        skinVerts[center].z += 0.14 * sign;
        PALM_RING.forEach((lm, k) =>
          skinVerts[inner[k]].lerpVectors(skinVerts[center], pts[lm], 0.55),
        );
      });

      PALM_RING.forEach((lm, k) => {
        const n = (k + 1) % PALM_RING.length;
        tris.push([center, inner[k], inner[n]]);
        addQuad(inner[k], inner[n], PALM_RING[n], lm);
      });
    });

    // 3) Dedos: três anéis de 4 vértices (MCP, PIP, DIP) + ponta
    const FINGER_CHAINS = [
      [1, 2, 3, 4], // polegar
      [5, 6, 7, 8], // indicador
      [9, 10, 11, 12], // médio
      [13, 14, 15, 16], // anelar
      [17, 18, 19, 20], // mínimo
    ];
    const RING_RADII = [0.17, 0.14, 0.115];
    const SIDE_REF = new THREE.Vector3(1, 0, 0);
    const axis = new THREE.Vector3();
    const side = new THREE.Vector3();
    const depth = new THREE.Vector3();

    const fingerRings = FINGER_CHAINS.map((chain) => {
      // ordem de cada anel: [+lado, +frente, -lado, -frente]
      const rings = RING_RADII.map(() => [
        addVertex(),
        addVertex(),
        addVertex(),
        addVertex(),
      ]);

      skinUpdaters.push(() => {
        rings.forEach((ring, k) => {
          const prev = pts[chain[Math.max(k - 1, 0)]];
          const next = pts[chain[k + 1]];
          axis.subVectors(next, prev).normalize();
          side
            .copy(SIDE_REF)
            .addScaledVector(axis, -SIDE_REF.dot(axis))
            .normalize();
          depth.crossVectors(axis, side);

          const r = RING_RADII[k];
          const c = pts[chain[k]];
          skinVerts[ring[0]].copy(c).addScaledVector(side, r);
          skinVerts[ring[1]].copy(c).addScaledVector(depth, r * 0.75);
          skinVerts[ring[2]].copy(c).addScaledVector(side, -r);
          skinVerts[ring[3]].copy(c).addScaledVector(depth, -r * 0.75);
        });
      });

      for (let k = 0; k < rings.length - 1; k++) {
        for (let i = 0; i < 4; i++) {
          const n = (i + 1) % 4;
          addQuad(rings[k][i], rings[k][n], rings[k + 1][n], rings[k + 1][i]);
        }
      }
      for (let i = 0; i < 4; i++) {
        const n = (i + 1) % 4;
        tris.push([rings[2][i], rings[2][n], chain[3]]); // ponta
        tris.push([chain[0], rings[0][i], rings[0][n]]); // base
      }

      return rings;
    });

    // 4) Membrana entre dedos vizinhos (indicador → mínimo)
    for (let f = 1; f < 4; f++) {
      const A = fingerRings[f];
      const B = fingerRings[f + 1];
      const wa = addVertex();
      const wb = addVertex();
      skinUpdaters.push(() => {
        skinVerts[wa].lerpVectors(skinVerts[A[0][0]], skinVerts[A[1][0]], 0.45);
        skinVerts[wb].lerpVectors(skinVerts[B[0][2]], skinVerts[B[1][2]], 0.45);
      });
      addQuad(A[0][0], B[0][2], wb, wa);
    }

    // 5) Membrana do polegar
    tris.push([1, 2, 5], [2, 3, 5]);

    // Buffer compartilhado + arestas únicas
    const skinPositions = new Float32Array(skinVerts.length * 3);
    const skinAttr = new THREE.BufferAttribute(skinPositions, 3);
    skinAttr.setUsage(THREE.DynamicDrawUsage);

    const edgeKeys = new Set<string>();
    const edgeIndices: number[] = [];
    tris.forEach(([a, b, c]) => {
      [
        [a, b],
        [b, c],
        [c, a],
      ].forEach(([u, v]) => {
        const key = u < v ? `${u}-${v}` : `${v}-${u}`;
        if (edgeKeys.has(key)) return;
        edgeKeys.add(key);
        edgeIndices.push(u, v);
      });
    });

    const skinGeo = track(new THREE.BufferGeometry());
    skinGeo.setAttribute("position", skinAttr);
    skinGeo.setIndex(tris.flat());

    const skinLinesGeo = track(new THREE.BufferGeometry());
    skinLinesGeo.setAttribute("position", skinAttr);
    skinLinesGeo.setIndex(edgeIndices);

    const skinNodesGeo = track(new THREE.BufferGeometry());
    skinNodesGeo.setAttribute("position", skinAttr);

    [
      new THREE.Mesh(skinGeo, skinMaterial),
      new THREE.LineSegments(skinLinesGeo, skinLineMaterial),
      new THREE.Points(skinNodesGeo, nodeMaterial),
    ].forEach((object) => {
      object.frustumCulled = false; // a malha se move, o bounding inicial engana
      handGroup.add(object);
    });

    const updateSkin = () => {
      skinUpdaters.forEach((update) => update());

      skinVerts.forEach((v, i) => {
        v.toArray(skinPositions, i * 3);
      });

      skinAttr.needsUpdate = true;

      // Atualiza a iluminação da superfície conforme a geometria muda.
      skinGeo.computeVertexNormals();
    };

    // ------------------------------------------------------------------
    // Ossos: cilindros finos de altura 1, esticados a cada frame
    // (ficam por dentro da pele e aparecem por transparência)
    // ------------------------------------------------------------------
    const boneGeo = track(new THREE.CylinderGeometry(0.04, 0.05, 1, 6));

    const bones = CONNECTIONS.map(([a, b]) => {
      const mesh = new THREE.Mesh(boneGeo, boneMaterial);
      handGroup.add(mesh);
      return { mesh, a, b };
    });

    // ------------------------------------------------------------------
    // Juntas (landmarks): icosaedros low-poly com cor por dedo
    // ------------------------------------------------------------------
    const jointGeoSmall = track(new THREE.IcosahedronGeometry(0.085, 0));
    const jointGeoTip = track(new THREE.IcosahedronGeometry(0.115, 0));
    const jointGeoPalm = track(new THREE.IcosahedronGeometry(0.13, 0));

    const joints = pts.map((_, i) => {
      const geo = TIP_INDICES.includes(i)
        ? jointGeoTip
        : PALM_INDICES.includes(i)
          ? jointGeoPalm
          : jointGeoSmall;
      const mat = trackMat(
        new THREE.MeshBasicMaterial({ color: FINGER_COLORS[i] }),
      );
      const mesh = new THREE.Mesh(geo, mat);
      handGroup.add(mesh);
      return mesh;
    });

    // ------------------------------------------------------------------
    // Partículas de fundo
    // ------------------------------------------------------------------
    const particlePositions = new Float32Array(150);
    for (let i = 0; i < particlePositions.length; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 6;
      particlePositions[i + 1] = (Math.random() - 0.5) * 6;
      particlePositions[i + 2] = -1 + Math.random() * 3;
    }
    const particleGeometry = track(new THREE.BufferGeometry());
    particleGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(particlePositions, 3),
    );
    const particles = new THREE.Points(
      particleGeometry,
      trackMat(
        new THREE.PointsMaterial({
          color: 0x8174f5,
          size: 0.03,
          transparent: true,
          opacity: 0.6,
        }),
      ),
    );
    scene.add(particles);

    // ------------------------------------------------------------------
    // Atualização da pose (curl dos dedos + posicionamento dos ossos)
    // ------------------------------------------------------------------
    const X_AXIS = new THREE.Vector3(1, 0, 0);
    const UP = new THREE.Vector3(0, 1, 0);
    const tmp = new THREE.Vector3();

    const applyCurl = (finger: number[], theta: number) => {
      let angle = 0;
      pts[finger[0]].copy(basePts[finger[0]]);
      for (let k = 1; k < finger.length; k++) {
        angle += theta; // curl acumulado: cada junta dobra um pouco mais
        tmp
          .copy(basePts[finger[k]])
          .sub(basePts[finger[k - 1]])
          .applyAxisAngle(X_AXIS, angle); // dobra em direção à câmera
        pts[finger[k]].copy(pts[finger[k - 1]]).add(tmp);
      }
    };

    const updatePose = (elapsed: number, animated: boolean) => {
      CURLING_FINGERS.forEach((finger, i) => {
        const theta = animated
          ? (Math.sin(elapsed * 1.1 - i * 0.55) * 0.5 + 0.5) * 0.2
          : 0.06;
        applyCurl(finger, theta);
      });

      joints.forEach((mesh, i) => mesh.position.copy(pts[i]));
      updateSkin();

      bones.forEach(({ mesh, a, b }) => {
        mesh.position.addVectors(pts[a], pts[b]).multiplyScalar(0.5);
        tmp.subVectors(pts[b], pts[a]);
        const length = tmp.length();
        mesh.scale.set(1, length, 1);
        mesh.quaternion.setFromUnitVectors(UP, tmp.normalize());
      });
    };

    // ------------------------------------------------------------------
    // Câmera, interação e loop
    // ------------------------------------------------------------------
    handGroup.scale.setScalar(0.7);

    const pointer = new THREE.Vector2();
    const pointerTarget = new THREE.Vector2();

    const onPointerMove = (event: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      pointerTarget.set(
        (event.clientX - rect.left) / rect.width - 0.5,
        (event.clientY - rect.top) / rect.height - 0.5,
      );
    };
    const onPointerLeave = () => pointerTarget.set(0, 0);

    container.addEventListener("pointermove", onPointerMove);
    container.addEventListener("pointerleave", onPointerLeave);

    const resizeObserver = new ResizeObserver(() => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      if (!width || !height) return;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    });
    resizeObserver.observe(container);

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let animationFrame = 0;
    let elapsed = 0;

    handGroup.rotation.set(-0.15, 0.45, 0);
    updatePose(0, false);

    const animate = () => {
      animationFrame = requestAnimationFrame(animate);

      if (!prefersReducedMotion) {
        elapsed += 0.008;

        pointer.lerp(pointerTarget, 0.06);

        handGroup.rotation.y = 0.45 + Math.sin(elapsed) * 0.2 + pointer.x * 0.7;
        handGroup.rotation.x =
          -0.15 + Math.sin(elapsed * 0.7) * 0.04 + pointer.y * 0.4;
        handGroup.position.y = Math.sin(elapsed * 0.8) * 0.07;

        updatePose(elapsed, true);

        particles.rotation.z = elapsed * 0.03;
        particles.rotation.y = elapsed * 0.015;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      container.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("pointerleave", onPointerLeave);
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="hand-visualization"
      role="img"
      aria-label="Visualização 3D low-poly de uma mão com 21 pontos de referência, baseada na estrutura do MediaPipe"
    />
  );
}
