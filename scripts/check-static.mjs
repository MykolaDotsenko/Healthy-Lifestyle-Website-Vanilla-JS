import { access, readFile, readdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const forbiddenMergeMarkers = ["<<<<<<<", "=======", ">>>>>>>"];

async function read(relativePath) {
  return readFile(resolve(root, relativePath), "utf8");
}

async function collectSourceFiles(directory, extensions) {
  const absolute = resolve(root, directory);
  const entries = await readdir(absolute, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const relative = `${directory}/${entry.name}`;

    if (entry.isDirectory()) {
      files.push(...(await collectSourceFiles(relative, extensions)));
    } else if (extensions.some((extension) => entry.name.endsWith(extension))) {
      files.push(relative);
    }
  }

  return files;
}

function isExternalReference(value) {
  return (
    value === "" ||
    value.startsWith("#") ||
    value.startsWith("data:") ||
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("mailto:") ||
    value.startsWith("tel:")
  );
}

function extractHtmlReferences(html) {
  const directReferences = [
    ...html.matchAll(/(?:src|href)=["']([^"'#][^"']*)["']/g),
  ].map((match) => ({ from: "index.html", value: match[1] }));

  const srcsetReferences = [...html.matchAll(/srcset=["']([^"']+)["']/g)]
    .flatMap((match) => match[1].split(","))
    .map((candidate) => candidate.trim().split(/\s+/)[0])
    .filter(Boolean)
    .map((value) => ({ from: "index.html", value }));

  return [...directReferences, ...srcsetReferences];
}

function extractCssReferences(css) {
  return [...css.matchAll(/url\(([^)]+)\)/g)]
    .map((match) => match[1].trim().replace(/^["']|["']$/g, ""))
    .filter((value) => !isExternalReference(value))
    .map((value) => ({ from: "css/style.css", value }));
}

async function assertNoMergeMarkers() {
  const sourceFiles = [
    "index.html",
    "css/style.css",
    "package.json",
    "README.md",
    "ARCHITECTURE.md",
    "QUALITY.md",
    ...(await collectSourceFiles("js", [".js"])),
    ...(await collectSourceFiles("scripts", [".mjs"])),
    ...(await collectSourceFiles("tests", [".mjs"])),
  ];

  for (const relativePath of sourceFiles) {
    const content = await read(relativePath);
    for (const marker of forbiddenMergeMarkers) {
      if (content.includes(marker)) {
        throw new Error(`${relativePath} contains unresolved merge marker: ${marker}`);
      }
    }
  }
}

async function assertLocalReferencesExist() {
  const html = await read("index.html");
  const css = await read("css/style.css");
  const references = [
    ...extractHtmlReferences(html),
    ...extractCssReferences(css),
  ].filter(({ value }) => !isExternalReference(value));

  for (const { from, value } of references) {
    const target = resolve(root, dirname(from), value);
    try {
      await access(target);
    } catch {
      throw new Error(`Missing local asset referenced from ${from}: ${value}`);
    }
  }

  return references.length;
}

async function assertPackageScripts() {
  const packageJson = JSON.parse(await read("package.json"));
  const requiredScripts = ["dev", "check:syntax", "check:static", "test", "check"];

  for (const script of requiredScripts) {
    if (!packageJson.scripts?.[script]) {
      throw new Error(`package.json is missing required script: ${script}`);
    }
  }
}

await assertNoMergeMarkers();
const referenceCount = await assertLocalReferencesExist();
await assertPackageScripts();

console.log(`Static checks passed: ${referenceCount} local references verified.`);
