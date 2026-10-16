// fig-p07.mjs · 拓扑排序 Topological Sort
// 装置：六只齿轮只能按依赖顺序上轴——入度为零的先装；装一只，卸掉它压住的依赖线。
import { k, surfacePlate } from "../lib.mjs";

export function build() {
  const W = 660, H = 400;
  const PLATE = { x: -165, y: -100, w: 330, d: 200, r: 8 };
  const NAMES = ["A", "B", "C", "D", "E", "F"];
  const POS = { A: [-96, -52], B: [-30, -66], C: [24, -30], D: [-120, 6], E: [-58, 12], F: [40, 44] };
  const EDGES = [["D", "A"], ["D", "B"], ["A", "C"], ["B", "C"], ["A", "E"], ["C", "F"]];
  // Kahn 序：D, A, B, E, C, F
  const ORDER = ["D", "A", "B", "E", "C", "F"];
  const GR = 9, PEG_H = 6, GEAR_Z = PEG_H;
  const TRAY = { x: 92, y: -66, w: 42, d: 118, r: 2 };

  const P = k.fitProjection([...k.boxCorners(PLATE, -17, 0), [TRAY.x + 20, 0, 40]], W, H, { pad: 24, azimuth: 42 });

  function pegsAndEdges() {
    const out = [];
    // 依赖刻线（源 → 目标，端点小圆点收尾）
    const segs = [], dotPts = [];
    for (const [a, b] of EDGES) {
      const [x1, y1] = POS[a], [x2, y2] = POS[b];
      const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy);
      const ux = dx / L, uy = dy / L;
      segs.push(k.lineOnTop([x1 + ux * (GR + 2), y1 + uy * (GR + 2)], [x2 - ux * (GR + 2), y2 - uy * (GR + 2)], 0.3, P));
      dotPts.push([x1 + ux * (GR + 2), y1 + uy * (GR + 2), 0.3], [x2 - ux * (GR + 2), y2 - uy * (GR + 2), 0.3]);
    }
    out.push(k.lineSvg(segs.join(""), { tone: "lo" }));
    out.push(k.dotsSvg(dotPts.map(([x, y, z]) => k.iso([x, y, z], P)), { size: 0.55, tone: "mid" }));
    // 轴柱
    for (const n of NAMES) {
      const [x, y] = POS[n];
      out.push(k.solidSvg(k.cylinder(x, y, 4.6, 0, 2, P, 24), { tone: "mid" }));
      out.push(k.solidSvg(k.cylinder(x, y, 2.4, 2, PEG_H - 2, P, 20), { tone: "mid", crease: "none" }));
      out.push(k.dotsSvg([k.iso([x, y, PEG_H], P)], { size: 0.45 }));
      out.push(k.faceTextSvg(k.topMatrix([x - GR - 3, y - GR - 1], 0.2, P, "x"), n, { size: 2.6, tone: "lo", anchor: "middle" }));
    }
    return out.join("");
  }

  function gear(n) {
    const out = [];
    out.push(k.solidSvg(k.cylinder(0, 0, GR, 0, 4.4, P, 40, 0.6), { tone: "hi", crease: "lo" }));
    out.push(k.lineSvg(k.knurl(0, 0, GR, 0.6, 4.4, 26, P, 0.4), { tone: "mid" }));
    out.push(k.lineSvg(k.ring(0, 0, 3.4, 4.4, P, 24), { tone: "lo" }));
    out.push(k.dotsSvg([k.iso([0, 0, 4.4], P)], { size: 0.6, tone: "mid" }));
    out.push(k.faceTextSvg(k.topMatrix([0, 0], 4.4, P, "x"), n, { size: 2.6, tone: "lo", anchor: "middle" }));
    return out.join("");
  }

  // 初始：托盘里叠放；live 里逐只飞到轴上
  const gearGroups = NAMES.map((n, i) => {
    const [tx, ty] = [TRAY.x + 21, TRAY.y + 14 + i * 19];
    const [px, py] = POS[n];
    return `<g data-part="gear-${n}" data-home="${[px, py].join(",")}" data-tray="${[tx, ty].join(",")}" transform="${k.translateAlong(P, [tx, ty, 3 + i * 0.01])}">${gear(n)}</g>`;
  }).join("");

  const body = [
    surfacePlate(P, PLATE, { label: "TOPO SORT" }),
    k.solidSvg(k.slabOf(TRAY, 0, 3, P, 4, 0.5), { tone: "mid" }),
    k.lineSvg(k.planOutline(k.insetPlan(TRAY, 2), 3, P, 4), { tone: "faint" }),
    pegsAndEdges(),
    gearGroups,
  ];

  const svg = k.figureSvg({
    width: W, height: H,
    label: "Six gears wait in a tray beside six pegs joined by dependency lines; a gear may only mount when no incoming line touches it, so they fly up in Kahn order.",
    body,
  });
  const card = k.plateHtml({
    fig: "P07", title: "Topological Sort", hint: "hover 推进装配 · ←/→ 单步",
    readout: "已装 0/6 · 入度为零：D",
    keys: [
      { mark: "lit", label: "托盘齿轮：入度清零才允许上轴" },
      { mark: "raised", label: "刻线 = 依赖：装一只卸一条" },
    ],
    caption: "齿轮 D 没有任何线压着（入度 0）先上轴；它一落座，指向 A、B 的线就卸掉——入度清零的齿轮依次上轴。全部装完 = 无环；装不完 = 有环。",
    body: `<div class="iso-stage" tabindex="0" role="slider" aria-label="拓扑排序装置" aria-valuemin="0" aria-valuemax="6" aria-valuenow="0">${svg}</div>`,
  });

  const live = `(function(root){
  const P = ${JSON.stringify(P)};
  const ORDER = ${JSON.stringify(ORDER)};
  const POS = ${JSON.stringify(POS)};
  const GEAR_Z = ${GEAR_Z};
  const rig = rigOf(root), svg = rig.svg, readout = rig.readout, still = rig.still;
  const gears = {};
  for (const n of ORDER) gears[n] = svg.querySelector('[data-part="gear-' + n + '"]');
  const homes = {}, trays = {};
  for (const n of ORDER) {
    homes[n] = gears[n].dataset.home.split(",").map(Number);
    trays[n] = gears[n].dataset.tray.split(",").map(Number);
  }
  const clamp = (v) => Math.min(1, Math.max(0, v));
  let u = 0, target = 0, clock = 0, steer;
  // 每只齿轮的展示位置：已装 → 轴上；未装 → 托盘
  const placed = (n, count) => ORDER.indexOf(n) < count;
  const drawn = () => {
    const count = Math.round(clamp(u) * ORDER.length);
    for (const n of ORDER) {
      const g = gears[n];
      const to = placed(n, count) ? [homes[n][0], homes[n][1], GEAR_Z] : [trays[n][0], trays[n][1], 3.2];
      g.setAttribute("transform", translateAlong(P, to));
    }
    const next = ORDER[count];
    const text = count === ORDER.length
      ? "全部装上 · 拓扑序 " + ORDER.join("→")
      : "已装 " + count + "/6 · 入度为零：" + next + " · 序 " + ORDER.slice(0, count).join("→") + (count ? "→" : "");
    if (readout.textContent !== text) readout.textContent = text;
    rig.stage.setAttribute("aria-valuenow", String(count));
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
  return { id: "p07", card, live };
}
