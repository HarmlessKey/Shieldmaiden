<template>
	<span 
		class="hk-roll"
		:class="advantage ? advantage : ''"
		@mousemove="checkAdvantage($event)"
		@mouseout="clearAdvantage()"
	>
		<slot name="default"/>
		<q-tooltip anchor="top middle" self="center middle" v-if="tooltip">
			{{ tooltip }} {{ advantage ? `with ${advantage}` : `` }}
		</q-tooltip>
	</span>
</template>

<script>
	export default {
		name: 'hk-roll',
		props: {
			tooltip: {
				type: String,
				required: false
			}
		},
		data() {
			return {
				advantage: undefined
			}
		},
		created() {
			this.$nextTick(function() {
				window.addEventListener('keyup', this.checkKeyPress);
				window.addEventListener('keydown', this.checkKeyPress);
			});
		},
		destroyed() {
			window.removeEventListener('keyup', this.checkKeypress);
			window.removeEventListener('keydown', this.checkKeypress);
		},
		methods: {
			checkKeyPress(e) {
				if(e.type === "keydown") {
					if(e.key === "Shift") {
						this.advantage = "advantage";
					} else if(e.key === "Control") {
						this.advantage = "disadvantage";
					}
				}
				if(e.type === "keyup") {
					if(e.key === "Shift" || e.key === "Control") {
						this.advantage = undefined;
					}
				}
			},
			checkAdvantage(e) {
				if(e.shiftKey) {
					this.advantage = "advantage"
				} else if(e.ctrlKey) {
					this.advantage = "disadvantage"
				} 			
			},
			clearAdvantage() {
				this.advantage = undefined;
			},
		}
	}
</script>