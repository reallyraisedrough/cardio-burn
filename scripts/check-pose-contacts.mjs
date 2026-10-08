// Prints, per pose, every body part within 6 units of the floor and its gap
// (floor - lowest point; -0.35 = touching with the contact overlap, > 0.1 = floating).
// Usage: node scripts/check-pose-contacts.mjs [filter]
import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = mkdtempSync(join(tmpdir(), "pose-contacts-"));
execFileSync(join(root, "node_modules/.bin/tsc"), [join(root, "lib/digitalHuman.ts"), "--outDir", out, "--module", "es2022", "--target", "es2022", "--skipLibCheck"]);
writeFileSync(join(out, "package.json"), '{"type":"module"}');
const m = await import(join(out, "digitalHuman.js"));
const only = process.argv[2];
for (const slug of Object.keys(m.POSE_SPECS)) {
  for (const phase of ["start", "exec"]) {
    if (only && !`${slug}-${phase}`.includes(only)) continue;
    const c = m.poseContacts(slug, phase);
    const near = Object.entries(c.parts)
      .map(([tag, box]) => [tag, c.floor - box.maxY])
      .filter(([, gap]) => gap < 6)
      .sort((a, b) => a[1] - b[1]);
    console.log(`${slug}-${phase}`.padEnd(24), near.map(([t, g]) => `${t}:${g.toFixed(2)}`).join(" "));
  }
}
