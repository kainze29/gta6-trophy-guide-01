/* Leonida Platinum entrypoint (Node 22, standard library only).
   The guide itself is plain static files under app/: index.html, its stylesheets,
   its JavaScript modules and its data files, with no build step and no network
   use at run time. This program hands the entry in: it copies app/ and
   screenshots/ from beside this file into the output directory and writes
   output/dossier.json with buildDossier from the vendored make.fun library.
   The output directory is /output inside the grader; outside it, the
   MAKEFUN_OUTPUT_DIR environment variable stands in for /output:
     mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
   The grader runs this program twice and both runs must write the same bytes,
   so the output directory is emptied of its children first (never removed
   itself: the grader cannot remove its own mount point), then filled fresh.
   Leave vendor/makefun-frontend.ts unchanged: the scorer requires
   dossier.json to be byte for byte what its own copy of the library writes. */

import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(outputDir, { recursive: true });
for (const child of readdirSync(outputDir)) {
  rmSync(join(outputDir, child), { recursive: true, force: true });
}

cpSync(join(repoRoot, 'app'), join(outputDir, 'app'), { recursive: true });
if (existsSync(join(repoRoot, 'screenshots'))) {
  cpSync(join(repoRoot, 'screenshots'), join(outputDir, 'screenshots'), { recursive: true });
}

/* The scorer's caps: text_max_bytes shapes the dossier text, and the other
   caps refuse an entry the scorer would refuse (more than 4 screenshots or
   one over 256 KiB; more than 993 files and directories in app/ or 48 MiB
   of app files in all). */
const dossier = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648
});
writeFileSync(join(outputDir, 'dossier.json'), dossier);
