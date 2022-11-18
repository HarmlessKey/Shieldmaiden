<template>
	<div>
		<div class="share" :class="{ small: is_small }">
			<div class="qr-wrapper" v-if="qr">
				<vue-qr 
					class="qr" 
					:text="url" 
					qid="playerLink" 
					:size="120" 
					:margin="5"
					:logoSrc="require('src/assets/_img/logo/logo-icon-no-shield-cyan.svg')"
					:logoScale="0.25"
				/>
			</div>
			<div>
				<h2 v-if="title" class="mb-2">Share live initiative list</h2>
				<p class="neutral-2">
					Let your players follow a live initiative list. 
				</p>
				<q-input
					:dark="$store.getters.theme === 'dark'" filled square
					:value="url"
					autocomplete="off"
					type="text"
				>
					<hk-share 
						title="Harmless Key"
						text="Follow my campaigns on Harmless Key!"
						:url="url"
						slot="after"
					/>
				</q-input>
			</div>
		</div>
		<div class="mt-4 neutral-2" v-if="info">
			Make sure your campaign is set to <span class="green">Public</span>, or your followers won't be able to see it.
			Then click the <span class="live neutral-1">GO LIVE</span> icon in your campaign to share the initiative of the encounter that is active. You can stay live for your entire session, whenever you're not running an encounter, followers won't see what you're doing.
		</div>
		<q-resize-observer @resize="setSize" />
	</div>
</template>

<script>
	import VueQr from 'vue-qr';
	
	export default {
		name: 'PlayerLink',
		components: {
			VueQr,
		},
		props: {
			qr: {
				type: Boolean,
				default: true
			},
			title: {
				type: Boolean,
				default: true
			},
			info: {
				type: Boolean,
				default: true
			}
		},
		data() {
			return {
				is_small: false,
				showInfo: false,
				url: "",
			}
		},
		computed: {
			share_available() {
				return process.browser && navigator.share !== undefined;
			}
		},
		methods: {
			setSize(size) {
				let width = size.width;
				let small = 450;

				this.is_small = (width <= small) ? true : false;

				//sets new width on resize
				this.width = width;
			},		
		},
		beforeMount() {
			this.url = window.origin + '/user/' + this.$store.getters.user.uid;
		}
	}
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
				font-family: $text-written;
			}
			small {
				line-height: initial;
			}
		}
	}
</style>