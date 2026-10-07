// Render every pose of the digital human to a 4K UHD portrait PNG (2160x3840).
// Same vector SVG as the app (lib/digitalHuman.ts), rasterized once with sharp/librsvg.
// Usage: node scripts/export-poses-4k.mjs   (outputs public/poses-4k/<slug>-<phase>.png)
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const W = 2160;
const H = 3840;
const BG = "#09090b";

const build = mkdtempSync(join(tmpdir(), "dh-"));
execFileSync(
  join(root, "node_modules/.bin/tsc"),
  [join(root, "lib/digitalHuman.ts"), "--outDir", build, "--module", "es2022", "--target", "es2022", "--skipLibCheck"],
  { stdio: "inherit" }
);
writeFileSync(join(build, "package.json"), '{"type":"module"}');
const { figureSvg } = await import(pathToFileURL(join(build, "digitalHuman.js")).href);

const SLUGS = [
  "planks", "burpees", "jogging", "dips", "lunges", "squats", "push-ups", "sit-ups",
  "skull-crushers", "downward-dog", "warrior", "childs-pose", "cobra", "hip-flexor",
  "hamstring", "chest-opener", "shoulder-stretch", "quad-stretch", "calf-stretch",
];

const out = join(root, "public/poses-4k");
mkdirSync(out, { recursive: true });
for (const slug of SLUGS) {
  for (const phase of ["start", "exec"]) {
    const svg = figureSvg(slug, phase, { width: W, height: H, background: BG });
    const file = join(out, `${slug}-${phase}.png`);
    await sharp(Buffer.from(svg), { density: 72 })
      .resize(W, H, { fit: "contain", background: BG })
      .png({ compressionLevel: 9, adaptiveFiltering: true, palette: false })
      .toFile(file);
    const meta = await sharp(file).metadata();
    console.log(`${slug}-${phase}.png ${meta.width}x${meta.height}`);
  }
}
rmSync(build, { recursive: true, force: true });
