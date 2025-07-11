<template>
	<div class="log-item">
		<!-- Metadata -->
		<div class="head">
			<span>Round: {{ item.round }} Turn: {{ item.turn }}</span>
			<slot />
		</div>

		<!-- TOTAL -->
		<div class="d-flex justify-between items-center">
			<div>
				<strong :class="{ green: item.type == 'healing', red: item.type == 'damage' }">
					{{ item.amount }} {{ item.type }}
				</strong>

				<!-- OVER -->
				<span v-if="item.over > 0" class="neutral-2">
					- {{ item.over }} {{ item.type === "damage" ? "overkill" : "overhealing" }}
				</span>
			</div>
			<small v-if="item.multiplier && item.multiplier !== 1" class="neutral-2"
				><strong>
					{{ item.multiplier === 0.5 ? "HALVED" : "DOUBLED" }}
				</strong></small
			>
		</div>

		<!-- ACTIONS -->
		<div v-if="item.actions">
			<span v-for="(action, index) in item.actions" :key="`action-${index}`">
				<!-- Manual -->
				<span v-if="(action.manual || action.request) && action.type === 'damage'">
					<strong>{{ item.by_name.capitalizeEach() }}s</strong> {{ item.ability }} did
				</span>

				<!-- To hit -->
				<span v-else-if="action.hitOrMiss">
					<strong no-whitespace>
						<span>{{ item.by_name.capitalizeEach() }}</span>
						<span>{{ item.ability ? `s ${item.ability}` : `` }}</span>
					</strong>
					<span :class="action.crit ? 'blue' : action.hitOrMiss === 'hit' ? 'green' : 'red'">
						{{ action.crit ? "Critted" : action.hitOrMiss === "hit" ? "hit" : "missed" }}
					</span>
					<strong>{{ item.target_name.capitalizeEach() }}</strong> for
				</span>

				<!-- Saving throw -->
				<span v-else-if="action.savingThrowResult">
					<strong>{{ item.target_name.capitalizeEach() }}</strong> had a
					<span :class="action.savingThrowResult === 'save' ? 'green' : 'red'">
						{{ action.savingThrowResult === "save" ? "successful" : "failed" }}
					</span>
					save {{ item.ability ? `on ${item.ability}` : `` }} and took
				</span>

				<!-- Healing -->
				<span v-else-if="action.type === 'healing'">
					<strong>{{ item.by_name.capitalizeEach() }}s</strong> {{ item.ability }} healed
					<strong>{{ item.target_name.capitalizeEach() }}</strong> for
				</span>

				<!-- Damage rolls with no to hit or save -->
				<span v-else>
					<strong>{{ item.by_name.capitalizeEach() }}</strong
					>{{ item.ability ? `s ${item.ability}` : `` }} damaged
					<strong>{{ item.target_name.capitalizeEach() }}</strong> for
				</span>

				<!-- Rolls -->
				<span v-for="(roll, roll_index) in action.rolls" :key="`roll-${index}-${roll_index}`">
					<span
						:class="
							action.type === 'healing' ? 'green' : roll.damage_type ? roll.damage_type : 'red'
						"
					>
						<strong>{{ roll.value }}</strong>
						{{ action.type !== "healing" ? roll.damage_type : "" }}
					</span>
					{{
						// eslint-disable-next-line vue/no-parsing-error
						roll_index + 1 < action.rolls.length
							? "and"
							: action.type !== "healing"
								? "damage"
								: "healing"
					}}
				</span>

				<!-- MANUAL END -->
				<span v-if="(action.manual || action.request) && action.type === 'damage'">
					to <strong>{{ item.target_name.capitalizeEach() }}</strong>
				</span>
			</span>
		</div>

		<!-- UNDO -->
		<!-- <div class="undo" v-if="key == 0 && !encounter.finished">
			<a
				class="btn btn-sm bg-red"
				@click="undo(key, item.amount, item.over, item.target, item.by, item.type)"
				v-shortkey="['ctrl', 'z']"
				@shortkey="undo(key, item.amount, item.over, item.target, item.by, item.type)"
			>
				Undo
				<hk-show-keybind :binds="['ctrl', 'z']" />
			</a>
		</div> -->
	</div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
	name: "LogItem",
	props: {
		item: {
			type: Object,
			required: true,
		},
	},
	data() {
		return {
			userId: this.$store.getters.user ? this.$store.getters.user.uid : undefined,
			environment: {
				key: "environment",
			},
		};
	},
	computed: {
		...mapGetters(["encounter", "entities"]),
	},
};
</script>

<style lang="scss" scoped>
.log-item {
	position: relative;

	.head {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 11px;
		margin-bottom: 5px;
		font-style: italic;
	}
	font-size: 12px;
}
</style>
