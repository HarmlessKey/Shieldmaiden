import axios from "axios";
import { range } from "lodash";

const SPELLS_REF = "/spells";

export class spellServices {
	constructor() {
		this.HK = axios.create({
			baseURL: process.env.VUE_APP_HK_API_ROOT,
		});
	}

	async getSpells(
		query,
		pageNumber = 1,
		pageSize = 15,
		fields = ["ALL"],
		sortBy = "name",
		descending = false
	) {
		const skip = (pageNumber - 1) * pageSize;
		const fieldsString = fields.join(" ");
		let params = `?skip=${skip}&limit=${pageSize}&fields=${encodeURIComponent(fieldsString)}`;

		if (sortBy) {
			params += `&sort=${encodeURIComponent(sortBy)}${descending ? ":desc" : ""}`;
		}

		if (query) {
			const queryParams = [];
			const add = (key, value) => queryParams.push(`${key}=${encodeURIComponent(value)}`);

			if (query.search) {
				add("name", query.search);
			}
			if (query.schools && query.schools.length) {
				for (const school of query.schools) {
					add("school[]", school);
				}
			}
			if (query.classes && query.classes.length) {
				for (const cls of query.classes) {
					add("classes[]", cls);
				}
			}
			if (query.levels) {
				for (const level of range(query.levels.min, query.levels.max + 1)) {
					add("level[]", level);
				}
			}
			if (queryParams.length) {
				params += `&${queryParams.join("&")}`;
			}
		}

		return this.HK.get(SPELLS_REF + params)
			.then((response) => {
				return response.data;
			})
			.catch((error) => {
				throw error;
			});
	}

	async getSpell(id) {
		return this.HK.get(`${SPELLS_REF}/${id}`)
			.then((response) => {
				return response.data;
			})
			.catch((error) => {
				throw error;
			});
	}
}
