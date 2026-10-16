// fig-p11.mjs · 图论：最短路 / 最小生成树
// 装置：供水阀门网——Dijkstra 的压力波从水源逐站开阀，站表读出最短距离。
import { k, surfacePlate } from "../lib.mjs";

export function build() {
  const W = 660, H = 400;
  const PLATE = { x: -165, y: -100, w: 330, d: 200, r: 8 };
  const ST = { S: [0, -12], A: [-84, -50], B: [72, -56], C: [-46, 52], D: [96, 34] };
  const NAMES = ["S", "A", "B", "C", "D"];
  const EDGES = [["S", "A", 4], ["S", "B", 10], ["A", "C", 5], ["B", "C", 2], ["B", "D", 3], ["C", "D", 7]];
  const ORDER = ["S", "A", "C", "B", "D"];         // Dijkstra 定序
  const DIST = { S: 0, A: 4, C: 9, B: 10, D: 13 };

  const P = k.fitProjection([...k.boxCorners(PLATE, -17, 0), [0, 0, 30]], W, H, { pad: 24, azimuth: 42 });

  function net() {
    const out = [];
    // 沟槽（两侧线）+ 流水线（data-part，live 控制显隐）
    const sides = [];
    for (const [a, b, w] of EDGES) {
      const [x1, y1] = ST[a], [x2, y2] = ST[b];
      const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy);
      const ux = dx / L, uy = dy / L, nx = -uy * 2.6, ny = ux * 2.6;
      sides.push(k.lineOnTop([x1 + ux * 9 + nx, y1 + uy * 9 + ny], [x2 - ux * 9 + nx, y2 - uy * 9 + ny], 0.25, P));
      sides.push(k.lineOnTop([x1 + ux * 9 - nx, y1 + uy * 9 - ny], [x2 - ux * 9 - nx, y2 - uy * 9 - ny], 0.25, P));
      const mx = (x1 + x2) / 2 + ny * 4.6, my = (y1 + y2) / 2 - nx * 4.6;
      out.push(k.faceTextSvg(k.topMatrix([mx, my], 0.2, P, "x"), String(w), { size: 2.4, tone: "lo", anchor: "middle" }));
      out.push(`<path data-part="flow-${a}${b}" class="iso-line" data-tone="green" data-flow d="${k.lineOnTop([x1 + ux * 6.5, y1 + uy * 6.5], [x2 - ux * 6.5, y2 - uy * 6.5], 0.3, P)}" style="opacity:0"/>`);
    }
    out.push(k.lineSvg(sides.join(""), { tone: "faint", free: true }));
    // 站：基座 + 立柱 + 手轮 + 站名 + 距离读牌
    for (const n of NAMES) {
      const [x, y] = ST[n];
      out.push(k.solidSvg(k.cylinder(x, y, 6.4, 0, 2.2, P, 28), { tone: "mid" }));
      out.push(k.lineSvg(k.ring(x, y, 6.4, 2.2, P, 28), { tone: "lo" }));
      out.push(k.solidSvg(k.cylinder(x, y, 2.4, 2.2, 12, P, 18), { tone: "mid", crease: "none" }));
      out.push(k.lineSvg(k.ring(x, y, 6, 14.4, P, 32), { tone: "mid" }));
      const spokes = [];
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
        spokes.push(k.lineOnTop([x - Math.cos(a) * 1.2, y - Math.sin(a) * 1.2], [x + Math.cos(a) * 5.6, y + Math.sin(a) * 5.6], 14.4, P));
      }
      out.push(k.lineSvg(spokes.join(""), { tone: "mid" }));
      out.push(k.dotsSvg([k.iso([x, y, 14.4], P)], { size: 0.6, tone: "hi" }));
      out.push(k.faceTextSvg(k.topMatrix([x - 10, y - 12], 0.2, P, "x"), n, { size: 3, tone: "hi", anchor: "middle" }));
      out.push(`<text data-part="dist-${n}" class="iso-face-text" data-tone="lo" transform="${k.topMatrix([x + 2, y + 12], 0.2, P, "x")}" font-size="2.6" text-anchor="middle" style="opacity:0">d=${DIST[n]}</text>`);
      out.push(`<circle data-part="lamp-${n}" cx="${k.iso([x, y, 15.4], P)[0]}" cy="${k.iso([x, y, 15.4], P)[1]}" r="1.7" fill="none" stroke="var(--anatomy-green)" stroke-width="1" style="opacity:0"/>`);
    }
    return out.join("");
  }

  const body = [
    surfacePlate(P, PLATE, { label: "DIJKSTRA VALVES" }),
    net(),
  ];

  const svg = k.figureSvg({
    width: W, height: H,
    label: "A water valve network: pressure waves from the source open valves in order of shortest distance; each station's plaque shows its final distance once settled.",
    body,
  });
  const card = k.plateHtml({
    fig: "P11", title: "Shortest Path & MST", hint: "hover 开阀 · ←/→ 单站",
    readout: "已定 0/5 站",
    keys: [
      { mark: "lit", label: "绿圈 + 流水：该站最短距离已敲定" },
      { mark: "raised", label: "沟槽刻度 = 边权；压力波逐站开阀" },
    ],
    caption: "水源 S 起压，每一步选「已定站能到达的最近一站」开阀——贪心成立是因为边权非负。Kruskal 求最小生成树则是另一台机器：边排序 + 并查集挑不成环的。",
    body: `<div class="iso-stage" tabindex="0" role="slider" aria-label="最短路阀门装置" aria-valuemin="0" aria-valuemax="5" aria-valuenow="0">${svg}</div>`,
  });

  const live = `(function(root){
  const P = ${JSON.stringify(P)};
  const ORDER = ${JSON.stringify(ORDER)};
  const DIST = ${JSON.stringify(DIST)};
  const EDGES = ${JSON.stringify(EDGES)};
  const rig = rigOf(root), svg = rig.svg, readout = rig.readout, still = rig.still;
  const clamp = (v) => Math.min(1, Math.max(0, v));
  let u = 0, target = 0, clock = 0, steer;
  const drawn = () => {
    const n = Math.round(clamp(u) * ORDER.length);
    const set = new Set(ORDER.slice(0, n));
    for (const [a, b] of EDGES) {
      const el = svg.querySelector('[data-part="flow-' + a + b + '"]');
      if (el) el.style.opacity = set.has(a) && set.has(b) ? 0.85 : 0;
    }
    for (const nm of ORDER) {
      const lamp = svg.querySelector('[data-part="lamp-' + nm + '"]');
      const dist = svg.querySelector('[data-part="dist-' + nm + '"]');
      const on = set.has(nm);
      if (lamp) lamp.style.opacity = on ? 0.95 : 0;
      if (dist) dist.style.opacity = on ? 0.9 : 0;
    }
    const text = n === 0 ? "已定 0/5 站"
      : "已定 " + n + "/5 站 · " + ORDER.slice(0, n).map(s => s + "=" + DIST[s]).join(" · ");
    if (readout.textContent !== text) readout.textContent = text;
    rig.stage.setAttribute("aria-valuenow", String(n));
    rig.stage.setAttribute("aria-valuetext", text);
  };
  const frame = loop(rig, (dt) => {
    if (steer.touring) {
      clock += dt;
      const p = (clock % 11) / 11;
      target = p < 0.64 ? p / 0.64 : p < 0.86 ? 1 : 1 - (p - 0.86) / 0.14;
    }
    u = still.matches ? target : u + (target - u) * (1 - Math.exp(-dt / 0.34));
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
    let c = Math.round(target * ORDER.length);
    if (e.key === "ArrowRight" || e.key === "ArrowUp") c = Math.min(ORDER.length, c + 1);
    else if (e.key === "ArrowLeft" || e.key === "ArrowDown") c = Math.max(0, c - 1);
    else if (e.key === "Home") c = 0;
    else if (e.key === "End") c = ORDER.length;
    else return;
    e.preventDefault(); steer.manual(); target = c / ORDER.length; frame.wake();
  });
  drawn();
})
`;
  return { id: "p11", card, live };
}
