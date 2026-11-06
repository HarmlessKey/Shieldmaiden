# Custom effects: manual test plan

The custom effects checks from the effects PR (#366), held back with custom effects on
2026-11-06 (step 14 of [effects-implementation-plan.md](./effects-implementation-plan.md)).
Use them for the release PR (`effects-14-release-custom-effects`): copy them into its test
plan once the coming-soon gating is removed.

Each line is `action → expected result`. The section numbers are those of PR #366's test plan,
so the code map comment on that PR still points to the code. Unless a section says otherwise,
test in the normal tracker layout with a signed-in user.

## Release checks

The coming-soon gating is gone:
- [ ] `grep -rn custom_effects_released src` finds nothing
- [ ] My content > Effects lists the effects with search, with New effect in the header and "Create your first Effect" when there are none
- [ ] `/content/effects/add-effect` and an effect's page open the form
- [ ] The tracker's and the run campaign screen's Effects drawers, and the bonus drawers, list custom effects in a Custom tab with their count; no "Coming soon"
- [ ] User with no custom effects → no Custom tab
- [ ] The personal reminders' deprecation notice links to Effects under My content

## Test setup

On top of PR #366's setup, create these custom effects (most with the form, section 21):
- Blessing of the Forge
- Énervation (with the accent)
- Burning and Stoneskin
- Toughness (a Hit Point Maximum Bonus)
- a hit-taken damage effect with `natural_roll: [20]`
- one you delete after applying it, and one whose definition can't be loaded

## 3. SRD data from the API

- [ ] **API down:** Effects drawer → SRD group omitted, custom effects listed
- [ ] **API down:** copy search's SRD tab → says it couldn't load; Custom tab still works

## 5. Effects drawer

**Lists**
- [ ] Without a mode → tabs Effects and Custom with counts, no conditions
- [ ] Same custom effects in 5e and 5.5e campaigns
- [ ] User with no custom effects → no Custom tab

**Search**
- [ ] "bless" → Bless in Effects and "Blessing of the Forge" in Custom
- [ ] "ENERVATION" finds "Énervation"
- [ ] Search exists in the effect form's pickers and the My content effects list

**Details**
- [ ] Custom effect that can't be loaded → "no details available", still applicable

**Exhaustion and duplicates**
- [ ] A custom effect applied twice → two instances

## 6. Chips and detail view

- [ ] Deleted custom effect → stored name and "No details available"

## 7. Storage

- [ ] Edit a custom effect during an encounter → old definition until the next encounter start

## 12. Stat modifiers

- [ ] Same custom effect twice → counts once

## 13. Manual bonuses and bonuses drawer

- [ ] Max HP drawer → also lists the custom Toughness

## 15. Roll modifiers

- [ ] Custom hit-taken damage with `natural_roll: [20]` → stays a prompt with Roll

## 20. Run campaign screen

- [ ] Effects button → drawer with conditions, effects and custom effects, with the same apply form and search

## 21. Custom effect form

**Create and copy**
- [ ] New effect asks: Copy existing effect or Create from scratch
- [ ] Header has Copy while new; a saved effect has no Copy and no dialog
- [ ] Copy after Create from scratch replaces what the form holds
- [ ] Copy search: Custom and SRD tabs, edition toggle, search ignoring case and accents, paged, no request per search
- [ ] Copy 5.5e Bless → name, description and sub-effects; unsaved changes shown
- [ ] Change the die to 1d6 and save → new custom Bless, SRD Bless unchanged
- [ ] Copy 5e Grappled → saved as a custom effect, no condition icon, not in the Conditions option
- [ ] Copy 5.5e Paralyzed → still includes SRD Incapacitated
- [ ] Copy a custom effect → second effect, first unchanged
- [ ] Copying keeps stacking, level, condition, ends when, sustain and aura

**Fields**
- [ ] No duration, category, spell level, magical, tags, removed by, "can be removed" or scaling fields
- [ ] Name is required, at most 100 characters
- [ ] Type list has a label and description for each type
- [ ] Sub-types follow the type: Defense offers Vulnerable, Resistant, Immune, not Armor Class
- [ ] Fields follow the type and Applies to: Bonus with Saving throw shows value, roll, abilities and perspective
- [ ] Bonus with Armor Class shows only the value; adding Saving throws shows roll, multiplier and filters
- [ ] Changing the type clears fields no longer shown

**Amounts and references**
- [ ] Amount fields accept a number, roll or formula; `value` accepts a number or formula
- [ ] `caster.cha_mod` with min 1 saves
- [ ] `constructor` shows an error and can't be saved
- [ ] `spell_level * 2`, `char_level` and `caster.class_level` → unknown variable, can't be saved
- [ ] Includes picks Incapacitated; Apply effect picks a custom effect
- [ ] The picker has SRD conditions, effects and custom effects, each url once, search, and not the effect itself

**Nesting**
- [ ] Aura radius 10 with a Bonus sub-effect inside
- [ ] Save success effects, fail-by-5 effects, repeat-save on fail and on expire use the same editor
- [ ] Apply effect's nested duration offers every duration type; next turn, target, end saves
- [ ] Condition sets: one check, "all of", "any of", nested; every check type, subject, comparator and negate
- [ ] One check saves as a single object

**Choices and configurations**
- [ ] Choice: only kinds whose field is shown; Value only with a value; not on Defense
- [ ] Choice-filled fields show "Chosen when the effect is applied", with the fixed value removed
- [ ] Skill and Value both → list saved; removing Value makes the field editable again
- [ ] Damage type choice with listed types offers those; with none, all
- [ ] Info icon popover on choice-capable fields
- [ ] Short effect shows name, description, one sub-effect, two empty Configuration lists with Add
- [ ] Add menu explains each configuration; effect-level list comes after the sub-effects
- [ ] Adding opens the edit dialog; Edit, Remove and expanding work; Remove clears the values
- [ ] Empty Stacking summary reads "This effect doesn't stack: the stronger or longer instance is kept."
- [ ] Missing required settings show a warning icon
- [ ] Opened effect shows its configurations

**Saving**
- [ ] Required fields are enforced, per part
- [ ] Includes without an effect → "required", nothing saved
- [ ] Schema failure names the field ("Sub-effect 2 › Consume › On")
- [ ] Clearing a field removes its key
- [ ] Open and save unchanged → no unsaved changes, same stored effect
- [ ] "How effects work" link opens `/documentation/effects`
- [ ] My content effects list has search and works for old effects

## 22. NPC links

- [ ] A deleted custom effect still edits by name
- [ ] Import: link to a missing custom effect → kept, shown by name

## 26. Public initiative

- [ ] DM's custom effect resolves for the viewer, even when the viewer has one with the same id
- [ ] Unreadable custom effect → stored name, no value changes

## 29. Documentation and regression

- [ ] Every label in the custom effect form is explained on `/documentation/effects`
