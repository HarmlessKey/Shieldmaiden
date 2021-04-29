<template>
	<div class="shares">
		<q-scroll-area dark :thumb-style="{ width: '5px'}">
			<ul class="shared">
				<template v-for="({type, notification}, index) in shares">
					<li v-if="type === 'roll'" :key="`roll-${index}`" class="roll">
						<h3>
							<span class="title truncate" :title="notification.title">
								{{ notification.entity_name ? `${notification.entity_name}: ` : ``}}{{ notification.title }}
							</span>
						</h3>
						<div class="result">
							<span class="roll">
								<span v-html="advantage(notification.advantage_disadvantage)" /> 
								{{ notification.roll }}
							</span>
							<span class="total white">
								{{ notification.total }}
							</span>
						</div>
					</li>
				</template>
			</ul>
		</q-scroll-area>
	</div>
</template>

<script>
	export default {
		name: "Shares",
		props: [
			"shares",
		],
		data() {
			return {
				
			}
		},
		methods: {
			advantage(input) {
				if(input) {
					const color = (input === "a") ? "green" : "red";
					return `<b class="${color}">${input.capitalize()}</b>`;
				}
			},
		}
	}
</script>

<style lang="scss" scoped>
	.shares {
		background-color: rgba(0, 0, 0, .7);
		height: calc(100vh - 110px);	
		backdrop-filter: blur(1px);

		.q-scrollarea {
			padding: 15px 15px 0 15px;
			height: 100%;

			ul.shared {
				padding: 0;
				list-style: none;
				margin: 0;

				li.roll {
					border-bottom: solid 1px $gray-hover;
					padding: 5px 0;

					h3 {
						padding: 0 8px;
						background-color: $gray-active;
						margin: 0 !important;
						font-size: 15px;
					}
					.result {
						padding: 5px 8px;
						background-color: $gray-dark;
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
							font-size: 25px;
						}
					}
				}
			}
		}
	}
</style>
