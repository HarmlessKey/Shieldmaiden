import { store } from './store/store';

const Contribute = () => import('@/views/Contribute');
const Spells_contrib = () => import('@/views/Contribute/Spells.vue');
const Spell_contrib = () => import('@/components/contribute/spell');
const SpellEdit = () => import('@/components/contribute/spell/edit.vue');
const Monsters_contrib = () => import('@/views/Contribute/Monsters.vue');
const Monster_contrib = () => import('@/components/contribute/monster');
const MonsterEdit = () => import('@/components/contribute/monster/edit.vue');

const Sitemap = () => import('@/views/Sitemap.vue');
const Privacy = () => import('@/views/Privacy.vue');
const AboutUs = () => import('@/views/AboutUs.vue');
const Documentation = () => import('@/views/Documentation.vue');
const Planned = () => import('@/views/Planned.vue');
const Feedback = () => import('@/views/Feedback.vue');
const Updates = () => import('@/views/Updates.vue');
const SignIn = () => import('@/views/SignIn.vue');
const SignUp = () => import('@/views/SignUp.vue');
const Settings = () => import('@/views/Settings.vue');
const ResetPassword = () => import('@/views/ResetPassword.vue');
const Patreon = () => import('@/views/Patreon.vue');
const ManageContent = () => import('@/views/ManageContent.vue');
const WeatherDemo = () => import('@/views/WeatherDemo.vue');

const GenerateXML = () => import('@/views/Admin/GenerateXML.vue');

const Profile = () => import('@/views/profile/Profile.vue');
const Username = () => import('@/views/profile/SetUsername.vue');
const DeleteAccount = () => import('@/views/profile/DeleteAccount.vue');
const Followed = () => import('@/views/Followed.vue');
const Error404 = () => import('@/views/Error404.vue');
const Offline = () => import('@/views/Offline.vue');
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
			offline: true
		}
	},
	{
		path: '/home',
		name: 'landingpage',
		component: () => import('@/views/Home.vue'),
		meta: {
			sidebar: false,
			offline: true
		},
	},

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
					},
					{
						path: ":campid",
						name: "Run campaign",
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
									side: false
								},
							},
							{
								path: ':encid',
								name: 'EditEncounter',
								component: EditEncounter,
								meta: {
									title: 'Edit encounter',
									side: false
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
						component: () => import("@/views/UserContent/Players")
					},
					{
						path: "add-player",
						name: "Add player",
						component: () => import("@/views/UserContent/Players/EditPlayer.vue"),
						meta: {
							title: "Add player"
						}
					},
					{
						path: ":id",
						name: "Edit player",
						component: () => import("@/views/UserContent/Players/EditPlayer.vue"),
						meta: {
							title: "Edit player"
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
					},
					{
						path: 'add-npc',
						name: 'Add NPC',
						component: () => import('@/views/UserContent/Npcs/EditNpc.vue'),
						meta: {
							title: "Add NPC"
						}
					},
					{
						path: ':id',
						name: 'Edit NPC',
						component: () => import('@/views/UserContent/Npcs/EditNpc.vue'),
						meta: {
							title: "Edit NPC"
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
						component: () => import('@/views/UserContent/Npcs/Npcs.vue')
					},
					{
						path: ':id',
						name: 'Edit Companion',
						component: () => import('@/views/UserContent/Npcs/EditNpc.vue'),
						meta: {
							title: "Edit NPC"
						}
					},
					{
						path: ':userid/:id',
						name: 'Edit companion',
						component: () => import('@/views/UserContent/Npcs/EditNpc.vue'),
						meta: {
							title: "Edit companion"
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
						component: () => import('@/views/UserContent/Reminders')
					},
					{
						path: 'add-reminder',
						name: 'Add reminder',
						component: () => import('@/views/UserContent/Reminders/EditReminder.vue'),
						meta: {
							title: "Add reminder"
						}
					},
					{
						path: ':id',
						name: 'Edit reminder',
						component: () => import('@/views/UserContent/Reminders/EditReminder.vue'),
						meta: {
							title: "Edit reminder"
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
						component: () => import('@/views/UserContent/Items/Items.vue')
					},
					{
						path: 'add-item',
						name: 'Add item',
						component: () => import('@/views/UserContent/Items/EditItem.vue'),
						meta: {
							title: "Add item"
						}
					},
					{
						path: ':id',
						name: 'Edit item',
						component: () => import('@/views/UserContent/Items/EditItem.vue'),
						meta: {
							title: "Edit item"
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
					},
					{
						path: ':id',
						name: 'Edit character',
						component: () => import("@/views/UserContent/Players/EditPlayer.vue"),
						meta: {
							title: "Edit character"
						}
					},
				]
			},
		]
	},

	//COMPENDIUM
	{
		path: '/compendium',
		component: () => import('@/views/View'),
		meta: { 
			title: "Compendium"
		},
		children: [
			{
				path: "",
				name: "Compendium",
				component: () => import('@/views/Compendium')
			},
			{
				path: 'monsters',
				component: { render (c) { return c('router-view') }},
				meta: {
					title: "Monsters"
				},
				children: [
					{
						path: "",
						name: 'Monsters',
						component: () => import('@/views/Compendium/Monsters'),
					},
					{
						path: ":id",
						name: "Monster",
						component: () => import('@/views/Compendium/View.vue'),
						meta: {
							title: "Monster"
						}
					}
				]
			},
			{
				path: 'spells',
				component: { render (c) { return c('router-view') }},
				meta: {
					title: "Spells"
				},
				children: [
					{
						path: "",
						name: 'Spells',
						component: () => import('@/views/Compendium/Spells'),
					},
					{
						path: ":id",
						name: "Spell",
						component: () => import('@/views/Compendium/View.vue'),
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
					},
					{
						path: ":id",
						name: "Condition",
						component: () => import('@/views/Compendium/View.vue'),
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
					},
					{
						path: ":id",
						name: "Item",
						component: () => import('@/views/Compendium/View.vue'),
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
			title: "Admin"
		},
		children: [
			{
				path: "",
				name: 'Admin',
				component: () => import('@/views/Admin')
			},
			{
				path: 'users',
				component: { render (c) { return c('router-view') }},
				meta: {
					title: "Users"
				},
				children: [
					{
						path: "",
						name: 'Users',
						component: () => import('@/views/Admin/Users.vue'),
					},
					{
						path: ':id',
						name: 'User',
						component: () => import('@/views/Admin/Users.vue'),
						meta: {
							title: "User"
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
					},
					{
						path: 'new',
						name: 'New patron',
						component: () => import('@/views/Admin/Patrons/New'),
						meta: {
							title: "New patron"
						}
					},
					{
						path: ':id',
						name: 'Patron',
						component: () => import('@/views/Admin/Patrons'),
						meta: {
							title: "Patron"
						}
					},
				]
			},
		]
	},
	{
		path: '/admin/xml',
		name: 'GenerateXML',
		component: GenerateXML,
		meta: {
			basePath: '/admin',
			baseName: 'Generate XML',
			requiresAuth: true,
			requiresAdmin: true
		}
	},

	// DEMO ENCOUNTER
	{
		path: '/demo',
		name: 'Demo',
		component: RunEncounter,
		meta: {
			sidebar: false,
			offline: true
		},
	},
	{
		path: '/weather-demo',
		name: 'Weather demo',
		component: WeatherDemo,
		meta: {
			sidebar: false,
			offline: true
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
	{
		path: '/contribute/monsters',
		name: 'Contribute Monsters',
		component: Monsters_contrib,
		meta: {
			baseName: 'Monsters',
			requiresContribute: true,
			requiresAuth: true
		}
	},
	{
		path: '/contribute/monsters/:id',
		name: 'Contribute Monster',
		component: Monster_contrib,
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
	{
		path: '/contribute/monsters/:id/edit',
		name: 'Edit Monster',
		component: MonsterEdit,
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
		component: Sitemap
	},
	{
		path: '/privacy-policy',
		name: 'Privacy Policy',
		component: Privacy
	},
	{
		path: '/about-us',
		name: 'About Us',
		component: AboutUs,
		meta: {
			offline: true
		}
	},
	{
		path: '/documentation',
		name: 'Documentation',
		component: Documentation,
		meta: {
			offline: true
		}
	},
	{
		path: '/feedback',
		name: 'Feedback',
		component: Feedback
	},
	{
		path: '/updates',
		name: 'Updates',
		component: Updates
	},
	{
		path: '/planned',
		name: 'Planned',
		component: Planned
	},
	{
		path: '/sign-in',
		name: 'signIn',
		component: SignIn,
		meta: {
			sidebar: false
		}
	},
	{
		path: '/sign-up',
		name: 'signUp',
		component: SignUp,
		meta: {
			sidebar: false
		}
	},
	{
		path: '/forgot-password',
		name: 'resetPassword',
		component: ResetPassword,
		meta: {
			sidebar: false
		}
	},
	{
		path: '/patreon',
		name: 'Patreon',
		component: Patreon
	},
	{
		path: '/manage-content',
		name: 'manageContent',
		component: ManageContent,
		meta: {
			requiresAuth: true
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
			requiresAuth: true
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
			sidebar: false
		}
	},
	{
		path: '/followed',
		name: 'Followed users',
		component: Followed,
		meta: {
			requiresAuth: true
		}
	},

	// REDIRECT OLD PATHS
	{ path: "/campaigns", redirect: "/content/campaigns" },
	{ path: "/players", redirect: "/content/players" },
	{ path: "/characters", redirect: "/content/characters" },
	{ path: "/npcs", redirect: "/content/npcs" },
	{ path: "/reminders", redirect: "/content/reminders" },
	{ path: "/items", redirect: "/content/items" },
	{ path: "/encounters/*", redirect: "/content/campaigns" },
	

	{
		path: '/run-encounter/:campid/:encid',
		name: 'RunEncounter',
		component: RunEncounter,
		meta: {
			basePath: '/campaigns',
			title: 'Campaigns',
			requiresAuth: true,
			sidebar: false
		},
	},
	{
		path: '/user/:userid',
		name: 'Track User',
		component: User,
		meta: {
			basePath: '/user',
			title: 'User',
		}
	},
	{
		path: '/user/:userid/:campid',
		name: 'Track Campaign',
		component: User,
		meta: {
			basePath: '/user',
			title: 'User',
			sidebar: false
		}
	},
	{
		path: '/track-encounter/:userid',
		redirect: '/user/:userid',
	},
	{
		path: '/npc-overhaul',
		name: 'NPC overhaul',
		component: () => import('@/views/Pages/npc_overhaul.vue'),
	},
	{
		path: '/404',
		name: '404',
		component: Error404
	},
	{
		path: '/offline',
		name: 'Offline',
		component: Offline
	},
	{
		path: '*',
		redirect: '/404'
	}
];