/*
 * Resolves which env file to load. Runs in a Node (non-transpiled) context.
 *
 * The emulator env file (.env.emulator) is ONLY ever selected in a development
 * context, so it can never leak into a production build/deploy:
 *   1. Explicit opt-in:  USE_FIREBASE_EMULATOR=true  (e.g. `npm run ssr:emulator`)
 *   2. Dev convenience:  NODE_ENV=development AND no .env.development.local exists
 *                        (fresh sandbox / git worktree with no local env file)
 *
 * In any other case (notably NODE_ENV=production during `quasar build`) this
 * returns the normal .env.<NODE_ENV>.local path — identical to the original
 * behaviour — even if that file happens to be missing. A production build will
 * never silently fall back to the emulator/demo config.
 */
const fs = require("fs");
const path = require("path");

module.exports = function resolveEnvFile(baseDir) {
	const local = path.resolve(baseDir, `.env.${process.env.NODE_ENV}.local`);

	const explicitOptIn = process.env.USE_FIREBASE_EMULATOR === "true";
	const devFallback = process.env.NODE_ENV === "development" && !fs.existsSync(local);

	if (explicitOptIn || devFallback) {
		return path.resolve(baseDir, ".env.emulator");
	}
	return local;
};
