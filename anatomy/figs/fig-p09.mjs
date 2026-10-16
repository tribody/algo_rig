// fig-p09.mjs · 单调栈 Monotonic Stack
// 装置：弹簧餐盘塔——塔上餐盘从底到顶递减；来的盘子比塔顶大就把压住的都弹去托盘，自己落座。
import { k, surfacePlate, knob } from "../lib.mjs";

export function build() {
  const W = 640, H = 400;
  const PLATE = { x: -160, y: -100, w: 320, d: 200, r: 8 };
  const TOWER = [-58, -8];
  const START = [9, 5, 2];                        // 初始栈（底→顶）
  const OPS = [3, 7, 4, 8];                       // 依次进栈的值
  const TH = 2.6;                                 // 盘厚
  const PR = 15;                                  // 盘半径
  const CHUTE = { x: 46, y: -34, w: 78, d: 11, r: 1.5 };
  const TRAY = { x: -140, y: 24, w: 56, d: 44, r: 2 };

  // 剧本：每步后的栈与托盘
  const SCRIPT = (() => {
    let stack = [...START], rej = [];
    const steps = [];
    for (const v of OPS) {
      const popped = [];
      while (stack.length && stack[stack.length - 1] < v) popped.push(stack.pop());
      stack.push(v); rej = rej.concat(popped);
      steps.push({ stack: [...stack], popped, rej: [...rej], v });
    }
    return steps;
  })();

  const P = k.fitProjection([...k.boxCorners(PLATE, -17, 0), [TOWER[0], 0, 46]], W, H, { pad: 24, azimuth: 42 });

  const plateZ = (idxFromBottom) => 4.4 + idxFromBottom * TH;

  function tower() {
    const out = [];
    out.push(k.solidSvg(k.slabOf({ x: TOWER[0] - 20, y: TOWER[1] - 20, w: 40, d: 40, r: 3 }, 0, 4.4, P, 5, 0.6), { tone: "mid" }));
    out.push(k.lineSvg(k.planOutline(k.insetPlan({ x: TOWER[0] - 20, y: TOWER[1] - 20, w: 40, d: 40, r: 3 }, 2.5), 4.4, P, 5), { tone: "faint" }));
    out.push(k.solidSvg(k.cylinder(TOWER[0], TOWER[1], 2.2, 4.4, 34, P, 20), { tone: "mid", crease: "none" }));
    // 弹簧（塔座与底盘之间的一组环）
    for (let i = 0; i < 4; i++) {
      out.push(k.lineSvg(k.ring(TOWER[0], TOWER[1], 5.2 - i * 0.28, 1 + i * 0.9, P, 28), { tone: "lo" }));
    }
    // 顶帽
    out.push(k.solidSvg(k.cylinder(TOWER[0], TOWER[1], 3.6, 38.4, 2.4, P, 24, 0.5), { tone: "mid" }));
    out.push(knob(P, [TOWER[0], TOWER[1]], 40.8, 2.8, 3));
    // 溜槽
    out.push(k.solidSvg(k.slabOf(CHUTE, 10.4, 2.4, P, 3, 0.4), { tone: "mid" }));
    out.push(k.lineSvg(k.planOutline(k.insetPlan(CHUTE, 1.5), 12.8, P, 3), { tone: "faint" }));
    out.push(k.solidSvg(k.slabOf({ x: CHUTE.x - 3, y: CHUTE.y - 3, w: 3, d: CHUTE.d + 6, r: 1 }, 12.8, 7, P, 2, 0.4), { tone: "mid" }));
    // 托盘
    out.push(k.solidSvg(k.slabOf(TRAY, 0, 2.6, P, 4, 0.5), { tone: "mid" }));
    out.push(k.lineSvg(k.planOutline(k.insetPlan(TRAY, 2), 2.6, P, 4), { tone: "faint" }));
    return out.join("");
  }

  function plate(v) {
    const out = [];
    out.push(k.solidSvg(k.cylinder(0, 0, PR, 0, TH, P, 44, 0.5), { tone: "hi", crease: "lo" }));
    out.push(k.lineSvg(k.ring(0, 0, PR - 2.2, TH, P, 44), { tone: "lo" }));
    out.push(k.faceTextSvg(k.topMatrix([0, 0], TH, P, "x"), String(v), { size: 3, tone: "lo", anchor: "middle" }));
    return out.join("");
  }

  // 盘子：START 3 只 + OPS 4 只；live 按剧本定位
  const allPlates = [...START.map((v, i) => ({ v, id: "s" + i })), ...OPS.map((v, i) => ({ v, id: "o" + i }))];
  const plateGroups = allPlates.map((p) => {
    const i = START.indexOf(p.v);
    const home = i >= 0 && allPlates.indexOf(p) < START.length
      ? [TOWER[0], TOWER[1], plateZ(START.length - 1 - i)]
      : [CHUTE.x + CHUTE.w - 12, CHUTE.y + CHUTE.d / 2, 15.2];
    return `<g data-part="plate-${p.id}" data-v="${p.v}" transform="${k.translateAlong(P, home)}">${plate(p.v)}</g>`;
  }).join("");

  const body = [
    surfacePlate(P, PLATE, { label: "MONOTONIC STACK" }),
    tower(),
    plateGroups,
  ];

  const svg = k.figureSvg({
    width: W, height: H,
    label: "A spring plate tower: incoming plates land on top; a plate larger than the tower top pops every smaller plate off into the tray before it sits down.",
    body,
  });
  const card = k.plateHtml({
    fig: "P09", title: "Monotonic Stack", hint: "hover 落盘 · ←/→ 单步",
    readout: "栈 [9, 5, 2] · 等待下一只",
    keys: [
      { mark: "lit", label: "塔上餐盘：从底到顶递减" },
      { mark: "raised", label: "被顶掉的盘子飞进左侧托盘" },
    ],
    caption: "新盘 7 进塔：比塔顶小的 3、5 全被顶进托盘，7 落座——被顶掉的那一刻，就找到了「下一个更大元素」。塔始终保持单调，每个盘至多进出一次，O(n)。",
    body: `<div class="iso-stage" tabindex="0" role="slider" aria-label="单调栈装置" aria-valuemin="0" aria-valuemax="${OPS.length}" aria-valuenow="0">${svg}</div>`,
  });

  const live = `(function(root){
  const P = ${JSON.stringify(P)};
  const START = ${JSON.stringify(START)};
  const OPS = ${JSON.stringify(OPS)};
  const SCRIPT = ${JSON.stringify(SCRIPT)};
  const TOWER = ${JSON.stringify(TOWER)};
  const TH = ${TH}, PR = ${PR};
  const CHUTE = [${CHUTE.x + CHUTE.w - 12}, ${CHUTE.y + CHUTE.d / 2}, 15.2];
  const TRAY = [${TRAY.x + TRAY.w / 2}, ${TRAY.y + TRAY.d / 2}];
  const rig = rigOf(root), svg = rig.svg, readout = rig.readout, still = rig.still;
  const ids = [...START.map((v, i) => "s" + i), ...OPS.map((v, i) => "o" + i)];
  const els = {}, vs = {};
  ids.forEach((id) => { els[id] = svg.querySelector('[data-part="plate-' + id + '"]'); vs[id] = Number(els[id].dataset.v); });
  const clamp = (v) => Math.min(1, Math.max(0, v));
  let u = 0, target = 0, clock = 0, steer;
  const cur = ids.map((id) => (id[0] === "s"
    ? [TOWER[0], TOWER[1], 4.4 + (START.length - 1 - Number(id.slice(1))) * TH]
    : [...CHUTE]));
  const plateZ = (i) => 4.4 + i * TH;
  const targetOf = (id, count) => {
    const v = vs[id];
    if (id[0] === "s") {
      const st = count === 0 ? { stack: START, rej: [] } : SCRIPT[Math.min(count, SCRIPT.length) - 1];
      const at = st.stack.indexOf(v);
      return at >= 0 ? [TOWER[0], TOWER[1], plateZ(st.stack.length - 1 - at)] : [TRAY[0] - 8 + (st.rej.indexOf(v) % 2) * 18, TRAY[1] - 8 + Math.floor(st.rej.indexOf(v) / 2) * 12, 4.2];
    }
    const oi = Number(id.slice(1));
    if (oi >= count) return [...CHUTE];
    const st = SCRIPT[oi];
    const at = st.stack.indexOf(v);
    if (at >= 0) return [TOWER[0], TOWER[1], plateZ(st.stack.length - 1 - at)];
    const rj = st.rej.indexOf(v);
    return [TRAY[0] - 8 + (rj % 2) * 18, TRAY[1] - 8 + Math.floor(rj / 2) * 12, 4.2];
  };
  const drawn = () => {
    const count = Math.round(clamp(u) * OPS.length);
    ids.forEach((id, i) => {
      const t = targetOf(id, count);
      const c = cur[i];
      c[0] += (t[0] - c[0]) * 0.22; c[1] += (t[1] - c[1]) * 0.22; c[2] += (t[2] - c[2]) * 0.22;
      els[id].setAttribute("transform", translateAlong(P, c));
    });
    const st = count === 0 ? { stack: START, rej: [], v: null } : SCRIPT[count - 1];
    const text = count === 0
      ? "栈 [" + START.join(", ") + "] · 等待下一只"
      : "进 " + st.v + " → 弹 [" + st.popped.join(", ") + "] · 栈 [" + st.stack.join(", ") + "]";
    if (readout.textContent !== text) readout.textContent = text;
    rig.stage.setAttribute("aria-valuenow", String(count));
    rig.stage.setAttribute("aria-valuetext", text);
  };
  const settled = () => cur.every((c, i) => {
    const t = targetOf(ids[i], Math.round(clamp(u) * OPS.length));
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
    let c = Math.round(target * OPS.length);
    if (e.key === "ArrowRight" || e.key === "ArrowUp") c = Math.min(OPS.length, c + 1);
    else if (e.key === "ArrowLeft" || e.key === "ArrowDown") c = Math.max(0, c - 1);
    else if (e.key === "Home") c = 0;
    else if (e.key === "End") c = OPS.length;
    else return;
    e.preventDefault(); steer.manual(); target = c / OPS.length; frame.wake();
  });
  drawn();
})
`;
  return { id: "p09", card, live };
}
