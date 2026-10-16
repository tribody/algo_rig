// fig-p03.mjs · 快慢指针 Fast & Slow Pointers
// 装置：环形轨道上两台小车，快车速度是慢车的整数倍；快车追上慢车那一刻=检测到环。
import { k, surfacePlate, knob } from "../lib.mjs";

export function build() {
  const W = 620, H = 400;
  const PLATE = { x: -150, y: -110, w: 300, d: 220, r: 8 };
  const RC = [0, 2], R = 58, NODES = 24;
  const HUB_R = 12;

  const P = k.fitProjection([...k.boxCorners(PLATE, -17, 0), [0, 0, 40]], W, H, { pad: 24, azimuth: 42 });

  function track() {
    const out = [];
    out.push(`<path class="iso-halo" d="${k.haloOf({ x: RC[0] - R - 16, y: RC[1] - R - 16, w: (R + 16) * 2, d: (R + 16) * 2, r: (R + 16) }, -17, 2, P)}"/>`);
    // 外环盘 + 内环盘，中间成槽
    out.push(k.solidSvg(k.cylinder(RC[0], RC[1], R + 14, -17, 19, P, 72, 1), { tone: "mid" }));
    out.push(k.solidSvg(k.cylinder(RC[0], RC[1], R - 14, -17, 21.5, P, 72, 1), { tone: "mid" }));
    out.push(k.lineSvg(k.ring(RC[0], RC[1], R + 12.6, 2, P, 72), { tone: "faint" }));
    out.push(k.lineSvg(k.ring(RC[0], RC[1], R - 12.6, 4.5, P, 72), { tone: "faint" }));
    // 节点刻度
    const ticks = k.radialTicks(RC[0], RC[1], R, NODES, 6, 2.2, [2.4, 4.4], P);
    out.push(k.lineSvg(ticks.minor, { tone: "lo" }), k.lineSvg(ticks.major, { tone: "mid" }));
    out.push(k.lineSvg(k.ring(RC[0], RC[1], R - 2.4, 2.2, P, 72), { tone: "lo" }));
    out.push(k.lineSvg(k.ring(RC[0], RC[1], R - 4.4, 2.2, P, 72), { tone: "lo" }));
    out.push(k.dotsSvg([0, 6, 12, 18].map((i) => {
      const a = (i / NODES) * Math.PI * 2;
      return k.iso([RC[0] + Math.cos(a) * (R + 8), RC[1] + Math.sin(a) * (R + 8), 2], P);
    }), { size: 0.5 }));
    // 中央判圈表
    out.push(k.solidSvg(k.cylinder(RC[0], RC[1], HUB_R, 4.5, 7, P, 48, 0.8), { tone: "hi", crease: "lo" }));
    out.push(k.lineSvg(k.knurl(RC[0], RC[1], HUB_R, 9.4, 11.5, 60, P, 0.3), { tone: "lo" }));
    out.push(k.lineSvg(k.sideArc(RC[0], RC[1], HUB_R, 9.4, P, 32), { tone: "faint" }));
    out.push(k.lineSvg(k.ring(RC[0], RC[1], HUB_R - 3.4, 11.5, P, 48), { tone: "lo" }));
    const hub = k.radialTicks(RC[0], RC[1], HUB_R - 3.4, 32, 8, 11.5, [1.2, 2.4], P);
    out.push(k.lineSvg(hub.minor, { tone: "lo" }), k.lineSvg(hub.major, { tone: "mid" }));
    out.push(k.lineSvg(k.ring(RC[0], RC[1], HUB_R - 4.6, 11.5, P, 48), { tone: "lo" }));
    out.push(k.lineSvg(k.ring(RC[0], RC[1], HUB_R - 5.8, 11.5, P, 48), { tone: "lo" }));
    out.push(k.faceTextSvg(k.topMatrix([RC[0], RC[1] + 7], 11.5, P, "x"), "LAP", { size: 2.4, tone: "lo", anchor: "middle" }));
    // 入轨支线（从台边进环）
    out.push(k.solidSvg(k.slabOf({ x: -132, y: RC[1] + R - 4, w: 56, d: 8, r: 1 }, -14.5, 16.5, P, 3, 0.5), { tone: "mid" }));
    out.push(k.lineSvg(k.planOutline(k.insetPlan({ x: -132, y: RC[1] + R - 4, w: 56, d: 8, r: 1 }, 2), 2, P, 3), { tone: "faint" }));
    out.push(knob(P, [-126, RC[1] + R], 2, 3.2, 3.6));
    return out.join("");
  }

  function cart(tag) {
    const out = [];
    out.push(k.solidSvg(k.cylinder(0, 0, 7, 4.5, 2.6, P, 32, 0.5), { tone: "hi", crease: "lo" }));
    out.push(k.lineSvg(k.ring(0, 0, 5.2, 7.1, P, 24), { tone: "faint" }));
    out.push(k.dotsSvg(k.corners({ x: -5, y: -5, w: 10, d: 10 }, 0).map(([x, y]) => k.iso([x, y, 7.1], P)), { size: 0.4, tone: "lo" }));
    out.push(k.solidSvg(k.cylinder(0, 0, 1.8, 7.1, 8, P, 20), { tone: "mid", crease: "none" }));
    out.push(k.solidSvg(k.slabOf({ x: -4.5, y: -1, w: 9, d: 2, r: 0.8 }, 12, 6.5, P, 2), { tone: "mid" }));
    out.push(k.faceTextSvg(k.sideMatrix([0, 1.2], 15, P, "y"), tag, { size: 2.6, tone: "hi", anchor: "middle" }));
    return out.join("");
  }

  const hubNeedleAt = (frac) => {
    const a = -Math.PI / 2 + frac * Math.PI * 2;
    return k.lineOnTop(
      [RC[0] - Math.sin(a) * 2, RC[1] + Math.cos(a) * 2],
      [RC[0] + Math.sin(a) * (HUB_R - 3.4), RC[1] - Math.cos(a) * (HUB_R - 3.4)], 11.7, P);
  };

  const body = [
    surfacePlate(P, PLATE, { label: "FLOYD CYCLE" }),
    track(),
    `<g data-part="cart-s" transform="${k.translateAlong(P, [RC[0] + R, RC[1], 0])}">${cart("S")}</g>`,
    `<g data-part="cart-f" transform="${k.translateAlong(P, [RC[0] + R, RC[1], 0])}">${cart("F")}</g>`,
    `<path data-part="hub-needle" class="iso-line" data-tone="lit" data-free="start" d="${hubNeedleAt(0)}" style="stroke-width:1.1"/>`,
  ];

  const svg = k.figureSvg({
    width: W, height: H,
    label: "Two carts on a circular track: the fast cart runs at a multiple of the slow cart's speed; the moment it laps the slow cart is the moment a cycle is detected.",
    body,
  });
  const card = k.plateHtml({
    fig: "P03", title: "Fast & Slow Pointers", hint: "hover 调速比 · ↑/↓ 调整",
    readout: "speed ×2.0 · lap 0 · 差 0°",
    keys: [
      { mark: "lit", label: "中央判圈表：慢车位置即表针" },
      { mark: "raised", label: "S 慢车 ×1 · F 快车 ×2（可调）" },
    ],
    caption: "环形轨道两台小车：快车每圈追上慢车一次——Floyd 判圈。相遇后把一台车放回起点同速再走，再遇处就是入环口（LC 142）。",
    body: `<div class="iso-stage" tabindex="0" role="slider" aria-label="快慢指针装置" aria-valuemin="15" aria-valuemax="30" aria-valuenow="20">${svg}</div>`,
  });

  const live = `(function(root){
  const P = ${JSON.stringify(P)};
  const RC = ${JSON.stringify(RC)}, R = ${R}, NODES = ${NODES}, HUB_R = ${HUB_R};
  const rig = rigOf(root), svg = rig.svg, readout = rig.readout, still = rig.still;
  const cartS = svg.querySelector('[data-part="cart-s"]'), cartF = svg.querySelector('[data-part="cart-f"]');
  const hubNeedle = svg.querySelector('[data-part="hub-needle"]');
  const hubNeedleAt = ${hubNeedleAt.toString().replace("k.lineOnTop", "lineOnTop")};
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  let t = 0, speed = 2, laps = 0, lastGap = 0, steer, flash = 0;
  const pos = (a) => [RC[0] + Math.cos(a) * R, RC[1] + Math.sin(a) * R];
  const drawn = () => {
    const aS = -Math.PI / 2 + 0.55 * t;
    const aF = -Math.PI / 2 + 0.55 * speed * t;
    const [xs, ys] = pos(aS), [xf, yf] = pos(aF);
    cartS.setAttribute("transform", translateAlong(P, [xs, ys, 0]));
    cartF.setAttribute("transform", translateAlong(P, [xf, yf, 0]));
    hubNeedle.setAttribute("d", hubNeedleAt((aS + Math.PI / 2) / (Math.PI * 2) % 1));
    const gap = ((aF - aS) % (Math.PI * 2)) / (Math.PI * 2) * 360;
    const node = Math.round(((aF % (Math.PI * 2)) / (Math.PI * 2)) * NODES) % NODES;
    const text = "speed ×" + speed.toFixed(1) + " · lap " + laps + " · 差 " + Math.round(gap) + "°" + (flash > 0 ? " · catch @ node " + node : "");
    if (readout.textContent !== text) readout.textContent = text;
    rig.stage.setAttribute("aria-valuenow", String(Math.round(speed * 10)));
    rig.stage.setAttribute("aria-valuetext", text);
  };
  const frame = loop(rig, (dt, now) => {
    const prevGap = (0.55 * speed * t - 0.55 * t) % (Math.PI * 2);
    t += dt;
    const gap = (0.55 * speed * t - 0.55 * t) % (Math.PI * 2);
    if (gap < prevGap) { laps++; flash = 1.2; }
    if (flash > 0) flash -= dt;
    drawn();
    return false;
  });
  steer = steerOf(rig, { wake: frame.wake });
  if (still.matches) steer.touring = false;
  rig.stage.addEventListener("pointermove", (e) => {
    const box = svg.getBoundingClientRect();
    steer.manual();
    speed = clamp(1.5 + ((e.clientY - box.top) / box.height) * 1.5, 1.5, 3);
    frame.wake();
  });
  rig.stage.addEventListener("pointerleave", () => steer.manual());
  rig.stage.addEventListener("keydown", (e) => {
    if (e.key === "ArrowUp" || e.key === "ArrowRight") speed = clamp(speed + 0.1, 1.5, 3);
    else if (e.key === "ArrowDown" || e.key === "ArrowLeft") speed = clamp(speed - 0.1, 1.5, 3);
    else return;
    e.preventDefault(); steer.manual(); frame.wake();
  });
  drawn();
})`;
  return { id: "p03", card, live };
}
