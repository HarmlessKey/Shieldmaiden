import axios from "axios";
import { range } from "lodash";

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
		let params = `?skip=${skip}&limit=${pageSize}&fields=${fieldsString}`;

		if (sortBy) {
			params += `&sort=${sortBy}${descending ? ":desc" : ""}`;
		}

		if (query) {
			const queryParams = [];

			if (query.search) {
				queryParams.push(`name=${query.search}`);
			}
			if (query.source) {
				queryParams.push(`source=${query.source}`);
			}
			if (query.types && query.types.length) {
				for (const type of query.types) {
					queryParams.push(`type[]=${type}`);
				}
			}
			if (query.sizes && query.sizes.length) {
				for (const size of query.sizes) {
					queryParams.push(`size[]=${size}`);
				}
			}
			if (query.environments && query.environments.length) {
				for (const environment of query.environments) {
					queryParams.push(`environment[]=${environment}`);
				}
			}
			if (query.alignments && query.alignments.length) {
				for (const alignment of query.alignments) {
					queryParams.push(`alignment[]=${alignment}`);
				}
			}
			if (query.challenge_ratings) {
				let challenge_ratings = range(query.challenge_ratings.min, query.challenge_ratings.max + 1);
				if (query.challenge_ratings.min === 0) {
					challenge_ratings = challenge_ratings.concat([0.125, 0.25, 0.5]);
				}
				for (const cr of challenge_ratings) {
					queryParams.push(`challenge_rating[]=${cr}`);
				}
			}

			params += `&${queryParams.join("&")}`;
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
