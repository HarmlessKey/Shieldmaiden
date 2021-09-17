<template>
	<span :class="{ red: value > 0 && totalSeconds === 0 }">
		{{ hours > 0 ? `${hours}:` : `` }}{{ minutes }}:{{ seconds }}
	</span>
</template>

<script>
	export default {
		name: 'hk-card',
		props: {
			value: {
				type: Number,
				default: 0
			}
		},
		data() {
			return {
				minutes: "00",
				seconds: "00",
				hours: "00",
				totalSeconds: this.value
			}
		},
		computed: {

		},
		methods: {
			countTimer(initialize=false) {
				if(!initialize) {
					if(!this.value) {
						++this.totalSeconds;
					} else{
						--this.totalSeconds;
						if(this.totalSeconds < 0) {
							this.totalSeconds = 0;
						}
					}
				}

				const hours = Math.floor(this.totalSeconds /3600);
				const minutes = Math.floor((this.totalSeconds - hours*3600)/60);
				const seconds = this.totalSeconds - (hours*3600 + minutes*60);

				this.seconds = (seconds < 10)  ? `0${seconds}` : seconds;
				this.minutes = (minutes < 10)  ? `0${minutes}` : minutes;
				this.hours = (hours < 10)  ? `0${hours}` : hours;

			}
		},
		mounted() {
			this.countTimer(true);
			window.setInterval(() => {
				this.countTimer()
			}, 1000);
		}
	}
</script>