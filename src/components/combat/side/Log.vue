<template>
		<div>
			<template v-if="log">
				<h2 v-if="!encounter.finished">Combat log</h2>
				<transition-group v-if="entities && Object.keys(log).length > 0" tag="ul" name="log" enter-active-class="anitmated slideInDown">
					<li v-for="(item, key) in log" :key="`item-${key}`">
						<div class="d-flex justify-content-between head">
							<span>
								Round: {{ item.round }}
								Turn: {{ item.turn }}
							</span>
							{{ item.time }}
						</div>
						<b class="blue" v-if="item.crit">Critical hit! </b>
						<template v-if="entities[item.by]">
							{{ entities[item.by].name }} did
						</template>
						<span :class="{ green: item.type == 'healing', red: item.type == 'damage' }">{{ item.amount }}</span>
						<template v-if="item.by == 'environment'"> {{ item.by }}</template>
						<template v-if="item.type == 'damage'"> {{ item.damageType }}</template>
							<template v-if="entities[item.target]">
								{{ item.type }} to {{ entities[item.target].name }}
							</template>
						<span v-if="item.over != 0">
							({{ item.over }}
							<template v-if="item.type == 'damage'">overkill</template>
							<template v-else>overhealing</template>)
						</span>
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
				user: this.$store.getters.getUser,
				storageLog: JSON.parse(localStorage.getItem(this.$route.params.encid)),
				environment: {
					key: 'environment',
				},
			}
		},
		firebase() {
			return {
				showKeybinds: {
					source: db.ref(`settings/${this.user.uid}/general`),
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
			undo(key, amount, over, target, by, type) {
				type = (type == 'damage') ? 'healing' : 'damage';
				let undo = (over > 0) ? over : true; //Send the over value as undo true/false

				let doneBy = (by == 'environment') ? this.environment : this.entities[by];
				
				this.setHP(amount, false, this.entities[target], doneBy, type, false, false, undo)
				this.set_log({
					action: 'unset',
					value: key
				})
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
				background: #cc3e4a;
				text-align: center;
				color: #fff !important;
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
