
import { store } from './store/store'

import Home from '@/views/Home.vue';

import Compendium from '@/views/Compendium/Overview.vue';
import Monsters from '@/views/Compendium/Monsters.vue';
import Spells from '@/views/Compendium/Spells.vue';
import Conditions from '@/views/Compendium/Conditions.vue';
import Items from '@/views/Compendium/Items.vue';

import Contribute from '@/views/Contribute';
import Spells_contrib from '@/views/Contribute/Spells.vue';

import Sitemap from '@/views/Sitemap.vue';
import Privacy from '@/views/Privacy.vue';
import AboutUs from '@/views/AboutUs.vue';
import Documentation from '@/views/Documentation.vue';
import Planned from '@/views/Planned.vue';
import Feedback from '@/views/Feedback.vue';
import Updates from '@/views/Updates.vue';
import SignIn from '@/views/SignIn.vue';
import SignUp from '@/views/SignUp.vue';
import Settings from '@/views/Settings.vue';
import ResetPassword from '@/views/ResetPassword.vue';
import Patreon from '@/views/Patreon.vue';
import ManageContent from '@/views/ManageContent.vue';

import Admin from '@/views/Admin/Overview.vue';
import Users from '@/views/Admin/Users.vue';
import Patrons from '@/views/Admin/Patrons.vue';

import Profile from '@/views/profile/Profile.vue';
import Username from '@/views/profile/SetUsername.vue';
import DeleteAccount from '@/views/profile/DeleteAccount.vue';
import Followed from '@/views/Followed.vue';
import Error404 from '@/views/Error404.vue';
import MyContent from '@/views/MyContent/Campaigns/Campaigns.vue';
import EditCampaign from '@/views/MyContent/Campaigns/EditCampaign.vue';
import Encounters from '@/views/MyContent/Campaigns/Encounters.vue';
import EditEncounter from '@/views/MyContent/Campaigns/EditEncounter.vue';
import Players from '@/views/MyContent/Players/Players.vue';
import EditPlayer from '@/views/MyContent/Players/EditPlayer.vue';
import Npcs from '@/views/MyContent/Npcs/Npcs.vue';
import EditNpc from '@/views/MyContent/Npcs/EditNpc.vue';
import RunEncounter from '@/views/MyContent/RunEncounter.vue';
import User from '@/views/User.vue';

// This is where you add all your site routes
// Each route is set as an obect in the array
// For a the most basic route just set
// the path & component to load

export const routes = [{
	path: '',
	name: 'home',
	component: Home
},

//COMPENDIUM
{
	path: '/compendium',
	name: 'Compendium',
	component: Compendium
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
	path: '/compendium/monsters/:id',
	name: 'Monster',
	component: Monsters,
	props: (route) => ({
		id: route.query.id
	}),
	meta: {
		basePath: '/compendium',
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
	path: '/compendium/spells/:id',
	name: 'Spell',
	component: Spells,
	props: (route) => ({
		id: route.query.id
	}),
	meta: {
		basePath: '/compendium',
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
	path: '/compendium/conditions/:id',
	name: 'Condition',
	component: Conditions,
	props: (route) => ({
		id: route.query.id
	}),
	meta: {
		basePath: '/compendium',
		baseName: 'Conditions',
	}
},
{
	path: '/compendium/items',
	name: 'Items',
	component: Items,
	meta: {
		baseName: 'items',
	}
},
{
	path: '/compendium/items/:id',
	name: 'Item',
	component: Items,
	props: (route) => ({
		id: route.query.id
	}),
	meta: {
		basePath: '/compendium',
		baseName: 'items',
	}
},

// CONTRUBUTE
{
	path: '/contribute',
	name: 'Contribute',
	component: Contribute
},
{
	path: '/contribute/spells',
	name: 'Contribute Spells',
	component: Spells_contrib,
	meta: {
		baseName: 'Spells',
	}
},
{
	path: '/contribute/spells/:id',
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
	component: SignIn
},
{
	path: '/sign-up',
	name: 'signUp',
	component: SignUp
},
{
	path: '/forgot-password',
	name: 'resetPassword',
	component: ResetPassword
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
	path: '/character/:id',
	name: 'Edit Character',
	component: EditPlayer,
	meta: {
		basePath: '/players',
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
		requiresAuth: true
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