// fig-p15.mjs · 限时实战 Contest Mode
// 装置：赛场计时台——机械秒表扫过 60 分钟，翻牌计数器记录 AC / WA / TLE。
import { k, surfacePlate, knob, gauge } from "../lib.mjs";

export function build() {
  const W = 660, H = 380;
  const PLATE = { x: -165, y: -90, w: 330, d: 180, r: 8 };
  const DIAL = { x: -62, y: -6, r: 30, z: 6 };
  const FLAPS = [
    { label: "AC", tone: "green", x: 42, y: -46 },
    { label: "WA", tone: "red", x: 42, y: -10 },
    { label: "TLE", tone: "mid", x: 42, y: 26 },
  ];

  const P = k.fitProjection([...k.boxCorners(PLATE, -17, 0), [DIAL.x + DIAL.r, 0, DIAL.z + 12]], W, H, { pad: 24, azimuth: 42 });

  const handAt = (frac) => {
    const a = -Math.PI / 2 + frac * Math.PI * 2;
    const [x, y] = [DIAL.x, DIAL.y];
    return k.lineOnTop([x - Math.sin(a) * 3, y + Math.cos(a) * 3], [x + Math.sin(a) * (DIAL.r - 2.5), y - Math.cos(a) * (DIAL.r - 2.5)], DIAL.z + 8.2, P);
  };

  function desk() {
    const out = [];
    // 秒表台座
    out.push(k.solidSvg(k.slabOf({ x: DIAL.x - 34, y: DIAL.y - 34, w: 68, d: 68, r: 4 }, 0, 6, P, 5, 0.6), { tone: "mid" }));
    out.push(k.lineSvg(k.planOutline(k.insetPlan({ x: DIAL.x - 34, y: DIAL.y - 34, w: 68, d: 68, r: 4 }, 4), 6, P, 5), { tone: "faint" }));
    out.push(k.solidSvg(k.cylinder(DIAL.x, DIAL.y, 3.2, 6, DIAL.z, P, 20), { tone: "mid", crease: "none" }));
    // 表盘
    out.push(gauge(P, { x: DIAL.x, y: DIAL.y, z: DIAL.z, r: DIAL.r }, { major: 5, text: "MIN" }));
    // 表冠 + 双按钮
    out.push(knob(P, [DIAL.x + DIAL.r + 5, DIAL.y], DIAL.z + 1, 3.4, 3.4));
    out.push(k.solidSvg(k.cylinder(DIAL.x + DIAL.r + 3, DIAL.y - 8, 2.4, DIAL.z + 1, 4, P, 16), { tone: "mid" }));
    out.push(k.solidSvg(k.cylinder(DIAL.x + DIAL.r + 3, DIAL.y + 8, 2.4, DIAL.z + 1, 4, P, 16), { tone: "mid" }));
    // 翻牌计数器
    for (const f of FLAPS) {
      out.push(k.solidSvg(k.slabOf({ x: f.x - 16, y: f.y - 9, w: 32, d: 18, r: 2 }, 0, 2, P, 3), { tone: "lo", crease: "none" }));
      out.push(k.solidSvg(k.slabOf({ x: f.x - 14, y: f.y - 7.5, w: 28, d: 15, r: 1.5 }, 2, 6, P, 3, 0.4), { tone: "hi", crease: "lo" }));
      out.push(k.lineSvg(k.lineOnTop([f.x - 14, f.y], [f.x + 14, f.y], 8.2, P), { tone: "faint" }));
      out.push(k.faceTextSvg(k.topMatrix([f.x - 8, f.y - 3.6], 8.2, P, "x"), f.label, { size: 2.2, tone: f.tone === "mid" ? "lo" : f.tone, anchor: "middle" }));
      out.push(`<text data-part="cnt-${f.label}" class="iso-face-text" data-tone="hi" transform="${k.topMatrix([f.x + 7, f.y + 3.4], 8.2, P, "x")}" font-size="3.4" text-anchor="middle">0</text>`);
    }
    return out.join("");
  }

  const body = [
    surfacePlate(P, PLATE, { label: "CONTEST CLOCK" }),
    desk(),
    `<path data-part="hand" class="iso-line" data-tone="lit" data-free="start" d="${handAt(0)}" style="stroke-width:1.2"/>`,
  ];

  const svg = k.figureSvg({
    width: W, height: H,
    label: "A contest desk: a mechanical stopwatch sweeps the hour while split-flap counters tally AC, WA and TLE as the clock passes each verdict mark.",
    body,
  });
  const card = k.plateHtml({
    fig: "P15", title: "Contest Mode", hint: "hover 计时 · R 复位",
    readout: "00:00 · AC 0 · WA 0 · TLE 0",
    keys: [
      { mark: "lit", label: "秒表针：60 分钟一圈，翻牌随时刻跳" },
      { mark: "raised", label: "AC / WA / TLE 翻牌计数" },
    ],
    caption: "每周一场 60 分钟限时：签到题 10 分钟内、Medium 25 分钟内、卡壳 30 分钟即止损看题解——赛场练的是纪律，不是题量。",
    body: `<div class="iso-stage" tabindex="0" role="slider" aria-label="限时实战装置" aria-valuemin="0" aria-valuemax="60" aria-valuenow="0">${svg}</div>`,
  });

  const live = `(function(root){
  const P = ${JSON.stringify(P)};
  const DIAL = ${JSON.stringify(DIAL)};
  const rig = rigOf(root), svg = rig.svg, readout = rig.readout, still = rig.still;
  const hand = svg.querySelector('[data-part="hand"]');
  const cnt = {};
  for (const key of ["AC", "WA", "TLE"]) cnt[key] = svg.querySelector('[data-part="cnt-' + key + '"]');
  const handAt = ${handAt.toString().replace("k.lineOnTop", "lineOnTop")};
  const MARKS = [["AC", 9], ["AC", 26], ["WA", 33], ["AC", 49], ["TLE", 56]];
  let u = 0, target = 0, clock = 0, steer, fired = new Set();
  const clamp = (v) => Math.min(1, Math.max(0, v));
  const drawn = () => {
    const min = clamp(u) * 60;
    hand.setAttribute("d", handAt(min / 60));
    const counts = { AC: 0, WA: 0, TLE: 0 };
    for (const [k, m] of MARKS) if (min >= m) counts[k]++;
    for (const key of Object.keys(counts)) if (cnt[key].textContent !== String(counts[key])) cnt[key].textContent = String(counts[key]);
    const text = String(Math.floor(min)).padStart(2, "0") + ":" + String(Math.floor((min % 1) * 60)).padStart(2, "0") + " · AC " + counts.AC + " · WA " + counts.WA + " · TLE " + counts.TLE;
    if (readout.textContent !== text) readout.textContent = text;
    rig.stage.setAttribute("aria-valuenow", String(Math.round(min)));
    rig.stage.setAttribute("aria-valuetext", text);
  };
  const frame = loop(rig, (dt) => {
    if (steer.touring) {
      clock += dt;
      const p = (clock % 18) / 18;
      target = p < 0.8 ? p / 0.8 : p < 0.94 ? 1 : 1 - (p - 0.94) / 0.06;
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
    if (e.key.toLowerCase() === "r") { steer.manual(); target = 0; frame.wake(); }
    else if (e.key === "ArrowRight" || e.key === "ArrowUp") { steer.manual(); target = clamp(u + 1 / 12); frame.wake(); }
    else if (e.key === "ArrowLeft" || e.key === "ArrowDown") { steer.manual(); target = clamp(u - 1 / 12); frame.wake(); }
  });
  drawn();
})
`;
  return { id: "p15", card, live };
}
