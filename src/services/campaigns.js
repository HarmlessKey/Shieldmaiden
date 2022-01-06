import { db } from "@/firebase";

const CAMPAIGNS_REF = db.ref("campaigns");
const SEARCH_CAMPAIGNS_REF = db.ref("search_campaigns");
const USERS_REF = db.ref("users");

export class campaignServices {

  async getCampaigns(uid) {
    try {
      const campaigns = await SEARCH_CAMPAIGNS_REF.child(`${uid}/results`).once('value', snapshot => {
        return snapshot;
      });
      return campaigns.val();
    } catch(error) {
      throw error;
    }
  }

  async getCampaignCount(uid) {
    try {
      const path = `${uid}/metadata/count`;
      const count = await SEARCH_CAMPAIGNS_REF.child(path).once('value', snapshot => {
        return snapshot;
      });
      return count.val();
    } catch(error) {
      throw error;
    }
  }

  async getCampaign(uid, id) {
    try {
      const campaign = await CAMPAIGNS_REF.child(uid).child(id).once('value', snapshot => {
        return snapshot;
      });
      return campaign.val();
    } catch(error) {
      throw error;
    }
  }

  async setActiveCampaign(uid, id) {
    USERS_REF.child(uid).child("active_campaign").set(id).then(() => {
      return;
    }).catch((error) => {
      throw error;
    });
  }

  async addCampaign(uid, campaign, new_count, search_campaign) {
    try {
      const newCampaign = await CAMPAIGNS_REF.child(uid).push(campaign);

      // Update search_campaigns
      SEARCH_CAMPAIGNS_REF.child(`${uid}/metadata/count`).set(new_count);
      SEARCH_CAMPAIGNS_REF.child(`${uid}/results/${newCampaign.key}`).set(search_campaign);

      return newCampaign.key;
    } catch(error) {
      throw error;
    }
  }

  async editCampaign(uid, id, campaign) {
    CAMPAIGNS_REF.child(uid).child(id).set(campaign).then(() => {
      return;
    }).catch((error) => {
      throw error;
    });
  }

  /**
   * Updates a specific property in an existing campaign
   * 
   * @param {String} uid ID of active user
   * @param {String} id ID of campaign to edit
   * @param {string} path Path to parent the property that must be updated (Only needed of the value is nested)
   * @param {object} value Object with { proptery: value }
   * @param {boolean} update_search Wether or not search_campaigns must be updated
   */
  async updateCampaign(uid, id, path, value, update_search=false) {
    CAMPAIGNS_REF.child(`${uid}/${id}${path}`).update(value).then(() => {
      if(update_search) {
        SEARCH_CAMPAIGNS_REF.child(`${uid}/results/${id}${path}`).update(value);
      }
      return;
    }).catch((error) => {
      throw error;
    });
  }

  async updateSearchCampaign(uid, id, path, value) {
    path = `${uid}/results/${id}${path}`
    SEARCH_CAMPAIGNS_REF.child(path).update(value).then(() => {
      return;
    }).catch((error) => {
      throw error;
    });
  }

  async addPlayer(uid, id, playerId, player) {
    CAMPAIGNS_REF.child(uid).child(id).child(`players/${playerId}`).set(player).then(() => {
      return;
    }).catch((error) => {
      throw error;
    });
  }

  async editPlayer(uid, id, playerId, player) {
    CAMPAIGNS_REF.child(uid).child(id).child(`players/${playerId}`).set(player).then(() => {
      return;
    }).catch((error) => {
      throw error;
    });
  }

  async deletePlayer(uid, id, playerId) {
    CAMPAIGNS_REF.child(uid).child(id).child(`players/${playerId}`).remove().then(() => {
      return;
    }).catch((error) => {
      throw error;
    });
  }
  
  async deleteCompanion(uid, id, companionId) {
    CAMPAIGNS_REF.child(uid).child(id).child(`companions/${companionId}`).remove().then(() => {
      return;
    }).catch((error) => {
      throw error;
    });
  }

  async deleteCampaign(uid, id, new_count) {
    try {
      CAMPAIGNS_REF.child(uid).child(id).remove();

      //Update search_players
      SEARCH_CAMPAIGNS_REF.child(`${uid}/metadata/count`).set(new_count);
      SEARCH_CAMPAIGNS_REF.child(`${uid}/results`).child(id).remove();
      return;
    } catch(error){
      throw error;
    }
  }

  async setShare(uid, id, share) {
    CAMPAIGNS_REF.child(uid).child(id).child("shares").set(share).then(() => {
      return;
    }).catch((error) => {
      throw error;
    });
  }
}