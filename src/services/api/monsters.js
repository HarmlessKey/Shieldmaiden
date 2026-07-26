import axios from "axios";
import { challenge_ratings } from "src/utils/generalConstants";

const MONSTERS_REF = "/monsters";

export class monsterServices {
	constructor() {
		this.HK = axios.create({
			baseURL: process.env.VUE_APP_HK_API_ROOT,
		});
	}

	async getMonsters(
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
			if (query.source) {
				add("source", query.source);
			}
			if (query.types && query.types.length) {
				for (const type of query.types) {
					add("type[]", type);
				}
			}
			if (query.sizes && query.sizes.length) {
				for (const size of query.sizes) {
					add("size[]", size);
				}
			}
			if (query.environments && query.environments.length) {
				for (const environment of query.environments) {
					add("environment[]", environment);
				}
			}
			if (query.alignments && query.alignments.length) {
				for (const alignment of query.alignments) {
					add("alignment[]", alignment);
				}
			}
			if (query.challenge_ratings) {
				// CRs are not evenly spaced (0, 1/8, 1/4, 1/2, 1, 2, …), so the range has to be
				// sliced out of the CR list. Counting up from min in steps of 1 produces values
				// like 1.125 that match no monster at all.
				const { min, max } = query.challenge_ratings;
				const selected = challenge_ratings.filter((rating) => rating >= min && rating <= max);
				for (const cr of selected) {
					add("challenge_rating[]", cr);
				}
			}

			if (queryParams.length) {
				params += `&${queryParams.join("&")}`;
			}
		}

		return this.HK.get(MONSTERS_REF + params)
			.then((response) => {
				return response.data;
			})
			.catch((error) => {
				throw error;
			});
	}

	async getMonster(id) {
		return this.HK.get(`${MONSTERS_REF}/${id}`)
			.then((response) => {
				return response.data;
			})
			.catch((error) => {
				throw error;
			});
	}
}
