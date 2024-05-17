import axios from "axios";

const REDIRECT_URI = "http://localhost:8080/link-patreon-account";
const AUTH_REF = "/api/oauth2/token";
const USER_REF = "/api/oauth2/api/current_user";

export class patreonServices {
	constructor() {
		this.PATREON = axios.create({
			baseURL: "https://www.patreon.com",
		});
	}

	async authenticatePatreonUser(code) {
		const params = [
			`code=${code}`,
			"grant_type=authorization_code",
			`client_id=${process.env.VUE_APP_PATREON_CLIENT_ID}`,
			`client_secret=${process.env.VUE_APP_PATREON_CLIENT_SECRET}`,
			`redirect_uri=${REDIRECT_URI}`,
			"scope=email",
		];
		const config = {
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
			},
		};

		return this.PATREON.post(`${AUTH_REF}?${params.join("&")}`, config)
			.then((response) => {
				return response.data;
			})
			.catch((error) => {
				console.error("Something went wrong authentication Patreon user", error.code);
			});
	}

	async getPatreonUser(auth) {
		const params = [];

		const config = {
			headers: {
				Authorization: `Bearer ${auth?.access_token}`,
			},
		};

		return this.PATREON.get(`${USER_REF}?${params.join("&")}`, config)
			.then((response) => {
				return response.data;
			})
			.catch((error) => {
				console.error("Something went wrong fetching Patreon user data", error.code);
			});
	}
}
