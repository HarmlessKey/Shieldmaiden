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
					<a @click="setDrawer({ show: true, type: 'PlayerLink' })">public initiative list</a>.
				</p>
				<span>
					<i aria-hidden="true" class="fas fa-minus white" />
					Moves the entity to a separate initiative list that is hidden for your players, from which
					they can quickly be added.
				</span>
			</template>
		</hk-tip>
		<ul class="entities">
			<li
				v-for="entity in active"
				v-bind:key="entity.key"
				class="entity"
				tabindex="0"
				@keydown.s="setSurprised(entity.key, !entity.reminders.surprised)"
				@keydown.h="set_hidden({ key: entity.key, hidden: !entity.hidden })"
				@keydown.a="set_active({ key: entity.key, active: false })"
			>
				<BasicEntity :entity="entity" :size="48" :padding="8" />
				<strong class="set-initiative">{{ entity.initiative }}</strong>
				<div class="actions">
					<!-- Surprise / Unsurprise Entity commented out code to add surprised condition -->
					<button
						v-if="!entity.reminders.surprised"
						class="btn btn-sm bg-neutral-8"
						@click="setSurprised(entity.key, true)"
					>
						<i aria-hidden="true" class="hki-surprised"></i>
						<q-tooltip anchor="top middle" self="center middle">Set surprised <hk-show-keybind :binds="['s']" /></q-tooltip>
					</button>
					<button v-else class="btn btn-sm bg-neutral-8" @click="setSurprised(entity.key, false)">
						<i aria-hidden="true" class="hki-surprised"></i>
						<q-tooltip anchor="top middle" self="center middle">Remove surprised <hk-show-keybind :binds="['s']" /></q-tooltip>
					</button>
					<!-- Hide / Unhide Entity -->
					<button
						v-if="!entity.hidden"
						class="btn btn-sm bg-neutral-8"
						@click="set_hidden({ key: entity.key, hidden: true })"
					>
						<i aria-hidden="true" class="fas fa-eye-slash"></i>
						<q-tooltip anchor="top middle" self="center middle">Hide <hk-show-keybind :binds="['h']" /></q-tooltip>
					</button>
					<button
						v-else
						class="btn btn-sm bg-neutral-8"
						@click="set_hidden({ key: entity.key, hidden: false })"
					>
						<i aria-hidden="true" class="fas fa-eye"></i>
						<q-tooltip anchor="top middle" self="center middle">Unhide <hk-show-keybind :binds="['h']" /></q-tooltip>
					</button>
					<button
						class="btn btn-sm bg-neutral-8"
						@click="set_active({ key: entity.key, active: false })"
					>
						<i aria-hidden="true" class="fas fa-minus"></i>
						<q-tooltip anchor="top middle" self="center middle">Set inactive <hk-show-keybind :binds="['a']" /></q-tooltip>
					</button>
				</div>
			</li>
		</ul>

		<h2>Inactive</h2>

		<ul class="entities hasImg">
			<li
				v-for="entity in idle"
				v-bind:key="entity.key"
				tabindex="0"
				@keydown.a="set_active({ key: entity.key, active: true })"
			>
				<BasicEntity :entity="entity" :size="48" :padding="8" />
				<strong class="set-initiative">{{ entity.initiative }}</strong>
				<div class="actions">
					<button class="btn btn-sm bg-neutral-8" @click="set_active({ key: entity.key, active: true })">
						<i aria-hidden="true" class="fas fa-plus"></i>
						<q-tooltip anchor="top middle" self="center middle"> Set active [a] </q-tooltip>
					</button>
				</div>
			</li>
		</ul>
	</div>
</template>

<script>
import { mapActions } from "vuex";
import { general } from "src/mixins/general.js";
import { remindersMixin } from "src/mixins/reminders";
import BasicEntity from "../entities/BasicEntity.vue";

export default {
	name: "SetInitiativeNPC",
	mixins: [general, remindersMixin],
	components: {
		BasicEntity,
	},
	props: ["active", "idle"],
	methods: {
		...mapActions([
			"set_active",
			"set_hidden",
			"set_initiative",
			"set_condition",
			"set_targetReminder",
			"setDrawer",
		]),
		setSurprised(entity_key, value) {
			const reminder = this.premade.surprised;
			delete reminder[".key"];
			const action = value ? "add" : "remove";

			this.set_targetReminder({
				action: action,
				entity: entity_key,
				key: "surprised",
				reminder: reminder,
				type: "premade",
			});
		},
	},
};
</script>

<style lang="scss" scoped>
	.set-initiative {
		font-weight: bold;
		font-size: 20px;
		color: $neutral-1;
		margin-right: 8px;
	}
</style>
