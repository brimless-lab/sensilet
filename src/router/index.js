import { createRouter, createWebHistory } from 'vue-router'


const routes = [
  {
    path: '/popup.html',
    name: 'CreateWallet',
    component: () => import('../views/CreateWallet.vue')
  },
  {
    path: '/unlock',
    name: 'Unlock',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/Unlock.vue')
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});

export default router

