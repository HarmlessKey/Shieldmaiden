<template>
	<div class="pb-5">
		<h2>Conditions {{ entity.name }}</h2>
		<ul class="conditions">
			<li v-for="condition, index in conditions" :key="index" v-if="condition['.key'] != 'exhaustion'">
				<div class="d-flex justify-content-between" :class="{ 'status': check(condition['.key']) == true }">
					<span class="d-flex justify-content-left">	
						<svg class="icon" xmlns="https://www.w3.org/2000/svg" viewBox="0 0 512 512">
							<path :d="condition.icon" fill-opacity="1"></path>
						</svg>
						<span class="text-capitalize">
							{{ condition['.key'] }}
						</span>
					</span>
					<span>
						<a class="mr-3 plus" @click="set(condition['.key'])" :key="condition['.key']">
							<!-- yes, these icons need to be within a span... without they will not update on change -->
							<span v-show="check(condition['.key']) == false"><i class="fas fa-plus-circle" key="false"></i></span>
							<span v-show="check(condition['.key']) == true"><i class="fas fa-minus-circle" key="true"></i></span>
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
					{{ condition.condition }}
					<ul>
						<li v-for="effect, index in condition.effects" :key="index">
							{{ effect }}
						</li>
					</ul>
				</p>
			</li>
			<hr>
			<!-- EXHAUSTION -->
			<li :class="{ 'status': entities[entity.key].conditions['exhaustion'] }">
				<div class="d-flex justify-content-between">
					<span class="d-flex justify-content-left">	
						<svg class="icon" xmlns="https://www.w3.org/2000/svg" viewBox="0 0 512 512">
							<path :d="conditions[3].icon" fill-opacity="1"></path>
						</svg>
						<span class="text-capitalize">
							{{ conditions[3]['.key'] }}
						</span>
					</span>
					<span>
						<a 
							data-toggle="collapse"
							v-bind:href="'#cond_'+conditions[3]['.key']"
							role="button"
							aria-expanded="false">
								<i class="fas fa-caret-down"></i>
						</a>
					</span>
				</div>
				<div class="exhaustion d-flex justify-content-center">
					<a @click="setExhausted(0)"><i class="fas fa-times"></i></a>
					<a v-for="index in 6" :key="index" @click="setExhausted(index)" 
					:class="{'active': entities[entity.key].conditions['exhaustion'] == index}">{{ index }}</a>
				</div>

				<p class="collapse shown" v-bind:id="'cond_'+conditions[3]['.key']">
					{{ conditions[3].condition }}
					<ul class="exhausted">
						<li v-for="effect, index in conditions[3].effects" :key="index">
							{{ effect }}
						</li>
					</ul>
				</p>
			</li>
		</ul>
	</div>
</template>

<script>
	import { db } from '@/firebase'
	import { mapActions, mapGetters } from 'vuex'

	export default {
		name: 'Conditions',
		props: [
		'entity',
		],
		data() {
			return {
				userId: this.$store.getters.getUser.uid,
				campaignId: this.$route.params.campid,
				encounterId: this.$route.params.encid,
			}
		},
		firebase() {
			return {
				conditions: db.ref('conditions'),
			}
		},
		computed: {
			...mapGetters([
				'entities'
			]),
		},
		methods: {
			...mapActions([
				'setSlide',
				'set_condition',
			]),
			set(condition) {
				if(this.check(condition) == true) {
					var action = 'remove';
				}
				else {
					var action = 'add';
				}
				this.set_condition({
					action: action, 
					key: this.entity.key, 
					condition: condition
				});
			},
			setExhausted(level) {
				var action = (level == 0) ? 'remove' : 'add';

				this.set_condition({
					action: action, 
					key: this.entity.key, 
					condition: 'exhaustion',
					level: level
				});
			},
			check(condition) {
				return this.entities[this.entity.key].conditions.hasOwnProperty(condition)
			},
		}
	};
</script>

<style lang="scss" scoped>
	ul.conditions {
		list-style: none;
		padding: 0;
		color: #494747;
		line-height: 20px;

		a {
			color: #494747 !important;
		}
		svg.icon {
			width: 20px;
			height: 20px;
			margin-right: 5px;
			fill: #494747;
		}

		li {
			margin-bottom: 10px;

			.shown {
				ul {
					color: #b2b2b2;
					background: #302f2f;
					padding: 18px 15px 10px 30px;
					margin: 0;

					&.exhausted {
						list-style: none;
					}
				}
				margin: 10px 0;				
			}
			.exhaustion {
				margin-top: 20px; 

				a {
					background: #302f2f;
					padding: 3px 15px;
					margin-left: 1px;

					&.active {
						background: #b2b2b2;
					}
				}
			}
		}
		.status {
			color: #b2b2b2;

			svg {
				color: #b2b2b2;
				fill: #b2b2b2;
			}
			.hide {
				display: none;
			}
		}
	}
</style>
