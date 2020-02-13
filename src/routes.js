
import { store } from './store/store'

const Home = () => import('@/views/Home.vue');

const Compendium = () => import('@/views/Compendium/Overview.vue');
const View = () => import('@/views/Compendium/View.vue');
const Monsters = () => import('@/views/Compendium/Monsters.vue');
const Spells = () => import('@/views/Compendium/Spells.vue');
const Conditions = () => import('@/views/Compendium/Conditions.vue');
const CompendiumItems = () => import('@/views/Compendium/Items.vue');

const Spells_contrib = () => import('@/views/Contribute/Spells.vue');
const Contribute = () => import('@/views/Contribute');

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

const Admin = () => import('@/views/Admin/Overview.vue');
const Users = () => import('@/views/Admin/Users.vue');
const Patrons = () => import('@/views/Admin/Patrons');
const NewPatron = () => import('@/views/Admin/Patrons/New.vue');
const GenerateXML = () => import('@/views/Admin/GenerateXML.vue');

const Profile = () => import('@/views/profile/Profile.vue');
const Username = () => import('@/views/profile/SetUsername.vue');
const DeleteAccount = () => import('@/views/profile/DeleteAccount.vue');
const Followed = () => import('@/views/Followed.vue');
const Error404 = () => import('@/views/Error404.vue');
const MyContent = () => import('@/views/MyContent/Campaigns/Campaigns.vue');
const EditCampaign = () => import('@/views/MyContent/Campaigns/EditCampaign.vue');
const Encounters = () => import('@/views/MyContent/Encounters');
const EditEncounter = () => import('@/views/MyContent/Encounters/Edit');
const Players = () => import('@/views/MyContent/Players/Players.vue');
const EditPlayer = () => import('@/views/MyContent/Players/EditPlayer.vue');
const Reminders = () => import('@/views/MyContent/Reminders');
const EditReminder = () => import('@/views/MyContent/Reminders/EditReminder.vue');
const Characters = () => import('@/views/MyContent/Characters');
const Npcs = () => import('@/views/MyContent/Npcs/Npcs.vue');
const EditNpc = () => import('@/views/MyContent/Npcs/EditNpc.vue');
const Items = () => import('@/views/MyContent/Items/Items.vue');
const EditItem = () => import('@/views/MyContent/Items/EditItem.vue');
const RunEncounter = () => import('@/views/MyContent/RunEncounter.vue');
const User = () => import('@/views/User.vue');

// This is where you add all your site routes
// Each route is set as an obect in the array
// For a the most basic route just set
// the path & component to load

export const routes = [{
	path: '',
	name: 'home',
	component: Home,
	meta: {
		sidebar: false
	}
},
{
	path: '/demo',
	name: 'Demo',
	component: RunEncounter,
	meta: {
		sidebar: false
	},
},
//COMPENDIUM
{
	path: '/compendium',
	name: 'Compendium',
	component: Compendium
},
{
	path: '/compendium/:type/:id',
	name: 'View',
	component: View,

},
{
	path: '/compendium/monsters',
	name: 'Monsters',
	component: Monsters,
	meta: {
		baseName: 'Monsters',
	}
},
{
	path: '/compendium/spells',
	name: 'Spells',
	component: Spells,
	meta: {
		baseName: 'Spells',
	}
},
{
	path: '/compendium/conditions',
	name: 'Conditions',
	component: Conditions,
	meta: {
		baseName: 'Conditions',
	}
},
{
	path: '/compendium/items',
	name: 'Items',
	component: CompendiumItems,
	meta: {
		baseName: 'items',
	}
},

// CONTRUBUTE
{
	path: '/admin/contribute',
	name: 'Contribute',
	component: Contribute
},
{
	path: '/admin/contribute/spells',
	name: 'Contribute Spells',
	component: Spells_contrib,
	meta: {
		baseName: 'Spells',
	}
},
{
	path: '/admin/contribute/spells/:id',
	name: 'Contribute Spell',
	component: Spells_contrib,
	props: (route) => ({
		id: route.query.id,
	}),
	meta: {
		basePath: '/contribute',
		baseName: 'Spells',
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
	component: AboutUs
},
{
	path: '/documentation',
	name: 'Documentation',
	component: Documentation
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
	component: Home,
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
},
{
	path: '/followed',
	name: 'followed',
	component: Followed,
	meta: {
		requiresAuth: true
	}
},

//ADMIN
{
	path: '/admin',
	name: 'Admin',
	component: Admin,
	meta: {
		basePath: '/admin',
		title: 'admin',
		requiresAuth: true,
		requiresAdmin: true
	}
},
{
	path: '/admin/users',
	name: 'Users',
	component: Users,
	meta: {
		baseName: 'Users',
		requiresAuth: true,
		requiresAdmin: true
	}
},
{
	path: '/admin/users/:id',
	name: 'User',
	component: Users,
	props: (route) => ({
		id: route.query.id
	}),
	meta: {
		basePath: '/admin',
		baseName: 'Users',
		requiresAuth: true,
		requiresAdmin: true
	}
},
{
	path: '/admin/patrons',
	name: 'Patrons',
	component: Patrons,
	meta: {
		baseName: 'Patrons',
		requiresAuth: true,
		requiresAdmin: true
	}
},
{
	path: '/admin/patrons/new',
	name: 'New patron',
	component: NewPatron,
	meta: {
		baseName: 'Patrons',
		requiresAuth: true,
		requiresAdmin: true
	}
},
{
	path: '/admin/patrons/:id',
	name: 'Patron',
	component: Patrons,
	props: (route) => ({
		id: route.query.id
	}),
	meta: {
		basePath: '/admin',
		baseName: 'Patrons',
		requiresAuth: true,
		requiresAdmin: true
	}
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

//USER CONTENT
{
	path: '/campaigns',
	name: 'myContent',
	component: MyContent,
	props: (route) => ({
		id: route.query.id
	}),
	meta: {
		basePath: '/campaigns',
		title: 'Campaigns',
		requiresAuth: true
	}
},
{
	path: '/campaigns/:campid',
	name: 'Edit Campaign',
	component: EditCampaign,
	props: (route) => ({
		id: route.query.campid
	}),
	meta: {
		basePath: '/campaigns',
		title: 'Campaigns',
		requiresAuth: true
	}
},
{
	path: '/players',
	name: 'Players',
	component: Players,
	meta: {
		basePath: '/players',
		title: 'Players',
		requiresAuth: true
	}
},
{
	path: '/players/add-player',
	name: 'AddPlayers',
	component: EditPlayer,
	meta: {
		basePath: '/players',
		title: 'Players',
		requiresAuth: true
	}
},
{
	path: '/players/:id',
	name: 'EditPlayers',
	component: EditPlayer,
	meta: {
		basePath: '/players',
		title: 'Players',
		requiresAuth: true
	}
},
{
	path: '/reminders',
	name: 'Reminders',
	component: Reminders,
	meta: {
		basePath: '/reminders',
		title: 'Reminders',
		requiresAuth: true
	}
},
{
	path: '/reminders/add-reminder',
	name: 'AddReminders',
	component: EditReminder,
	meta: {
		basePath: '/reminders',
		title: 'Reminders',
		requiresAuth: true
	}
},
{
	path: '/reminders/:id',
	name: 'EditReminders',
	component: EditReminder,
	meta: {
		basePath: '/reminders',
		title: 'Reminders',
		requiresAuth: true
	}
},
{
	path: '/characters',
	name: 'Characters',
	component: Characters,
	meta: {
		basePath: '/characters',
		title: 'Characters',
		requiresAuth: true
	}
},
{
	path: '/characters/:id',
	name: 'Edit Character',
	component: EditPlayer,
	meta: {
		basePath: '/characters',
		title: 'Character',
		requiresAuth: true
	}
},
{
	path: '/npcs',
	name: 'Npcs',
	component: Npcs,
	meta: {
		basePath: '/npcs',
		title: 'NPCs',
		requiresAuth: true
	}
},
{
	path: '/npcs/add-npc',
	name: 'AddNPC',
	component: EditNpc,
	meta: {
		basePath: '/npcs',
		title: 'NPCs',
		requiresAuth: true
	}
},
{
	path: '/npcs/:id',
	name: 'EditNPC',
	component: EditNpc,
	meta: {
		basePath: '/npcs',
		title: 'NPCs',
		requiresAuth: true
	}
},
{
	path: '/items',
	name: 'Items',
	component: Items,
	meta: {
		basePath: '/items',
		title: 'items',
		requiresAuth: true
	}
},
{
	path: '/items/add-item',
	name: 'AddItem',
	component: EditItem,
	meta: {
		basePath: '/items',
		title: 'items',
		requiresAuth: true
	}
},
{
	path: '/items/:id',
	name: 'EditItem',
	component: EditItem,
	meta: {
		basePath: '/items',
		title: 'items',
		requiresAuth: true
	}
},
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
	path: '/404',
	name: '404',
	component: Error404
},
{
	path: '*',
	redirect: '/404'
}
]