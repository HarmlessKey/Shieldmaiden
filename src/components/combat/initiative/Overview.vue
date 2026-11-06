<template>
	<div>
		<hk-tip value="initiative-overview" title="Actions">
			<template #content>
				<p>
					Click an entity to target it, shift+click to target more. The header's actions, like
					Effects, act on the targeted entities.
				</p>
				<p>
					<i aria-hidden="true" class="hki-surprised" />
					Gives the entity the Surprised effect.
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
				:class="{ targeted: targeted.includes(entity.key) }"
				tabindex="0"
				@click="selectTarget($event, entity.key)"
				@keydown.space.prevent="selectTarget($event, entity.key)"
				@keydown.s="setSurprised(entity.key, !surprised(entity))"
				@keydown.h="set_hidden({ key: entity.key, hidden: !entity.hidden })"
				@keydown.a="set_active({ key: entity.key, active: false })"
			>
				<BasicEntity :entity="entity" :size="48" :padding="8">
					<strong class="set-initiative">{{ entity.initiative }}</strong>
					<div class="actions">
						<!-- Surprised: the SRD Surprised effect of the campaign's edition (effects 8) -->
						<button
							v-if="!surprised(entity)"
							class="btn btn-sm bg-neutral-8"
							@click.stop="setSurprised(entity.key, true)"
						>
							<i aria-hidden="true" class="hki-surprised"></i>
							<q-tooltip anchor="top middle" self="center middle"
								>Set surprised <hk-show-keybind :binds="['s']"
							/></q-tooltip>
						</button>
						<button v-else class="btn btn-sm bg-neutral-8" @click.stop="setSurprised(entity.key, false)">
							<i aria-hidden="true" class="hki-surprised"></i>
							<q-tooltip anchor="top middle" self="center middle"
								>Remove surprised <hk-show-keybind :binds="['s']"
							/></q-tooltip>
						</button>
						<!-- Hide / Unhide Entity -->
						<button
							v-if="!entity.hidden"
							class="btn btn-sm bg-neutral-8"
							@click.stop="set_hidden({ key: entity.key, hidden: true })"
						>
							<i aria-hidden="true" class="fas fa-eye-slash"></i>
							<q-tooltip anchor="top middle" self="center middle"
								>Hide <hk-show-keybind :binds="['h']"
							/></q-tooltip>
						</button>
						<button
							v-else
							class="btn btn-sm bg-neutral-8"
							@click.stop="set_hidden({ key: entity.key, hidden: false })"
						>
							<i aria-hidden="true" class="fas fa-eye"></i>
							<q-tooltip anchor="top middle" self="center middle"
								>Unhide <hk-show-keybind :binds="['h']"
							/></q-tooltip>
						</button>
						<button
							class="btn btn-sm bg-neutral-8"
							@click.stop="set_active({ key: entity.key, active: false })"
						>
							<i aria-hidden="true" class="fas fa-minus"></i>
							<q-tooltip anchor="top middle" self="center middle"
								>Set inactive <hk-show-keybind :binds="['a']"
							/></q-tooltip>
						</button>
					</div>
				</BasicEntity>
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
					<button
						class="btn btn-sm bg-neutral-8"
						@click="set_active({ key: entity.key, active: true })"
					>
						<i aria-hidden="true" class="fas fa-plus"></i>
						<q-tooltip anchor="top middle" self="center middle"> Set active [a] </q-tooltip>
					</button>
				</div>
			</li>
		</ul>
	</div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import { general } from "src/mixins/general.js";
import BasicEntity from "../entities/BasicEntity.vue";
import { findSrdDefinition, hasSurprised, surprisedInstance } from "src/utils/effectFunctions";

export default {
	name: "SetInitiativeNPC",
	mixins: [general],
	components: {
		BasicEntity,
	},
	props: ["active", "idle"],
	computed: {
		...mapGetters(["targeted", "edition"]),
	},
	methods: {
		...mapActions([
			"set_active",
			"set_hidden",
			"set_initiative",
			"set_targeted",
			"setDrawer",
			"apply_effect",
			"remove_effect",
		]),
		/**
		 * Targets an entity as in the tracker: a click targets only it, shift or ctrl+click adds
		 * or removes it (effects 8)
		 */
		selectTarget(event, key) {
			this.set_targeted({ type: event.shiftKey || event.ctrlKey ? "multi" : "single", key });
		},
		surprised(entity) {
			return hasSurprised(entity);
		},
		/**
		 * Applies or removes the SRD Surprised effect of the campaign's edition (effects 8)
		 */
		setSurprised(key, value) {
			if (!value) {
				return this.remove_effect({ key, source: "srd", source_key: "surprised" });
			}
			const definition = findSrdDefinition(this.edition, "surprised") || { name: "Surprised" };
			const instance = surprisedInstance({ edition: this.edition, definition });
			return this.apply_effect({ key, instance, definition });
		},
	},
};
</script>

<style lang="scss" scoped>
.entity {
	cursor: pointer;
	// Shift+click targets several; it shouldn't select the text in between
	user-select: none;

	// Targeted on the set initiative screen, like the tracker's targets
	&.targeted {
		outline: $blue solid 3px;
	}
}
.set-initiative {
	font-weight: bold;
	font-size: 20px;
	color: $neutral-1;
	margin-right: 8px;
}
</style>
