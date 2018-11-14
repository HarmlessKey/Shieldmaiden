import firebase from 'firebase'
import { db } from '@/firebase'

export const getters = {
	created() {
		// console.log("CREATED MIXIN")
	},
	data() {
		return {
			userId: firebase.auth().currentUser.uid,
		}
	},
	firebase() {
		return {
			allPlayers: db.ref('players/' + this.userId),
		}
	},
	methods: {
		getPlayer(entityKey) {
			var player = this.allPlayers.find(function(element) {
				return element['.key'] == entityKey
			});
			console.log(this.allPlayers)
			console.log(player)
			return player
		},
	}
}
