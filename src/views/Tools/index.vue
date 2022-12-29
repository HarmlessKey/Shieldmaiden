<template>
	<hk-card>
		<div class="card-header" slot="header">
			<h1><i aria-hidden="true" class="fas fa-tools mr-2" /> D&D 5e Tools</h1>
		</div>
		<div class="card-body">
      <SignedIn v-if="user" />
      <div class="row q-col-gutter-md">
        <div v-for="(tool, key) in tools" class="col-12 col-sm-6 col-md-4" :key="key">
          <router-link :to="tool.url">
            <hk-card class="full-height tool">
              <div slot="image" class="card-image" :style="[ tool.image ? { backgroundImage: `url(${require(`src/assets/_img/atmosphere/medium/${tool.image}`)})` } : '' ]">
                <i :class="tool.icon" aria-hidden="true" />
              </div>
              <div slot="header" class="card-header written">
                {{ tool.title }}
              </div>
              <div class="card-body">
                {{ tool.description }}
              </div>
              <div slot="footer" class="card-footer">
                <div v-if="tool.under_development" class="red full-width text-center">Under development</div>
                <button v-else class="btn btn-block">
                  Use {{ tool.title }}
                </button>
              </div>
            </hk-card>
          </router-link>
        </div>
      </div>
		</div>
	</hk-card>
</template>

<script>
  import { mapGetters } from "vuex";
  import SignedIn from "src/components/userContent/SignedIn.vue";

	export default {
		name: 'ToolsOverview',
    components: {
      SignedIn
    },
    computed: {
      ...mapGetters(["user"])
    },
		data() {
			return {
        tools: {
          'combat-tracker': {
            title: "Combat Tracker",
            description: "Track everything in your encounters and share initiative with your players.",
            image: "dragon-encounter-medium.jpg",
            url: "/tools/combat-tracker",
            icon: "fas fa-swords"
          },
          'encounter-builder': {
            title: "Encounter Builder",
            description: "Build encounters and see their difficulty for your party. You can run your encounters in our combat tracker.",
            image: "encounter-builder-medium.jpg",
            url: "/tools/encounter-builder",
            icon: "fas fa-hammer-war"
          },
          'monster-creator': {
            title: "Monster Creator",
            description: "Build custom monster stat blocks with easy to roll actions. You can use your monsters in our combat tracker.",
            image: "monster-medium.jpg",
            url: "/tools/monster-creator",
            icon: "fas fa-dragon"
          },
          'Compendium': {
            title: "Compendium",
            description: "Quickly reference Monsters, Spells, Conditions and Items.",
            image: "compendium-medium.jpg",
            url: "/compendium",
            icon: "fas fa-book-spells"
          },
          'Character Builder': {
            title: "Character Builder",
            description: "Build your character and get an online character sheet.",
            image: "characters-medium.jpg",
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

  .card-header {
    transition: all .5s ease-in;
    min-height: 32px;
    font-size: 21px;
  }
  .card-image {
    filter: grayscale(50%);
    transition: all .5s ease-in-out;
    font-size: 95px;
    width:inherit;
    text-align: center;
    line-height: 180px;
    text-shadow: 0 0 20px $black;
  }
  &:hover {
    background-color: $neutral-5;
    border-color: $neutral-4;

    .card-header {
      background-color: $neutral-7;
    }
    .card-image {
      filter: grayscale(0%);
    }
  }
}
</style>
