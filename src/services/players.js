import { db } from "@/firebase";

const PLAYERS_REF = db.ref("players");
const SEARCH_PLAYERS_REF = db.ref("search_players");
const CHARACTER_CONTROL_REF = db.ref("character_control");

export class playerServices {

  async getPlayers(uid) {
    try {
      const players = await SEARCH_PLAYERS_REF.child(uid).once('value', snapshot => {
        return snapshot;
      });
      return players.val();
    } catch(error) {
      throw error;
    }
  }

  async getPlayer(uid, id) {
    console.log(`Player ${id} fetched from database`);
    try {
      const player = await PLAYERS_REF.child(uid).child(id).once('value', snapshot => {
        return snapshot;
      });
      return player.val();
    } catch(error) {
      throw error;
    }
  }

  // Fetches the UID of the owner of a player
  async getOwner(uid, playerId) {
    try {
      const userId = await CHARACTER_CONTROL_REF.child(uid).child(playerId).once('value', snapshot => {
        return snapshot;
      });
      return userId.val();
    } catch(error) {
      throw error;
    }
  }

  async addPlayer(uid, player) {
    try {
      const newPlayer = await PLAYERS_REF.child(uid).push(player);
      return newPlayer.key;
    } catch(error) {
      throw error;
    }
  }

  async editPlayer(uid, id, player) {
    PLAYERS_REF.child(uid).child(id).set(player).then(() => {
      return;
    }).catch((error) => {
      throw error;
    });
  }

  // Updates a player
  async updatePlayer(uid, id, path, value) {
    path = `${uid}/${id}${path}`
    PLAYERS_REF.child(path).update(value).then(() => {
      return;
    }).catch((error) => {
      throw error;
    });
  }

  async deletePlayer(uid, id) {
    try {
      PLAYERS_REF.child(uid).child(id).remove();
      return;
    } catch(error){
      throw error;
    }
  }
}