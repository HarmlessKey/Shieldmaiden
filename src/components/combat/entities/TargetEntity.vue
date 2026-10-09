<template>
	<div class="target-entity__container">
		<div
			class="target-entity__initiative"
			:style="{
				color: entity.color_label ? entity.color_label : ``,
				backgroundColor: entity.color_label ? entity.color_label : ``,
			}"
			@click.stop
		>
			<div class="target-entity__initiative-value truncate">
				{{ parseInt(entity.initiative) }}
			</div>
			<InitiativeQuickEdit :entity="entity" />
		</div>
		<div class="target-entity">
			<Avatar :entity="entity" :size="56" />
			<div class="target-entity__content">
				<div class="target-entity__content-info">
					<div class="target-entity__content-info__ac" @click.stop>
						<i aria-hidden="true" class="fas fa-shield" />
						<EffectModifiedValue :entity="effective" field="ac">
							<hk-animated-integer :value="displayStats(effective).ac" class="ac" />
						</EffectModifiedValue>
						<ArmorClassQuickEdit :entity="entity" />
					</div>
					<Name class="target-entity__content-info__name" :entity="entity" />
					<div class="target-entity__content-info__actions">
						<slot name="effects">
							<Effects :entity="entity" :available-space="effectSpace" collapse />
						</slot>
						<button class="btn btn-sm bg-neutral-8 target-menu__button" tabindex="-1" @click.stop>
							<i aria-hidden="true" class="fal fa-ellipsis-v" />
							<q-popup-proxy
								:dark="$store.getters.theme === 'dark'"
								anchor="bottom right"
								self="top right"
								:breakpoint="576"
							>
								<target-menu :entity="entity" />
							</q-popup-proxy>
						</button>
					</div>
					<q-resize-observer @resize="setSize" />
				</div>
				<div class="target-entity__health">
					<DeathSaves
						v-if="
							entity.entityType === 'player' && entity.curHp === 0 && !entity.stable && !entity.dead
						"
						:target="entity"
					/>
					<div v-else-if="entity.dead" class="target-entity__health-dead red">
						<i aria-hidden="true" class="fas fa-skull-crossbones" /> Dead
					</div>
					<HealthBar v-else :entity="effective" />
					<div v-if="!entity.dead" class="target-entity__health-values" @click.stop>
						<hk-animated-integer :value="displayStats(effective).curHp" />
						/
						<EffectModifiedValue :entity="effective" field="maxHp">
							<hk-animated-integer :value="displayStats(effective).maxHp" />
						</EffectModifiedValue>
						<HealthQuickEdit :entity="entity" />
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import InitiativeQuickEdit from "./quick-edit/InitiativeQuickEdit.vue";
import ArmorClassQuickEdit from "./quick-edit/ArmorClassQuickEdit.vue";
import HealthQuickEdit from "./quick-edit/HealthQuickEdit.vue";
import TargetMenu from "../TargetMenu.vue";
import Effects from "./effects";
import Avatar from "./Avatar.vue";
import Name from "./Name.vue";
import HealthBar from "./HealthBar.vue";
import DeathSaves from "../DeathSaves.vue";
import EffectModifiedValue from "./EffectModifiedValue.vue";
import { displayStats } from "src/utils/entityFunctions";

export default {
	name: "TargetEntity",
	components: {
		Avatar,
		Name,
		TargetMenu,
		Effects,
		HealthBar,
		InitiativeQuickEdit,
		ArmorClassQuickEdit,
		HealthQuickEdit,
		DeathSaves,
		EffectModifiedValue,
	},
	props: {
		entity: {
			type: Object,
			required: true,
		},
	},
	data() {
		return {
			effectSpace: 0,
		};
	},
	computed: {
		// With the values its active effects give it; quick edits keep the stored entity
		effective() {
			return this.$store.getters.effective_entity?.(this.entity.key) || this.entity;
		},
	},
	methods: {
		displayStats, // imported utility function
		setSize(dimensions) {
			const AC_SIZE = 33 + 6; // width + gap
			const MIN_NAME_SIZE = 50 + 6; // width + gap
			const MENU_SIZE = 20 + 5; // width + gap
			this.effectSpace = dimensions.width - AC_SIZE - MIN_NAME_SIZE - MENU_SIZE;
		},
	},
};
</script>

<style lang="scss" scoped>
.target-entity {
	display: flex;
	gap: 5px;
	user-select: none;
	width: 100%;
	overflow: hidden;

	&__container {
		display: flex;
		align-items: center;
	}
	&__initiative {
		border-top-left-radius: 9999px;
		border-bottom-left-radius: 9999px;
		background-color: $neutral-7;
		color: $neutral-7;
		padding: 0 5px 0 7px;
		line-height: 28px;
		min-width: 16px;
		width: 16px;
		box-sizing: content-box;
		margin-left: -25px;
		z-index: 20;
		text-align: center;
		border: solid 2px $neutral-5;
		border-right: none;

		&-value {
			font-size: 13px;
			font-weight: bold;
			filter: invert(1) grayscale(1) brightness(1.3) contrast(9000);
			mix-blend-mode: luminosity;
			opacity: 0.95;
			margin-top: -1px;
		}
	}
	.target-avatar {
		background-color: $neutral-7;
		border-radius: $border-radius;
		text-align: center;
	}
	&__content {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		height: 56px;
		gap: 6px;
		flex-grow: 1;
		min-width: 0;
		position: relative;

		&-info {
			display: flex;
			align-items: center;
			flex-grow: 1;
			gap: 6px;

			&__ac {
				position: relative;
				cursor: pointer;
				color: $neutral-4;
				width: 33px;
				min-width: 33px;
				height: 100%;

				i,
				.ac {
					position: absolute;
					top: 50%;
					transform: translateY(-50%);
					line-height: 35px;
					width: 100%;
					text-align: center;
				}
				i {
					font-size: 33px;
					margin-top: 1px;
				}
				.ac {
					font-weight: bold;
					color: $neutral-1;
				}
				// Changed by effects or manual bonuses, as on the card
				.effect-modified-value.modified .ac {
					color: $blue;
				}
			}
			&__name {
				font-weight: bold;
				min-width: 50px;
			}
			&__actions {
				display: flex;
				justify-content: flex-end;
				gap: 5px;
				align-items: center;
				flex-grow: 1;
			}
		}
	}
	&__health {
		display: flex;
		align-items: center;
		gap: 5px;

		&-values {
			font-weight: bold;
			white-space: nowrap;
			line-height: 16px;
		}
		&-dead {
			font-weight: bold;
			line-height: 16px;
		}
		::v-deep {
			.saves {
				font-size: 13px;

				&__wrapper {
					width: 100%;
				}
			}
		}
	}
}
</style>
