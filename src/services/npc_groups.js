import { firebase, db } from "src/firebase";

const NPC_GROUPS_REF = db.ref("npc_groups");

/**
 * NPC Groups Firebase Service
 * CRUD interface for NPC group management
 */
export class npcGroupServices {
	/**
	 * Get all NPC groups for a user
	 *
	 * @param {String} uid ID of active user
	 * @returns All NPC groups for the user
	 */
	async getGroups(uid) {
		try {
			const groups = await NPC_GROUPS_REF.child(uid).once("value");
			return groups.val();
		} catch (error) {
			throw error;
		}
	}

	/**
	 * Add a new NPC group
	 *
	 * @param {String} uid ID of active user
	 * @param {Object} group Group object { name }
	 * @returns Key of the newly added group
	 */
	async addGroup(uid, group) {
		try {
			group.name = group.name.toLowerCase();
			group.created = firebase.database.ServerValue.TIMESTAMP;

			const newGroup = await NPC_GROUPS_REF.child(uid).push(group);
			return newGroup.key;
		} catch (error) {
			throw error;
		}
	}

	/**
	 * Update an existing NPC group
	 *
	 * @param {String} uid ID of active user
	 * @param {String} id Group ID
	 * @param {Object} group Updated group object
	 */
	async updateGroup(uid, id, group) {
		try {
			group.name = group.name.toLowerCase();
			await NPC_GROUPS_REF.child(`${uid}/${id}`).update(group);
		} catch (error) {
			throw error;
		}
	}

	/**
	 * Delete an NPC group
	 *
	 * @param {String} uid ID of active user
	 * @param {String} id Group ID
	 */
	async deleteGroup(uid, id) {
		try {
			await NPC_GROUPS_REF.child(`${uid}/${id}`).remove();
		} catch (error) {
			throw error;
		}
	}
}
