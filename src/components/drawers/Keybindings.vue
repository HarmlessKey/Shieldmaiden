<template>
	<div>
		<template v-for="({ name, keybindings }, index) in keybinbding_groups">
			<h3 :key="`header-${index}`" id="KeybindTable">{{ name }}</h3>
			<table class="table mb-3" :key="`group-${index}`" :class="{ 'table-sm': data && data.sm }" aria-describedby="KeybindTable">
				<thead>
					<th>Action</th>
					<th><i aria-hidden="true" class="fas fa-keyboard"></i> Keybind</th>
				</thead>
				<tbody>
					<tr v-for="({ action, bind }, i) in keybindings" :key="`row-${index}-${i}`">
						<td>{{ action }}</td>
						<td class="binds">
							<template v-for="(key, ii) in bind">
								<span class="bind" :key="`bind-${index}-${i}-${key}`">
									{{ key }}
								</span>
								{{ (ii &lt; bind.length - 1) ? " + " : "" }}
							</template>
						</td>
					</tr>
				</tbody>
			</table>
		</template>
	</div>
</template>

<script>
export default {
	name: "Keybindings",
	props: ["type", "data"],
	data() {
		return {
			keybinbding_groups: [
				{
					name: "General",
					keybindings: [
						{
							action: "Show dice roller",
							bind: ["R"],
						},
						{
							action: "Hide sidebar",
							bind: ["esc"],
						},
					],
				},
				{
					name: "Run encounter",
					keybindings: [
						{
							action: "Next turn",
							bind: ["shift", "arrow right"],
						},
						{
							action: "Previous turn",
							bind: ["shift", "arrow left"],
						},
						{
							action: "Cycle through panes left",
							bind: [","],
						},
						{
							action: "Cycle through panes right",
							bind: ["."],
						},
						{
							action: "Select target",
							bind: ["0-9"],
						},
						{
							action: "Cycle through targets",
							bind: ["arrow up/down"],
						},
						{
							action: "Edit target",
							bind: ["E"],
						},
						{
							action: "Transform target",
							bind: ["T"],
						},
						{
							action: "Show target's conditions",
							bind: ["C"],
						},
						{
							action: "Show target's reminders",
							bind: ["M"],
						},
						{
							action: "Damage/heal target(s)",
							bind: ["D"],
						},
						{
							action: "Out of turn Damage/healing",
							bind: ["shift", "D"],
						},
						{
							action: "Apply roll 'full'",
							bind: ["enter"],
						},
						{
							action: "Apply roll 'double'",
							bind: ["shift", "enter"],
						},
						{
							action: "Apply roll 'half'",
							bind: ["ctrl", "enter"],
						},
						{
							action: "Don't apply roll 'cancel'",
							bind: ["backspace"],
						},
					],
				},
			],
		};
	},
};
</script>
