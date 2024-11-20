<template>
	<div class="combat-log" :class="{ pointer: log?.length > 1 }">
		<template v-if="log.length">
			<LogItem :item="last_item">
				<button
					class="btn btn-xs bg-neutral-5"
					v-shortkey="['ctrl', 'z']"
					@shortkey="undo"
					@click.stop="undo"
				>
					<hk-icon icon="fas fa-undo-alt" />
				</button>
			</LogItem>
			<q-popup-proxy
				v-if="combat_log?.length"
				:dark="$store.getters.theme === 'dark'"
				anchor="bottom end"
				self="top right"
				fit
				transition-show="jump-down"
				transition-hide="jump-up"
				max-width="300px"
				:breakpoint="576"
				:offset="[0, 1]"
			>
				<div class="p-3 d-flex flex-col gap-2">
					<LogItem v-for="(item, i) in combat_log" :key="`item-${i}`" :item="item" />
				</div>
			</q-popup-proxy>
		</template>
	</div>
</template>

<script>
import { mapGetters } from "vuex";
import LogItem from "./LogItem.vue";
import { setHP } from "src/mixins/HpManipulations.js";

export default {
	name: "Log",
	mixins: [setHP],
	components: {
		LogItem,
	},
	data() {
		return {
			userId: this.$store.getters.user ? this.$store.getters.user.uid : undefined,
		};
	},
	computed: {
		...mapGetters(["encounter", "log", "entities"]),
		last_item() {
			return this.log?.[0];
		},
		combat_log() {
			return this.log?.length > 1 ? this.log.filter((_item, index) => index > 0) : undefined;
		},
	},
	methods: {
		async undo() {
			const type = this.last_item.type === "damage" ? "healing" : "damage";
			let undo = this.last_item.over > 0 ? this.last_item.over : true; //Send the over value as undo true/false
			let doneBy =
				this.last_item.by === "environment" ? this.environment : this.entities[this.last_item.by];
			let amount = {};
			amount[type] = this.last_item.amount;

			await this.setHP(amount, this.entities[this.last_item.target], doneBy, { undo });
			this.set_log({
				action: "unset",
				value: 0,
			});
		},
	},
};
</script>

<style lang="scss" scoped>
.combat-log {
}
</style>
