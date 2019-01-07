<template>
	<div id="track" v-if="track">
		<div class="turns">
			Encounter 
		</div>
		<div class="current">
			<ul>
				<!-- <li v-for="entity in _active">
					{{ entity }}
				</li> -->
			</ul>
		</div>
		<div class="entities">
			{{ encounter() }}
		</div>
	</div>
</template>

<script>
	import _ from 'lodash'
	import { db } from '@/firebase'
	import { mapActions, mapGetters } from 'vuex'


	export default {
		name: 'app',
		components: {

		},
		data() {
			return {
				userId: this.$route.params.userid,
			}
		},
		firebase() {
			return {
				track: {
					source: db.ref(`track/${this.userId}`),
					asObject: true,
				},
				// encounter: db.ref(`encounters/${this.userId}/${this.track.campaign}/${this.track.encounter}`),
			}
		},
		created() {
			// this.fetch_trackEncounter(this.userId)
			// this.fetch_track(this.userId)
		},
 		computed: {
			...mapGetters([
				// 'track',
				// 'trackEncounter',
			]),
		},
		methods: {
			...mapActions([
				'fetch_track',
				// 'fetch_trackEncounter',
			]),
			encounter() {
				var encounter = db.ref(`encounters/${this.userId}/${this.track.campaign}/${this.track.encounter}`);
				// encounter.on('value', function(snapshot) {
				// 	showEncounter(encElement, snapshot.val());
				// });
				return encounter
			},
		},
	}
</script>

<style lang="scss">
#track {
	padding:10px;
	width: 100vw;
	height: calc(100% - 50px);
	display: grid;
	grid-template-columns: 2fr 3fr;
	grid-template-rows: 60px auto;
	grid-gap: 10px;
	grid-template-areas:
	"turns turns turns turns"
	"current entities";
	position: absolute;
}
</style>
