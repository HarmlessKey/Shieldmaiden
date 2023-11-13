<template>
  <div>
    <hk-input 
			v-model="query" 
			:dense="!compendium"
			label="Search"
			class="mb-2"
			clearable>
			<q-icon slot="prepend" name="search" />
		</hk-input>
		<p class="red" v-if="query && !sheet.length">Nothing found</p>
    <q-tabs
      v-if="!query"
			v-model="type"
			:dark="$store.getters.theme === 'dark'"
			inline-label
			outside-arrows
			mobile-arrows
      class="mb-2"
		>
			<q-tab
				v-for="{ name, label } in types"
				:name="name"
				:label="label"
				:key="name"
			/>
		</q-tabs>

    <q-list :dark="$store.getters.theme === 'dark'" class="accordion">
      <q-expansion-item
        v-for="{ type, name, description, caption, src, url } in sheet"
        :dark="$store.getters.theme === 'dark'"
        switch-toggle-side
        :name="name"
        :key="url"
      >
        <template v-slot:header>
          <q-item-section>
            <router-link v-if="compendium" :to="`/compendium/rules/${url}`" stop.prevent>
             {{ name }}
            </router-link>
            <template v-else>{{ name }}</template>
            <q-item-label caption class="neutral-3">{{ caption }}</q-item-label>
          </q-item-section>
          <q-item-section avatar class="neutral-3">
            {{ types.filter(item => item.name === type)[0]?.label }}
          </q-item-section>
        </template>

        <div class="accordion-body">
          <hk-markdown-editor :value="description" read-only />
          <span class="neutral-2">{{ src }}</span>
        </div>
      </q-expansion-item>
    </q-list>
  </div>
</template>

<script>
import { rules } from "src/utils/generalConstants";

export default {
  name: "CheatSheet",
  props: {
    compendium: {
      type: Boolean,
      default: false,
    }
  },
  data() {
    return {
      type: "action",
      query: null,
      types: [
        {
          name: "action",
          label: "Action"
        },
        {
          name: "bonus_action",
          label: "Bonus Action"
        },
        {
          name: "reaction",
          label: "Reaction"
        },
        {
          name: "movement",
          label: "Movement"
        },
        {
          name: "environment",
          label: "Environment"
        },
      ],
      cheatSheet: rules,
    }
  },
  computed: {
    sheet() {
      return this.query ? this.cheatSheet.filter(({ name, description }) => name.toLowerCase().includes(this.query.toLowerCase()) || description.toLowerCase().includes(this.query.toLowerCase())) : this.cheatSheet.filter(item => item.type === this.type);
    }
  }
}
</script>

<style lang="scss" scoped>

</style>