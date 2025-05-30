export class ShieldmaidenAiAPI {
	constructor() {
		this.baseUrl = process.env.MONSTER_GENERATOR_API_URL;
	}

	async request(endpoint, method = "GET", data = null) {
		const options = {
			method,
			headers: {
				"Content-Type": "application/json",
				"x-api-key": process.env.MONSTER_GENERATOR_API_KEY,
			},
		};

		if (data) {
			options.body = JSON.stringify(data);
		}

		const response = await fetch(`${this.baseUrl}${endpoint}`, options);

		if (!response.ok) {
			const errorText = await response.text();
			throw new Error(`${method} ${endpoint} failed: ${response.status} ${errorText}`);
		}

		return response.json();
	}

	get(endpoint) {
		return this.request(endpoint, "GET");
	}

	post(endpoint, data) {
		return this.request(endpoint, "POST", data);
	}
}
