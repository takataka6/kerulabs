import { existsSync, readFileSync, writeFileSync } from "node:fs";
import process from "node:process";

const [, , tagName, outputPath = "RELEASE_NOTES.md"] = process.argv;
const templatePath = ".github/release-body.md";

if (!tagName) {
  throw new Error(
    "Usage: node scripts/extract-release-notes.mjs <tag> [output]",
  );
}

const version = tagName.replace(/^v/, "");
const packageJson = JSON.parse(readFileSync("package.json", "utf8"));

if (packageJson.version !== version) {
  throw new Error(
    `Tag ${tagName} does not match package.json version ${packageJson.version}.`,
  );
}

const changelog = readFileSync("CHANGELOG.md", "utf8");
const sectionPattern = new RegExp(
  `^## \\[${escapeRegExp(version)}\\][^\\n]*\\n([\\s\\S]*?)(?=^## \\[|$(?![\\s\\S]))`,
  "m",
);
const match = changelog.match(sectionPattern);

if (!match) {
  throw new Error(`CHANGELOG.md does not contain a section for ${tagName}.`);
}

const body = match[1]
  .replace(/^\[[^\]]+\]:\s+\S+\s*$/gm, "")
  .trim();

if (!body) {
  throw new Error(`CHANGELOG.md section for ${tagName} is empty.`);
}

const template = existsSync(templatePath)
  ? readFileSync(templatePath, "utf8")
  : "# KeruLabs {{tag}}\n\n{{changelog}}\n";
const renderedBody = template
  .replaceAll("{{tag}}", tagName)
  .replaceAll("{{version}}", version)
  .replace("{{changelog}}", body);

writeFileSync(outputPath, `${renderedBody.trim()}\n`);

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
