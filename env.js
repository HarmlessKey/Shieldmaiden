/*
 * Resolves which env file to load. Runs in a Node (non-transpiled) context.
 * Selects .env.emulator when USE_FIREBASE_EMULATOR=true, or as a fallback when
 * the per-environment .env.<NODE_ENV>.local file does not exist (sandbox / worktree case).
 */
const fs = require("fs");
const path = require("path");

module.exports = function resolveEnvFile(baseDir) {
	const local = path.resolve(baseDir, `.env.${process.env.NODE_ENV}.local`);
	if (process.env.USE_FIREBASE_EMULATOR === "true" || !fs.existsSync(local)) {
		return path.resolve(baseDir, ".env.emulator");
	}
	return local;
};
