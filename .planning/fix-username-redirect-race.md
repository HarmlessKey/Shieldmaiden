# Fix: spurious "/set-username" redirect & `userInfo is undefined` error

## Problem

Some users are bounced to `/set-username` on login even though they already have a
username (it exists in the DB). The page then throws:

- Firefox: `TypeError: can't access property "username", userInfo is undefined`
- Chrome:  `TypeError: Cannot read properties of undefined (reading 'username')`

The same bug is reproducible by **anyone** via ctrl-click / "open link in new tab":
the new tab loads via SSR, lands on `/set-username`, and throws the same error.

A "success" toast ("Username saved") followed immediately by an "error" toast is the
visible signature when an affected user re-enters a username on that page.

## Root cause — a race condition (not user data)

`setUserInfo` (`src/store/modules/user.js:118`) populates `userInfo` inside an
**async `.on("value")` listener** whose `SET_USERINFO` commit is gated behind a chain of
awaits — `serverUtils.getServerTime()`, `tiers_ref.once()`, the `new_patrons` email
query, and `SubscriptionServices.getActivePatreonTier()`:

```js
user.on("value", async (user_snapshot) => {
    const user_info = user_snapshot.val();
    if (user_info) {
        const server_time = await serverUtils.getServerTime();
        const tiersSnap   = await tiers_ref.once("value");
        ...
        const email       = ... user_info.email.toLowerCase();
        const patronSnap  = await patronsRef.once("value");          // can be slow
        const patreon_tier = await SubscriptionServices.getActivePatreonTier(...);
        commit("SET_TIER", patreon_tier || tier);
        commit("SET_USERINFO", user_info);                           // ← LAST line
    }
});

// but the function actually returns a hard-coded timer:
return new Promise((resolve) => {
    setTimeout(() => resolve(), 1000);                               // ← resolves blind, after 1s
});
```

So `await dispatch("setUserInfo")` does **not** guarantee `userInfo` is committed — it
just waits 1 second. The boot sequence in `App.vue:87` then proceeds:

```js
await store.dispatch("setUserInfo");   // resolves on the 1s timer
await store.dispatch("initialize");
```

…and the layout route guards check `userInfo` and redirect on undefined
(`src/layouts/authenticated.vue:46`, `src/layouts/run-campaign.vue:13`,
`src/views/profile/Profile.vue:281`):

```js
} else if (!store.getters.userInfo) {
    redirect("/set-username");          // can't tell "still loading" from "no username"
}
```

When the patron/tier chain takes longer than the 1s timer, `userInfo` is still
`undefined` when the guard runs → redirect to `/set-username` → `SetUsername.vue:56`
preFetch and downstream reads of `userInfo.username` throw.

Two independent reasons the timer loses the race:

1. **SSR (ctrl-click / new tab):** the whole sequence runs server-side, where the
   patron/tier chain reliably doesn't finish inside 1s and `.on("value")` is the wrong
   primitive for a one-shot SSR fetch. → reproduces for everyone.
2. **High latency (the affected user):** on a slower connection the chain exceeds 1s
   every cold load, on both his Firefox and his iPhone. → reproduces only for him.

It is **not** caused by his account data (he has an email, no voucher, no linked
Patreon — all confirmed).

## Fix

Three coordinated changes.

### 1. `setUserInfo` resolves on the real commit, and commits `userInfo` first

In `src/store/modules/user.js`:

- Do the **initial** load with `.once("value")`, commit `SET_USERINFO` from that
  snapshot, and resolve the returned promise **after** the commit. Remove the
  `setTimeout(…, 1000)` resolve entirely.
- Commit `SET_USERINFO` **before** the Patreon/tier enrichment so the
  redirect-critical field (`username`) is available immediately; let `SET_TIER` /
  voucher / patron resolve afterward.
- Wrap the enrichment (server time, tiers, patron query, `getActivePatreonTier`) in
  `try/catch` so a slow or failing patron lookup can **never** block or unset
  `userInfo`. On failure, fall back to the basic/legacy tier and log the error.
- Keep a live `.on("value")` listener for ongoing updates (so external changes to the
  user record still propagate), but it must not be what the boot sequence awaits.

Sketch:

```js
async setUserInfo({ commit, dispatch, rootGetters }) {
    if (!rootGetters.user) return;
    const userRef = users_ref.child(rootGetters.user.uid);

    // Initial, awaited load — commit userInfo first.
    const snap = await userRef.once("value");
    const user_info = snap.val();
    if (user_info) {
        commit("SET_USERINFO", user_info);          // redirect-critical, available immediately
        await dispatch("enrichTier", user_info);    // best-effort; wrapped in try/catch
    }

    // Live updates after the initial load.
    userRef.on("value", (s) => {
        const v = s.val();
        if (v) {
            commit("SET_USERINFO", v);
            dispatch("enrichTier", v).catch((e) => console.error(e));
        }
    });
}
```

`enrichTier` holds the existing tiers/voucher/patron logic (moved out of the listener),
wrapped in `try/catch` with a basic-tier fallback. `getServerTime` already mutates the
`date` arg via `setDate` in `subscription.js` — preserve current behaviour, just guard it.

### 2. Harden the route guards

Distinguish "not loaded yet" from "loaded, genuinely has no username". Only redirect to
`/set-username` when the user record is loaded **and** lacks a username:

```js
} else if (store.getters.userInfo && !store.getters.userInfo.username) {
    redirect("/set-username");
}
```

Apply to all three guards:
- `src/layouts/authenticated.vue:46`
- `src/layouts/run-campaign.vue:13`
- `src/views/profile/Profile.vue:281`

Because change #1 makes `setUserInfo` resolve only after `userInfo` is committed, by the
time these guards run `userInfo` is populated for a logged-in user, so the guard now
fires only for genuinely username-less accounts.

### 3. Defensive guard on the SetUsername page

`src/views/profile/SetUsername.vue:56` preFetch currently does
`store.getters.userInfo.username` unguarded. Change to:

```js
} else if (store.getters.userInfo && store.getters.userInfo.username) {
    redirect("/profile");
}
```

so the page can never throw even if reached in a partially-initialized state. The
template already guards with `v-if="!userInfo || !userInfo.username"`.

## Files touched

- `src/store/modules/user.js` — rework `setUserInfo`, add `enrichTier` action.
- `src/layouts/authenticated.vue` — guard condition.
- `src/layouts/run-campaign.vue` — guard condition.
- `src/views/profile/Profile.vue` — guard condition.
- `src/views/profile/SetUsername.vue` — preFetch guard.

## Out of scope

- The `email`-missing crash path (`user_info.email.toLowerCase()` with no guard) is not
  the cause here, but the `try/catch` in `enrichTier` incidentally makes it non-fatal.
  No separate change needed.
- No changes to `App.vue` boot ordering or `firebase-auth.js` — they become correct once
  `setUserInfo` resolves honestly.

## Verification

1. **Ctrl-click repro:** open any in-app deep link in a new tab while logged in → lands
   on the intended page, not `/set-username`; no console error.
2. **Slow-network repro:** throttle to Slow 3G in devtools, cold-load the app → no
   spurious redirect, `userInfo` present before first guarded route renders.
3. **Genuine new user:** a freshly created account with no username → still correctly
   routed to `/set-username`, can set it, lands on `/profile`.
4. **Patron still resolves:** a linked-Patreon account still gets the correct tier after
   load (enrichment runs after the initial commit).
5. SSR: confirm no `userInfo is undefined` thrown server-side on a logged-in cold load.
