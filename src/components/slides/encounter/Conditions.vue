<template>
	<div class="pb-5">
		<h2>Set Conditions</h2>
		<ul class="targets">
			<li v-for="(target, i) in condition_targets" :key="`target=${i}`">
				<TargetItem  :item="target" :i="i" />
			</li>
		</ul>
		<hr>
		<template v-if="condition_targets.length > 0">
			<q-list dark square :class="`accordion`">
				<q-expansion-item
					v-for="({value, name, condition, effects }, index) in conditionList"
					:key="index"
					dark switch-toggle-side
					:group="name"
				>
					<template v-slot:header>
						<q-item-section>
							<div class="d-flex justify-content-start">
								<icon :icon="value" class="icon"/>
								{{ name }}
							</div>
						</q-item-section>

						<q-item-section v-if="value === 'exhaustion'" avatar>
							<a @click.stop>
								<span class="exhaustion gray-dark" v-if="checkExhaustion() != undefined">
									{{ checkExhaustion() }}
								</span>
								<i v-else class="fas fa-plus-circle green" />

								<q-popup-proxy square :breakpoint="576">
									<div class="bg-gray gray-light">
										<q-list>
											<q-item>
												<q-item-section>Exhaustion</q-item-section>
											</q-item>
											<q-separator />
											<q-item clickable v-close-popup v-for="index in 6" :key="index" @click="setExhausted(index)">
												<q-item-section>Level {{ index }}</q-item-section>
											</q-item>
											<q-separator />
											<q-item clickable v-close-popup @click="setExhausted(0)">
												<q-item-section>Remove</q-item-section>
											</q-item>
										</q-list>
									</div>
								</q-popup-proxy>
							</a>
						</q-item-section>

						<q-item-section avatar v-else>
							<a @click.stop="set(value)" :key="value">
								<span v-if="!checkAll(value)"><i class="fas fa-plus-circle green" key="true"></i></span>
								<span v-if="checkAll(value)"><i class="fas fa-minus-circle red" key="true"></i></span>
							</a>
						</q-item-section>
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
		</template>
		<template v-else>
			<p class="mt-4">
				Select one or multiple targets to add or remove conditions.
			</p>
		</template>
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
				userId: this.$store.getters.user.uid,
				campaignId: this.$route.params.campid,
				encounterId: this.$route.params.encid,
			}
		},
		computed: {
			...mapGetters([
				'entities',
				'targeted'
			]),
			condition_targets: function() {
				if (this.data !== undefined && this.data.length > 0)
					return this.data;
				
				return this.targeted;
			},
		},
		methods: {
			...mapActions([
				'setSlide',
				'set_condition',
			]),
			set(condition) {
				const action = (this.checkAll(condition)) ? 'remove' : 'add';

				for(const key of this.condition_targets) {
					this.set_condition({
						action, 
						key, 
						condition: condition
					});
				}
			},
			setExhausted(level) {
				var action = (level === 0) ? 'remove' : 'add';

				for(const key of this.condition_targets) {
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
				for(const key of this.condition_targets) {
					if(!this.check(condition, key)) {
						return false;
					}
				}
				return true;
			},
			checkExhaustion() {
				let exhaustion = undefined;

				for(const key of this.condition_targets) {
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
	a .exhaustion {
		display: block;
		width: 15px;
		height: 15px;
		border-radius: 50%;
		background:   #cc3e4a;
		text-align: center;
		font-size: 12px;
		line-height: 15px;
		font-weight: bold !important;
	}
	ul.targets {
		list-style: none;
		padding: 0;

		li {
			margin-bottom: 2px !important;
			border: solid 1px transparent;
			background: #191919;
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
		}
	}
</style>
