/*
 * First setupFile — runs before any test module (and therefore before
 * `src/firebase` is imported and wires up `useEmulator`).
 *
 * Loads the emulator env file so the Firebase client SDK initialises with the
 * demo project config and the VUE_APP_USE_FIREBASE_EMULATOR flag is set.
 * dotenv does not override variables already present in process.env, so the
 * test NODE_ENV is preserved (the .env.emulator NODE_ENV=development is ignored).
 */
const path = require("path");

require("dotenv").config({
	path: path.resolve(__dirname, "../../.env.emulator"),
});

// Guarantee the emulator flag is on even if the env file is missing.
process.env.VUE_APP_USE_FIREBASE_EMULATOR = "true";
process.env.NODE_ENV = "test";
