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
const Encounters = () => import('@/views/UserContent/Encounters');
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
		name: "Content",
		component: () => import("@/views/View"),
		meta: {
			requiresAuth: true
		},
		children: [
			{
				path: "",
				meta: {
					title: "Content"
				},
				component: () => import("@/views/UserContent"),
			},
			
			// Cammpaigns
			{
				path: "campaigns",
				name: "Campaigns",
				component: { render (c) { return c('router-view') }},
				children: [
					{	
						path: "",
						component: () => import("@/views/UserContent/Campaigns/Campaigns.vue"),
					},
					{
						path: ":campid",
						name: "Edit campaign",
						component: () => import("@/views/UserContent/Campaigns/EditCampaign.vue"),
						props: (route) => ({
							id: route.query.campid
						})
					},
				]
			},
			
			// Players
			{
				path: "players",
				name: "Players",
				component: { render (c) { return c('router-view') }},
				children: [
					{
						path: "",
						component: () => import("@/views/UserContent/Players"),
					},
					{
						path: "add-player",
						name: "Add player",
						component: () => import("@/views/UserContent/Players/EditPlayer.vue")
					},
					{
						path: ":id",
						name: "Edit player",
						component: () => import("@/views/UserContent/Players/EditPlayer.vue")
					},
				]
			},
			// NPCs
			{
				path: "npcs",
				name: "NPCs",
				component: { render (c) { return c('router-view') }},
				children: [
					{
						path: '',
						component: () => import('@/views/UserContent/Npcs/Npcs.vue')
					},
					{
						path: 'add-npc',
						name: 'Add NPC',
						component: () => import('@/views/UserContent/Npcs/EditNpc.vue')
					},
					{
						path: ':id',
						name: 'Edit NPC',
						component: () => import('@/views/UserContent/Npcs/EditNpc.vue')
					}
				]
			},
			{
				path: "companions",
				name: "Companions",
				component: { render (c) { return c('router-view') }},
				children: [
					{
						path: '',
						component: () => import('@/views/UserContent/Npcs/Npcs.vue')
					},
					{
						path: ':id',
						name: 'Edit NPC',
						component: () => import('@/views/UserContent/Npcs/EditNpc.vue')
					},
					{
						path: ':userid/:id',
						name: 'Edit Companion',
						component: () => import('@/views/UserContent/Npcs/EditNpc.vue')
					}
				]
			},

			// Reminders
			{
				path: "reminders",
				name: "Reminders",
				component: { render (c) { return c('router-view') }},
				children: [
					{
						path: '',
						component: () => import('@/views/UserContent/Reminders')
					},
					{
						path: 'add-reminder',
						name: 'Add reminder',
						component: () => import('@/views/UserContent/Reminders/EditReminder.vue'),
					},
					{
						path: ':id',
						name: 'Edit reminder',
						component: () => import('@/views/UserContent/Reminders/EditReminder.vue'),
					},
				]
			},

			// Items
			{
				path: "items",
				name: "Items",
				component: { render (c) { return c('router-view') }},
				children: [
					{
						path: '',
						component: () => import('@/views/UserContent/Items/Items.vue')
					},
					{
						path: 'add-item',
						name: 'Add item',
						component: () => import('@/views/UserContent/Items/EditItem.vue')
					},
					{
						path: ':id',
						name: 'Edit item',
						component: () => import('@/views/UserContent/Items/EditItem.vue')
					}
				]
			},

			// Characters
			{
				path: "characters",
				name: "Characters",
				component: { render (c) { return c('router-view') }},
				children: [
					{
						path: '',
						component: () => import('@/views/UserContent/Characters')
					},
					{
						path: ':id',
						name: 'Edit character',
						component: () => import("@/views/UserContent/Players/EditPlayer.vue")
					},
				]
			},
		]
	},

	//COMPENDIUM
	{
		path: '/compendium',
		name: "Compendium",
		component: () => import('@/views/View'),
		children: [
			{
				path: "",
				meta: { 
					title: "Compendium D&D 5e"
				},
				component: () => import('@/views/Compendium')
			},
			{
				path: 'monsters',
				name: 'Monsters',
				component: { render (c) { return c('router-view') }},
				children: [
					{
						path: "",
						component: () => import('@/views/Compendium/Monsters')
					},
					{
						path: ":id",
						name: "Monster",
						component: () => import('@/views/Compendium/View.vue')
					}
				]
			},
			{
				path: 'spells',
				name: 'Spells',
				component: { render (c) { return c('router-view') }},
				children: [
					{
						path: "",
						component: () => import('@/views/Compendium/Spells')
					},
					{
						path: ":id",
						name: "Spell",
						component: () => import('@/views/Compendium/View.vue')
					}
				]
			},
			{
				path: 'conditions',
				name: 'Conditions',
				component: { render (c) { return c('router-view') }},
				children: [
					{
						path: "",
						component: () => import('@/views/Compendium/Conditions')
					},
					{
						path: ":id",
						name: "Condition",
						component: () => import('@/views/Compendium/View.vue')
					}
				]
			},
			{
				path: 'items',
				name: 'Items',
				component: { render (c) { return c('router-view') }},
				children: [
					{
						path: "",
						component: () => import('@/views/Compendium/Items')
					},
					{
						path: ":id",
						name: "Item",
						component: () => import('@/views/Compendium/View.vue')
					}
				]
			},
		]
	},

	// ADMIN
	{
		path: '/admin',
		name: 'Admin',
		component: () => import('@/views/View'),
		meta: {
			requiresAuth: true,
			requiresAdmin: true
		},
		children: [
			{
				path: "",
				component: () => import('@/views/Admin'),
				meta: {
					title: "Admin",
				}
			},
			{
				path: 'users',
				name: 'Users',
				component: { render (c) { return c('router-view') }},
				children: [
					{
						path: "",
						component: () => import('@/views/Admin/Users.vue')
					},
					{
						path: ':id',
						name: 'User',
						component: () => import('@/views/Admin/Users.vue'),
						props: (route) => ({
							id: route.query.id
						})
					},
				]
			},
			{
				path: 'patrons',
				name: 'Patrons',
				component: { render (c) { return c('router-view') }},
				meta: {
					baseName: 'Patrons',
					requiresAuth: true,
					requiresAdmin: true
				},
				children: [
					{
						path: "",
						component: () => import('@/views/Admin/Patrons')
					},
					{
						path: 'new',
						name: 'New patron',
						component: () => import('@/views/Admin/Patrons/New')
					},
					{
						path: ':id',
						name: 'Patron',
						component: () => import('@/views/Admin/Patrons')
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
	
	{
		path: '/encounters/:campid',
		name: 'Encounters',
		component: Encounters,
		meta: {
			basePath: '/campaigns',
			title: 'Campaigns',
			requiresAuth: true
		},
	},
	{
		path: '/encounters/:campid/:encid',
		name: 'EditEncounter',
		component: EditEncounter,
		meta: {
			basePath: '/campaigns',
			title: 'Campaigns',
			requiresAuth: true
		}
	},
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