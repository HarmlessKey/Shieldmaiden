<template>
	<span>
		<span v-if="npcs && entity.entityType === 'npc'" :style="entity.color_label ? `color: ${entity.color_label}` : ``">
			{{ displayNPCField('name', entity) ? entity.name.capitalizeEach() : "? ? ?" }}
		</span>
		<template v-else>
			{{ name() }}
		</template>
	</span>
</template>

<script>
	import { trackEncounter } from 'src/mixins/trackEncounter.js';

	export default {
		name: 'Name',
		mixins: [trackEncounter],
		props: {
			entity: {
				type: Object,
				required: true
			},
			players: {
				type: Object,
				required: true
			},
			npcs: {
				type: Object,
				required: true
			},
			npcSettings: {
				type: Object,
				required: true
			}
		},
		methods: {
			name() {
				if(this.entity.entityType == 'companion' && this.npcs) {
					return (this.npcs[this.entity.key]) ? this.npcs[this.entity.key].name : "";
				} 
				return (this.players[this.entity.key]) ? this.players[this.entity.key].character_name : "";
			}
		}
	}
</script>