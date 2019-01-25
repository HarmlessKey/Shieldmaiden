<template>
		<div class="tab-pane fade show active" id="log" role="tabpanel" aria-labelledby="log-tab">
			<template v-if="returnLog()">
				<h2 class="d-flex justify-content-between">
					Combat log
					<span class="blue" 
						v-b-popover.hover.left="'The combat log is stored localy in your browser'" 
						title="Log storage"><i class="fas fa-info"></i></span>
				</h2>
				<transition-group v-if="entities && Object.keys(returnLog()).length > 0" tag="ul" name="log" enter-active-class="anitmated slideInDown">
					<li v-for="(item, key) in returnLog()" :key="key">
						<div class="d-flex justify-content-between head">
							<span>
								Round: {{ item.round }}
								Turn: {{ item.turn }}
							</span>
							{{ item.time }}
						</div>
						{{ entities[item.by].name }} did
						<span :class="{ green: item.type == 'healing', red: item.type == 'damage' }">{{ item.amount }}</span>
						<template v-if="item.type == 'damage'"> {{ item.damageType }}</template>
						{{ item.type }} to {{ entities[item.target].name }}
						<span v-if="item.over != 0">
							({{ item.over }}
							<template v-if="item.type == 'damage'">overkill</template>
							<template v-else>overhealing</template>)
						</span>
						<div class="undo" v-if="key == 0">
							<a @click="undo(key, item.amount, item.target, item.by, item.type)">Undo</a>
						</div>
					</li>
				</transition-group>
				<p v-else>No log yet.</p>
			</template>
		</div>
</template>

<script>
	import { mapActions, mapGetters } from 'vuex'
	import { setHP } from '@/mixins/HpManipulations.js'

	export default {
		name: 'Log',
		mixins: [setHP],
		data() {
			return {
				storageLog: JSON.parse(localStorage.getItem(this.$route.params.encid))
			}
		},
		computed: {
			...mapGetters([
				'log',
				'entities',
			]),
		},
		methods: {
			returnLog() {
				if(Object.keys(this.log).length == 0) {
					return this.storageLog
				}
				else {
					return this.log
				}
			},
			undo(key, amount, target, by, type) {
				if(type == 'damage') {
					type = 'healing'
				}
				else if(type == 'healing') {
					type = 'damage'
				}
				this.setHP(amount, this.entities[target], this.entities[by], type, false, false, true)
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
		border-bottom: solid 1px #000;
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
			display:none;

			a {
				background: #cc3e4a;
				text-align: center;
				color: #fff !important;
				display:block;
				position: absolute;
				line-height: 28px;
				height: 28px;
				width: 60px;
				top: 50%;
				left: 50%;
				margin-top: -14px;
				margin-left: -30px;
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
