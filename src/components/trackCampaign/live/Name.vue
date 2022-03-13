<template>
	<span>
		<span v-if="npcs && entity.entityType === 'npc'" :style="entity.color_label ? `color: ${entity.color_label}` : ``">
			{{ displayNPCField('name', entity) ? entity.name.capitalizeEach() : "? ? ?" }}
		</span>
		<template v-else>
			{{ (entity.entityType == 'companion' && npcs) ? npcs[entity.key].name : players[entity.key].character_name }}
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
		}
	}
</script>