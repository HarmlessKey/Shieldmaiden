<template>
	<div>
		<hk-card>
			<div class="card-header">
				<h1><i aria-hidden="true" class="fas fa-users"></i> Subscriptions</h1>
				<div v-if="!isBusy">{{ patrons.length }}</div>
			</div>
			<hk-loader v-if="isBusy" />
			<div v-else class="card-body">
				<button class="btn" @click="exportCSV">Export CSV</button>
			</div>
		</hk-card>
	</div>
</template>

<script>
import { db } from "src/firebase";
import { makeDate } from "src/utils/generalFunctions";

export default {
	name: "Users",
	data() {
		return {
			id: this.$route.params.id,
			patrons: [],
			fields: {
				username: {
					label: "Username",
					truncate: true,
					sortable: true,
				},
				email: {
					label: "Email",
					truncate: true,
					sortable: true,
					hide: "md",
				},
				patreon: {
					label: '<i aria-hidden="true" class="fab fa-patreon"></i>',
					maxContent: true,
					sortable: true,
				},
			},
			isBusy: true,
			csvRows: [
				"Created,Subscribed,Legacy,Tier,Status,Time till subscription in days, Time till subscription in hours, Time till subscription in ms",
			],
		};
	},
	async mounted() {
		await this.getPatrons();
	},
	methods: {
		async getPatrons() {
			try {
				const patreon_ref = db.ref("new_patrons");
				patreon_ref.once("value", async (snapshot) => {
					const patrons = Object.values(snapshot.val());

					for (let patron of patrons) {
						// Get user created date
						await db
							.ref("users")
							.orderByChild("patreon_email")
							.equalTo(patron.email)
							.once("value", (result) => {
								const user = result.val() ? Object.values(result.val())[0] : null;
								if (user) {
									patron.created = user.created;
								}
							});

						const created = patron.created ? new Date(patron.created) : new Date(2024, 4, 15);
						const difference = new Date(patron.pledge_start) - created;

						patron = {
							created: makeDate(created, true, true).replace(" at", ""),
							subscribed: makeDate(patron.pledge_start, true, true).replace(" at", ""),
							legacy: !patron.created,
							tier: patron.tiers ? Object.keys(patron.tiers)[0] : null,
							status: patron.status,
							time_till_subscription_days: difference.min(0)
								? difference.min(0) / 1000 / 60 / 60 / 24
								: 0,
							time_till_subscription_hours: difference.min(0)
								? difference.min(0) / 1000 / 60 / 60
								: 0,
							time_till_subscription_ms: difference.min(0) || 0,
						};
						this.patrons.push(patron);
						this.csvRows.push(Object.values(patron).join(","));
					}
					// Add patron to the list
					this.isBusy = false;
				});
			} catch (e) {
				console.error(e);
			}
		},
		exportCSV() {
			const filename = "active-patrons.csv";
			const csvString = this.csvRows.join("\n");

			// Create a blob and download the CSV
			const blob = new Blob([csvString], { type: "text/csv" });
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.setAttribute("href", url);
			a.setAttribute("download", filename);
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
		},
	},
};
</script>

<style lang="scss" scoped></style>
