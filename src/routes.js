import { store } from './store/store';

const Contribute = () => import('@/views/Contribute');
const Spells_contrib = () => import('@/views/Contribute/Spells.vue');
const Spell_contrib = () => import('@/components/contribute/spell');
const SpellEdit = () => import('@/components/contribute/spell/edit.vue');

const Sitemap = () => import('@/views/Pages/Sitemap.vue');
const Privacy = () => import('@/views/Pages/Privacy.vue');
const Documentation = () => import('@/views/Pages/Documentation.vue');
const Updates = () => import('@/views/Pages/Updates.vue');
const SignIn = () => import('@/views/Pages/SignIn.vue');
const SignUp = () => import('@/views/Pages/SignUp.vue');
const Settings = () => import('@/views/UserContent/Settings.vue');
const ResetPassword = () => import('@/views/Pages/ResetPassword.vue');
const Patreon = () => import('@/views/Pages/Patreon.vue');
const WeatherDemo = () => import('@/views/Pages/WeatherDemo.vue');

const Profile = () => import('@/views/profile/Profile.vue');
const Username = () => import('@/views/profile/SetUsername.vue');
const DeleteAccount = () => import('@/views/profile/DeleteAccount.vue');
const Error404 = () => import('@/views/Pages/Error404.vue');
const Offline = () => import('@/views/Pages/Offline.vue');
const EditEncounter = () => import('@/views/UserContent/Encounters/Edit');
const RunEncounter = () => import('@/views/RunEncounter.vue');
const User = () => import('@/views/User.vue');

// This is where you add all your site routes
// Each route is set as an obect in the array
// For a the most basic route just set
// the path & component to load

export const routes = [{
		path: '',
		name: 'home',
		component: () => import('@/views/Home.vue'),
		meta: {
			sidebar: false,
			offline: true,
			description: "Harmless Key is the initiative tracker for D&D 5e. We keep track of everything in encounters so even during combat you can give your players the attention they deserve.",
			title: "D&D Combat Tracker"
		}
	},
	{ path: "/home", redirect: "/" },
	// {
	// 	path: '/home',
	// 	name: 'landingpage',
	// 	component: () => import('@/views/Home.vue'),
	// 	meta: {
	// 		sidebar: false,
	// 		offline: true,
	// 		description: "Harmless Key is the initiative tracker for D&D 5e. We keep track of everything in encounters so even during combat you can give your players the attention they deserve.",
	// 		title: "D&D Combat Tracker"
	// 	},
	// },

	// CONTENT
	{
		path: "/content",
		component: () => import("@/views/View"),
		meta: {
			requiresAuth: true,
			title: "Content"
		},
		children: [
			{
				path: "",
				name: "Content",
				component: () => import("@/views/UserContent"),
				meta: {
					description: "Your custom content on Harmless Key.",
					title: "Content"
				},
			},
			{
				path: "manage",
				name: "Manage content",
				component: () => import("@/views/UserContent/ManageContent"),
				meta: {
					description: "Manage your content on Harmless Key.",
					title: "Manage content"
				},
			},
			
			// Cammpaigns
			{
				path: "campaigns",
				component: { render (c) { return c('router-view') }},
				meta: {
					title: "Campaigns"		
				},
				children: [
					{	
						path: "",
						name: "Campaigns",
						component: () => import("@/views/UserContent/Campaigns/Campaigns.vue"),
						meta: {
							description: "Your campaigns on Harmless Key.",
							title: "Campaigns"
						},
					},
					{
						path: ":campid",
						component: { render (c) { return c('router-view') }},
						meta: {
							title: "Run campaign"
						},
						children: [
							{
								path: "",
								name: "Run campaign",
								component: () => import("@/views/UserContent/Encounters"),
								meta: {
									side: false,
									description: "Run your campaign on Harmless Key.",
									title: "Run campaign"
								},
							},
							{
								path: ':encid',
								name: 'EditEncounter',
								component: EditEncounter,
								meta: {
									title: 'Edit encounter',
									side: false,
									description: "Edit your Harmless Key encounter."
								}
							},
						]
					}
				]
			},
			
			// Players
			{
				path: "players",
				component: { render (c) { return c('router-view') }},
				meta: {
					title: "Players"
				},
				children: [
					{
						path: "",
						name: "Players",
						component: () => import("@/views/UserContent/Players"),
						meta: {
							description: "Your players Harmless Key.",
							title: "Players"
						},
					},
					{
						path: "add-player",
						name: "Add player",
						component: () => import("@/views/UserContent/Players/EditPlayer.vue"),
						meta: {
								title: "Add player",
								description: "Create a new player on Harmless Key."
						}
					},
					{
						path: ":id",
						name: "Edit player",
						component: () => import("@/views/UserContent/Players/EditPlayer.vue"),
						meta: {
							title: "Edit player",
							description: "Edit an existing player on Harmless Key."
						}
					}
				]
			},
			// NPCs
			{
				path: "npcs",
				component: { render (c) { return c('router-view') }},
				meta: {
					title: "NPCs"
				},
				children: [
					{
						path: "",
						name: "NPCs",
						component: () => import('@/views/UserContent/Npcs/Npcs.vue'),
						meta: {
								title: "NPCs",
								description: "Your custom non-player characters on Harmless Key."
						}
					},
					{
						path: 'add-npc',
						name: 'Add NPC',
						component: () => import('@/views/UserContent/Npcs/EditNpc.vue'),
						meta: {
							title: "Add NPC",
							description: "Create a new NPC on Harmless Key."
						}
					},
					{
						path: ':id',
						name: 'Edit NPC',
						component: () => import('@/views/UserContent/Npcs/EditNpc.vue'),
						meta: {
							title: "Edit NPC",
							description: "Edit an existing NPC on Harmless Key."
						}
					}
				]
			},
			{
				path: "companions",
				component: { render (c) { return c('router-view') }},
				meta: {
					title: "Companions"
				},
				children: [
					{
						path: '',
						name: "Companions",
						component: () => import('@/views/UserContent/Npcs/Npcs.vue'),
						meta: {
							title: "Companions",
							description: "Your custom companions Harmless Key."
						}
					},
					{
						path: ':id',
						name: 'Edit Companion',
						component: () => import('@/views/UserContent/Npcs/EditNpc.vue'),
						meta: {
							title: "Edit Companion",
							description: "Edit an existing companion on Harmless Key."
						}
					},
					{
						path: ':userid/:id',
						name: 'Edit companion',
						component: () => import('@/views/UserContent/Npcs/EditNpc.vue'),
						meta: {
							title: "Edit companion",
							description: "Edit an existing companion on Harmless Key."
						}
					}
				]
			},

			// Reminders
			{
				path: "reminders",
				component: { render (c) { return c('router-view') }},
				meta: {
					title: "Reminders"
				},
				children: [
					{
						path: '',
						name: "Reminders",
						component: () => import('@/views/UserContent/Reminders'),
						meta: {
							title: "Reminders",
							description: "Your custom reminders Harmless Key."
						}
					},
					{
						path: 'add-reminder',
						name: 'Add reminder',
						component: () => import('@/views/UserContent/Reminders/EditReminder.vue'),
						meta: {
							title: "Add reminder",
							description: "Add a new reminder on Harmless Key."
						}
					},
					{
						path: ':id',
						name: 'Edit reminder',
						component: () => import('@/views/UserContent/Reminders/EditReminder.vue'),
						meta: {
							title: "Edit reminder",
							description: "Edit an existing reminder Harmless Key."
						}
					},
				]
			},

			// Items
			{
				path: "items",
				component: { render (c) { return c('router-view') }},
				meta: {
					title: "Items"
				},
				children: [
					{
						path: '',
						name: "Items",
						component: () => import('@/views/UserContent/Items/Items.vue'),
						meta: {
							title: "Items",
							description: "Your custom items Harmless Key."
						}
					},
					{
						path: 'add-item',
						name: 'Add item',
						component: () => import('@/views/UserContent/Items/EditItem.vue'),
						meta: {
							title: "Add item",
							description: "Add an existing item on Harmless Key."
						}
					},
					{
						path: ':id',
						name: 'Edit item',
						component: () => import('@/views/UserContent/Items/EditItem.vue'),
						meta: {
							title: "Edit item",
							description: "Edit an existing item on Harmless Key."
						}
					}
				]
			},

			// Characters
			{
				path: "characters",
				component: { render (c) { return c('router-view') }},
				meta: {
					title: "Characters"
				},
				children: [
					{
						path: '',
						name: "Characters",
						component: () => import('@/views/UserContent/Characters'),
						meta: {
							title: "Characters",
							description: "Your player characters on Harmless Key."
						}
					},
					{
						path: ':id',
						name: 'Edit character',
						component: () => import("@/views/UserContent/Players/EditPlayer.vue"),
						meta: {
							title: "Edit character",
							description: "Edit an existing character on Harmless Key."
						}
					},
				]
			},

			// Followed users
			{
				path: "followed",
				component: { render (c) { return c('router-view') }},
				meta: {
					title: "Followed users",
				},
				children: [
					{
						path: '',
						name: "Followed users",
						component: () => import('@/views/UserContent/Followed.vue'),
						meta: {
							title: "Followed users",
							description: "Other users you're following on Harmless Key."
						}
					}
				]
			},
		]
	},

	//COMPENDIUM
	{
		path: '/compendium',
		component: () => import('@/views/View'),
		meta: { 
			title: "Compendium",
		},
		children: [
			{
				path: "",
				name: "Compendium",
				component: () => import('@/views/Compendium'),
				meta: {
					title: "Compendium D&D 5e",
					description: "Conditions, items, monsters and spells for Dungeons & Dragons 5th edition."
				}
			},
			{
				path: 'monsters',
				component: { render (c) { return c('router-view') }},
				meta: {
					title: "Monsters D&D 5e",
					description: "Dungeons & Dragons 5th edition monsters. All monsters from the SRD 5.1"
				},
				children: [
					{
						path: "",
						name: 'Monsters',
						component: () => import('@/views/Compendium/Monsters'),
						meta: {
							title: "Monsters D&D 5e",
							description: "Dungeons & Dragons 5th edition monsters. All monsters from the SRD 5.1"
						}
					},
					{
						path: ":id",
						name: "Monster",
						component: () => import('@/views/Compendium/view/Monster'),
						meta: {
							title: "Monster D&D 5e",
							description: "D&D 5th Edition monster."
						}
					}
				]
			},
			{
				path: 'spells',
				component: { render (c) { return c('router-view') }},
				meta: {
					title: "Spells D&D 5e"
				},
				children: [
					{
						path: "",
						name: 'Spells D&D 5e',
						component: () => import('@/views/Compendium/Spells'),
						meta: {
							title: "Spells D&D 5e",
							description: "Dungeons & Dragons 5th edition spells. All spells from the SRD 5.1"
						}
					},
					{
						path: ":id",
						name: "Spell",
						component: () => import('@/views/Compendium/view/Spell'),
						meta: {
							title: "Spell"
						}
					}
				]
			},
			{
				path: 'conditions',
				component: { render (c) { return c('router-view') }},
				meta: {
					title: "Conditions"
				},
				children: [
					{
						path: "",
						name: 'Conditions',
						component: () => import('@/views/Compendium/Conditions'),
						meta: {
							title: "Conditions D&D 5e",
							description: "Dungeons & Dragons 5th edition spells. All conditions from the SRD 5.1"
						}
					},
					{
						path: ":id",
						name: "Condition",
						component: () => import('@/views/Compendium/view/Condition'),
						meta: {
							title: "Condition"
						}
					}
				]
			},
			{
				path: 'items',
				component: { render (c) { return c('router-view') }},
				meta: {
					title: "Items"
				},
				children: [
					{
						path: "",
						name: "CompendiumItems",
						component: () => import('@/views/Compendium/Items'),
						meta: {
							title: "Items D&D 5e",
							description: "Dungeons & Dragons 5th edition items. All items from the SRD 5.1"
						}
					},
					{
						path: ":id",
						name: "Item",
						component: () => import('@/views/Compendium/view/Item'),
						meta: {
							title: "Item"
						}
					}
				]
			},
		]
	},

	// ADMIN
	{
		path: '/admin',
		component: () => import('@/views/View'),
		meta: {
			requiresAuth: true,
			requiresAdmin: true,
			side: false,
			title: "Admin"
		},
		children: [
			{
				path: "",
				name: 'Admin',
				component: () => import('@/views/Admin'),
				meta: {
					side: false
				}
			},
			{
				path: 'users',
				component: { render (c) { return c('router-view') }},
				meta: {
					title: "Users",
					side: false
				},
				children: [
					{
						path: "",
						name: 'Users',
						component: () => import('@/views/Admin/Users.vue'),
						meta: {
							side: false
						}
					},
					{
						path: ':id',
						name: 'User',
						component: () => import('@/views/Admin/Users.vue'),
						meta: {
							title: "User",
							side: false
						}
					},
				]
			},
			{
				path: 'patrons',
				component: { render (c) { return c('router-view') }},
				meta: {
					title: "Patrons"
				},
				children: [
					{
						path: "",
						name: 'Patrons',
						component: () => import('@/views/Admin/Patrons'),
						meta: {
							side: false
						}
					},
					{
						path: 'new',
						name: 'New patron',
						component: () => import('@/views/Admin/Patrons/New'),
						meta: {
							title: "New patron",
							side: false
						}
					},
					{
						path: ':id',
						name: 'Patron',
						component: () => import('@/views/Admin/Patrons'),
						meta: {
							title: "Patron",
							side: false
						}
					},
				]
			},
			{
				path: "export",
				component: { render (c) { return c('router-view') }},
				meta: {
					title: "Export"
				},
				children: [
					{
						path: "",
						name: 'Export datases',
						component: () => import('@/views/Admin/ExportDatabase.vue'),
						meta: {
							side: false
						}
					}
				]
			},
			{
				path: "xml",
				component: { render (c) { return c('router-view') }},
				meta: {
					title: "Generate XML"
				},
				children: [
					{
						path: "",
						name: 'Generate XML',
						component: () => import('@/views/Admin/GenerateXML.vue'),
						meta: {
							side: false
						}
					}
				]
			},
			{
				path: "prerender",
				component: { render (c) { return c('router-view') }},
				meta: {
					title: "Generete prerender paths JSON"
				},
				children: [
					{
						path: "",
						name: 'Generate JSON',
						component: () => import('@/views/Admin/GeneratePrerenderPaths.vue'),
						meta: {
							side: false
						}
					}
				]
			},
			{
				path: "monster-update",
				component: { render (c) { return c('router-view') }},
				meta: {
					title: "Update monsters"
				},
				children: [
					{
						path: "",
						name: 'Update monsters',
						component: () => import('@/views/Admin/MonsterUpdate.vue'),
						meta: {
							side: false
						}
					}
				]
			},
			{
				path: "search-table",
				component: { render (c) { return c('router-view') }},
				meta: {
					title: "Generate search table"
				},
				children: [
					{
						path: "",
						name: 'Generate search table',
						component: () => import('@/views/Admin/GenerateSearchTable.vue'),
						meta: {
							side: false
						}
					}
				]
			},
			{
				path: "restruct-db",
				component: { render (c) { return c('router-view') }},
				meta: {
					title: "Restructure Database"
				},
				children: [
					{
						path: "",
						name: 'Restructure Database',
						component: () => import('@/views/Admin/RestructDatabase.vue'),
						meta: {
							side: false
						}
					}
				]
			},
		]
	},

	// DEMO ENCOUNTER
	{
		path: '/demo',
		name: 'Demo',
		component: RunEncounter,
		meta: {
			sidebar: false,
			offline: true,
			title: "Encounter demo",
			description: "Try running an encounter with Harmless Key, a Combat Tracker for Dungeons & Dragons 5th Edition."
		},
	},
	{
		path: '/weather-demo',
		name: 'Weather demo',
		component: WeatherDemo,
		meta: {
			sidebar: false,
			offline: true,
			title: 'Weather effects.',
			description: "Add weather effects to your encounters with Harmless Key, a Dungeons & Dragons Combat Tracker."
		},
	},
	

	// CONTRUBUTE
	{
		path: '/contribute',
		name: 'Contribute',
		component: Contribute,
		meta: {
			requiresContribute: true,
			requiresAuth: true
		}
	},
	{
		path: '/contribute/spells',
		name: 'Contribute Spells',
		component: Spells_contrib,
		meta: {
			baseName: 'Spells',
			requiresContribute: true,
			requiresAuth: true
		}
	},
	{
		path: '/contribute/spells/:id',
		name: 'Contribute Spell',
		component: Spell_contrib,
		props: (route) => ({
			id: route.query.id,
		}),
		meta: {
			basePath: '/contribute',
			baseName: 'Spells',
			requiresContribute: true,
			requiresAuth: true
		}
	},
	{
		path: '/contribute/spells/:id/edit',
		name: 'Edit Spell',
		component: SpellEdit,
		props: (route) => ({
			id: route.query.id,
		}),
		meta: {
			basePath: '/contribute',
			baseName: 'Monsters',
			requiresContribute: true,
			requiresAuth: true
		}
	},

	//STAND ALONE PAGES
	{
		path: '/sitemap',
		name: 'Sitemap',
		component: Sitemap,
		meta: {
			title: 'Sitemap',
			description: "Sitemap of Harmless Key, a Combat Tracker for D&D."
		}
	},
	{
		path: '/privacy-policy',
		name: 'Privacy Policy',
		component: Privacy,
		meta: {
			title: 'Privacy policy',
			description: "Privacy policy for Harmless Key, a Combat Tracker for D&D."
		}
	},
	{
		path: "/about-us",
		component: () => import("@/views/View"),
		meta: {
			offline: true,
			title: "About us"
		},
		children: [
			{
				path: "",
				name: "About us",
				component: () => import("@/views/Pages/AboutUs"),
				meta: {
					title: "About us",
					description: "Harmless Key is a Combat Tracker for Dungeon and Dragons, created by 2 expierenced D&D players who were missing an initiative tracker that met their needs."
				}
			}
		]
	},
	{
		path: '/documentation',
		name: 'Documentation',
		component: Documentation,
		meta: {
			offline: true,
			title: "Documentation",
			description: "Documentation for Harmless Key, a Combat Tracker for D&D."
		}
	},
	{
		path: "/feedback",
		component: () => import("@/views/View"),
		meta: {
			offline: true,
			title: "Feedback"
		},
		children: [
			{
				path: "",
				name: "Feedback",
				component: () => import("@/views/Pages/Feedback"),
				meta: {
					title: "Feedback",
					description: "Leave feedback for Harmless Key, a Combat Tracker for D&D."
				}
			}
		]
	},
	{
		path: '/updates',
		name: 'Updates',
		component: Updates,
		meta: {
			offline: true,
			title: "Updates",
			description: "Follow update on Harmless Key, a Combat Tracker for D&D."
		}
	},
	{
		path: '/sign-in',
		name: 'signIn',
		component: SignIn,
		meta: {
			sidebar: false,
			description: "Sign in to your account on Harmless Key, a Combat Tracker for D&D."
		}
	},
	{
		path: '/sign-up',
		name: 'signUp',
		component: SignUp,
		meta: {
			sidebar: false,
			title: "Sign up",
			description: "Create an account for Harmless Key, a Combat Tracker for D&D"
		}
	},
	{
		path: '/forgot-password',
		name: 'resetPassword',
		component: ResetPassword,
		meta: {
			sidebar: false,
			title: "Forgot password",
			description: "Request to reset your Harmless Key password."
		}
	},
	{
		path: '/patreon',
		name: 'Patreon',
		component: Patreon,
		meta: {
			title: 'Patreon support',
			description: "Support Harmless Key on Patreon for more content slots and help our D&D Combat Tracker improve."
		}
	},
	{
		path: '/poster',
		name: 'poster',
		component: () => import('@/views/Home.vue'),
		beforeEnter(to, from, next) {
			store.dispatch("setPoster")
			next('/')
		}
	},

	//PROFILE
	{
		path: '/profile',
		name: 'profile',
		component: Profile,
		meta: {
			requiresAuth: true,
			title: "Profile",
			description: "Your Harmless Key profile page."
		}
	},
	{
		path: '/profile/delete-account',
		name: 'deleteAccount',
		component: DeleteAccount,
		meta: {
			requiresAuth: true
		}
	},
	{
		path: '/settings',
		name: 'settings',
		component: Settings,
		meta: {
			basePath: '/settings',
			title: 'Settings',
			requiresAuth: true
		}
	},
	{
		path: '/set-username',
		name: 'Username',
		component: Username,
		meta: {
			sidebar: false,
			title: "Set username",
			description: "Set your username for Harmless Key."
		}
	},
	{
		path: '/run-encounter/:campid/:encid',
		name: 'RunEncounter',
		component: RunEncounter,
		meta: {
			title: 'Run encounter',
			requiresAuth: true,
			sidebar: false,
			description: "Run your encounter in Harmless Key, a Combat Tracker for D&D 5e."
		},
	},
	{
		path: '/user/:userid',
		name: 'Follow user',
		component: User,
		meta: {
			basePath: '/user',
			title: 'User page',
			description: "Follow the live initiative lists of your DM with Harmless Key, a Dungeons & Dragons Initiavive Tracker."
		}
	},
	{
		path: '/user/:userid/:campid',
		name: 'Follow campaign',
		component: User,
		meta: {
			basePath: '/user',
			title: 'Campaign',
			sidebar: false,
			description: "Campaign with live initiative list of the encounters with Harmless Key, a Dungeons & Dragons Initiavive Tracker."
		}
	},
	{
		path: '/track-encounter/:userid',
		redirect: '/user/:userid',
	},
	{
		path: '/offline',
		name: 'Offline',
		component: Offline
	},
	
	// REDIRECT OLD PATHS
	{ path: "/campaigns", redirect: "/content/campaigns" },
	{ path: "/players", redirect: "/content/players" },
	{ path: "/characters", redirect: "/content/characters" },
	{ path: "/npcs", redirect: "/content/npcs" },
	{ path: "/reminders", redirect: "/content/reminders" },
	{ path: "/items", redirect: "/content/items" },
	{ path: "/encounters/*", redirect: "/content/campaigns" },
	{ path: "/followed", redirect: "/content/followed" },

	{
		path: '*',
		component: Error404
	},
];