import axios from "axios";

const REDIRECT_URI = "http://localhost:8080/link-patreon-account";
const AUTH_REF = "/api/oauth2/token";
const USER_REF = "/api/oauth2/api/current_user";
const IDENTITY_REF = "/api/oauth2/v2/identity";

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
			`scope=${encodeURIComponent("identity[email]")}`,
		];
		const config = {
			headers: {
				"Access-Control-Allow-Origin": "http://localhost:8080",
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
		const config = {
			headers: {
				Authorization: `Bearer ${auth?.access_token}`,
			},
		};

		return this.PATREON.get(USER_REF, config)
			.then((response) => {
				return response.data;
			})
			.catch((error) => {
				console.error(
					"Something went wrong fetching Patreon user data",
					error.code,
					error.response?.status,
					error.response?.statusText
				);
			});
	}

	async getPatreonIdentity(auth) {
		const params = [
			`${encodeURIComponent(
				"fields[user]"
			)}=about,created,email,first_name,full_name,image_url,last_name,thumb_url,url`,
			"include=memberships",
		];

		const config = {
			headers: {
				Authorization: `Bearer ${auth?.access_token}`,
			},
		};

		return this.PATREON.get(`${IDENTITY_REF}?${params.join("&")}`, config)
			.then((response) => {
				return response.data;
			})
			.catch((error) => {
				console.error(
					"Something went wrong fetching Patreon identity data",
					error.code,
					error.response?.status,
					error.response?.statusText
				);
			});
	}
}
