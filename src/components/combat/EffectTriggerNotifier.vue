<script>
import { startCase } from "lodash";
import { mapActions, mapGetters } from "vuex";
import { TRIGGER_LABELS } from "src/utils/effectFunctions";
import { effectRolls } from "src/mixins/effectRolls";

/**
 * Shows the effect prompts queued in the store as notifications:
 * - trigger: an effect listens for a trigger that fired (Details / Dismiss)
 * - notice: an effect ended by itself (closes by itself)
 * - maybe: an effect may have ended, a filter couldn't be checked (Remove / Keep)
 * - review: carried-over effects need review at encounter start (Review / Dismiss)
 * - save: a repeat save comes up (Roll / Succeeded / Failed)
 * - on_expire: what happens now that an effect ended (Dismiss)
 * - temp_hp: an applied effect grants temporary hit points (Grant temp HP / Dismiss)
 * - concentration_save: damage calls for a Concentration save (Roll / Succeeded / Failed)
 * - reaction_used: an entity acted out of turn (Apply Reaction Used / Dismiss)
 * - death: an effect's death outcome applies, Exhaustion 6 (Mark dead / Dismiss)
 * - drop_to_one: held at 1 hit point until a save, Undead Fortitude (Roll / Succeeded / Failed)
 * - temp_hp_lost: temporary hit points ended with their effect (closes by itself)
 * Trigger and on_expire prompts with damage or healing also get Roll, which opens the roll
 * dialog, and trigger prompts with temporary hit points get Grant temp HP.
 * Renders nothing; mounted once in RunEncounter.
 */
export default {
	name: "EffectTriggerNotifier",
	mixins: [effectRolls],
	computed: {
		...mapGetters(["effect_prompts", "entities"]),
	},
	beforeCreate() {
		// Open Reaction used prompts by entity key; not rendered, so not reactive.
		// Before the immediate effect_prompts watcher runs.
		this.openReactionPrompts = {};
	},
	watch: {
		effect_prompts: {
			handler(prompts) {
				if (!prompts?.length) return;
				for (const prompt of prompts) {
					this.show(prompt);
				}
				this.$store.commit("CLEAR_EFFECT_PROMPTS");
			},
			immediate: true,
		},
	},
	methods: {
		...mapActions(["setDrawer", "remove_effect", "resolve_repeat_save"]),
		/**
		 * The effect a prompt is about, for its icon: the prompt's copy, the running instance,
		 * or the source of an instance that already ended
		 */
		promptInstance(prompt) {
			return (
				prompt.instance ||
				this.entities[prompt.holderKey]?.effects?.[prompt.effectKey] ||
				(prompt.source ? { source: prompt.source, source_key: prompt.source_key } : undefined)
			);
		},
		/**
		 * effectToast for a prompt, with the prompt's effect icon
		 */
		promptToast(type, prompt, body, title, config) {
			return this.effectToast(type, { title, body, instance: this.promptInstance(prompt), config });
		},
		show(prompt) {
			switch (prompt.kind) {
				case "notice":
					return this.showNotice(prompt);
				case "maybe":
					return this.showMaybe(prompt);
				case "review":
					return this.showReview(prompt);
				case "save":
					return this.showSave(prompt);
				case "on_expire":
					return this.showOnExpire(prompt);
				case "temp_hp":
					return this.showTempHp(prompt);
				case "concentration_save":
					return this.showConcentrationSave(prompt);
				case "reaction_used":
					return this.showReactionUsed(prompt);
				case "death":
					return this.showDeath(prompt);
				case "drop_to_one":
					return this.showDropToOne(prompt);
				case "temp_hp_lost":
					return this.showNotice({
						...prompt,
						text: `${(prompt.holderName || "It").capitalizeEach()} loses ${prompt.amount} temporary hit points from ${prompt.effectName}`,
					});
				default:
					return this.showTrigger(prompt);
			}
		},
		showSave(prompt) {
			const ability = startCase(prompt.ability);
			const dc = prompt.dc ? ` DC ${prompt.dc}` : "";
			const notes = [prompt.advantage && "with Advantage", prompt.costsAction && "costs its action"]
				.filter(Boolean)
				.join(", ");
			const title = `${prompt.holderName || "Unknown"}: ${prompt.effectName} — ${ability} save${dc}`;
			const body = `Repeat the save ${TRIGGER_LABELS[prompt.trigger] || ""}${notes ? ` (${notes})` : ""}.`;
			const resolve = (toast, success) => {
				this.resolve_repeat_save({ key: prompt.holderKey, effectKey: prompt.effectKey, success });
				this.$snotify.remove(toast.id);
			};

			this.promptToast("warning", prompt, body, title, {
				timeout: 0,
				buttons: [
					{
						text: "Roll",
						action: (toast) => {
							const entity = this.entities[prompt.holderKey];
							if (!entity) return this.$snotify.remove(toast.id);
							// The save's source is unknown: definitions don't say whether they're
							// magical, that comes with links to spells (effects plan steps 6–7)
							const { total, auto } = this.rollEffectCheck({
								entity,
								title: `${ability} save (${prompt.effectName})`,
								modifier: this.effectSaveModifier(entity, prompt.ability),
								advantage: prompt.advantage,
								roll: {
									kind: "save",
									ability: prompt.ability,
								},
							});
							// Automatic results resolve the save without a roll
							if (auto) return resolve(toast, auto === "success");
							// Without a DC the roll is only shown; the DM resolves it
							if (prompt.dc && total !== undefined) resolve(toast, total >= prompt.dc);
						},
						bold: true,
					},
					{ text: "Succeeded", action: (toast) => resolve(toast, true), bold: false },
					{ text: "Failed", action: (toast) => resolve(toast, false), bold: false },
				],
			});
		},
		/**
		 * Concentration save after damage: the DC from the damage, Roll / Succeeded / Failed.
		 * A failure ends Concentration (and what is linked to it).
		 */
		showConcentrationSave(prompt) {
			const ability = startCase(prompt.ability);
			const dc = prompt.dc !== undefined ? ` DC ${prompt.dc}` : "";
			// The title is short (toasts cut it off); the body has the DC and how it came about
			const title = `${prompt.holderName || "Unknown"}: ${prompt.effectName} save${dc}`;
			const body =
				prompt.dc !== undefined
					? [`Took ${prompt.damage} damage.`, `${ability} saving throw, DC ${prompt.dc}.`].join("\n")
					: [
							prompt.dcText || `Make a ${ability} saving throw or lose ${prompt.effectName}.`,
							`The damage isn't known, so the DC can't be worked out; Roll only shows the roll.`,
						].join("\n");
			const resolve = (toast, success) => {
				if (!success) {
					this.remove_effect({
						key: prompt.holderKey,
						effectKey: prompt.effectKey,
						reason: "failed its Concentration save",
					});
				}
				this.$snotify.remove(toast.id);
			};

			this.promptToast("warning", prompt, body, title, {
				timeout: 0,
				buttons: [
					{
						text: "Roll",
						action: (toast) => {
							const entity = this.entities[prompt.holderKey];
							if (!entity) return this.$snotify.remove(toast.id);
							const { total, auto } = this.rollEffectCheck({
								entity,
								title: `${ability} save (${prompt.effectName})`,
								modifier: this.effectSaveModifier(entity, prompt.ability),
								roll: { kind: "concentration", ability: prompt.ability },
							});
							// Automatic results resolve the save without a roll
							if (auto) return resolve(toast, auto === "success");
							// Without a DC the roll is only shown; the DM resolves it
							if (prompt.dc !== undefined && total !== undefined) resolve(toast, total >= prompt.dc);
						},
						bold: true,
					},
					{ text: "Succeeded", action: (toast) => resolve(toast, true), bold: false },
					{ text: "Failed", action: (toast) => resolve(toast, false), bold: false },
				],
			});
		},
		/**
		 * A creature is held at 1 hit point until it saves (Undead Fortitude): Roll / Succeeded /
		 * Failed. A failure drops it to 0, which fires "drops to 0 hit points".
		 */
		showDropToOne(prompt) {
			const ability = startCase(prompt.ability || "");
			const dc = prompt.dc !== undefined ? ` DC ${prompt.dc}` : "";
			const name = (prompt.holderName || "Unknown").capitalizeEach();
			const title = `${name}: ${prompt.effectName} save${dc}`;
			const body = [
				`Took ${prompt.damage} damage: at 1 hit point until the save.`,
				`${ability} saving throw${dc}. On a failure it drops to 0 hit points.`,
				prompt.description,
				...(prompt.notes || []),
			]
				.filter(Boolean)
				.join("\n");
			const resolve = async (toast, success) => {
				this.$snotify.remove(toast.id);
				if (success || !this.entities[prompt.holderKey]) return;
				await this.$store.dispatch("set_hp", { key: prompt.holderKey, newHp: 0 });
				await this.$store.dispatch("fire_trigger", { trigger: "on_zero_hp", entityKey: prompt.holderKey });
			};

			this.promptToast("warning", prompt, body, title, {
				timeout: 0,
				buttons: [
					{
						text: "Roll",
						action: (toast) => {
							const entity = this.entities[prompt.holderKey];
							if (!entity) return this.$snotify.remove(toast.id);
							const { total, auto } = this.rollEffectCheck({
								entity,
								title: `${ability} save (${prompt.effectName})`,
								modifier: this.effectSaveModifier(entity, prompt.ability),
								roll: { kind: "save", ability: prompt.ability },
							});
							// Automatic results resolve the save without a roll
							if (auto) return resolve(toast, auto === "success");
							// Without a DC the roll is only shown; the DM resolves it
							if (prompt.dc !== undefined && total !== undefined) resolve(toast, total >= prompt.dc);
						},
						bold: true,
					},
					{ text: "Succeeded", action: (toast) => resolve(toast, true), bold: false },
					{ text: "Failed", action: (toast) => resolve(toast, false), bold: false },
				],
			});
		},
		showOnExpire(prompt) {
			this.promptToast(
				"info",
				prompt,
				prompt.lines.join("\n"),
				`${prompt.holderName || "Unknown"}: ${prompt.effectName} ended`,
				{ timeout: 0, buttons: [...this.rollButtons(prompt), this.dismissButton()] }
			);
		},
		dismissButton() {
			return {
				text: "Dismiss",
				action: (toast) => this.$snotify.remove(toast.id),
				bold: false,
			};
		},
		showTempHp(prompt) {
			this.promptToast(
				"info",
				prompt,
				prompt.lines.join("\n"),
				`${prompt.holderName || "Unknown"}: ${prompt.effectName} — grant temporary hit points`,
				{ timeout: 0, buttons: [...this.tempHpButtons(prompt), this.dismissButton()] }
			);
		},
		/**
		 * Grant temp HP button for a prompt with temporary hit points
		 */
		tempHpButtons(prompt) {
			if (!this.effectTempHpParts(prompt).length) return [];
			return [
				{
					text: "Grant temp HP",
					action: (toast) => {
						this.grantEffectTempHp(prompt);
						this.$snotify.remove(toast.id);
					},
					bold: true,
				},
			];
		},
		/**
		 * Roll button for a prompt with damage or healing that can be rolled; opens the rolls in
		 * the roll dialog. The parts are checked again on click: a recipient may have left.
		 */
		rollButtons(prompt) {
			if (!this.effectPromptParts(prompt).length) return [];
			return [
				{
					text: "Roll",
					action: (toast) => {
						this.rollEffectParts(prompt);
						this.$snotify.remove(toast.id);
					},
					bold: true,
				},
			];
		},
		showTrigger(prompt) {
			const label = TRIGGER_LABELS[prompt.trigger] || prompt.trigger.replace(/_/g, " ");
			const title = `${prompt.holderName || "Unknown"}: ${prompt.effectName}, ${label}`;

			this.promptToast("info", prompt, prompt.lines.join("\n"), title, {
				timeout: 0,
				buttons: [
					...this.rollButtons(prompt),
					...this.tempHpButtons(prompt),
					{
						text: "Details",
						action: (toast) => {
							this.setDrawer({
								show: true,
								type: "drawers/encounter/effects/ActiveEffect",
								data: { entityKey: prompt.holderKey, effectKey: prompt.effectKey },
							});
							this.$snotify.remove(toast.id);
						},
						bold: false,
					},
					this.dismissButton(),
				],
			});
		},
		showNotice(prompt) {
			this.promptToast(
				"info",
				prompt,
				prompt.text || `${prompt.effectName} ended (${prompt.reason})`,
				prompt.holderName || "Effect ended",
				{ timeout: 4000, showProgressBar: false }
			);
		},
		/**
		 * An entity acted out of turn: offer Reaction Used (Apply / Dismiss).
		 * One open prompt per entity; more out-of-turn actions meanwhile show none.
		 */
		/**
		 * An effect's death outcome applies (Exhaustion 6): Mark dead (players and companions
		 * dead, NPCs 0 hit points) or Dismiss
		 */
		showDeath(prompt) {
			const name = (prompt.holderName || "Unknown").capitalizeEach();
			this.promptToast("warning", prompt, `${prompt.effectName}: the creature dies.`, `${name}: ${prompt.effectName} — dies`, {
				timeout: 0,
				buttons: [
					{
						text: "Mark dead",
						action: (toast) => {
							const entity = this.entities[prompt.holderKey];
							if (entity) this.markDead(prompt.holderKey, entity).catch((error) => console.error(error));
							this.$snotify.remove(toast.id);
						},
						bold: true,
					},
					this.dismissButton(),
				],
			});
		},
		/**
		 * Marks a creature dead: 0 hit points (no temporary hit points), and for players and
		 * companions also dead, so they show as dead like after three failed death saves
		 */
		async markDead(key, entity) {
			if (parseInt(entity.tempHp)) {
				await this.$store.dispatch("set_hp", { key, pool: "temp", newHp: 0 });
			}
			if (parseInt(entity.curHp) !== 0) {
				await this.$store.dispatch("set_hp", { key, newHp: 0 });
				// Dropping to 0 hit points: Concentration breaks, as for damage
				await this.$store.dispatch("fire_trigger", { trigger: "on_zero_hp", entityKey: key });
			}
			if (entity.entityType !== "npc") await this.$store.dispatch("set_dead", { key, action: "set" });
		},
		showReactionUsed(prompt) {
			const key = prompt.holderKey;
			if (this.openReactionPrompts[key]) return;

			const name = (prompt.holderName || "Unknown").capitalizeEach();
			const toast = this.promptToast(
				"info",
				prompt,
				"Acted outside its turn. Apply Reaction Used until the start of its next turn?",
				`${name}: Reaction used?`,
				{
					timeout: 0,
					buttons: [
						{
							text: "Apply",
							action: (toast) => {
								this.$store
									.dispatch("apply_reaction_used", { actorKey: key, turnKey: prompt.turnKey })
									.catch((error) => console.error(error));
								this.$snotify.remove(toast.id);
							},
							bold: true,
						},
						this.dismissButton(),
					],
				}
			);
			this.openReactionPrompts[key] = toast?.id || true;
			// Freed however the toast closes
			if (toast?.on) toast.on("destroyed", () => delete this.openReactionPrompts[key]);
			else delete this.openReactionPrompts[key];
		},
		showMaybe(prompt) {
			const title = `${prompt.holderName || "Unknown"}: ${prompt.effectName} may have ended`;
			const body = `Ends ${prompt.reason}, ${prompt.lines.join(", ")}.`;

			this.promptToast("warning", prompt, body, title, {
				timeout: 0,
				buttons: [
					{
						text: "Remove",
						action: (toast) => {
							// The DM's choice: a hand removal, so only its cascade is announced
							this.remove_effect({ key: prompt.holderKey, effectKey: prompt.effectKey });
							this.$snotify.remove(toast.id);
						},
						bold: false,
					},
					{
						text: "Keep",
						action: (toast) => this.$snotify.remove(toast.id),
						bold: false,
					},
				],
			});
		},
		showReview(prompt) {
			const effects = prompt.count === 1 ? "effect" : "effects";
			this.effectToast("info", {
				title: "Review effects",
				body: `${prompt.count} carried-over ${effects} from an earlier encounter may no longer apply.`,
				config: {
					timeout: 0,
					buttons: [
						{
							text: "Review",
							action: (toast) => {
								this.setDrawer({ show: true, type: "drawers/encounter/effects/CarriedOver" });
								this.$snotify.remove(toast.id);
							},
							bold: false,
						},
						this.dismissButton(),
					],
				},
			});
		},
	},
	render() {
		return null;
	},
};
</script>
