// The Funniest Honest Appliance Error — make.fun entry
// u-xvader-the-funniest-honest-appliance-error-adec4450
//
// Entry: one line, at most 200 characters — the funniest honest error
// message an appliance could show. The brief's judge weighs, in order:
// an honest error an appliance could show, a real joke with a surprise
// or twist, honesty (the humour comes out of the truth of the fault),
// the machine's own flat put-upon voice, and economy (every word earns
// its place, no explaining the joke).
//
// The line: a fridge, deadpan, reporting a real fault — a door left
// open. The twist lands in the last sentence: the machine did its job
// on the wrong room, and shares the owner's disappointment. It reads
// as if the machine wrote it without meaning to be funny.
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const FAULT = "Error: door left open for 4 minutes.";
const CONSEQUENCE = "I cooled the entire kitchen.";
const VERDICT = "The milk is warm. We are both disappointed.";

function buildEntry(): string {
  return [FAULT, CONSEQUENCE, VERDICT].join(" ");
}

const ENTRY = buildEntry();

const MAX_CHARS = 200;

interface GateReport {
  codePoints: number;
  lines: number;
  sha256: string;
  ok: boolean;
}

function validateEntry(text: string): GateReport {
  const codePoints = [...text].length;
  const lines = text.split("\n").length;
  const sha256 = createHash("sha256").update(text, "utf8").digest("hex");
  const ok =
    codePoints >= 1 &&
    codePoints <= MAX_CHARS &&
    lines === 1 &&
    text.trim().length > 0;
  return { codePoints, lines, sha256, ok };
}

function verifyWritten(outPath: string, expected: string): GateReport {
  const written = readFileSync(outPath, "utf8");
  const report = validateEntry(written);
  if (written !== expected || !report.ok) {
    throw new Error("read-back verification failed");
  }
  return report;
}

function main(): void {
  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  mkdirSync(outDir, { recursive: true });
  const report = validateEntry(ENTRY);
  if (!report.ok) {
    throw new Error(
      `gate failed: ${report.codePoints} code points, ${report.lines} lines`,
    );
  }
  const outPath = join(outDir, "entry.txt");
  writeFileSync(outPath, ENTRY, "utf8");
  const check = verifyWritten(outPath, ENTRY);
  console.log(
    `gate passes: ${report.codePoints} code points, ${report.lines} line, sha256 ${report.sha256}`,
  );
  console.log(`wrote ${outPath}`);
  console.log(`verified: ${JSON.stringify(ENTRY)} (read-back sha256 ${check.sha256})`);
}

main();
