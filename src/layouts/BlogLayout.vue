<script setup lang="ts">
import { RouterView } from "vue-router";
import menuData from "./menu";
import PCAccordionMenu from "../components/PCAccordionMenu.vue";
import MobileSlideMenu from "../components/MobileSlideMenu.vue";
import { ref, onMounted, onUnmounted } from "vue";
import BackToTop from "../components/BackToTop.vue";

const isMobile = ref<boolean>(false);

const checkMobile = () => {
  isMobile.value = window.innerWidth < 769;
};

onMounted(() => {
  checkMobile();
  window.addEventListener("resize", checkMobile);
});

onUnmounted(() => {
  window.removeEventListener("resize", checkMobile);
});
</script>

<template>
  <div class="blog-layout">
    <!-- 左侧导航 -->
    <aside class="sidebar-left">
      <nav class="nav-menu">
        <h2 v-if="!isMobile">松 软 澎 湃</h2>
        <PCAccordionMenu
          v-if="!isMobile"
          :items="menuData.menu"
          :defaultOpen="true"
        />
        <MobileSlideMenu v-else :items="menuData.menu" :defaultOpen="true" />
      </nav>
    </aside>

    <!-- 中间内容区 -->
    <main class="main-content" :style="{ paddingTop: isMobile ? '64px' : '0' }">
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
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding: 0 16px;
}

.sidebar-left {
  box-sizing: border-box;
}

.main-content {
  box-sizing: border-box;
  width: 100%;
}

.nav-menu h2 {
  box-sizing: border-box;
  padding: 20px;
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

@media (min-width: 769px) {
  .blog-layout {
    flex-direction: row;
  }

  .sidebar-left {
    position: sticky;
    top: 0;
    height: 100vh;
    overflow-y: auto;
    width: 200px;
    flex-shrink: 0;
    margin-right: 16px;
  }

  .main-content {
    box-sizing: border-box;
    flex: 1;
  }
}
</style>
