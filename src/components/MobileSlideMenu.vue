<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { RouterLink } from 'vue-router';
import MenuItems from './MenuItems.vue';

interface MenuItem {
  title: string;
  path?: string;
  children?: MenuItem[];
}

const props = defineProps<{
  items: MenuItem[];
}>();

// 控制菜单是否展开
const isMenuOpen = ref(false);

// 控制导航栏是否显示
const isNavVisible = ref(true);

// 滚动位置百分比
const scrollPercentage = ref(0);

// 计算滚动位置百分比
const calculateScrollPercentage = () => {
  const scrollTop = window.scrollY;
  const windowHeight = window.innerHeight;
  const documentHeight = document.documentElement.scrollHeight;
  
  if (documentHeight <= windowHeight) {
    scrollPercentage.value = 100;
  } else {
    const maxScroll = documentHeight - windowHeight;
    scrollPercentage.value = Math.round((scrollTop / maxScroll) * 100);
  }
};

// 记录上一次滚动位置
let lastScrollTop = 0;

// 监听滚动事件
const handleScroll = () => {
  calculateScrollPercentage();
  if (isMenuOpen.value) return; // 菜单展开时不监听滚动
  
  const currentScrollTop = window.scrollY;
  
  // 向下滚动时隐藏导航栏，向上滚动时显示
  if (currentScrollTop > lastScrollTop) {
    isNavVisible.value = false;
  } else {
    isNavVisible.value = true;
  }
  
  lastScrollTop = currentScrollTop;
};

// 切换菜单展开状态
const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
  
  // 动态设置菜单高度
  if (isMenuOpen.value) {
    const slideMenu = document.querySelector('.slide-menu') as HTMLElement;
    if (slideMenu) {
      slideMenu.style.height = `${window.innerHeight}px`;
      document.body.style.overflow = 'hidden';
    }
  }
};

// 关闭菜单
const closeMenu = () => {
  isMenuOpen.value = false;
  document.body.style.overflow = '';
};

// 组件挂载时添加滚动监听
onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true });
});

// 组件卸载时移除滚动监听
onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
  document.body.style.overflow = ''; // 确保移除页面滚动限制
});
</script>

<template>
  <!-- 顶部导航栏 -->
  <div class="mobile-nav" :class="{ 'nav-visible': isNavVisible, 'menu-open': isMenuOpen }">
    <div class="nav-header">
      <div class="nav-title">{{ scrollPercentage }}%</div>
      <button class="menu-toggle" @click="toggleMenu">
        <span class="menu-icon"></span>
      </button>
    </div>

    <!-- 展开的菜单 -->
    <div class="slide-menu" :class="{ 'menu-open': isMenuOpen }">
      <div class="menu-content">
        <MenuItems :items="items" />
      </div>
      <button class="close-button" @click="closeMenu" aria-label="关闭菜单">
        <span class="close-icon">×</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.mobile-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  width: auto;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  transition: transform 0.3s ease;
  font-family: 'MapleMonoNL-Thin';
}

.nav-visible {
  transform: translateY(0);
}

.mobile-nav:not(.nav-visible):not(.menu-open) {
  transform: translateY(-100%);
}

.nav-header {
    box-sizing: border-box;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 20px;
    height: 40px;
}

.nav-title {
  font-size: 30px;
}

.menu-toggle {
  background: none;
  border: none;
  cursor: pointer;
  width: 30px;
  height: 30px;
  position: relative;
  padding: 0;
}

.menu-icon {
  display: block;
  width: 20px;
  height: 2px;
  background-color: #333;
  position: relative;
}

.menu-icon::before,
.menu-icon::after {
  content: '';
  position: absolute;
  width: 20px;
  height: 2px;
  background-color: #333;
  transition: transform 0.3s ease;
}

.menu-icon::before {
  top: -6px;
}

.menu-icon::after {
  bottom: -6px;
}

/* 菜单打开时的图标样式 */
.menu-open .menu-icon {
  background-color: transparent;
}

.menu-open .menu-icon::before {
  transform: rotate(45deg) translate(4px, 4px);
}

.menu-open .menu-icon::after {
  transform: rotate(-45deg) translate(4px, -4px);
}

.slide-menu {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;

  background-color: rgba(220, 220, 220, 0.8);
  backdrop-filter: blur(10px);
  z-index: 999;
  transform: translateY(-100%);
  opacity: 0;
  visibility: hidden;
  transition: transform 0.3s ease, opacity 0.3s ease, visibility 0.3s ease;
  overflow-y: auto;
  font-size: 30px;
}

.menu-open {
  transform: translateY(0);
  opacity: 1;
  visibility: visible;
}

.menu-content {
  padding: 80px 20px 20px;
}

.close-button {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #333;
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 1001;
}

.close-icon {
  font-size: 24px;
  line-height: 1;
}
</style>