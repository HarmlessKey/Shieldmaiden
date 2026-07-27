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
			// The API expects multi-value filters as a repeated plain key
			// (type=Beast&type=Dragon), not the bracket form (type[]=Beast).
			const addAll = (key, values) => {
				for (const value of values) {
					add(key, value);
				}
			};

			if (query.search) {
				add("name", query.search);
			}
			if (query.source) {
				add("source", query.source);
			}
			if (query.types && query.types.length) {
				addAll("type", query.types);
			}
			if (query.sizes && query.sizes.length) {
				addAll("size", query.sizes);
			}
			if (query.environments && query.environments.length) {
				addAll("environment", query.environments);
			}
			if (query.alignments && query.alignments.length) {
				addAll("alignment", query.alignments);
			}
			if (query.challenge_ratings) {
				// CRs are not evenly spaced (0, 1/8, 1/4, 1/2, 1, 2, …), so the range has to be
				// sliced out of the CR list. Counting up from min in steps of 1 produces values
				// like 1.125 that match no monster at all.
				const { min, max } = query.challenge_ratings;
				addAll(
					"challenge_rating",
					challenge_ratings.filter((rating) => rating >= min && rating <= max)
				);
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
