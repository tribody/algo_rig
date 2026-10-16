// fig-p05.mjs · 二分查找 Binary Search
// 装置：对分测量仪——两只卡爪按迭代夹逼区间，刀架滑到中点探一次，宽度对半砍。
import { k, surfacePlate, rails, knob } from "../lib.mjs";

export function build() {
  const W = 660, H = 380;
  const PLATE = { x: -165, y: -84, w: 330, d: 168, r: 8 };
  const M = 64;                                   // 数组规模
  const XA = -120, XB = 120;                      // 索引 0..63 对应的世界坐标
  const px = (i) => XA + (i / (M - 1)) * (XB - XA);
  const TARGET = 47;
  const RULER_Y = -30, RAIL_Y = -50;
  const JAW_H = 14;

  const P = k.fitProjection([...k.boxCorners(PLATE, -17, 0), [0, 0, 34]], W, H, { pad: 24, azimuth: 42 });

  // 固定剧本：每步区间与中点
  const STEPS = (() => {
    const out = [];
    let lo = 0, hi = M - 1;
    for (let s = 0; s <= 6 && lo < hi; s++) {
      const mid = Math.floor((lo + hi) / 2);
      out.push({ lo, hi, mid });
      if (mid < TARGET) lo = mid + 1; else hi = mid;   // a[mid] 与目标比较
    }
    return out;
  })();

  function ruler() {
    const out = [];
    const plan = { x: XA - 6, y: RULER_Y - 7, w: XB - XA + 12, d: 14, r: 1 };
    out.push(k.solidSvg(k.slabOf(plan, 0, 1.2, P, 3), { tone: "lo", crease: "none" }));
    const ticks = k.topTicks(XA, XB, (XB - XA) / 64, 8, RULER_Y - 7, 1.2, [2, 3.8], P);
    out.push(k.lineSvg(ticks.minor, { tone: "lo" }), k.lineSvg(ticks.major, { tone: "mid" }));
    for (let idx = 0; idx < M; idx += 16) {
      out.push(k.faceTextSvg(k.topMatrix([px(idx), RULER_Y - 2.6], 1.2, P, "x"), String(idx), { size: 2.4, tone: "lo", anchor: "middle" }));
    }
    return out.join("");
  }

  function jaws() {
    const out = [];
    const mk = (x, part) => `<g data-part="${part}" transform="${k.translateAlong(P, [0, 0, 0])}">`
      + k.solidSvg(k.slabOf({ x: x - 2, y: RULER_Y - 11, w: 4, d: 26, r: 1 }, 1.2, JAW_H, P, 3, 0.4), { tone: "mid" })
      + k.lineSvg(k.sideSeam({ x: x - 2, y: RULER_Y - 11, w: 4, d: 26, r: 1 }, JAW_H + 1.2, P, 3), { tone: "faint" })
      + `</g>`;
    out.push(mk(px(0), "jaw-l"));
    out.push(mk(px(M - 1), "jaw-r"));
    return out.join("");
  }

  function knife() {
    const out = [];
    out.push(k.solidSvg(k.slabOf({ x: -9, y: RAIL_Y - 5, w: 18, d: 10, r: 1.5 }, 2, 4, P, 3, 0.4), { tone: "mid" }));
    out.push(k.dotsSvg(k.corners({ x: -9, y: RAIL_Y - 5, w: 18, d: 10 }, 3).map(([x, y]) => k.iso([x, y, 6], P)), { size: 0.4, tone: "lo" }));
    out.push(k.solidSvg(k.cylinder(0, 0, 2, 6, 14, P, 20), { tone: "mid", crease: "none" }));
    out.push(knob(P, [0, 0], 20, 3.4, 3.6));
    out.push(k.solidSvg(k.slabOf({ x: -1.4, y: RAIL_Y + 6, w: 2.8, d: 22, r: 1 }, 14, 3, P, 2, 0.4), { tone: "mid" }));
    // 探针：从中臂垂直向下到标尺面
    out.push(k.solidSvg(k.cylinder(0, RULER_Y, 0.9, 1.4, 16, P, 12), { tone: "hi", lit: true, crease: "none" }));
    return out.join("");
  }

  // 目标刻度：标尺前沿的小三角标记
  const tgt = k.iso([px(TARGET), RULER_Y - 7.4, 1.2], P);
  const targetMark = `M ${tgt[0]} ${tgt[1]} l -2.2 -3.6 M ${tgt[0]} ${tgt[1]} l 2.2 -3.6`;

  const body = [
    surfacePlate(P, PLATE, { label: "BINARY SEARCH" }),
    rails(P, { from: XA - 10, to: XB + 10, ys: [RAIL_Y - 2.5, RAIL_Y + 2.5], h: 2, stopH: 4 }),
    ruler(),
    k.lineSvg(targetMark, { tone: "lit", free: "start" }),
    jaws(),
    `<g data-part="knife" transform="${k.translateAlong(P, [px((M - 1) / 2), 0, 0])}">${knife()}</g>`,
  ];

  const svg = k.figureSvg({
    width: W, height: H,
    label: "A dividing engine: two jaws close in on the interval while a knife carriage probes the midpoint; every probe halves the interval.",
    body,
  });
  const card = k.plateHtml({
    fig: "P05", title: "Binary Search", hint: "hover 逐步 · ←/→ 单步",
    readout: "step 0 · 区间 [0..63] · 中点 a[31]",
    keys: [
      { mark: "lit", label: "探针：每次只在中点落一刀" },
      { mark: "raised", label: "双爪：区间两端，每步对半收拢" },
    ],
    caption: "两只卡爪夹住当前区间，刀架每次移到中点落一刀——比目标小就丢左半，比目标大就丢右半。64 格 6 步锁定的就是 O(log n)。",
    body: `<div class="iso-stage" tabindex="0" role="slider" aria-label="二分查找装置" aria-valuemin="0" aria-valuemax="${STEPS.length - 1}" aria-valuenow="0">${svg}</div>`,
  });

  const live = `(function(root){
  const P = ${JSON.stringify(P)};
  const M = ${M}, XA = ${XA}, XB = ${XB}, TARGET = ${TARGET};
  const STEPS = ${JSON.stringify(STEPS)};
  const px = (i) => XA + (i / (M - 1)) * (XB - XA);
  const rig = rigOf(root), svg = rig.svg, readout = rig.readout, still = rig.still;
  const jawL = svg.querySelector('[data-part="jaw-l"]'), jawR = svg.querySelector('[data-part="jaw-r"]');
  const knife = svg.querySelector('[data-part="knife"]');
  const clamp = (v) => Math.min(1, Math.max(0, v));
  let u = 0, target = 0, clock = 0, steer;
  const drawn = () => {
    const s = Math.round(clamp(u) * (STEPS.length - 1));
    const st = STEPS[s];
    jawL.setAttribute("transform", translateAlong(P, [px(st.lo), 0, 0]));
    jawR.setAttribute("transform", translateAlong(P, [px(st.hi), 0, 0]));
    knife.setAttribute("transform", translateAlong(P, [px(st.mid), 0, 0]));
    const text = "step " + s + " · 区间 [" + st.lo + ".." + st.hi + "] · 中点 a[" + st.mid + "]" + (st.lo === st.hi ? " · 命中 " + TARGET : "");
    if (readout.textContent !== text) readout.textContent = text;
    rig.stage.setAttribute("aria-valuenow", String(s));
    rig.stage.setAttribute("aria-valuetext", text);
  };
  const frame = loop(rig, (dt) => {
    if (steer.touring) {
      clock += dt;
      const p = (clock % 9) / 9;
      target = p < 0.6 ? p / 0.6 : p < 0.85 ? 1 : 1 - (p - 0.85) / 0.14;
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
    let s = Math.round(target * (STEPS.length - 1));
    if (e.key === "ArrowRight" || e.key === "ArrowUp") s = Math.min(STEPS.length - 1, s + 1);
    else if (e.key === "ArrowLeft" || e.key === "ArrowDown") s = Math.max(0, s - 1);
    else if (e.key === "Home") s = 0;
    else if (e.key === "End") s = STEPS.length - 1;
    else return;
    e.preventDefault(); steer.manual(); target = s / (STEPS.length - 1); frame.wake();
  });
  drawn();
})
`;
  return { id: "p05", card, live };
}
