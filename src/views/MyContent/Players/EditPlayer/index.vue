<template>
	<div v-if="overencumbered">
		<OverEncumbered />
	</div>
	
	<div v-else class="content">
		<ul class="tabs">
			<li 
				v-for="({value, label}, i) in tabs"
				@click="current_tab = value"
				:class="{ active: current_tab === value }"
				:key="`tab-${i}`"
			>
				{{ label }}
			</li>
		</ul>
		<div class="tab-content">
			<General 
				v-if="current_tab === 'general'"
				:general="base_values.general" 
				:playerId="playerId" 
				:userId="userId" 
			/>
			<Race
				v-if="current_tab === 'race'"
				:character_race="base_values.race" 
				:playerId="playerId" 
				:userId="userId"
			/>
		</div>
	</div>
</template>

<script>
	import OverEncumbered from '@/components/OverEncumbered.vue';
	import GiveCharacterControl from '@/components/GiveCharacterControl.vue';
	import { mapGetters, mapActions } from 'vuex';
	import { db } from '@/firebase';
	import General from './general';
	import Race from './race';

	export default {
		name: 'Players',
		metaInfo: {
			title: 'Character'
		},
		components: {
			OverEncumbered,
			General,
			Race
		},
		data() {
			return {
				playerId: this.$route.params.id,
				tabs: [
					{ value: 'general', label: "General" },
					{ value: 'race', label: "Race" },
					{ value: 'class', label: "Class" }
				],
				current_tab: 'general'
			}
		},
		firebase() {
			return {
				base_values: {
					source: db.ref(`characters_base/${this.userId}/${this.playerId}`),
					asObject: true
				},
				computed_values: {
					source: db.ref(`characters_computed/${this.userId}/${this.playerId}`),
					asObject: true
				},
			}
		},
		computed: {
			...mapGetters([
				'tier',
				'players',
				'overencumbered',
			]),
			//User ID needs to be different if it is
			//an external controlled character
			userId() {
				if(this.$route.name === 'Edit Character') {
					let id = undefined
					let user = db.ref(`character_control/${this.$store.getters.getUser.uid}/${this.$route.params.id}`);
					user.on('value' , (snapshot) => {
						id = snapshot.val().user
					});
					return id;
				} else {
					return this.$store.getters.getUser.uid;
				}
			},
		},
		methods: {
			...mapActions([
				'setSlide'
			]),
			showSlide(type) {
				this.setSlide({
					show: true,
					type,
				})
			},
		}
	}
</script>

<style lang="scss" scoped>
	.content {
		display: grid;
		grid-template-rows: 40px 1fr;
		overflow: hidden;
		height: calc(100vh - 60px);

		.tabs {
			height: 40px;
			list-style: none;
			padding: 0;
			display: flex;
			justify-content: flex-start;
			user-select: none;

			li {
				cursor: pointer;
				padding: 0 10px;

				&.active {
					color: #2c97de;
				}
			}
		}
		.tab-content {
			overflow: scroll;

			&::-webkit-scrollbar {
				display: none !important;
			}
		}
		
	}
</style>