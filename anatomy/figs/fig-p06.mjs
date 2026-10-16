// fig-p06.mjs · BFS / DFS
// 装置：继电器交换板——20 只信号灯由导线连成网格；BFS 按环距波纹点亮，DFS 沿一条路径深潜。
import { k, surfacePlate } from "../lib.mjs";

export function build() {
  const W = 620, H = 400;
  const PLATE = { x: -150, y: -105, w: 300, d: 210, r: 8 };
  const COLS = 5, ROWS = 4, GAPX = 44, GAPY = 40;
  const OX = -2 * GAPX, OY = -1.5 * GAPY + 6;        // 网格原点
  const pos = (c, r) => [OX + c * GAPX, OY + r * GAPY];
  const SRC = [0, 0];

  // BFS 环距序 / DFS 深潜序（预先算好）
  const dist = (c, r) => Math.abs(c - SRC[0]) + Math.abs(r - SRC[1]);
  const BFS_ORDER = [];
  for (const [c, r] of Array.from({ length: COLS * ROWS }, (_, i) => [i % COLS, Math.floor(i / COLS)])) BFS_ORDER.push([c, r, dist(c, r)]);
  BFS_ORDER.sort((a, b) => a[2] - b[2]);
  const DFS_ORDER = [];
  const seen = new Set();
  (function dfs(c, r) {
    if (c < 0 || r < 0 || c >= COLS || r >= ROWS || seen.has(c + "," + r)) return;
    seen.add(c + "," + r); DFS_ORDER.push([c, r]);
    dfs(c + 1, r); dfs(c, r + 1); dfs(c - 1, r); dfs(c, r - 1);
  })(0, 0);
  const idxOf = (list, c, r) => list.findIndex(([a, b]) => a === c && b === r);
  const TOTAL = COLS * ROWS;

  const P = k.fitProjection([...k.boxCorners(PLATE, -17, 0), [0, 0, 18]], W, H, { pad: 26, azimuth: 42 });

  function board() {
    const out = [];
    // 导线（相邻灯之间）
    const segs = [];
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      const [x, y] = pos(c, r);
      if (c + 1 < COLS) { const [x2] = pos(c + 1, r); segs.push(k.lineOnTop([x + 3, y], [x2 - 3, y], 0.4, P)); }
      if (r + 1 < ROWS) { const [, y2] = pos(c, r + 1); segs.push(k.lineOnTop([x, y + 3], [x, y2 - 3], 0.4, P)); }
    }
    out.push(k.lineSvg(segs.join(""), { tone: "faint" }));
    // 灯座
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      const [x, y] = pos(c, r);
      out.push(k.solidSvg(k.cylinder(x, y, 3.2, 0, 5, P, 24), { tone: "mid" }));
      out.push(k.solidSvg(k.cylinder(x, y, 2.5, 5, 2, P, 24, 0.6), { tone: "hi", crease: "lo" }));
      out.push(k.lineSvg(k.ring(x, y, 3.9, 0.2, P, 24), { tone: "faint" }));
      const isSrc = c === SRC[0] && r === SRC[1];
      const [sx, sy] = k.iso([x, y, 7.2], P);
      out.push(`<circle data-part="lamp-${c}-${r}" cx="${sx}" cy="${sy}" r="2" fill="none" stroke="var(--anatomy-lit)" stroke-width="1" style="opacity:${isSrc ? 0.95 : 0}"/>`);
      if (isSrc) out.push(k.faceTextSvg(k.topMatrix([x, y - 6], 0.2, P, "x"), "SRC", { size: 2, tone: "lo", anchor: "middle" }));
    }
    return out.join("");
  }

  const body = [
    surfacePlate(P, PLATE, { label: "BFS · DFS" }),
    board(),
  ];

  const svg = k.figureSvg({
    width: W, height: H,
    label: "A relay panel of 20 lamps wired in a grid: BFS lights them ring by ring from the source; DFS snakes along one path as deep as it goes before backtracking.",
    body,
  });
  const card = k.plateHtml({
    fig: "P06", title: "BFS / DFS", hint: "hover 推进 · B/D 切换",
    readout: "BFS · ring 0 · lit 1/20",
    keys: [
      { mark: "lit", label: "亮环 = 已点亮的继电器" },
      { mark: "raised", label: "BFS 波纹按层扩散 · DFS 单线深潜" },
    ],
    caption: "同一张电网，两种点火顺序：BFS 按到源点的环距逐层点亮（无权最短路），DFS 一条路走到黑再回溯。网格图上两者都是 O(V+E)。",
    body: `<div class="iso-stage" tabindex="0" role="slider" aria-label="BFS DFS 装置" aria-valuemin="0" aria-valuemax="${TOTAL}" aria-valuenow="1">${svg}</div>`,
  });

  const live = `(function(root){
  const P = ${JSON.stringify(P)};
  const TOTAL = ${TOTAL}, COLS = ${COLS}, ROWS = ${ROWS};
  const BFS = ${JSON.stringify(BFS_ORDER)};
  const DFS = ${JSON.stringify(DFS_ORDER)};
  const rig = rigOf(root), svg = rig.svg, readout = rig.readout, still = rig.still;
  const lamps = [];
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) lamps.push(svg.querySelector('[data-part="lamp-' + c + '-' + r + '"]'));
  const clamp = (v) => Math.min(1, Math.max(0, v));
  let mode = "BFS", u = 1 / TOTAL, target = 1 / TOTAL, clock = 0, steer;
  const drawn = () => {
    const list = mode === "BFS" ? BFS : DFS;
    const t = Math.round(clamp(u) * TOTAL);
    for (let i = 0; i < TOTAL; i++) {
      const [c, r] = list[i];
      const el = lamps[r * COLS + c];
      const on = i < t;
      const op = el.style.opacity !== (on ? "0.95" : "0") ? (on ? "0.95" : "0") : el.style.opacity;
      if (el.style.opacity !== op) el.style.opacity = op;
    }
    const ring = mode === "BFS" && t > 0 ? BFS[Math.min(t, TOTAL) - 1][2] : 0;
    const text = mode + " · " + (mode === "BFS" ? "ring " + ring : "depth " + t) + " · lit " + t + "/" + TOTAL;
    if (readout.textContent !== text) readout.textContent = text;
    rig.stage.setAttribute("aria-valuenow", String(t));
    rig.stage.setAttribute("aria-valuetext", text);
  };
  const frame = loop(rig, (dt) => {
    if (steer.touring) {
      clock += dt;
      const p = (clock % 12) / 12;
      target = p < 0.68 ? p / 0.68 : p < 0.88 ? 1 : 1 - (p - 0.88) / 0.12;
    }
    u = still.matches ? target : u + (target - u) * (1 - Math.exp(-dt / 0.3));
    if (Math.abs(target - u) < 0.001) u = target;
    drawn();
    return !steer.touring && u === target;
  });
  steer = steerOf(rig, { onTour: () => { clock = 0; }, wake: frame.wake });
  if (still.matches) steer.touring = false;
  rig.stage.addEventListener("pointermove", (e) => {
    const box = svg.getBoundingClientRect();
    steer.manual(); target = clamp((e.clientX - box.left) / box.width); frame.wake();
  });
  rig.stage.addEventListener("pointerleave", () => steer.manual());
  rig.stage.addEventListener("keydown", (e) => {
    const k = e.key.toLowerCase();
    if (k === "b" || k === "d") { mode = k.toUpperCase(); steer.manual(); target = u; frame.wake(); }
    else if (e.key === "ArrowRight") { steer.manual(); target = clamp(u + 1 / TOTAL); frame.wake(); }
    else if (e.key === "ArrowLeft") { steer.manual(); target = clamp(u - 1 / TOTAL); frame.wake(); }
  });
  drawn();
})
`;
  return { id: "p06", card, live };
}
