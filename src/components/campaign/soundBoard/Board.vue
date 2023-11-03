<template>
	<div class="sound-board">
		<template v-for="(sound, i) in board">
			<a
				v-if="sound.url"
				:key="`${sound.type}-${i}`"
				class="sound-board__button"
				:href="sound.url"
				target="_blank"
				rel="noopener"
			>
				<img				
					v-if="sound.hk"
					src="~assets/_img/logo/logo-icon-cyan.svg"
					alt="sound board button background"
					class="sound-board__button-logo"
				/>
				<hk-icon v-if="!sound.image" :icon="sound.icon" class="sound-board__button-icon" />
				<div class="truncate sound-board__button-title">
					{{ sound.name }}
				</div>
				<div v-if="sound.image" class="sound-board__button-bg">
					<img :src="sound.image" />
				</div>
				<q-tooltip anchor="top middle" self="center middle">{{ sound.name }}</q-tooltip>
			</a>
		</template>

		<router-link
			v-if="tier.name === 'Free'"
			class="btn btn-block bg-patreon-red sound-board__add"
			to="/patreon"
		>
			Add custom links
		</router-link>
		<button v-else class="btn btn-block bg-neutral-5 sound-board__add" @click="add_dialog = true">
			<hk-icon icon="fas fa-plus" class="green" />
			Add {{ type }}
		</button>

		<q-dialog v-model="add_dialog">
			<div>
				<ValidationObserver v-slot="{ handleSubmit }">
					<q-form @submit="handleSubmit(addItem)" greedy>
						<hk-card :min-width="320" no-margin>
							<div slot="header" class="card-header">
								<span>Add to your Sound Board</span>
								<q-btn padding="sm" size="sm" no-caps icon="fas fa-times" flat v-close-popup />
							</div>
							<div class="card-body">
								<q-btn-toggle v-model="add.type" :options="toggle" spread no-caps class="mb-3" />
								<hk-input
									v-model="add.name"
									rules="required|max:20"
									maxLength="21"
									label="Name"
									name="Name"
								/>
								<hk-input
									v-model="add.url"
									rules="required|url"
									maxLength="21"
									label="URL"
									name="URL"
								>
								</hk-input>
								<hk-input v-model="add.image" rules="url" maxLength="21" label="Icon" name="Icon">
								</hk-input>
							</div>
							<div slot="footer" class="card-footer">
								<q-btn v-close-popup class="mr-1" no-caps type="cancel">Cancel</q-btn>
								<q-btn no-caps label="Add" color="primary" type="submit" />
							</div>
						</hk-card>
					</q-form>
				</ValidationObserver>
			</div>
		</q-dialog>
	</div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import { urlType } from "src/utils/generalFunctions";

export default {
	name: "Media",
	props: {
		type: {
			type: String,
			default: "music",
		},
	},
	data() {
		return {
			add_dialog: false,
			add: {
				type: this.type,
				name: null,
				url: null,
				image: null,
			},
			toggle: [
				{
					value: "ambience",
					label: "Ambience",
				},
				{
					value: "music",
					label: "Music",
				},
			],
			buttons: [
				{
					type: "music",
					name: "Combat",
					url: "https://www.youtube.com/watch?v=WEel3jMmGo4",
					image: require("assets/_img/soundboard/combat_1.webp"),
					hk: true,
				},
				{
					type: "music",
					name: "Combat 2",
					url: "https://www.youtube.com/watch?v=w0sUw735gRw",
					image: require("assets/_img/soundboard/combat_2.webp"),
					hk: true,
				},
				{
					type: "music",
					name: "Tavern",
					url: "https://www.youtube.com/watch?v=2EFpqObW9hY",
					image: require("assets/_img/soundboard/tavern_music.webp"),
					hk: true,
				},
				{
					type: "music",
					name: "Magical",
					url: "https://www.youtube.com/watch?v=wrmwsM00QG4",
					image: require("assets/_img/soundboard/magical.webp"),
					hk: true,
				},
				{
					type: "music",
					name: "Mysterious",
					url: "https://www.youtube.com/watch?v=SA1ZM5_UFhQ",
					image: require("assets/_img/soundboard/mysterious.webp"),
					hk: true,
				},
				{
					type: "music",
					name: "Eerie",
					url: "https://www.youtube.com/watch?v=CDWtH8eHeEU",
					image: require("assets/_img/soundboard/eerie_music.webp"),
					hk: true,
				},
				{
					type: "music",
					name: "Suspense",
					url: "https://www.youtube.com/watch?v=EApZmmYg_oQ",
					image: require("assets/_img/soundboard/suspense.webp"),
					hk: true,
				},
				// AMBIENCE
				{
					type: "ambience",
					name: "Rain",
					url: "https://www.youtube.com/watch?v=fGRh_hIpDt4",
					image: require("assets/_img/soundboard/rain.webp"),
					hk: true,
				},
				{
					type: "ambience",
					name: "Snow",
					url: "https://www.youtube.com/watch?v=sGkh1W5cbH4",
					image: require("assets/_img/soundboard/snow.webp"),
					hk: true,
				},
				{
					type: "ambience",
					name: "Thunder",
					url: "https://www.youtube.com/watch?v=fkFiIhDR_nc",
					image: require("assets/_img/soundboard/thunder.webp"),
					hk: true,
				},
				{
					type: "ambience",
					name: "Forest by Day",
					url: "https://www.youtube.com/watch?v=xNN7iTA57jM",
					image: require("assets/_img/soundboard/forest_by_day.webp"),
					hk: true,
				},
				{
					type: "ambience",
					name: "Forest by Night",
					url: "https://www.youtube.com/watch?v=ABCwX_ERUmw",
					image: require("assets/_img/soundboard/forest_by_night.webp"),
					hk: true,
				},
				{
					type: "ambience",
					name: "Cave",
					url: "https://www.youtube.com/watch?v=kxqJuc1HHbg",
					image: require("assets/_img/soundboard/cave.webp"),
					hk: true,
				},
				{
					type: "ambience",
					name: "Campfire",
					url: "https://www.youtube.com/watch?v=7KFoj-SOfHs",
					image: require("assets/_img/soundboard/campfire.webp"),
					hk: true,
				},
				{
					type: "ambience",
					name: "Town by Day",
					url: "https://www.youtube.com/watch?v=WJrqwa6tMQY",
					image: require("assets/_img/soundboard/town_by_day.webp"),
					hk: true,
				},
				{
					type: "ambience",
					name: "Town by Night",
					url: "https://www.youtube.com/watch?v=N9ghsVSTNuI&t=711s",
					image: require("assets/_img/soundboard/town_by_night.webp"),
					hk: true,
				},
				{
					type: "ambience",
					name: "Tavern",
					url: "https://www.youtube.com/watch?v=rv3Nl-Od9YU",
					image: require("assets/_img/soundboard/tavern.webp"),
					hk: true,
				},
				{
					type: "ambience",
					name: "Battlefield",
					url: "https://www.youtube.com/watch?v=VaKVLWZrG-4",
					image: require("assets/_img/soundboard/battlefield.webp"),
					hk: true,
				},
				{
					type: "ambience",
					name: "Battle",
					url: "https://www.youtube.com/watch?v=Z98ZMt1zc94",
					image: require("assets/_img/soundboard/battle.webp"),
					hk: true,
				},
				{
					type: "ambience",
					name: "Eerie",
					url: "https://www.youtube.com/watch?v=Jh9E7Cus7JA",
					image: require("assets/_img/soundboard/eerie_ambience.webp"),
					hk: true,
				},
			],
		};
	},
	computed: {
		...mapGetters(["music", "tier"]),
		board() {
			return this.buttons
				.filter((button) => button.type === this.type)
				.map((item) => ({ ...item, icon: this.getIcon(item.url) }));
		},
	},
	methods: {
		...mapActions(["playMusic", "playAmbience"]),
		getIcon(url, type) {
			switch (true) {
				case urlType(url) === "youtube":
					return "fab fa-youtube";
				case urlType(url) === "spotify":
					return "fab fa-spotify";
				case type === "ambience":
					return "fa fa-volume";
				default:
					return "fa fa-music";
			}
		},
		addItem() {
			this.add = {
				type: this.type,
				name: null,
				url: null,
				image: null,
			};
		},
		play(sound) {
			if (sound.type === "music") {
				this.playMusic(sound.url === this.music?.url ? null : sound);
			} else {
				this.playAmbience(sound);
			}
		},
	},
};
</script>

<style lang="scss" scoped>
.sound-board {
	display: flex;
	justify-content: flex-start;
	flex-wrap: wrap;
	gap: 10px;
	padding-bottom: 46px;

	&__button {
		width: 60px;
		height: 60px;
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: flex-end;
		color: $white;
		text-shadow: 1px 1px 0px $black;
		border-radius: 8px;
		background-size: cover;
		background-position: center;
		font-size: 10px;
		text-align: center;
		background-color: $neutral-8;
		transition: all 0.3s ease-in-out;
		gap: 0;

		&-title {
			padding: 8px 4px 3px 4px;
			width: 100%;
			background: linear-gradient(180deg, rgba(215,215,215,0) 0%, rgba(0,0,0,0.7511379551820728) 100%);
			border-bottom-left-radius: 8px;
			border-bottom-right-radius: 8px;
			z-index: 10;
		}
		&-icon {
			font-size: 20px;
			opacity: 0.7;
			z-index: 10;
		}
		&-logo {
			width: 14px;
			position: absolute;
			top: -3px;
			right: -5px;
			z-index: 20;
		}
		&-bg {
			overflow: hidden;
			position: absolute;
			border-radius: inherit;
			top: 0;
			bottom: 0;

			img {
				transition: all 0.1s ease-in-out;
				width: 100%;
				height: 100%;
				object-fit: cover;
			}
		}
		&:hover {
			box-shadow: 0px 0px 8px 4px #0000006c;

			.sound-board__button-bg {
				img {
					transform: scale(1.2);
				}
			}
		}
	}
	&__add {
		position: absolute;
		bottom: 8px;
		left: 8px;
		right: 8px;
		width: calc(100% - 16px) !important;
	}
}
</style>
