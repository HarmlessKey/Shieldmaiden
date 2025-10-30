import { Router } from "express";
import { patreonServices } from "../../src/services/patreon.js";
import { MonsterGenerator } from "../../src/services/monster_generator.js";
import { SubscriptionServices } from "../../src/services/subscription.js";

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import admin from "firebase-admin";

const serviceAccountFilePath = path.resolve(process.cwd(), "firebaseServiceAccountKey.json");
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountFilePath, "utf8"));


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

	try {
		const decodedToken = await admin.auth().verifyIdToken(idToken);
		const uid = decodedToken.uid;

		// Fetch user credits
		const tiersRef = admin.database().ref("tiers");
		const userRef = admin.database().ref(`users/${uid}`);
		const spentRef = admin.database().ref(`users/${uid}/subscription_ai_credits_spent`);
		const creditsRef = admin.database().ref(`users/${uid}/ai_credits`);

		const snapshotTiers = await tiersRef.once("value");
		const snapshotUser = await userRef.once("value");
		const tiers = snapshotTiers.val();
		const user = snapshotUser.val();

		if (!user) {
			return res.status(401).json({ error: "User not found" });
		}

		const patronsRef = admin
			.database()
			.ref("new_patrons")
			.orderByChild("email")
			.equalTo(user.patreon_email);
		const snapshotPatron = await patronsRef.once("value");
		const patron = snapshotPatron.val();

		const spent = user.subscription_ai_credits_spent;
		const credits = user.ai_credits;

		const tier = await SubscriptionServices.getActivePatreonTier(
			tiers,
			user,
			patron,
			0,
			new Date()
		);
		let subscription_credits = 0;
		if (tier && tier.benefits) {
			subscription_credits = tier.benefits.ai_credits;
		}

		// // Cancel when the client has insufficient credits
		if (spent >= subscription_credits && !credits) {
			return res
				.status(403)
				.json({ error: "Insufficient credits", error_code: "INSUFFICIENT_CREDITS" });
		}

		// Generate the monster
		const result = await MonsterGenerator.generateMonster(req.body.description);

		// First spent subscription credits if available, then spent purchased credits
		if (subscription_credits > spent) {
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

export default router;
