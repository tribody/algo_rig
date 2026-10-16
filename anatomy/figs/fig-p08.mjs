// fig-p08.mjs · 堆 / Top-K
// 装置：硬币分选机——硬币沿溜槽滑入，秤盘只留最重的 K 枚，轻的被挤到回收盘。
import { k, surfacePlate, rails, knob } from "../lib.mjs";

export function build() {
  const W = 660, H = 400;
  const PLATE = { x: -165, y: -100, w: 330, d: 200, r: 8 };
  const VALUES = [8, 15, 4, 25, 12, 18];
  const K = 3;
  const CHUTE = { x: -150, y: -78, w: 96, d: 12, r: 1.5 };
  const PAN = { x: -58, y: -34, w: 116, d: 56, r: 3 };
  const TRAY = { x: 84, y: -18, w: 52, d: 64, r: 2 };
  const SLOTS = [-34, 0, 34];                     // 秤盘三个鞍座 x
  const COIN_R = 7.2;

  const P = k.fitProjection([...k.boxCorners(PLATE, -17, 0), [0, 0, 26]], W, H, { pad: 24, azimuth: 42 });

  // 剧本：逐枚处理，盘内保持最重 K 枚
  const SCRIPT = (() => {
    const pan = [], rej = [], steps = [];
    VALUES.forEach((v, i) => {
      if (pan.length < K) pan.push(v);
      else {
        const min = Math.min(...pan);
        if (v > min) { pan.splice(pan.indexOf(min), 1); rej.push(min); pan.push(v); }
        else rej.push(v);
      }
      steps.push({ pan: [...pan], rej: [...rej] });
    });
    return steps;
  })();

  function machine() {
    const out = [];
    // 溜槽（斜面 + 侧沿 + 端挡）
    out.push(k.solidSvg(k.slabOf(CHUTE, 8, 2.4, P, 3, 0.4), { tone: "mid" }));
    out.push(k.lineSvg(k.planOutline(k.insetPlan(CHUTE, 1.5), 10.4, P, 3), { tone: "faint" }));
    out.push(k.solidSvg(k.slabOf({ x: CHUTE.x + CHUTE.w - 3, y: CHUTE.y - 3, w: 3, d: CHUTE.d + 6, r: 1 }, 10.4, 8, P, 2, 0.4), { tone: "mid" }));
    out.push(knob(P, [CHUTE.x + 8, CHUTE.y + CHUTE.d + 3], 10.4, 3, 3.4));
    for (const [x, y] of [[CHUTE.x + 8, CHUTE.y + 6], [CHUTE.x + CHUTE.w - 12, CHUTE.y + CHUTE.d - 4]]) {
      out.push(k.solidSvg(k.cylinder(x, y, 3.4, 0, 8, P, 20), { tone: "mid" }));
    }
    // 秤盘：底板 + 三个鞍座 + 每座小弹簧
    out.push(k.solidSvg(k.slabOf(PAN, 0, 3.4, P, 5, 0.6), { tone: "mid" }));
    out.push(k.lineSvg(k.planOutline(k.insetPlan(PAN, 3), 3.4, P, 5), { tone: "faint" }));
    SLOTS.forEach((sx) => {
      out.push(k.solidSvg(k.cylinder(sx, PAN.y + PAN.d / 2, COIN_R + 1.4, 3.4, 2.2, P, 32), { tone: "lo", crease: "none" }));
      out.push(k.lineSvg(k.ring(sx, PAN.y + PAN.d / 2, COIN_R + 2, 5.6, P, 32), { tone: "faint" }));
    });
    out.push(knob(P, [PAN.x + PAN.w - 10, PAN.y + PAN.d - 4], 3.4, 3.2, 3.4));
    // 回收盘
    out.push(k.solidSvg(k.slabOf(TRAY, 0, 2.6, P, 4, 0.5), { tone: "mid" }));
    out.push(k.lineSvg(k.planOutline(k.insetPlan(TRAY, 2), 2.6, P, 4), { tone: "faint" }));
    return out.join("");
  }

  function coin(v) {
    const out = [];
    out.push(k.solidSvg(k.cylinder(0, 0, COIN_R, 0, 2.6, P, 36, 0.5), { tone: "hi", crease: "lo" }));
    out.push(k.lineSvg(k.ring(0, 0, COIN_R - 1.6, 2.6, P, 36), { tone: "lo" }));
    out.push(k.faceTextSvg(k.topMatrix([0, 0], 2.6, P, "x"), String(v), { size: 3, tone: "lo", anchor: "middle" }));
    return out.join("");
  }

  const coins = VALUES.map((v, i) =>
    `<g data-part="coin-${i}" data-v="${v}" transform="${k.translateAlong(P, [CHUTE.x + CHUTE.w - 14, CHUTE.y + CHUTE.d / 2, 12.8])}">${coin(v)}</g>`
  ).join("");

  const body = [
    surfacePlate(P, PLATE, { label: "TOP-K HEAP" }),
    machine(),
    coins,
  ];

  const svg = k.figureSvg({
    width: W, height: H,
    label: "A coin sorter: coins slide down a chute into a scale pan that keeps only the K heaviest; whenever a heavier coin arrives, the lightest is ejected to the reject tray.",
    body,
  });
  const card = k.plateHtml({
    fig: "P08", title: "Heap / Top-K", hint: "hover 投币 · ←/→ 单枚",
    readout: "盘内 — · 淘汰 —",
    keys: [
      { mark: "lit", label: "秤盘：永远只留最重的 " + K + " 枚" },
      { mark: "raised", label: "轻币被新币挤进回收盘" },
    ],
    caption: "秤盘就是一个小顶堆：堆顶是门槛，新币比门槛重就挤掉盘内最轻的。n 枚硬币过完，盘里是最重的 K 枚——O(n log k)。",
    body: `<div class="iso-stage" tabindex="0" role="slider" aria-label="堆 Top-K 装置" aria-valuemin="0" aria-valuemax="${VALUES.length}" aria-valuenow="0">${svg}</div>`,
  });

  const live = `(function(root){
  const P = ${JSON.stringify(P)};
  const VALUES = ${JSON.stringify(VALUES)};
  const SCRIPT = ${JSON.stringify(SCRIPT)};
  const SLOTS = ${JSON.stringify(SLOTS)};
  const K = ${K};
  const CHUTE = [${CHUTE.x + CHUTE.w - 14}, ${CHUTE.y + CHUTE.d / 2}, 12.8];
  const PAN_C = [${PAN.x + PAN.w / 2}, ${PAN.y + PAN.d / 2}];
  const TRAY = [${TRAY.x + TRAY.w / 2}, ${TRAY.y + TRAY.d / 2}];
  const rig = rigOf(root), svg = rig.svg, readout = rig.readout, still = rig.still;
  const coins = VALUES.map((_, i) => svg.querySelector('[data-part="coin-' + i + '"]'));
  const clamp = (v) => Math.min(1, Math.max(0, v));
  let u = 0, target = 0, clock = 0, steer;
  const cur = VALUES.map(() => [...CHUTE]);          // 每枚硬币当前位置
  const targetOf = (i, count) => {                   // 处理到第 count 枚时硬币 i 的去处
    if (i >= count) return CHUTE;
    const st = SCRIPT[i];
    const rank = [...st.pan].sort((a, b) => b - a).indexOf(VALUES[i]);
    if (rank >= 0 && st.pan.includes(VALUES[i]) && st.pan.filter(x => x === VALUES[i]).length >= 1 && [...st.pan].sort((a,b)=>b-a)[rank] === VALUES[i]) {
      const seat = st.pan.indexOf(VALUES[i]);
      return [PAN_C[0] + SLOTS[seat], PAN_C[1], 6.2];
    }
    const rj = st.rej.indexOf(VALUES[i]);
    return [TRAY[0] - 10 + (rj % 2) * 16, TRAY[1] - 16 + Math.floor(rj / 2) * 13, 4.2];
  };
  const drawn = () => {
    const count = Math.round(clamp(u) * VALUES.length);
    for (let i = 0; i < VALUES.length; i++) {
      const t = targetOf(i, count);
      const c = cur[i];
      c[0] += (t[0] - c[0]) * 0.2; c[1] += (t[1] - c[1]) * 0.2; c[2] += (t[2] - c[2]) * 0.2;
      coins[i].setAttribute("transform", translateAlong(P, c));
    }
    const st = SCRIPT[Math.max(0, count - 1)];
    const text = count === 0 ? "盘内 — · 淘汰 —"
      : "盘内 [" + st.pan.join(", ") + "] · 淘汰 [" + st.rej.join(", ") + "]";
    if (readout.textContent !== text) readout.textContent = text;
    rig.stage.setAttribute("aria-valuenow", String(count));
    rig.stage.setAttribute("aria-valuetext", text);
  };
  const settled = () => cur.every((c, i) => {
    const t = targetOf(i, Math.round(clamp(u) * VALUES.length));
    return Math.abs(c[0] - t[0]) < 0.05 && Math.abs(c[2] - t[2]) < 0.05;
  });
  const frame = loop(rig, (dt) => {
    if (steer.touring) {
      clock += dt;
      const p = (clock % 12) / 12;
      target = p < 0.68 ? p / 0.68 : p < 0.88 ? 1 : 1 - (p - 0.88) / 0.12;
    }
    u = still.matches ? target : u + (target - u) * (1 - Math.exp(-dt / 0.3));
    if (Math.abs(target - u) < 0.001) u = target;
    drawn();
    return !steer.touring && u === target && settled();
  });
  steer = steerOf(rig, { onTour: () => { clock = 0; }, wake: frame.wake });
  if (still.matches) steer.touring = false;
  rig.stage.addEventListener("pointermove", (e) => {
    const box = svg.getBoundingClientRect();
    steer.manual(); target = clamp((e.clientX - box.left) / box.width); frame.wake();
  });
  rig.stage.addEventListener("pointerleave", () => steer.manual());
  rig.stage.addEventListener("keydown", (e) => {
    let c = Math.round(target * VALUES.length);
    if (e.key === "ArrowRight" || e.key === "ArrowUp") c = Math.min(VALUES.length, c + 1);
    else if (e.key === "ArrowLeft" || e.key === "ArrowDown") c = Math.max(0, c - 1);
    else if (e.key === "Home") c = 0;
    else if (e.key === "End") c = VALUES.length;
    else return;
    e.preventDefault(); steer.manual(); target = c / VALUES.length; frame.wake();
  });
  drawn();
})
`;
  return { id: "p08", card, live };
}
