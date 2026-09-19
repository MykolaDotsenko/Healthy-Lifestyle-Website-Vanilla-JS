import { access, readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const sourceFiles = [
  "index.html",
  "css/style.css",
  "js/app.js",
  "js/ui/tabs.js",
  "js/ui/modal.js",
  "js/features/timer.js",
  "js/features/menu.js",
  "js/features/forms.js",
  "js/features/carousel.js",
  "js/features/calculator.js",
  "js/features/calculator-storage.js",
  "js/domain/calculator.js",
  "package.json",
  "README.md",
];

const forbiddenMergeMarkers = ["<<<<<<<", "=======", ">>>>>>>"];

async function read(relativePath) {
  return readFile(resolve(root, relativePath), "utf8");
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
  return [...html.matchAll(/(?:src|href)=["']([^"'#][^"']*)["']/g)].map(
    (match) => ({ from: "index.html", value: match[1] }),
  );
}

function extractCssReferences(css) {
  return [...css.matchAll(/url\(([^)]+)\)/g)]
    .map((match) => match[1].trim().replace(/^["']|["']$/g, ""))
    .filter((value) => !isExternalReference(value))
    .map((value) => ({ from: "css/style.css", value }));
}

async function assertNoMergeMarkers() {
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
  const requiredScripts = ["dev", "api", "lint", "check:static", "test", "check"];

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
