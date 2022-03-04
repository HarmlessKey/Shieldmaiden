<template>
	<div>
		<ul v-if="entities" class="entities hasImg">
			<li v-for="entity in players" :key="entity.key">
				<span 
					class="img" 
					:style="{
						'background-image': 'url(' + entity.img + ')',
						'border-color': entity.color_label ? entity.color_label : ``
					}">
						<i aria-hidden="true" v-if="['monster', 'player', 'companion'].includes(entity.img)" :class="`hki-${entity.img}`" />
					</span>
				<div class="truncate">
					{{ entity.name }}
				</div>
				<div class="actions">
					<div>
						{{ entity.curHp}} / {{entity.maxHp}}
						<span v-if="entity.tempHp"> + {{ entity.tempHp }}</span>
					</div>
					<a class="btn btn-sm bg-neutral-5" @click="setSlide({show: true, type: 'slides/encounter/EditEntity', data: [entity.key] })">
						<i aria-hidden="true" class="fas fa-pencil"></i>
					</a>
					<q-input 
						:dark="$store.getters.theme === 'dark'" filled square dense
						type="number" 
						class="ml-2 player-initiative"
						v-model="entity.initiative" 
						min="0" 
						max="99" 
						name="playerInit" 
						placeholder="0"
						@focus="$event.target.select()"
						@input="set_initiative({key: entity.key, initiative: entity.initiative})" 
					/>
				</div>
			</li>
		</ul>
	</div>
</template>

<script>
	import { mapGetters, mapActions } from 'vuex'

	export default {
		name: 'SetInitiativePlayer',
		props: ['players'],
		computed: {
			...mapGetters([
				'campaignId',
				'encounterId',
				'entities',
				'path',
			]),
		},
		methods: {
			...mapActions([
				'setSlide',
				'set_initiative'
			])
		}
	}
</script>

<style lang="scss" scoped>
	ul.entities li {
		padding-right: 3px;
		
		.actions {
			align-items: center;
			padding: 0;
		}
	}
</style>