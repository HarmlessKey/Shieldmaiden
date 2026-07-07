<template>
	<div>
		<div class="share" :class="{ small: is_small }">
			<div class="qr-wrapper" v-if="qr">
				<div class="qr">
					<qrcode-vue :value="url" :size="110" :margin="1" level="H" />
					<img
						class="qr__logo"
						:src="require('src/assets/_img/logo/logo-icon-no-shield-cyan.svg')"
						alt=""
					/>
				</div>
			</div>
			<div>
				<h2 v-if="title" class="mb-2">
					<a :href="url" target="_blank" class="neutral-1">
						Share live initiative list
						<i class="fas fa-external-link blue ml-1" aria-hidden="true" />
					</a>
				</h2>
				<p class="neutral-2">Let your players follow a live initiative list.</p>
				<q-input
					:dark="$store.getters.theme === 'dark'"
					filled
					square
					:model-value="url"
					autocomplete="off"
					type="text"
				>
					<template v-slot:after>
						<hk-share
							title="Shieldmaiden"
							text="Follow my campaigns on Shieldmaiden!"
							:url="url"
						/>
					</template>
				</q-input>
			</div>
		</div>
		<div class="mt-4 neutral-2" v-if="info">
			Make sure your campaign is set to <span class="green">Public</span>, or your followers won't
			be able to see it. Then click the <span class="live neutral-1">GO LIVE</span> icon in your
			campaign to share the initiative of the encounter that is active. You can stay live for your
			entire session, whenever you're not running an encounter, followers won't see what you're
			doing.
		</div>
		<q-resize-observer @resize="setSize" />
	</div>
</template>

<script>
import QrcodeVue from "qrcode.vue";

export default {
	name: "PlayerLink",
	components: {
		QrcodeVue,
	},
	props: {
		qr: {
			type: Boolean,
			default: true,
		},
		title: {
			type: Boolean,
			default: true,
		},
		info: {
			type: Boolean,
			default: true,
		},
	},
	data() {
		return {
			is_small: false,
			showInfo: false,
			url: "",
		};
	},
	computed: {
		share_available() {
			return typeof window !== "undefined" && navigator.share !== undefined;
		},
	},
	methods: {
		setSize(size) {
			let width = size.width;
			let small = 450;

			this.is_small = width <= small ? true : false;

			//sets new width on resize
			this.width = width;
		},
	},
	beforeMount() {
		this.url = window.origin + "/user/" + this.$store.getters.user.uid;
	},
};
</script>

<style lang="scss" scoped>
.share {
	.copy {
		word-break: break-all;
	}

	&.small {
		.qr-wrapper {
			display: flex;
			justify-content: center;
			border: solid 1px $neutral-4;
			width: 100%;
			padding: 20px 0;
			background-color: $neutral-9;
			border-radius: $border-radius;
			margin-bottom: 20px;

			.qr {
				background-color: $neutral-1;
				padding: 3px;
				border-radius: $border-radius;
			}
		}
	}

	.qr {
		position: relative;
		display: inline-block;
		line-height: 0;

		&__logo {
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
			width: 28px;
			height: 28px;
			background-color: $neutral-1;
			border-radius: 4px;
			padding: 2px;
		}
	}
}
.home {
	.share {
		display: grid;
		grid-template-columns: auto 110px;
		grid-template-areas: "text qr";

		.qr {
			grid-area: qr;
			border: none;
		}
		p {
			margin-bottom: 10px;
		}
		h2 {
			font-size: 25px;
		}
		small {
			line-height: initial;
		}
	}
}
</style>
