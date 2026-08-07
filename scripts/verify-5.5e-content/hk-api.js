// Thin client for the HK compendium API, mirroring
// src/services/api/monsters.js and src/services/api/spells.js closely enough
// to reuse their query/response shapes (list endpoint returns
// { results: [...], meta: { count } }, each result has a `url` slug; single
// item endpoint is GET /{monsters,spells}/5.5e/{slug}).

const axios = require("axios");
const config = require("./config");

const REF = { monster: "/monsters", spell: "/spells" };

const HK = axios.create({ baseURL: config.HK_API_ROOT });

/**
 * Lists every 5.5e slug for the given type, filtered by `source`, paginating
 * through the full result set.
 *
 * @param {"monster"|"spell"} type
 * @param {string} source e.g. "srd" — see §3/§6 of the plan doc, unconfirmed
 *   against the live API from this sandbox; override with --source if wrong.
 * @param {number} pageSize
 */
async function listSlugs(type, source, pageSize = 50) {
	const ref = `${REF[type]}/5.5e`;
	const slugs = [];
	let skip = 0;
	// eslint-disable-next-line no-constant-condition
	while (true) {
		const params = `?skip=${skip}&limit=${pageSize}&fields=url name&source=${source}`;
		const { data } = await HK.get(ref + params);
		const results = data.results || [];
		for (const item of results) {
			slugs.push({ slug: item.url, name: item.name });
		}
		const total = data.meta ? data.meta.count : results.length;
		skip += pageSize;
		if (results.length === 0 || skip >= total) break;
	}
	return slugs;
}

/**
 * Fetches a single 5.5e monster or spell by slug.
 *
 * @param {"monster"|"spell"} type
 * @param {string} slug
 */
async function getEntity(type, slug) {
	const ref = `${REF[type]}/5.5e/${slug}`;
	const { data } = await HK.get(ref);
	return data;
}

module.exports = { listSlugs, getEntity };
