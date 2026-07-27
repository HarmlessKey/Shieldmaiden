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
			// The API expects multi-value filters as a repeated plain key
			// (school=evocation&school=necromancy), not the bracket form (school[]=evocation).
			const addAll = (key, values) => {
				for (const value of values) {
					add(key, value);
				}
			};

			if (query.search) {
				add("name", query.search);
			}
			if (query.schools && query.schools.length) {
				addAll("school", query.schools);
			}
			if (query.classes && query.classes.length) {
				addAll("classes", query.classes);
			}
			if (query.levels) {
				addAll("level", range(query.levels.min, query.levels.max + 1));
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
