/* APC – 3D-Avatar (drehbar, Nahaufnahmen). Baustein three.js (MIT-Lizenz) liegt im Ordner three/.
   Wird erst auf der Seite «Avatar gestalten» geladen. Einstellungen kommen aus dem App-Avatar (apc.avatar.v1). */
import * as THREE from 'three';
import { OrbitControls } from './three/addons/OrbitControls.js';
import { RoundedBoxGeometry } from './three/addons/RoundedBoxGeometry.js';
import { RoomEnvironment } from './three/addons/RoomEnvironment.js';

const V = (x, y, z) => new THREE.Vector3(x, y, z);
const UP = V(0, 1, 0);
const lerp = (a, b, t) => a.clone().lerp(b, t);
const lum = h => { const n = parseInt(String(h).slice(1), 16); return (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255; };

export const VIEWS = {
  full:   { t:V(0, 0.8, 0.05),    p:V(1.95, 1.35, 3.5) },
  head:   { t:V(0, 1.53, 0.02),   p:V(0.35, 1.62, 0.62) },
  hands:  { t:V(0.04, 0.88, 0.3), p:V(0.6, 1.02, 1.0) },
  skates: { t:V(0, 0.14, 0.06),   p:V(0.62, 0.36, 0.85) },
  back:   { t:V(0, 1.05, 0),      p:V(-0.4, 1.25, -2.0) }
};

export function createAvatar3D(host, a, opt){
  opt = opt || {};
  const canvas = document.createElement('canvas'); canvas.className = 'av3d-canvas'; host.prepend(canvas);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias:true, alpha:true });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  const camera = new THREE.PerspectiveCamera(32, 1, 0.05, 50);
  camera.position.copy(VIEWS.full.p);
  const controls = new OrbitControls(camera, canvas);
  controls.target.copy(VIEWS.full.t); controls.enableDamping = true; controls.minDistance = 0.45; controls.maxDistance = 6;
  controls.maxPolarAngle = Math.PI * 0.53; controls.enablePan = false; controls.autoRotateSpeed = 1.4;
  controls.autoRotate = !matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Licht: Arena-Scheinwerfer, kühles Fülllicht, Kantenlicht von hinten
  scene.add(new THREE.HemisphereLight(0xcfe6ff, 0x0b1220, 0.6));
  const key = new THREE.DirectionalLight(0xffffff, 2.2); key.position.set(2.5, 5, 3); key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024); key.shadow.camera.near = 1; key.shadow.camera.far = 12;
  Object.assign(key.shadow.camera, { left:-1.6, right:1.6, top:2.2, bottom:-0.8 }); key.shadow.camera.updateProjectionMatrix();
  key.shadow.bias = -0.0004; key.shadow.normalBias = 0.02; scene.add(key);
  const rim = new THREE.DirectionalLight(0x7fd4ff, 1.4); rim.position.set(-3, 2.5, -3); scene.add(rim);

  // Eisfläche mit Bully-Kreis
  const ice = new THREE.Mesh(new THREE.CircleGeometry(3.2, 96), new THREE.MeshStandardMaterial({ color:0xe6eff6, roughness:0.12 }));
  ice.rotation.x = -Math.PI / 2; ice.receiveShadow = true; scene.add(ice);
  const lineMat = new THREE.MeshBasicMaterial({ color:0xc8102e });
  const flat = (geo, x, z) => { const m = new THREE.Mesh(geo, lineMat); m.rotation.x = -Math.PI / 2; m.position.set(x, 0.002, z); scene.add(m); };
  flat(new THREE.RingGeometry(1.32, 1.37, 128), 0, 0); flat(new THREE.CircleGeometry(0.14, 48), 0, 0.9);
  flat(new THREE.PlaneGeometry(0.42, 0.035), -0.62, 1.05); flat(new THREE.PlaneGeometry(0.42, 0.035), 0.62, 1.05);

  const M = {
    jersey: new THREE.MeshStandardMaterial({ roughness:0.78 }), accent: new THREE.MeshStandardMaterial({ roughness:0.75 }),
    pants:  new THREE.MeshStandardMaterial({ roughness:0.6 }),  helmet: new THREE.MeshStandardMaterial({ roughness:0.22, metalness:0.15 }),
    skin:   new THREE.MeshStandardMaterial({ roughness:0.65 }), hair: new THREE.MeshStandardMaterial({ roughness:0.9 }),
    glove:  new THREE.MeshStandardMaterial({ roughness:0.55 }), glovePalm: new THREE.MeshStandardMaterial({ color:0xe9e3d6, roughness:0.85 }),
    boot:   new THREE.MeshStandardMaterial({ roughness:0.35, metalness:0.1 }), cap: new THREE.MeshStandardMaterial({ roughness:0.45, metalness:0.05 }), holder: new THREE.MeshStandardMaterial({ color:0xf4f6f9, roughness:0.3 }),
    steel:  new THREE.MeshStandardMaterial({ color:0xd8dee6, roughness:0.18, metalness:1 }),
    stick:  new THREE.MeshStandardMaterial({ roughness:0.35, metalness:0.2 }), tape: new THREE.MeshStandardMaterial({ roughness:0.95 }),
    lace:   new THREE.MeshStandardMaterial({ color:0xf4f6f9, roughness:0.95 }),
    visor:  new THREE.MeshPhysicalMaterial({ color:0xbfe4ff, roughness:0.02, transmission:0.85, transparent:true, opacity:0.45, thickness:0.01, side:THREE.DoubleSide }),
    cage:   new THREE.MeshStandardMaterial({ color:0xd3dae3, roughness:0.25, metalness:0.9 }),
    eye:    new THREE.MeshStandardMaterial({ color:0x2a1d14, roughness:0.4 }),
    gold:   new THREE.MeshStandardMaterial({ color:0xe4b42c, roughness:0.18, metalness:1 }),
    smoke:  new THREE.MeshPhysicalMaterial({ color:0x2b3340, roughness:0.05, transparent:true, opacity:0.78, side:THREE.DoubleSide }),
    mirror: new THREE.MeshStandardMaterial({ color:0x9fc4ff, roughness:0.04, metalness:1, envMapIntensity:1.6, side:THREE.DoubleSide }),
    goldV:  new THREE.MeshStandardMaterial({ color:0xf4c64e, roughness:0.06, metalness:1, transparent:true, opacity:0.92, side:THREE.DoubleSide }),
    plexi:  new THREE.MeshPhysicalMaterial({ color:0xe8f4ff, roughness:0.02, transmission:0.92, transparent:true, opacity:0.3, thickness:0.01, side:THREE.DoubleSide }),
    frame:  new THREE.MeshStandardMaterial({ color:0x16181d, roughness:0.4 })
  };
  const root = new THREE.Group(); scene.add(root); root.rotation.y = -0.25;
  const add = (geo, mat, parent = root) => { const m = new THREE.Mesh(geo, mat); m.castShadow = true; m.receiveShadow = true; parent.add(m); return m; };
  const limb = (p, q, r1, r2, mat, parent = root, seg = 20) => { const m = add(new THREE.CylinderGeometry(r2, r1, p.distanceTo(q), seg), mat, parent);
    m.position.copy(p).add(q).multiplyScalar(0.5); m.quaternion.setFromUnitVectors(UP, q.clone().sub(p).normalize()); return m; };
  const ball = (p, r, mat, s, parent = root) => { const m = add(new THREE.SphereGeometry(r, 24, 18), mat, parent); m.position.copy(p); if (s) m.scale.set(...s); return m; };
  const parts = { blades:[] };

  /* ---------- Beine, Stutzen, Schlittschuhe ---------- */
  [-1, 1].forEach(s => {
    const hip = V(s * 0.1, 0.78, -0.02), knee = V(s * 0.125, 0.47, 0.07), ank = V(s * 0.13, 0.24, 0.0);
    limb(knee, ank, 0.066, 0.045, M.jersey);   // Stutzen über Schienbeinschoner, endet im Schuh
    [0.25, 0.42].forEach(t => limb(lerp(knee, ank, t), lerp(knee, ank, t + 0.08), 0.064, 0.061, M.accent));
    ball(knee, 0.072, M.jersey, [1, 0.9, 1.15]);
    limb(hip, knee, 0.11, 0.085, M.pants);
    // Schlittschuh: Seitenprofile als abgerundete Extrusionen
    const sk = new THREE.Group(); sk.position.set(s * 0.13, 0, 0.035); sk.rotation.y = -Math.PI / 2 + s * 0.08; root.add(sk);
    const ext = (shape, depth, mat, bevel) => { const g = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled:!!bevel, bevelThickness:bevel || 0, bevelSize:bevel || 0, bevelSegments:4, curveSegments:24 });
      g.translate(0, 0, -depth / 2); return add(g, mat, sk); };
    const boot = new THREE.Shape();
    boot.moveTo(-0.118, 0.078); boot.lineTo(0.112, 0.078);
    boot.quadraticCurveTo(0.142, 0.08, 0.14, 0.104); boot.quadraticCurveTo(0.135, 0.128, 0.105, 0.132);   // Zehenkappe
    boot.quadraticCurveTo(0.065, 0.142, 0.045, 0.178); boot.lineTo(0.042, 0.262);                         // Rist bis Knöchel
    boot.lineTo(-0.07, 0.262); boot.quadraticCurveTo(-0.095, 0.27, -0.106, 0.298);                        // Fersenschutz
    boot.quadraticCurveTo(-0.122, 0.285, -0.118, 0.24); boot.quadraticCurveTo(-0.112, 0.18, -0.128, 0.13); // Ferse
    boot.quadraticCurveTo(-0.135, 0.095, -0.118, 0.078);
    ext(boot, 0.072, M.boot, 0.01);
    const cap = new THREE.Shape();
    cap.moveTo(0.06, 0.078); cap.lineTo(0.112, 0.078); cap.quadraticCurveTo(0.142, 0.08, 0.14, 0.104); cap.quadraticCurveTo(0.135, 0.128, 0.105, 0.132); cap.quadraticCurveTo(0.08, 0.137, 0.06, 0.12); cap.lineTo(0.06, 0.078);
    ext(cap, 0.08, M.cap, 0.009).scale.set(1.01, 1.01, 1);
    const tongue = new THREE.Shape(); tongue.moveTo(0.036, 0.2); tongue.lineTo(0.05, 0.2); tongue.quadraticCurveTo(0.062, 0.26, 0.056, 0.292); tongue.lineTo(0.034, 0.29); tongue.lineTo(0.036, 0.2);
    ext(tongue, 0.05, M.cap, 0.005);
    [[0.095, 0.14], [0.072, 0.15], [0.052, 0.18], [0.05, 0.205], [0.048, 0.23], [0.046, 0.252]].forEach(([u, v], n) => {
      const l = add(new THREE.BoxGeometry(0.006, 0.004, 0.082), M.lace, sk); l.position.set(u + 0.008, v + 0.006, 0); l.rotation.z = n < 2 ? 0.35 : 1.35; });
    const hold = new THREE.Shape();
    hold.moveTo(-0.112, 0.08); hold.lineTo(0.112, 0.08); hold.lineTo(0.1, 0.036); hold.lineTo(0.062, 0.036);
    hold.quadraticCurveTo(0.045, 0.06, 0.02, 0.062); hold.lineTo(-0.02, 0.062); hold.quadraticCurveTo(-0.045, 0.06, -0.062, 0.036);
    hold.lineTo(-0.104, 0.036); hold.lineTo(-0.112, 0.08);
    ext(hold, 0.016, M.holder, 0.004);
    const blade = new THREE.Shape();
    blade.moveTo(-0.118, 0.04); blade.lineTo(0.118, 0.04); blade.quadraticCurveTo(0.13, 0.03, 0.118, 0.012);
    blade.quadraticCurveTo(0, -0.006, -0.118, 0.012); blade.quadraticCurveTo(-0.13, 0.03, -0.118, 0.04);
    (parts.blades = parts.blades || []).push(ext(blade, 0.003, M.steel, 0.0008));
  });
  /* ---------- Hose ---------- */
  const girdle = add(new THREE.CylinderGeometry(0.2, 0.215, 0.24, 32), M.pants); girdle.position.set(0, 0.86, -0.01); girdle.scale.z = 0.78;
  [-1, 1].forEach(s => add(new THREE.BoxGeometry(0.012, 0.22, 0.05), M.accent).position.set(s * 0.212, 0.83, -0.01));
  /* ---------- Oberkörper ---------- */
  const prof = [[0, 0.9], [0.205, 0.9], [0.21, 0.97], [0.215, 1.08], [0.24, 1.2], [0.27, 1.29], [0.23, 1.36], [0.08, 1.4], [0, 1.4]].map(([r, y]) => new THREE.Vector2(r, y));
  add(new THREE.LatheGeometry(prof, 48), M.jersey).scale.z = 0.72;
  const trim = new THREE.Group(); root.add(trim);
  const clearGroup = g => { g.traverse(o => { if (o.geometry) o.geometry.dispose(); }); while (g.children.length) g.remove(g.children[0]); };
  function buildTrim(style){
    clearGroup(trim);
    const bands = { std:[[0.94, 0.965], [0.98, 1.005]], champ:[[0.94, 0.965], [0.98, 1.005]], alt:[[0.925, 1.015]], retro:[[0.935, 0.948], [0.958, 0.971], [0.981, 0.994]] }[style] || [[0.94, 0.965], [0.98, 1.005]];
    bands.forEach(([p, q]) => { const h = add(new THREE.CylinderGeometry(0.213, 0.211, q - p, 48, 1, true), M.accent, trim); h.position.y = (p + q) / 2; h.scale.z = 0.73; });
    if (style === 'alt'){ const y = add(new THREE.CylinderGeometry(0.262, 0.272, 0.05, 48, 1, true), M.accent, trim); y.position.y = 1.28; y.scale.z = 0.73; }
    if (style === 'retro'){   // Schnürkragen
      const v = add(new RoundedBoxGeometry(0.05, 0.09, 0.012, 2, 0.004), M.accent, trim); v.position.set(0, 1.335, 0.165); v.rotation.x = -0.35;
      [0, 1, 2].forEach(i => { const l = add(new THREE.BoxGeometry(0.04, 0.004, 0.004), M.lace, trim); l.position.set(0, 1.31 + i * 0.022, 0.172 - i * 0.007); l.rotation.z = i % 2 ? 0.4 : -0.4; });
    }
  }
  [-1, 1].forEach(s => ball(V(s * 0.25, 1.3, 0), 0.105, M.jersey, [1, 0.8, 0.9]));
  const collar = add(new THREE.TorusGeometry(0.065, 0.014, 10, 32), M.accent); collar.position.y = 1.395; collar.rotation.x = Math.PI / 2;
  // Name und Nummer als Leinwand-Texturen
  const textTex = lines => {
    const c = document.createElement('canvas'); c.width = 512; c.height = 512; const g = c.getContext('2d');
    g.textAlign = 'center'; g.textBaseline = 'middle';
    lines.forEach(([txt, size, y, fill, stroke]) => { g.font = `800 ${size}px "Barlow Condensed", "Arial Narrow", sans-serif`;
      g.lineWidth = size * 0.09; g.strokeStyle = stroke; g.strokeText(txt, 256, y); g.fillStyle = fill; g.fillText(txt, 256, y); });
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
  };
  const decal = () => new THREE.MeshStandardMaterial({ transparent:true, roughness:0.8, polygonOffset:true, polygonOffsetFactor:-2 });
  const back = add(new THREE.PlaneGeometry(0.34, 0.34), decal()); back.position.set(0, 1.14, -0.168); back.rotation.y = Math.PI; back.castShadow = false;
  const front = add(new THREE.PlaneGeometry(0.13, 0.13), decal()); front.position.set(0.075, 1.22, 0.182); front.castShadow = false;
  /* ---------- Kopf und Helm ---------- */
  limb(V(0, 1.37, 0), V(0, 1.47, 0.01), 0.055, 0.05, M.skin);
  ball(V(0, 1.55, 0.015), 0.098, M.skin, [0.92, 1.05, 1]);
  [-1, 1].forEach(s => ball(V(s * 0.032, 1.565, 0.098), 0.011, M.eye));
  ball(V(0, 1.535, 0.104), 0.016, M.skin, [0.8, 1.1, 1]);
  ball(V(0, 1.58, -0.03), 0.095, M.hair, [0.95, 0.75, 0.9]);
  const helm = add(new THREE.SphereGeometry(0.118, 40, 24, 0, Math.PI * 2, 0, Math.PI * 0.53), M.helmet); helm.position.set(0, 1.585, -0.005); helm.scale.set(0.95, 0.95, 1.08);
  [-1, 1].forEach(s => add(new RoundedBoxGeometry(0.03, 0.08, 0.075, 3, 0.012), M.helmet).position.set(s * 0.108, 1.53, 0));
  const ridge = add(new THREE.TorusGeometry(0.112, 0.008, 8, 48, Math.PI), M.helmet); ridge.position.set(0, 1.59, -0.005); ridge.rotation.y = Math.PI / 2; ridge.scale.set(1, 1.04, 1.08);
  parts.visor = add(new THREE.CylinderGeometry(0.125, 0.125, 0.06, 40, 1, true, -Math.PI * 0.38, Math.PI * 0.76), M.visor); parts.visor.position.set(0, 1.545, 0); parts.visor.castShadow = false;
  parts.cMark = add(new THREE.PlaneGeometry(0.08, 0.08), decal()); parts.cMark.position.set(-0.09, 1.25, 0.183); parts.cMark.castShadow = false;
  parts.plexi = new THREE.Group(); root.add(parts.plexi);
  { const sh = add(new THREE.CylinderGeometry(0.132, 0.126, 0.17, 48, 1, true, -Math.PI * 0.46, Math.PI * 0.92), M.plexi, parts.plexi); sh.position.set(0, 1.49, 0.005); sh.castShadow = false;
    [1.575, 1.405].forEach(y => { const r = add(new THREE.TorusGeometry(y > 1.5 ? 0.132 : 0.126, 0.004, 6, 48, Math.PI * 0.92), M.frame, parts.plexi); r.position.y = y; r.rotation.x = Math.PI / 2; r.rotation.z = Math.PI * 0.04; }); }
  parts.cage = new THREE.Group(); root.add(parts.cage);
  for (let i = -3; i <= 3; i++){ const w = i * 0.16; add(new THREE.CylinderGeometry(0.003, 0.003, 0.15, 6), M.cage, parts.cage).position.set(Math.sin(w) * 0.128, 1.5, Math.cos(w) * 0.128); }
  [1.57, 1.53, 1.49, 1.45].forEach((y, k) => { const b = add(new THREE.TorusGeometry(0.128 - k * 0.006, 0.003, 6, 40, Math.PI * 0.95), M.cage, parts.cage); b.position.y = y; b.rotation.x = Math.PI / 2; b.rotation.z = Math.PI * 0.025; });
  /* ---------- Arme, Handschuhe, Stock je Pose (gespiegelt für Links-/Rechtsschuss) ---------- */
  const arms = new THREE.Group(); root.add(arms);
  const basis = dir => { const z = dir.clone().normalize(), x = new THREE.Vector3().crossVectors(UP, z); if (x.lengthSq() < 1e-6) x.set(1, 0, 0); x.normalize();
    const y = new THREE.Vector3().crossVectors(z, x); return new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, y, z)); };
  const SH = [V(0.26, 1.28, 0), V(-0.26, 1.28, 0)];
  // Pose: Stock (oben, Ferse) und Handpositionen; t = Griffpunkt auf dem Stock, sonst feste Position
  const POSES = {
    ready:  { stick:[V(0.2, 1.12, 0.18), V(-0.36, 0.035, 0.72)], h:[{ t:0.06 }, { t:0.3 }], bladeStd:true },
    cheer:  { stick:[V(0.45, 1.8, 0.08), V(-0.8, 1.98, 0.16)], h:[{ t:0.2 }, { t:0.58 }] },
    fist:   { stick:[V(-0.34, 0.98, 0.22), V(-0.52, 0.035, 0.58)], h:[{ p:V(0.2, 1.06, 0.24) }, { t:0.05 }] },
    ear:    { stick:[V(-0.34, 0.98, 0.22), V(-0.52, 0.035, 0.58)], h:[{ p:V(0.165, 1.56, 0.02) }, { t:0.05 }] },
    archer: { stick:[V(-0.13, 1.85, 0.56), V(-0.1, 0.74, 0.6)], h:[{ p:V(0.12, 1.38, 0.14) }, { t:0.5 }] },
    trophy: { stick:null, h:[{ p:V(0.11, 1.8, 0.07) }, { p:V(-0.11, 1.8, 0.07) }], cup:V(0, 1.86, 0.07) }
  };
  let armsSig = '';
  function buildArms(av){
    const pose = POSES[av.pose] || POSES.ready, style = av.jstyle || 'std', two = av.glove2 === '1';
    const sig = (av.pose || 'ready') + style + two; if (sig === armsSig) return; armsSig = sig;
    clearGroup(arms);
    const [st, he] = pose.stick || [];
    const handPos = h => h.p ? h.p.clone() : lerp(st, he, h.t);
    if (pose.stick){
      limb(st.clone().add(st.clone().sub(he).normalize().multiplyScalar(0.04)), he, 0.014, 0.013, M.stick, arms, 10);
      add(new THREE.SphereGeometry(0.02, 12, 10), M.tape, arms).position.copy(st);
      if (pose.bladeStd){
        const bl = add(new RoundedBoxGeometry(0.3, 0.075, 0.016, 2, 0.006), M.stick, arms); bl.position.copy(he).add(V(-0.12, 0.005, 0.06)); bl.rotation.y = 0.45;
        const bt = add(new RoundedBoxGeometry(0.2, 0.06, 0.018, 2, 0.006), M.tape, arms); bt.position.copy(he).add(V(-0.15, 0.007, 0.075)); bt.rotation.y = 0.45;
      } else {
        const g = new THREE.Group(); arms.add(g); g.position.copy(he); g.quaternion.copy(basis(he.clone().sub(st)));
        add(new RoundedBoxGeometry(0.3, 0.075, 0.016, 2, 0.006), M.stick, g).position.set(-0.13, 0, 0.02);
        add(new RoundedBoxGeometry(0.2, 0.06, 0.018, 2, 0.006), M.tape, g).position.set(-0.16, 0, 0.022);
      }
    }
    if (pose.cup){   // Pokal
      const prof = [[0, 0], [0.05, 0], [0.05, 0.012], [0.018, 0.03], [0.014, 0.08], [0.03, 0.1], [0.075, 0.13], [0.085, 0.2], [0.08, 0.2], [0.0, 0.2]].map(([r, y]) => new THREE.Vector2(r, y));
      const cup = add(new THREE.LatheGeometry(prof, 40), M.gold, arms); cup.position.copy(pose.cup);
      [-1, 1].forEach(sd => { const hd = add(new THREE.TorusGeometry(0.035, 0.008, 8, 20, Math.PI), M.gold, arms); hd.position.copy(pose.cup).add(V(sd * 0.085, 0.15, 0)); hd.rotation.z = sd > 0 ? -Math.PI / 2 : Math.PI / 2; });
    }
    const sleeve = { std:[[0.55, 0.07], [0.68, 0.07]], champ:[[0.55, 0.07], [0.68, 0.07]], alt:[[0.56, 0.16]], retro:[[0.52, 0.04], [0.6, 0.04], [0.68, 0.04]] }[style] || [[0.55, 0.07], [0.68, 0.07]];
    const rollMat = two ? M.accent : M.glove;
    pose.h.forEach((h, k) => {
      const shoulder = SH[k], out = k ? -1 : 1, hand = handPos(h);
      const mid = lerp(shoulder, hand, 0.5).add(V(out * 0.11, -0.04, -0.05));
      limb(shoulder, mid, 0.07, 0.06, M.jersey, arms); limb(mid, hand, 0.06, 0.05, M.jersey, arms);
      ball(mid, 0.068, M.jersey, null, arms);
      sleeve.forEach(([t, w]) => limb(lerp(mid, hand, t), lerp(mid, hand, t + w), 0.059, 0.057, M.accent, arms));
      // Handschuh: Stulpe mit Polsterwülsten, Handrücken, gepolsterte Finger, Daumen, Lederinnenhand
      const gl = new THREE.Group(); arms.add(gl); gl.position.copy(hand); gl.quaternion.copy(basis(hand.clone().sub(mid)));
      add(new THREE.CylinderGeometry(0.057, 0.066, 0.08, 24).rotateX(Math.PI / 2), M.glove, gl).position.z = -0.085;
      [-0.052, -0.118].forEach(z => add(new THREE.TorusGeometry(0.063, 0.01, 10, 28), rollMat, gl).position.z = z);
      add(new THREE.TorusGeometry(0.066, 0.006, 8, 28), M.accent, gl).position.z = -0.085;
      add(new RoundedBoxGeometry(0.094, 0.048, 0.078, 3, 0.02), M.glove, gl).position.set(0, 0.016, -0.006);
      [-0.026, 0.006].forEach(z => add(new RoundedBoxGeometry(0.09, 0.014, 0.024, 2, 0.007), rollMat, gl).position.set(0, 0.043, z));
      add(new RoundedBoxGeometry(0.084, 0.014, 0.08, 2, 0.006), M.glovePalm, gl).position.set(0, -0.012, 0);
      [-0.034, -0.0115, 0.0115, 0.034].forEach((x, n) => {
        const f = new THREE.Group(); gl.add(f); f.position.set(x, 0.012, 0.03); f.rotation.x = 1.0 + n * 0.05;
        add(new THREE.CapsuleGeometry(0.0125, 0.05, 6, 12).rotateX(Math.PI / 2), M.glove, f).position.z = 0.03;
        [0.016, 0.042].forEach(z => add(new THREE.TorusGeometry(0.0128, 0.0032, 6, 16), rollMat, f).position.z = z);
      });
      const th = new THREE.Group(); gl.add(th); th.position.set(-0.05 * out, -0.004, 0.004); th.rotation.set(0.6, -0.6 * out, 0);
      add(new THREE.CapsuleGeometry(0.014, 0.04, 6, 12).rotateX(Math.PI / 2), M.glove, th).position.z = 0.028;
    });
  }

  /* ---------- Effekte: Eis-Glitzer, Arena-Licht ---------- */
  const glitter = (() => { const n = 260, pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++){ const r = 0.15 + Math.random() * 0.9, w = Math.random() * Math.PI * 2; pos[i * 3] = Math.cos(w) * r; pos[i * 3 + 1] = 0.006 + Math.random() * 0.04; pos[i * 3 + 2] = Math.sin(w) * r * 0.8 + 0.1; }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const pts = new THREE.Points(g, new THREE.PointsMaterial({ color:0xffffff, size:0.018, transparent:true, opacity:0.9, depthWrite:false, blending:THREE.AdditiveBlending }));
    scene.add(pts); pts.visible = false; return pts; })();
  const arenaLight = new THREE.PointLight(0xffffff, 4, 4, 1.6); arenaLight.position.set(0, 2.2, 0.6); arenaLight.visible = false; scene.add(arenaLight);
  const arenaRing = new THREE.Mesh(new THREE.RingGeometry(0.75, 0.82, 96), new THREE.MeshBasicMaterial({ color:0xffffff, transparent:true, opacity:0.75 }));
  arenaRing.rotation.x = -Math.PI / 2; arenaRing.position.y = 0.003; arenaRing.visible = false; scene.add(arenaRing);

  /* ---------- Einstellungen übernehmen ---------- */
  let lastNo = null, trimStyle = null;
  function update(av, o){
    av = av || {}; o = Object.assign(opt, o || {});
    const champ = av.jstyle === 'champ';
    const J = champ ? '#E4B42C' : (av.jersey || '#C8102E'), A = champ ? '#F1F3F6' : (av.accent && av.accent !== J ? av.accent : (lum(J) > 0.6 ? '#16181D' : '#F1F3F6'));
    M.jersey.color.set(J); M.accent.color.set(A);
    M.pants.color.set(av.pants || '#16181D'); M.helmet.color.set(av.helmet || '#16181D');
    M.skin.color.set(av.skin || '#EDBF98'); M.hair.color.set(av.hair || '#6B4428');
    M.glove.color.set(av.gloves || '#16181D'); M.boot.color.set(av.skate || '#16181D'); M.cap.color.set(lum(av.skate || '#16181D') > 0.6 ? '#C9D0DA' : '#3A3F48');
    M.stick.color.set(av.stick || '#16181D'); M.tape.color.set(av.tape || (lum(av.stick || '#16181D') > 0.6 ? '#16181D' : '#F4F6F9'));
    const gd = av.guard || 'visor';
    parts.visor.visible = ['visor', 'smoke', 'mirror', 'goldvisor'].includes(gd); parts.cage.visible = gd === 'cage'; parts.plexi.visible = gd === 'plexi';
    parts.visor.material = gd === 'smoke' ? M.smoke : gd === 'mirror' ? M.mirror : gd === 'goldvisor' ? M.goldV : M.visor;
    M.holder.color.set(av.holder === 'team' ? J : '#F4F6F9');
    parts.blades.forEach(b => b.material = av.blades === 'gold' ? M.gold : M.steel);
    parts.cMark.visible = av.captain === '1';
    glitter.visible = av.fx === 'glitter'; arenaLight.visible = arenaRing.visible = av.fx === 'arena';
    arenaLight.color.set(J); arenaRing.material.color.set(J);
    if (trimStyle !== (av.jstyle || 'std')){ trimStyle = av.jstyle || 'std'; buildTrim(trimStyle); }
    buildArms(av);
    arms.scale.x = av.shoots === 'R' ? 1 : -1;   // Stockschaufel auf der Schussseite
    const no = String(o.no || ''), name = String(o.name || '').toUpperCase(), sig = no + '|' + name + '|' + J + '|' + A;
    if (sig !== lastNo){ lastNo = sig;
      const fill = lum(J) > 0.6 ? A : '#F1F3F6', stroke = lum(J) > 0.6 ? '#F1F3F6' : A;
      [back, front].forEach(m => m.material.map && m.material.map.dispose());
      back.material.map = textTex([[name, 92, 70, fill, stroke], [no, 330, 300, fill, stroke]]); back.material.needsUpdate = true;
      front.material.map = textTex([[no, 380, 270, fill, stroke]]); front.material.needsUpdate = true;
      if (parts.cMark.material.map) parts.cMark.material.map.dispose();
      parts.cMark.material.map = textTex([['C', 420, 270, fill, stroke]]); parts.cMark.material.needsUpdate = true; }
  }
  update(a, opt);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { lastNo = null; update(a, opt); });

  /* ---------- Kamera, Ansichten, Darstellung ---------- */
  let goal = null;
  controls.addEventListener('start', () => { goal = null; });
  const resize = () => { const w = host.clientWidth || 300, h = host.clientHeight || 440; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); };
  const ro = new ResizeObserver(resize); ro.observe(host); resize();
  renderer.setAnimationLoop(() => {
    if (goal){ controls.target.lerp(goal.t, 0.1); camera.position.lerp(goal.p, 0.1); if (camera.position.distanceTo(goal.p) < 0.004) goal = null; }
    if (glitter.visible) glitter.material.opacity = 0.55 + 0.4 * Math.sin(performance.now() / 260);
    controls.update(); renderer.render(scene, camera);
  });
  return {
    update,
    view(name){ goal = VIEWS[name] || VIEWS.full; if (name !== 'full') controls.autoRotate = false; },
    spin(on){ controls.autoRotate = on === undefined ? !controls.autoRotate : !!on; return controls.autoRotate; },
    dispose(){
      renderer.setAnimationLoop(null); ro.disconnect(); controls.dispose();
      scene.traverse(o => { if (o.geometry) o.geometry.dispose(); });
      Object.values(M).forEach(m => m.dispose()); [back, front, parts.cMark].forEach(m => { if (m.material.map) m.material.map.dispose(); m.material.dispose(); }); glitter.material.dispose(); arenaRing.material.dispose();
      pmrem.dispose(); renderer.dispose(); renderer.forceContextLoss(); canvas.remove();
    }
  };
}
