import { db } from "@/firebase";

const NPCS_REF = db.ref("npcs");
const SEARCH_NPCS_REF = db.ref("search_npcs");

export class npcServices {

  async getNpcs(uid) {
    try {
      const npcs = await SEARCH_NPCS_REF.child(`${uid}/results`).once('value', snapshot => {
        return snapshot;
      });
      return npcs.val();
    } catch(error) {
      throw error;
    }
  }

  async getNpcCount(uid) {
    try {
      const path = `${uid}/metadata/count`;
      const count = await SEARCH_NPCS_REF.child(path).once('value', snapshot => {
        return snapshot;
      });
      return count.val();
    } catch(error) {
      throw error;
    }
  }

  async getNpc(uid, id) {
    console.log(`NPC ${id} fetched from database`)
    try {
      const npc = await NPCS_REF.child(uid).child(id).once('value', snapshot => {
        return snapshot;
      });
      return npc.val();
    } catch(error) {
      throw error;
    }
  }

  async addNpc(uid, npc, new_count, search_npc) {
    try {
      npc.name = npc.name.toLowerCase();
      const newNpc = await NPCS_REF.child(uid).push(npc);
      
      // Update search_npcs
      SEARCH_NPCS_REF.child(`${uid}/metadata/count`).set(new_count);
      SEARCH_NPCS_REF.child(`${uid}/results/${newNpc.key}`).set(search_npc);

      return newNpc.key;
    } catch(error) {
      throw error;
    }
  }

  async editNpc(uid, id, npc, search_npc) {
    NPCS_REF.child(uid).child(id).set(npc).then(() => {
      SEARCH_NPCS_REF.child(`${uid}/results/${id}`).set(search_npc);
      return;
    }).catch((error) => {
      throw error;
    });
  }

  async deleteNpc(uid, id, new_count) {
    try {
      NPCS_REF.child(uid).child(id).remove();

      //Update search_npcs
      SEARCH_NPCS_REF.child(`${uid}/metadata/count`).set(new_count);
      SEARCH_NPCS_REF.child(`${uid}/results`).child(id).remove();
      return;
    } catch(error){
      throw error;
    }
  }

  async getAllNpcs(uid) {
    try {
      const all_npcs = await NPCS_REF.child(uid).once('value', (snapshot) => {

        return snapshot;
      })

      return all_npcs.val();

    } catch(error) {
      throw error;
    }
  }
}