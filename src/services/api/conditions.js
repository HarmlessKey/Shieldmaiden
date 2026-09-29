import axios from "axios";

const CONDITIONS_REF = "/conditions";

export class conditionServices {
  constructor() {
    this.HK = axios.create({
      baseURL: process.env.VUE_APP_HK_API_ROOT
    });
  }

  async getConditions(edition, query, pageNumber = 1, pageSize = 15, fields=["ALL"], sortBy = "name", descending=false) {
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

    const ref = edition === "5.5e" ? `${CONDITIONS_REF}/5.5e` : CONDITIONS_REF;

    return this.HK.get(ref + params).then((response) => {
      return response.data;
    }).catch((error) => {
      throw error;
    });
  }

  async getCondition(id, edition) {
    const ref = edition === "5.5e" ? `${CONDITIONS_REF}/5.5e/${id}` : `${CONDITIONS_REF}/${id}`;

    return this.HK.get(ref).then((response) => {
      return response.data;
    }).catch((error) => {
      throw error;
    });
  }
}