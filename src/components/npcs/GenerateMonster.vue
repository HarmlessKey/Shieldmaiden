<template>
	<div class="card-body generate-monster" :class="{ generating: generating }">
		<div v-if="tier.price !== 'Free'" class="generate-monster__content">
			<h2 class="text-shadow d-flex justify-content-between">
				<span>Generate your monster with AI</span>
				<em>BETA</em>
			</h2>
			<template v-if="error">
				<p class="red">Something went wrong generating your monster.</p>
				<p class="red">{{ error }}</p>
			</template>
			<p class="text-shadow mb-1">
				Describe your monster
				<button
					class="btn btn-clear btn-sm btn-round"
					@click="
						setDrawer({
							show: true,
							type: 'drawers/AIPromptInfo',
						})
					"
				>
					<hk-icon icon="fas fa-info-circle" />
				</button>
			</p>
			<hk-input
				v-model="monster_description"
				label="Description"
				placeholder="Describe your NPC"
				type="textarea"
				:maxLength="max_length"
				:rules="`max:${max_length}`"
				name="Prompt"
				class="mb-2"
				:disable="ai.total <= 0"
			/>
			<div class="d-flex justify-content-between items-center">
				<div>
					<div class="credits" :class="ai.total <= 0 ? 'red' : 'green'">{{ ai.total.min(0) }}</div>
					Credits
				</div>
				<div v-if="ai.total > 0">
					<q-toggle v-model="auto_download" label="Auto-Download" left-label size="xs" />
					<button
						class="btn bg-accent"
						:disabled="!monster_description || monster_description.length > max_length"
						@click="generate"
					>
						Generate
					</button>
				</div>
				<button v-else class="btn bg-neutral-5" disabled>Not enough credits</button>
			</div>
			<div v-if="generated_npcs.length" class="generate-monster__history">
				<strong>History</strong>
				<small class="d-block mb-2">
					These monsters are temporarily saved, but will disappear when you refresh the application.
				</small>
				<div
					v-for="(monster, i) of generated_npcs"
					:key="`${i}-${monster.name}`"
					class="generate-monster__history-item"
					@click="download(monster)"
				>
					{{ monster.name }}
					<hk-icon icon="fas fa-download" />
				</div>
			</div>
		</div>
		<div v-else class="text-center">
			<h2 class="text-shadow">Subscribe and generate monster with AI</h2>
			<p class="mb-4 text-shadow">
				A subscription is required to use our AI generation functionality.
			</p>
			<router-link to="/patreon" class="btn btn-block bg-patreon-red">Subscribe now</router-link>
		</div>
		<div v-if="generating" class="messages">
			<hk-loader>
				<transition name="slide" mode="out-in">
					<div :key="currentMessage" v-text="currentMessage" class="message" />
				</transition>
			</hk-loader>
		</div>
	</div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import axios from "axios";
import { Cookies } from "quasar";

export default {
	name: "GenerateMonster",
	props: {},
	components: {},
	data() {
		return {
			generating: false,
			monster_description: null,
			max_length: 500,
			error: null,
			auto_download: true,
			message_index: null,
			messages: [
				"Gathering parts",
				"Assembling monster",
				"Teaching languages",
				"Training combat skills",
				"Enhancing senses",
				"Forging weapons",
				"Infusing arcane energy",
				"Adding a dash of evil",
				"Oops... a lot of evil it is",
				"Caging the monster",
				"It might've broken free",
				"Running away",
				"Good luck, it's your problem now",
			],
			messageInterval: null,
		};
	},
	computed: {
		...mapGetters(["ai", "tier"]),
		...mapGetters("npcs", ["generated_npcs"]),
		currentMessage() {
			return this.messages[this.message_index];
		},
	},
	methods: {
		...mapActions(["setDrawer"]),
		...mapActions("npcs", ["cache_generated_npc"]),
		async generate() {
			this.$emit("generating", true);
			this.generating = true;
			this.message_index = 0;
			this.startMessageRotation();
			try {
				const response = await axios.post(
					"api/ai/generate-monster",
					{
						description: this.monster_description,
						subscription: this.tier?.benefits?.ai_credits || 0,
					},
					{
						headers: {
							Authorization: `Bearer ${Cookies.get("access_token")}`,
						},
					},
					{ timeout: 0 }
				);
				const monster = response?.data?.output || {};
				monster.source = "Shieldm.ai.den";
				monster.hit_dice = monster?.hit_dice?.split("+")[0];
				this.cache_generated_npc(monster);

				if (this.auto_download) {
					this.download(monster);
				}

				this.$emit("finished", monster);
			} catch (e) {
				console.error("Something went wrong generating the monster", e);
				this.error = e;
			} finally {
				this.$emit("generating", false);
				this.generating = false;
				this.stopMessageRotation();
				this.monster_description = null;
			}
		},
		download(monster) {
			const blob = new Blob([JSON.stringify(monster, null, 2)], { type: "application/json" });
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = monster.name;
			a.click();
			URL.revokeObjectURL(url);
		},
		startMessageRotation() {
			if (this.messageInterval) return;
			this.messageInterval = setInterval(() => {
				this.message_index = (this.message_index + 1) % this.messages.length;
			}, 3000);
		},
		stopMessageRotation() {
			clearInterval(this.messageInterval);
			this.messageInterval = null;
		},
	},
};
</script>

<style lang="scss" scoped>
.generate-monster {
	position: relative;
	overflow: hidden;
	z-index: 0;

	&__content {
		transition: all 0.5s linear;
	}
	&:before {
		content: "";
		position: absolute;
		left: 0;
		top: 0;
		width: 100%;
		height: 100%;
		background-image: url("~assets/_img/monster-creator-shieldmaiden.webp");
		background-size: cover;
		background-position: center;
		z-index: -1;
		opacity: 0.2;
	}
	&.generating {
		&:before {
			opacity: 1;
			animation: zoomRotate 30s ease-in-out infinite;
		}
		.generate-monster__content {
			opacity: 0;
		}
	}
	.messages {
		position: absolute;
		width: 100%;
		height: 100%;
		left: 0;
		top: 0;
		font-size: 30px;
		font-weight: bold;
		text-shadow: 0 0 5px $black;
	}
	.credits {
		font-weight: bold;
		padding: 3px 8px;
		background-color: $neutral-5;
		display: inline-block;
		border-radius: $border-radius;
		box-shadow: 0px 0px 5px #00000042;
		margin-right: 2px;
	}
	&__history {
		margin-top: 15px;
		&-item {
			display: flex;
			align-items: center;
			justify-content: space-between;
			border-radius: $border-radius;
			background-color: $neutral-6;
			padding: 5px 10px;
			margin-top: 2px;
			cursor: pointer;

			&:hover {
				background-color: $neutral-5;
			}
		}
	}
}

.slide-enter-active,
.slide-leave-active {
	transition: all 0.5s ease;
}
.slide-enter {
	transform: translateX(100%);
	opacity: 0;
}
.slide-enter-to {
	transform: translateX(0);
	opacity: 1;
}
.slide-leave {
	transform: translateX(0);
	opacity: 1;
}
.slide-leave-to {
	transform: translateX(-100%);
	opacity: 0;
}

@keyframes zoomRotate {
	0% {
		transform: scale(1) rotate(0deg);
	}
	25% {
		transform: scale(1.05) rotate(1deg);
	}
	50% {
		transform: scale(1.1) rotate(-2deg);
	}
	75% {
		transform: scale(1.05) rotate(1deg);
	}
	100% {
		transform: scale(1) rotate(0deg);
	}
}
</style>
