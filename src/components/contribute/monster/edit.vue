<template>
	<div class="content">
		<Crumble :name="(monster.changed) ? monster.name : old_monster.name"/>
		<h2 class="monsterTitle d-flex justify-content-between" v-if="old_monster">
			{{ (monster.changed) ? monster.name : old_monster.name }}
		</h2>
		
		<div class="monster-wrapper" v-if="canEdit()">
			<template v-if="(old_monster && monster)">
				
				<div class="form">
					<div class="row q-col-gutter-md">
						<div class="col-12 col-md-4" id="old_monster">

							<hk-card class="old_monster" >
								<template v-if="!loading">
									<div class="card-header d-flex justify-content-between" slot="header">
										<a @click="preview('old')" :class="preview_monster ==='old' ? 'selected' : ''">Old monster</a>
										<a @click="preview('new')" :class="preview_monster ==='new' ? 'selected' : ''">New monster</a>
									</div>
									<div class="monster-card" v-if="preview_monster === 'old'">
										<ViewMonster :data="old_monster" />
									</div>
								</template>
								<hk-loader v-else />
							</hk-card>
						</div>
						<div class="col-12 col-md-8">
							<EditNpc :monster="monster" />
						</div>
					</div>
				</div>
				<div class="save">
					<div class="d-flex justify-content-start">
						<div v-if="unsaved_changes" class="bg-red white unsaved_changes">
							<i class="fas fa-exclamation-triangle"></i> There are unsaved changes in the monster
						</div>	
						<a v-if="unsaved_changes" class="btn bg-gray" @click="cancel_changes()">Revert</a>
					</div>
					<div>
						<router-link :to="`/contribute/monsters/${id}`" class="btn bg-gray mr-2">Cancel</router-link>
						<button 
							:disabled="errors.items && errors.items.length > 0"
							class="btn" 
							@click="store_monster()"
						>
							<i class="fas fa-check"></i> Save
						</button>
					</div>
				</div>
			</template>
		</div>
	</div>
</template>

<script>
import { db } from '@/firebase';
import Crumble from '@/components/crumble/Compendium.vue';
import ViewMonster from '@/components/ViewMonster.vue';
import EditNpc from './forms/EditNpc.vue';
import { general } from '@/mixins/general.js';
import { mapGetters } from 'vuex';

export default {
	name: 'MonsterEdit',
	components: {
		Crumble,
		ViewMonster,
		EditNpc
	},
	mixins: [general],
	metaInfo() {
		return {
			title: this.old_monster.name + ' | D&D 5th Edition',
			meta: [
				{ vmid: 'description', name: 'description', content: 'D&D 5th Edition Monster: ' + this.old_monster.name }
			]
		}
	},
	data() {
		return {
			userId: this.$store.getters.user.uid,
			id: this.$route.params.id,
			loading: true,
			monster: {},
			unsaved_changes: false,
			fb_monster_json: {},
			preview_monster: 'old',
		}
	},
	computed: {
		...mapGetters([
			"userInfo"
		]),
	},
	firebase() {
		return {
			monster: {
				source: db.ref(`new_monsters/${this.id}`),
				asObject: true,
				readyCallback: () => {
					this.loading = false
					this.fb_monster_json = JSON.stringify(this.monster);
					this.unsaved_changes = false
				}
			},
			old_monster: {
				source: db.ref(`monsters/${this.id}`),
				asObject: true,
				readyCallback: () => this.loading = false
			}
		}
	},
	methods: {
		canEdit() {
			return (this.old_monster.metadata && this.old_monster.metadata.tagged === this.userId) ||
				this.userInfo.admin;
		},
		preview(type) {
			this.preview_monster = type;
		},
		parse_old_monster() {
			

		},
		update() {
			this.$forceUpdate();
		},
		
		

		async store_monster() {
			delete this.monster['.value'];
			delete this.monster['.key'];

			this.monster.changed = true;
			this.monster.checked = false;

		
			db.ref(`new_monsters/${this.id}`).set(this.monster);
			this.$snotify.success('Monster Saved.', 'Critical hit!', {
				position: "rightTop"
			});
			this.unsaved_changes = false;
			this.fb_monster_json = JSON.stringify(this.monster);
		},
		cancel_changes() {
			this.monster = JSON.parse(this.fb_monster_json);
			this.unsaved_changes = false;
		}
	},
	watch: {
		monster: {
			deep: true,
			handler() {
				// Emits validation on every change
				if (JSON.stringify(this.monster) !== this.fb_monster_json)
					this.unsaved_changes = true;
				else
					this.unsaved_changes = false;
			},
		}
	},
	beforeRouteLeave (to, from, next) {
		if (this.unsaved_changes) {
			this.$snotify.error('There are unsaved changes in the form.\n Would you like to continue?', 'Unsaved Changes', {
				buttons: [
				{ text: 'Leave', action: (toast) => { next(); this.$snotify.remove(toast.id); }, bold: false},
				{ text: 'Stay', action: (toast) => { next(false); this.$snotify.remove(toast.id); }, bold: true},
				]
			});
		} else {
			next()
		}
	}

}
</script>


<style lang="scss" scoped>
.content {
	padding:0 20px;

	.monster-wrapper {
		display: grid;
		height: calc(100vh - 174px) !important;
		grid-template-rows: auto 60px;
	
		.form {
			overflow-x: hidden;
			overflow-y: scroll;
	
			&::-webkit-scrollbar {
				display: none;
			}
			.old_monster {
				position: -webkit-sticky;
				position: sticky;
				top: 0;
				.card-header a.selected {
					// font-weight: bold;
					color: white !important;
					cursor: default !important;
				}
			}
		}
	
		.save {
			display: flex;
			justify-content: space-between;
			padding: 10px 0;
			border-top: solid 1px #5c5757;
	
			.unsaved_changes {
				padding: 10px;
				height: 38px;
				margin-right: 10px;
			}
		}
	}
}

</style>