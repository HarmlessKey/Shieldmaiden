# Fix SRD monster filter

## Bug report

> SRD monster filter no longer works. Only filter by name is working, not the others
> (environment, cr, type, etc).

## Root cause: array params use the wrong syntax

The API was upgraded to **Express 5**, which changed the default `query parser` from `extended`
(`qs`) to `simple` (Node's `querystring`). The simple parser does not interpret `[]`: `type[]=Beast`
becomes the literal key `"type[]"`, so `req.query.type` is undefined and the filter is ignored.
Multi-value filters must now be sent as a **repeated plain key**. Confirmed against the live API by
the reporter:

| Query           | Result  |
| --------------- | ------- |
| `type=Beast`    | works   |
| `type[]=Beast`  | ignored |

`query parser` is an application-wide Express setting, so every endpoint using the bracket form
broke at the same moment — `/monsters` and `/spells`. `/items` and `/conditions` only send `name=`
and are unaffected.

Repeated plain keys parse to an array under both the `simple` and `extended` parsers, so this
change is correct whether or not the API also restores `app.set("query parser", "extended")`.

`src/services/api/monsters.js` sent the bracket form for every multi-value filter — `type[]`,
`size[]`, `environment[]`, `alignment[]` and `challenge_rating[]` — so all of them were silently
dropped by the API and came back unfiltered. `name` and `source` are single plain keys and were
never affected, which is exactly why "only filter by name is working".

Multiple selections are sent as the key repeated: `type=Beast&type=Dragon`.

## Second bug: challenge rating range

`src/services/api/monsters.js` expands the challenge rating range with `lodash.range()`:

```js
let challenge_ratings = range(query.challenge_ratings.min, query.challenge_ratings.max + 1);
if (query.challenge_ratings.min === 0) {
  challenge_ratings = challenge_ratings.concat([0.125, 0.25, 0.5]);
}
```

`range()` walks in steps of 1 starting at `min`. That only produces valid CRs when `min` is a
whole number.

Commit `41df51d` ("Map CR slider to fractional values") changed the slider so it stores **actual
CR values** (`0, 1/8, 1/4, 1/2, 1..30`) instead of the slider positions `0..30` it stored before.
From that commit on, `min` can be `0.125`, `0.25` or `0.5`, and `range()` produces nonsense:

| Slider range | Generated CRs                                  |
| ------------ | ---------------------------------------------- |
| 1/8 – 30     | `0.125, 1.125, 2.125, … 30.125` — matches nothing |
| 1/4 – 10     | `0.25, 1.25, 2.25, … 10.25` — matches nothing     |
| 1/2 – 5      | `0.5, 1.5, 2.5, 3.5, 4.5, 5.5` — matches nothing  |

Every one of those queries returns **zero monsters**.

This is masked by the param-name bug above — the CR params were being dropped wholesale — but it
would break the CR filter as soon as the param names are fixed, so both need fixing together.

The `min === 0` special case is wrong in its own right: it force-adds 1/8, 1/4 and 1/2 to any range
starting at 0, so a `0 – 0` range also returns CR 1/8, 1/4 and 1/2 monsters.

## Secondary bug: query values are not URL-encoded

All values are interpolated into the query string raw:

```js
queryParams.push(`type[]=${type}`);
queryParams.push(`name=${query.search}`);
```

Values containing `&`, `+`, `#` or `%` corrupt the query string. This affects the multi-word
options in `src/mixins/monster.js` — `"Swarm of tiny beasts"` and nearly every alignment
(`"Lawful good"`, `"Any alignment"`, …) — as well as free-text monster searches.

## Scope

- `src/services/api/monsters.js` — send multi-value filters as repeated plain keys instead of the
  `field[]` form.
- `src/utils/generalConstants.js` — add the canonical CR ladder + fraction labels as shared
  constants (per CLAUDE.md, shared constants live here).
- `src/components/hk-components/hk-filter.vue` — use the shared constants instead of a private
  copy; drop `challenge_ratings` from the filter when the slider covers the full range so the
  active-filter badge and the request stay honest.
- `src/services/api/monsters.js` — pick CRs off the ladder instead of `range()`; encode all values.
- `src/services/api/spells.js` — encode all values (same interpolation bug; its `level` range is
  integer-only so it is not affected by the CR issue).

## Open question: /spells

`src/services/api/spells.js` still sends `school[]`, `classes[]` and `level[]`. If the API change
was global rather than limited to `/monsters`, the spell filters are broken in exactly the same way
and need the same one-line change per param. Left alone here rather than guessed at, because
changing it blind would break the spell filter if `/spells` still accepts the bracket form.
`api.harmlesskey.com` is not reachable from the dev environment (egress policy), so this could not
be checked directly.

## Verification

- Type "Beast" returns only beasts; selecting Beast + Dragon returns both.
- Environment, size and alignment filter instead of being ignored.
- CR 1/8 – 30 returns monsters; CR 0 – 0 returns only CR 0 (previously also 1/8, 1/4, 1/2).
- Type "Swarm of tiny beasts" and alignment "Lawful good" survive the query string intact.
- Full-range CR slider adds no `challenge_rating` params and no filter badge.
