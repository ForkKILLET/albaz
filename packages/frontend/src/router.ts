import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router'

import HomeView from '@comp/views/HomeView.vue'
import PostView from '@comp/views/PostView.vue'
import NotFoundView from '@comp/views/NotFoundView.vue'

export const routes: RouteRecordRaw[] = [
  { path: '/', component: HomeView },
  { path: '/post', component: HomeView },
  { path: '/post/:folder(.*/)', component: HomeView },
  { path: '/post/:file(.+)', component: PostView },
  { path: '/:path(.*)*', component: NotFoundView },
]

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
})
