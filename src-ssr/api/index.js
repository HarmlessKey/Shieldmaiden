const { Router } = require("express");
const { patreonServices } = require("../../src/services/patreon");
const { MonsterGenerator } = require("../../src/services/monster_generator");
const admin = require("firebase-admin");
const serviceAccount = require("../../firebaseServiceAccountKey.json");
process.env.GOOGLE_CLOUD_PROJECT = serviceAccount.project_id;
if (!admin.apps.length) {
	try {
		admin.initializeApp({
			credential: admin.credential.cert(serviceAccount),
			databaseURL: process.env.VUE_APP_FIREBASE_DATABASE_URL,
		});
	} catch (e) {
		console.error(e);
	}
}

const router = new Router();

router.post("/patreon/auth", async (req, res) => {
	const service = new patreonServices();
	const result = await service.authenticatePatreonUser(req.body.code, req.headers.origin);
	res.json(result);
});

router.post("/patreon/identity", async (req, res) => {
	const service = new patreonServices();
	const result = await service.getPatreonIdentity(req.body);
	res.send(result);
});

router.post("/ai/generate-monster", async (req, res) => {
	if (!req.headers.authorization || !req.headers.authorization.startsWith("Bearer ")) {
		return res.status(401).json({ error: "Unauthorized" });
	}
	const idToken = req.headers.authorization.split("Bearer ")[1];
	console.log(process.env.VUE_APP_FIREBASE_DATABASE_URL);

	if (!idToken) {
		return res.status(401).json({ error: "No token provided" });
	}

	try {
		const decodedToken = await admin.auth().verifyIdToken(idToken);
		const uid = decodedToken.uid;

		// Fetch user credits
		const spentRef = admin.database().ref(`users/${uid}/subscription_ai_credits_spent`);
		const creditsRef = admin.database().ref(`users/${uid}/ai_credits`);
		const snapshotSpent = await spentRef.once("value");
		const snapshotCredits = await creditsRef.once("value");
		const spent = snapshotSpent.val() || 0;
		const credits = snapshotCredits.val() || 0;

		// // Cancel when the client has insufficient credits
		if (spent >= req.body.subscription && !credits) {
			return res
				.status(403)
				.json({ error: "Insufficient credits", error_code: "INSUFFICIENT_CREDITS" });
		}

		// Generate the monster
		const result = await MonsterGenerator.generateMonster(req.body.description);

		// First spent subscription credits if available, then spent purchased credits
		if (req.body.subscription > spent) {
			await spentRef.set(spent + 1);
		} else {
			await creditsRef.set(credits - 1);
		}

		res.json(result);
	} catch (error) {
		console.error("Error generating monster:", error);
		res.status(500).json({ error: "Internal Server Error" });
	}
});

module.exports = router;
