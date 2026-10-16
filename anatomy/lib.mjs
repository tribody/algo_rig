// lib.mjs · 算法训练台 anatomy 图共享零件库
// 所有装置共用：底座平台、导轨、旋钮、刻度条、单元格阵列、表盘
import * as k from "../../../.workbuddy/skills/anatomy/kit/iso-kit.mjs";
export { k };

// ── 表面平台：底板 + 4 支脚 + 角螺钉 + 铭牌 ──────────────────
export function surfacePlate(P, plan, { h = 12, footH = 5, label = "" } = {}) {
  const out = [];
  out.push(`<path class="iso-halo" d="${k.haloOf(plan, -h - footH, h, P)}"/>`);
  for (const [x, y] of byDepth(k.corners(plan, 22), P)) {
    out.push(k.solidSvg(k.cylinder(x, y, 7, -h - footH, 1.6, P, 28), { tone: "lo" }));
    out.push(k.solidSvg(k.cylinder(x, y, 5.4, -h - footH + 1.6, footH - 1.6, P, 28), { tone: "mid" }));
  }
  out.push(k.solidSvg(k.slabOf(plan, -h, h, P, 8, 1.6), { tone: "mid" }));
  out.push(k.lineSvg(k.planOutline(k.insetPlan(plan, 5), 0, P), { tone: "lo" }));
  const screws = k.corners(plan, 10);
  out.push(k.lineSvg(screws.map(([x, y]) => k.ring(x, y, 2.2, 0, P, 16)).join(""), { tone: "lo" }));
  out.push(k.dotsSvg(screws.map(([x, y]) => k.iso([x, y, 0], P)), { size: 0.5 }));
  if (label) out.push(labelPlate(P, labelAt(plan), label));
  return out.join("");
}

function labelAt(plan) {
  return [plan.x + plan.w - 40, plan.y + plan.d - 16];
}
function labelPlate(P, [x, y], text) {
  const out = [];
  const plan = { x: x - 16, y: y - 5, w: 32, d: 10, r: 1 };
  out.push(k.solidSvg(k.slabOf(plan, 0, 1, P, 3), { tone: "lo", crease: "none" }));
  out.push(k.lineSvg([
    k.lineOnTop([x - 12, y - 2.6], [x + 12, y - 2.6], 1, P),
    k.lineOnTop([x - 12, y], [x + 12, y], 1, P),
    k.lineOnTop([x - 12, y + 2.6], [x + 12, y + 2.6], 1, P),
  ].join(""), { tone: "faint", free: true }));
  out.push(k.faceTextSvg(k.topMatrix([x, y], 1, P, "x"), text, { size: 2.2, tone: "lo", anchor: "middle" }));
  return out.join("");
}

const byDepth = (points, P) => [...points].sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P));

// ── 导轨副：两条平行轨 + 两端挡块 + 螺栓点 ──────────────────
export function rails(P, { from, to, ys = [-20, 15], h = 3, stopH = 7 }) {
  const out = [];
  for (const y of ys) {
    out.push(k.solidSvg(k.slabOf({ x: from, y, w: to - from, d: 5, r: 1 }, 0, h, P, 3, 0.4), { tone: "mid" }));
    out.push(k.dotsSvg([from + 6, to - 6].map((x) => k.iso([x, y + 2.5, h], P)), { size: 0.4 }));
  }
  for (const x of [from - 5, to]) {
    out.push(k.solidSvg(k.slabOf({ x, y: Math.min(...ys) - 3, w: 5, d: Math.max(...ys) - Math.min(...ys) + 11, r: 1.2 }, 0, stopH, P, 3, 0.5), { tone: "mid" }));
    out.push(k.dotsSvg([Math.min(...ys) + 2, Math.max(...ys) - 2].map((y) => k.iso([x + 2.5, y, stopH], P)), { size: 0.45 }));
  }
  return out.join("");
}

// ── 滚花旋钮 ───────────────────────────────────────────────
export function knob(P, [x, y], z, r = 5, h = 4) {
  const out = [];
  out.push(k.solidSvg(k.cylinder(x, y, r, z, h, P, 32), { tone: "mid" }));
  out.push(k.lineSvg(k.knurl(x, y, r, z, z + h, 36, P), { tone: "lo" }));
  out.push(k.lineSvg(k.lineOnTop([x, y], [x + r - 0.8, y], z + h, P), { tone: "hi" }));
  out.push(k.dotsSvg([[x, y, z + h], [x + r - 0.8, y, z + h]].map((p) => k.iso(p, P)), { size: 0.5, tone: "hi" }));
  return out.join("");
}

// ── 立柱：圆杆 + 底部法兰 ───────────────────────────────────
export function post(P, [x, y], z0, h, r = 4) {
  const out = [];
  out.push(k.solidSvg(k.cylinder(x, y, r + 1.4, z0, 2, P, 28), { tone: "mid" }));
  out.push(k.solidSvg(k.cylinder(x, y, r, z0 + 2, h - 2, P, 28), { tone: "mid", crease: "none" }));
  out.push(k.lineSvg(k.sideArc(x, y, r, z0 + h * 0.55, P, 16), { tone: "faint" }));
  return out.join("");
}

// ── 刻度条（贴在平台上） ────────────────────────────────────
export function rulerStrip(P, { x, y, w, d = 7, z = 0.6, step = 5, every = 4, axis = "x" }) {
  const out = [];
  out.push(k.solidSvg(k.slabOf({ x, y, w, d, r: 1 }, 0, z, P, 3), { tone: "lo", crease: "none" }));
  const ticks = k.topTicks(x + 4, x + w - 4, step, every, y + 0.8, z, [2, 3.6], P, axis);
  out.push(k.lineSvg(ticks.minor, { tone: "lo" }), k.lineSvg(ticks.major, { tone: "mid" }));
  out.push(k.dotsSvg([[x + 2, y + 3.5, z], [x + w - 2, y + 3.5, z]].map((p) => k.iso(p, P)), { size: 0.45 }));
  return out.join("");
}

// ── 数组单元格阵列：一排可变高度的方块，顶面刻值 ─────────────
// values: 数值数组；scale: 每单位高度；返回 { out, cellX, top(i), totalW }
export function cells(P, { x, y, w = 18, gap = 2, z = 0, values, scale = 3, font = 3 }) {
  const out = [];
  const cellX = (i) => x + i * (w + gap);
  let tallest = 0;
  values.forEach((v, i) => {
    const h = Math.max(2, v * scale);
    tallest = Math.max(tallest, h);
    const plan = { x: cellX(i), y, w, d: 26, r: 1 };
    out.push(k.solidSvg(k.slabOf(plan, z, h, P, 3, 0.5), { tone: "hi", crease: "lo" }));
    out.push(k.lineSvg(k.planOutline(k.insetPlan(plan, 2), z + h, P, 3), { tone: "faint" }));
    out.push(k.faceTextSvg(k.topMatrix([cellX(i) + w / 2, y + 13], z + h, P, "x"), String(v), { size: font, tone: "lo", anchor: "middle" }));
  });
  return { out: out.join(""), cellX, totalW: values.length * (w + gap) - gap, top: (i) => Math.max(2, values[i] * scale) };
}

// ── 静态表盘：表圈 + 刻度 + 文字（指针由各图自己画，便于动画） ──
export function gauge(P, { x, y, z, r }, { major = 10, text = "" } = {}) {
  const out = [];
  out.push(k.solidSvg(k.cylinder(x, y, r, z, 8, P, 64, 0.8), { tone: "hi", crease: "lo" }));
  out.push(k.lineSvg(k.knurl(x, y, r, z + 4.6, z + 8, 84, P, 0.3), { tone: "lo" }));
  out.push(k.lineSvg(k.sideArc(x, y, r, z + 4.6, P, 40), { tone: "faint" }));
  out.push(k.lineSvg(k.ring(x, y, r - 2.2, z + 8, P, 64), { tone: "lo" }));
  const ticks = k.radialTicks(x, y, r - 3, 50, major, z + 8, [1.3, 2.8], P);
  out.push(k.lineSvg(ticks.minor, { tone: "lo" }), k.lineSvg(ticks.major, { tone: "mid" }));
  out.push(k.lineSvg(k.ring(x, y, 1.6, z + 8, P, 16), { tone: "mid" }));
  if (text) out.push(k.faceTextSvg(k.topMatrix([x, y + 9], z + 8, P, "x"), text, { size: 2.4, tone: "lo", anchor: "middle" }));
  return out.join("");
}

// ── 小轮（导轨上的滚轮） ────────────────────────────────────
export function wheels(P, xs, y, z0, r = 2.4) {
  const out = [];
  for (const x of xs) out.push(k.solidSvg(k.cylinder(x, y, r, z0, 2.4, P, 20), { tone: "lo", crease: "none" }));
  return out.join("");
}

// ── 共享运行时前奏：预览页与主页面 bundle 都要先注入这段 ──────
export const PRELUDE = `
function rigOf(root) {
  const stage = root.querySelector(".iso-stage"), svg = stage.querySelector("svg");
  return { stage, svg, readout: root.querySelector("[data-readout]"),
    still: matchMedia("(prefers-reduced-motion: reduce)") };
}
function loop(rig, tickFn) {
  let visible = false, frame = 0, last = 0;
  const step = (now) => {
    const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
    last = now;
    const settled = tickFn(dt, now / 1000);
    frame = visible && !settled ? requestAnimationFrame(step) : 0;
  };
  new IntersectionObserver((es) => {
    visible = es[es.length - 1].isIntersecting;
    if (visible && !frame) { last = 0; frame = requestAnimationFrame(step); }
  }, { rootMargin: "160px 0px" }).observe(rig.stage);
  return { wake() { if (visible && !frame) { last = 0; frame = requestAnimationFrame(step); } } };
}
function steerOf(rig, opts = {}) {
  let touring = !rig.still.matches, idle = 0;
  return {
    get touring() { return touring; },
    set touring(v) { touring = v; },
    manual() {
      touring = false; clearTimeout(idle);
      idle = setTimeout(() => {
        touring = !rig.still.matches;
        if (opts.onTour) opts.onTour();
        if (opts.wake) opts.wake();
      }, 3600);
    },
  };
}
`;
