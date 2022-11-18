<template>
  <ToolsPage
    title="Encounter Builder"
    :bg_img="require(`src/assets/_img/atmosphere/tool-header/encounter-builder-tool-header.jpg`)"
  >

    <template v-slot:create_btn="{ btn_classes }">
      <q-btn
        color="primary"
        :class="btn_classes"
        no-caps push
        to="/tools/encounter-builder/build-encounter"
      >
        Create encounter
      </q-btn>
    </template>

    <section>
      <h3>Encounter Builder</h3>
      <p>
        Easily add monsters and players to create an encounter that you can run in our Combat Tracker.
      </p>
      <p>
        Use the average monster HP or roll HP based on hit dice.
      </p>

      <q-img
        class="media large"
        src="~assets/_img/tools/encounter-builder/example-encounter.png"
        alt="Example encounter"
        fit="contain"
      />
    </section>

    <section class="d-lg-flex justify-between mt-5">
      <div>
        <h3>Difficulty</h3>
        <p>Encounter difficulty is calculated as you add or remove monsters to your encounter</p>
      </div>
      <video
        class="video media small" src="~assets/_img/tools/encounter-builder/difficulty.mp4"
        muted autoplay playsinline alt="Harmless Key logo animation" loop
      />
    </section>

    <em class="mb-0">To save encounters, you need an account.</em>


  </ToolsPage>
</template>

<script>
import ToolsPage from 'src/components/ToolsPage.vue';

	export default {
		name: 'ToolsEncounterBuilder',
    components: {
      ToolsPage
    },
		data() {
			return {
      }
		}
	}
</script>

<style lang="scss" scoped>

.media {
  display: block;
  margin: 30px auto;
}
.media.large {
  width: 100%;
  max-width: 600px;
}
.media.small {
  width: 50%;
  max-width: 300px;
  margin-left: 20px;
}


@media only screen and (max-width: $md-breakpoint) {
  .hk-card .card-image {
    font-size: 30px;
    line-height: 30px;
  }

  .media.small {
    width: 100%;
  }
}
</style>
