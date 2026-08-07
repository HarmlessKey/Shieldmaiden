#!/usr/bin/env node
// Verifies every 5.5e SRD monster/spell from the HK compendium API against
// whatever rules the Firebase emulator is currently loaded with.
//
// Usage:
//   npm run emulators                              # terminal 1
//   npm run verify:5.5e-content                    # terminal 2
//   npm run verify:5.5e-content -- --type=monster --limit=20
//   npm run verify:5.5e-content -- --type=spell --slug=fireball
//
// See .planning/5.5e-content-firebase-verification.md for the full design.

const path = require("path");
const hkApi = require("./hk-api");
const { convertVersatileToOptions } = require("./transform");
const { saveNpc, saveSpell } = require("./save");
const { printSummary, writeJsonReport } = require("./report");
const firebaseClient = require("./firebase-client");

function parseArgs(argv) {
	const args = { type: "all", source: "srd", limit: null, slug: null };
	for (const arg of argv) {
		const [key, value] = arg.replace(/^--/, "").split("=");
		if (key in args) args[key] = value;
	}
	if (args.limit) args.limit = Number(args.limit);
	return args;
}

async function verifyOne(type, saveFn, slug, name, { db, firebase, uid }) {
	let entity;
	try {
		entity = await hkApi.getEntity(type, slug);
	} catch (error) {
		return { type, slug, name, status: "fetch_error", error: error.message, failedProperty: null };
	}

	if (type === "monster") entity = convertVersatileToOptions(entity);

	try {
		await saveFn(db, firebase, uid, entity, slug);
		return { type, slug, name: entity.name || name, status: "pass", error: null, failedProperty: null };
	} catch (error) {
		return {
			type,
			slug,
			name: entity.name || name,
			status: "fail",
			error: error.message,
			failedProperty: null,
		};
	}
}

async function run() {
	const args = parseArgs(process.argv.slice(2));
	const types = args.type === "all" ? ["monster", "spell"] : [args.type];

	console.log("Connecting to the Firebase emulator...");
	let session;
	try {
		session = await firebaseClient.init();
	} catch (error) {
		console.error("\nCouldn't reach the Firebase emulator.");
		console.error("Make sure `npm run emulators` is running in another terminal.\n");
		console.error(error.message);
		process.exit(1);
	}
	console.log(`Signed in as ${session.uid} against the emulator.\n`);

	const results = [];

	for (const type of types) {
		const saveFn = type === "monster" ? saveNpc : saveSpell;

		let targets;
		if (args.slug) {
			targets = [{ slug: args.slug, name: args.slug }];
		} else {
			console.log(`Discovering ${type} slugs (source=${args.source})...`);
			targets = await hkApi.listSlugs(type, args.source);
			if (args.limit) targets = targets.slice(0, args.limit);
			console.log(`Found ${targets.length} ${type}(s) to check.`);
		}

		for (const { slug, name } of targets) {
			process.stdout.write(`  checking ${type} ${slug}... `);
			const result = await verifyOne(type, saveFn, slug, name, session);
			console.log(result.status);
			results.push(result);
		}
	}

	printSummary(results);
	const reportFile = writeJsonReport(results, path.join(__dirname, "results"));
	console.log(`\nFull report written to ${reportFile}`);

	process.exit(results.some((r) => r.status !== "pass") ? 1 : 0);
}

run().catch((error) => {
	console.error("Unexpected error:", error);
	process.exit(1);
});
