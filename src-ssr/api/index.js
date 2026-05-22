const { Router } = require("express");
const { patreonServices } = require("../../src/services/patreon");
const { MonsterGenerator } = require("../../src/services/monster_generator");
const { SubscriptionServices } = require("../../src/services/subscription");

const fs = require("fs");
const path = require("path");

const admin = require("firebase-admin");

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

/**
 * Verifies the Bearer token and checks AI credit balance.
 * Returns user credit data, or sends an error response and returns null.
 */
async function verifyUserAndCredits(req, res) {
	if (!req.headers.authorization || !req.headers.authorization.startsWith("Bearer ")) {
		res.status(401).json({ error: "Unauthorized" });
		return null;
	}
	const idToken = req.headers.authorization.split("Bearer ")[1];

	const decodedToken = await admin.auth().verifyIdToken(idToken);
	const uid = decodedToken.uid;

	const tiersRef = admin.database().ref("tiers");
	const userRef = admin.database().ref(`users/${uid}`);
	const spentRef = admin.database().ref(`users/${uid}/subscription_ai_credits_spent`);
	const creditsRef = admin.database().ref(`users/${uid}/ai_credits`);

	const [snapshotTiers, snapshotUser] = await Promise.all([
		tiersRef.once("value"),
		userRef.once("value"),
	]);
	const tiers = snapshotTiers.val();
	const user = snapshotUser.val();

	if (!user) {
		res.status(401).json({ error: "User not found" });
		return null;
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

	const tier = await SubscriptionServices.getActivePatreonTier(tiers, user, patron, 0, new Date());
	let subscription_credits = 0;
	if (tier && tier.benefits) {
		subscription_credits = tier.benefits.ai_credits;
	}

	if (spent >= subscription_credits && !credits) {
		res.status(403).json({ error: "Insufficient credits", error_code: "INSUFFICIENT_CREDITS" });
		return null;
	}

	return { uid, spent, credits, subscription_credits, spentRef, creditsRef };
}

/**
 * Deducts one AI credit: subscription credits first, then purchased credits.
 */
async function deductCredit({ spent, credits, subscription_credits, spentRef, creditsRef }) {
	if (subscription_credits > spent) {
		await spentRef.set(spent + 1);
	} else {
		await creditsRef.set(credits - 1);
	}
}

router.post("/ai/generate-monster", async (req, res) => {
	try {
		const creditData = await verifyUserAndCredits(req, res);
		if (!creditData) return;

		const result = await MonsterGenerator.generateMonster(req.body.description);
		await deductCredit(creditData);

		res.json(result);
	} catch (error) {
		console.error("Error generating monster:", error);
		res.status(500).json({ error: "Internal Server Error" });
	}
});

router.post("/ai/parse-statblock", async (req, res) => {
	try {
		const creditData = await verifyUserAndCredits(req, res);
		if (!creditData) return;

		const result = await MonsterGenerator.parseStatblock(req.body.image_base64, req.body.mime_type);
		await deductCredit(creditData);

		res.json(result);
	} catch (error) {
		console.error("Error parsing statblock:", error);
		res.status(500).json({ error: "Internal Server Error" });
	}
});

module.exports = router;
