<template>
	<div class="pb-5">
		<h2>Conditions {{ entityKey }}</h2>
		<ul class="conditions">
			<li v-for="condition, index in conditions" :key="index">
				<div class="d-flex justify-content-between">
					<span class="text-capitalize" :class="{ 'gray-light': check(condition['.key']) == true }">{{ condition['.key'] }}</span>
					<span>
						<a v-if="check(condition['.key']) == false" class="mr-3" @click="set(condition['.key'])"><i class="fas fa-plus-circle"></i></a>
						<a v-else class="gray-light mr-3" @click="remove(condition['.key'])"><i class="fas fa-minus-circle"></i></a>
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
		'entityKey',
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
				entityConditions: {
					 source: db.ref(`encounters/${this.userId}/${this.campaignId}/${this.encounterId}/entities/${this.entityKey}`),
					 asObject: true
				}
			}
		},
		computed: {
			...mapGetters([
				'entities'
			]),
		},
		methods: {
			...mapActions([
				'setSlide'
			]),
			set(condition) {
				db.ref(`encounters/${this.userId}/${this.campaignId}/${this.encounterId}/entities/${this.entityKey}/conditions/${condition}`).set('true');
			},
			remove(condition) {
				db.ref(`encounters/${this.userId}/${this.campaignId}/${this.encounterId}/entities/${this.entityKey}/conditions/${condition}`).remove();
			},
			check(condition) {
				return this.entities[this.entityKey].conditions.hasOwnProperty(condition)
			},
		}
	};
</script>

<style lang="scss" scoped>
	ul.conditions {
		list-style: none;
		padding: 0;
		color: #494747;

		a {
			color: #494747 !important;
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
	}
</style>
