# Fix: Google sign-ups never reach `/set-username`

## Problem

Users who create their account with **Sign in / Sign up with Google** are let into the
app without ever being asked for a username. Because the rest of the app assumes
`userInfo.username` exists, screens behind the authenticated layout break for them.

## Root cause

A Google sign-in creates a **Firebase Auth** user but no `users/<uid>` record in the
database. Only two code paths ever write that record:

- `SignUp.vue:createUser()` — the email/password flow (writes `username`, `email`, `created`)
- `SetUsername.vue:setUsername()` — the `/set-username` page

So for a fresh Google account, `users/<uid>` does not exist yet:

```js
const snapshot = await user.once("value");
const user_info = snapshot.val();   // null — no record
if (user_info) {
    commit("SET_USERINFO", user_info);   // never runs
    ...
}
```

`userInfo` therefore stays `undefined` — not "loading", but "loaded, and there is no
record at all".

Commit `5efd6b1` ("Fix spurious set-username redirect on cold load") changed the three
route guards from `!store.getters.userInfo` to:

```js
} else if (store.getters.userInfo && !store.getters.userInfo.username) {
    redirect("/set-username");
}
```

That fixed the spurious redirect for users who *do* have a record, but it also made the
guard unable to fire for a user with **no record at all** — exactly the state a fresh
Google account is in. `userInfo` is falsy, so the whole condition short-circuits to
`false` and the user is allowed through to `/content` with no username.

The pre-`5efd6b1` guard (`!userInfo`) did catch this case; it just couldn't tell it apart
from "still loading", which is what caused the bug that commit was fixing. The two
conditions each cover one half of the problem — neither distinguishes the three real
states.

Affected entry points:

- `SignIn.vue:googleSignIn()` — a first-time Google user clicking **Sign in with Google**
  creates their account here and is sent to `/content`; the guard no longer stops them.
- Any later cold load / SSR navigation for such an account — `userInfo` is `undefined`
  again, so no guard fires and the user keeps browsing a broken app.

`SignUp.vue:googleSignIn()` happens to still work because it hard-redirects to
`/set-username` itself, but only when the component is rendered on the `/sign-up` route.

## Fix

Track load completion explicitly so the guards can distinguish **three** states instead
of two:

| state | `userInfoLoaded` | `userInfo` | guard |
| --- | --- | --- | --- |
| still loading | `false` | `undefined` | do nothing |
| loaded, no record / no username | `true` | `undefined` or `{...}` without `username` | redirect to `/set-username` |
| loaded, has username | `true` | `{ username, ... }` | allow |

### 1. `src/store/modules/user.js` — add a load-completed flag

- New state `user_info_loaded: false`, getter `userInfoLoaded`, mutation
  `SET_USERINFO_LOADED`.
- `setUserInfo` commits `SET_USERINFO_LOADED` **after** the awaited `.once("value")`
  resolves, **whether or not** a record was found. `setUserInfo` already resolves only
  after that commit (from `5efd6b1`), so anything awaiting it can trust the flag.
- `CLEAR_USER` resets the flag so a sign-out → sign-in cycle re-evaluates.

### 2. Route guards — key off the flag, not off `userInfo` being truthy

`src/layouts/authenticated.vue`, `src/layouts/run-campaign.vue`,
`src/views/profile/Profile.vue`:

```js
} else if (store.getters.userInfoLoaded && !store.getters.userInfo?.username) {
    redirect("/set-username");
}
```

This keeps the `5efd6b1` behaviour (no redirect while loading) *and* restores the
redirect for users with no record.

### 3. `src/views/profile/SetUsername.vue` — refresh the store after saving

Required by change #2, otherwise saving a username loops back to `/set-username`.

On a cold load the `users/<uid>` listener from `setUserInfo` was attached **server-side**
(`App.vue` `preFetch`), so the client has no live listener: writing the username updates
the database but not the client store. With the hardened guard, the subsequent
`$router.replace("/profile")` would see `userInfoLoaded === true` and still no
`username`, and bounce straight back.

So: `await` both writes, then `await setUserInfo()` before navigating. The re-fetch
commits the new record (with the resolved `created` timestamp rather than the
`ServerValue.TIMESTAMP` sentinel), attaches a client-side listener, and runs
`enrichTier`, which also fixes `tier` being `undefined` for a brand-new account.

### 4. `src/components/SignIn.vue` / `SignUp.vue` — username-aware post-sign-in redirect

`SignIn.vue` has three near-identical success handlers (email/password, Google redirect,
Google popup) that all send the user to `/content`. Extract them into one
`handleSignedIn(user)` that sends a user with no username to `/set-username` instead.

This means a first-time Google sign-in lands on `/set-username` directly rather than
relying on the guard to bounce it, and it also covers `SignIn` used as a dialog
(`Profile.vue`, `UserMenu.vue`, `EditNpc.vue`, `EditSpell.vue`, `DeleteAccount.vue`),
where no navigation happens today and therefore no guard runs.

Apply the same condition in `SignUp.vue` so its Google path no longer depends on being
rendered on the `/sign-up` route.

## Files touched

- `src/store/modules/user.js` — `user_info_loaded` state/getter/mutation, set in
  `setUserInfo`, reset in `CLEAR_USER`.
- `src/layouts/authenticated.vue` — guard condition.
- `src/layouts/run-campaign.vue` — guard condition.
- `src/views/profile/Profile.vue` — guard condition.
- `src/views/profile/SetUsername.vue` — await writes, refresh `userInfo` before redirect.
- `src/components/SignIn.vue` — single `handleSignedIn` handler, username-aware redirect.
- `src/components/SignUp.vue` — username-aware redirect.

## Out of scope

- **Safari/Edge Google redirect flow** (`SignIn.vue` uses `signInWithRedirect` there):
  the `.then()` callback cannot receive a user, since the page unloads and comes back via
  `getRedirectResult`, which nothing calls. Nothing dispatches `setUser`/`setUserInfo`
  from `onAuthStateChanged` either, so the store has no user until a full reload with the
  `access_token` cookie in place. Pre-existing and unrelated to `5efd6b1`; the guard fix
  makes such accounts recover on their next load instead of silently continuing without a
  username. Worth a separate change.
- `setUserInfo` attaches a new `.on("value")` listener on every call (it is called from
  `Profile.vue` and `LinkPatreonAccount.vue` too), so listeners and `enrichTier` runs
  stack up. Pre-existing, not username-related.
- `SetUsername.vue` uses `this.user.email.toLowerCase()` unguarded; providers that return
  no email would throw. Not seen in the reports.

## Verification

1. **New Google account:** sign in with a Google account that has no `users/<uid>` record
   → lands on `/set-username`, cannot navigate past it, saves the username, lands on
   `/profile` with the username visible (no bounce back, no error toast).
2. **Cold load of a username-less account:** with a session cookie for such an account,
   hard-load a deep link → redirected to `/set-username` (this is the case the flag
   restores).
3. **Regression on `5efd6b1`:** ctrl-click a deep link and cold-load on throttled Slow 3G
   as a user *with* a username → no `/set-username` redirect, no
   `userInfo is undefined` error.
4. **Email/password sign-up** still goes straight to `/content` (username set at
   creation).
5. **Sign out → sign in** as a user with a username → no redirect (flag reset works).
6. **Patron tier** still resolves after the initial commit, and now also resolves for an
   account that just set its username.
