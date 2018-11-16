<template>
		<div class="tab-pane fade" id="log" role="tabpanel" aria-labelledby="log-tab">
			<h2>Combat log</h2>
			<transition-group tag="ul" name="log" enter-active-class="anitmated slideInDown">
				<li v-for="(item, key) in returnLog()" :key="key">
					<div class="d-flex justify-content-between head">
						<span>
							Round: {{ item.round }}
							Turn: {{ item.turn }}
						</span>
						{{ item.time }}
					</div>
					{{ item.by }} did
					<span :class="{ green: item.type == 'healing', red: item.type == 'damage' }">{{ item.amount }}</span>
					{{ item.type }} to {{ item.target }}
					<span v-if="item.over != 0">
						({{ item.over }}
						<span v-if="item.type == 'damage'">overkill</span>
						<span v-else>overhealing</span>)
					</span>
				</li>
			</transition-group>
		</div>
</template>

<script>
	export default {
		name: 'Log',
		props: ['log'],
		data() {
			return {
				cookieLog: JSON.parse(this.$cookies.get(this.$route.params.encid)),
			}
		},
		methods: {
			returnLog() {
				if(this.log == undefined) {
					console.log('Cookie log')
					return this.cookieLog
				}
				else {
					console.log('Normal log')
					return this.log
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
ul {
	padding: 0 5px 0 0;
	list-style: none;

	li {
		padding:10px 0;
		border-bottom: solid 1px #000;

		.head {
			font-size: 11px;
			margin-bottom: 5px;
			font-style: italic;
		}
	}
}
</style>
