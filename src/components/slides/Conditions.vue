<template>
	<div class="pb-5">
		<h2>Conditions {{ entity.name }}</h2>
		<ul class="conditions">
			<li v-for="condition, index in conditions" :key="index">
				<div class="d-flex justify-content-between" :class="{ 'status': check(condition['.key']) == true }">
					<span class="d-flex justify-content-left">	
						<svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
							<path :d="condition.icon" fill-opacity="1"></path>
						</svg>
						<span class="text-capitalize">
							{{ condition['.key'] }}
						</span>
					</span>
					<span>
						<a class="mr-3 plus" @click="set(entity.key, condition['.key'])" :key="condition['.key']">
							<!-- yes, these icons need a to within a span... without they will not update on change -->
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
			set(key, condition) {
				if(this.check(condition) == true) {
					var action = 'remove';
				}
				else {
					var action = 'add';
				}
				this.set_condition({action: action, key: key, condition: condition});
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
				}
				margin: 10px 0;				
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
