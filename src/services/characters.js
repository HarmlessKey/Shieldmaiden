import { db } from "src/firebase";

const CHARACTERS_REF = db.ref("characters");
const SEARCH_CHARACTERS_REF = db.ref("search_characters");

export class CharacterServices {

  async getCharacters(uid) {
    try {
      const characters = await SEARCH_CHARACTERS_REF.child(`${uid}/results`).once('value');
      return characters.val();
    } catch(error) {
      throw error;
    }
  }

  async getCharacterCount(uid) {
    try {
      const path = `${uid}/metadata/count`;
      const count = await SEARCH_CHARACTERS_REF.child(path).once('value');
      return count.val();
    } catch(error) {
      throw error;
    }
  }

  async getCharacter(uid, id) {
    try {
      const character = await CHARACTERS_REF.child(uid).child(id).once('value');
      return character.val();
    } catch(error) {
      throw error;
    }
  }

  async getSearchCharacter(uid, id) {
    try {
      const search_character = await SEARCH_CHARACTERS_REF.child(`${uid}/results/${id}`).once('value');
      return search_character.val();
    } catch(error) {
      throw error;
    }
  }

  async addCharacter(uid, character, search_character) {
    try {
      const newCharacter = await CHARACTERS_REF.child(uid).push(character);

      // Update search_characters
      SEARCH_CHARACTERS_REF.child(`${uid}/results/${newCharacter.key}`).set(search_character);

      return newCharacter.key;
    } catch(error) {
      throw error;
    }
  }

  /**
   * Updates an existing character
   */
  async updateCharacter(uid, id, character, search_character) {
    CHARACTERS_REF.child(`${uid}/${id}`).update(character).then(() => {
      SEARCH_CHARACTERS_REF.child(`${uid}/results/${id}`).update(search_character);
    }).catch((error) => {
      throw error;
    });
  }

  async deleteCharacter(uid, id) {
    try {
      CHARACTERS_REF.child(uid).child(id).remove();

      //Update search_characters
      SEARCH_CHARACTERS_REF.child(`${uid}/results`).child(id).remove();
      return;
    } catch(error){
      throw error;
    }
  }

  /**
   * Update character_count in the search table of search_characters
   * 
   * @param {String} uid User ID
   * @param {Int} diff Difference to add or subtract from character count
   */
   async updateCharacterCount(uid, diff) {
     const character_count_path = `${uid}/metadata/count`;
     let character_count = await this.getCharacterCount(uid);
     await SEARCH_CHARACTERS_REF.child(character_count_path).set(character_count + diff);
    return character_count + diff;
  }
}