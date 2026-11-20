# Keyboard equivalents for clickable elements (Sonar quality gate)

## Problem

The SonarCloud quality gate on PR #366 fails on reliability: 12 elements have a click handler
without a keyboard handler (`Web:MouseEventWithoutKeyboardEquivalentCheck`). The clickable
values on the entity card, the bonuses drawer's section headers and the AC on the run campaign
screen can't be reached with the keyboard.

## Fix

Elements that open or toggle something work with the keyboard, only while they're clickable:
`tabindex="0"`, `role="button"`, and Enter and Space do what a click does.
- Card: the stat values, ability scores and spellcasting save DC and attack
- `EffectModifiedValue` when it's clickable
- `StatBonuses`: section headers, when there are several sections
- `Players`: the AC, for the DM

Elements that don't act on a click themselves:
- `TargetEntity` health values: `@click.stop` keeps a click from targeting the row, so
  `@keydown.space.stop` does the same for the row's Space. Typing a space still works.
- `ChoiceInfo`: the same, for Enter on the icon.
- `EffectsDocumentation`: `followAnchor` also handles Enter on a link. It prevents the default
  for `#` links, so the click doesn't follow and it doesn't run twice. Other links are left
  to the browser.

## Verify

- `npm run lint`
- Manual (user): Tab to a card value and press Enter or Space: the bonuses drawer opens. The
  same for a bonuses drawer section header and a player's AC on the run campaign screen, and a
  contents link on the effects documentation. Outside an encounter, card values aren't tab stops.
  Space in the HP quick edit's inputs types a space and doesn't select the row.
- SonarCloud on the PR after pushing: 0 bugs and the gate passes.
