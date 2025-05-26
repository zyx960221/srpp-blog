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

const emits = defineEmits(["menu-change"]);

const handleEmit = (item: MenuItem) => {
  emits("menu-change", item);
};
</script>

<template>
  <ul class="menu-list">
    <li v-for="item in items" :key="item.title" class="menu-item">
      <RouterLink v-if="item.path" :to="item.path" @click="handleEmit(item)">{{ item.title }}</RouterLink>
      <span v-else @click.stop="() => {}">{{ item.title }}</span>
      <MenuItems v-if="item.children" :items="item.children" :defaultOpen="defaultOpen" @menu-change="$emit('menu-change', $event)" />
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
