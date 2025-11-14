<template>
	<div v-if="!loading">
		<template v-for="level in levels">
			<q-list
				v-if="spellsForLevel(level)?.length"
				:key="level"
				:dark="$store.getters.theme === 'dark'"
				square
				class="accordion"
			>
				<q-item class="p-2 bg-neutral-6">
					<q-item-section v-if="level === 0 || level === Infinity">
						<strong>
							{{ type === "caster" ? "Cantrips" : "At will" }}
						</strong>
					</q-item-section>
					<div
						v-else-if="type === 'caster'"
						class="d-flex justify-content-between items-center full-width"
					>
						<strong>{{ level | numeral("Oo") }} level</strong>
						<div class="slots">
							<span
								v-for="i in actor[`${type}_spell_slots`][level]"
								:key="`slot-${i}`"
								class="ml-1"
								@click="
									actor.limited_uses[type] && actor.limited_uses[type][level] >= i
										? useSpellSlot(level, type, true)
										: useSpellSlot(level, type)
								"
							>
								<i
									aria-hidden="true"
									class="far"
									:class="
										actor.limited_uses[type] && actor.limited_uses[type][level] >= i
											? 'fa-dot-circle'
											: 'fa-circle'
									"
								/>
								<q-tooltip anchor="top middle" self="center middle">
									{{
										actor.limited_uses[type] && actor.limited_uses[type][level] >= i
											? "Regain slot"
											: "Spend slot"
									}}
								</q-tooltip>
							</span>
						</div>
					</div>
					<q-item-section v-else>
						<strong>{{ level }} each</strong>
					</q-item-section>
				</q-item>
				<q-expansion-item
					v-for="spell in spellsForLevel(level)"
					:key="`${level}-${spell.key}`"
					:dark="$store.getters.theme === 'dark'"
					switch-toggle-side
					expand-icon-class="hidden-toggle"
					@show="showSpell = `${level}-${spell.key}`"
					:group="type"
					:name="type"
					@focus="focusButton(level, spell.key)"
				>
					<template v-slot:header>
						<q-item-section :class="checkAvailable(level, spell.key) ? '' : 'is-disabled'">
							<q-item-label>
								{{ spell.name.capitalizeEach() }}
							</q-item-label>
						</q-item-section>
						<q-item-section avatar v-if="type === 'caster'">
							<hk-roll-action
								v-if="spell.actions && spell.actions.length"
								:ref="`${level}-${spell.key}`"
								:action="spell"
								:tooltip="`Roll ${spell.name}`"
								type="spell"
								color="yellow"
								:cast-level="level"
								:caster-level="actor[`${type}_level`]"
								:disabled="!checkAvailable(level, spell.key)"
								@roll="startRoll(...arguments, level, spell, type)"
							/>
							<a
								v-else-if="checkAvailable(level, spell.key) && level > 0"
								class="neutral-1"
								@click.stop="useSpellSlot(level, type)"
							>
								Cast
							</a>
						</q-item-section>
						<q-item-section
							v-else
							class="d-flex flex-row items-center gap-1 justify-content-start"
							avatar
						>
							<span v-if="level < Infinity" class="slots">
								<span
									v-for="i in level"
									:key="`limited-${i}`"
									class="ml-1"
									@click.stop="
										actor.limited_uses[type] && actor.limited_uses[type][spell.key] >= i
											? useSpellSlot(spell.key, type, true)
											: useSpellSlot(spell.key, type)
									"
								>
									<i
										aria-hidden="true"
										class="far"
										:class="
											actor.limited_uses[type] && actor.limited_uses[type][spell.key] >= i
												? 'fa-dot-circle'
												: 'fa-circle'
										"
									/>
									<q-tooltip anchor="top middle" self="center middle">
										{{
											actor.limited_uses[type] && actor.limited_uses[type][spell.key] >= i
												? "Regain"
												: "Spend"
										}}
									</q-tooltip>
								</span>
							</span>
							<hk-roll-action
								v-if="spell.actions && spell.actions.length"
								:ref="`${level}-${spell.key}`"
								:action="spell"
								:tooltip="`Roll ${spell.name}`"
								type="spell"
								color="yellow"
								:disabled="!checkAvailable(level, spell.key)"
								@roll="startRoll(...arguments, spell.key, spell, type)"
							/>
						</q-item-section>
					</template>
					<div class="accordion-body description p-2">
						<Spell :data="spell" :title="false" v-if="showSpell === `${level}-${spell.key}`" />
					</div>
				</q-expansion-item>
			</q-list>
		</template>
		<q-dialog v-model="projectile_dialog">
			<Projectiles :projectile-count="rollObject.projectiles" @cancel="cancelRoll" @roll="roll" />
		</q-dialog>
	</div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import { setHP } from "src/mixins/HpManipulations.js";
import { runEncounter } from "src/mixins/runEncounter.js";
import Spell from "src/components/compendium/Spell";
import Projectiles from "./Projectiles";

export default {
	name: "RollSpell",
	mixins: [setHP, runEncounter],
	components: {
		Spell,
		Projectiles,
	},
	props: {
		actor: {
			type: Object,
			required: true,
		},
		type: {
			type: String,
			default: "caster",
		},
		levels: {
			type: Array,
			default: () => [0],
		},
		rollsOnly: {
			type: Boolean,
			default: false,
		},
	},
	data() {
		return {
			spells: {},
			loading: true,
			showSpell: undefined,
			rollObject: {},
			projectile_dialog: false,
		};
	},
	computed: {
		...mapGetters(["targeted", "demo"]),
		...mapGetters("tutorial", ["follow_tutorial", "get_step"]),
	},
	methods: {
		...mapActions(["set_limitedUses"]),
		...mapActions("tutorial", ["completeStep"]),
		...mapActions("api_spells", ["fetch_api_spell"]),
		...mapActions("spells", ["get_spell"]),
		focusButton(level, key) {
			const button = this.$refs[`${level}-${key}`]?.[0]?.$el;
			button?.focus();
		},
		async fetchSpells() {
			let spells = [];

			if (this.actor[`${this.type}_spells`]) {
				spells = await Promise.all(
					Object.entries(this.actor[`${this.type}_spells`]).map(async ([key, value]) => {
						const spell = value.custom
							? // userId comes from setHP mixin
								await this.get_spell({ uid: this.userId, id: key })
							: await this.fetch_api_spell(key);
						spell.key = key;

						if (this.type === "innate") {
							spell.limit = value.limit == 0 ? Infinity : value.limit;
						} else {
							spell.level = value.level;
						}
						return spell;
					})
				);
			}
			return spells?.filter((spell) => {
				return !this.rollsOnly || spell.actions?.some((action) => action.rolls?.length);
			});
		},
		spellsForLevel(level) {
			if (this.spells) {
				if (this.type === "caster") {
					return this.spells.filter((spell) => {
						if (level === 0) {
							return spell.level == level;
						} else {
							return spell.level > 0 && spell.level <= level;
						}
					});
				} else {
					return this.spells.filter((spell) => spell.limit == level);
				}
			}
			return [];
		},
		checkAvailable(level, key) {
			if (this.type === "caster") {
				return (
					!this.actor.limited_uses ||
					!this.actor.limited_uses[this.type] ||
					!this.actor.limited_uses[this.type][level] ||
					this.actor.limited_uses[this.type][level] < this.actor[`${this.type}_spell_slots`][level]
				);
			} else {
				return (
					!this.actor.limited_uses ||
					!this.actor.limited_uses[this.type] ||
					!this.actor.limited_uses[this.type][key] ||
					this.actor.limited_uses[this.type][key] < level
				);
			}
		},
		startRoll(e, projectiles, option, level, spell, category) {
			if (this.targeted && this.targeted.length) {
				this.rollObject = {
					e,
					projectiles,
					option,
					level,
					spell,
					category,
				};
				if (projectiles && projectiles > 1) {
					this.projectile_dialog = true;
				} else {
					this.roll();
				}
			} else {
				this.$q.notify({
					message: "Select a target first.",
					color: "warning",
					position: "top",
					timeout: 1000,
				});
			}
		},
		roll(assigned_projectiles) {
			const action = {
				e: this.rollObject.e,
				action_index: this.rollObject.level,
				action: this.rollObject.spell,
				category: this.rollObject.category,
				entity: this.actor,
				targets: assigned_projectiles || this.targeted,
				option: this.rollObject.option,
			};
			this.roll_action(action);
			this.$emit("roll", action);
			this.cancelRoll();
		},
		cancelRoll() {
			this.projectile_dialog = false;
			this.rollObject = {};
		},
		useSpellSlot(index, category, regain = false) {
			this.set_limitedUses({
				key: this.actor.key,
				index,
				category,
				regain,
			});
		},
	},
	async mounted() {
		this.spells = await this.fetchSpells();
		this.loading = false;
	},
};
</script>
