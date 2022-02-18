<template>
		<div v-if="log">
			<h2 v-if="!encounter.finished">Combat log</h2>
			<transition-group v-if="entities && Object.keys(log).length > 0" tag="ul" name="log" enter-active-class="anitmated slideInDown">
				<li v-for="(item, key) in log" :key="`item-${key}`">
					<!-- Metadata -->
					<div class="d-flex justify-content-between head">
						<span>
							Round: {{ item.round }}
							Turn: {{ item.turn }}
						</span>
						{{ item.time }}
					</div>

					<!-- TOTAL -->
					<div class="d-flex justify-between">
						<div>
							<b :class="{ green: item.type == 'healing', red: item.type == 'damage' }">
								{{ item.amount }} {{ item.type }}
							</b>

							<!-- OVER -->
							<span v-if="item.over > 0">
								- {{ item.over }} {{ item.type === "damage" ? "overkill" : "overhealing" }}
							</span>
						</div>
						<small v-if="item.multiplier && item.multiplier !== 1" class="blue"><b>
							{{ (item.multiplier === .5) ? "HALVED" : "DOUBLED" }}
						</b></small>
					</div>

					<!-- ACTIONS -->
					<div v-if="item.actions">
						<span v-for="(action, index) in item.actions" :key="`action-${key}-${index}`">
							<!-- Manual -->
							<span v-if="(action.manual || action.request) && action.type === 'damage'">
								<b>{{ item.by_name.capitalizeEach() }}s</b> {{ item.ability }} did
							</span>

							<!-- To hit -->
							<span v-else-if="action.hitOrMiss">
								<b>{{ item.by_name.capitalizeEach() }}</b>{{ item.ability ? `s ${item.ability}` : `` }}
								<span :class="action.crit ? 'blue' : action.hitOrMiss === 'hit' ? 'green' : 'red'">
									{{ action.crit ? "Critted" : action.hitOrMiss === "hit" ? "hit" : "missed" }}
								</span>
								<b>{{ item.target_name.capitalizeEach() }}</b> for
							</span>

							<!-- Saving throw -->
							<span v-else-if="action.savingThrowResult">
								<b>{{item.target_name.capitalizeEach() }}</b> had a
								<span :class="action.savingThrowResult === 'save' ? 'green' : 'red'">
									{{ action.savingThrowResult === 'save' ? "successful" : "failed" }}
								</span>
								save {{ item.ability ? `on ${item.ability}` : `` }} and took
							</span>

							<!-- Healing -->
							<span v-else-if="action.type === 'healing'">
								<b>{{item.by_name.capitalizeEach() }}s</b> {{ item.ability }} healed
								<b>{{item.target_name.capitalizeEach() }}</b> for
							</span>

							<!-- Damage rolls with no to hit or save -->
							<span v-else>
								<b>{{ item.by_name.capitalizeEach() }}</b>{{ item.ability ? `s ${item.ability}` : `` }}
								damaged <b>{{ item.target_name.capitalizeEach() }}</b> for
							</span>

							<!-- Rolls -->
							<span v-for="(roll, roll_index) in action.rolls" :key="`roll-${key}-${index}-${roll_index}`">
								<span :class="action.type === 'healing' ? 'green' : roll.damage_type ? roll.damage_type : 'red'">
									<b>{{ roll.value }}</b> 
									{{ action.type !== "healing" ? roll.damage_type : "" }}
								</span>
								{{ roll_index+1 &lt; action.rolls.length ? "and" : action.type !== "healing" ? "damage" : "healing" }}
							</span>

							<!-- MANUAL END -->
							<span v-if="(action.manual || action.request) && action.type === 'damage'">
								to <b>{{ item.target_name.capitalizeEach() }}</b>
							</span>
						</span>
					</div>

					<!-- UNDO -->
					<div class="undo" v-if="key == 0 && !encounter.finished">
						<a 
							class="btn btn-sm bg-red"
							@click="undo(key, item.amount, item.over, item.target, item.by, item.type)"
							v-shortkey="['ctrl', 'z']" 
							@shortkey="undo(key, item.amount, item.over, item.target, item.by, item.type)"
						>
							Undo
							<template v-if="!showKeybinds"> [ctrl] + [z]</template>
						</a>
					</div>
				</li>
			</transition-group>
			<p v-else>
				<b>There is no log yet.</b><br/>
				Log items are created by doing damage or healing. From this log you can undo mistakes.
			</p>
		</div>
</template>

<script>
	import { mapGetters } from 'vuex';
	import { setHP } from '@/mixins/HpManipulations.js';

	export default {
		name: 'Log',
		mixins: [setHP],
		data() {
			return {
				userId: this.$store.getters.user ? this.$store.getters.user.uid : undefined,
				storageLog: JSON.parse(localStorage.getItem(this.$route.params.encid)),
				environment: {
					key: 'environment',
				},
			}
		},
		computed: {
			...mapGetters([
				'encounter',
				'log',
				'entities',
			]),
			showKeybinds() {
				return (this.userSettings && this.userSettings.general) ? this.userSettings.general.keyBinds : undefined;
			},
		},
		methods: {
			setLog() {
				if(Object.keys(this.log).length == 0) {
					this.log = this.storageLog
				}
			},
			undo(key, value, over, target, by, type) {
				type = (type == 'damage') ? 'healing' : 'damage';
				let undo = (over > 0) ? over : true; //Send the over value as undo true/false
				let doneBy = (by === 'environment') ? this.environment : this.entities[by];
				let amount = {};
				amount[type] = value;
				
				this.setHP(amount, this.entities[target], doneBy, { undo });
				this.set_log({
					action: 'unset',
					value: key
				});
			}
		}
	}
</script>

<style lang="scss" scoped>
ul {
	padding: 0 5px 0 0;
	list-style: none;

	li {
		padding:10px 3px;
		border-bottom: solid 1px $neutral-3;
		position: relative;

		.head {
			font-size: 11px;
			margin-bottom: 5px;
			font-style: italic;
		}
		.undo {
			width: 100%;
			height: 100%;
			background: rgba(0, 0, 0, .7);
			position: absolute;
			top: 0;
			left: 0;
			display: none;

			a {
				background: $red;
				text-align: center;
				color: $neutral-1 !important;
				display: block;
				position: absolute;
				line-height: 28px;
				height: 28px;
				width: max-content;
				padding: 0 5px;
				top: 50%;
				left: 50%;
				margin-top: -14px;
				transform: translateX(-50%);
			}
		}
		&:hover {
			.undo {
				display: block;
			}
		}
	}
}
</style>
