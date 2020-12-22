<template>
	<div>
		<template v-if="target.curHp === 0 && !target.stable && !target.dead">
				<a @click="setSlide({show: true, type: 'slides/DeathSaves'})">What is this <i class="fas fa-question"></i></a>
				<div class="px-1 my-3 d-flex justify-content-between">
					<div v-for="(n, index) in 5" :key="index">
						<template v-if="Object.keys(target.saves).length == n">
							<a v-show="target.saves[n] === 'succes'" class="green" @click="save('unset', n)">
								<i class="fas fa-check"></i>
								<q-tooltip anchor="top middle" self="center middle">
									Undo
								</q-tooltip>
							</a>
							<a v-show="target.saves[n] === 'fail'" class="red" @click="save('unset', n)">
								<i class="fas fa-times"></i>
								<q-tooltip anchor="top middle" self="center middle">
									Undo
								</q-tooltip>
							</a>
						</template>
						<template v-else>
							<span v-show="target.saves[n] === 'succes'" class="green"><i class="fas fa-check"></i></span>
							<span v-show="target.saves[n] === 'fail'" class="red"><i class="fas fa-times"></i></span>
						</template>
						<span v-show="!target.saves[n]" class="gray-hover"><i class="fas fa-dot-circle"></i></span>
					</div>
				</div>
				<div v-if="Object.keys(target.saves).length < 5" class="d-flex justify-content-between">
					<button class="btn save bg-green" @click="save('succes', Object.keys(target.saves).length)"><i class="fas fa-check"></i></button>
					<button class="btn save bg-red" @click="save('fail', Object.keys(target.saves).length)"><i class="fas fa-times"></i></button>
				</div>
				<a v-if="death_fails >= 3" class="btn btn-block bg-red my-3" @click="kill_revive('set')"><i class="fas fa-skull"></i> {{target.entityType.capitalize()}} died</a>
				<a class="btn btn-block my-3" @click="set_stable({key: target.key, action: 'set'})"><i class="fas fa-heartbeat"></i> Stabilize</a>
		</template>
		<a v-else-if="target.dead" class="btn bg-green btn-block my-3" @click="kill_revive('unset')"><i class="fas fa-hand-holding-magic"></i> Revive</a>
	</div>
</template>

<script>
	// import { db } from '@/firebase'
	import { mapActions, mapGetters } from 'vuex'
	import ViewEntity from '@/components/ViewEntity.vue';
	import Conditions from '@/components/combat/Conditions.vue';
	import Reminders from '@/components/combat/Reminders.vue';
	import { dice } from '@/mixins/dice.js';
	import TargetItem from '@/components/combat/TargetItem.vue';

	export default {
		name: 'DeathSaves',
		mixins: [dice],
		props: ["target"],
		components: {
			ViewEntity,
			Conditions,
			Reminders,
			TargetItem
		},
		data() {
			return {
				setShadow: 0,
			}
		},
		computed: {
			...mapGetters([
				'entities',
				'targeted',
			]),
			death_fails() {
				let fails = 0;
				for(let key in this.target.saves) {
					if(this.target.saves[key] === 'fail') {
						fails++
					}
				}
				return fails;
			}
		},
		methods: {
			...mapActions([
				'setSlide',
				'set_save',
				'set_dead',
				'set_stable'
			]),
			save(check, index) {
				this.set_save({
					key: this.target.key,
					check: check,
					index
				})
			},
			kill_revive(action) {
				this.set_dead({
					key: this.target.key,
					action: action,
					revive: true
				})
			},
			stabilize() {
				this.set_stable({
					key: this.target.key,
					action: 'set',
				})
			},
		}
	}
</script>

<style lang="scss" scoped>
	.btn.save {
		width: 49.5%;
	}
</style>