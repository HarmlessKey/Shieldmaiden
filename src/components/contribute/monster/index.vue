<template>
	<div class="content">
		<Crumble :name="(monster.changed) ? monster.name : oldMonster.name"/>
		<h2 class="monsterTitle d-flex justify-content-between" v-if="oldMonster">
			{{ (monster.changed) ? monster.name : oldMonster.name }}
			<span v-if="canEdit()">
				<router-link :to="'/contribute/monsters/' + monsterId + '/edit'" class="mx-2">
					<i class="fas fa-pencil-alt"></i>
					<q-tooltip anchor="center right" self="center left">
						Edit
					</q-tooltip>
				</router-link>
			</span>
		</h2>

		<div class="row q-col-gutter-md">
			<div v-if="oldMonster" class="col">
				<h2>Old monster</h2>
				<div class="monster-card">
					<ViewMonster :data="oldMonster" />
				</div>
			</div>
			<div v-if="monster && monster.changed" class="col">
				<h2>New monster</h2>
				<div class="monster-card">
					<ViewNewMonster :data="monster" />
				</div>
			</div>
		</div>
	</div>
</template>

<script>
	import { db } from '@/firebase';
	import Crumble from '@/components/crumble/Compendium.vue';
	import MonsterEdit from './edit.vue';
	import { mapGetters } from 'vuex';
	import ViewMonster from '@/components/ViewMonster.vue';
	import ViewNewMonster from './ViewMonster.vue';

	export default {
		name: 'Monster',
		components: {
			Crumble,
			MonsterEdit,
			ViewMonster,
			ViewNewMonster
		},
		props: ['id'],
		data() {
			return {
				userId: this.$store.getters.user.uid,
				monsterId: this.$route.params.id,
				edit: false,
				loading: true
			}
		},
		computed: {
			...mapGetters([
				'userInfo'
			])
		},
		filters: {
			capitalize: function (value) {
				if (!value) return ''
				value = value.toString()
				return value.charAt(0).toUpperCase() + value.slice(1)
			}
		},
		firebase() {
			return {
				oldMonster: {
					source: db.ref(`monsters/${this.monsterId}`),
					asObject: true,
					readyCallback: () => this.loading = false
				},
				monster: {
					source: db.ref(`new_monsters/${this.monsterId}`),
					asObject: true,
					readyCallback: () => this.loading = false
				}
			}
		},
		methods: {
			canEdit() {
				return (this.monster.metadata && this.monster.metadata.tagged === this.userId) ||
					this.userInfo.admin;
			},
			setEdit(value) {
				this.edit = value
			}
		},
	}
</script>

<style lang="scss" scoped>
 .spellTitle {
		font-size: 18px !important;
		text-transform: none !important;
		border-bottom: solid 1px #5c5757;
		padding-bottom: 5px;
		margin-bottom: 5px;

		i {
			font-size: 15px;
		}
 }
</style>