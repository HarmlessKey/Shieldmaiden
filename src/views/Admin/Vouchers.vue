<template>
	<hk-card>
    <div class="card-header">
      <span>Manage Vouchers</span>
      <button @click="add = !add" class="btn btn-sm bg-neutral-5">
        <i aria-hidden="true" class="fas fa-plus green" />
        <span class="d-none d-md-inline-block ml-1">New Voucher</span>
      </button>
    </div>
		<div class="card-body">
      <q-table
					:data="vouchers"
					:columns="columns"
					row-key="key"
					card-class="bg-none"
					flat
					:dark="$store.getters.theme !== 'light'"
					:loading="loading"
					separator="none"
					:pagination="{ rowsPerPage: 15 }"
					wrap-cells
				>

					<div slot="no-data" />
					<hk-loader slot="loading" name="players" />
          <template v-slot:body="props">
            <q-tr :props="props">
              <q-td
              v-for="col in props.cols"
              :key="col.name"
              :props="props"
              >
              {{ col.value }}
            </q-td>
            <q-td auto-width>
              <a class="btn btn-sm bg-neutral-5" @click="deleteVoucher(props.row.voucher)">
                <i class="fas fa-trash-alt" aria-hidden="true" />
                <q-tooltip anchor="top middle" self="center middle">
                  Delete voucher
                </q-tooltip>
              </a>
            </q-td>
            </q-tr>
          </template>
				</q-table>

        <q-dialog
          square
          v-model="add"
        >
          <div>
            <q-form @submit="addVoucher">
              <hk-card header="New Voucher" class="mb-0">
                <div class="card-body">
                  <q-input
                    class="mb-2"
                    :dark="$store.getters.theme === 'dark'" filled square
                    type="text"
                    autocomplete="off"
                    v-model="newVoucher.voucher"
                    name="voucher"
                    label="Voucher"
                    :rules="[val => !!val || 'Field is required']"
                  />
                  <!-- <p class="validate red" v-if="errors.has('voucher')">{{ errors.first('voucher') }}</p> -->
                  <q-select
                    class="mb-2"
                    :dark="$store.getters.theme === 'dark'" filled square
                    :options="tier_select"
                    map-options
                    emit-value
                    type="text"
                    autocomplete="off"
                    v-model="newVoucher.tier"
                    label="Tier"
                  />
                  <q-input
                    class="mb-2"
                    :dark="$store.getters.theme === 'dark'" filled square
                    type="number"
                    autocomplete="off"
                    v-model.number="newVoucher.duration"
                    label="Duration"
                  />

                  <q-input class="mb-2"
                    :dark="$store.getters.theme === 'dark'" filled square
                    v-model="newVoucher.valid_until"
                    label="Valid Until (MM/DD/YYYY)"
                    :rules="[val => !!val || 'Field is required']"
                  >
                    <template v-slot:append>
                      <q-icon name="event" class="cursor-pointer">
                        <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                          <q-date
                            v-model="newVoucher.valid_until"
                            mask="MM/DD/YYYY"
                            :dark="$store.getters.theme === 'dark'" filled square
                          >
                            <div class="row items-center justify-end">
                              <q-btn v-close-popup label="Close" color="primary" flat />
                            </div>
                          </q-date>
                        </q-popup-proxy>
                      </q-icon>
                    </template>
                  </q-input>
                </div>
                <div slot="footer" class="card-footer d-flex justify-end">
                  <q-btn v-close-popup no-caps label="Cancel" class="mr-1"/>
                  <q-btn type="submit" no-caps label="Add Voucher" class="mr-1" color="primary" />
                </div>
              </hk-card>
            </q-form>
          </div>
        </q-dialog>
		</div>
	</hk-card>
</template>

<script>
  import { voucherService } from 'src/services/vouchers';
	import { monsterMixin } from "src/mixins/monster";

	export default {
		name: 'GenerateSearchTable',
		mixins: [monsterMixin],
		data() {
			return {
        add: false,
        loading: true,
        vouchers: [],
        tiers: [],
        newVoucher: {},
        tierMap: {},
        columns: [
          {
            name: 'voucher',
            label: "Voucher",
            field: 'voucher',
            sortable: true,
            align: 'left',
          },
          {
            name: 'tier',
            label: 'Tier',
            field: 'tier',
            align: 'left',
            sortable: true,
            format: (val) => this.tierMap[val]
          },
          {
            name: 'duration',
            label: 'Duration',
            field: 'duration',
            align: 'left',
            sortable: true
          },
          {
            name: 'valid_until',
            label: 'Valid Until',
            field: 'valid_until',
            align: 'left',
            sortable: true
          },
        ]
      }
		},
    computed: {
      tier_select() {
        let tier_list = this.tiers
        tier_list.sort((a,b) => a.order - b.order)
        console.log(tier_list.filter(tier => tier.order > 0).map(tier => ({"label": tier.name, 'value': tier.id})))
        return tier_list.filter(tier => tier.order > 0).map(tier => ({"label": tier.name, 'value': tier.id}))
      }
    },
		methods: {
      async addVoucher() {
        try {
          await voucherService.addNewVoucher(this.newVoucher)
          this.add = false;
          this.vouchers.push(this.newVoucher)
          this.newVoucher = {}
        } catch (error) {
          this.$snotify.error(error);
        }

      },
      async getTierName(id) {
        const name = await voucherService.getTierName(id);
        console.log("Name in component", name)
        return name
      },
      async deleteVoucher(voucher_name) {
        await voucherService.deleteVoucher(voucher_name)

      }
    },
    async created() {
      const tiers = await voucherService.getVoucherTiers()
      this.tierMap = Object.entries(tiers).reduce((acc, [id, tier]) => ({...acc, [id]:tier.name}), {})
    },
    async mounted() {
      const vouchers_promise = voucherService.getAllVouchers();
      const tiers_promise = voucherService.getVoucherTiers();


      this.vouchers = Object.values(await vouchers_promise);
      this.tiers = Object.entries(await tiers_promise).map(([id, vals]) => {
        return {
          id,
          ...vals
        }
      });
      this.loading = false;
    },
	}
</script>

<style lang="scss" scoped>
</style>
