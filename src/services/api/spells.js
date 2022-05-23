import axios from "axios";

const SPELLS_REF = "/spells";

export class spellServices {
	constructor() {
    this.HK = axios.create({
      baseURL: process.env.VUE_APP_HK_API_ROOT
    });
  }

  async getSpells(query, pageNumber = 1, pageSize = 15, fields=["ALL"], sortBy = "name", descending=false) {
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
      params += `&${queryParams.join("&")}`;
    }
    
    return this.HK.get(SPELLS_REF + params).then((response) => {
      return response.data;
    }).catch((error) => {
      throw error;
    });
  }

  async getSpell(id) {
    return this.HK.get(`${SPELLS_REF}/${id}`).then((response) => {
      return response.data;
    }).catch((error) => {
      throw error;
    });
  }
}