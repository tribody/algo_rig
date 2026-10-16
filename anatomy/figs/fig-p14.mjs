// fig-p14.mjs · 复杂度直觉 Complexity Sight
// 装置：曲线描绘仪——三根探针沿 O(n)、O(n log n)、O(n²) 三条刻线滑动，游标一拨即读。
import { k, surfacePlate } from "../lib.mjs";

export function build() {
  const W = 660, H = 400;
  const PLATE = { x: -165, y: -95, w: 330, d: 190, r: 8 };
  const X0 = -120, X1 = 120, Z = 1.2;            // N ∈ [1,32] → x 世界坐标
  const MAXN = 32;
  const px = (n) => X0 + ((n - 1) / (MAXN - 1)) * (X1 - X0);
  const py = (ops) => -46 + (ops / (MAXN * MAXN)) * 78;
  const CURVES = [
    { name: "n", tone: "green", f: (n) => n },
    { name: "n log n", tone: "mid", f: (n) => n * Math.log2(Math.max(2, n)) },
    { name: "n²", tone: "red", f: (n) => n * n },
  ];
  const CY = -46;                                  // 曲线基线世界 y

  const P = k.fitProjection([...k.boxCorners(PLATE, -17, 0), [0, 0, 30]], W, H, { pad: 24, azimuth: 42 });

  function bed() {
    const out = [];
    out.push(k.solidSvg(k.slabOf({ x: X0 - 14, y: -52, w: X1 - X0 + 28, d: 108, r: 2 }, 0, 1.2, P, 3), { tone: "lo", crease: "none" }));
    // 轴
    out.push(k.lineSvg([
      k.lineOnTop([X0, CY - 4], [X0, CY + 82], Z, P),
      k.lineOnTop([X0, CY], [X1, CY], Z, P),
    ].join(""), { tone: "mid", free: true }));
    // N 刻度
    const ticks = k.topTicks(X0, X1, (X1 - X0) / 8, 2, CY, Z, [2, 3.6], P);
    out.push(k.lineSvg(ticks.minor, { tone: "lo" }), k.lineSvg(ticks.major, { tone: "mid" }));
    for (const n of [1, 8, 16, 24, 32]) {
      out.push(k.faceTextSvg(k.topMatrix([px(n), CY + 6], Z, P, "x"), String(n), { size: 2.2, tone: "lo", anchor: "middle" }));
    }
    // 三条曲线
    for (const cv of CURVES) {
      const pts = [];
      for (let i = 0; i <= 48; i++) {
        const n = 1 + (i / 48) * (MAXN - 1);
        pts.push([px(n), CY + cv.f(n) / (MAXN * MAXN) * 78]);
      }
      const d = pts.map((p, i) => (i ? "L" : "M") + k.iso([p[0], p[1], Z + 0.1], P).join(" ")).join("");
      out.push(`<path data-part="curve-${cv.name.replace(/\s/g, "")}" class="iso-line" data-tone="${cv.tone}" d="${d}"/>`);
      out.push(k.dotsSvg([k.iso([pts[0][0], pts[0][1], Z + 0.1], P), k.iso([pts[pts.length - 1][0], pts[pts.length - 1][1], Z + 0.1], P)], { size: 0.6, tone: "mid" }));
      // 曲线名牌
      out.push(k.faceTextSvg(k.topMatrix([X1 - 4, CY + cv.f(MAXN) / (MAXN * MAXN) * 78 + 4], Z, P, "x"), cv.name, { size: 2.4, tone: cv.tone === "mid" ? "lo" : cv.tone, anchor: "end" }));
    }
    // 探针游标
    out.push(`<g data-part="cursor">`
      + k.solidSvg(k.cylinder(0, CY + 40, 1.1, Z, 20, P, 12), { tone: "hi", lit: true, crease: "none" })
      + k.solidSvg(k.cylinder(0, CY + 40, 2.6, Z + 20, 2.4, P, 18), { tone: "mid" })
      + `</g>`);
    for (const cv of CURVES) {
      const cls = cv.tone === "green" || cv.tone === "red" ? cv.tone : "hi";
      out.push(`<circle data-part="dot-${cv.name.replace(/\s/g, "")}" cx="0" cy="0" r="1.7" fill="var(--anatomy-${cls === "hi" ? "dot" : cls})" style="opacity:.9"/>`);
    }
    return out.join("");
  }

  const body = [
    surfacePlate(P, PLATE, { label: "COMPLEXITY SIGHT" }),
    bed(),
  ];

  const svg = k.figureSvg({
    width: W, height: H,
    label: "A curve tracer: a cursor rides along the N axis and three probes ride the engraved n, n log n and n² curves, reading the cost of each at the same input size.",
    body,
  });
  const card = k.plateHtml({
    fig: "P14", title: "Complexity Sight", hint: "hover 拨 N · ←/→ 微调",
    readout: "N = 1 · n:1 · nlogn:1 · n²:1",
    keys: [
      { mark: "lit", label: "游标 + 三根探针：同一 N 下的三种代价" },
      { mark: "raised", label: "绿 n · 灰 n log n · 红 n²" },
    ],
    caption: "看到数据规模先拨游标：N=10⁵ 时 n² 已顶穿表盘，n log n 才刚过半——「规模反推复杂度」就是这台仪器要练出的手感。",
    body: `<div class="iso-stage" tabindex="0" role="slider" aria-label="复杂度直觉装置" aria-valuemin="1" aria-valuemax="${MAXN}" aria-valuenow="1">${svg}</div>`,
  });

  const live = `(function(root){
  const P = ${JSON.stringify(P)};
  const MAXN = ${MAXN}, X0 = ${X0}, X1 = ${X1}, CY = ${CY};
  const px = (n) => X0 + ((n - 1) / (MAXN - 1)) * (X1 - X0);
  const pyv = (ops) => CY + (ops / (MAXN * MAXN)) * 78;
  const F = { n: (v) => v, nlogn: (v) => v * Math.log2(Math.max(2, v)), "n²": (v) => v * v };
  const rig = rigOf(root), svg = rig.svg, readout = rig.readout, still = rig.still;
  const cursor = svg.querySelector('[data-part="cursor"]');
  const dots = { n: svg.querySelector('[data-part="dot-n"]'), nlogn: svg.querySelector('[data-part="dot-nlogn"]'), "n²": svg.querySelector('[data-part="dot-n²"]') };
  const clamp = (v) => Math.min(1, Math.max(0, v));
  let u = 0, target = 0, clock = 0, steer;
  const drawn = () => {
    const n = Math.round(1 + clamp(u) * (MAXN - 1));
    const x = px(n);
    cursor.setAttribute("transform", translateAlong(P, [x, 0, 0]));
    for (const key of Object.keys(F)) {
      const ops = F[key](n);
      const [sx, sy] = iso([x, pyv(ops), 1.4], P);
      dots[key].setAttribute("cx", sx); dots[key].setAttribute("cy", sy);
    }
    const text = "N = " + n + " · n:" + Math.round(F.n(n)) + " · nlogn:" + Math.round(F.nlogn(n)) + " · n²:" + Math.round(F["n²"](n));
    if (readout.textContent !== text) readout.textContent = text;
    rig.stage.setAttribute("aria-valuenow", String(n));
    rig.stage.setAttribute("aria-valuetext", text);
  };
  const frame = loop(rig, (dt) => {
    if (steer.touring) {
      clock += dt;
      const p = (clock % 9) / 9;
      target = p < 0.62 ? p / 0.62 : p < 0.85 ? 1 : 1 - (p - 0.85) / 0.15;
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
    let n = Math.round(1 + clamp(u) * (MAXN - 1));
    if (e.key === "ArrowRight" || e.key === "ArrowUp") n = Math.min(MAXN, n + 1);
    else if (e.key === "ArrowLeft" || e.key === "ArrowDown") n = Math.max(1, n - 1);
    else if (e.key === "Home") n = 1;
    else if (e.key === "End") n = MAXN;
    else return;
    e.preventDefault(); steer.manual(); target = (n - 1) / (MAXN - 1); frame.wake();
  });
  drawn();
})
`;
  return { id: "p14", card, live };
}
