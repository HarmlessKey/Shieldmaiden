import axios from "axios";

const REDIRECT_URI = "http://localhost:8080/link-patreon-account";
const AUTH_REF = "/api/oauth2/token";
const IDENTITY_REF = "/api/oauth2/v2/identity";
const CAMPAIGNS_REF = "/api/oauth2/v2/campaigns";

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

	async getPatreonIdentity(auth) {
		const fields = [
			"about",
			"created",
			"email",
			"first_name",
			"full_name",
			"image_url",
			"last_name",
			"thumb_url",
			"url",
		];
		const params = [`${encodeURIComponent("fields[user]")}=${fields.join(",")}`];

		const config = {
			headers: {
				Authorization: `Bearer ${auth?.access_token}`,
			},
		};

		return this.PATREON.get(`${IDENTITY_REF}?${params.join("&")}`, config)
			.then((response) => {
				return response.data?.data;
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

	async getPatreonCampaigns() {
		const params = [
			`${encodeURIComponent(
				"fields[campaign]"
			)}=created_at,creation_name,discord_server_id,image_small_url,image_url,is_charged_immediately,is_monthly,is_nsfw,main_video_embed,main_video_url,one_liner,one_liner,patron_count,pay_per_name,pledge_url,published_at,summary,thanks_embed,thanks_msg,thanks_video_url,has_rss,has_sent_rss_notify,rss_feed_title,rss_artwork_url,patron_count,discord_server_id,google_analytics_id`,
		];

		const config = {
			headers: {
				Authorization: `Bearer `,
			},
		};

		return this.PATREON.get(`${CAMPAIGNS_REF}?${params.join("&")}`, config)
			.then((response) => {
				return response.data?.data;
			})
			.catch((error) => {
				console.error(
					"Something went wrong fetching Patreon campaigns",
					error.code,
					error.response?.status,
					error.response?.statusText
				);
			});
	}
}
