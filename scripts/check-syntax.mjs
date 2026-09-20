import { readdir } from "node:fs/promises";
import { extname, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const sourceRoots = ["js", "scripts", "tests"];
const extensions = new Set([".js", ".mjs"]);

async function collect(directory) {
  const absolute = resolve(root, directory);
  const entries = await readdir(absolute, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const relative = `${directory}/${entry.name}`;

    if (entry.isDirectory()) {
      files.push(...(await collect(relative)));
      continue;
    }

    if (extensions.has(extname(entry.name))) {
      files.push(relative);
    }
  }

  return files;
}

const files = (
  await Promise.all(sourceRoots.map((directory) => collect(directory)))
)
  .flat()
  .sort((a, b) => a.localeCompare(b));

for (const relativePath of files) {
  const result = spawnSync(
    process.execPath,
    ["--check", resolve(root, relativePath)],
    { stdio: "inherit" },
  );

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

console.log(`Syntax checks passed: ${files.length} JavaScript files verified.`);
