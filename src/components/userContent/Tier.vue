<template>
	<div>
		<ul class="benefits">
			<li
				v-for="(benefit, key) in benefits"
				class="benefit"
				:class="{ pointer: key === 'storage', open: show_storage }"
				:key="key"
				@click="key === 'storage' ? (show_storage = !show_storage) : null"
			>
				<i
					v-if="typeof tier.benefits[key] === 'boolean'"
					aria-hidden="true"
					class="fas"
					:class="tier.benefits[key] ? 'fa-check green' : 'fa-times neutral-3'"
				/>
				<template v-else>
					<i
						aria-hidden="true"
						v-if="tier.benefits[key] === 'infinite'"
						class="green far fa-infinity"
					/>
					<strong v-else :class="tier.benefits[key] === '-' ? 'neutral-3' : 'green'">{{
						tier.benefits[key]
					}}</strong>
				</template>
				<span class="flex justify-between items-center">
					{{ benefit.title }}
					<i aria-hidden="true" v-if="key === 'storage'" class="mr-2 far fa-chevron-down" />
				</span>
			</li>
		</ul>
		<q-slide-transition>
			<ul v-show="show_storage">
				<li v-for="storage_type of storage" class="storage" :key="storage_type">
					<i
						aria-hidden="true"
						v-if="tier.benefits[storage_type] === 'infinite'"
						class="green far fa-infinity"
					/>
					<span
						v-else
						class="count"
						:class="
							content_count[storage_type] > tier.benefits[storage_type]
								? 'red'
								: content_count[storage_type] === tier.benefits[storage_type]
								? 'neutral-2'
								: 'green'
						"
					>
						{{ tier.benefits[storage_type] }}
					</span>
					<span class="truncate neutral-4">
						<span class="neutral-1">
							{{ storage_type.slice(0, -1).capitalize()
							}}{{
								tier.benefits[storage_type] > 1 || tier.benefits[storage_type] === "infinite"
									? "s"
									: ""
							}}
						</span>
						<span v-if="storage_type === 'encounters'" class="neutral-4"> (per campaign) </span>
					</span>
				</li>
			</ul>
		</q-slide-transition>
	</div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
	name: "Tier",
	data() {
		return {
			show_storage: false,
			benefits: {
				character_sync: {
					title: "Character sync",
				},
				avatars: {
					title: "Avatar crop & upload",
				},
				background: {
					title: "Background effects",
				},
				storage: {
					title: "Storage",
				},
			},
			storage: ["campaigns", "encounters", "players", "npcs", "spells", "reminders", "items"],
		};
	},
	computed: {
		...mapGetters(["tier", "content_count"]),
	},
};
</script>

<style lang="scss" scoped>
ul {
	padding: 0;
	list-style: none;
	margin: 0;

	li {
		display: grid;
		grid-template-columns: 30px 1fr;
		line-height: 35px;
		align-items: center;
		font-size: 15px;
		padding: 0 5px 0 15px;
		color: $neutral-1;
		background-color: $neutral-9;
		margin-bottom: 1px;

		.fa-chevron-down {
			transition: transform 0.2s linear;
		}
		&.open {
			.fa-chevron-down {
				transform: rotate(180deg);
			}
		}
	}
	li.storage {
		padding-left: 35px;
		background-color: $neutral-8;
	}
}
</style>
