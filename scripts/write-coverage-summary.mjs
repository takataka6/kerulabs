/* global process */
import fs from "node:fs";
import path from "node:path";

const [, , inputPath = "coverage/coverage-summary.json", outputPath] = process.argv;

const summary = JSON.parse(fs.readFileSync(inputPath, "utf8"));
const total = summary.total;

if (!total) {
  throw new Error(`Missing total coverage summary in ${inputPath}`);
}

const metrics = [
  ["Statements", total.statements],
  ["Branches", total.branches],
  ["Functions", total.functions],
  ["Lines", total.lines],
];

const lines = [
  "## Coverage Summary",
  "",
  "| Metric | Coverage | Covered / Total |",
  "|--------|----------|-----------------|",
  ...metrics.map(
    ([label, metric]) =>
      `| ${label} | ${metric.pct.toFixed(2)}% | ${metric.covered} / ${metric.total} |`,
  ),
  "",
];

const markdown = lines.join("\n");

if (outputPath) {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${markdown}\n`);
}

process.stdout.write(`${markdown}\n`);
