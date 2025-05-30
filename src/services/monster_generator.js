class MonsterGenerator {
	static async generateMonster(description) {
		const baseUrl = process.env.MONSTER_GENERATOR_API_URL;
		const url = `${baseUrl}/generate_monster`;
		const method = "POST";
		const headers = {
			"Content-Type": "application/json",
			"x-api-key": process.env.MONSTER_GENERATOR_API_KEY,
		};

		const body = JSON.stringify({
			monster_description: description,
		});

		try {
			const monster = await fetch(url, {
				method: method,
				headers: headers,
				body: body,
			});
			return monster.json();
		} catch (e) {
			console.error("Error generating monster", e);
			throw e;
		}
	}
}

module.exports = { MonsterGenerator };
