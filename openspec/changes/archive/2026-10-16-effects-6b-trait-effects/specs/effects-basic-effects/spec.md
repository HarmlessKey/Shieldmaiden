## ADDED Requirements

### Requirement: Advantage and Disadvantage on one skill's checks

The SRD effects data SHALL contain two more basic effects without an `edition`, each with one
sub-effect on skill checks (`sub_types: ["skill"]`) and the skill as a choice made when the
effect is applied (or fixed on a link):
- `advantage-on-skill-checks` "Advantage on Skill Checks": `advantage` → skill
- `disadvantage-on-skill-checks` "Disadvantage on Skill Checks": `disadvantage` → skill

Their `description` SHALL say that the skill is chosen when the effect is applied. Checks with
other skills and other ability checks SHALL NOT be affected.

#### Scenario: Armstrong's Arcana
- **WHEN** a special ability links Advantage on Skill Checks with the skill fixed to Arcana, and the creature makes an Intelligence (Arcana) check
- **THEN** the check has Advantage from the trait

#### Scenario: Other skills
- **WHEN** the same creature makes an Intelligence (History) check
- **THEN** the check has no Advantage from it
