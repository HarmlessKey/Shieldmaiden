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
                    label="Voucher"
                  />
                  <q-input
                    class="mb-2"
                    :dark="$store.getters.theme === 'dark'" filled square
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
                    v-model="newVoucher.duration"
                    label="Voucher"
                  />
                  <q-input
                    class="mb-2"
                    :dark="$store.getters.theme === 'dark'" filled square
                    type="text"
                    autocomplete="off"
                    v-model="newVoucher.valid_until"
                    label="Valid Until"
                  />
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
	import { db } from 'src/firebase';
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
        newVoucher: {},
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
            sortable: true
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
    },
		methods: {
      async addVoucher() {
        console.log(this.newVoucher)

        try {
          await voucherService.addNewVoucher(this.newVoucher)
          this.add = false;
          this.newVoucher = {}
          this.vouchers.push(this.newVoucher)

        } catch (error) {
          this.$snotify.error(error);
        }

      }
    },
    async mounted() {
      const vouchers_object = await voucherService.getAllVouchers();
      console.log(vouchers_object);
      this.vouchers = Object.values(vouchers_object);
      this.loading = false;
    },
	}
</script>

<style lang="scss" scoped>
</style>
