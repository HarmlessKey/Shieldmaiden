<template>
	<div class="hk-text-editor">
		<div v-if="editor" class="menubar">
			<div class="group" v-if="toolbar.some(item => ['bold', 'italic', 'underline'].includes(item))">
				<button 
					v-if="toolbar.includes('bold')"
					class="module" 
					:class="{ 'is-active': editor.isActive('bold') }"
					@click="editor.chain().focus().toggleBold().run()" 
				>
					<i class="fas fa-bold" />
					<q-tooltip anchor="top middle" self="center middle">
						Bold
					</q-tooltip>
				</button>
				<button 
					v-if="toolbar.includes('italic')"
					class="module" 
					:class="{ 'is-active': editor.isActive('italic') }"
					@click="editor.chain().focus().toggleItalic().run()" 
				>
					<i class="fas fa-italic" />
					<q-tooltip anchor="top middle" self="center middle">
						Italic
					</q-tooltip>
				</button>
				<button 
					v-if="toolbar.includes('underline')"
					class="module" 
					:class="{ 'is-active': editor.isActive('underline') }"
					@click="editor.chain().focus().toggleUnderline().run()" 
				>
					<i class="fas fa-underline" />
					<q-tooltip anchor="top middle" self="center middle">
						Underline
					</q-tooltip>
				</button>
			</div>

			<!-- LISTS -->
			<div class="group" v-if="toolbar.some(item => ['ul', 'ol'].includes(item))">
				<button @click="editor.chain().focus().toggleBulletList().run()" class="module" :class="{ 'is-active': editor.isActive('bulletList') }">
					<i class="fas fa-list-ul" />
					<q-tooltip anchor="top middle" self="center middle">
						Bullet list
					</q-tooltip>
				</button>
				<button @click="editor.chain().focus().toggleOrderedList().run()" class="module" :class="{ 'is-active': editor.isActive('orderedList') }">
					<i class="fas fa-list-ol" />
					<q-tooltip anchor="top middle" self="center middle">
						Ordered list
					</q-tooltip>
				</button>
			</div>

			<!-- TABLES -->
			<div class="group" v-if="toolbar.includes('table')">
				<button @click="editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()" class="module">
					<i class="fas fa-table" />
					<q-tooltip anchor="top middle" self="center middle">
						Insert table
					</q-tooltip>
				</button>
				<q-btn-dropdown
					v-show="editor.can().addRowBefore()"
					square dark no-caps
					no-wrap
					unelevated
					label="Rows"
					size="sm"
				>
					<div class="bg-gray gray-light">
						<q-list dark square>
							<q-item 
								tag="label" 
								v-if="editor.can().addRowBefore()"
								clickable @click="editor.chain().focus().addRowBefore().run()"
							>
								<q-item-section class="pl-3">
									Add row before
								</q-item-section>
							</q-item>
						</q-list>
						<q-list dark square>
							<q-item 
								tag="label" 
								v-if="editor.can().addRowAfter()"
								clickable @click="editor.chain().focus().addRowAfter().run()"
							>
								<q-item-section class="pl-3">
									Add row after
								</q-item-section>
							</q-item>
						</q-list>
						<q-list dark square>
							<q-item 
								tag="label" 
								v-if="editor.can().deleteRow()"
								clickable @click="editor.chain().focus().deleteRow().run()"
							>
								<q-item-section class="pl-3">
									Delete row
								</q-item-section>
							</q-item>
						</q-list>
					</div>
				</q-btn-dropdown>
				
				<q-btn-dropdown
					v-show="editor.can().addColumnBefore()"
					square dark no-caps
					no-wrap
					unelevated
					label="Columns"
					size="sm"
				>
					<div class="bg-gray gray-light">
						<q-list dark square>
							<q-item 
								tag="label" 
								v-if="editor.can().addColumnBefore()"
								clickable @click="editor.chain().focus().addColumnBefore().run()"
							>
								<q-item-section class="pl-3">
									Add column before
								</q-item-section>
							</q-item>
						</q-list>
						<q-list dark square>
							<q-item 
								tag="label" 
								v-if="editor.can().addColumnAfter()"
								clickable @click="editor.chain().focus().addColumnAfter().run()"
							>
								<q-item-section class="pl-3">
									Add column after
								</q-item-section>
							</q-item>
						</q-list>
						<q-list dark square>
							<q-item 
								tag="label" 
								v-if="editor.can().deleteColumn()"
								clickable @click="editor.chain().focus().deleteColumn().run()"
							>
								<q-item-section class="pl-3">
									Delete column
								</q-item-section>
							</q-item>
						</q-list>
					</div>
				</q-btn-dropdown>
				<button @click="editor.chain().focus().deleteTable().run()" class="module" v-show="editor.can().deleteTable()">
					<i class="fas fa-trash-alt" />
					<q-tooltip anchor="top middle" self="center middle">
						Delete table
					</q-tooltip>
				</button>
			</div>

			<!-- CHARACTER STATS -->
			<div class="group" v-if="toolbar.includes('character')">
				<q-btn-dropdown
					square dark no-caps
					no-wrap
					unelevated
					label="Character stats"
					size="sm"
				>
					<div class="bg-gray gray-light">
						<q-list dark square>
							<template v-for="(stat_group, groupKey) in character_stats" >
								<q-item :key="`character-group-${groupKey}`">
									<span class="text-weight-bold text-white mt-2">{{ groupKey }}</span>
								</q-item>
							
								<q-item 
									v-for="({stat, ref}, statKey) in stat_group"
									:key="`character-stat-${groupKey}-${statKey}`"
									tag="label" 
									clickable @click="editor.commands.insertContent(ref)"
								>
									<q-item-section class="pl-3">{{ stat }}</q-item-section>
								</q-item>
							</template>
						</q-list>
					</div>
				</q-btn-dropdown>
			</div>

			<div class="group actions" v-if="this.value !== this.newValue">
				<button class="module" @click="save">
					<i class="fas fa-check green mr-1" /> Save
				</button>
			</div>
		</div>
		<div class="editor-content">
			<editor-content :editor="editor" spellcheck="false" />
		</div>
	</div>
</template>

<script>
	import { Editor, EditorContent } from "@tiptap/vue-2";
	import StarterKit from "@tiptap/starter-kit";
	import Underline from "@tiptap/extension-underline";
	import Table from "@tiptap/extension-table";
	import TableRow from "@tiptap/extension-table-row";
	import TableCell from "@tiptap/extension-table-cell";
	import TableHeader from "@tiptap/extension-table-header";

	export default {
		name: "hk-text-editor",
		props: {
			value: {
				type: String,
				default: undefined
			},
			toolbar: {
				type: Array,
				default: () => ['bold', 'italic', 'underline']
			}
		},
		components: {
			EditorContent
		},
		data() {
			return {
				editor: null,
				newValue: this.value,
				character_stats: {
					'General': [

						{
							stat: "Proficiency bonus",
							ref: "[proficiency]"
						},
						{
							stat: "Character level",
							ref: "[character_level]"
						}
					],
					'Class': [
						{
							stat: "Class level",
							ref: "[class_level]"
						},
						{
							stat: "Spell attack modifier",
							ref: "[spell_attack]"
						},
						{
							stat: "Spell save DC",
							ref: "[spell_save_dc]"
						}
					],
					'Ability scores': [
						{
							stat: "Strength",
							ref: "[str]"
						},
						{
							stat: "Dexterity",
							ref: "[dex]"
						},
						{
							stat: "Constitution",
							ref: "[con]"
						},
						{
							stat: "Intelligence",
							ref: "[int]"
						},
						{
							stat: "Wisdom",
							ref: "[wis]"
						},
						{
							stat: "Charisma",
							ref: "[cha]"
						},
					],
					'Ability modifiers': [
						{
							stat: "Strength modifier",
							ref: "[str_mod]"
						},
						{
							stat: "Dexterity modifier",
							ref: "[dex_mod]"
						},
						{
							stat: "Constitution modifier",
							ref: "[con_mod]"
						},
						{
							stat: "Intelligence modifier",
							ref: "[int_mod]"
						},
						{
							stat: "Wisdom modifier",
							ref: "[wis_mod]"
						},
						{
							stat: "Charisma modifier",
							ref: "[cha_mod]"
						},
					]
				}
			}
		},
		watch: {
			value(value) {
				// HTML
				const isSame = this.editor.getHTML() === value

				// JSON
				// const isSame = this.editor.getJSON().toString() === value.toString()

				if (isSame) {
					return
				}

				this.editor.commands.setContent(this.value, false)
			},
		},
		methods: {
			save() {
				this.$emit("save", this.newValue);
			}
		},
		mounted() {
			this.editor = new Editor({
				extensions: [
					StarterKit,
					Underline,
					Table.configure({
						resizable: true,
					}),
					TableRow,
					TableHeader,
					TableCell,
				],
				content: this.value,
				onUpdate: () => {
					// HTML
					this.newValue = this.editor.getHTML();
					this.$emit('input', this.editor.getHTML())

					// JSON
					// this.$emit('input', this.editor.getJSON())
				},
				onBlur: () => {
					this.$emit('change', this.editor.getHTML())
				},
			})
		},
		beforeDestroy() {
			this.editor.destroy()
		}
	}
</script>

<style lang="scss" scope>
	.hk-text-editor {
		border: solid 1px $neutral-2;

		.menubar {
			border-bottom: solid 1px $neutral-2;
			display: flex;
			justify-content: flex-start;
			flex-wrap: wrap;
			padding-right: 70px;

			.group {
				display: flex;
				justify-content: flex-start;
				border-right: solid 1px $neutral-2;
				padding: 3px;

				&:last-child {
					border: none;
				}

				button.module {
					border: none;
					background: none;
					color: $white;
					height: 25px;
					line-height: 25px;
					text-align: center;
					cursor: pointer;
					margin-right: 1px;

					&:last-child {
						margin: 0;
					}
	
					&.is-active {
						color: $blue;
					}
					&:hover {
						background-color: $neutral-2;
					}
				}

				.q-btn__wrapper {
					padding: 4px;
				}

				&.actions {
					position: absolute;
					right: 21px;
				}
			}
		}
		.editor-content {
			max-height: 400px;
			overflow: auto;
			padding: 10px;
			resize: vertical;

			> div {
				height: 100%;

				.ProseMirror {
					line-height: 30px;
					height: 100%;
	
					&:focus {
						outline: none;
					}
	
					.tableWrapper {
						padding: 1rem 0;
						overflow-x: auto;
	
						table {
							display: table;
							border-collapse: separate;
							border-spacing: 1px;
	
							th, td {
								padding: 5px;
								background: $neutral-2;
								vertical-align: top;
								position: relative;
								color: $white;
	
								p {
									margin: 0;
								}
							}
							th {
								text-align: left;
								font-weight: bold;
								background: $neutral-8;
							}
						}
					}
				}
			}
		}

	}
</style>