<template>
	<div>
		<div v-if="!loading">
			<hk-card-deck>
				<template v-for="(t, key) in tiers">
					<hk-card
						v-if="!legacy_tiers.includes(t['.key'])"
						:key="key"
						:class="{ current: t.name === tier?.name }"
					>
						<div slot="header" class="card-header flex-col items-start">
							<strong>{{ t.name }}</strong>
							<span class="neutral-2">{{ t.description }}</span>
						</div>
						<div class="card-body">
							<div class="top">
								<h2>{{ t.price }}</h2>
								<em v-if="t.price === 'Free'" class="neutral-2 sub">forever</em>
								<em v-else class="neutral-2 sub">per month</em>
							</div>
							<ul>
								<li v-for="(benefit, key) in benefits" :key="key">
									<i
										v-if="typeof t.benefits[key] === 'boolean'"
										aria-hidden="true"
										class="fas"
										:class="t.benefits[key] ? 'fa-check green' : 'fa-times neutral-3'"
									/>
									<template v-else>
										<i
											aria-hidden="true"
											v-if="t.benefits[key] === 'infinite'"
											class="green far fa-infinity"
										/>
										<strong v-else :class="t.benefits[key] === '-' ? 'neutral-3' : 'green'">{{
											t.benefits[key]
										}}</strong>
									</template>
									<span>
										{{ benefit.title }}
										<span v-if="key === 'character_sync'" class="neutral-3">*</span>
									</span>
								</li>
							</ul>
							<ul class="storage">
								<li v-for="storage_type in storage" :key="storage_type">
									<i
										aria-hidden="true"
										v-if="t.benefits[storage_type] == 'infinite'"
										class="green far fa-infinity"
									/>
									<span v-else class="green">{{ t.benefits[storage_type] }}</span>
									<span>
										{{ storageType(storage_type, t.benefits[storage_type]) }}
										<span v-if="storage_type === 'encounters'" class="neutral-3">
											(per campaign)
										</span>
									</span>
								</li>
							</ul>
						</div>
						<div slot="footer" v-if="t.price != 'Free'">
							<a
								:href="'https://www.patreon.com/join/shieldmaidenapp/checkout?rid=' + t['.key']"
								target="_blank"
								rel="noopener"
								class="btn btn-block btn-square bg-patreon-red"
								>Join {{ t.price }} tier</a
							>
						</div>
					</hk-card>
				</template>
			</hk-card-deck>
			<small class="d-block text-center">
				<span class="neutral-3">*</span> Character Sync requires <strong>Chrome</strong> as your
				browser and the
				<a
					href="https://chrome.google.com/webstore/detail/dd-character-sync/jgcbbmbchbkdjbgiiheminkkkecjohpg"
					target="_blank"
					rel="noopener"
				>
					D&D Character Sync Chrome Extension</a
				>.
			</small>
		</div>
		<hk-loader v-else name="tiers" />
	</div>
</template>

<script>
import { mapGetters } from "vuex";
import { db } from "src/firebase";
import { legacy_tiers } from "src/utils/generalConstants";

export default {
	name: "Tiers",
	data() {
		return {
			loading: true,
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
				import: {
					title: "Import content",
				},
				storage: {
					title: "Storage",
				},
			},
			legacy_tiers,
			storage: ["campaigns", "encounters", "players", "npcs", "spells", "reminders", "items"],
		};
	},
	firebase() {
		return {
			tiers: {
				source: db.ref("tiers").orderByChild("order"),
				readyCallback: () => (this.loading = false),
			},
		};
	},
	computed: {
		...mapGetters(["tier"]),
	},
	methods: {
		storageType(type, count) {
			type === "npcs" ? type.slice(0, -1).toUpperCase() : type.slice(0, -1).capitalize();
			return count === "infinite" || count > 1 ? `${type}s` : type;
		},
	},
};
</script>

<style lang="scss" scoped>
.hk-card {
	&.current {
		border-color: $patreon-red !important;
	}
	.card-header {
		strong {
			font-size: 18px;
		}
	}
	.card-body {
		padding: 0;

		.top {
			padding: 15px;
			h2 {
				margin-bottom: 0 !important;
			}
			i.sub {
				display: block;
			}
		}

		ul {
			list-style: none;
			padding: 0;
			margin: 0;

			li {
				display: grid;
				grid-template-columns: 30px 1fr;
				line-height: 35px;
				align-items: center;
				font-size: 15px;
				padding: 0 5px 0 15px;
				color: $neutral-1;
				margin-bottom: 1px;
			}
			&.storage {
				padding-left: 20px;
				margin-bottom: 15px;

				li {
					font-size: 13px;
					line-height: 25px;
				}
			}
		}
	}
}
</style>
