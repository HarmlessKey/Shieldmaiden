<template>
	<q-popup-proxy
		ref="menu"
		:dark="$store.getters.theme === 'dark'"
		anchor="bottom middle"
		self="top middle"
		transition-show="scale"
		transition-hide="scale"
		:breakpoint="576"
	>
		<div class="bg-neutral-8">
			<q-item>
				<q-item-section>
					<BasicEntity :entity="entity" />
				</q-item-section>
			</q-item>
			<q-separator />
			<div class="p-3">
				<slot :editable_entity="editable_entity" />
			</div>
			<div class="d-flex justify-content-end px-3 pb-2">
				<q-btn flat no-caps v-close-popup>Cancel</q-btn>
			</div>
		</div>
	</q-popup-proxy>
</template>

<script>
import BasicEntity from "../BasicEntity.vue";

export default {
	name: "QuickEdit",
	components: {
		BasicEntity,
	},
	props: {
		entity: {
			type: Object,
			required: true,
		},
	},
	computed: {
		editable_entity: {
			get() {
				let entity = { ...this.entity };

				// Edit different properties for transformed entities
				if (entity.transformed) {
					entity.maxHp = entity.transformedMaxHp;
					entity.curHp = entity.transformedCurHp;
					entity.ac = entity.transformedAc;
					entity.maxHpMod = entity.transformedMaxHpMod;
				}

				//remove maxHp mod
				const maxHpMod = entity.maxHpMod ? parseInt(entity.maxHpMod) : 0;
				entity.maxHp = maxHpMod > 0 ? entity.maxHp - maxHpMod : entity.maxHp + Math.abs(maxHpMod);

				return this.entitySetter ? this.entitySetter : entity;
			},
			set(newValue) {
				this.entitySetter = newValue;
			},
		},
	},
	methods: {
		hide() {
			this.$refs.menu.hide();
		},
	},
};
</script>
