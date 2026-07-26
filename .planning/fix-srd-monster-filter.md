# Fix SRD monster filter

## Bug report

> SRD monster filter no longer works. Only filter by name is working, not the others
> (environment, cr, type, etc).

## Root cause

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

### Why the other filters look broken too

`filter` in `Entities.vue` / `Compendium/Monsters.vue` is a single object that persists for the
lifetime of the view — the filter dialog is re-created on each open, but the object it writes into
is not reset. `filterMonsters()` spreads the whole object into every request:

```js
this.query = { search: this.searchMonster, source: …, ...this.filter };
```

So once the user nudges the CR slider off `0` (the first three notches are 1/8, 1/4, 1/2 — exactly
the ones that break), `challenge_ratings` stays in `filter` and poisons **every subsequent query**.
Setting a type or an environment afterwards still returns nothing, which reads as "type and
environment filtering are broken too". Only "Clear filter" recovers, and a plain name search done
before the dialog is ever opened still works — matching the report exactly.

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

- `src/utils/generalConstants.js` — add the canonical CR ladder + fraction labels as shared
  constants (per CLAUDE.md, shared constants live here).
- `src/components/hk-components/hk-filter.vue` — use the shared constants instead of a private
  copy; drop `challenge_ratings` from the filter when the slider covers the full range so the
  active-filter badge and the request stay honest.
- `src/services/api/monsters.js` — pick CRs off the ladder instead of `range()`; encode all values.
- `src/services/api/spells.js` — encode all values (same interpolation bug; its `level` range is
  integer-only so it is not affected by the CR issue).

## Out of scope / open question

The `field[]=value` array convention used for `type[]`, `size[]`, `environment[]`, `alignment[]`
and `challenge_rating[]` is left unchanged. It matches axios' default array serialization and is
used identically by the spells service, so it is very likely correct. `api.harmlesskey.com` is not
reachable from the dev environment (egress policy), so this could not be verified against a live
response — if filtering still misbehaves after this fix, the API's expected array syntax is the
next thing to check.

## Verification

- CR 1/8 – 30 returns monsters (previously empty).
- CR 0 – 0 returns only CR 0 monsters (previously also 1/8, 1/4, 1/2).
- Type "Swarm of tiny beasts" and alignment "Lawful good" survive the query string intact.
- Setting type/environment after touching the CR slider still filters correctly.
- Full-range CR slider adds no `challenge_rating[]` params and no filter badge.
