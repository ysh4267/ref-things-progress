// Things 의 프로젝트 진행 원을 레퍼런스 영상 그대로 다시 그린다.
// 모든 수치는 영상(1920x1080)을 프레임 단위로 재서 얻은 값이고, 단위는 영상 픽셀이다.
// 체크리스트 항목을 누르면 제목 옆 원 안의 파이가 12시부터 시계 방향으로 차오르고, 풀면 다시 줄어든다.
// 화면에는 이 동작에 필요한 제목 줄과 체크리스트만 둔다(사이드바와 창 장식은 뺐다).

const NS = 'http://www.w3.org/2000/svg';
const scene = document.getElementById('scene');

const RING = { cx: 829.8, cy: 406.5, r: 29.75, width: 7.5, pie: 21.5, ring: '#79a5ee', fill: '#73a8fb' };
const SWEEP_ON = 90; // 파이가 차는 시간(ms)
const SWEEP_OFF = 100; // 줄어드는 시간(ms)

// 영상과 같은 크기로, 남긴 요소들이 화면 가운데 오도록 구도를 옮긴다. ?full 이면 영상 구도 그대로(비교 도구용).
const FULL = new URLSearchParams(location.search).has('full');
const VIEW = FULL ? '0 0 1920 1080' : '60 97 1920 1080';

const ITEMS = [
  { label: 'Sugar', cy: 712, baseline: 726, ink: 111 },
  { label: 'Spice', cy: 797, baseline: 810, ink: 105 },
  { label: 'Everything nice', cy: 882, baseline: 895, ink: 296 },
];

function el(tag, attrs = {}, parent = scene) {
  const node = document.createElementNS(NS, tag);
  for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, value);
  parent?.append(node);
  return node;
}

/* ------------------------------------------------------------- 글자 맞추기 */

// 영상의 글꼴은 맥의 시스템 글꼴이다. Inter 로 대신하되, 대문자 높이와 잉크 폭을 영상과 같게 맞춘다.
const measure = document.createElement('canvas').getContext('2d');
const capRatio = {};
const fitted = [];

function capOf(weight) {
  if (!capRatio[weight]) {
    measure.font = `${weight} 100px Inter`;
    capRatio[weight] = measure.measureText('H').actualBoundingBoxAscent / 100;
  }
  return capRatio[weight];
}

function fitText(node, spec) {
  const size = spec.cap / capOf(spec.weight);
  measure.font = `${spec.weight} ${size}px Inter`;
  const m = measure.measureText(spec.text);
  const natural = m.actualBoundingBoxRight + m.actualBoundingBoxLeft;
  const gaps = Math.max(1, [...spec.text].length - 1);
  node.textContent = spec.text;
  node.setAttribute('x', (spec.x + m.actualBoundingBoxLeft).toFixed(2));
  node.setAttribute('y', spec.y);
  node.style.font = `${spec.weight} ${size.toFixed(3)}px Inter, sans-serif`;
  node.style.letterSpacing = `${((spec.ink - natural) / gaps).toFixed(3)}px`;
}

function text(spec, attrs = {}, parent = scene) {
  const node = el('text', attrs, parent);
  if (spec.fill) node.setAttribute('fill', spec.fill);
  fitted.push([node, spec]);
  fitText(node, spec);
  return node;
}

/* ------------------------------------------------------------- 진행 원 */

function piePath(cx, cy, r, fraction) {
  if (fraction <= 0.0005) return '';
  if (fraction >= 0.9995) return `M${cx} ${cy - r}a${r} ${r} 0 1 1 0 ${2 * r}a${r} ${r} 0 1 1 0 ${-2 * r}Z`;
  const a = -Math.PI / 2 + fraction * Math.PI * 2;
  const x = cx + r * Math.cos(a);
  const y = cy + r * Math.sin(a);
  return `M${cx} ${cy}V${cy - r}A${r} ${r} 0 ${fraction > 0.5 ? 1 : 0} 1 ${x.toFixed(3)} ${y.toFixed(3)}Z`;
}

/* ------------------------------------------------------------- 장면 */

const rows = [];
let pie = null;

function build() {
  scene.setAttribute('viewBox', VIEW);
  scene.setAttribute('preserveAspectRatio', FULL ? 'xMinYMin slice' : 'xMidYMid slice');
  el('rect', { x: -2000, y: -2000, width: 6000, height: 6000, fill: '#232323' });

  el('circle', { cx: RING.cx, cy: RING.cy, r: RING.r, fill: 'none', stroke: RING.ring, 'stroke-width': RING.width });
  pie = el('path', { fill: RING.fill });
  text({ text: 'Project X', x: 887, y: 429.5, cap: 48.5, ink: 279, weight: 700, fill: '#fefefe' });
  for (const cx of [1200.5, 1220.5, 1240.5]) el('circle', { cx, cy: 408.5, r: 4.7, fill: '#a5a5a7' });

  for (const item of ITEMS) {
    const g = el('g', { class: 'row' });
    el('rect', { class: 'band', x: 760, y: item.cy - 42.5, width: 1006, height: 85, rx: 16, fill: '#39393b' }, g);
    const box = el('g', { class: 'box' }, g);
    el('rect', { class: 'outline', x: 789.5, y: item.cy - 16.5, width: 33, height: 33, rx: 8, fill: 'none', stroke: '#5d5e5e', 'stroke-width': 2.8 }, box);
    const fill = el('g', { class: 'fill' }, box);
    el('rect', { x: 788, y: item.cy - 18, width: 36, height: 36, rx: 8.5, fill: '#66acfe' }, fill);
    el('path', { class: 'check', d: `M797.5 ${item.cy + 0.5}l6 6.2 11.5-13`, pathLength: 1, fill: 'none', stroke: '#fff', 'stroke-width': 3.6, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, fill);
    text({ text: item.label, x: 854.5, y: item.baseline, cap: 30, ink: item.ink, weight: 500 }, { class: 'label' }, g);
    const hit = el('rect', { class: 'hit', x: 774, y: item.cy - 32, width: 64, height: 64, role: 'checkbox', tabindex: 0, 'aria-label': item.label, 'aria-checked': 'false' }, g);
    rows.push({ g, hit, done: false });
  }
}

/* ------------------------------------------------------------- 움직임 */

const progress = { value: 0, from: 0, to: 0, start: 0, ms: 0 };
let frame = 0;
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

function drawPie() {
  pie.setAttribute('d', piePath(RING.cx, RING.cy, RING.pie, progress.value));
}

function tick(now) {
  frame = 0;
  const t = Math.min(1, (now - progress.start) / progress.ms);
  progress.value = progress.from + (progress.to - progress.from) * easeInOut(t);
  drawPie();
  if (t < 1) frame = requestAnimationFrame(tick);
}

function sweepTo(value, ms) {
  Object.assign(progress, { from: progress.value, to: value, start: performance.now(), ms });
  if (!frame) frame = requestAnimationFrame(tick);
}

function setDone(row, done) {
  row.done = done;
  row.g.classList.toggle('done', done);
  row.hit.setAttribute('aria-checked', String(done));
  const count = rows.filter((r) => r.done).length;
  sweepTo(count / rows.length, done ? SWEEP_ON : SWEEP_OFF);
}

// 누르는 동안 줄이 강조되고, 손을 떼는 순간 체크가 바뀐다.
function wire(row) {
  const press = (on) => row.g.classList.toggle('pressed', on);
  row.hit.addEventListener('pointerdown', (event) => {
    if (event.button !== 0) return;
    row.hit.setPointerCapture(event.pointerId);
    press(true);
  });
  row.hit.addEventListener('pointerup', (event) => {
    if (!row.g.classList.contains('pressed')) return;
    press(false);
    const box = row.hit.getBoundingClientRect();
    const inside = event.clientX >= box.left && event.clientX <= box.right && event.clientY >= box.top && event.clientY <= box.bottom;
    if (inside) setDone(row, !row.done);
  });
  row.hit.addEventListener('pointercancel', () => press(false));
  row.hit.addEventListener('keydown', (event) => {
    if (event.key !== ' ' && event.key !== 'Enter') return;
    event.preventDefault();
    setDone(row, !row.done);
  });
}

/* ------------------------------------------------------------- 시연 */

// 갤러리 미리보기용. 주소에 ?demo 를 붙이면 영상처럼 차례로 체크하고 푼다.
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function tap(row) {
  row.g.classList.add('pressed');
  await wait(140);
  row.g.classList.remove('pressed');
  setDone(row, !row.done);
}

async function demo() {
  for (const row of rows) row.hit.style.pointerEvents = 'none';
  for (;;) {
    await wait(800);
    for (const row of rows) {
      await tap(row);
      await wait(1100);
    }
    await wait(500);
    for (const row of [...rows].reverse()) {
      await tap(row);
      await wait(900);
    }
  }
}

// 비교 도구(tools/compare.html?…&page=/things/?full)가 영상의 한 장면과 같은 상태를 바로 만들 때 쓴다.
window.__page = {
  pose({ done = [], pressed = -1, value } = {}) {
    rows.forEach((row, i) => {
      row.done = done.includes(i);
      row.g.classList.toggle('done', row.done);
      row.g.classList.toggle('pressed', i === pressed);
    });
    progress.value = value ?? rows.filter((r) => r.done).length / rows.length;
    drawPie();
  },
};

build();
for (const row of rows) wire(row);
drawPie();
Promise.all([500, 700].map((weight) => document.fonts.load(`${weight} 40px Inter`)))
  .catch(() => {})
  .then(() => {
    for (const key of Object.keys(capRatio)) delete capRatio[key];
    for (const [node, spec] of fitted) fitText(node, spec);
  });
if (new URLSearchParams(location.search).has('demo')) demo();
