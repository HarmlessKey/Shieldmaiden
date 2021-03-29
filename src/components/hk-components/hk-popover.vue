<template>
	<span 
		class="hk-popover"
		@mouseover="itemHover = true"
		@mouseout="itemHover = false"
	>
		<slot />
		<q-popup-proxy 
			v-model="menu"
			square 
			:breakpoint="576"
		>
			<hk-card 
				@mouseover.native="cardHover = true" 
				@mouseout.native="cardHover = false"
				:max-width="300" 
				:no-margin="true" 
				:small="true"
				:header="header ? header : undefined"
			>
				<slot name="content">
					<template v-if="content">
						{{ content }}
					</template>
				</slot>
			</hk-card>
		</q-popup-proxy>
	</span>
</template>

<script>
	import _ from "lodash";

	export default {
		name: 'hk-popover',
		props: {
			hover: {
				type: Boolean,
				default: false,
				required: false
			},
			content: {
				type: String,
				default: undefined,
				required: false
			},
			header: {
				type: String,
				default: undefined,
				required: false
			}
		},
		data() {
			return {
				menu: false,
				cardHover: false,
				itemHover: false
			}
		},
		methods: {
			debounceCheck: _.debounce(function() { 
				this.checkMenu();
			}, 300),
			checkMenu () {
				if (this.itemHover || this.cardHover) {
					this.menu = true;
				} else {
					this.menu = false;
				}
			}
		},
		watch: {
			itemHover() {
				this.debounceCheck();
			},
			cardHover() {
				this.debounceCheck();
			}
		}
	}
</script>