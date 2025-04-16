<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { RouterLink, useRoute } from "vue-router";

interface MenuItem {
  title: string;
  path?: string;
  children?: MenuItem[];
}

const props = defineProps<{
  items: MenuItem[];
}>();

const activeIndex = ref<number | null>(null);
const route = useRoute();

const findActiveIndex = (items: MenuItem[], path: string): number | null => {
  for (let i = 0; i < items.length; i++) {
    if (items[i].path === path) return i;
    if (items[i].children) {
      const childIndex = findActiveIndex(items[i].children!, path);
      if (childIndex !== null) return i;
    }
  }
  return null;
};

const activePath = computed(() => route.path);

watch(activePath, (newPath) => {
  activeIndex.value = findActiveIndex(props.items, newPath);
}, { immediate: true });

const toggleAccordion = (index: number) => {
  activeIndex.value = activeIndex.value === index ? null : index;
};
</script>

<template>
  <ul class="accordion-menu">
    <li
      v-for="(item, index) in items"
      :key="item.title"
      class="accordion-item"
    >
      <div class="accordion-header" @click="toggleAccordion(index)">
        <RouterLink v-if="item.path" :to="item.path">{{ item.title }}</RouterLink>
        <span v-else>{{ item.title }}</span>
        <span v-if="item.children" class="arrow" :class="{ active: activeIndex === index }">›</span>
      </div>
      <Transition name="accordion">
        <ul v-show="item.children && activeIndex === index" class="accordion-content">
          <PCAccordionMenu :items="item.children ?? []" />
        </ul>
      </Transition>
    </li>
  </ul>
</template>

<style scoped>
.accordion-menu {
  list-style: none;
  padding: 0;
  user-select: none;
}

.accordion-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  cursor: pointer;
}

.accordion-header a {
  color: #666;
  text-decoration: none;
  display: block;
  width: 100%;
}

.accordion-header span {
  color: #666;
}

.accordion-header .arrow {
  transition: transform 0.2s ease;
}

.accordion-header .arrow.active {
  transform: rotate(90deg);
}

.accordion-content {
  padding-left: 20px;
  list-style: none;
}

.accordion-enter-active,
.accordion-leave-active {
  transition: opacity 0.2s ease, max-height 0.2s ease;
  will-change: opacity, max-height;
}

.accordion-enter-from,
.accordion-leave-to {
  max-height: 0;
  opacity: 0;
}

.accordion-enter-to,
.accordion-leave-from {
  max-height: 500px;
  opacity: 1;
}
</style>