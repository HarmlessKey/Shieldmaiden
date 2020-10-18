<template>
	<div class="container-fluid" :class="{'p-4': $route.path === '/admin/patrons/new'}" v-if="patron">
		
		<template v-if="$route.path === '/admin/patrons/new'">
			<Crumble />
			<h1>New Patron</h1>
		</template>

		<div class="row mb-4">
			<div class="col-12 col-md-4">
				<template v-if="$route.path === '/admin/patrons/new'">
					<q-input 
						dark filled square dense
						label="Patron ID"
						autocomplete="off" 
						id="patron_id"
						type="number"
						:class="{'input': true, 'error': errors.has('patron_id') }" 
						v-model="patron.patron_id" 
						v-validate="'required|numeric'" 
						data-vv-as="Patron ID"
						name="patron_id" 
					/>
					<p class="validate red" v-if="errors.has('patron_id')">{{ errors.first('patron_id') }}</p>
				</template>

				<label for="email" class="mt-4">Email</label>
				<q-input 
					dark filled square dense
					label="Patron ID"
					autocomplete="off" 
					type="text"
					id="email"
					:class="{'input': true, 'error': errors.has('email') }" 
					v-model="patron.email" 
					v-validate="'required|email'" 
					data-vv-as="Email"
					name="email" 
					placeholder="Email" />
				<p class="validate red" v-if="errors.has('email')">{{ errors.first('email') }}</p>

				<label for="tier" class="mt-4">Tier</label>
				<q-select 
					id="tier"
					v-model="patron.tier_id"
					v-validate="'required'" 
					data-vv-as="Tier"
					name="tier" 
					placeholder="Tier">
					<option v-for="(tier, key) in tiers" :key="key" :value="key">{{ tier.name }}</option>
				</q-select>
				<p class="validate red" v-if="errors.has('tier')">{{ errors.first('tier') }}</p>

				<label for="status" class="mt-4">Status</label>
				<q-select 
					id="status"
					v-model="patron.status"
					v-validate="'required'" 
					data-vv-as="Status"
					name="status">
					<option value="active_patron" selected="selected">Active</option>
					<option value="former_patron">Former</option>
				</q-select>
					<p class="validate red" v-if="errors.has('status')">{{ errors.first('status') }}</p>
			</div>
		</div>
		<button class="btn" @click="addPatron">
			<span v-if="$route.path === '/admin/patrons/new'">Add</span>
			<span v-else>Save</span>
		</button>
	</div>
</template>

<script>
	import { db } from '@/firebase'
	import Crumble from '@/components/crumble/Compendium.vue'

	export default {
		name: 'NewPatron',
		props: ["editPatron"],
		components: {
			Crumble,
		},
		metaInfo: {
			title: 'Admin | New Patron'
		},
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

<style lang="scss" scoped>


</style>