<template>
	<div class="pb-5">
		<h2>Set Conditions</h2>
		<ul class="targets">
			<li v-for="(target, i) in targeted" :key="`target=${i}`">
				<TargetItem  :item="target" :i="i" />
			</li>
		</ul>
		<hr>
		<ul class="conditions">
			<template v-for="({value, name, condition, effects }, index) in conditionList">
				<li :key="index" v-if="value != 'exhaustion'">
					<div class="d-flex justify-content-between" :class="{ 'green': checkAll(value) }">
						<span class="d-flex justify-content-left">	
							<icon :icon="value" class="icon"/> {{ name }}
						</span>
						<span>
							<a class="mr-3" @click="set(value)" :key="value">
								<span v-if="!checkAll(value)"><i class="fas fa-plus-circle green" key="true"></i></span>
								<span v-if="checkAll(value)"><i class="fas fa-minus-circle red" key="true"></i></span>
							</a>
							<a 
								data-toggle="collapse"
								v-bind:href="'#cond_'+index"
								role="button"
								aria-expanded="false">
									<i class="fas fa-caret-down"></i>
							</a>
						</span>
					</div>
					<p class="collapse shown" v-bind:id="'cond_'+index">
						<b>{{ condition }}</b>
						<ul>
							<li v-for="(effect, index) in effects" :key="index">
								{{ effect }}
							</li>
						</ul>
					</p>
				</li>
			</template>
			<hr>
			<!-- EXHAUSTION -->
			<li>
				<div class="d-flex justify-content-between">
					<span class="d-flex justify-content-left">	
						<icon :icon="conditionList[3].value" class="icon" /> {{ conditionList[3].name }}
					</span>
					<span>
						<a 
							data-toggle="collapse"
							v-bind:href="'#cond_'+conditionList[3].value"
							role="button"
							aria-expanded="false">
								<i class="fas fa-caret-down"></i>
						</a>
					</span>
				</div>
				<div class="exhaustion d-flex justify-content-center">
					<a @click="setExhausted(0)"><i class="fas fa-times"></i></a>
					<a v-for="index in 6" :key="index" @click="setExhausted(index)"
					:class="{ 'active': checkExhaustion() === index }"
					>{{ index }}</a>
				</div>

				<p class="collapse shown" v-bind:id="'cond_'+conditionList[3].value">
					<b>{{ conditionList[3].condition }}</b>
					<ul class="exhausted">
						<li v-for="(effect, index) in conditionList[3].effects" :key="index">
							{{ effect }}
						</li>
					</ul>
				</p>
			</li>
		</ul>
	</div>
</template>

<script>
	import { db } from '@/firebase';
	import { mapActions, mapGetters } from 'vuex';
	import { conditions } from '@/mixins/conditions.js';
	import TargetItem from '@/components/combat/TargetItem.vue';

	export default {
		name: 'Conditions',
		mixins: [conditions],
		components: {
			TargetItem
		},
		props: [
		'data',
		],
		data() {
			return {
				userId: this.$store.getters.getUser.uid,
				campaignId: this.$route.params.campid,
				encounterId: this.$route.params.encid,
			}
		},
		computed: {
			...mapGetters([
				'entities',
				'targeted'
			]),
		},
		methods: {
			...mapActions([
				'setSlide',
				'set_condition',
			]),
			set(condition) {
				const action = (this.checkAll(condition)) ? 'remove' : 'add';

				for(const key of this.targeted) {
					this.set_condition({
						action, 
						key, 
						condition: condition
					});
				}
			},
			setExhausted(level) {
				var action = (level === 0) ? 'remove' : 'add';

				for(const key of this.targeted) {
					this.set_condition({
						action, 
						key, 
						condition: 'exhaustion',
						level: level
					});
				}
			},
			check(condition, target) {
				return this.entities[target].conditions.hasOwnProperty(condition);
			},
			//Checks if all targets have a certain condition
			checkAll(condition) {
				for(const key of this.targeted) {
					if(!this.check(condition, key)) {
						return false;
					}
				}
				return true;
			},
			checkExhaustion() {
				let exhaustion = undefined;

				for(const key of this.targeted) {
					const targetsExhaustion = this.entities[key].conditions.exhaustion;

					if(targetsExhaustion && !exhaustion) {
						exhaustion = targetsExhaustion;
					} else if(targetsExhaustion !== exhaustion) {
						return false;
					}
				}
				return exhaustion;
			}
		}
	};
</script>

<style lang="scss" scoped>
	ul.targets {
		list-style: none;
		padding: 0;

		li {
			margin-bottom: 2px !important;
			border: solid 1px transparent;
			background: #191919;
			padding-right: 10px;
		}
	}
	ul.conditions {
		list-style: none;
		padding: 0;
		line-height: 25px;
		font-size: 16px;

		a {
			color: #b2b2b2 !important;
		}
		.icon {
			width: 25px;
			height: 25px;
			margin-right: 10px;
		}

		li {
			margin-bottom: 15px;

			.shown {
				color: #b2b2b2;
				background: #302f2f;
				padding: 20px;

				ul {
					padding: 15px 0 0 18px;
					margin: 0;	
				}
				margin: 10px 0;				
			}
			.exhaustion {
				margin-top: 20px; 

				a {
					background: #302f2f;
					padding: 3px 15px;
					margin-left: 1px;
					font-weight: bold;

					&.active {
						background: #83b547;
						color: #fff !important;
					}
				}
			}
		}
	}
</style>
