<template>
	<div class="content container" v-if="user">
		<template v-if="!userInfo || !userInfo.username">
			<hk-card header="Username">
				<p>To continue, please first enter a username.</p>
					<q-input 
						dark filled square dense
						type="text" 
						autocomplete="off"
						placeholder="Username" 
						max-length="1" 
						v-validate="'required|alpha_num|min:3'"
						data-vv-as="Username" 
						name="username"
						v-model="username" @keyup.native="checkUsername()" />
					<button class="btn" :class="{
						'disabled': check == 'unavailable' || errors.has('username'), 
						}" @click="setUsername()"><i class="fas fa-check"></i> Save</button>
				<p class="validate red pl-1" v-if="errors.has('username')">{{ errors.first('username') }}</p>
				<p v-if="username" class="pl-1">
					<span :class="{'green': check == 'available', 'red': check == 'unavailable'}">{{ username }}</span> is {{ check }}
				</p>
			</hk-card>
		</template>
	</div>
</template>

<script>
	import { db } from '@/firebase'	
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
		computed: {
			...mapGetters([
				'userInfo',
				'poster',
			]),
			...mapGetters({
				user: 'user'
			})
		},
		methods: {
			checkUsername() {
				
				let username = db.ref(`search_users`).orderByChild('username').equalTo(this.username.toLowerCase());

				// Check username
				username.on('value' , (snapshot) => {
					if(snapshot.exists()) {
						this.check = 'unavailable';
						return
					} else {
						this.check = 'available';
					}
				});

			},
			setUsername() {
				this.$validator.validateAll().then((result) => {
					if (result && this.check === 'available') {
						let user = {
							username: this.username,
							email: this.user.email
						}
						if (this.poster) user.poster = true;

						db.ref(`users/${this.user.uid}`).update(user);

						//Save searchable results in search_user
						db.ref(`search_users`).child(this.user.uid).set({
							username: this.username.toLowerCase(),
							email: this.user.email.toLowerCase()
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