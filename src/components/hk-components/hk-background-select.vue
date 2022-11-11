<template>
  <q-select 
    v-bind="$attrs"
    :dark="$store.getters.theme === 'dark'" filled square
    v-model="background"
    :options="background_options"
    map-options
    emit-value
    clearable
  >
    <template v-slot:selected>
      <span v-if="background" class="truncate">
        {{ label(background) }}
      </span>
    </template>
    <template v-slot:option="scope">
      <q-item
        clickable
        v-ripple
        v-close-popup
        :active="background === scope.opt.value"
        @click="background = scope.opt.value"
        :style="{ backgroundImage: `url(${require(`src/assets/_img/atmosphere/medium/${scope.opt.value}-medium.jpg`)})` }"
      >
        <q-item-section>
          <q-item-label v-text="scope.opt.name"/>
        </q-item-section>
      </q-item>
    </template>
  </q-select>
</template>

<script>
  import { backgrounds } from "../../utils/generalConstants";

  export default {
    name: 'hk-background-select',
    props: {
      value: {
        type: String,
        default: undefined
      },
    },
    data() {
      return {
        background_options: backgrounds
      }
    },
    computed: {
      background: {
        get() {
          return this.value;
        },
        set(newVal) {
          this.$emit("input", newVal);
        }
      }
    },
    methods: {
      label(value) {
        return this.background_options.filter(option => option.value === value)[0].name;
      }
    }
  }
</script>

<style lang="scss" scoped>
.q-item {
  height: 100px;
  background-size: cover;
  background-repeat: no-repeat;
  background-position: bottom center;
  text-shadow: 0 0 5px $black;
}
</style>
