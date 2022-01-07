import { db } from "@/firebase";

const ITEMS_REF = db.ref("custom_items")
const SEARCH_ITEMS_REF = db.ref("search_custom_items")

/**
 * Item Firebase Service
 * CRUD interface implementation for Firebase
 * Updates both 'custom_items' and 'search_custom_items' ref on CRUD
 * 
 * ToDo: change name of custom_items to items 
 */
export class itemServices {
	
	/**
   * Get all the items from the search_custom_items reference
   * 
   * @param {String} uid ID of active user
   * @returns All the content of search_custom_items reference
   */
	async getItems(uid) {
		try {
			const items = await SEARCH_ITEMS_REF.child(`${uid}/results`).once('value', snapshot => {
				return snapshot;
			});
			return items.val();
		} catch(error) {
			throw error;
		}
	}

	/**
   * Get the number of items that a user has from the search_custom_items reference
   * 
   * @param {String} uid ID of active user
   * @returns Number of items of a user
   */
	async getItemCount(uid) {
    try {
      const path = `${uid}/metadata/count`;
      let count = await SEARCH_ITEMS_REF.child(path).once('value');
      return count.val();
    } catch(error) {
      throw error;
    }
  }
	
	/**
   * Get an entire item from 'custom_items' reference
   * 
   * @param {String} uid ID of active user
   * @param {String} id ID of the requested item
   * @returns An entire item from the 'custom_items' reference
   */
	async getItem(uid, id) {
    console.log(`Item ${id} fetched from database`)
    try {
      const item = await ITEMS_REF.child(uid).child(id).once('value', snapshot => {
        return snapshot;
      });
      return item.val();
    } catch(error) {
      throw error;
    }
  }

	/**
   * Adds an item to the 'custom_items' ref and the 'search_custom_items' ref.
   * Also updates the count metadata in 'search_custom_items'
   * 
   * @param {String} uid ID of active user
   * @param {Object} item Item to add
   * @param {Int} new_count Updated number of items
   * @param {Object} search_item Compressed item
   * @returns Key of the newly added item
   */
	async addItem(uid, item, new_count, search_item) {
    try {
      item.name = item.name.toLowerCase();
      const newItem = await ITEMS_REF.child(uid).push(item);
      
      //Update search_custom_items
      SEARCH_ITEMS_REF.child(`${uid}/metadata/count`).set(new_count);
      SEARCH_ITEMS_REF.child(`${uid}/results/${newItem.key}`).set(search_item);

      return newItem.key;
    } catch(error) {
      throw error;
    }
  }

	/**
   * Updates an existing item in both 'custom_items' and 'search_custom_items' ref
   * 
   * @param {String} uid ID of active user
   * @param {String} id ID of item to edit
   * @param {Object} item Edited item
   * @param {Object} search_item Compressed item
   */
	async editItem(uid, id, item, search_item) {
    ITEMS_REF.child(uid).child(id).set(item).then(() => {
      SEARCH_ITEMS_REF.child(`${uid}/results/${id}`).set(search_item);
      return;
    }).catch((error) => {
      throw error;
    });
  }

	/**
   * Deletes an existing item in both 'custom_items' and 'search_custom_items' ref
   * 
   * @param {String} uid ID of active user
   * @param {String} id ID of item to edit
   * @param {Int} new_count Updated number of items
   */
  async deleteItem(uid, id, new_count) {
    try {
      ITEMS_REF.child(uid).child(id).remove();

      //Update search_custom_items
      SEARCH_ITEMS_REF.child(`${uid}/metadata/count`).set(new_count);
      SEARCH_ITEMS_REF.child(`${uid}/results`).child(id).remove();
      return;
    } catch(error){
      throw error;
    }
  }
}