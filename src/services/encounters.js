import { db } from "@/firebase";

const ENCOUNTERS_REF = db.ref("encounters");
const SEARCH_ENCOUNTERS_REF = db.ref("search_encounters");

export class encounterServices {

  async getEncounters(uid) {
    try {
      const encounters = await ENCOUNTERS_REF.child(uid).once('value');
      return encounters.val();
    } catch(error) {
      throw error;
    }
  }

  async getEncounterCount(uid) {
    try {
      const path = `${uid}/metadata`;
      const count = await SEARCH_ENCOUNTERS_REF.child(path).once('value');
      return count.val();
    } catch(error) {
      throw error;
    }
  }

  async getCampaignEncounters(uid, campaignId, finished) {
    try {
      const path = `${uid}/results/${campaignId}`;
      const encounters = await SEARCH_ENCOUNTERS_REF.child(path)
      .orderByChild("finished")
      .equalTo(finished)
      .once('value');
      return encounters.val();
    } catch(error) {
      throw error;
    }
  }

  async getEncounter(uid, campaignId, id) {
    try {
      const path = `${uid}/${campaignId}/${id}`;
      const encounter = await ENCOUNTERS_REF.child(path).once('value', snapshot => {
        return snapshot;
      });
      return encounter.val();
    } catch(error) {
      throw error;
    }
  }

  async addEncounter(uid, campaignId, encounter, new_count, search_encounter) {
    try {
      const newEncounter = await ENCOUNTERS_REF.child(uid).child(campaignId).push(encounter);

      // Update search_encounters
      SEARCH_ENCOUNTERS_REF.child(`${uid}/metadata/${campaignId}/count`).set(new_count);
      SEARCH_ENCOUNTERS_REF.child(`${uid}/results/${campaignId}/${newEncounter.key}`).set(search_encounter);

      return newEncounter.key;
    } catch(error) {
      throw error;
    }
  }

  // Overwrites an encounter with a full new object
  async editEncounter(uid, campaignId, encounterId, value) {
    const path = `${uid}/${campaignId}/${encounterId}`
    ENCOUNTERS_REF.child(path).set(value).then(() => {
      return;
    }).catch((error) => {
      throw error;
    });
  }

  // Updates an encounter
  async updateEncounter(uid, campaignId, encounterId, path, value) {
    path = `${uid}/${campaignId}/${encounterId}${path}`
    ENCOUNTERS_REF.child(path).update(value).then(() => {
      return;
    }).catch((error) => {
      throw error;
    });
  }

  async deleteEncounter(uid, campaignId, id, new_count) {
    try {
      ENCOUNTERS_REF.child(`${uid}/${campaignId}`).child(id).remove();

      //Update search_encounters
      SEARCH_ENCOUNTERS_REF.child(`${uid}/metadata/${campaignId}/count`).set(new_count);
      SEARCH_ENCOUNTERS_REF.child(`${uid}/results/${campaignId}/${id}`).remove();
      return;
    } catch(error){
      throw error;
    }
  }

  async deleteCampaignEncounters(uid, campaignId) {
    try {
      ENCOUNTERS_REF.child(`${uid}`).child(campaignId).remove();

      //Update search_encounters
      SEARCH_ENCOUNTERS_REF.child(`${uid}/metadata/${campaignId}`).remove();
      SEARCH_ENCOUNTERS_REF.child(`${uid}/results/${campaignId}`).remove();
      return;
    } catch(error){
      throw error;
    }
  }

  // Adds a player to the encounter
  async addPlayer(uid, campaignId, encounterId, playerId, player) {
    try {
      const path = `${uid}/${campaignId}/${encounterId}/entities/${playerId}`;
      ENCOUNTERS_REF.child(path).set(player);

      return;
    } catch(err) {
      throw err;
    }
  }

  // Adds an NPC to the encounter
  async addNpc(uid, campaignId, encounterId, npc) {
    try {
      const path = `${uid}/${campaignId}/${encounterId}/entities`;
      const newNpc = await ENCOUNTERS_REF.child(path).push(npc);
      
      return newNpc.key;
    } catch(error) {
      throw error;
    }
  }

  // Deletes and entity from the encounter (either a player or npc)
  async deleteEntity(uid, campaignId, encounterId, entityId) {
    try {
      const path = `${uid}/${campaignId}/${encounterId}/entities/${entityId}`;
      ENCOUNTERS_REF.child(path).remove();

    } catch(err) {
      throw err;
    }
  }

  /**
   * Update entity count in the search table of search_encounters
   * 
   * @param {String} uid User ID
   * @param {String} campaignId Campaing ID
   * @param {String} encounterId Encounter ID
   * @param {Int} diff Difference to add or subtract from entity count
   */
  async updateEntityCount(uid, campaignId, encounterId, diff) {
     // Update entity count in search_table
     const entity_count_path = `${uid}/results/${campaignId}/${encounterId}/entity_count`;
     let entity_count = await SEARCH_ENCOUNTERS_REF.child(entity_count_path).once('value');
     SEARCH_ENCOUNTERS_REF.child(entity_count_path).set(entity_count.val() + diff);
     return entity_count + diff;
  }
}