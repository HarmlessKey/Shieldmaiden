<template>
	<div>
		<hk-tip value="initiative-overview" title="Actions">
			<template #content>
				<p>
					<i aria-hidden="true" class="hki-surprised" />
					Reminds you this entity was surprised when their turn starts.
				</p>
				<p>
					<i aria-hidden="true" class="fas fa-eye-slash white" />
					Hides the entity from your players on the 
					<a @click="setSlide({show: true, type: 'PlayerLink' })">public initiative list</a>.
				</p>
				<span>
					<i aria-hidden="true" class="fas fa-minus white" /> 
					Moves the entity to a seperate initiative 
					list that is hidden for your players, from which they can quickly be added.
				</span>
			</template>
		</hk-tip>
		<ul class="entities hasImg">
			<li v-for="(entity) in active" v-bind:key="entity.key">
				<span v-if="entity.hidden" class="img"><i aria-hidden="true" class="fas fa-eye-slash red"></i></span>
				<span v-else-if="entity.reminders.surprised" class="img orange"><i aria-hidden="true" class="hki hki-surprised"></i></span>
				<template v-else>
					<span 
						class="img pointer" 
						:style="{
							'background-image': 'url(' + entity.img + ')',
							'border-color': entity.color_label ? entity.color_label : ``,
							'color': entity.color_label ? entity.color_label : ``
						}"
					>
						<i aria-hidden="true" v-if="['monster', 'player', 'companion'].includes(entity.img)" :class="`hki-${entity.img}`" />
					</span>
				</template>
				<div class="overview-item">
					<div class="name truncate">{{ entity.name.capitalizeEach() }}</div>
					<b class="blue initiative">{{ entity.initiative }}</b>
				</div>
				<div class="actions">
					<!-- Surprise / Unsurprise Entity commented out code to add surprised condition -->
					<a v-if="!entity.reminders.surprised" class="btn btn-sm bg-neutral-5" @click="setSurprised(entity.key, true)">
						<i aria-hidden="true" class="hki-surprised"></i>
						<q-tooltip anchor="top middle" self="center middle">
							Set surprised
						</q-tooltip>
					</a>
					<a v-else class="btn btn-sm bg-neutral-5" @click="setSurprised(entity.key, false)">
						<i aria-hidden="true" class="hki-surprised"></i>
						<q-tooltip anchor="top middle" self="center middle">
							Remove surprised
						</q-tooltip>
					</a>
					<!-- Hide / Unhide Entity -->
					<a v-if="!entity.hidden" class="btn btn-sm bg-neutral-5" @click="set_hidden({key: entity.key, hidden: true})">
						<i aria-hidden="true" class="fas fa-eye-slash"></i>
						<q-tooltip anchor="top middle" self="center middle">
							Set hidden
						</q-tooltip>
					</a>
					<a v-else class="btn btn-sm bg-neutral-5 mr-1" @click="set_hidden({key: entity.key, hidden: false})">
						<i aria-hidden="true" class="fas fa-eye"></i>
						<q-tooltip anchor="top middle" self="center middle">
							Unhide
						</q-tooltip>
					</a>
					<a class="btn btn-sm bg-neutral-5" @click="set_active({key: entity.key, active: false})">
						<i aria-hidden="true" class="fas fa-minus"></i>
						<q-tooltip anchor="top middle" self="center middle">
							Set inactive
						</q-tooltip>
					</a>
				</div>
			</li>
		</ul>
	
		<h2>Inactive</h2>

		<ul class="entities hasImg">
			<li v-for="(entity) in idle" v-bind:key="entity.key">
				<span 
					class="img pointer" 
					:style="{
						'background-image': 'url(' + entity.img + ')',
						'border-color': entity.color_label ? entity.color_label : ``,
						'color': entity.color_label ? entity.color_label : ``
					}"
				>
					<i aria-hidden="true" v-if="['monster', 'player', 'companion'].includes(entity.img)" :class="`hki-${entity.img}`" />
				</span>
				<span class="d-flex justify-content-between">
					{{ entity.name }}
					<span>{{ entity.initiative }}</span>
				</span>
				<div class="actions">
					<a @click="set_active({key: entity.key, active: true})">
						<i aria-hidden="true" class="fas fa-plus"></i>
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
	ul.entities li {
		padding-right: 3px;

		.actions {
			align-items: center;

			a {
				margin-left: 5px;
			}
		}
	}
</style>