<template>
	<div v-if="campPlayers && campPlayers && players && npcs && (health.curHp > 0 || entity.entityType == 'npc')">
		<span class="hp">
			<span v-if="isTransformed(entity, camp_data)" class="mr-1">
				<i aria-hidden="true" class="fas fa-paw-claws mr-2"></i>
				<q-tooltip anchor="top middle" self="center middle">
					Transformed
				</q-tooltip>
			</span>
			<span class="current" :class="{ 
				'red': percentage(health.curHp, health.maxHp) <= 33, 
				'orange': percentage(health.curHp, health.maxHp) > 33 && percentage(health.curHp, health.maxHp) <= 76, 
				'green': percentage(health.curHp, health.maxHp) > 76
				}">
					<hk-animated-integer :value="health.curHp" />
				</span>
				<span class="neutral-2">/</span><span :class="{ 
					'green': (entity.entityType === 'player' || entity.entityType === 'companion') && camp_data.maxHpMod > 0, 
					'red': (entity.entityType === 'player' || entity.entityType === 'companion') && camp_data.maxHpMod < 0
				}">{{ health.maxHp }}
				</span>
			<template v-if="health.tempHp">
				+{{ health.tempHp }}
			</template>
		</span>
	</div>
	<div v-else>
		<div v-if="camp_data.stable" class="green">
			<span><i aria-hidden="true" class="fas fa-fist-raised"></i> Stable</span>
		</div>
		<div v-else-if="camp_data.dead" class="red">
			<span><i aria-hidden="true" class="fas fa-skull-crossbones"></i> Dead</span>
		</div>
		<div v-else class="hp d-flex justify-content-start">
			<div v-for="(check, key) in camp_data.saves" v-bind:key="key" class="mr-1">
				<span v-show="check == 'succes'" class="save green"><i aria-hidden="true" class="fas fa-check"></i></span> 
				<span v-show="check == 'fail'" class="save red"><i aria-hidden="true" class="fas fa-times"></i></span>
			</div>
		</div>
	</div>
</template>

<script>
	import { general } from '@/mixins/general.js';
	import { trackEncounter } from '@/mixins/trackEncounter.js';

	export default {
		name: 'Health',
		mixins: [general, trackEncounter],
		props: [
			'entity',
			'campPlayers',
			'campCompanions',
			'npcs',
			'players',
		],
		data() {
			return {
				userId: this.$route.params.userid,
			}
		},
		computed: {
			camp_data: function() {
				const key = this.entity.key;
				
				if (this.entity.entityType === 'player')
					return this.campPlayers[key];

				if (this.entity.entityType === 'companion')
					return this.campCompanions[key];

				return undefined;
			},
			health: function() {
				let ret = {};
				const key = this.entity.key;

				let maxHp, curHp, tempHp;

				if (this.isTransformed(this.entity, this.camp_data)) {
					maxHp = (this.camp_data !== undefined) ? this.camp_data.transformed.maxHp : this.entity.transformed.maxHp;
					curHp = (this.camp_data !== undefined) ? this.camp_data.transformed.curHp : this.entity.transformed.curHp;
					tempHp = (this.camp_data !== undefined) ? this.camp_data.tempHp : this.entity.tempHp;
				}

				// Not transformed
				else {
					// Fill cur and temp first from campaign or entity data
					curHp = (this.camp_data !== undefined) ? this.camp_data.curHp : this.entity.curHp;
					tempHp = (this.camp_data !== undefined) ? this.camp_data.tempHp : this.entity.tempHp;

					// Npc max hp in entity
					if (this.entity.entityType === 'npc')
						maxHp = (this.entity.maxHpMod) ? parseInt(this.entity.maxHp) + this.entity.maxHpMod : this.entity.maxHp;

					else if (this.entity.entityType === 'player')
						maxHp = (this.camp_data.maxHpMod) ? parseInt(this.players[key].maxHp) + this.camp_data.maxHpMod : this.players[key].maxHp;

					else if (this.entity.entityType === 'companion')
						maxHp = (this.camp_data.maxHpMod) ? parseInt(this.npcs[key].hit_points) + this.camp_data.maxHpMod : this.npcs[key].hit_points;
				}

				ret = {
					maxHp: parseInt(maxHp),
					curHp: parseInt(curHp),
					tempHp: parseInt(tempHp),
				};
				return ret;
			}
		}
	}
</script>