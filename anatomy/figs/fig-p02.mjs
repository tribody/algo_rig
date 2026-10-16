// fig-p02.mjs · 滑动窗口 Sliding Window
// 装置：一台双颚窗框夹具沿数组滑过，梁上的计数表盘实时读出窗口内数值之和。
import { k, surfacePlate, rails, knob, rulerStrip, cells } from "../lib.mjs";

export function build() {
  const W = 660, H = 380;
  const PLATE = { x: -165, y: -84, w: 330, d: 168, r: 8 };
  const VALUES = [4, 6, 2, 8, 3, 9, 5, 7, 1, 6, 4];
  const K = 4, SCALE = 2.5, CW = 18, GAP = 2, CELL_Y = -58;
  const N = VALUES.length, NL = N - K;          // 左端可停在 0..NL
  const X0 = -(N * (CW + GAP) - GAP) / 2;
  const SUMS = VALUES.map((_, l) => VALUES.slice(l, l + K).reduce((a, b) => a + b, 0));
  const MAXSUM = Math.max(...SUMS);
  const RAIL_Y = -74;
  const BEAM_Z = 34, GZ = BEAM_Z + 4;           // 梁高 / 表盘底
  const GAUGE = { x: 0, y: -50, r: 10 };

  const P = k.fitProjection([...k.boxCorners(PLATE, -17, 0), [0, 0, 60]], W, H, { pad: 24, azimuth: 42 });
  const strip = cells(P, { x: X0, y: CELL_Y, w: CW, gap: GAP, values: VALUES, scale: SCALE });
  const center = (i) => X0 + i * (CW + GAP) + CW / 2;

  function frameAt() {                            // 静态初始位（l=0），live 里平移
    const xL = center(0) - CW / 2 - 4, xR = center(K) - CW / 2 + 4;
    const out = [];
    out.push(`<g data-part="jaw-l" transform="${k.translateAlong(P, [0, 0, 0])}">`);
    out.push(k.solidSvg(k.slabOf({ x: xL, y: RAIL_Y, w: 4, d: 46, r: 1 }, 2, BEAM_Z, P, 3, 0.4), { tone: "mid" }));
    out.push(k.lineSvg(k.sideSeam({ x: xL, y: RAIL_Y, w: 4, d: 46, r: 1 }, BEAM_Z, P, 3), { tone: "faint" }));
    out.push(`</g><g data-part="jaw-r" transform="${k.translateAlong(P, [0, 0, 0])}">`);
    out.push(k.solidSvg(k.slabOf({ x: xR, y: RAIL_Y, w: 4, d: 46, r: 1 }, 2, BEAM_Z, P, 3, 0.4), { tone: "mid" }));
    out.push(k.lineSvg(k.sideSeam({ x: xR, y: RAIL_Y, w: 4, d: 46, r: 1 }, BEAM_Z, P, 3), { tone: "faint" }));
    out.push(`</g><g data-part="beam" transform="${k.translateAlong(P, [0, 0, 0])}">`);
    out.push(k.solidSvg(k.slabOf({ x: xL, y: RAIL_Y - 2, w: xR - xL + 4, d: 50, r: 2 }, BEAM_Z, 4, P, 3, 0.5), { tone: "mid" }));
    out.push(k.lineSvg(k.planOutline(k.insetPlan({ x: xL, y: RAIL_Y - 2, w: xR - xL + 4, d: 50, r: 2 }, 1.5), BEAM_Z + 4, P, 3), { tone: "faint" }));
    out.push(knob(P, [xL + 8, RAIL_Y + 43], BEAM_Z + 4, 3.4, 4));
    // 表盘立柱 + 表体
    out.push(k.solidSvg(k.cylinder(GAUGE.x, GAUGE.y, 2.6, BEAM_Z + 4, GZ - BEAM_Z - 4 + 4, P, 20), { tone: "mid", crease: "none" }));
    out.push(k.solidSvg(k.cylinder(GAUGE.x, GAUGE.y, GAUGE.r, GZ + 4, 7, P, 56, 0.8), { tone: "hi", crease: "lo" }));
    out.push(k.lineSvg(k.knurl(GAUGE.x, GAUGE.y, GAUGE.r, GZ + 8.6, GZ + 11, 72, P, 0.3), { tone: "lo" }));
    out.push(k.lineSvg(k.sideArc(GAUGE.x, GAUGE.y, GAUGE.r, GZ + 8.6, P, 36), { tone: "faint" }));
    out.push(k.lineSvg(k.ring(GAUGE.x, GAUGE.y, GAUGE.r - 2, GZ + 11, P, 56), { tone: "lo" }));
    const ticks = k.radialTicks(GAUGE.x, GAUGE.y, GAUGE.r - 3, 40, 8, GZ + 11, [1.2, 2.6], P, Math.PI * 0.75, Math.PI * 1.5);
    out.push(k.lineSvg(ticks.minor, { tone: "lo" }), k.lineSvg(ticks.major, { tone: "mid" }));
    out.push(k.lineSvg(k.ring(GAUGE.x, GAUGE.y, 1.4, GZ + 11, P, 16), { tone: "mid" }));
    out.push(`</g>`);
    return out.join("");
  }
  const needleAt = (sum) => {
    const a = Math.PI * 0.75 + (sum / MAXSUM) * Math.PI * 1.5;
    const [x, y] = [GAUGE.x, GAUGE.y];
    return k.lineOnTop([x - Math.sin(a) * 2, y + Math.cos(a) * 2], [x + Math.sin(a) * (GAUGE.r - 2.4), y - Math.cos(a) * (GAUGE.r - 2.4)], GZ + 11.2, P);
  };

  const body = [
    surfacePlate(P, PLATE, { label: "SLIDING WINDOW" }),
    strip.out,
    rulerStrip(P, { x: X0 - 6, y: -26, w: strip.totalW + 12, step: CW + GAP, every: 5 }),
    rails(P, { from: X0 - 18, to: -X0 + 18, ys: [RAIL_Y, RAIL_Y + 3], h: 2, stopH: 4 }),
    frameAt(),
    `<path data-part="needle" class="iso-line" data-tone="lit" data-free="start" d="${needleAt(SUMS[0])}" style="stroke-width:1.1"/>`,
  ];

  const svg = k.figureSvg({
    width: W, height: H,
    label: "A two-jaw window frame slides along a row of blocks; a drum gauge on its beam reads the sum of the blocks inside the jaws.",
    body,
  });
  const card = k.plateHtml({
    fig: "P02", title: "Sliding Window", hint: "hover 滑动窗口",
    readout: `窗口 [0..${K - 1}] · sum = ${SUMS[0]}`,
    keys: [
      { mark: "lit", label: "表针：读数 = 窗口内数值之和" },
      { mark: "raised", label: "双颚窗框：右颚进一格、左颚出一格" },
    ],
    caption: "双颚夹具沿数组滑动：右端进一个、左端出一个，梁上的表盘即时读出窗口和——不重算，只做增量更新，O(nk) 变 O(n)。",
    body: `<div class="iso-stage" tabindex="0" role="slider" aria-label="滑动窗口装置" aria-valuemin="0" aria-valuemax="${NL}" aria-valuenow="0">${svg}</div>`,
  });

  const live = `(function(root){
  const P = ${JSON.stringify(P)};
  const NL = ${NL}, X0 = ${X0}, CW = ${CW}, GAP = ${GAP}, K = ${K};
  const SUMS = ${JSON.stringify(SUMS)}, MAXSUM = ${MAXSUM};
  const N = ${N};
  const GAUGE = ${JSON.stringify(GAUGE)}, GZ = ${GZ};
  const rig = rigOf(root), svg = rig.svg, readout = rig.readout, still = rig.still;
  const jawL = svg.querySelector('[data-part="jaw-l"]'), jawR = svg.querySelector('[data-part="jaw-r"]');
  const beam = svg.querySelector('[data-part="beam"]'), needle = svg.querySelector('[data-part="needle"]');
  const center = (i) => X0 + i * (CW + GAP) + CW / 2;
  const needleAt = ${needleAt.toString().replace("k.lineOnTop", "lineOnTop")};
  const clamp = (v) => Math.min(1, Math.max(0, v));
  let u = 0, target = 0, clock = 0, steer;
  const drawn = () => {
    const l = Math.round(clamp(u) * NL);
    const dx = center(l) - center(0);
    jawL.setAttribute("transform", translateAlong(P, [dx, 0, 0]));
    jawR.setAttribute("transform", translateAlong(P, [dx, 0, 0]));
    beam.setAttribute("transform", translateAlong(P, [dx, 0, 0]));
    needle.setAttribute("d", needleAt(SUMS[l]));
    needle.setAttribute("transform", translateAlong(P, [dx, 0, 0]));
    const text = "窗口 [" + l + ".." + (l + K - 1) + "] · sum = " + SUMS[l];
    if (readout.textContent !== text) readout.textContent = text;
    rig.stage.setAttribute("aria-valuenow", String(l));
    rig.stage.setAttribute("aria-valuetext", text);
  };
  const frame = loop(rig, (dt) => {
    if (steer.touring) {
      clock += dt;
      const p = (clock % 9) / 9;
      target = p < 0.62 ? p / 0.62 : p < 0.86 ? 1 : 1 - (p - 0.86) / 0.14;
    }
    u = still.matches ? target : u + (target - u) * (1 - Math.exp(-dt / 0.28));
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
  rig.stage.addEventListener("pointerleave", () => { steer.manual(); frame.wake(); });
  rig.stage.addEventListener("keydown", (e) => {
    let l = Math.round(target * NL);
    if (e.key === "ArrowRight" || e.key === "ArrowUp") l = Math.min(NL, l + 1);
    else if (e.key === "ArrowLeft" || e.key === "ArrowDown") l = Math.max(0, l - 1);
    else if (e.key === "Home") l = 0;
    else if (e.key === "End") l = NL;
    else return;
    e.preventDefault(); steer.manual(); target = l / NL; frame.wake();
  });
  drawn();
})`;
  return { id: "p02", card, live };
}
