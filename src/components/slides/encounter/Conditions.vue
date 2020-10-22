<template>
	<div class="pb-5">
		<h2>Set Conditions</h2>
		<ul class="targets">
			<li v-for="(target, i) in targeted" :key="`target=${i}`">
				<TargetItem  :item="target" :i="i" />
			</li>
		</ul>
		<hr>

		<q-list dark square :class="`accordion`" v-if="value != 'exhaustion'">
			<q-expansion-item
				v-for="({value, name, condition, effects }, index) in conditionList"
				:key="index"
				dark switch-toggle-side
				:group="name"
			>
				<template v-if="value !== 'exhaustion'" v-slot:header>
					<q-item-section>
						<div class="d-flex justify-content-start">
							<icon :icon="value" class="icon"/>
							{{ name }}
						</div>
					</q-item-section>
					<q-item-section avatar>
						<a @click.stop="set(value)" :key="value">
							<span v-if="!checkAll(value)"><i class="fas fa-plus-circle green" key="true"></i></span>
							<span v-if="checkAll(value)"><i class="fas fa-minus-circle red" key="true"></i></span>
						</a>
					</q-item-section>
				</template>
				<template v-else v-slot:header>
					<q-item-section>
						{{ name }}
					</q-item-section>
					<q-item-sections>
						<div class="exhaustion d-flex justify-content-center">
							<a @click.stop="setExhausted(0)"><i class="fas fa-times"></i></a>
							<a v-for="index in 6" :key="index" @click.stop="setExhausted(index)"
							:class="{ 'active': checkExhaustion() === index }"
							>{{ index }}</a>
						</div>
					</q-item-sections>
				</template>

				<div class="accordion-body">
					<b>{{ condition }}</b>
					<ul>
						<li v-for="(effect, index) in effects" :key="index">
							{{ effect }}
						</li>
					</ul>
				</div>
			</q-expansion-item>
		</q-list>
	</div>
</template>

<script>
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
	.icon {
		width: 25px;
		height: 25px;
		margin-right: 10px;
	}
	.exhaustion {
		margin-top: 5px;
		user-select: none;

		a {
			background: #302f2f;
			color: #fff;
			width: 20px;
			height: 20px;
			line-height: 20px;
			border-radius: 50%;
			text-align: center;
			margin-left: 1px;
			font-size: 12px;

			&.active {
				background: #83b547;
				color: #fff !important;
			}
		}
	}
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
