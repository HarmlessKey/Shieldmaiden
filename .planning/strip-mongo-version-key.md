# Strip MongoDB `__v` From Copied Content

## Problem

MongoDB/Mongoose adds a `__v` version key to documents. The content API is supposed to strip
it from its responses, but doesn't always. When a user copies an SRD monster, spell or item
into their own content, that `__v` is copied along with it.

It shouldn't end up in user content: our own schemas (`hk-npc-schema.json`,
`hk-spell-schema.json`) declare `additionalProperties: false`, so an object carrying `__v`
fails validation — on import, and on the Firebase rules that mirror those schemas.

## Solution

`components/CopyContent.vue` is the single funnel for every copy-from-content flow (Edit NPC,
Edit Spell, Edit Item, Add NPC to encounter, link item, add spells to an NPC). Its `copy()`
already deletes the API-only properties `_id`, `key`, `url`, `meta` and `release_date` before
emitting the result — `__v` belongs in that same cleanup.

New util in `src/utils/generalFunctions.js`:

```js
removeVersionKeys(data)  // deletes __v from an object and everything nested in it
```

Recursive rather than a single `delete result.__v`, because the API leaks the key
inconsistently and a monster/spell carries nested objects and arrays (actions, spell lists)
that our schemas reject just as hard as the root object.

Called from `CopyContent.copy()` after the existing deletes, so it covers all three content
types in one place.
