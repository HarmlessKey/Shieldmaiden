const { Router } = require("express");
const { patreonServices } = require("../../src/services/patreon");

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

module.exports = router;
