import axios from "axios";

const ITEMS_REF = "/items";

export class itemServices {
	constructor() {
		this.HK = axios.create({
			baseURL: process.env.VUE_APP_HK_API_ROOT,
		});
	}

	async getItems(
		edition,
		query,
		pageNumber = 1,
		pageSize = 15,
		fields = ["ALL"],
		sortBy = "name",
		descending = false
	) {
		const skip = (pageNumber - 1) * pageSize;
		const fieldsString = fields.join(" ");
		let params = `?skip=${skip}&limit=${pageSize}&fields=${fieldsString}`;

		if (sortBy) {
			params += `&sort=${sortBy}${descending ? ":desc" : ""}`;
		}

		if (query) {
			const queryParams = [];

			if (query.search) {
				queryParams.push(`name=${query.search}`);
			}

			params += `&${queryParams.join("&")}`;
		}

		const ref = edition === "5.5e" ? `${ITEMS_REF}/5.5e` : ITEMS_REF;

		return this.HK.get(ref + params)
			.then((response) => {
				return response.data;
			})
			.catch((error) => {
				throw error;
			});
	}

	async getItem(id, edition) {
		const ref = edition === "5.5e" ? `${ITEMS_REF}/5.5e/${id}` : `${ITEMS_REF}/${id}`;

		return this.HK.get(ref)
			.then((response) => {
				return response.data;
			})
			.catch((error) => {
				throw error;
			});
	}
}
