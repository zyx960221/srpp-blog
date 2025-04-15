import { createRouter, createWebHistory } from "vue-router";
import type { RouteRecordRaw } from "vue-router";
import BlogLayout from "../layouts/BlogLayout.vue";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    component: BlogLayout,
    children: [
      {
        path: "",
        name: "home",
        component: () => import("../views/Home.vue"),
      },
      {
        path: "/posts/:pathMatch(.*)*",
        name: "post",
        component: () => import("../views/Post.vue"),
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
