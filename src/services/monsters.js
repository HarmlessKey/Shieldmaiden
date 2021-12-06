import axios from "axios";
import db from "firebase";

const MONSTERS_REF = "/monsters";

export class monsterServices {
  constructor() {
    this.HK = axios.create({
      baseURL: process.env.VUE_APP_HK_API_ROOT
    });
  }

  async getMonsters(pageNumber = 1, pageSize = 15, query, sortBy = "name") {
    console.log(pageNumber, pageSize, sortBy);
    let params = "";

    if(query) {
      params = [];
      
      if(query.search) {
        params.push(`name=${query.search}`);
      }
      if(query.types && query.types.length) {
        for(const type of query.types) {
          params.push(`type[]=${type}`);
        }
      }

      params = `?${params.join("&")}`;
    }


    return this.HK.get(MONSTERS_REF + params).then((response) => {
      return response.data;
    }).catch((error) => {
      throw error;
    });
  }

  async getMonster(id) {
    console.log("Monster fetched from DB")
    return this.HK.get(`${MONSTERS_REF}/${id}`).then((response) => {
      return response.data;
    }).catch((error) => {
      throw error;
    });
  }

  pushMonster(monster, userId) {
      db.ref(MONSTERS_REF).child(userId).push(monster).then((response) => {
        return response.getKey();
      }).catch((error) => {
      throw error;
    });
  }

  editMonster(monster, id, userId) {
      db.ref(MONSTERS_REF).child(userId).child(id).set(monster).then(() => {
        return "OK";
      }).catch((error) => {
      throw error;
    });
  }
}