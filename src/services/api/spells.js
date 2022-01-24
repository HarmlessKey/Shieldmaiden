import { db } from "@/firebase";

const SPELLS_REF = db.ref("spells")

export class spellServices {
	
	/**
   * Get an entire spell from 'spells' reference
   * 
   * @param {String} id ID of the requested spell
   * @returns An entire spell from the 'spells' reference
   */
	async getSpell(id) {
    try {
      const spell = await SPELLS_REF.child(id).once('value');
      return spell.val();
    } catch(error) {
      throw error;
    }
  }
}