<script setup lang="ts">
import { RouterLink } from "vue-router";

interface MenuItem {
  title: string;
  path?: string;
  children?: MenuItem[];
}

defineProps<{
  items: MenuItem[];
  defaultOpen?: boolean;
}>();
</script>

<template>
  <ul class="menu-list">
    <li v-for="item in items" :key="item.title" class="menu-item">
      <RouterLink v-if="item.path" :to="item.path">{{ item.title }}</RouterLink>
      <span v-else>{{ item.title }}</span>
      <MenuItems v-if="item.children" :items="item.children" :defaultOpen="defaultOpen" />
    </li>
  </ul>
</template>

<style scoped>
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
  color: #666;
  text-decoration: none;
  display: block;
  padding: 4px 0;
}

.menu-item a:hover {
  color: #42b883;
}

.menu-item span {
  color: #666;
  display: block;
  padding: 4px 0;
}
</style>
