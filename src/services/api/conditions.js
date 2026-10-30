import axios from "axios";

// The SRD conditions are served on the API's v2 path, per edition (effects 12)
const CONDITIONS_REF = "/v2/conditions";

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

    const ref = `${CONDITIONS_REF}/${edition === "5.5e" ? "5.5e" : "5e"}`;

    return this.HK.get(ref + params).then((response) => {
      return response.data;
    }).catch((error) => {
      throw error;
    });
  }

  async getCondition(id, edition) {
    const ref = `${CONDITIONS_REF}/${edition === "5.5e" ? "5.5e" : "5e"}/${id}`;

    return this.HK.get(ref).then((response) => {
      return response.data;
    }).catch((error) => {
      throw error;
    });
  }
}
