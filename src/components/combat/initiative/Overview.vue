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
					Moves the entity to a separate initiative 
					list that is hidden for your players, from which they can quickly be added.
				</span>
			</template>
		</hk-tip>
		<ul class="entities hasImg">
			<li 
				v-for="(entity) in active"
				v-bind:key="entity.key"
				class="entity"
				tabindex="0"
				@keydown.s="setSurprised(entity.key, !entity.reminders.surprised)"
				@keydown.h="set_hidden({key: entity.key, hidden: !entity.hidden})"
				@keydown.a="set_active({key: entity.key, active: false})"
			>
				<span v-if="entity.hidden" class="img"><i aria-hidden="true" class="fas fa-eye-slash red"></i></span>
				<span v-else-if="entity.reminders.surprised" class="img orange"><i aria-hidden="true" class="hki hki-surprised"></i></span>
				<template v-else>
					<span 
						class="img" 
						:style="{
							'background-image': entity.img ? 'url(' + entity.img + ')' : '',
							'border-color': entity.color_label ? entity.color_label : ``,
							'color': entity.color_label ? entity.color_label : ``
						}"
					>
						<i aria-hidden="true" v-if="!entity.img" :class="`hki-${entity.entityType === 'npc' ? 'monster' : entity.entityType}`" />
					</span>
				</template>
				<div class="overview-item">
					<div class="name truncate">{{ entity.name.capitalizeEach() }}</div>
					<strong class="blue initiative">{{ entity.initiative }}</strong>
				</div>
				<div class="actions">
					<!-- Surprise / Unsurprise Entity commented out code to add surprised condition -->
					<a v-if="!entity.reminders.surprised" class="btn btn-sm bg-neutral-5" @click="setSurprised(entity.key, true)">
						<i aria-hidden="true" class="hki-surprised"></i>
						<q-tooltip anchor="top middle" self="center middle">
							Set surprised [s]
						</q-tooltip>
					</a>
					<a v-else class="btn btn-sm bg-neutral-5" @click="setSurprised(entity.key, false)">
						<i aria-hidden="true" class="hki-surprised"></i>
						<q-tooltip anchor="top middle" self="center middle">
							Remove surprised [s]
						</q-tooltip>
					</a>
					<!-- Hide / Unhide Entity -->
					<a v-if="!entity.hidden" class="btn btn-sm bg-neutral-5" @click="set_hidden({key: entity.key, hidden: true})">
						<i aria-hidden="true" class="fas fa-eye-slash"></i>
						<q-tooltip anchor="top middle" self="center middle">
							Set hidden [h]
						</q-tooltip>
					</a>
					<a v-else class="btn btn-sm bg-neutral-5" @click="set_hidden({key: entity.key, hidden: false})">
						<i aria-hidden="true" class="fas fa-eye"></i>
						<q-tooltip anchor="top middle" self="center middle">
							Unhide [h]
						</q-tooltip>
					</a>
					<a class="btn btn-sm bg-neutral-5" @click="set_active({key: entity.key, active: false})">
						<i aria-hidden="true" class="fas fa-minus"></i>
						<q-tooltip anchor="top middle" self="center middle">
							Set inactive [a]
						</q-tooltip>
					</a>
				</div>
			</li>
		</ul>
	
		<h2>Inactive</h2>

		<ul class="entities hasImg">
			<li v-for="(entity) in idle" v-bind:key="entity.key" tabindex="0" @keydown.a="set_active({key: entity.key, active: true})">
				<span 
					class="img" 
					:style="{
							'background-image': entity.img ? 'url(' + entity.img + ')' : '',
							'border-color': entity.color_label ? entity.color_label : ``,
							'color': entity.color_label ? entity.color_label : ``
						}"
				>
					<i aria-hidden="true" v-if="!entity.img" :class="`hki-${entity.entityType === 'npc' ? 'monster' : entity.entityType}`" />
				</span>
				<span class="d-flex justify-content-between">
					{{ entity.name }}
					<strong class="blue initiative">{{ entity.initiative }}</strong>
				</span>
				<div class="actions">
					<a class="btn btn-sm bg-neutral-5" @click="set_active({key: entity.key, active: true})">
						<i aria-hidden="true" class="fas fa-plus"></i>
						<q-tooltip anchor="top middle" self="center middle">
							Set active [a]
						</q-tooltip>
					</a>
				</div>
			</li>
		</ul>
	</div>
</template>

<script>
	import { mapActions } from 'vuex';
	import { general } from 'src/mixins/general.js';
	import { remindersMixin } from 'src/mixins/reminders';

	export default {
		name: 'SetInitiativeNPC',
		mixins: [general, remindersMixin],
		props: ['active', 'idle'],
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
				const action = value ? 'add' : 'remove';

				this.set_targetReminder({
					action: action,
					entity: entity_key,
					key: 'surprised',
					reminder: reminder,
					type: 'premade',
				});
			},
		}
	}
</script>

<style lang="scss" scoped>
	ul.entities {
		margin-top: 0;

		li {
			padding-right: 3px;
			background: $neutral-8;

			&:focus {
				outline: none;
				background: $neutral-9;
			}
			.actions {
				align-items: center;

				a {
					margin-left: 5px;
				}
			}
		}
	}
</style>