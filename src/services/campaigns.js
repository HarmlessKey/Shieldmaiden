import { db } from "@/firebase";

const CAMPAIGNS_REF = db.ref("campaigns");
const USERS_REF = db.ref("users");

export class campaignServices {

  async getCampaigns(uid) {
    try {
      const campaigns = await CAMPAIGNS_REF.child(uid).once('value', snapshot => {
        return snapshot;
      });
      return campaigns.val();
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

  async addCampaign(uid, campaign) {
    try {
      const newCampaign = await CAMPAIGNS_REF.child(uid).push(campaign);
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

  async addPlayer(uid, id, playerId, player) {
    CAMPAIGNS_REF.child(uid).child(id).child(`players/${playerId}`).set(player).then(() => {
      return;
    }).catch((error) => {
      throw error;
    });
  }
  

  async deleteCampaign(uid, id) {
    try {
      CAMPAIGNS_REF.child(uid).child(id).remove();
      return;
    } catch(error){
      throw error;
    }
  }
}