import { db } from "@/firebase";

const PLAYERS_REF = db.ref("players");
const SEARCH_PLAYERS_REF = db.ref("search_players");
const CHARACTER_CONTROL_REF = db.ref("character_control");

export class playerServices {

  async getPlayers(uid) {
    try {
      const players = await SEARCH_PLAYERS_REF.child(`${uid}/results`).once('value', snapshot => {
        return snapshot;
      });
      return players.val();
    } catch(error) {
      throw error;
    }
  }

  async getPlayerCount(uid) {
    try {
      const path = `${uid}/metadata/count`;
      const count = await SEARCH_PLAYERS_REF.child(path).once('value', snapshot => {
        return snapshot;
      });
      return count.val();
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

  async getPlayerProp(uid, id, property) {
    const path = `${uid}/${id}/${property}`;
    try {
      const value = await PLAYERS_REF.child(path).once('value', snapshot => {
        return snapshot;
      });
      return value.val();
    } catch(error) {
      throw error;
    }
  }

  async addPlayer(uid, player, new_count, search_player) {
    try {
      const newPlayer = await PLAYERS_REF.child(uid).push(player);

      // Update search_players
      SEARCH_PLAYERS_REF.child(`${uid}/metadata/count`).set(new_count);
      SEARCH_PLAYERS_REF.child(`${uid}/results/${newPlayer.key}`).set(search_player);

      return newPlayer.key;
    } catch(error) {
      throw error;
    }
  }

  async editPlayer(uid, id, player, search_player) {
    PLAYERS_REF.child(uid).child(id).set(player).then(() => {
      SEARCH_PLAYERS_REF.child(`${uid}/results/${id}`).set(search_player);
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

  async deletePlayer(uid, id, control, new_count) {
    try {
      PLAYERS_REF.child(uid).child(id).remove();

      // Remove from controlled characters
      if(control) {
        CHARACTER_CONTROL_REF.child(control).child(id).remove();
      }

      //Update search_players
      SEARCH_PLAYERS_REF.child(`${uid}/metadata/count`).set(new_count);
      SEARCH_PLAYERS_REF.child(`${uid}/results`).child(id).remove();
      return;
    } catch(error){
      throw error;
    }
  }
}