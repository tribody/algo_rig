// fig-p10.mjs · 动态规划 Dynamic Programming
// 装置：备忘录抽屉柜——自底向上逐格填表；每个格子只有两条依赖线，填过的直接开抽屉。
import { k, surfacePlate, knob } from "../lib.mjs";

export function build() {
  const W = 660, H = 400;
  const PLATE = { x: -165, y: -100, w: 330, d: 200, r: 8 };
  const ROWS = 4, COLS = 6;                        // dp[硬币种类][金额]
  const COINS = [1, 3, 4, 5];                      // 硬币面额
  const AMT = COLS - 1;                            // 目标金额 5
  const CW = 34, CH = 26;
  const OX = -110, OY = -56;
  const cellXY = (r, c) => [OX + c * CW, OY + r * CH];
  // dp 表（零钱兑换，dp[r][c]：只用前 r 种面额凑 c）
  const DP = (() => {
    const dp = Array.from({ length: ROWS }, () => Array(COLS).fill(Infinity));
    for (let r = 0; r < ROWS; r++) {
      dp[r][0] = 0;
      for (let c = 1; c <= AMT; c++) {
        if (r > 0) dp[r][c] = dp[r - 1][c];
        if (COINS[r] <= c && dp[r][c - COINS[r]] + 1 < dp[r][c]) dp[r][c] = dp[r][c - COINS[r]] + 1;
      }
    }
    return dp;
  })();

  const P = k.fitProjection([...k.boxCorners(PLATE, -17, 0), [0, 0, 20]], W, H, { pad: 24, azimuth: 42 });

  function cabinet() {
    const out = [];
    // 柜身
    out.push(k.solidSvg(k.slabOf({ x: OX - 10, y: OY - 12, w: COLS * CW + 20, d: ROWS * CH + 30, r: 3 }, 0, 4, P, 5, 0.6), { tone: "mid" }));
    out.push(k.lineSvg(k.planOutline(k.insetPlan({ x: OX - 10, y: OY - 12, w: COLS * CW + 20, d: ROWS * CH + 30, r: 3 }, 4), 4, P, 5), { tone: "faint" }));
    // 依赖刻线：每格 → 上方格 / 左偏格（值来源）
    const segs = [];
    for (let r = 1; r < ROWS; r++) for (let c = 1; c <= AMT; c++) {
      const [x, y] = cellXY(r, c);
      const [xu, yu] = cellXY(r - 1, c);
      const xl = Math.max(0, c - COINS[r]);
      const [xd, yd] = cellXY(r - 1, xl);
      segs.push(k.lineOnTop([x + CW / 2, y - 2], [xu + CW / 2, yu + CH / 2], 0.3, P));
      segs.push(k.lineOnTop([x - CW / 4, y - 2], [xd + CW / 2, yd + CH / 2], 0.3, P));
    }
    out.push(`<g data-part="dep">` + k.lineSvg(segs.join(""), { tone: "faint", free: true }) + `</g>`);
    // 抽屉
    for (let r = 0; r < ROWS; r++) for (let c = 0; c <= AMT; c++) {
      const [x, y] = cellXY(r, c);
      out.push(`<g data-part="cell-${r}-${c}">`
        + k.solidSvg(k.slabOf({ x: x - CW / 2 + 2, y: y - CH / 2 + 2, w: CW - 4, d: CH - 4, r: 2 }, 4, 3, P, 3, 0.5), { tone: "hi", crease: "lo" })
        + k.lineSvg(k.planOutline(k.insetPlan({ x: x - CW / 2 + 2, y: y - CH / 2 + 2, w: CW - 4, d: CH - 4, r: 2 }, 2.4), 7, P, 3), { tone: "faint" })
        + k.faceTextSvg(k.topMatrix([x, y + 2], 7, P, "x"), DP[r][c] === Infinity ? "∞" : String(DP[r][c]), { size: 3.4, tone: "mid", anchor: "middle" })
        + k.dotsSvg([k.iso([x, y - CH / 2 + 5, 7], P)], { size: 0.55, tone: "lo" })
        + `</g>`);
    }
    // 行列标
    for (let c = 0; c <= AMT; c++) out.push(k.faceTextSvg(k.topMatrix([OX + c * CW, OY - 16], 0.2, P, "x"), "amt " + c, { size: 2, tone: "lo", anchor: "middle" }));
    for (let r = 0; r < ROWS; r++) out.push(k.faceTextSvg(k.topMatrix([OX - 22, OY + r * CH], 0.2, P, "x"), "¥" + COINS[r], { size: 2, tone: "lo", anchor: "middle" }));
    // 手柄
    out.push(knob(P, [OX + COLS * CW + 2, OY + ROWS * CH + 8], 4, 3.4, 3.6));
    return out.join("");
  }

  const body = [
    surfacePlate(P, PLATE, { label: "DP MEMO TABLE" }),
    cabinet(),
  ];

  const svg = k.figureSvg({
    width: W, height: H,
    label: "A memo cabinet of drawers: each drawer's value comes from the two drawers its dependency lines point to; the table fills bottom-up, and any repeat query just opens the drawer.",
    body,
  });
  const card = k.plateHtml({
    fig: "P10", title: "Dynamic Programming", hint: "hover 填表 · ←/→ 逐格",
    readout: "填表 0/24",
    keys: [
      { mark: "lit", label: "抽屉：每个值只算一次，之后直接开抽屉" },
      { mark: "raised", label: "刻线 = 状态转移：每格只依赖两格" },
    ],
    caption: "零钱兑换填表：每格 = min(上一行同列, 左隔 c-w 列 + 1)——两条刻线就是全部依赖。自底向上填，重叠子问题永不重算。",
    body: `<div class="iso-stage" tabindex="0" role="slider" aria-label="动态规划填表装置" aria-valuemin="0" aria-valuemax="${ROWS * COLS}" aria-valuenow="0">${svg}</div>`,
  });

  const live = `(function(root){
  const P = ${JSON.stringify(P)};
  const ROWS = ${ROWS}, COLS = ${COLS}, COINS = ${JSON.stringify(COINS)};
  const DP = ${JSON.stringify(DP)};
  const OX = ${OX}, OY = ${OY}, CW = ${CW}, CH = ${CH};
  const rig = rigOf(root), svg = rig.svg, readout = rig.readout, still = rig.still;
  const TOTAL = ROWS * COLS;
  const cellXY = (r, c) => [OX + c * CW, OY + r * CH];
  const clamp = (v) => Math.min(1, Math.max(0, v));
  let u = 0, target = 0, clock = 0, steer;
  const drawn = () => {
    const n = Math.round(clamp(u) * TOTAL);
    // 依赖线：已填格子的线亮，其余暗
    const dep = svg.querySelector('[data-part="dep"]');
    if (dep) dep.style.opacity = 1;
    for (let i = 0; i < TOTAL; i++) {
      const r = Math.floor(i / COLS), c = i % COLS;
      const el = svg.querySelector('[data-part="cell-' + r + '-' + c + '"]');
      if (el) el.style.opacity = i < n ? 1 : 0.28;
    }
    const last = n - 1;
    let text = "填表 " + n + "/" + TOTAL;
    if (last >= 0) {
      const r = Math.floor(last / COLS), c = last % COLS;
      const xl = Math.max(0, c - COINS[r]);
      text = "dp[" + r + "][" + c + "] = " + DP[r][c] + " · 依赖 dp[" + Math.max(0, r - 1) + "][" + c + "] 与 dp[" + Math.max(0, r - 1) + "][" + xl + "]";
    }
    if (readout.textContent !== text) readout.textContent = text;
    rig.stage.setAttribute("aria-valuenow", String(n));
    rig.stage.setAttribute("aria-valuetext", text);
  };
  const frame = loop(rig, (dt) => {
    if (steer.touring) {
      clock += dt;
      const p = (clock % 14) / 14;
      target = p < 0.72 ? p / 0.72 : p < 0.9 ? 1 : 1 - (p - 0.9) / 0.1;
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
    let n = Math.round(target * TOTAL);
    if (e.key === "ArrowRight" || e.key === "ArrowUp") n = Math.min(TOTAL, n + 1);
    else if (e.key === "ArrowLeft" || e.key === "ArrowDown") n = Math.max(0, n - 1);
    else if (e.key === "Home") n = 0;
    else if (e.key === "End") n = TOTAL;
    else return;
    e.preventDefault(); steer.manual(); target = n / TOTAL; frame.wake();
  });
  drawn();
})
`;
  return { id: "p10", card, live };
}
