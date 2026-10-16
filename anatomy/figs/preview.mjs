// preview.mjs · 单图预览构建：node preview.mjs p02 [--light]
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { kitScript } from "../../../../.workbuddy/skills/anatomy/scripts/inline-kit.mjs";
import { k, PRELUDE } from "../lib.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const id = process.argv[2] || "p01";
const theme = process.argv.includes("--light") ? "light" : "dark";
const { build } = await import(`./fig-${id}.mjs`);
const fig = build();
mkdirSync(join(HERE, "..", "preview"), { recursive: true });
const out = join(HERE, "..", "preview", `${id}${theme === "light" ? "-light" : ""}.html`);
writeFileSync(out, k.pageHtml({ title: fig.id, theme, body: fig.card, script: kitScript() + PRELUDE + fig.live + "(document.body)" }));
console.log("wrote", out);
