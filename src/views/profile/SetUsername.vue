<template>
	<div class="container" v-if="user">
		<template v-if="!userInfo || !userInfo.username">
			<b-card header="Username">
				<p>To continue, please first enter a username.</p>
				<b-input-group class="mb-2">
					<b-form-input type="text" 
						autocomplete="off"
						placeholder="Username" 
						max-length="1" 
						v-validate="'required|alpha_num|min:3'"
						data-vv-as="Username" 
						name="username"
						v-model="username" @keyup.native="checkUsername()" />
					<b-input-group-append>
						<button class="btn" :class="{
							'disabled': check == 'unavailable' || errors.has('username'), 
							}" @click="setUsername()"><i class="fas fa-check"></i> Save</button>
					</b-input-group-append>
				</b-input-group>
				<p class="validate red pl-1" v-if="errors.has('username')">{{ errors.first('username') }}</p>
				<p v-if="username" class="pl-1">
					<span :class="{'green': check == 'available', 'red': check == 'unavailable'}">{{ username }}</span> is {{ check }}
				</p>
			</b-card>
		</template>
	</div>
</template>

<script>
	import { db, auth } from '@/firebase'	
	import { mapGetters } from 'vuex'

export default {
		name: 'Username',
		metaInfo: {
			title: 'Username'
		},
		data() {
			return {
				username: undefined,
				check: 'available',
			}
		},
		firebase() {
			return {
				usernames: db.ref('users')
			}
		},
		computed: {
			...mapGetters([
				'userInfo',
			]),
			...mapGetters({
				user: 'getUser'
			})
		},
		methods: {
			checkUsername() {
				for (var i in this.usernames) {
					var user = this.usernames[i]
					if(user.username) {
						if (user.username.toLowerCase() == this.username.toLowerCase()) {
							this.check = 'unavailable'
						} else {
							this.check = 'available'
						}
					} else {
						this.check = 'available'
					}
				}
			},
			setUsername() {
				this.$validator.validateAll().then((result) => {
					if (result && this.check == 'available') {
						db.ref(`users/${this.user.uid}`).set({
							username: this.username,
							email: this.user.email,
						});
						this.$snotify.success('Username saved.', 'Critical hit!', {
							position: "centerTop"
						});
						this.$router.replace('/profile');
					}
				})
			},
		}
	}
</script>

<style lang="scss" scoped>
	.img {
		width: 100px;
		height: 100px;
		margin-bottom: 20px;
		border-radius: 50%;
		display: block;
		background-size: cover;
		background-position: center top;
	}
	.info {
		span {
			width: 80px;
			display: inline-block;
		}
	}
</style>