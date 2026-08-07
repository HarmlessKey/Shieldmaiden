const fs = require("fs");
const path = require("path");

/**
 * @typedef {object} Result
 * @property {"monster"|"spell"} type
 * @property {string} slug
 * @property {string} name
 * @property {"pass"|"fail"|"fetch_error"} status
 * @property {string|null} error raw error message (Firebase or HTTP)
 * @property {string|null} failedProperty extension point — not populated yet,
 *   see plan doc §5 ("Per-property isolation")
 */

function printSummary(results) {
	const byType = { monster: [], spell: [] };
	for (const r of results) byType[r.type].push(r);

	for (const type of ["monster", "spell"]) {
		const items = byType[type];
		if (items.length === 0) continue;

		const pass = items.filter((r) => r.status === "pass").length;
		const fail = items.filter((r) => r.status === "fail").length;
		const fetchError = items.filter((r) => r.status === "fetch_error").length;

		console.log(`\n${"=".repeat(60)}`);
		console.log(`${type.toUpperCase()}S — ${items.length} checked`);
		console.log(`  pass: ${pass}   fail: ${fail}   fetch errors: ${fetchError}`);
		console.log("=".repeat(60));

		const failures = items.filter((r) => r.status !== "pass");
		if (failures.length === 0) {
			console.log("  (no failures)");
			continue;
		}

		for (const r of failures) {
			console.log(`\n  [${r.status.toUpperCase()}] ${r.name || "(unknown name)"} (${r.slug})`);
			if (r.failedProperty) console.log(`    suspected property: ${r.failedProperty}`);
			if (r.error) console.log(`    error: ${r.error}`);
		}
	}

	const total = results.length;
	const totalPass = results.filter((r) => r.status === "pass").length;
	console.log(`\n${"=".repeat(60)}`);
	console.log(`TOTAL: ${totalPass}/${total} passed`);
	console.log("=".repeat(60));
}

function writeJsonReport(results, outDir) {
	fs.mkdirSync(outDir, { recursive: true });
	const file = path.join(outDir, `${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
	fs.writeFileSync(file, JSON.stringify(results, null, 2));
	return file;
}

module.exports = { printSummary, writeJsonReport };
