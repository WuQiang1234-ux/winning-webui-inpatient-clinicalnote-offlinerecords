import Vue from 'vue'
import VueRouter from 'vue-router'
import patientOverview from '../views/patientOverview'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/patientOverview',

  },
  {
    path: '/patientOverview',
    name: 'patientOverview',
    component: patientOverview,
    children: []
  }
  // {
  //   path: '/about',
  //   name: 'About',
  //   // route level code-splitting
  //   // this generates a separate chunk (about.[hash].js) for this route
  //   // which is lazy-loaded when the route is visited.
  //   component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  // }
]

const router = new VueRouter({
  routes
})

export default router
