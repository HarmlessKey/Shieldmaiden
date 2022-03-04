<template>
	<div class="content" v-if="user">
		<template v-if="!userInfo || !userInfo.username">
			<hk-card header="Username">
				<div class="card-body">
					<h3>
						Thank you for creating a <b>Harmless Key</b> account!</h3>
					<p>To continue, please first enter a username.</p>
						<ValidationProvider rules="required|alpha_num|min:3|max:20" name="Username" v-slot="{ errors, invalid, validated }">
							<q-input 
								:dark="$store.getters.theme === 'dark'" filled square
								type="text" 
								autocomplete="off"
								label="Username" 
								maxlength="20"
								minlength="3"
								v-model="username" @keyup.native="checkUsername()"
								:error="invalid && validated"
								:error-message="errors[0]"
							/>
							<p v-if="username" class="pl-1">
								<i aria-hidden="true" class="fas mr-1" :class="{'green fa-check': check == 'available', 'red fa-times': check === 'unavailable'}" />
									<b>{{ username }}</b> is {{ check }}
							</p>
							<button 
								class="btn btn-block" 
								:class="{'disabled': check === 'unavailable' || invalid }" 
								@click="setUsername(!invalid)"
							>
								Save
							</button>
						</ValidationProvider>
				</div>
			</hk-card>
		</template>
	</div>
</template>

<script>
	import { db } from '@/firebase'	
	import { mapGetters } from 'vuex'

export default {
		name: 'Username',
		data() {
			return {
				username: undefined,
				check: 'available',
			}
		},
		computed: {
			...mapGetters([
				'user',
				'userInfo',
				'poster',
			])
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
			setUsername(valid) {
				if (valid && this.check === "available") {
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
			}
		}
	}
</script>

<style lang="scss" scoped>
.content {
	max-width: 400px !important;

	h3 {
		font-size: 18px;
		max-width: 250px;
	}
}
</style>