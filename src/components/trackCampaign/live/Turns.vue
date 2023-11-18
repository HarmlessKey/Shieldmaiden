<template>
	<div class="turns d-flex justify-content-center bg-neutral-8">
		<h2 v-if="encounter.finished">Finished</h2>
		<template v-else>
			<div class="timer">
				<i aria-hidden="true" class="fas fa-stopwatch" />
				<hk-timer :value="timer || 0" :key="encounter.turn" />
			</div>
			<div class="round-info d-flex justify-content-center" v-if="encounter.round">
				<div class="mr-3">
					<div>Round</div>
					<div class="number">{{ encounter.round }}</div>
				</div>
				<div>
					<div>Turn</div>
					<div class="number">
						{{ turn + 1 }}<span class="small neutral-4">/{{ entities_len }}</span>
					</div>
				</div>
			</div>

			<div class="img d-none d-md-block">
				<Avatar :entity="current" :players="players" :npcs="npcs" />
			</div>

			<h2 class="d-none d-md-flex justify-content-start">
				<span class="mr-3">
					<Name :entity="current" :players="players" :npcs="npcs" :npcSettings="npcSettings" />
				</span>

				<!-- Companion health is stored in campaign.companions -->
				<Health
					v-if="
						(playerSettings.health === undefined &&
							(current.entityType === 'player' || current.entityType === 'companion')) ||
						displayNPCField('health', current) === true
					"
					:entity="current"
					:campPlayers="campPlayers"
					:campCompanions="campCompanions"
					:players="players"
					:npcs="npcs"
				/>
				<template
					v-else-if="
						(current.entityType == 'player' && playerSettings.health === 'obscured') ||
						(current.entityType == 'npc' && displayNPCField('health', current) === 'obscured')
					"
				>
					<template v-if="current.curHp == 0">
						<i aria-hidden="true" class="fas fa-skull-crossbones red"></i>
					</template>
					<span v-else>
						<i
							aria-hidden="true"
							class="fas"
							:class="{
								'green fa-heart': percentage(current.curHp, current.maxHp) == 100,
								'orange fa-heart-broken':
									percentage(current.curHp, current.maxHp) < 100 &&
									percentage(current.curHp, current.maxHp) > 33,
								'red fa-heartbeat': percentage(current.curHp, current.maxHp) <= 33,
							}"
						></i>
					</span>
				</template>
				<span v-else class="neutral-4"> ? ? ? </span>
			</h2>
		</template>
		<span class="actions">
			<a
				v-if="encounter.weather && Object.keys(encounter.weather).length > 0"
				aria-label="Toggle weather effects"
				class="weather"
				@click="setWeather"
			>
				<i aria-hidden="true" v-if="weather" class="fas fa-cloud-showers" />
				<i aria-hidden="true" v-else class="fas fa-cloud hide" />
			</a>
			<a @click="$q.fullscreen.toggle()" class="full" aria-label="Toggle fullscreen">
				<q-icon :name="$q.fullscreen.isActive ? 'fullscreen_exit' : 'fullscreen'" />
				<q-tooltip anchor="bottom middle" self="top middle"> Fullscreen </q-tooltip>
			</a>
		</span>
	</div>
</template>

<script>
import { general } from "src/mixins/general.js";
import { trackEncounter } from "src/mixins/trackEncounter.js";
import Health from "./Health.vue";
import Name from "./Name.vue";
import Avatar from "./Avatar.vue";

export default {
	name: "app",
	mixins: [general, trackEncounter],
	components: {
		Health,
		Name,
		Avatar,
	},
	props: [
		"encounter",
		"current",
		"entities_len",
		"turn",
		"campPlayers",
		"campCompanions",
		"players",
		"playerSettings",
		"npcs",
		"npcSettings",
		"timer",
	],
	data() {
		return {
			userId: this.$route.params.userid,
			weather: true,
		};
	},
	methods: {
		setWeather() {
			this.weather = !this.weather;
			this.$emit("setWeather", this.weather);
		},
		toggleFullscreen(e) {
			const target =
				e.target.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode
					.parentNode.parentNode.parentNode.parentNode;

			this.$q.fullscreen
				.toggle(target)
				.then(() => {
					// success!
				})
				.catch((err) => {
					alert(err);
					// uh, oh, error!!
					// console.error(err)
				});
		},
	},
};
</script>

<style lang="scss" scoped>
.turns {
	grid-area: top;
	text-transform: uppercase;
	height: 60px;
	padding: 10px;

	.timer {
		position: absolute;
		left: 15px;
		top: 0;
		line-height: 60px;
		font-size: 20px;
	}

	.round-info {
		line-height: 12px;
		font-size: 11px;
		text-align: center;

		.number {
			font-weight: bold;
			font-size: 30px;
			line-height: 30px;
		}
	}
	.img {
		width: 40px;
		height: 40px;
		margin-left: 15px;

		.avatar {
			font-size: 29px;
		}
	}
	h2 {
		line-height: 40px;
		margin-left: 15px;
		text-transform: none;
	}
	.actions {
		position: absolute;
		right: 10px;
		top: 0;
		display: flex;
		justify-content: flex-end;

		.weather {
			height: 60px;
			width: 40px;
			line-height: 60px;
			text-align: center;
			color: $neutral-1;
			font-size: 25px;

			.hide {
				font-size: 19px;
				vertical-align: 7px;
				opacity: 0.5;
			}
		}
		.full {
			height: 60px;
			width: 40px;
			line-height: 60px;
			font-size: 25px;
			text-align: center;
			color: $neutral-2;

			i {
				vertical-align: -2px;
			}
		}
	}
}
</style>
