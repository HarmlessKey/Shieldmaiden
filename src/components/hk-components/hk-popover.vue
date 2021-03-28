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
			>
				<slot name="content" />
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
				default: false
			},
			label: {
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
			debounceFunc: _.debounce(function() { this.checkMenu() }, 300),
			checkMenu () {
				if (this.itemHover || this.cardHover) {
					this.menu = true;
				} else {
					this.menu = false;
				}
			}
		},
		watch: {
			itemHover () {
				this.debounceFunc();
			},
			cardHover () {
				this.debounceFunc();
			}
		}
	}
</script>