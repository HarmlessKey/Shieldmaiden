import { db } from "@/firebase";

const NPCS_REF = db.ref("npcs");
const SEARCH_NPCS_REF = db.ref("search_npcs");

/**
 * NPC Firebase Service
 * CRUD interface implementation for Firebase
 * Updates both 'npcs' and 'search_npcs' ref on CRUD
 */
export class npcServices {

  /**
   * Get all the npcs from the search_npcs reference
   * 
   * @param {String} uid ID of active user
   * @returns All the content of search_npcs reference
   */
  async getNpcs(uid) {
    try {
      const npcs = await SEARCH_NPCS_REF.child(`${uid}/results`).once('value');
      return npcs.val();
    } catch(error) {
      throw error;
    }
  }

  /**
   * Get the number of NPCs that a user has from the search_npcs reference
   * 
   * @param {String} uid ID of active user
   * @returns Number of npcs of a user
   */
  async getNpcCount(uid) {
    try {
      const path = `${uid}/metadata/count`;
      const count = await SEARCH_NPCS_REF.child(path).once('value');
      return count.val();
    } catch(error) {
      throw error;
    }
  }

  /**
   * Get an entire NPC from npcs reference
   * 
   * @param {String} uid ID of active user
   * @param {String} id ID of the requested NPC
   * @returns An entire NPC from the npcs reference
   */
  async getNpc(uid, id) {
    console.log(`NPC ${id} fetched from database`)
    try {
      const npc = await NPCS_REF.child(uid).child(id).once('value');
      return npc.val();
    } catch(error) {
      throw error;
    }
  }

  /**
   * Adds an NPC to the 'npcs' ref and the 'search_npcs' ref.
   * 
   * @param {String} uid ID of active user
   * @param {Object} npc NPC to add
   * @param {Object} search_npc Compressed NPC
   * @returns Key of the newly added NPC
   */
  async addNpc(uid, npc, search_npc) {
    try {
      npc.name = npc.name.toLowerCase();
      const newNpc = await NPCS_REF.child(uid).push(npc);
      
      // Update search_npcs
      SEARCH_NPCS_REF.child(`${uid}/results/${newNpc.key}`).set(search_npc);

      return newNpc.key;
    } catch(error) {
      throw error;
    }
  }

  /**
   * Updates an existing NPC in both 'npcs' and 'search_npcs' ref
   * 
   * @param {String} uid ID of active user
   * @param {String} id ID of NPC to edit
   * @param {Object} npc Edited NPC
   * @param {Object} search_npc Compressed NPC
   */
  async editNpc(uid, id, npc, search_npc) {
    NPCS_REF.child(uid).child(id).set(npc).then(() => {
      SEARCH_NPCS_REF.child(`${uid}/results/${id}`).set(search_npc);
      return;
    }).catch((error) => {
      throw error;
    });
  }

  /**
   * Updates a specific property in an existing NPC
   * 
   * @param {String} uid ID of active user
   * @param {String} id ID of NPC to edit
   * @param {string} path Path to parent the property that must be updated (Only needed of the value is nested)
   * @param {object} value Object with { proptery: value }
   */
  async updateNpc(uid, id, path, value) {
    path = `${uid}/${id}${path}`
    NPCS_REF.child(path).update(value).then(() => {
      return;
    }).catch((error) => {
      throw error;
    });
  }

  /**
   * Deletes an existing NPC in both 'npcs' and 'search_npcs' ref
   * 
   * @param {String} uid ID of active user
   * @param {String} id ID of NPC to edit
   */
  async deleteNpc(uid, id) {
    try {
      NPCS_REF.child(uid).child(id).remove();

      //Update search_npcs
      SEARCH_NPCS_REF.child(`${uid}/results`).child(id).remove();
      return;
    } catch(error){
      throw error;
    }
  }

  async getFullNpcs(uid) {
    try {
      const all_npcs = await NPCS_REF.child(uid).once('value');
      return all_npcs.val();
    } catch(error) {
      throw error;
    }
  }

  /**
   * Update npc_count in the search table of search_npcs
   * 
   * @param {String} uid User ID
   * @param {Int} diff Difference to add or subtract from npc count
   */
   async updateNpcCount(uid, diff) {
    const npc_count_path = `${uid}/metadata/count`;
    let npc_count = await SEARCH_NPCS_REF.child(npc_count_path).once('value');
    await SEARCH_NPCS_REF.child(npc_count_path).set(npc_count.val() + diff);
    return npc_count.val() + diff;
  }
}