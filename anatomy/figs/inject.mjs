// inject.mjs · 收集 15 台装置 → 打包注入 ../index.html（幂等，可重复运行）
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { kitScript } from "../../../../.workbuddy/skills/anatomy/scripts/inline-kit.mjs";
import { k, PRELUDE } from "../lib.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const INDEX = join(HERE, "..", "..", "index.html");

const figs = {};
for (let i = 1; i <= 15; i++) {
  const id = "p" + String(i).padStart(2, "0");
  const { build } = await import(`./fig-${id}.mjs`);
  const fig = build();
  figs[fig.id] = { card: fig.card, live: fig.live };
}

const bundle = `<!--ANATOMY:BEGIN-->
<style id="anatomy-css">${k.ISO_CSS}
.fig-mount{padding:0;background:transparent}
.fig-mount .iso-figure{margin:0 auto;max-width:680px}
.fig-mount .iso-plate{box-shadow:none;--anatomy-paper:var(--anatomy-card)}
</style>
<script id="anatomy-kit">${kitScript().replace(/<\/(script)/gi, "<\\/$1")}</script>
<script id="anatomy-runtime">${PRELUDE}</script>
<script id="anatomy-figs">
(function(){
  const FIGS = ${JSON.stringify(figs)};
  function mountAll(root) {
    (root || document).querySelectorAll(".fig-mount[data-fig]").forEach((m) => {
      const fig = FIGS[m.dataset.fig];
      if (!fig || m.dataset.done) return;
      m.dataset.done = "1";
      m.innerHTML = '<div class="iso" data-theme="dark">' + fig.card + '</div>';
      try { new Function("root", "return (" + fig.live + ")(root);")(m); }
      catch (e) { console.error("fig mount failed:", m.dataset.fig, e); }
    });
  }
  window.__mountAlgoFigs__ = mountAll;
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => mountAll());
  else mountAll();
})();
</script>
<!--ANATOMY:END-->`;

let html = readFileSync(INDEX, "utf8");
html = html.replace(/<!--ANATOMY:BEGIN-->[\s\S]*?<!--ANATOMY:END-->/g, "").replace("<!--ANATOMY_BUNDLE-->", bundle);
if (!html.includes("<!--ANATOMY:BEGIN-->")) {
  html = html.includes("</body>") ? html.replace("</body>", bundle + "\n</body>") : html + bundle;
}
writeFileSync(INDEX, html);
console.log("injected", Object.keys(figs).length, "figures into", INDEX);
