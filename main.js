// ===== CDN IMPORTS (jsDelivr) =====
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.164.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.164.0/examples/jsm/controls/OrbitControls.js';
import { allQuestions } from './questions.js';

console.log('[castle] three.js + OrbitControls loaded');

// ===== DOM =====
const canvas = document.getElementById('app');
const dialogEl = document.getElementById('dialog');
const speakerEl = document.getElementById('speaker');
const questionEl = document.getElementById('question');
const choiceAEl = document.getElementById('choiceA');
const choiceBEl = document.getElementById('choiceB');
const feedbackEl = document.getElementById('feedback');
const nextBtn = document.getElementById('nextBtn');
const closeBtn = document.getElementById('closeBtn');
const scoreEl = document.getElementById('score');

// ===== SCENE SETUP =====
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0b1220);
scene.fog = new THREE.FogExp2(0x0b1220, 0.015);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
camera.position.set(80, 40, 120);

let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
} catch (e) {
  showFatal('WebGL could not initialise. Try a different browser/device.');
  throw e;
}

const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
renderer.setPixelRatio(isMobile ? 1 : Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = !isMobile;
// Color space (recommended for r152+)
renderer.outputColorSpace = THREE.SRGBColorSpace;

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 40;
controls.maxDistance = 300;
controls.maxPolarAngle = Math.PI * 0.49;

// ===== LIGHTS =====
const hemi = new THREE.HemisphereLight(0xbad6ff, 0x1b2a3a, 1.0);
scene.add(hemi);
const dir = new THREE.DirectionalLight(0xffffff, 1.2);
dir.position.set(80, 120, 60);
dir.castShadow = true;
scene.add(dir);

// ===== MOUNTAIN =====
const groundGeo = new THREE.ConeGeometry(180, 240, 8);
const groundMat = new THREE.MeshStandardMaterial({ color: 0x28354a, roughness: 0.95, metalness: 0.05 });
const mountain = new THREE.Mesh(groundGeo, groundMat);
mountain.position.y = -140;
mountain.receiveShadow = true;
scene.add(mountain);

// ===== CLOUDS =====
const cloudGroup = new THREE.Group();
scene.add(cloudGroup);
function makeCloud(x, y, z) {
  const g = new THREE.SphereGeometry(10, 16, 16);
  const m = new THREE.MeshLambertMaterial({ color: 0xdde7f5, transparent: true, opacity: 0.45 });
  const c = new THREE.Mesh(g, m);
  c.position.set(x, y, z);
  cloudGroup.add(c);
}
for (let i = 0; i < 16; i++) makeCloud((Math.random() - 0.5) * 240, 60 + Math.random() * 40, (Math.random() - 0.5) * 240);

// ===== CASTLE =====
const castle = new THREE.Group();
scene.add(castle);
const wallMat = new THREE.MeshStandardMaterial({ color: 0xbcc6d6, roughness: 0.9 });
const accentMat = new THREE.MeshStandardMaterial({ color: 0x8b9bb8, roughness: 0.7 });
const roofMat = new THREE.MeshStandardMaterial({ color: 0x7b2cbf, roughness: 0.6 });

// Keep
const keep = new THREE.Mesh(new THREE.BoxGeometry(40, 30, 40), wallMat);
keep.position.set(0, 15, 0);
keep.castShadow = true;
keep.receiveShadow = true;
castle.add(keep);
const keepRoof = new THREE.Mesh(new THREE.ConeGeometry(22, 18, 6), roofMat);
keepRoof.position.set(0, 39, 0);
keepRoof.castShadow = true;
castle.add(keepRoof);

// Towers
function tower(x, z) {
  const t = new THREE.Group();
  const base = new THREE.Mesh(new THREE.CylinderGeometry(6, 8, 26, 10), wallMat);
  base.castShadow = true;
  base.receiveShadow = true;
  t.add(base);
  const cren = new THREE.Mesh(new THREE.CylinderGeometry(8, 8, 4, 10, 1, false, 0, Math.PI * 2), accentMat);
  cren.position.y = 15;
  t.add(cren);
  const roof = new THREE.Mesh(new THREE.ConeGeometry(8, 12, 8), roofMat);
  roof.position.y = 23;
  roof.castShadow = true;
  t.add(roof);
  t.position.set(x, 13, z);
  castle.add(t);
  return t;
}
tower(30, 30);
tower(-30, 30);
tower(30, -30);
tower(-30, -30);

// Walls
const wallH = 14,
  wallTh = 4,
  wallLen = 70;
function wall(x, z, rx) {
  const w = new THREE.Mesh(new THREE.BoxGeometry(wallLen, wallH, wallTh), wallMat);
  w.position.set(x, wallH / 2, z);
  w.rotation.y = rx;
  w.castShadow = true;
  w.receiveShadow = true;
  castle.add(w);
  return w;
}
wall(0, 35, 0);
wall(0, -35, 0);
wall(35, 0, Math.PI / 2);
wall(-35, 0, Math.PI / 2);

// Graffiti
const graffitiCanvas = document.createElement('canvas');
const gx = graffitiCanvas.getContext('2d');
graffitiCanvas.width = 1024;
graffitiCanvas.height = 256;
gx.fillStyle = '#e8ecf7';
gx.fillRect(0, 0, 1024, 256);
gx.font = 'bold 72px Cinzel, serif';
gx.fillStyle = '#1a1a1a';
gx.textAlign = 'center';
gx.textBaseline = 'middle';
gx.fillText('Mr Samuels, Grade 10 - HL - 2025', 512, 128);
const graffitiTex = new THREE.CanvasTexture(graffitiCanvas);
const banner = new THREE.Mesh(new THREE.PlaneGeometry(42, 10), new THREE.MeshBasicMaterial({ map: graffitiTex }));
banner.position.set(0, 16, 22.5);
castle.add(banner);

// Patrols
const patrolGroup = new THREE.Group();
castle.add(patrolGroup);
const guardGeo = new THREE.CapsuleGeometry(0.8, 1.6, 4, 8);
const guardMat = new THREE.MeshStandardMaterial({ color: 0x334155 });
for (let i = 0; i < 8; i++) {
  const g = new THREE.Mesh(guardGeo, guardMat);
  g.castShadow = true;
  patrolGroup.add(g);
}

// Horses
const horseGroup = new THREE.Group();
castle.add(horseGroup);
function makeHorse() {
  const h = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.4, 1.2), new THREE.MeshStandardMaterial({ color: 0x6b4f3a }));
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.9, 0.9), new THREE.MeshStandardMaterial({ color: 0x6b4f3a }));
  head.position.set(1.9, 0.6, 0);
  const legGeo = new THREE.BoxGeometry(0.2, 0.9, 0.2);
  for (let i = 0; i < 4; i++) {
    const leg = new THREE.Mesh(legGeo, new THREE.MeshStandardMaterial({ color: 0x3e2a1f }));
    leg.position.set(i < 2 ? -0.8 : 0.8, -0.7, i % 2 === 0 ? -0.4 : 0.4);
    h.add(leg);
  }
  body.position.y = 0;
  h.add(body);
  h.add(head);
  h.scale.set(1.1, 1.1, 1.1);
  return h;
}
for (let i = 0; i < 4; i++) {
  const h = makeHorse();
  h.position.set((Math.random() - 0.5) * 30, 1, (Math.random() - 0.5) * 30);
  horseGroup.add(h);
}

// People
const people = new THREE.Group();
castle.add(people);
for (let i = 0; i < 12; i++) {
  const p = new THREE.Mesh(new THREE.CapsuleGeometry(0.5, 1.2, 4, 8), new THREE.MeshStandardMaterial({ color: 0x8896a5 }));
  p.position.set((Math.random() - 0.5) * 36, 1, (Math.random() - 0.5) * 36);
  p.castShadow = true;
  people.add(p);
}

// Cannons
const cannonGroup = new THREE.Group();
castle.add(cannonGroup);
function makeCannon(x, z, ry) {
  const base = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 2.2, 12), new THREE.MeshStandardMaterial({ color: 0x2f3b52 }));
  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 4.5, 12), new THREE.MeshStandardMaterial({ color: 0x1f2937 }));
  barrel.rotation.z = Math.PI / 2;
  barrel.position.x = 2.3;
  const c = new THREE.Group();
  c.add(base);
  c.add(barrel);
  c.position.set(x, 14, z);
  c.rotation.y = ry;
  cannonGroup.add(c);
  return c;
}
const cannons = [];
for (let i = 0; i < 5; i++) {
  cannons.push(makeCannon(-25 + i * 12, 35, 0));
}
for (let i = 0; i < 5; i++) {
  cannons.push(makeCannon(-25 + i * 12, -35, Math.PI));
}

// Cannonballs
const cannonballs = [];
function fireCannon(from) {
  const geo = new THREE.SphereGeometry(0.6, 12, 12);
  const mat = new THREE.MeshStandardMaterial({ color: 0x111820 });
  const b = new THREE.Mesh(geo, mat);
  b.castShadow = true;
  scene.add(b);
  const worldPos = new THREE.Vector3();
  from.getWorldPosition(worldPos);
  b.position.copy(worldPos.clone().add(new THREE.Vector3(2.5, 0, 0).applyQuaternion(from.quaternion)));
  const dir = new THREE.Vector3(1, 0.15, 0).applyQuaternion(from.quaternion).normalize();
  const speed = 30 + Math.random() * 10;
  cannonballs.push({ mesh: b, vel: dir.multiplyScalar(speed) });
}

// Balloons
const balloonGroup = new THREE.Group();
scene.add(balloonGroup);
function spawnBalloon() {
  const g = new THREE.SphereGeometry(2, 18, 18);
  const m = new THREE.MeshStandardMaterial({ color: new THREE.Color().setHSL(Math.random(), 0.7, 0.6) });
  const b = new THREE.Mesh(g, m);
  b.castShadow = true;
  const string = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 3, 6), new THREE.MeshStandardMaterial({ color: 0x222 }));
  string.position.y = -2.5;
  b.add(string);
  b.position.set((Math.random() - 0.5) * 120, 18 + Math.random() * 16, (Math.random() - 0.5) * 120);
  b.isBalloon = true;
  balloonGroup.add(b);
}
const BALLOONS = isMobile ? 6 : 10;
for (let i = 0; i < BALLOONS; i++) spawnBalloon();

// NPCs
const npcGroup = new THREE.Group();
castle.add(npcGroup);
function makeNPC(name, color, pos) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.6, 1.6, 4, 12), new THREE.MeshStandardMaterial({ color }));
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.45, 16, 16), new THREE.MeshStandardMaterial({ color: 0xffe0bd }));
  head.position.y = 1.5;
  g.add(body);
  g.add(head);
  g.position.copy(pos);
  g.npcName = name;
  npcGroup.add(g);
  return g;
}
makeNPC('Patrol Captain', 0x2b6cb0, new THREE.Vector3(-10, 1, 18));
makeNPC('Stable Master', 0x7c3aed, new THREE.Vector3(14, 1, -8));
makeNPC('Town Scribe', 0x16a34a, new THREE.Vector3(6, 1, 10));

// Score + questions
let score = 0;
function addScore(n) {
  score += n;
  scoreEl.textContent = String(score);
}
let currentQuestion = null;
function randomQuestion() {
  return allQuestions[Math.floor(Math.random() * allQuestions.length)];
}
function showQuestion(speaker) {
  currentQuestion = randomQuestion();
  speakerEl.textContent = speaker;
  questionEl.textContent = currentQuestion.text;
  choiceAEl.textContent = currentQuestion.choices[0];
  choiceBEl.textContent = currentQuestion.choices[1];
  choiceAEl.classList.remove('correct', 'wrong');
  choiceBEl.classList.remove('correct', 'wrong');
  feedbackEl.textContent = '';
  nextBtn.disabled = true;
  dialogEl.classList.remove('hidden');
}
function handleChoice(idx) {
  if (!currentQuestion) return;
  const correct = idx === currentQuestion.correctIndex;
  const btn = idx === 0 ? choiceAEl : choiceBEl;
  btn.classList.add(correct ? 'correct' : 'wrong');
  feedbackEl.textContent = correct ? 'Correct! +1 point.' : 'Not quite. Try the next one.';
  if (correct) {
    addScore(1);
    nextBtn.disabled = false;
  }
}
choiceAEl.onclick = () => handleChoice(0);
choiceBEl.onclick = () => handleChoice(1);
nextBtn.onclick = () => {
  dialogEl.classList.add('hidden');
};
closeBtn.onclick = () => {
  dialogEl.classList.add('hidden');
};

// Audio
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
async function unlockAudio() {
  try {
    await audioCtx.resume();
  } catch {}
}
window.addEventListener('pointerdown', unlockAudio, { once: true, passive: true });
function playPop() {
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.type = 'square';
  o.frequency.setValueAtTime(880, audioCtx.currentTime);
  g.gain.setValueAtTime(0.2, audioCtx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.15);
  o.connect(g).connect(audioCtx.destination);
  o.start();
  o.stop(audioCtx.currentTime + 0.15);
}

// Raycaster & shooting
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const projectiles = [];
function shootProjectile(target) {
  const geo = new THREE.SphereGeometry(0.25, 10, 10);
  const mat = new THREE.MeshStandardMaterial({ color: 0xffd166, emissive: 0x553300, emissiveIntensity: 0.4 });
  const p = new THREE.Mesh(geo, mat);
  p.castShadow = true;
  scene.add(p);
  p.position.copy(camera.position);
  const dir = target.clone().sub(camera.position).normalize();
  projectiles.push({ mesh: p, vel: dir.multiplyScalar(120), life: 2.0 });
}

function onPointerDown(e) {
  const rect = renderer.domElement.getBoundingClientRect();
  const x = e.clientX ?? e.pageX;
  const y = e.clientY ?? e.pageY;
  mouse.x = ((x - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((y - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects([balloonGroup, npcGroup, castle], true);
  if (intersects.length) {
    const hitBalloon = intersects.find((i) => i.object && i.object.parent && (i.object.parent.isBalloon || i.object.isBalloon));
    if (hitBalloon) {
      const target = hitBalloon.point.clone();
      shootProjectile(target);
      return;
    }
    const npcHit = intersects.find((i) => i.object && i.object.parent && i.object.parent.npcName);
    if (npcHit) {
      const name = npcHit.object.parent.npcName || 'Villager';
      showQuestion(name);
      return;
    }
  }
}
window.addEventListener('pointerdown', onPointerDown, { passive: true });

// Cinematic camera pan
let t = 0;
const panDuration = 10;
function updateCinematic(dt) {
  if (t < panDuration) {
    t += dt;
    const k = Math.min(1, t / panDuration);
    const angle = THREE.MathUtils.lerp(0, Math.PI * 0.9, k);
    const radius = THREE.MathUtils.lerp(140, 100, k);
    camera.position.set(Math.cos(angle) * radius, THREE.MathUtils.lerp(20, 50, k), Math.sin(angle) * radius);
    camera.lookAt(0, 15, 0);
  }
}

// Main loop
const tmpVec = new THREE.Vector3();
let last = performance.now() / 1000;
let cannonTimer = 0;
function animate() {
  requestAnimationFrame(animate);
  const now = performance.now() / 1000;
  const dt = now - last;
  last = now;

  cannonTimer += dt;
  if (cannonTimer > 2.6) {
    cannonTimer = 0;
    fireCannon(cannons[Math.floor(Math.random() * cannons.length)]);
  }

  // Cannonballs
  for (let i = cannonballs.length - 1; i >= 0; i--) {
    const c = cannonballs[i];
    c.vel.y -= 9.8 * dt;
    c.mesh.position.addScaledVector(c.vel, dt);
    if (c.mesh.position.y < -20) {
      scene.remove(c.mesh);
      cannonballs.splice(i, 1);
    }
  }

  // Patrols
  patrolGroup.children.forEach((g, idx) => {
    const u = (now * 0.05 + idx / 8) % 1;
    const perim = [
      new THREE.Vector3(-70 / 2, 14, 35),
      new THREE.Vector3(70 / 2, 14, 35),
      new THREE.Vector3(70 / 2, 14, -35),
      new THREE.Vector3(-70 / 2, 14, -35),
    ];
    const seg = Math.floor(u * 4),
      v = (u * 4) % 1;
    const a = perim[seg],
      b = perim[(seg + 1) % 4];
    g.position.lerpVectors(a, b, v);
  });

  // Horses
  horseGroup.children.forEach((h, i) => {
    const r = 12 + (i % 4) * 2;
    const sp = 0.35 + i * 0.03;
    const ang = now * sp + i;
    h.position.set(Math.cos(ang) * r, 1, Math.sin(ang) * r);
  });

  // Balloons idle bob
  balloonGroup.children.forEach((b, i) => {
    b.position.y += Math.sin(now * 0.8 + i) * 0.01;
  });

  // Projectiles vs balloons
  for (let i = projectiles.length - 1; i >= 0; i--) {
    const p = projectiles[i];
    p.life -= dt;
    p.mesh.position.addScaledVector(p.vel, dt);
    if (p.life <= 0) {
      scene.remove(p.mesh);
      projectiles.splice(i, 1);
      continue;
    }
    for (let j = balloonGroup.children.length - 1; j >= 0; j--) {
      const b = balloonGroup.children[j];
      tmpVec.copy(b.getWorldPosition(new THREE.Vector3()));
      if (p.mesh.position.distanceTo(tmpVec) < 2.1) {
        playPop();
        scene.remove(p.mesh);
        projectiles.splice(i, 1);
        balloonGroup.remove(b);
        showQuestion('Balloon Quiz');
        nextBtn.onclick = () => {
          dialogEl.classList.add('hidden');
          spawnBalloon();
        };
        break;
      }
    }
  }

  updateCinematic(dt);
  controls.update();
  renderer.render(scene, camera);
}
animate();

// Resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ===== Helper for fatal errors =====
function showFatal(msg) {
  const d = document.createElement('div');
  d.style.position = 'fixed';
  d.style.inset = '0';
  d.style.display = 'grid';
  d.style.placeItems = 'center';
  d.style.background = 'rgba(0,0,0,.75)';
  d.style.color = 'white';
  d.style.font = '600 16px Inter, system-ui, sans-serif';
  d.style.zIndex = '9999';
  d.textContent = msg;
  document.body.appendChild(d);
}
