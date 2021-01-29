<template>
	<div>
		<ul class="rolls">
			<li v-for="(roll, i) in rolls" :key="`roll-${i}`">
					<h3>
						<span class="title truncate" :title="roll.title">
							{{ roll.title }}
						</span>
						<span class="date">
							{{ showTime(roll.date) }}
						</span>
					</h3>
					<div class="result" @click="setShowRolls(i)">
						<span class="roll">
							{{roll.roll}}:
							(<span class="advantage" v-if="roll.ignored">
								<span v-html="advantage(roll.advantage_disadvantage)"/> 
								<span class="ignored gray-hover">
									{{ roll.ignored }}
								</span>
							</span>{{ roll.throwsTotal }}){{ parseInt(roll.mod) !== 0 ? roll.mod : "" }}
						</span>
						<span class="total">
							<span class="white">
								{{roll.total}}
							</span>
						</span>
					</div>
					<q-slide-transition>
						<div v-show="showRolls === i" class="rolls">
							<div>Rolls:</div>
							<span v-for="(result, ii) in roll.throws" :key="`throw-${i}-${ii}`">
								{{ result }}{{ ii+1 &lt; roll.throws.length ? "," : "" }}
							</span>
						</div>
					</q-slide-transition>
			</li>
		</ul>
	</div>
</template>

<script>
	export default {
		name: "Rolls",
		props: {
			rolls: {
				type: Array,
				required: true
			}
		},
		data() {
			return {
				showRolls: undefined
			}
		},
		methods: {
			showTime(input) {
				let d = new Date(input)
				let hours = (d.getHours() < 10) ? '0'+d.getHours() : d.getHours();
				let minutes = (d.getMinutes() < 10) ? '0'+d.getMinutes() : d.getMinutes();
				let seconds = (d.getSeconds() < 10) ? '0'+d.getSeconds() : d.getSeconds();

				return hours + ":" + minutes + ":" + seconds;
			},
			advantage(input) {
				const type = Object.keys(input)[0].charAt(0).capitalize();
				const color = (type === "A") ? "green" : "red";
				return `<b class="${color}">${type}</b>`;
			},
			setShowRolls(i) {
				this.showRolls = (this.showRolls === i) ? undefined : i;
			}
		}
	};
</script>

<style lang="scss" scoped>
	ul.rolls {
		padding: 0;
		list-style: none;
		margin: 0;

		li {
			border-bottom: solid 1px$gray-hover;
			padding: 5px 0;

			h3 {
				padding: 0 8px;
				background-color:$gray-active;
				margin: 0 !important;
				font-size: 15px;
				display: grid;
				grid-template-columns: auto min-content;

				.date {
					font-size: 11px;
				}
			}
			.result {
				cursor: pointer;
				padding: 5px 8px;
				background-color:$gray-dark;
				font-size: 18px;
				line-height: 35px;
				display: grid;
				grid-template-columns: auto min-content;

				.roll {
					white-space: nowrap; 
					overflow: hidden;
					text-overflow: ellipsis;
				}
				.total {
					text-align: right;
					white-space: nowrap;

					.white {
						font-size: 25px;
					}
				}
			}
			.rolls {
				background: $gray-darker;
				padding: 5px 8px;
			}
		}
	}
</style>