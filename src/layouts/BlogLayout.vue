<script setup lang="ts">
import { RouterView } from "vue-router";
import menuData from "./menu";
import PCAccordionMenu from "../components/PCAccordionMenu.vue";
import MobileSlideMenu from "../components/MobileSlideMenu.vue";
import { ref, onMounted, onUnmounted } from "vue";
import BackToTop from "../components/BackToTop.vue";

const isMobile = ref(false);

const checkMobile = () => {
  isMobile.value = window.innerWidth < 768;
};

onMounted(() => {
  checkMobile();
  window.addEventListener('resize', checkMobile);
});

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile);
});

// 定义菜单项的类型
interface MenuItem {
  title: string;
  path?: string;
  children?: MenuItem[];
}
</script>

<template>
  <div class="blog-layout">
    <!-- 左侧导航 -->
    <aside class="sidebar-left">
      <nav class="nav-menu">
        <h3 v-if="!isMobile">本馆菜单</h3>
        <PCAccordionMenu v-if="!isMobile" :items="menuData.menu" />
        <MobileSlideMenu v-else :items="menuData.menu" />
      </nav>
    </aside>

    <!-- 中间内容区 -->
    <main class="main-content">
      <RouterView v-slot="{ Component }">
        <template v-if="Component">
          <Suspense>
            <component :is="Component" />
            <template #fallback>
              <div class="loading">加载中...</div>
            </template>
          </Suspense>
        </template>
      </RouterView>
    </main>
    <BackToTop />
  </div>
</template>

<style scoped>
.blog-layout {
  box-sizing: border-box;
  display: grid;
  grid-template-columns: 1fr;
  min-height: 100vh;
  padding: 16px;
  width: 100%;
}

@media (min-width: 768px) {
  .blog-layout {
    grid-template-columns: 200px 1fr;
    gap: 16px;
  }
}

.sidebar-left {
  box-sizing: border-box;
  padding: 16px;
}

.main-content {
  box-sizing: border-box;
  margin: 0 auto;
}

.nav-menu h3 {
  margin-bottom: 16px;
  font-size: 1.1rem;
  color: #000;
}

.menu-list {
  list-style: none;
  padding: 0;
}

.menu-item {
  margin: 8px 0;
}

.menu-item ul {
  list-style: none;
  padding-left: 20px;
  margin-top: 8px;
}

.menu-item a {
  color: #000;
  text-decoration: none;
  display: block;
  padding: 4px 0;
}

.menu-item a:hover {
  color: #000;
  text-decoration: underline;
}

.loading {
  text-align: center;
  padding: 16px;
  color: #000;
}
</style>
