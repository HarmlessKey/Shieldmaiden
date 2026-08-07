// Replicates the RTDB writes from src/services/npcs.js (addNpc) and
// src/services/spells.js (addSpell) directly against the client SDK `db`
// instance — this is the actual rules-enforcement boundary the app hits,
// minus the image-upload branch (compendium content has no blob to upload)
// and minus the Vuex-level tier/slot-limit gating (out of scope, see plan
// doc §1/§6).

const { convertNpc, convertSpell } = require("./transform");

/**
 * @param {import('firebase/database').Database} db
 * @param {import('firebase/app').FirebaseNamespace} firebase
 * @param {string} uid
 * @param {object} npc
 * @param {string} predefinedKey used as both the RTDB key and the report's
 *   entity id, so reruns overwrite the same path instead of piling up.
 */
async function saveNpc(db, firebase, uid, npc, predefinedKey) {
	const payload = { ...npc };
	payload.name = payload.name ? payload.name.toLowerCase() : payload.name;
	payload.created = firebase.database.ServerValue.TIMESTAMP;
	payload.updated = firebase.database.ServerValue.TIMESTAMP;

	const searchNpc = convertNpc(payload);

	await db.ref(`npcs/${uid}/${predefinedKey}`).set(payload);
	await db.ref(`search_npcs/${uid}/results/${predefinedKey}`).set(searchNpc);
}

/**
 * @param {import('firebase/database').Database} db
 * @param {import('firebase/app').FirebaseNamespace} firebase
 * @param {string} uid
 * @param {object} spell
 * @param {string} predefinedKey
 */
async function saveSpell(db, firebase, uid, spell, predefinedKey) {
	const payload = { ...spell };
	payload.name = payload.name ? payload.name.toLowerCase() : payload.name;
	payload.created = firebase.database.ServerValue.TIMESTAMP;
	payload.updated = firebase.database.ServerValue.TIMESTAMP;

	const searchSpell = convertSpell(payload);

	await db.ref(`spells/${uid}/${predefinedKey}`).set(payload);
	await db.ref(`search_spells/${uid}/results/${predefinedKey}`).set(searchSpell);
}

module.exports = { saveNpc, saveSpell };
