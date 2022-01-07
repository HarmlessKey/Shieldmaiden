import { db } from "@/firebase";

const ENCOUNTERS_REF = db.ref("encounters");
const SEARCH_ENCOUNTERS_REF = db.ref("encounters");

export class encounterServices {

  async getEncounters(uid) {
    try {
      const encounters = await ENCOUNTERS_REF.child(uid).once('value', snapshot => {
        return snapshot;
      });
      return encounters.val();
    } catch(error) {
      throw error;
    }
  }

  async getCampaignEncounters(uid, campaignId) {
    try {
      const path = `${uid}/${campaignId}/results`;
      const encounters = await SEARCH_ENCOUNTERS_REF.child(path).once('value', snapshot => {
        return snapshot;
      });
      return encounters.val();
    } catch(error) {
      throw error;
    }
  }

  async getEncounter(uid, id) {
    try {
      const encounter = await ENCOUNTERS_REF.child(uid).child(id).once('value', snapshot => {
        return snapshot;
      });
      return encounter.val();
    } catch(error) {
      throw error;
    }
  }

  async addEncounter(uid, campaignId, encounter) {
    try {
      const path = `${uid}/${campaignId}`;
      const newEncounter = await ENCOUNTERS_REF.child(path).push(encounter);
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

  // Adds a player to the encounter
  async addPlayer(uid, campaignId, encounterId, playerId, player) {
    const path = `${uid}/${campaignId}/${encounterId}/entities/${playerId}`;
    ENCOUNTERS_REF.child(path).set(player).then(() => {
      return;
    }).catch((error) => {
      throw error;
    });
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
    const path = `${uid}/${campaignId}/${encounterId}/entities/${entityId}`;
    ENCOUNTERS_REF.child(path).remove().then(() => {
      return;
    }).catch((error) => {
      throw error;
    });
  }
  
  async deleteEncounter(uid, campaignId, id) {
    try {
      ENCOUNTERS_REF.child(uid).child(campaignId).child(id).remove();
      return;
    } catch(error){
      throw error;
    }
  }
}