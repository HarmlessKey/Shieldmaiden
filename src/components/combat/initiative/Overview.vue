<template>
	<div>
		<hk-tip value="initiative-overview" title="Actions">
			<template #content>
				<p>
					<icon icon="surprised" class="icon white" /> 
					Reminds you this entity was surprised when their turn starts.
				</p>
				<p>
					<i class="fas fa-eye-slash white" />
					Hides the entity from your players on the 
					<a @click="setSlide({show: true, type: 'PlayerLink' })">track encounter screen</a>.
				</p>
				<span>
					<i class="fas fa-minus white" /> 
					Moves the entity to a seperate initiative 
					list from where they can quickly be added.
				</span>
			</template>
		</hk-tip>
		<ul class="entities hasImg">
			<li v-for="(entity) in active" v-bind:key="entity.key">
				<span v-if="entity.hidden" class="img"><i class="fas fa-eye-slash red"></i></span>
				<icon 
					v-else-if="entity.reminders.surprised" 
					class="img pointer orange"
					icon="surprised" 
				/>
				<template v-else>
					<icon 
						v-if="['monster', 'player', 'companion'].includes(entity.img)" 
						class="img pointer" 
						:icon="entity.img" 
						:fill="entity.color_label" :style="entity.color_label ? `border-color: ${entity.color_label}` : ``"
					/>
					<span 
						v-else class="img pointer" 
						:style="{
							'background-image': 'url(' + entity.img + ')',
							'border-color': entity.color_label ? entity.color_label : ``
						}"
					/>
				</template>
				<div class="overview-item">
					<div class="name truncate">{{ entity.name.capitalizeEach() }}</div>
					<b class="blue initiative">{{ entity.initiative }}</b>
				</div>
				<div class="actions">
					<!-- Surprise / Unsurprise Entity commented out code to add surprised condition -->
					<!-- <a v-if="!entity.conditions.surprised" class="pointer" @click="set_condition({action:'add', key: entity.key, condition:'surprised'})"> -->
					<a v-if="!entity.reminders.surprised" class="pointer" @click="setSurprised(entity.key, true)">
						
						<icon icon="surprised" class="icon"/>
						<q-tooltip anchor="top middle" self="center middle">
							Set surprised
						</q-tooltip>
					</a>
					<!-- <a v-else class="pointer" @click="set_condition({action:'remove', key: entity.key, condition:'surprised'})"> -->
					<a v-else class="pointer" @click="setSurprised(entity.key, false)">

						<icon icon="character" class="icon"/>
						<q-tooltip anchor="top middle" self="center middle">
							Remove surprised
						</q-tooltip>
					</a>
					<!-- Hide / Unhide Entity -->
					<a v-if="!entity.hidden" class="pointer" @click="set_hidden({key: entity.key, hidden: true})">
						<i class="fas fa-eye-slash"></i>
						<q-tooltip anchor="top middle" self="center middle">
							Set hidden
						</q-tooltip>
					</a>
					<a v-else class="pointer mr-1" @click="set_hidden({key: entity.key, hidden: false})">
						<i class="fas fa-eye"></i>
						<q-tooltip anchor="top middle" self="center middle">
							Unhide
						</q-tooltip>
					</a>
					<a class="pointer mr-2" @click="set_active({key: entity.key, active: false})">
						<i class="fas fa-minus"></i>
						<q-tooltip anchor="top middle" self="center middle">
							Set inactive
						</q-tooltip>
					</a>
				</div>
			</li>
		</ul>
	
		<span class="d-flex justify-content-between pl-3">
			<h2>Inactive</h2>
		</span>

		<ul class="entities hasImg">
			<li v-for="(entity) in idle" v-bind:key="entity.key">
				<icon 
					v-if="['monster', 'player', 'companion'].includes(entity.img)" 
					class="img pointer" 
					:icon="entity.img" 
					:fill="entity.color_label" :style="entity.color_label ? `border-color: ${entity.color_label}` : ``"
				/>
				<span 
					v-else class="img pointer" 
					:style="{
						'background-image': 'url(' + entity.img + ')',
						'border-color': entity.color_label ? entity.color_label : ``
					}"
				/>
				<span class="d-flex justify-content-between">
					{{ entity.name }}
					<span>{{ entity.initiative }}</span>
				</span>
				<div class="actions">
					<a @click="set_active({key: entity.key, active: true})">
						<i class="fas fa-plus"></i>
						<q-tooltip anchor="top middle" self="center middle">
							Set active
						</q-tooltip>
					</a>
				</div>
			</li>
		</ul>
	</div>
</template>

<script>
	import { mapActions } from 'vuex';
	import { general } from '@/mixins/general.js';
	import { remindersMixin } from '@/mixins/reminders';

	export default {
		name: 'SetInitiativeNPC',
		mixins: [general, remindersMixin],
		props: ['active', 'idle'],
		data () {
			return {

			}
		},
		methods: {
			...mapActions([
				'set_active',
				'set_hidden',
				'set_initiative',
				'set_condition',
				'set_targetReminder',
				"setSlide"
			]),
			setSurprised(entity_key, value) {
				const reminder = this.premade.surprised;
				delete reminder['.key'];
				let action = value ? 'add' : 'remove';

				this.set_targetReminder({
					action: action,
					entity: entity_key,
					key: 'surprised',
					reminder: reminder,
					type: 'premade',
				})
			},
		}
	}
</script>

<style lang="scss" scoped>
#container {
	ul.entities {
		padding:0 15px 0 10px;

		li {
			border: solid 1px transparent;
			background:$gray-dark;

			&:hover {
				background: #141414 !important;
			}

			&.selected {
				border-color: $blue;
			}
			.img {
				font-size: 20px;
				line-height: 44px;
				text-align: center;
			}
		}
	}
}

// css for surprised icon
.actions {
	i, svg.icon {
		vertical-align: middle;
	}
	svg.icon {
		width: 20px;
	}
}

.initiative-move {
  transition: transform .5s;
}

.tip {
	margin: 0 15px 0 10px;

	.icon {
		width: 20px;
	}
}
</style>