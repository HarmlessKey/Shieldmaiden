import { db } from "@/firebase";

const NPCS_REF = db.ref("npcs");
const SEARCH_NPCS_REF = db.ref("search_npcs");

// Converts a full npc to a search_npc
const convert_npc = (npc) => {
	const properties = [
		"name",
		"challenge_rating",
		"armor_class",
		"hit_points",
		"size",
		"type"
	];
  const returnNpc = {};
	
	for(const prop of properties) {
		returnNpc[prop] = (prop === "name") ? npc[prop].toLowerCase() : npc[prop];
	}

	return returnNpc;
}

export class npcServices {

  async getNpcs(uid, start, pageSize, query, sortBy, descending) {
    let call = SEARCH_NPCS_REF.child(`${uid}/results`).orderByChild(sortBy);

    if(query) {
      call = call.startAt(query.toLowerCase()).endAt(query.toLowerCase()+"\uf8ff");
    } else {
      if(descending) {
        call = (start) 
        ? call.endBefore(start).limitToLast(pageSize)
        : call.limitToLast(pageSize);
      } else {
        call = call.startAfter(start).limitToFirst(pageSize);
      }
    }

    try {
      const npcs = await call.once('value', snapshot => {
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
    try {
      const npc = await NPCS_REF.child(uid).child(id).once('value', snapshot => {
        return snapshot;
      });
      return npc.val();
    } catch(error) {
      throw error;
    }
  }

  async addNpc(uid, npc, new_count) {
    try {
      npc.name = npc.name.toLowerCase();
      const newNpc = await NPCS_REF.child(uid).push(npc);
      
      //Update search_npcs
      const search_npc = convert_npc(npc);
      SEARCH_NPCS_REF.child(`${uid}/metadata/count`).set(new_count);
      SEARCH_NPCS_REF.child(`${uid}/results/${newNpc.key}`).set(search_npc);

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
}