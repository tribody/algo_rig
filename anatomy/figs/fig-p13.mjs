// fig-p13.mjs · 工程映射：令牌桶限流
// 装置：令牌以恒定速率滴进桶里；请求压杆每次取走一枚，桶空即拒绝，满则溢流。
import { k, surfacePlate, knob } from "../lib.mjs";

export function build() {
  const W = 620, H = 400;
  const PLATE = { x: -155, y: -100, w: 310, d: 200, r: 8 };
  const BUCKET = [-46, -12];
  const BR = 17, B_CAP = 8, TH = 2.4;
  const SPOUT = [-46, -64];
  const LEVER = [64, -20];
  const DRAIN = { x: 96, y: 18, w: 52, d: 44, r: 2 };

  const P = k.fitProjection([...k.boxCorners(PLATE, -17, 0), [SPOUT[0], 0, 56]], W, H, { pad: 24, azimuth: 42 });

  function machine() {
    const out = [];
    // 恒滴罐
    out.push(k.solidSvg(k.cylinder(SPOUT[0], SPOUT[1], 11, 34, 16, P, 40, 0.8), { tone: "hi", crease: "lo" }));
    out.push(k.lineSvg(k.ring(SPOUT[0], SPOUT[1], 9.4, 50, P, 40), { tone: "lo" }));
    out.push(k.solidSvg(k.cylinder(SPOUT[0], SPOUT[1], 2, 26, 8, P, 16), { tone: "mid", crease: "none" }));
    out.push(k.solidSvg(k.cylinder(SPOUT[0], SPOUT[1], 3.4, 22, 4, P, 20), { tone: "mid" }));
    for (const [x, y] of [[SPOUT[0] - 8, SPOUT[1] - 8], [SPOUT[0] + 8, SPOUT[1] - 8]]) {
      out.push(k.solidSvg(k.cylinder(x, y, 3.2, 50, 14, P, 18), { tone: "mid" }));
    }
    // 桶
    out.push(k.solidSvg(k.cylinder(BUCKET[0], BUCKET[1], BR, 0, 26, P, 48, 0.8), { tone: "mid" }));
    out.push(k.lineSvg(k.ring(BUCKET[0], BUCKET[1], BR - 1.6, 26, P, 48), { tone: "lo" }));
    out.push(k.lineSvg(k.sideArc(BUCKET[0], BUCKET[1], BR, 8, P, 32), { tone: "faint" }));
    out.push(k.lineSvg(k.sideArc(BUCKET[0], BUCKET[1], BR, 18, P, 32), { tone: "faint" }));
    // 刻度窗
    for (let i = 1; i <= B_CAP; i++) {
      const a = Math.PI * 0.82 - (i / B_CAP) * Math.PI * 0.64;
      out.push(k.lineSvg(k.lineOnTop(
        [BUCKET[0] + Math.cos(a) * (BR - 0.4), BUCKET[1] + Math.sin(a) * (BR - 0.4)],
        [BUCKET[0] + Math.cos(a) * (BR - 3.4), BUCKET[1] + Math.sin(a) * (BR - 3.4)], 26.2, P), { tone: "lo", free: true }));
    }
    // 压杆：支点 + 杆 + 柄头
    out.push(k.solidSvg(k.cylinder(LEVER[0] - 14, LEVER[1], 2.6, 0, 8, P, 18), { tone: "mid" }));
    out.push(`<g data-part="lever" transform="${k.translateAlong(P, [0, 0, 0])}">`
      + k.solidSvg(k.slabOf({ x: LEVER[0] - 16, y: LEVER[1] - 2, w: 30, d: 4, r: 1.6 }, 8, 2.6, P, 2, 0.4), { tone: "mid" })
      + `</g>`);
    out.push(knob(P, [LEVER[0] + 14, LEVER[1]], 10.6, 3.4, 3));
    // 拒绝/放行读牌
    out.push(k.solidSvg(k.slabOf({ x: LEVER[0] + 4, y: LEVER[1] + 8, w: 30, d: 12, r: 1 }, 0, 1.4, P, 2), { tone: "lo", crease: "none" }));
    out.push(`<text data-part="pass-count" class="iso-face-text" data-tone="hi" transform="${k.topMatrix([LEVER[0] + 19, LEVER[1] + 17], 1.4, P, "x")}" font-size="3" text-anchor="middle">放行 0 · 拒 0</text>`);
    // 回收盘
    out.push(k.solidSvg(k.slabOf(DRAIN, 0, 2.4, P, 4, 0.5), { tone: "mid" }));
    out.push(k.lineSvg(k.planOutline(k.insetPlan(DRAIN, 2), 2.4, P, 4), { tone: "faint" }));
    return out.join("");
  }

  const tokens = Array.from({ length: B_CAP }, (_, i) =>
    `<g data-part="token-${i}" style="opacity:0">${k.solidSvg(k.cylinder(0, 0, 5.6, 0, TH, P, 32, 0.5), { tone: "hi", crease: "lo" })}${k.lineSvg(k.ring(0, 0, 4.2, TH, P, 32), { tone: "lo" })}</g>`
  ).join("");

  const body = [
    surfacePlate(P, PLATE, { label: "TOKEN BUCKET" }),
    machine(),
    tokens,
  ];

  const svg = k.figureSvg({
    width: W, height: H,
    label: "A token bucket: tokens drip from a reservoir at a steady rate and stack inside the bucket; each press of the request lever takes one token, and an empty bucket refuses.",
    body,
  });
  const card = k.plateHtml({
    fig: "P13", title: "Token Bucket Limiter", hint: "hover 压杆取令牌 · 空桶即拒",
    readout: "桶 0/8 · 放行 0 · 拒 0",
    keys: [
      { mark: "lit", label: "桶内令牌：恒速率滴入，请求取走" },
      { mark: "raised", label: "压杆 = 一次请求；空桶时被拒绝" },
    ],
    caption: "令牌恒速滴入、请求压杆取用：桶有存量就能应付突发，桶空就只能拒绝——这就是限流算法里「平均速率 + 突发预算」的机械本体。",
    body: `<div class="iso-stage" tabindex="0" role="slider" aria-label="令牌桶装置" aria-valuemin="0" aria-valuemax="8" aria-valuenow="0">${svg}</div>`,
  });

  const live = `(function(root){
  const P = ${JSON.stringify(P)};
  const BUCKET = ${JSON.stringify(BUCKET)};
  const SPOUT = ${JSON.stringify(SPOUT)};
  const B_CAP = ${B_CAP}, TH = ${TH};
  const LEVER = ${JSON.stringify(LEVER)};
  const DRIP = 0.8;                     // 每枚令牌间隔（秒）
  const rig = rigOf(root), svg = rig.svg, readout = rig.readout, still = rig.still;
  const tokens = [];
  for (let i = 0; i < B_CAP; i++) tokens.push(svg.querySelector('[data-part="token-' + i + '"]'));
  const passEl = svg.querySelector('[data-part="pass-count"]');
  const clamp = (v) => Math.min(1, Math.max(0, v));
  let level = 0, dripClock = 0, passing = 0, refused = 0, steer, flash = 0;
  const pos = (i) => [BUCKET[0], BUCKET[1], 1.4 + i * TH];
  const drawn = () => {
    for (let i = 0; i < B_CAP; i++) {
      const el = tokens[i];
      const on = i < level;
      el.style.opacity = on ? 1 : 0;
      if (on && !el.dataset.set) { el.setAttribute("transform", translateAlong(P, pos(i))); el.dataset.set = "1"; }
      if (!on) delete el.dataset.set;
    }
    const text = "桶 " + level + "/" + B_CAP + " · 放行 " + passing + " · 拒 " + refused;
    if (readout.textContent !== text) readout.textContent = text;
    if (passEl.textContent !== text) passEl.textContent = text;
    rig.stage.setAttribute("aria-valuenow", String(level));
    rig.stage.setAttribute("aria-valuetext", text);
  };
  const fly = [];
  const frame = loop(rig, (dt) => {
    dripClock += dt;
    if (dripClock >= DRIP && level < B_CAP) { dripClock = 0; level++; }
    if (fly.length) {
      for (const f of fly) {
        f.t = Math.min(1, f.t + dt * 2.2);
        const el = tokens[f.i];
        el.setAttribute("transform", translateAlong(P, [
          BUCKET[0] + (LEVER[0] - BUCKET[0]) * f.t,
          BUCKET[1] + (f.ty - BUCKET[1]) * f.t,
          pos(f.i)[2] + Math.sin(f.t * Math.PI) * 14,
        ]));
      }
      for (let j = fly.length - 1; j >= 0; j--) if (fly[j].t >= 1) { tokens[fly[j].i].style.opacity = 0; delete tokens[fly[j].i].dataset.set; fly.splice(j, 1); }
    }
    if (flash > 0) flash -= dt;
    drawn();
    return false;
  });
  steer = steerOf(rig, { onTour: () => {}, wake: frame.wake });
  if (still.matches) steer.touring = false;
  const take = () => {
    if (level <= 0) { refused++; flash = 0.5; }
    else {
      level--; passing++;
      const i = level;                  // 最上面那枚飞出去
      fly.push({ i, t: 0, ty: ${DRAIN.y + DRAIN.d / 2} });
    }
    frame.wake();
  };
  rig.stage.addEventListener("pointerdown", take);
  rig.stage.addEventListener("pointermove", (e) => { steer.manual(); frame.wake(); });
  rig.stage.addEventListener("pointerleave", () => steer.manual());
  drawn();
})
`;
  return { id: "p13", card, live };
}
