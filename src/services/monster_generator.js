


class MonsterGenerator {


    static async generateMonster(description) {
        const url = "localhost:8000/generate_monster"
        const method = "POST"
        const headers = {
            "Content-Type": "application/json",
        }

        const body = JSON.stringify({
            monster_description: description,
        })

        return await fetch(url, {
            method: method,
            headers: headers,
            body: body,
        })
    }
}