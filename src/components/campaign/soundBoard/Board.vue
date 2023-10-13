<template>
	<div class="sound-board">
		<a
			v-for="({ name, type, url, icon, image, hk }, i) in board"
			:key="`${type}-${i}`"
			:style="{ backgroundImage: image ? `url(${image})` : null }"
			class="sound-board__button"
			:href="url"
			target="_blank"
			rel="noopener"
		>
			<img
				v-if="hk"
				src="~assets/_img/logo/logo-icon-cyan.svg"
				alt="hk logo"
				class="sound-board__button-logo"
			/>
			<hk-icon :icon="icon" class="sound-board__button-icon" />
			<div class="truncate sound-board__button-title">
				{{ name }}
			</div>
			<q-tooltip anchor="top middle" self="center middle">{{ name }}</q-tooltip>
		</a>
		<button class="btn btn-block bg-neutral-5 sound-board__add" @click="add_dialog = true">
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
					value: "music",
					label: "Music",
				},
				{
					value: "ambience",
					label: "Ambience",
				},
			],
			buttons: [
				{
					type: "music",
					name: "Combat",
					url: "",
					image:
						"https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/apps/2286730/235e2d0743f744ec0ffda1d4a11324b76500d7c8.jpg",
				},
				{
					type: "music",
					name: "Town",
					url: "https://open.spotify.com/playlist/0QRu6FvO8pN7aMQ38dZhLJ?si=fe46e4a741d742c6",
					image:
						"https://www.oxpal.com/wp-content/uploads/2014/07/medieval_town_map_wpthumb-256x256.jpg",
				},
				{
					type: "ambience",
					name: "Rain",
					url: "https://www.youtube.com/watch?v=BATkn-OWXqM&ab_channel=RainSoundNatural",
					image: "https://i.pinimg.com/originals/77/57/b0/7757b0e2f116e37f5ef887457a7a63b1.gif",
					hk: true,
				},
				{
					type: "ambience",
					name: "Snow",
					url: "https://www.youtube.com/watch?v=sGkh1W5cbH4&ab_channel=RelaxingSoundzzz",
					image:
						"https://cdn130.picsart.com/c7f29351-c222-4392-8866-cbc79945f2c5/407954039029201.jpg?type=webp&to=crop&r=256",
					hk: true,
				},
				{
					type: "ambience",
					name: "Thunder",
					url: "https://www.youtube.com/watch?v=fkFiIhDR_nc&ab_channel=Sounds4Sleeping",
					image:
						"https://is4-ssl.mzstatic.com/image/thumb/Purple116/v4/0f/d9/75/0fd975d2-d544-0b98-3a0c-6fe64662d1e2/AppIcon-0-0-1x_U007emarketing-0-0-0-4-0-0-sRGB-0-0-0-GLES2_U002c0-512MB-85-220-0-0.png/256x256bb.jpg",
					hk: true,
				},
			],
		};
	},
	computed: {
		board() {
			return this.buttons
				.filter((button) => button.type === this.type)
				.map((item) => ({ ...item, icon: this.getIcon(item.url) }));
		},
	},
	methods: {
		getIcon(url, type) {
			switch (true) {
				case !!url.match(/^https?:\/\/(www.)?(youtube.)|(youtu.be)/):
					return "fab fa-youtube";
				case !!url.match(/^https?:\/\/(www.)?|(open.)spotify\./):
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
		width: 48px;
		height: 48px;
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: space-between;
		color: $white;
		text-shadow: 1px 1px 0px $black;
		border-radius: $border-radius;
		background-size: cover;
		background-position: center;
		font-size: 10px;
		text-align: center;
		gap: 0;

		&-title {
			padding: 0 4px;
			width: 100%;
		}
		&-icon {
			font-size: 20px;
			opacity: 0.7;
			height: 30px;

			&:before {
				line-height: 30px;
				vertical-align: -7px;
			}
		}
		&-logo {
			width: 14px;
			position: absolute;
			top: -3px;
			right: -5px;
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
