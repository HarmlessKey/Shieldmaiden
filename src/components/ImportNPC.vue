<template>
  <q-dialog v-model="bulk_import_dialog">
    <hk-card header="Import NPC from JSON" :minWidth="400">
      <div class="card-body">
        <q-file 
          :dark="$store.getters.theme === 'dark'" 
          filled square 
          accept=".json"
          v-model="json_file" 
          @input="loadJSON()"
        >
          <template v-slot:prepend>
            <q-icon name="attach_file" />
          </template>
        </q-file>

        <h4 class="my-3">
          OR
        </h4>
        <ValidationObserver  v-slot="{ handleSubmit }">

          <q-form @submit="handleSubmit(parseJSON)">
            <ValidationProvider rules="json" name="JSON" v-slot="{ errors, invalid, validated}">
              <q-input
                :dark="$store.getters.theme === 'dark'" 
                filled square 
                type="textarea"
                label="JSON Input"
                v-model="json_input"
                :error="invalid && validated"
                :error-message="errors[0]"
              />

            </ValidationProvider>
            <q-btn class="btn btn-sm my-2" color="primary" no-caps type="submit" :disabled="!json_input">
              Parse Input
            </q-btn>
          </q-form>
        </ValidationObserver>
      </div>
    </hk-card>
  </q-dialog>
</template>

<script>
export default {
  name: "Import NPCs",
  props: {
    bulk: {
      type: Boolean,
      default: false
    },
  },
  data() { 
    return {
      npc: undefined,
      import_dialog: false,
      json_file: undefined,
    }
  },
  methods: {
    loadJSON() {
      const fr = new FileReader();

      fr.onload = e => {
        const result = JSON.parse(e.target.result)
        // const formatted = JSON.stringify(result, null, 2)
        // console.log(formatted)
        delete result.key

        this.npc = result
        this.import_dialog = false
        this.json_file = undefined

        console.log(this.npc)
      }

      fr.readAsText(this.json_file)
    },
  }
}
</script>

<style>

</style>