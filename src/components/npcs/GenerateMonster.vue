<template>
	<div class="card-body generate-monster" :class="{ generating: generating }">
		<div class="generate-monster__content">
			<h2 class="text-shadow">Generate your monster with AI</h2>
			<template v-if="error">
				<p class="red">Something went wrong generating your monster.</p>
				<p class="red">{{ error }}</p>
			</template>
			<p class="text-shadow">Describe your monster</p>
			<hk-input
				v-model="monster_description"
				label="Description"
				placeholder="Describe your NPC"
				type="textarea"
				:maxLength="max_length"
				:rules="`max:${max_length}`"
				name="Prompt"
				class="mb-2"
			/>
			<div class="d-flex justify-content-between">
				<div>
					<div class="credits" :class="ai.total <= 0 ? 'red' : 'green'">{{ ai.total.min(0) }}</div>
					Credits
				</div>
				<button
					class="btn bg-accent"
					:disabled="!monster_description || monster_description.length > max_length"
					@click="generate"
				>
					Generate
				</button>
			</div>
		</div>
	</div>
</template>

<script>
import { mapGetters } from "vuex";
import axios from "axios";

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
		};
	},
	computed: {
		...mapGetters(["ai"]),
	},
	methods: {
		async generate() {
			this.$emit("generating", true);
			this.generating = true;
			try {
				const response = await axios.post(
					"api/ai/generate-monster",
					{
						description: this.monster_description,
					},
					{ timeout: 0 }
				);
				const monster = response.data.output;
				monster.source = "Shieldm.ai.den";
				monster.hit_dice = monster.hit_dice.split("+")[0];
				this.$emit("finished", monster);
			} catch (e) {
				console.error("Something went wrong generating the monster", e);
				this.error = e;
			} finally {
				this.$emit("generating", false);
				this.generating = false;
			}
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
		background-image: url("~assets/_img/monster-creator-shieldmaiden.jpg");
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
		&:after {
			content: "Assembling your monster";
			position: absolute;
			width: 100%;
			left: 0;
			top: 50%;
			transform: translateY(-50%);
			font-size: 30px;
			font-weight: bold;
			text-shadow: 0 0 5px $black;
			text-align: center;
		}
		.generate-monster__content {
			opacity: 0;
		}
	}
	.credits {
		font-weight: bold;
		padding: 3px 5px;
		background-color: $neutral-5;
		display: inline-block;
		border-radius: $border-radius;
		box-shadow: 0px 0px 5px $black;
		margin-right: 2px;
	}
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
