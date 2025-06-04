import axios from 'axios';
import { createRouter, createWebHistory } from 'vue-router';
import store from '@/store';
import Login from './components/login.vue';
import Register from './components/register.vue';
import Personal from './components/personal.vue';
import Groupview from './components/groupview.vue';
import View from './components/view.vue';
import Group from './components/group.vue';
import Profile from './components/profile.vue';
import About from './components/about.vue';
import GC from './components/GC.vue';

//PUBLIC PAGE
const routes = [
  { path: '/', redirect: '/login' },
  { 
    path: '/login', 
    name: 'Login', 
    component: Login,
    meta: { requiresAuth: false } 
  },
  { 
    path: '/register', 
    name: 'Register', 
    component: Register,
    meta: { requiresAuth: false }
  },
  { 
    path: '/about',
    name: 'About',
    component: About,
    meta: { requiresAuth: false }
  },

  // PROTECTED ROUTES
  { path: '/personal', name: 'Personal', component: Personal, meta: { requiresAuth: true } },
  { path: '/groupview', name: 'Groupview', component: Groupview, meta: { requiresAuth: true } },
  { path: '/view', name: 'View', component: View, meta: { requiresAuth: true } },
  { path: '/profile', name: 'Profile', component: Profile, meta: { requiresAuth: true } },
  {
    path: '/accept-invite',
    name: 'AcceptInvite',
    component: () => import('./components/AcceptInvite.vue'),
    props: route => ({ token: route.query.token })
  },
 //GROUP EXPENSES
 {
  path: '/GC',
  name: 'GC',
  component: GC,
  meta: { requiresAuth: true },
  beforeEnter: async (to, from, next) => {
    try {
      const token = localStorage.getItem('jsontoken');
      const user = JSON.parse(localStorage.getItem('user'));
      
      if (!token || !user) {
        next('/login');
        return;
      }
      
      // Skip auto-redirect if explicitly coming from group page
      if (to.query.fromGroup === 'true') {
        next();
        return;
      }
      
      // Try to fetch groups
      try {
        const response = await axios.get('/api/grp_expenses/my-groups', {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 5000
        });
        
        if (response.data?.success && response.data.data?.length === 1 && from.name !== 'Group') {
          next({ name: 'Group', params: { groupId: response.data.data[0].id } });
          return;
        }
      } catch (err) {
        console.warn('Failed to fetch groups in route guard, continuing anyway', err);
        // Continue to GC page even if fetch fails
      }
      
      next();
    } catch (err) {
      console.error('Route guard error:', err);
      next('/login'); // Fallback to login on critical errors
    }
  }
},
{
  path: '/group/:groupId',
  name: 'Group',
  component: Group,
  props: true,
  meta: { requiresAuth: true },
  beforeEnter: async (to, from, next) => {
    try {
      // Reset group module state
      if (store && store.state.group) {
        store.commit('group/RESET_STATE');
      }
      
      // Verify group access
      const token = localStorage.getItem('jsontoken');
      const user = JSON.parse(localStorage.getItem('user'));
      
      if (!token || !user) {
        next('/login');
        return;
      }

      // Check if there's a pending request
      const pendingGroupId = localStorage.getItem('pendingGroupId');
      if (pendingGroupId === to.params.groupId) {
        next({
          name: 'GC',
          query: { fromGroup: 'true' }
        });
        return;
      }
      
      // Additional group access verification can go here
      next();
    } catch (err) {
      console.error('Group route error:', err);
      next('/GC');  // Fallback to groups list
    }
  }
},
{ 
  path: '/:pathMatch(.*)*', 
  redirect: to => {
    const token = localStorage.getItem('jsontoken');
    return token ? { name: 'GC' } : { name: 'Login' };
  }
}
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach(async (to, from, next) => {
  const token = localStorage.getItem('jsontoken');
  const user = JSON.parse(localStorage.getItem('user'));

  // Route requires authentication but no token
  if (!to.meta.requiresAuth) {
    next();
    return;
  }

  if (!token) {
    next({
      name: 'Login',
      query: { redirect: to.fullPath }
    });
    return;
  }

  // Route requires authentication and has token but user data is missing
  if (!user) {
    console.warn('Token exists but user data missing');
    try {
      const response = await axios.get('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      localStorage.setItem('user', JSON.stringify(response.data.user));
      next();
    } catch (err) {
      localStorage.removeItem('jsontoken');
      next({
        name: 'Login',
        query: { redirect: to.fullPath }
      });
    }
    return;
  }

  // Special case for group creation flow
  if (from.name === 'GC' && to.name === 'Group') {
    if (!to.params.groupId) {
      next({ name: 'GC' });
      return;
    }
  }

  next();
});

export default router;