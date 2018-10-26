import Home from '@/views/Home.vue';
import SignIn from '@/views/SignIn.vue';
import SignUp from '@/views/SignUp.vue';
import Error404 from '@/views/Error404.vue';
import MyContent from '@/views/MyContent/Campaigns/Campaigns.vue';
import EditCampaign from '@/views/MyContent/Campaigns/EditCampaign.vue';
import Encounters from '@/views/MyContent/Campaigns/Encounters.vue';
import Players from '@/views/MyContent/Players.vue';
import RunEncounter from '@/views/MyContent/RunEncounter.vue';

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
    path: '/my-content',
    name: 'myContent',
    component: MyContent,
    props: (route) => ({
      id: route.query.id
    }),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/my-content/edit-campaign/:id',
    name: 'EditCampaign',
    component: EditCampaign,
    props: (route) => ({
      id: route.query.id
    }),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/my-content/players',
    name: 'Players',
    component: Players,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/my-content/encounters/:id',
    name: 'Encounters',
    component: Encounters,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/my-content/run-encounter/:id/:id',
    name: 'RunEncounter',
    component: RunEncounter,
    meta: {
      requiresAuth: true
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