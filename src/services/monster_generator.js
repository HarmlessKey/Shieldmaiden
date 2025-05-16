class MonsterGenerator {
	static async generateMonster(description) {
		console.log("description", description);
		const url = "http://localhost:8000/api/generate_monster";
		const method = "POST";
		const headers = {
			"Content-Type": "application/json",
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
			console.log("Monster generated:", monster);
			return monster.json();
		} catch (e) {
			console.error("Error generating monster", e);
		}
	}
}

module.exports = { MonsterGenerator };
