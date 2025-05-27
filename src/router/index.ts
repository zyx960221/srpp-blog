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
  scrollBehavior(to, from, savedPosition) {
    // 如果有保存的位置（例如用户使用浏览器的前进/后退按钮），则使用它
    if (savedPosition) {
      return savedPosition;
    }
    
    // 如果导航到同一页面的不同部分，保持当前滚动位置
    if (to.path === from.path) {
      return { left: window.scrollX, top: window.scrollY };
    }
    
    // 否则，滚动到顶部（默认行为）
    return { top: 0 };
  },
});

export default router;
