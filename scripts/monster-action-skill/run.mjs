// Runs the monster-action-parser benchmark through Claude Code headless (`claude -p`), one call
// per case, then scores the answers with check.mjs.
//
// Every call runs in a temporary workspace that only holds a copy of the skill
// (.claude/skills/monster-action-parser), so the model can read the skill but not the benchmark.
//
// Usage:
//   node scripts/monster-action-skill/run.mjs
//
// Options:
//   --model <id>         model to run (default claude-haiku-5-5)
//   --out <dir>          where the answers go (default benchmark/results/<model>)
//   --only <ids>         comma-separated case ids, or id prefixes (b04,b05)
//   --concurrency <n>    calls at the same time (default 4)
//   --claude <bin>       the Claude Code CLI (default claude)
//   --dry-run            print the prompts instead of calling the model
//
// Writes <out>/<case id>.txt (the raw reply) and <out>/<case id>.json (the JSON in it), then
// <out>/report.json. Exits with check.mjs's code.

import { spawn, spawnSync } from "node:child_process";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "../..");
const SKILL = "monster-action-parser";

const args = process.argv.slice(2);
const argValue = (flag, fallback) => {
	const i = args.indexOf(flag);
	return i >= 0 ? args[i + 1] : fallback;
};
const model = argValue("--model", "claude-haiku-5-5");
const out = resolve(argValue("--out", join(HERE, "benchmark/results", model)));
const only = argValue("--only", "")
	.split(",")
	.map((id) => id.trim())
	.filter(Boolean);
const concurrency = Math.max(1, parseInt(argValue("--concurrency", "4")) || 4);
const claude = argValue("--claude", "claude");
const dryRun = args.includes("--dry-run");

const cases = JSON.parse(readFileSync(join(HERE, "benchmark/cases.json"), "utf8")).filter(
	(c) => !only.length || only.some((id) => c.id.startsWith(id))
);

const prompt = (c) =>
	[
		`Use the ${SKILL} skill to convert this monster ability.`,
		"",
		`Edition: ${c.edition}`,
		`Group: ${c.group}`,
		`Name: ${c.name}`,
		`Description: ${c.desc}`,
	].join("\n");

/**
 * The JSON object in a reply: the last ```json block, or else the outermost braces
 */
function extractJson(text) {
	const blocks = [...text.matchAll(/```json\s*\n([\s\S]*?)```/g)];
	const candidate = blocks.length
		? blocks[blocks.length - 1][1]
		: text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1);
	return JSON.parse(candidate);
}

function ask(c, workspace) {
	return new Promise((resolvePromise) => {
		const child = spawn(claude, ["-p", "--allowedTools", "Skill", "--model", model], { cwd: workspace });
		let stdout = "";
		let stderr = "";
		child.stdout.on("data", (chunk) => (stdout += chunk));
		child.stderr.on("data", (chunk) => (stderr += chunk));
		child.on("error", (error) => resolvePromise({ error: error.message }));
		child.on("close", (code) =>
			resolvePromise(code === 0 ? { stdout } : { error: stderr.trim() || `exit ${code}`, stdout })
		);
		child.stdin.end(prompt(c));
	});
}

if (dryRun) {
	for (const c of cases) console.log(`--- ${c.id}\n${prompt(c)}\n`);
	const command = `${claude} -p --allowedTools Skill --model ${model}`;
	console.log(`${cases.length} cases; would run: ${command} (prompt on stdin)`);
	process.exit(0);
}

mkdirSync(out, { recursive: true });
const workspace = mkdtempSync(join(tmpdir(), "monster-action-skill-"));
cpSync(join(ROOT, ".claude/skills", SKILL), join(workspace, ".claude/skills", SKILL), { recursive: true });
console.log(`Running ${cases.length} cases on ${model} in ${workspace}`);

const queue = [...cases];
async function worker() {
	while (queue.length) {
		const c = queue.shift();
		const started = Date.now();
		const { stdout = "", error } = await ask(c, workspace);
		writeFileSync(join(out, `${c.id}.txt`), stdout);
		rmSync(join(out, `${c.id}.json`), { force: true });
		let note = error ? `error: ${error.split("\n")[0]}` : "";
		if (!error) {
			try {
				writeFileSync(join(out, `${c.id}.json`), JSON.stringify(extractJson(stdout), null, "\t"));
			} catch (parseError) {
				note = `no JSON in the reply (${parseError.message})`;
			}
		}
		console.log(`${c.id} ${((Date.now() - started) / 1000).toFixed(1)}s${note ? ` ${note}` : ""}`);
	}
}
await Promise.all(Array.from({ length: concurrency }, worker));
rmSync(workspace, { recursive: true, force: true });

console.log("");
const checkArgs = [join(HERE, "check.mjs"), "--results", out];
if (only.length) checkArgs.push("--only", only.join(","));
const check = spawnSync(process.execPath, checkArgs, { stdio: "inherit" });
process.exit(check.status ?? 1);
