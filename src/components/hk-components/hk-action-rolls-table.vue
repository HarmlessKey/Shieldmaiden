<template>
	<hk-table :items="rolls" :columns="rollColumns" :showHeader="false">
		<div slot="roll" slot-scope="data" class="roll">
			<span>
				{{ calcAverage(data.row.dice_type, data.row.dice_count, data.row.fixed_val) }}
				({{ data.row.dice_count || "" }}{{ data.row.dice_type ? `d${data.row.dice_type}` : `` }}
				<template v-if="data.row.fixed_val && data.row.dice_count">
					{{ (data.row.fixed_val &lt; 0) ? `- ${Math.abs(data.row.fixed_val)}` : `+ ${data.row.fixed_val}`

					}})
				</template>
				<template v-else>{{ data.row.fixed_val }})</template>
				<q-tooltip v-if="versatile" anchor="top middle" self="bottom middle">
					{{ versatileOptions[0] || "Enter versatile option" }}
				</q-tooltip>
			</span>
			<span v-if="versatile && versatileRoll(data.row)">
				|
				{{
					calcAverage(
						data.row.versatile_dice_type || data.row.dice_type,
						data.row.versatile_dice_count || data.row.dice_count,
						data.row.versatile_fixed_val || data.row.fixed_val
					)
				}}
				({{ versatileRoll(data.row) }})
				<q-tooltip anchor="top middle" self="bottom middle">
					{{ versatileOptions[1] || "Enter versatile option" }}
				</q-tooltip>
			</span>
		</div>

		<span slot="type" slot-scope="data">
			<span v-if="type === 'healing'" class="healing">
				<i aria-hidden="true" class="fas fa-heart" /> Healing
			</span>
			<template v-else-if="data.row.damage_type">
				<span :class="data.row.damage_type">
					<i aria-hidden="true" :class="damage_type_icons[data.row.damage_type]" />
					{{ data.row.damage_type.capitalize() }}
					<q-tooltip v-if="versatile" anchor="top middle" self="bottom middle">
						{{ versatileOptions[1] || "Enter versatile option" }}
					</q-tooltip>
				</span>
				<template
					v-if="
						versatile &&
						data.row.versatile_damage_type &&
						data.row.versatile_damage_type !== data.row.damage_type
					"
				>
					|
					<span :class="data.row.versatile_damage_type">
						<i aria-hidden="true" :class="damage_type_icons[data.row.versatile_damage_type]" />
						{{ data.row.versatile_damage_type.capitalize() }}
						<q-tooltip anchor="top middle" self="bottom middle">
							{{ versatileOptions[1] || "Enter versatile option" }}
						</q-tooltip>
					</span>
				</template>
				damage
			</template>
		</span>

		<template slot="magical" slot-scope="data">
			<i
				v-if="data.row.magical || data.row.versatile_magical"
				class="fas fa-sparkles"
				aria-hidden="true"
			>
				<q-tooltip anchor="center right" self="center left"> Magical </q-tooltip>
			</i>
		</template>

		<template slot="fail" slot-scope="data" v-if="!['healing', 'damage'].includes(type)">
			{{
				type === "save"
					? `Save: ${application[data.row.save_fail_mod]}`
					: `Miss: ${application[data.row.miss_mod]}`
			}}
		</template>

		<!-- ACTIONS -->
		<div slot="actions" slot-scope="data" class="actions">
			<a
				class="ml-2 btn btn-sm bg-neutral-5"
				@click="$emit('edit', { roll_index: data.index, roll: data.row })"
			>
				<i aria-hidden="true" class="fas fa-pencil-alt"></i>
				<q-tooltip anchor="top middle" self="center middle">Edit</q-tooltip>
			</a>
			<a class="ml-2 btn btn-sm bg-neutral-5" @click="$emit('delete', data.index)">
				<i aria-hidden="true" class="fas fa-trash-alt"></i>
				<q-tooltip anchor="top middle" self="center middle">Delete</q-tooltip>
			</a>
		</div>
	</hk-table>
</template>

<script>
import { damage_type_icons } from "src/utils/generalConstants";

export default {
	name: "HkActionRollsTable",
	props: {
		rolls: {
			type: Array,
			required: true,
		},
		type: {
			type: String,
		},
		versatile: {
			type: Boolean,
			default: false,
		},
		versatileOptions: {
			type: Array,
			default: () => [],
		},
	},
	data() {
		return {
			damage_type_icons: damage_type_icons,
			rollColumns: {
				roll: {
					maxContent: true,
				},
				type: {
					truncate: true,
				},
				magical: {
					truncate: true,
				},
				fail: {
					truncate: true,
				},
				actions: {
					noPadding: true,
					maxContent: true,
				},
			},
			application: {
				0: "No effect",
				0.5: "Half damage",
				1: "Full damage",
			},
		};
	},
	methods: {
		calcAverage(dice_type = 0, dice_count = 0, modifier = 0) {
			return dice_type
				? Math.floor(((parseInt(dice_type) + 1) / 2) * parseInt(dice_count)) + parseInt(modifier)
				: parseInt(modifier);
		},
		versatileRoll(roll) {
			if (!roll.versatile_dice_count && !roll.versatile_dice_type && !roll.versatile_fixed_val) {
				return undefined;
			} else {
				let returnRoll = {};

				returnRoll.dice_count = roll.versatile_dice_count
					? roll.versatile_dice_count
					: roll.dice_count;
				returnRoll.dice_type = roll.versatile_dice_type ? roll.versatile_dice_type : roll.dice_type;
				returnRoll.fixed_val = roll.versatile_fixed_val ? roll.versatile_fixed_val : roll.fixed_val;

				let fixed;
				if (returnRoll.fixed_val !== undefined) {
					fixed =
						returnRoll.fixed_val < 0
							? ` - ${Math.abs(returnRoll.fixed_val)}`
							: ` + ${returnRoll.fixed_val}`;
				}

				return `${returnRoll.dice_count}d${returnRoll.dice_type}${fixed}`;
			}
		},
	},
};
</script>
