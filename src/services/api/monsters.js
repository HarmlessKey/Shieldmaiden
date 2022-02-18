import axios from "axios";

const MONSTERS_REF = "/monsters";

export class monsterServices {
  constructor() {
    this.HK = axios.create({
      baseURL: process.env.VUE_APP_HK_API_ROOT
    });
  }

  async getMonsters(pageNumber = 1, pageSize = 15, query, fields=["ALL"], sortBy = "name", descending=false) {
    const skip = (pageNumber - 1)*pageSize;
    const fieldsString = fields.join(" ");
    let params = `?skip=${skip}&limit=${pageSize}&fields=${fieldsString}`;

    if(sortBy) {
      params += `&sort=${sortBy}${descending ? ":desc" : ""}`;
    }
    
    if(query) {
      const queryParams = [];
      
      if(query.search) {
        queryParams.push(`name=${query.search}`);
      }
      if(query.types && query.types.length) {
        for(const type of query.types) {
          queryParams.push(`type[]=${type}`);
        }
      }
      if(query.challenge_ratings && query.challenge_ratings.length) {
        for(const cr of query.challenge_ratings) {
          queryParams.push(`challenge_rating[]=${cr}`);
        }
      }

      params += `&${queryParams.join("&")}`;
    }
    
    return this.HK.get(MONSTERS_REF + params).then((response) => {
      return response.data;
    }).catch((error) => {
      throw error;
    });
  }

  async getMonster(id) {
    console.log(`Monster ${id} fetched from DB`)
    return this.HK.get(`${MONSTERS_REF}/${id}`).then((response) => {
      return response.data;
    }).catch((error) => {
      throw error;
    });
  }
}