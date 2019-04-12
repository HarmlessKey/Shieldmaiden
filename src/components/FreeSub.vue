<template>
	<div class="claim bg-green d-flex justify-content-between" v-if="userInfo && today < offerEnd && new Date(user.metadata.creationTime) < betaEnd && !voucher">
		<div>
			Thanks for being in our Beta {{ userInfo.username }}!<br/>
			<small>Enjoy a free subscription till the 30th of June 2019.</small>
		</div>
		<button class="btn bg-gray" @click="claim()">Claim</button>
	</div>
</template>

<script>
	import { mapGetters } from 'vuex'
	import { db } from '@/firebase'	

	export default {
		data() {
			return {
				today: new Date(),
				offerEnd: new Date('05/01/2019'),
				betaEnd: new Date('04/12/2019'),
			}
		},
		firebase() {
			return {
			}
		},
		computed: {
			...mapGetters([
				'userInfo',
				'voucher',
			]),
			...mapGetters({
				user: 'getUser'
			})
		},
		methods: {
			claim() {
				if(this.today < this.offerEnd && new Date(this.user.metadata.creationTime) < this.betaEnd && !this.voucher) {

					db.ref(`users/${this.user.uid}/voucher`).set({
						id: '3403171',
						date: '06/30/2019',
						message: 'Thanks for helping with our Beta, you\'re awesome!'
					})

					this.$snotify.success('Voucher given.', 'Voucher set!', {
						position: "centerTop"
					});
				}
			}
		}
	};
</script>

<style lang="scss" scoped>
	.claim {
		position: fixed;
		top: 50px;
		padding: 10px;
		width: 100%;
		z-index: 99;
		color: #fff;
	}
	
</style>