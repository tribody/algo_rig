// fig-p12.mjs · 并查集 Union-Find
// 装置：编组站——车厢两两挂钩并成一个编组，旗子统一换成车头号；查询即找车头。
import { k, surfacePlate, rails } from "../lib.mjs";

export function build() {
  const W = 660, H = 380;
  const PLATE = { x: -165, y: -84, w: 330, d: 168, r: 8 };
  const N = 6;
  const NAMES = ["0", "1", "2", "3", "4", "5"];
  // 并查剧本
  const OPS = [[0, 1], [2, 4], [1, 3], [3, 4]];
  const PARENT = Array.from({ length: N }, (_, i) => i);
  const find = (x) => { while (PARENT[x] !== x) x = PARENT[x]; return x; };
  const SCRIPT = OPS.map(([a, b]) => {
    const ra = find(a), rb = find(b);
    PARENT[rb] = ra;
    return { a, b, from: rb, to: ra };
  });
  const W_W = 30, W_GAP = 15;
  const RAIL_Y = 4;
  const xOf = (i, groups) => {                     // 编组后位置：同组紧挨
    let x = -130;
    for (let j = 0; j < i; j++) {
      x += W_W + (find2(groups, j) === find2(groups, j + 1) ? W_GAP * 0.45 : W_GAP);
    }
    return x;
  };
  const find2 = (parent, x) => { while (parent[x] !== x) x = parent[x]; return x; };

  const P = k.fitProjection([...k.boxCorners(PLATE, -17, 0), [0, 0, 26]], W, H, { pad: 24, azimuth: 42 });

  // 每步后的父数组快照
  const SNAPSHOTS = (() => {
    const parent = Array.from({ length: N }, (_, i) => i);
    const snaps = [{ parent: [...parent] }];
    for (const { a, b } of OPS) {
      const ra = find2(parent, a), rb = find2(parent, b);
      parent[rb] = ra;
      snaps.push({ parent: [...parent] });
    }
    return snaps;
  })();

  function wagon(i) {
    const out = [];
    out.push(k.solidSvg(k.slabOf({ x: -W_W / 2, y: -9, w: W_W, d: 18, r: 2 }, 4.6, 8, P, 4, 0.5), { tone: "mid" }));
    out.push(k.lineSvg(k.planOutline(k.insetPlan({ x: -W_W / 2, y: -9, w: W_W, d: 18, r: 2 }, 1.5), 12.6, P, 4), { tone: "faint" }));
    out.push(k.dotsSvg([[-W_W / 2 + 4, -9 + 4], [W_W / 2 - 4, -9 + 4], [-W_W / 2 + 4, 5], [W_W / 2 - 4, 5]].map(([x, y]) => k.iso([x, y, 12.6], P)), { size: 0.4, tone: "lo" }));
    for (const wx of [-W_W / 2 + 6, W_W / 2 - 6]) {
      out.push(k.solidSvg(k.cylinder(wx, 9.5, 3.4, 1.2, 2.4, P, 20), { tone: "lo", crease: "none" }));
    }
    // 旗杆 + 旗
    out.push(k.solidSvg(k.cylinder(0, -4, 1.1, 12.6, 9, P, 12), { tone: "mid", crease: "none" }));
    out.push(k.solidSvg(k.slabOf({ x: 1, y: -5.4, w: 8, d: 2.8, r: 0.6 }, 17.5, 3.4, P, 2), { tone: "hi", crease: "none" }));
    out.push(`<text data-part="flag-${i}" class="iso-face-text" data-tone="hi" transform="${k.topMatrix([5, -1.4], 21.2, P, "x")}" font-size="2.6" text-anchor="middle">${NAMES[i]}</text>`);
    return out.join("");
  }

  // 挂钩（live 控制显隐）：i 与 i+1 之间
  const couplers = [];
  for (let i = 0; i < N - 1; i++) {
    couplers.push(`<g data-part="coupler-${i}" style="opacity:0">${
      k.solidSvg(k.slabOf({ x: W_W / 2 - 2, y: -2, w: W_GAP * 0.45 + 4, d: 4, r: 1 }, 5.6, 2.4, P, 2, 0.4), { tone: "mid" })
    }</g>`);
  }

  const body = [
    surfacePlate(P, PLATE, { label: "UNION-FIND" }),
    rails(P, { from: -150, to: 150, ys: [RAIL_Y - 6, RAIL_Y + 10], h: 1.6, stopH: 3.5 }),
    ...couplers,
    ...NAMES.map((_, i) => `<g data-part="wagon-${i}" transform="${k.translateAlong(P, [-130 + i * (W_W + W_GAP), 0, 0])}">${wagon(i)}</g>`),
  ];

  const svg = k.figureSvg({
    width: W, height: H,
    label: "A marshalling yard: union couples two trains and every wagon in the merged train flies the leader's flag; find walks a wagon's flag back to its leader.",
    body,
  });
  const card = k.plateHtml({
    fig: "P12", title: "Union-Find", hint: "hover 挂钩 · ←/→ 单步",
    readout: "分量 6 · 各自为政",
    keys: [
      { mark: "lit", label: "旗子 = 代表元（车头）；查询就是看旗" },
      { mark: "raised", label: "挂钩 = union：两列并一列" },
    ],
    caption: "union 把两列车厢挂成一组，组内旗子全换成车头号；find 顺着旗子找车头。路径压缩后几乎 O(1)——Kruskal 求最小生成树靠它判环。",
    body: `<div class="iso-stage" tabindex="0" role="slider" aria-label="并查集装置" aria-valuemin="0" aria-valuemax="${OPS.length}" aria-valuenow="0">${svg}</div>`,
  });

  const live = `(function(root){
  const P = ${JSON.stringify(P)};
  const N = ${N};
  const OPS = ${JSON.stringify(OPS)};
  const SNAPSHOTS = ${JSON.stringify(SNAPSHOTS)};
  const NAMES = ${JSON.stringify(NAMES)};
  const W_W = ${W_W}, W_GAP = ${W_GAP};
  const rig = rigOf(root), svg = rig.svg, readout = rig.readout, still = rig.still;
  const wagons = NAMES.map((_, i) => svg.querySelector('[data-part="wagon-' + i + '"]'));
  const flags = NAMES.map((_, i) => svg.querySelector('[data-part="flag-' + i + '"]'));
  const couplers = [];
  for (let i = 0; i < N - 1; i++) couplers.push(svg.querySelector('[data-part="coupler-' + i + '"]'));
  const find2 = (parent, x) => { while (parent[x] !== x) x = parent[x]; return x; };
  const clamp = (v) => Math.min(1, Math.max(0, v));
  let u = 0, target = 0, clock = 0, steer;
  const cur = NAMES.map((_, i) => [-130 + i * (W_W + W_GAP)]);
  const drawn = () => {
    const step = Math.round(clamp(u) * OPS.length);
    const parent = SNAPSHOTS[step].parent;
    // 同组相邻位置排布
    const xs = [];
    let x = -130;
    const groups = {};
    for (let i = 0; i < N; i++) { const r = find2(parent, i); (groups[r] = groups[r] || []).push(i); }
    const flat = Object.values(groups).map(g => g.sort((a, b) => a - b)).sort((a, b) => a[0] - b[0]).flat();
    flat.forEach((w) => { xs[w] = x; x += W_W + (flat.indexOf(w) < flat.length - 1 && find2(parent, flat[flat.indexOf(w) + 1]) === find2(parent, w) ? W_GAP * 0.45 : W_GAP); });
    for (let i = 0; i < N; i++) {
      cur[i][0] += (xs[i] - cur[i][0]) * 0.2;
      wagons[i].setAttribute("transform", translateAlong(P, [cur[i][0], 0, 0]));
      flags[i].textContent = NAMES[find2(parent, i)];
    }
    for (let i = 0; i < N - 1; i++) {
      const same = find2(parent, i) === find2(parent, i + 1);
      const c = couplers[i];
      c.style.opacity = same ? 1 : 0;
      if (same) c.setAttribute("transform", translateAlong(P, [(cur[i][0] + cur[i + 1][0]) / 2, 0, 0]));
    }
    const comps = new Set(NAMES.map((_, i) => find2(parent, i))).size;
    const text = step === 0 ? "分量 " + N + " · 各自为政"
      : "union(" + OPS[step - 1][0] + "," + OPS[step - 1][1] + ") 后 · 分量 " + comps;
    if (readout.textContent !== text) readout.textContent = text;
    rig.stage.setAttribute("aria-valuenow", String(step));
    rig.stage.setAttribute("aria-valuetext", text);
  };
  const frame = loop(rig, (dt) => {
    if (steer.touring) {
      clock += dt;
      const p = (clock % 11) / 11;
      target = p < 0.64 ? p / 0.64 : p < 0.86 ? 1 : 1 - (p - 0.86) / 0.14;
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
  return { id: "p12", card, live };
}
