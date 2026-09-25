<template>
	<div class="container-fluid" :class="{'p-4': $route.path === '/admin/patrons/new'}" v-if="patron">
		
		<template v-if="$route.path === '/admin/patrons/new'">
			<h1>New Patron</h1>
		</template>

		<div class="row q-col-gutter-md mb-4">
			<div class="col-12 col-md-4">
				<template v-if="$route.path === '/admin/patrons/new'">
					<q-input 
						:dark="$store.getters.theme === 'dark'" filled square dense
						label="Patron ID"
						autocomplete="off" 
						id="patron_id"
						type="number"
						class="input"
						v-model="patron.patron_id"
						name="patron_id"
					/>
				</template>

				<label for="email" class="mt-4">Email</label>
				<q-input 
					:dark="$store.getters.theme === 'dark'" filled square dense
					label="Patron ID"
					autocomplete="off" 
					type="text"
					id="email"
					class="input"
					v-model="patron.email"
					name="email"
					placeholder="Email" />

				<label for="tier" class="mt-4">Tier</label>
				<q-select 
					id="tier"
					v-model="patron.tier_id"
					name="tier"
					placeholder="Tier">
					<option v-for="(tier, key) in tiers" :key="key" :value="key">{{ tier.name }}</option>
				</q-select>

				<label for="status" class="mt-4">Status</label>
				<q-select 
					id="status"
					v-model="patron.status"
					name="status">
					<option value="active_patron" selected="selected">Active</option>
					<option value="former_patron">Former</option>
				</q-select>
			</div>
		</div>
		<button class="btn" @click="addPatron">
			<span v-if="$route.path === '/admin/patrons/new'">Add</span>
			<span v-else>Save</span>
		</button>
	</div>
</template>

<script>
	import { db } from 'src/firebase'

	export default {
		name: 'NewPatron',
		props: ["editPatron"],
		firebase() {
			return {
				tiers: {
					source: db.ref('tiers').orderByChild('order'),
					asObject: true
				}
			}
		},
		computed: {
			patron() {
				let value = {}
				if(this.editPatron) {
					value = this.editPatron
				}
				return value
			}
		},
		methods: {
			addPatron() {
				this.$validator.validateAll().then((result) => {
					if (result) {
						let patron_id = (this.$route.path === '/admin/patrons/new') ? this.patron.patron_id : this.patron['.key'];
						this.patron.tier_title = this.tiers[this.patron.tier_id].name

						delete this.patron.patron_id
						delete this.patron['.key']

						db.ref(`patrons/${patron_id}`).set(this.patron)
						this.$router.replace('/admin/patrons')
					}
				});
			}
		}
	}
</script>