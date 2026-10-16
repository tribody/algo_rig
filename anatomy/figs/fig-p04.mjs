// fig-p04.mjs · 前缀和 Prefix Sum
// 装置：一台机械加法机——光标扫过输入格，显示窗滚出前缀和，顶部表针累加摆动。
import { k, surfacePlate, knob, rulerStrip, cells, gauge } from "../lib.mjs";

export function build() {
  const W = 660, H = 380;
  const PLATE = { x: -165, y: -84, w: 330, d: 168, r: 8 };
  const VALUES = [3, 7, 2, 8, 5, 4, 9, 6];
  const N = VALUES.length, CW = 18, GAP = 2, CELL_Y = -58, SCALE = 2.2;
  const X0 = -128;
  const PRE = VALUES.reduce((acc, v, i) => { acc.push((acc[i - 1] ?? 0) + v); return acc; }, []);
  const MAXPRE = PRE[N - 1];
  const MACH = { x: 62, y: -34, w: 54, d: 60, r: 3 };       // 机身
  const MACH_Z = 12;
  const WIN = { x: MACH.x + 8, y: MACH.y + MACH.d - 14, w: 38, d: 0 }; // 前脸显示窗（面 y+）
  const GA = { x: MACH.x + MACH.w / 2, y: MACH.y + 20, r: 14, z: MACH_Z };

  const P = k.fitProjection([...k.boxCorners(PLATE, -17, 0), [GA.x + GA.r, 0, GA.z + 12]], W, H, { pad: 24, azimuth: 42 });
  const strip = cells(P, { x: X0, y: CELL_Y, w: CW, gap: GAP, values: VALUES, scale: SCALE });

  const preNeedleAt = (pre) => {
    const a = Math.PI * 0.75 + (pre / MAXPRE) * Math.PI * 1.5;
    const [x, y] = [GA.x, GA.y];
    return k.lineOnTop([x - Math.sin(a) * 2.6, y + Math.cos(a) * 2.6], [x + Math.sin(a) * (GA.r - 3), y - Math.cos(a) * (GA.r - 3)], GA.z + 8.2, P);
  };

  function machine() {
    const out = [];
    out.push(k.solidSvg(k.slabOf(MACH, 0, MACH_Z, P, 5, 0.8), { tone: "mid" }));
    out.push(k.lineSvg(k.planOutline(k.insetPlan(MACH, 3), MACH_Z, P, 5), { tone: "faint" }));
    out.push(k.dotsSvg(k.corners(MACH, 6).map(([x, y]) => k.iso([x, y, MACH_Z], P)), { size: 0.45 }));
    // 前脸显示窗（凹槽 + 印字）
    const face = { x: WIN.x, y: MACH.y + MACH.d - 13, w: WIN.w, d: 1.2, r: 0.6 };
    out.push(k.solidSvg(k.slabOf(face, 3, 6, P, 2), { tone: "lo", crease: "none" }));
    out.push(k.faceTextSvg(k.sideMatrix([WIN.x + WIN.w / 2, MACH.y + MACH.d + 0.2], 6.4, P, "y"), "PRE[0] = " + PRE[0], { size: 2.6, tone: "hi", anchor: "middle" }).replace("<text ", '<text data-part="win-text" '));
    // 顶部表盘
    out.push(gauge(P, { x: GA.x, y: GA.y, z: GA.z, r: GA.r }, { major: 5, text: "SUM" }));
    // 摇柄 + 送数拨杆
    out.push(knob(P, [MACH.x - 4, MACH.y + 8], MACH_Z - 2, 4.4, 4));
    out.push(k.solidSvg(k.slabOf({ x: MACH.x + MACH.w + 1, y: MACH.y + 6, w: 2.6, d: 12, r: 1 }, MACH_Z - 6, 9, P, 2), { tone: "mid" }));
    out.push(k.lineSvg(k.sideArc(MACH.x + MACH.w + 2.3, MACH.y + 12, 1.3, MACH_Z + 3, P, 12), { tone: "faint" }));
    return out.join("");
  }

  // 光标小卡爪（骑在单元格上）
  function cursor() {
    const out = [];
    out.push(k.solidSvg(k.slabOf({ x: -CW / 2 - 3.5, y: CELL_Y - 4, w: 3, d: 34, r: 1 }, 0, 26, P, 2, 0.4), { tone: "mid" }));
    out.push(k.solidSvg(k.slabOf({ x: CW / 2 + 0.5, y: CELL_Y - 4, w: 3, d: 34, r: 1 }, 0, 26, P, 2, 0.4), { tone: "mid" }));
    out.push(k.solidSvg(k.slabOf({ x: -CW / 2 - 3.5, y: CELL_Y - 4, w: CW + 7, d: 3, r: 1 }, 26, 3, P, 2, 0.4), { tone: "mid" }));
    out.push(knob(P, [0, CELL_Y - 8], 29, 2.6, 3));
    return out.join("");
  }

  // 输入格 → 机身 的供给槽
  const groove = (() => {
    const y = CELL_Y + 13 + 14;
    const from = X0 + N * (CW + GAP) - GAP + 2, to = MACH.x - 3;
    return [
      k.lineSvg([
        k.lineOnTop([from, y - 2.4], [to, y - 2.4], 0.2, P),
        k.lineOnTop([from, y + 2.4], [to, y + 2.4], 0.2, P),
      ].join(""), { tone: "faint", free: true }),
      k.lineSvg(k.lineOnTop([from + 3, y], [to - 3, y], 0.2, P), { tone: "lo", flow: true, free: true }),
    ].join("");
  })();

  const dots = VALUES.map((_, i) =>
    `<circle data-part="dot-${i}" cx="${k.iso([X0 + i * (CW + GAP) + CW / 2, CELL_Y + 13 + 14, 0.4], P)[0]}" cy="${k.iso([X0 + i * (CW + GAP) + CW / 2, CELL_Y + 13 + 14, 0.4], P)[1]}" r="1.6" style="opacity:.12"/>`
  ).join("");

  const body = [
    surfacePlate(P, PLATE, { label: "PREFIX SUM" }),
    strip.out,
    rulerStrip(P, { x: X0 - 6, y: -26, w: strip.totalW + 12, step: CW + GAP, every: 4 }),
    groove,
    machine(),
    `<g data-part="cursor" transform="${k.translateAlong(P, [X0 + CW / 2, 0, 0])}">${cursor()}</g>`,
    `<g class="iso-dots" data-tone="lo">${dots}</g>`,
    `<path data-part="pre-needle" class="iso-line" data-tone="lit" data-free="start" d="${preNeedleAt(PRE[0])}" style="stroke-width:1.1"/>`,
  ];

  const svg = k.figureSvg({
    width: W, height: H,
    label: "An adding machine: a cursor rides across a row of input blocks; each value is fed along a groove into the machine, whose window shows the running prefix sum and whose dial needle steps up with every addition.",
    body,
  });
  const card = k.plateHtml({
    fig: "P04", title: "Prefix Sum / Diff", hint: "hover 扫描 · ←/→ 单格",
    readout: `pre[0] = ${PRE[0]}`,
    keys: [
      { mark: "lit", label: "表针与显示窗：累加和一望即知" },
      { mark: "raised", label: "亮点的格子 = 已入账；光标右侧未处理" },
    ],
    caption: "光标每扫过一格，加法机把值累加进账：显示窗滚出 pre[i]，表针摆到对应刻度。区间和 = 两个前缀相减，一次预计算，O(1) 应答。",
    body: `<div class="iso-stage" tabindex="0" role="slider" aria-label="前缀和装置" aria-valuemin="0" aria-valuemax="${N - 1}" aria-valuenow="0">${svg}</div>`,
  });

  const live = `(function(root){
  const P = ${JSON.stringify(P)};
  const N = ${N}, X0 = ${X0}, CW = ${CW}, GAP = ${GAP};
  const PRE = ${JSON.stringify(PRE)}, MAXPRE = ${MAXPRE};
  const GA = ${JSON.stringify(GA)};
  const rig = rigOf(root), svg = rig.svg, readout = rig.readout, still = rig.still;
  const cursor = svg.querySelector('[data-part="cursor"]');
  const needle = svg.querySelector('[data-part="pre-needle"]');
  const winText = svg.querySelector('[data-part="win-text"]');
  const center = (i) => X0 + i * (CW + GAP) + CW / 2;
  const preNeedleAt = ${preNeedleAt.toString().replace("k.lineOnTop", "lineOnTop")};
  const clamp = (v) => Math.min(1, Math.max(0, v));
  let u = 0, target = 0, clock = 0, steer;
  const drawn = () => {
    const i = Math.round(clamp(u) * (N - 1));
    cursor.setAttribute("transform", translateAlong(P, [center(i), 0, 0]));
    needle.setAttribute("d", preNeedleAt(PRE[i]));
    for (let d = 0; d < N; d++) {
      const el = svg.querySelector('[data-part="dot-' + d + '"]');
      el.style.opacity = d < i ? 0.85 : 0.12;
    }
    const text = "pre[" + i + "] = " + PRE[i];
    if (readout.textContent !== text) readout.textContent = text;
    if (winText.textContent !== text) winText.textContent = text;
    rig.stage.setAttribute("aria-valuenow", String(i));
    rig.stage.setAttribute("aria-valuetext", text);
  };
  const frame = loop(rig, (dt) => {
    if (steer.touring) {
      clock += dt;
      const p = (clock % 9) / 9;
      target = p < 0.6 ? p / 0.6 : p < 0.85 ? 1 : 1 - (p - 0.85) / 0.15;
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
    let i = Math.round(target * (N - 1));
    if (e.key === "ArrowRight" || e.key === "ArrowUp") i = Math.min(N - 1, i + 1);
    else if (e.key === "ArrowLeft" || e.key === "ArrowDown") i = Math.max(0, i - 1);
    else if (e.key === "Home") i = 0;
    else if (e.key === "End") i = N - 1;
    else return;
    e.preventDefault(); steer.manual(); target = i / (N - 1); frame.wake();
  });
  drawn();
})
`;
  return { id: "p04", card, live };
}
