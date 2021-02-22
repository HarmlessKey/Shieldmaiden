<template>
		<div>
			<template v-if="log">
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

						<!-- <template v-if="entities[item.by]">
							{{ entities[item.by].name.capitalizeEach() }}{{ item.ability ? `'s ${item.ability}` : `` }} did
						</template>
						<b :class="{ green: item.type == 'healing', red: item.type == 'damage' }">
							{{ item.amount }}
						</b>
						{{ item.type }}
						<template v-if="item.by === 'environment'">
							{{ item.by }}
						</template>
						<template v-if="entities[item.target]">
							to {{ entities[item.target].name }}.
						</template> -->

						<!-- ACTIONS -->
						<div v-if="item.actions">
							<span v-for="(action, index) in item.actions" :key="`action-${key}-${index}`">
								<!-- To hit -->
								<span v-if="action.hitOrMiss">
									{{ entities[item.by].name.capitalizeEach() }}{{ item.ability ? `'s ${item.ability}` : `` }}
									<span :class="action.crit ? 'blue' : action.hitOrMiss === 'hit' ? 'green' : 'red'">
										{{ action.crit ? "Critted" : action.hitOrMiss === "hit" ? "hit" : "missed" }}
									</span>
									{{ entities[item.target].name.capitalizeEach() }} for
								</span>

								<!-- Saving throw -->
								<span v-if="action.savingThrowResult">
									{{ entities[item.target].name.capitalizeEach() }} had a
									<span :class="action.savingThrowResult === 'save' ? 'green' : 'red'">
										{{ action.savingThrowResult === 'save' ? "successful" : "failed" }}
									</span>
									save on and took
								</span>

								<!-- Rolls -->
								<span v-for="(roll, roll_index) in action.rolls" :key="`roll-${key}-${index}-${roll_index}`">
									<span :class="action.type !== 'healing' ? roll.damage_type : 'green'">
										<b>{{ roll.value }}</b> 
										{{ action.type !== "healing" ? roll.damage_type : "healing" }}
									</span>
									{{ action.type !== "healing" ? "damage" : "" }}
									{{ roll_index+1 &lt; action.rolls.length ? "and" : "" }}
								</span>
							</span>
						</div>

						<!-- OVER -->
						<span v-if="item.over > 0">
							({{ item.over }} {{ item.type === "damage" ? "overkill" : "overhealing" }})
						</span>


						<!-- UNDO -->
						<div class="undo" v-if="key == 0 && !encounter.finished">
							<a 
								@click="undo(key, item.amount, item.over, item.target, item.by, item.type)"
								v-shortkey="['ctrl', 'z']" 
								@shortkey="undo(key, item.amount, item.over, item.target, item.by, item.type)"
							>
								Undo
								<template v-if="showKeybinds.keyBinds === undefined"> [ctrl] + [z]</template>
							</a>
						</div>
					</li>
				</transition-group>
				<p v-else>No log yet.</p>
			</template>
		</div>
</template>

<script>
	import { mapGetters } from 'vuex';
	import { setHP } from '@/mixins/HpManipulations.js';
	import { db } from '@/firebase';

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
		firebase() {
			return {
				showKeybinds: {
					source: db.ref(`settings/${this.userId}/general`),
					asObject: true
				}
			}
		},
		computed: {
			...mapGetters([
				'encounter',
				'log',
				'entities',
			]),
		},
		beforeMount() {
			// this.setLog()
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
				let doneBy = (by == 'environment') ? this.environment : this.entities[by];
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
		border-bottom: solid 1px #494747;
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
				background:$red;
				text-align: center;
				color:$white !important;
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
