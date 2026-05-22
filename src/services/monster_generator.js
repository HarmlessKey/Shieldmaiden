const fetch = require("node-fetch");

class MonsterGenerator {
	static async generateMonster(description) {
		const baseUrl = process.env.MONSTER_GENERATOR_API_URL;
		const url = `${baseUrl}/generate_monster`;
		const headers = {
			"Content-Type": "application/json",
			"x-api-key": process.env.MONSTER_GENERATOR_API_KEY,
		};

		const body = JSON.stringify({
			monster_description: description,
		});

		try {
			const response = await fetch(url, { method: "POST", headers, body });
			return response.json();
		} catch (e) {
			console.error("Error generating monster", e);
			throw e;
		}
	}

	static async parseStatblock(image_base64, mime_type) {
		const baseUrl = process.env.MONSTER_GENERATOR_API_URL;
		const url = `${baseUrl}/parse_statblock`;
		const headers = {
			"Content-Type": "application/json",
			"x-api-key": process.env.MONSTER_GENERATOR_API_KEY,
		};

		const body = JSON.stringify({ image_base64, mime_type });

		try {
			const response = await fetch(url, { method: "POST", headers, body });
			return response.json();
		} catch (e) {
			console.error("Error parsing statblock", e);
			throw e;
		}
	}
}

module.exports = { MonsterGenerator };
