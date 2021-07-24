<template>
	<div class="hk-text-editor">
		<div v-if="editor" class="menubar">
			<div class="group">
				<!-- <button v-for="({label, icon, action}, key) in modules " @click="action" :class="{ 'is-active': editor.isActive(key) }" :key="`module-${key}`">
					<i :class="icon" />
					<q-tooltip anchor="top middle" self="center middle">
						{{ label }}
					</q-tooltip>
				</button> -->
				<button @click="editor.chain().focus().toggleBold().run()" class="module" :class="{ 'is-active': editor.isActive('bold') }">
					<i class="fas fa-bold" />
					<q-tooltip anchor="top middle" self="center middle">
						Bold
					</q-tooltip>
				</button>
				<button @click="editor.chain().focus().toggleItalic().run()" class="module" :class="{ 'is-active': editor.isActive('italic') }">
					<i class="fas fa-italic" />
					<q-tooltip anchor="top middle" self="center middle">
						Italic
					</q-tooltip>
				</button>
				<button @click="editor.chain().focus().toggleUnderline().run()" class="module" :class="{ 'is-active': editor.isActive('underline') }">
					<i class="fas fa-underline" />
					<q-tooltip anchor="top middle" self="center middle">
						Underline
					</q-tooltip>
				</button>
			</div>
			<div class="group">
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
			<div class="group">
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

	export default {
		name: "hk-text-editor",
		props: {
			value: {
				type: String,
				default: undefined
			}
		},
		components: {
			EditorContent,
		},
		data() {
			return {
				editor: null,
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
		computed: {
			modules() {
				return {
					bold: {
						label: "Bold",
						icon: "fas fa-bold",
						action: this.editor.chain().focus().toggleBold().run()
					}
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

		mounted() {
			this.editor = new Editor({
				extensions: [
					StarterKit,
					Underline
				],
				content: this.value,
				onUpdate: () => {
					// HTML
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
		},
		methods: {

		}
	}
</script>

<style lang="scss" scope>
	.hk-text-editor {
		border: solid 1px $gray-hover;

		.menubar {
			border-bottom: solid 1px $gray-hover;
			display: flex;
			justify-content: flex-start;

			.group {
				display: flex;
				justify-content: flex-start;
				border-right: solid 1px $gray-hover;
				padding: 3px;

				&:last-child {
					border: none;
				}

				button.module {
					border: none;
					background: none;
					color: $white;
					width: 25px;
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
						background-color: $gray-hover;
					}
				}
			}
		}
		.editor-content {
			max-height: 400px;
			overflow: auto;
			padding: 10px;

			.ProseMirror {
				line-height: 30px;

				&:focus {
					outline: none;
				}
			}
		}

	}
</style>