<template>
	<div class="target">
		<template v-if="targeted?.length === 1">
			<div class="target__manual">
				<template v-if="manual.value && !targeted.includes(actor.key)">
					<div class="d-flex gap-1">
						<Defenses v-if="manual.type" :entity-key="key" />
						<Multipliers :entity-key="key" />
					</div>
					<button class="btn bg-neutral-5 btn-block btn-sm" @click="applyDamage">
						Do <strong>{{ calculateAmount() }}</strong>
						<i
							v-if="manual.type"
							class="mx-1"
							:class="[damage_type_icons[manual.type], manual.type]"
							aria-hidden="true"
						/>
						damage
					</button>
				</template>
				<div v-else-if="targeted.includes(actor.key)" class="target__targeted-self">
					Targeted self
				</div>
				<Name v-else :entity="target" />
			</div>
			<Avatar :size="60" :key="key" :entity="target" />
		</template>
		<div v-else class="mt-1">
			<strong>Multitargeting</strong>
			<hk-icon icon="fas fa-clone" class="multi" />
		</div>
	</div>
</template>

<script>
import { mapGetters } from "vuex";
import Name from "../entities/Name.vue";
import Avatar from "../entities/Avatar.vue";
import Defenses from "../entities/multipliers/Defenses.vue";
import Multipliers from "../entities/multipliers/Multipliers.vue";
import { calculateManualDamage } from "src/utils/combatFunctions";
import { damage_type_icons } from "src/utils/generalConstants";
import { EventBus } from "src/event-bus";

export default {
	name: "Target",
	props: {
		actor: {
			type: Object,
			required: true,
		},
	},
	components: {
		Name,
		Avatar,
		Defenses,
		Multipliers,
	},
	data() {
		return {
			damage_type_icons: damage_type_icons,
		};
	},
	computed: {
		...mapGetters(["entities", "targeted", "manual", "target_multipliers"]),
		key() {
			return this.targeted?.[0];
		},
		target() {
			return this.entities?.[this.key];
		},
	},
	methods: {
		calculateAmount() {
			const multiplier = this.target_multipliers.multipliers?.[this.key];
			const defense = this.target_multipliers.defenses?.[this.key];
			return calculateManualDamage(this.manual, this.target, multiplier, defense);
		},
		applyDamage() {
			EventBus.$emit("applyManualValue", "damage");
		},
	},
};
</script>

<style lang="scss" scoped>
.target {
	display: flex;
	justify-content: flex-end;
	align-items: center;
	gap: 10px;
	flex-grow: 1;

	.entity-name {
		font-weight: bold;
	}
	.multi {
		color: $neutral-2;
		font-size: 35px;
		margin-left: 10px;
		vertical-align: -5px;
	}
	.target-avatar {
		transform: scale(-1, 1);
	}
	&__manual {
		display: flex;
		flex-direction: column;
		gap: 3px;
		justify-content: center;
		align-items: flex-end;
	}
	&__targeted-self {
		background-color: $orange;
		border-radius: $border-radius;
		padding: 3px 8px;
		font-weight: bold;
	}
}
</style>
