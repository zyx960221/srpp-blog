<script setup lang="ts">
import { ref, watch, computed, nextTick } from "vue";
import { RouterLink, useRoute } from "vue-router";

interface MenuItem {
  title: string;
  path?: string;
  children?: MenuItem[];
}

const props = defineProps<{
  items: MenuItem[];
  defaultOpen?: boolean;
}>();

const activeIndex = ref<number | null>(null);
const route = useRoute();
const isAnimating = ref(false);

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

watch(
  activePath,
  (newPath) => {
    const idx = findActiveIndex(props.items, newPath);
    if (idx !== null) {
      activeIndex.value = idx;
    } else if (props.defaultOpen && activeIndex.value === null) {
      activeIndex.value = 0;
    }
  },
  { immediate: true },
);

const toggleAccordion = async (index: number) => {
  // 防止动画期间的重复点击
  if (isAnimating.value) return;

  isAnimating.value = true;
  activeIndex.value = activeIndex.value === index ? null : index;

  // 等待动画完成
  await nextTick();
  setTimeout(() => {
    isAnimating.value = false;
  }, 200); // 与CSS动画时间保持一致
};

// 优化：使用计算属性来减少重复计算
const itemsWithState = computed(() => {
  return props.items.map((item, index) => ({
    ...item,
    isActive: activeIndex.value === index,
    hasChildren: Boolean(item.children && item.children.length > 0),
    isCurrentPage: item.path === route.path, // 判断是否为当前页面
  }));
});

// 动画钩子函数，优化动画性能
const onEnter = (el: Element) => {
  const element = el as HTMLElement;
  element.style.height = "0";
  element.offsetHeight; // 强制重排
  element.style.height = element.scrollHeight + "px";

  // 动画结束后移除内联样式，让CSS接管
  setTimeout(() => {
    element.style.height = "";
  }, 200);
};

const onLeave = (el: Element) => {
  const element = el as HTMLElement;
  element.style.height = element.scrollHeight + "px";
  element.offsetHeight; // 强制重排
  element.style.height = "0";
};
</script>

<template>
  <ul class="accordion-menu">
    <li
      v-for="(item, index) in itemsWithState"
      :key="item.title"
      class="accordion-item"
    >
      <div
        class="accordion-header"
        @click="toggleAccordion(index)"
        :class="{ 'is-animating': isAnimating }"
      >
        <div class="header-content">
          <span v-if="item.isCurrentPage" class="current-page-indicator"></span>
          <RouterLink v-if="item.path" :to="item.path" @click.stop>{{
            item.title
          }}</RouterLink>
          <span v-else>{{ item.title }}</span>
        </div>
        <span
          v-if="item.hasChildren"
          class="arrow"
          :class="{ active: item.isActive }"
        >
          ›
        </span>
      </div>
      <Transition
        name="accordion"
        @enter="onEnter"
        @leave="onLeave"
        @after-enter="(el: any) => (el.style.height = '')"
      >
        <div
          v-show="item.children && item.isActive"
          class="accordion-content-wrapper"
        >
          <ul class="accordion-content">
            <PCAccordionMenu :items="item.children ?? []" />
          </ul>
        </div>
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
  padding: 8px;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.header-content {
  display: flex;
  align-items: center;
  flex: 1;
}

.current-page-indicator {
  width: 8px;
  height: 8px;
  background-color: #444;
  margin-right: 8px;
  border-radius: 2px;
  flex-shrink: 0;
}

.accordion-header:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.accordion-header.is-animating {
  pointer-events: none;
}

.accordion-header a {
  color: #666;
  text-decoration: none;
  display: block;
  width: 100%;
  transition: color 0.15s ease;
}

.accordion-header a:hover {
  color: #333;
}

.accordion-header span {
  color: #666;
}

.accordion-header .arrow {
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform;
}

.accordion-header .arrow.active {
  transform: rotate(90deg);
}

.accordion-content-wrapper {
  overflow: visible;
  transition: height 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: height;
  height: auto !important; /* 确保高度不被限制 */
}

.accordion-content {
  list-style: none;
  margin: 0;
  padding-top: 4px;
  padding-bottom: 4px;
  max-height: none; /* 移除可能的高度限制 */
}

/* 优化的动画效果 */
.accordion-enter-active,
.accordion-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden; /* 仅在动画过程中隐藏溢出内容 */
}

.accordion-enter-from,
.accordion-leave-to {
  opacity: 0;
  max-height: 0;
}

.accordion-enter-to,
.accordion-leave-from {
  opacity: 1;
  max-height: 1000px; /* 设置一个足够大的值 */
}

/* 性能优化：减少重绘 */
.accordion-item {
  contain: layout style;
}

li {
  margin: 0 !important;
}
</style>
