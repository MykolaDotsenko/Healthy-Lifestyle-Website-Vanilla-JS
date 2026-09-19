import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const [source, pkg, lock] = await Promise.all([
  readFile(resolve(root, "js/features/forms.js"), "utf8"),
  readFile(resolve(root, "package.json"), "utf8"),
  readFile(resolve(root, "package-lock.json"), "utf8"),
]);

test("static demo forms perform no network or persistence work", () => {
  assert.doesNotMatch(source, /fetch\s*\(/);
  assert.doesNotMatch(source, /XMLHttpRequest/);
  assert.doesNotMatch(source, /localhost:3000/);
  assert.doesNotMatch(source, /localStorage|sessionStorage/);
  assert.match(source, /Nothing was sent or stored/);
});

test("demo form keeps native validation in the loop", () => {
  assert.match(source, /checkValidity\(\)/);
  assert.match(source, /reportValidity\(\)/);
});

test("legacy json-server development backend is removed", () => {
  const packageJson = JSON.parse(pkg);
  const packageLock = JSON.parse(lock);

  assert.equal(packageJson.scripts.api, undefined);
  assert.equal(packageJson.devDependencies, undefined);
  assert.deepEqual(Object.keys(packageLock.packages), [""]);
});
