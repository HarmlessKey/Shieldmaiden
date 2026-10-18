<!-- EDIT PLAYER -->

<template>
	<div class="pb-5" v-if="entity && !demo">
		<h2 class="d-flex justify-content-between">
			<span>Edit {{ playerBase.character_name }}</span>
			<a v-if="!entity.transformed" @click="setTransform = !setTransform">
				<i aria-hidden="true" v-if="setTransform" class="fas fa-times red"></i>
				<i aria-hidden="true" v-else class="fas fa-paw-claws green"></i>
				<q-tooltip anchor="top middle" self="center middle"> Transform </q-tooltip>
			</a>
		</h2>

		<a v-if="entity.transformed" @click="removeTransform()" class="btn btn-block bg-red mb-3"
			>Remove transformation</a
		>

		<Transform v-if="setTransform" :data="entityKey" @close="closeTransform" />

		<template v-else>
			<!-- DEATH SAVING THROWS -->
			<template v-if="entity.curHp === 0 && !entity.stable && !entity.dead">
				<div class="px-1 my-3 d-flex justify-content-between">
					<div v-for="(n, index) in 5" :key="index">
						<template v-if="entity.saves && Object.keys(entity.saves).length === n">
							<a v-show="entity.saves[n] === 'succes'" class="green" @click="set_save(null, n)">
								<i aria-hidden="true" class="fas fa-check"></i>
								<q-tooltip anchor="top middle" self="center middle"> Change </q-tooltip>
							</a>
							<a v-show="entity.saves[n] === 'fail'" class="red" @click="set_save(null, n)">
								<i aria-hidden="true" class="fas fa-times"></i>
								<q-tooltip anchor="top middle" self="center middle"> Change </q-tooltip>
							</a>
						</template>
						<template v-else-if="entity.saves">
							<span v-show="entity.saves[n] === 'succes'" class="green"
								><i aria-hidden="true" class="fas fa-check"></i
							></span>
							<span v-show="entity.saves[n] === 'fail'" class="red"
								><i aria-hidden="true" class="fas fa-times"></i
							></span>
						</template>
						<span v-show="!entity.saves || !entity.saves[n]" class="neutral-2"
							><i aria-hidden="true" class="fas fa-dot-circle"></i
						></span>
					</div>
				</div>
				<div
					v-if="!entity.saves || Object.keys(entity.saves).length < 5"
					class="d-flex justify-content-between"
				>
					<button
						class="btn save bg-green"
						@click="set_save('succes', !entity.saves ? 0 : Object.keys(entity.saves).length)"
					>
						<i aria-hidden="true" class="fas fa-check"></i>
					</button>
					<button
						class="btn save bg-red"
						@click="set_save('fail', !entity.saves ? 0 : Object.keys(entity.saves).length)"
					>
						<i aria-hidden="true" class="fas fa-times"></i>
					</button>
				</div>
				<a v-if="death_fails >= 3" class="btn btn-block bg-red my-3" @click="kill()"
					><i aria-hidden="true" class="fas fa-skull"></i> Player died</a
				>
				<a class="btn btn-block my-3" @click="stabilize()"
					><i aria-hidden="true" class="fas fa-heartbeat"></i> Stabilize</a
				>
			</template>
			<a v-else-if="entity.dead" class="btn bg-green btn-block my-3" @click="revive()"
				><i aria-hidden="true" class="fas fa-hand-holding-magic"></i> Revive</a
			>

			<!-- DAMAGE AND HEALING, with the effects of the run campaign screen -->
			<template v-if="data.context">
				<h2>Damage and healing</h2>
				<PlayerHealth
					inline
					:campaign-id="campaignId"
					:player-id="entityKey"
					:context="data.context"
					class="mb-3"
					@done="syncHp"
				/>
				<hr />
			</template>

			<!-- EDIT PLAYER -->
			<ValidationObserver v-slot="{ handleSubmit }">
				<q-form @submit="handleSubmit(edit)">
					<ValidationProvider
						v-if="location == 'encounter'"
						rules="between:0,99|required"
						name="Initiative"
						v-slot="{ errors, invalid, validated }"
					>
						<q-input
							:dark="$store.getters.theme === 'dark'"
							filled
							square
							label="initiative"
							type="number"
							min="0"
							max="99"
							v-model="initiative"
							v-validate="'required'"
							:error="invalid && validated"
							:error-message="errors[0]"
						/>
					</ValidationProvider>

					<h2>Temporary</h2>
					<ValidationProvider
						rules="between:0,999"
						name="Temp HP"
						v-slot="{ errors, invalid, validated }"
					>
						<q-input
							:dark="$store.getters.theme === 'dark'"
							filled
							square
							label="Temp HP"
							type="number"
							name="tempHp"
							v-model="entity.tempHp"
							clearable
							no-error-icon
							:error="invalid && validated"
							:error-message="errors[0]"
						/>
					</ValidationProvider>

					<!-- MANUAL BONUSES, as the tracker's bonuses drawer -->
					<h3 class="mt-2 mb-1">Add a bonus</h3>
					<BonusAddForm :stats="bonusStats" class="mb-2" @add="addBonus" />
					<template v-for="stat in bonusStats">
						<h3 :key="`${stat}-title`" class="mt-2 mb-1">{{ bonusLabel(stat) }} bonuses</h3>
						<ManualBonusRows
							:key="`${stat}-rows`"
							:bonuses="bonusRows(stat)"
							@update="updateBonus(stat, $event)"
							@remove="removeBonus(stat, $event)"
						/>
					</template>

					<hr />
					<h2 class="mb-0">Override</h2>
					<div class="row q-col-gutter-md my-2">
						<div class="col">
							<ValidationProvider
								rules="min_value:0|required"
								name="Current HP"
								v-slot="{ errors, invalid, validated }"
							>
								<q-input
									v-if="entity.transformed"
									:dark="$store.getters.theme === 'dark'"
									filled
									square
									label="Cur HP"
									type="number"
									class="text-center"
									min="0"
									v-model="entity.transformed.curHp"
									placeholder="Current Hit Points"
									:error="invalid && validated"
									:error-message="errors[0]"
								>
									<q-icon slot="prepend" name="fas fa-paw-claws green">
										<q-tooltip anchor="top middle" self="center middle"> Transformed </q-tooltip>
									</q-icon>
								</q-input>
								<q-input
									v-else
									:dark="$store.getters.theme === 'dark'"
									filled
									square
									label="Cur HP"
									class="text-center"
									type="number"
									min="0"
									v-model="entity.curHp"
									:error="invalid && validated"
									:error-message="errors[0]"
								/>
							</ValidationProvider>
						</div>

						<div class="col">
							<ValidationProvider
								rules="between:1,9999|required"
								name="Max HP"
								v-slot="{ errors, invalid, validated }"
							>
								<q-input
									v-if="entity.transformed"
									:dark="$store.getters.theme === 'dark'"
									filled
									square
									label="Max HP"
									class="text-center"
									type="number"
									min="1"
									max="9999"
									v-model="entity.transformed.maxHp"
									:error="invalid && validated"
									:error-message="errors[0]"
								>
									<q-icon slot="prepend" name="fas fa-paw-claws green">
										<q-tooltip anchor="top middle" self="center middle"> Transformed </q-tooltip>
									</q-icon>
								</q-input>
								<q-input
									v-else
									:dark="$store.getters.theme === 'dark'"
									filled
									square
									label="Max HP"
									class="text-center"
									type="number"
									min="1"
									max="9999"
									v-model="playerBase.maxHp"
									:error="invalid && validated"
									:error-message="errors[0]"
								/>
							</ValidationProvider>
						</div>
					</div>
					<div class="row q-col-gutter-md">
						<div class="col">
							<ValidationProvider
								rules="between:1,99|required"
								name="Armor class"
								v-slot="{ errors, invalid, validated }"
							>
								<q-input
									v-if="entity.transformed"
									:dark="$store.getters.theme === 'dark'"
									filled
									square
									label="Armor class"
									class="text-center"
									type="number"
									min="1"
									max="99"
									v-model="entity.transformed.ac"
									:error="invalid && validated"
									:error-message="errors[0]"
								>
									<q-icon slot="prepend" name="fas fa-paw-claws green">
										<q-tooltip anchor="top middle" self="center middle"> Transformed </q-tooltip>
									</q-icon>
								</q-input>
								<q-input
									v-else
									:dark="$store.getters.theme === 'dark'"
									filled
									square
									label="Armor class"
									class="text-center"
									type="number"
									name="ac"
									min="1"
									max="99"
									v-model="playerBase.ac"
									placeholder="Armor Class"
									:error="invalid && validated"
									:error-message="errors[0]"
								/>
							</ValidationProvider>
						</div>
						<div class="col">
							<ValidationProvider
								:rules="
									isXpAdvancement() ? 'numeric|between:1,20' : 'required|numeric|between:1,20'
								"
								name="Level"
								v-slot="{ errors, invalid, validated }"
							>
								<q-input
									:dark="$store.getters.theme === 'dark'"
									filled
									square
									label="Level"
									class="text-center"
									type="number"
									min="1"
									max="20"
									v-model="playerBase.level"
									:clearable="isXpAdvancement()"
									:error="invalid && validated"
									:error-message="errors[0]"
								>
									<span slot="append" v-if="isXpAdvancement()" :class="{ red: playerBase.level }">
										{{ calculatedLevel(playerBase.experience) }}
										<q-tooltip anchor="top left" self="center left"> Level based on XP </q-tooltip>
									</span>
								</q-input>
							</ValidationProvider>
						</div>
					</div>

					<q-btn no-caps label="Save" class="full-width" color="primary" type="submit" />
				</q-form>
			</ValidationObserver>
			<div v-if="isXpAdvancement() && playerBase.experience !== undefined" class="pt-2">
				<hr />
				<h2>Experience Points</h2>
				<h2 class="text-center xp">
					<hk-animated-integer :value="playerBase.experience" />
				</h2>

				<div class="level">
					<div class="current">{{ calculatedLevel(playerBase.experience) }}</div>
					<q-linear-progress
						size="25px"
						:value="levelAdvancement(playerBase.experience)"
						color="primary"
					>
						<div class="absolute-full flex flex-center">
							<div class="white">
								{{ Math.floor(levelAdvancement(playerBase.experience) * 100) }}%
							</div>
						</div>
					</q-linear-progress>
					<div class="next" v-if="calculatedLevel(playerBase.experience) < 20">
						{{ calculatedLevel(playerBase.experience) + 1 }}
					</div>
				</div>

				<q-input
					:dark="$store.getters.theme === 'dark'"
					square
					filled
					class="text-center"
					type="number"
					name="xp"
					v-model="xp"
					label="Award XP"
				/>

				<button class="btn btn-block my-3" @click="addXp()">Award {{ xp }} XP</button>
			</div>
		</template>
	</div>
	<div v-else-if="demo">
		<h2>Edit Player</h2>
		<p>
			In the demo you can't edit players. Sign up to get access to all the features our app has to
			offer, like creating players and monsters and of course your own encounters.
		</p>

		<router-link to="/sign-up" class="btn btn-block btn-lg bg-green">Create Account</router-link>
	</div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import { experience } from "src/mixins/experience.js";
import Transform from "./party/Transform.vue";
import PlayerHealth from "src/components/campaign/PlayerHealth.vue";
import BonusAddForm from "src/components/bonuses/BonusAddForm.vue";
import ManualBonusRows from "src/components/bonuses/ManualBonusRows.vue";
import { effectiveStats } from "src/utils/effectFunctions";
import {
	campaignEntities,
	hpAfterMaxHpChange,
	manualBonuses,
	withBonus,
	withoutBonus,
	BONUS_LABELS,
} from "src/utils/entityFunctions";

/**
 * data: { key, location, context? }; with context (from the run campaign screen: basePlayers,
 * definitionOf) the drawer has damage and healing with the player's effects
 */
export default {
	name: "EditPlayer",
	mixins: [experience],
	components: {
		Transform,
		PlayerHealth,
		BonusAddForm,
		ManualBonusRows,
	},
	props: ["data"],
	data() {
		return {
			demo: this.$route.name === "Demo",
			userId: this.$store.getters.user.uid,
			campaignId: this.$route.params.campid,
			encounterId: this.$route.params.encid,
			entityKey: this.data.key,
			location: this.data.location,
			entity: {},
			playerBase: {},
			// The manual bonuses, saved as they change: { <stat>: { <id>: { value, label } } }
			bonuses: {},
			// Current and base maximum hit points as saved, to tell what the Override changed
			savedHp: { curHp: 0, maxHp: 0 },
			xp: undefined,
			setTransform: false,
			advancement: undefined,
			initiative: 0,
		};
	},
	async mounted() {
		await this.get_campaign({ uid: this.userId, id: this.campaignId }).then((result) => {
			const entity = result.players[this.entityKey];
			this.entity = { ...entity };
			this.bonuses = manualBonuses(entity);
			this.advancement = result.advancement;
			this.savedHp.curHp = parseInt(entity.curHp) || 0;
		});

		await this.get_player({ uid: this.userId, id: this.entityKey }).then((result) => {
			this.playerBase = result;
			this.savedHp.maxHp = parseInt(result.maxHp) || 0;
			if (this.isXpAdvancement() && this.playerBase.experience === undefined) {
				this.set_player_prop({
					uid: this.userId,
					id: this.entityKey,
					property: "experience",
					value: 0,
				});
			}
		});

		// Get the initiative of the player when in an encounter
		if (this.location === "encounter") {
			await this.get_encounter({
				uid: this.userId,
				campaignId: this.campaignId,
				id: this.encounterId,
			}).then((result) => {
				this.initiative = result.entities[this.entityKey].initiative;
			});
		}
	},
	computed: {
		...mapGetters(["broadcast"]),
		share() {
			return (this.broadcast.shares && this.broadcast.shares.includes("xp")) || false;
		},
		// A transformed player's maximum is the beast's: only its AC bonuses apply
		bonusStats() {
			return this.entity.transformed ? ["ac"] : ["ac", "max_hp"];
		},
		death_fails() {
			let fails = 0;
			for (let key in this.entity.saves) {
				if (this.entity.saves[key] === "fail") {
					fails++;
				}
			}
			return fails;
		},
	},
	methods: {
		bonusLabel(stat) {
			return BONUS_LABELS[stat] || stat;
		},
		bonusRows(stat) {
			return Object.entries(this.bonuses[stat] || {}).map(([id, bonus]) => ({ id, ...bonus }));
		},
		addBonus({ stat, amount, label }) {
			this.saveBonuses(withBonus({ bonuses: this.bonuses }, stat, { amount, label }));
		},
		updateBonus(stat, { bonus, amount, label }) {
			this.saveBonuses(withBonus({ bonuses: this.bonuses }, stat, { id: bonus.id, amount, label }));
		},
		removeBonus(stat, bonus) {
			this.saveBonuses(withoutBonus({ bonuses: this.bonuses }, stat, bonus.id));
		},
		/**
		 * Saves the bonuses at once, as the tracker's bonuses drawer: a raised maximum heals and
		 * hit points stay within the maximum (campaigns/save_campaign_bonuses)
		 */
		async saveBonuses(bonuses) {
			this.bonuses = bonuses;
			await this.save_campaign_bonuses({
				campaignId: this.campaignId,
				playerId: this.entityKey,
				bonuses,
				context: this.data.context,
			});
			await this.syncHp();
		},
		/**
		 * After damage, healing or a bonus change: the player's hit points and bonuses as saved,
		 * so Save doesn't undo them
		 */
		async syncHp() {
			const campaign = await this.get_campaign({ uid: this.userId, id: this.campaignId });
			const saved = campaign.players?.[this.entityKey] || {};
			this.bonuses = manualBonuses(saved);
			for (const property of [
				"curHp",
				"tempHp",
				"transformed",
				"dead",
				"stable",
				"saves",
				"bonuses",
				"ac_bonus",
				"maxHpMod",
			]) {
				if (saved[property] === undefined) this.$delete(this.entity, property);
				else this.$set(this.entity, property, JSON.parse(JSON.stringify(saved[property])));
			}
			this.savedHp.curHp = parseInt(saved.curHp) || 0;
		},
		/**
		 * The player's maximum hit points with its effects and manual bonuses, for a base maximum,
		 * as the run campaign screen shows it (effectiveStats)
		 */
		effectiveMaxHp(baseMax) {
			const players = {
				...(this.$store.state.campaigns.cached_campaigns[this.userId]?.[this.campaignId]?.players || {}),
				[this.entityKey]: this.entity,
			};
			const basePlayers = {
				...(this.data.context?.basePlayers || {}),
				[this.entityKey]: { ...this.playerBase, maxHp: baseMax },
			};
			const entities = campaignEntities(players, basePlayers);
			const { values } = effectiveStats({
				entity: entities[this.entityKey],
				holderKey: this.entityKey,
				entities,
				definitionOf: this.data.context?.definitionOf,
			});
			return parseInt(values.maxHp ?? baseMax) || 0;
		},
		...mapActions(["setDrawer", "edit_player"]),
		...mapActions("players", ["get_player", "edit_player", "set_player_prop"]),
		...mapActions("campaigns", [
			"get_campaign",
			"stabilize_entity",
			"kill_entity",
			"revive_entity",
			"update_campaign_entity",
			"edit_campaign_player",
			"save_campaign_bonuses",
			"set_share",
			"set_death_save",
		]),
		addXp() {
			if (this.xp) {
				let newXp = parseInt(this.playerBase.experience) + parseInt(this.xp);

				if (newXp < 0) {
					newXp = 0;
				}
				if (newXp > 355000) {
					newXp = 355000;
				}

				if (this.share) {
					const key = Date.now() + Math.random().toString(36).substring(4);
					let share = {
						key,
						type: "xp",
						notification: {
							amount: this.xp,
							targets: [this.entityKey],
						},
					};
					if (this.$route.name === "RunEncounter") share.encounter_id = this.encounterId;
					this.set_share({ id: this.broadcast.live, share });
				}
				this.set_player_prop({
					uid: this.userId,
					id: this.entityKey,
					property: "experience",
					value: newXp,
				});
				this.xp = undefined;
			}
		},
		isXpAdvancement() {
			return this.advancement !== "milestone";
		},
		async set_save(value, index) {
			index = value ? index + 1 : index;
			await this.set_death_save({
				campaignId: this.campaignId,
				type: "players",
				id: this.entityKey,
				index,
				value,
			});
			// The drawer's copy too: the next save counts the ones made (and Save keeps them)
			const saves = { ...(this.entity.saves || {}) };
			if (value) saves[index] = value;
			else delete saves[index];
			this.$set(this.entity, "saves", saves);
		},
		closeTransform(beast) {
			this.entity.transformed = beast;
			this.setTransform = false;
		},
		removeTransform() {
			this.update_campaign_entity({
				uid: this.userId,
				campaignId: this.campaignId,
				type: "players",
				id: this.entityKey,
				property: "transformed",
				value: null,
			});
			this.entity.transformed = null;
		},
		// Stabilize, death and revive: the drawer re-reads the player, so it shows the new state
		// and Save doesn't undo it
		async stabilize() {
			await this.stabilize_entity({
				uid: this.userId,
				campaignId: this.campaignId,
				type: "players",
				id: this.entityKey,
			});
			await this.syncHp();
		},
		async kill() {
			await this.kill_entity({
				uid: this.userId,
				campaignId: this.campaignId,
				type: "players",
				id: this.entityKey,
			});
			await this.syncHp();
		},
		async revive() {
			await this.revive_entity({
				uid: this.userId,
				campaignId: this.campaignId,
				type: "players",
				id: this.entityKey,
				curHp: 1,
			});
			await this.syncHp();
		},
		edit() {
			if (this.location === "encounter") {
				this.initiative = Number(this.initiative);
			}

			//Parse to INT
			this.entity.tempHp = this.entity.tempHp ? parseInt(this.entity.tempHp) : 0;
			this.playerBase.ac = parseInt(this.playerBase.ac);
			this.playerBase.maxHp = parseInt(this.playerBase.maxHp);
			this.entity.curHp = parseInt(this.entity.curHp);

			// The manual bonuses are saved as they change (saveBonuses); the entity has them as saved.
			// Current hit points against the maximum with bonuses and effects: a typed value stays
			// within it; otherwise they follow a changed base maximum (up with it, or down to it)
			const newMax = this.effectiveMaxHp(this.playerBase.maxHp);
			if (this.entity.curHp !== this.savedHp.curHp) {
				this.entity.curHp = Math.min(this.entity.curHp, newMax);
			} else {
				const oldMax = this.effectiveMaxHp(this.savedHp.maxHp);
				this.entity.curHp = hpAfterMaxHpChange(this.entity.curHp, oldMax, newMax);
			}
			if (this.entity.transformed) {
				if (this.entity.transformed.curHp > this.entity.transformed.maxHp) {
					this.entity.transformed.curHp = this.entity.transformed.maxHp;
				}
				if (this.entity.transformed.curHp <= 0) {
					this.$delete(this.entity, "transformed");
				}
			}

			// Update the player in the campaign
			this.edit_campaign_player({
				id: this.campaignId,
				playerId: this.entityKey,
				player: this.entity,
			});
			// Update the player
			this.edit_player({
				uid: this.userId,
				id: this.entityKey,
				player: this.playerBase,
			});

			//If the new curHp > 0, revive a player and set the new curHp
			if (this.entity.curHp > 0) {
				this.revive_entity({
					uid: this.userId,
					campaignId: this.campaignId,
					type: "players",
					id: this.entityKey,
					curHp: this.entity.curHp,
				});
			}

			this.setDrawer(false);
		},
	},
};
</script>

<style lang="scss" scoped>
label {
	font-size: 12px;
}
h2.xp {
	font-weight: bold;
	font-size: 28px;
}
.level {
	display: grid;
	grid-template-columns: 25px auto 25px;
	height: 25px;
	line-height: 25px;
	margin-bottom: 20px;

	.next {
		text-align: right;
	}
	.q-linear-progress {
		font-size: 15px !important;
		height: 25px;
	}
}
.btn.save {
	width: 49.5%;
}
</style>
