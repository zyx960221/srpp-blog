<script setup lang="ts">
import { RouterView } from "vue-router";
import menuData from "./menu";
import MenuItems from "../components/MenuItems.vue";

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
        <h3>本馆菜单</h3>
        <MenuItems :items="menuData.menu" />
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

    <!-- 右侧区域 -->
    <aside class="sidebar-right">
      <!-- 预留右侧区域 -->
    </aside>
  </div>
</template>

<style scoped>
.blog-layout {
  display: grid;
  grid-template-columns: 1fr;
  min-height: 100vh;
  padding: 16px;
}

@media (min-width: 768px) {
  .blog-layout {
    grid-template-columns: 200px 1fr;
    gap: 16px;
  }
}

.sidebar-left {
  padding: 16px;
}

.main-content {
  box-sizing: border-box;
  padding: 16px;
}

.sidebar-right {
  display: none;
}

@media (min-width: 1024px) {
  .sidebar-right {
    display: block;
    padding: 16px;
  }
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

.menu-item span {
  color: #000;
  font-weight: 500;
  display: block;
  padding: 4px 0;
}

.loading {
  text-align: center;
  padding: 16px;
  color: #000;
}
</style>
