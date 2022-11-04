<template>
	<hk-card>
		<div class="card-header" slot="header">
			<h1><i aria-hidden="true" class="fas fa-tools mr-2" /> D&D 5e Tools</h1>
		</div>
		<div class="card-body row q-col-gutter-md">	
			<div v-for="(tool, key) in tools" class="col-12 col-sm-6 col-md-4" :key="key">
        <router-link :to="tool.url">
          <hk-card class="full-height tool">
            <div slot="image" class="card-image" :style="[ tool.image ? { backgroundImage: `url(${require(`src/assets/_img/${tool.image}`)})` } : '' ]" />
            <div class="card-body">
              <h2 class="written">{{ tool.title }}</h2>
              <em>{{ tool.description }}</em>
            </div>
            <div slot="footer" class="card-footer">
              <div v-if="tool.under_development" class="red full-width text-center">Under development</div>
              <q-btn v-else color="blue" no-caps push class="full-width" :icon="tool.icon" :label="`Use ${tool.title}`" />
            </div>
          </hk-card>
        </router-link>
      </div>
		</div>
	</hk-card>
</template>

<script>

	export default {
		name: 'ToolsOverview',
		data() {
			return {
        tools: {
          'combat-tracker': {
            title: "Combat Tracker",
            description: "Track everything in your encounters and share initiative with your players.",
            image: "dragon-encounter.jpg",
            url: "/tools/combat-tracker",
            icon: "fas fa-swords"
          },
          'encounter-builder': {
            title: "Encounter Builder",
            description: "Build encounters and see their difficulty for your party. You can run your encounters in our combat tracker.",
            image: "",
            url: "/tools/encounter-builder",
            icon: "fas fa-swords"
          },
          'monster-creator': {
            title: "Monster Creator",
            description: "Build custom monster stat blocks with easy to roll actions. You can use your monsters in our combat tracker.",
            image: "solar.jpg",
            url: "/tools/monster-creator",
            icon: "fas fa-dragon"
          },
          'Compendium': {
            title: "Compendium",
            description: "Quickly reference Monsters, Spells, Conditions and Items.",
            image: "compendium.jpg",
            url: "/compendium",
            icon: "fas fa-book-spells"
          },
          'Character Builder': {
            title: "Character Builder",
            description: "Build your character and get an online character sheet.",
            image: "",
            url: "/tools/character-builder",
            under_development: true,
            icon: "fas fa-helmet-battle"
          },
        }
      }
		}
	}
</script>

<style lang="scss" scoped>
a {
  all: unset;
  cursor: pointer;
}
.hk-card.tool {
  transition: all .5s ease-in;

  h2 {
    font-size: 21px;
  }

  .card-image {
    filter: grayscale(100%);
    transition: all .5s ease-in-out;

  }
  &:hover {
    background-color: $neutral-5;
    border-color: $neutral-4;
    
    .card-image {
      filter: grayscale(0%);
    }
  }
}
</style>