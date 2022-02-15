import axios from "axios";

const CONDITIONS_REF = "/conditions";

export class conditionServices {
  constructor() {
    this.HK = axios.create({
      baseURL: process.env.VUE_APP_HK_API_ROOT
    });
  }

  async getConditions(pageNumber = 1, pageSize = 15, query, fields=["ALL"], sortBy = "name", descending=false) {
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
    
    return this.HK.get(CONDITIONS_REF + params).then((response) => {
      return response.data;
    }).catch((error) => {
      throw error;
    });
  }

  async getCondition(id) {
    console.log(`Condition ${id} fetched from DB`)
    return this.HK.get(`${CONDITIONS_REF}/${id}`).then((response) => {
      return response.data;
    }).catch((error) => {
      throw error;
    });
  }
}