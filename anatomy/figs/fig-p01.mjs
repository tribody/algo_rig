// fig-p01.mjs · 双指针 Two Pointers
// 装置：坐标测量机式的两台桥式小车，从导轨两端相向滑行；
// 悬臂下的探针读到下方单元格（高度=值），每步舍弃一端，相遇即答案。
import { k, surfacePlate, rails, knob, rulerStrip, cells, post, wheels } from "../lib.mjs";

export function build() {
  const W = 660, H = 380;
  const PLATE = { x: -165, y: -84, w: 330, d: 168, r: 8 };
  const VALUES = [5, 8, 2, 9, 3, 10, 4, 6, 1, 8, 3];
  const TARGET = 5;                       // 相遇下标
  const CW = 18, GAP = 2, CELL_Y = -60, SCALE = 3;
  const N = VALUES.length;
  const STEPS = TARGET;                   // 11 格，5 步相遇
  const X0 = -(N * (CW + GAP) - GAP) / 2;
  const ARM_Z = 72, NEEDLE_LEN = 38;
  const TOPS = VALUES.map((v) => Math.max(2, v * SCALE));

  const P = k.fitProjection(
    [...k.boxCorners(PLATE, -17, 0), [0, 0, 86]],
    W, H, { pad: 24, azimuth: 42 },
  );

  const strip = cells(P, { x: X0, y: CELL_Y, w: CW, gap: GAP, values: VALUES, scale: SCALE });
  const center = (i) => X0 + i * (CW + GAP) + CW / 2;

  // ── 车体（左右共用几何，data-part 区分） ─────────────────
  function carriage() {
    const out = [];
    out.push(`<path class="iso-halo" d="${k.haloOf(k.insetPlan(CAR, 3), 3, 0.1, P)}" style="filter:blur(4px)"/>`);
    out.push(k.solidSvg(k.slabOf(CAR, 3, 5, P, 5, 0.6), { tone: "mid" }));
    out.push(k.lineSvg(k.planOutline(k.insetPlan(CAR, 2), 8, P, 5), { tone: "faint" }));
    out.push(k.dotsSvg(k.corners(CAR, 4).map(([x, y]) => k.iso([x, y, 8], P)), { size: 0.4, tone: "lo" }));
    // 立柱 + 顶端旋钮
    out.push(post(P, [0, 2], 8, 70, 3.6));
    out.push(knob(P, [0, 2], 78, 4.2, 4));
    // 悬臂：从立柱伸到单元格上方
    out.push(k.solidSvg(k.slabOf({ x: -2.5, y: -47, w: 5, d: 50, r: 1 }, ARM_Z, 4, P, 3, 0.4), { tone: "mid" }));
    out.push(k.lineSvg(k.planOutline(k.insetPlan({ x: -2.5, y: -47, w: 5, d: 50, r: 1 }, 1), ARM_Z + 4, P, 3), { tone: "faint" }));
    // 悬臂配重块 + 导向轴套
    out.push(k.solidSvg(k.slabOf({ x: -5, y: -6, w: 10, d: 12, r: 1.5 }, ARM_Z - 5, 5, P, 3, 0.5), { tone: "mid" }));
    out.push(k.solidSvg(k.cylinder(0, -45, 1.7, ARM_Z - 2, 2, P, 20), { tone: "mid", crease: "none" }));
    out.push(k.lineSvg(k.sideArc(0, -45, 1.7, ARM_Z, P, 14), { tone: "faint" }));
    // 车头把手
    out.push(knob(P, [CAR.x + CAR.w - 6, CAR.y + CAR.d - 2], 8, 2.8, 4));
    return out.join("");
  }
  const CAR = { x: -14, y: -8, w: 28, d: 42, r: 2 };

  function needle() {
    const out = [];
    out.push(k.solidSvg(k.cylinder(0, -45, 0.9, 0, NEEDLE_LEN, P, 14), { tone: "hi", lit: true, crease: "none" }));
    out.push(k.dotsSvg([k.iso([0, -45, 0], P)], { size: 0.55, tone: "hi" }));
    return out.join("");
  }

  // ── 目标标记：前标尺上朝下的小箭头刻线 ───────────────────
  const targetMark = `M ${k.iso([center(TARGET), -24, 0.6], P).slice(0, 2).join(" ")} l -2.4 -4 M ${k.iso([center(TARGET), -24, 0.6], P).slice(0, 2).join(" ")} l 2.4 -4`;

  const body = [
    surfacePlate(P, PLATE, { label: "TWO POINTERS" }),
    strip.out,
    rulerStrip(P, { x: X0 - 6, y: -26, w: strip.totalW + 12, step: CW + GAP, every: 5 }),
    k.lineSvg(targetMark, { tone: "mid", free: "start" }),
    rails(P, { from: X0 - 16, to: -X0 + 16, ys: [-2, 28] }),
    `<g data-part="car-l" transform="${k.translateAlong(P, [center(0), 0, 0])}">${carriage()}</g>`,
    `<g data-part="car-r" transform="${k.translateAlong(P, [center(N - 1), 0, 0])}">${carriage()}</g>`,
    `<g data-part="needle-l" transform="${k.translateAlong(P, [center(0), 0, TOPS[0]])}">${needle()}</g>`,
    `<g data-part="needle-r" transform="${k.translateAlong(P, [center(N - 1), 0, TOPS[N - 1]])}">${needle()}</g>`,
  ];

  const svg = k.figureSvg({
    width: W, height: H,
    label: "Two coordinate-measuring bridges slide toward each other along rails; each probe reads the height of the cell beneath it. Where they meet is the answer.",
    body,
  });

  const card = k.plateHtml({
    fig: "P01", title: "Two Pointers", hint: "hover 移动 · ←/→ 单步",
    readout: `l = a[0] = ${VALUES[0]} · r = a[${N - 1}] = ${VALUES[N - 1]}`,
    keys: [
      { mark: "lit", label: "两根探针：探到多高，读数就是多少" },
      { mark: "raised", label: "数组单元格，高度 = 值；目标格 = 10" },
    ],
    caption: "两台测量小车从两端相向而行：左右探针各读一个值，条件不满足就舍弃确定不会更优的一端。相遇在 a[5]=10 —— 收敛即命中，O(n²) 变 O(n)。",
    body: `<div class="iso-stage" tabindex="0" role="slider" aria-label="双指针装置：左右键单步推进" aria-valuemin="0" aria-valuemax="${STEPS}" aria-valuenow="0">${svg}</div>`,
  });

  const live = `(function(root){
  const P = ${JSON.stringify(P)};
  const N = ${N}, X0 = ${X0}, CW = ${CW}, GAP = ${GAP}, STEPS = ${STEPS}, TARGET = ${TARGET};
  const VALUES = ${JSON.stringify(VALUES)};
  const TOPS = ${JSON.stringify(TOPS)};
  const rig = rigOf(root), stage = rig.stage, svg = rig.svg, readout = rig.readout, still = rig.still;
  const cL = svg.querySelector('[data-part="car-l"]'), cR = svg.querySelector('[data-part="car-r"]');
  const nL = svg.querySelector('[data-part="needle-l"]'), nR = svg.querySelector('[data-part="needle-r"]');
  const center = (i) => X0 + i * (CW + GAP) + CW / 2;
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  let u = 0, target = 0, clock = 0, steer;
  const draw = () => {
    const s = clamp(u, 0, 1) * STEPS;
    const li = Math.round(Math.min(s, STEPS)), ri = Math.round(Math.max(N - 1 - s, STEPS));
    const xl = center(Math.min(s, STEPS)), xr = center(Math.max(N - 1 - s, STEPS));
    cL.setAttribute("transform", translateAlong(P, [xl, 0, 0]));
    cR.setAttribute("transform", translateAlong(P, [xr, 0, 0]));
    nL.setAttribute("transform", translateAlong(P, [xl, 0, TOPS[li]]));
    nR.setAttribute("transform", translateAlong(P, [xr, 0, TOPS[ri]]));
    const met = li >= TARGET && ri <= TARGET;
    const text = met
      ? "meet at a[" + TARGET + "] = " + VALUES[TARGET] + " · 收敛即命中"
      : "l = a[" + li + "] = " + VALUES[li] + " · r = a[" + ri + "] = " + VALUES[ri] + " · sum = " + (VALUES[li] + VALUES[ri]);
    if (readout.textContent !== text) readout.textContent = text;
    stage.setAttribute("aria-valuenow", String(Math.round(s)));
    stage.setAttribute("aria-valuetext", text);
  };
  const frame = loop(rig, (dt) => {
    if (steer.touring) {
      clock += dt;
      const p = (clock % 10) / 10;
      target = p < 0.6 ? p / 0.6 : p < 0.85 ? 1 : 1 - (p - 0.85) / 0.15;
    }
    u = still.matches ? target : u + (target - u) * (1 - Math.exp(-dt / 0.3));
    if (Math.abs(target - u) < 0.001) u = target;
    draw();
    return !steer.touring && u === target;
  });
  steer = steerOf(rig, { onTour: () => { clock = 0; }, wake: frame.wake });
  if (still.matches) steer.touring = false;
  const go = (next) => { steer.manual(); target = clamp(next, 0, 1); frame.wake(); };
  stage.addEventListener("pointermove", (e) => {
    const box = svg.getBoundingClientRect();
    go(clamp((e.clientX - box.left) / box.width, 0, 1));
  });
  stage.addEventListener("pointerleave", () => go(target));
  stage.addEventListener("keydown", (e) => {
    let s = Math.round(target * STEPS);
    if (e.key === "ArrowRight" || e.key === "ArrowUp") s = Math.min(STEPS, s + 1);
    else if (e.key === "ArrowLeft" || e.key === "ArrowDown") s = Math.max(0, s - 1);
    else if (e.key === "Home") s = 0;
    else if (e.key === "End") s = STEPS;
    else return;
    e.preventDefault(); go(s / STEPS);
  });
  draw();
})`;

  return { id: "p01", card, live };
}
