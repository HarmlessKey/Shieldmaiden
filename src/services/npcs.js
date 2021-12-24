import { db } from "@/firebase";

const NPCS_REF = db.ref("npcs");

export class npcServices {

  async getNpcs(uid) {
    try {
      const npcs = await NPCS_REF.child(uid).once('value', snapshot => {
        return snapshot;
      });
      return npcs.val();
    } catch(error) {
      throw error;
    }
  }

  async getNpc(uid, id) {
    try {
      const npc = await NPCS_REF.child(uid).child(id).once('value', snapshot => {
        return snapshot;
      });
      return npc.val();
    } catch(error) {
      throw error;
    }
  }

  async addNpc(uid, npc) {
    try {
      const newNpc = await NPCS_REF.child(uid).push(npc);
      return newNpc.key;
    } catch(error) {
      throw error;
    }
  }

  async editNpc(uid, id, npc) {
    NPCS_REF.child(uid).child(id).set(npc).then(() => {
      return;
    }).catch((error) => {
      throw error;
    });
  }

  async deleteNpc(uid, id) {
    try {
      NPCS_REF.child(uid).child(id).remove();
      return;
    } catch(error){
      throw error;
    }
  }
}