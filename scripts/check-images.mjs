// Finds photos used in more than one place, so no two sections show the same picture.
// Run: node scripts/check-images.mjs   (exits with 1 when it finds a repeat)
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const root = new URL("../src/", import.meta.url).pathname;
const files = [];
(function walk(d) {
  for (const f of readdirSync(d)) {
    const p = join(d, f);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.(tsx?|json)$/.test(f) && !p.includes("/generated/")) files.push(p);
  }
})(root);

const media = readFileSync(join(root, "content/media.ts"), "utf8");
const imgBlock = media.slice(media.indexOf("export const IMG"), media.indexOf("} as const"));
const keyToId = Object.fromEntries([...imgBlock.matchAll(/(\w+): U\("([\w-]+)"\)/g)].map((m) => [m[1], m[2]]));

const uses = new Map(); // id -> [where]
const add = (id, where) => uses.set(id, [...(uses.get(id) ?? []), where]);
for (const f of files) {
  const rel = relative(root, f);
  const src = readFileSync(f, "utf8");
  src.split("\n").forEach((line, i) => {
    const where = `${rel}:${i + 1}`;
    if (rel === "content/media.ts" && /^\s+\w+: U\(/.test(line) && imgBlock.includes(line.trim())) return; // the IMG library itself
    for (const m of line.matchAll(/\bIMG\.(\w+)/g)) if (keyToId[m[1]]) add(keyToId[m[1]], where);
    for (const m of line.matchAll(/(?:photo-|U\(")(\d{10,13}-[0-9a-f]{6,12})/g)) add(m[1], where);
    for (const m of line.matchAll(/photo:\s*"(\d{10,13}-[0-9a-f]{6,12})"/g)) add(m[1], where);
  });
}
const repeats = [...uses].filter(([, w]) => w.length > 1);
for (const [id, w] of repeats) console.log(`photo-${id} used ${w.length}×\n  ${w.join("\n  ")}`);
console.log(repeats.length ? `\n${repeats.length} photos are used more than once.` : `All ${uses.size} photos are unique.`);
process.exit(repeats.length ? 1 : 0);
