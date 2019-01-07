import Home from '@/views/Home.vue';
import Privacy from '@/views/Privacy.vue';
import SignIn from '@/views/SignIn.vue';
import SignUp from '@/views/SignUp.vue';
import Profile from '@/views/Profile.vue';
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
import TrackEncounter from '@/views/TrackEncounter.vue';

// This is where you add all your site routes
// Each route is set as an obect in the array
// For a the most basic route just set
// the path & component to load

export const routes = [{
	path: '',
	name: 'home',
	component: Home
},
{
	path: '/privacy-policy',
	name: 'Privacy Policy',
	component: Privacy
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
	path: '/profile',
	name: 'profile',
	component: Profile
},
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
	}
},
{
	path: '/encounters/:campid/:encid',
	name: 'Encounters',
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
	}
},
{
	path: '/track-encounter/:userid',
	name: 'Track Encounter',
	component: TrackEncounter,
	meta: {
		basePath: '/track-encounter',
		title: 'Track Encounter',
	}
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