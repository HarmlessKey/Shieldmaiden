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
 * Renders nothing; mounted once in RunEncounter.
 */
export default {
	name: "EffectTriggerNotifier",
	mixins: [effectRolls],
	computed: {
		...mapGetters(["effect_prompts", "entities"]),
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

			this.$snotify.warning(body, title, {
				timeout: 0,
				buttons: [
					{
						text: "Roll",
						action: (toast) => {
							const entity = this.entities[prompt.holderKey];
							if (!entity) return this.$snotify.remove(toast.id);
							const total = this.rollEffectCheck({
								entity,
								title: `${ability} save (${prompt.effectName})`,
								modifier: this.effectSaveModifier(entity, prompt.ability),
								advantage: prompt.advantage,
							});
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
		showOnExpire(prompt) {
			this.$snotify.info(
				prompt.lines.join("\n"),
				`${prompt.holderName || "Unknown"}: ${prompt.effectName} ended`,
				{ timeout: 0, buttons: [this.dismissButton()] }
			);
		},
		dismissButton() {
			return {
				text: "Dismiss",
				action: (toast) => this.$snotify.remove(toast.id),
				bold: false,
			};
		},
		showTrigger(prompt) {
			const label = TRIGGER_LABELS[prompt.trigger] || prompt.trigger.replace(/_/g, " ");
			const title = `${prompt.holderName || "Unknown"}: ${prompt.effectName}, ${label}`;

			this.$snotify.info(prompt.lines.join("\n"), title, {
				timeout: 0,
				buttons: [
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
			this.$snotify.info(
				prompt.text || `${prompt.effectName} ended (${prompt.reason})`,
				prompt.holderName || "Effect ended",
				{ timeout: 4000, showProgressBar: false }
			);
		},
		showMaybe(prompt) {
			const title = `${prompt.holderName || "Unknown"}: ${prompt.effectName} may have ended`;
			const body = `Ends ${prompt.reason}, ${prompt.lines.join(", ")}.`;

			this.$snotify.warning(body, title, {
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
			this.$snotify.info(
				`${prompt.count} carried-over ${effects} from an earlier encounter may no longer apply.`,
				"Review effects",
				{
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
				}
			);
		},
	},
	render() {
		return null;
	},
};
</script>
