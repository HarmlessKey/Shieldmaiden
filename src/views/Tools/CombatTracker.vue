<template>
  <ToolsPage
    title="Combat Tracker"
    bg_img="dragon-encounter-tool-header.jpg"
  >

    <template v-slot:action_btn="{ btn_classes }">
      <q-btn
        color="primary"
        :class="btn_classes"
        no-caps push
        to="/demo">Try Demo Encounter</q-btn>

    </template>

    <p>
      Our initiative Tracker is probably the most advanced <strong>D&D Combat Tracker</strong> you can find online.<br/>
      During combat it tracks almost anything you can think of, making running encounters so much easier and more fun to do.
    </p>

    <h2 class="written">Features</h2>
    <q-img
      class="mb-3"
      src="~assets/_img/tools/combat-tracker/combat-tracker.png"
      alt="Harmless Key Combat Tracker"
      fit="contain"
      />

      <q-list :dark="$store.getters.theme === 'dark'" class="accordion mb-3">
        <q-expansion-item
          v-for="{ name, icon, title, text } in tracker"
          :dark="$store.getters.theme === 'dark'"
          switch-toggle-side
          :group="name"
          :key="`feature-${name}`"
        >
          <template v-slot:header>
            <q-item-section avatar>
              <i :class="icon" class="neutral-2" aria-hidden="true" />
            </q-item-section>
            <q-item-section v-text="title"/>
          </template>
          <div class="accordion-body" v-html="text" />
        </q-expansion-item>
      </q-list>

      <p>
        These are some of our features, but our combat tracker has a lot more to offer.<br/>
        Test <router-link to="/demo">our demo</router-link> encounter to see for yourself what the possibilities are.
      </p>

      <h2 class="written">Share the initiative list</h2>
      <q-img
        class="mb-3"
        src="~assets/_img/tools/combat-tracker/live-initiative.png"
        alt="Harmless Key Live Initiative Tracker"
        fit="contain"
      />

      <q-list :dark="$store.getters.theme === 'dark'" class="accordion mb-3">
        <q-expansion-item
          v-for="{ name, icon, title, text } in share"
          :dark="$store.getters.theme === 'dark'"
          switch-toggle-side
          :group="name"
          :key="`feature-${name}`"
        >
        <template v-slot:header>
          <q-item-section avatar>
            <i :class="icon" class="neutral-2" aria-hidden="true" />
          </q-item-section>
          <q-item-section v-text="title"/>
        </template>
        <div class="accordion-body" v-html="text" />
      </q-expansion-item>
    </q-list>

    <em>To fully use our Combat Tracker you need an account, but you can try out all it has to offer in our demo encounter.</em>
  </ToolsPage>
</template>

<script>
import { combat_tracker_texts, live_initiative_texts } from "src/utils/generalConstants";
import ToolsPage from "src/components/ToolsPage.vue";

export default {
  name: 'ToolsCombatTracker',
  components: {
    ToolsPage
  },
  data() {
    return {
      tracker: combat_tracker_texts.filter(item => item.name !== "more"),
      share: live_initiative_texts
    }
  }
}
</script>

<style lang="scss" scoped>
h2 {
  font-size: 25px;
  border-bottom: solid 1px $neutral-3;
}
h3 {
  line-height: normal;
  margin-bottom: 5px;
}
.hk-card {
  height: 100%;
  .card-image {
    font-size: 50px;
    line-height: 55px;
    text-shadow: 1px 1px 10px $black;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    text-transform: uppercase;
    background-size: auto;
  }
}
</style>
