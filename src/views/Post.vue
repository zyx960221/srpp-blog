<script setup lang="ts">
import { ref, watchEffect, onMounted, nextTick } from "vue";
import { useRoute } from "vue-router";
import "prismjs/themes/prism.css";
import Prism from "prismjs";
// import "prismjs/components/prism-javascript";
// import "prismjs/components/prism-typescript";
// import "prismjs/components/prism-python";
// import "prismjs/components/prism-java";
// import "prismjs/components/prism-bash";
// import "prismjs/components/prism-json";
// import "prismjs/components/prism-markdown";
// import "prismjs/components/prism-css";


const route = useRoute();
const postContent = ref<string>("加载中...");
const error = ref<string | null>(null);

// 使用 watchEffect 监听路由参数变化
// onMounted(() => {
//   nextTick(() => {
//     Prism.highlightAll();
//   });
// });

watchEffect(async () => {
  if (!route.params.pathMatch) {
    error.value = "未找到文章ID";
    return;
  }

  try {
    // 这里可以根据 route.params.id 来加载对应的 markdown 文件
    // 示例：动态导入 markdown 文件
    const pathMatch: string[] = (route.params.pathMatch as string[]) ?? []
    const md = await import(`../md/${pathMatch.join('/')}.md`);
    nextTick(() => {
      Prism.highlightAll();
    });
    postContent.value = md.default;
  } catch (err) {
    console.error("Failed to load post:", err);
    error.value = "文章加载失败";
    postContent.value = "";
  }
});
</script>

<template>
  <div class="post">
    <div v-if="error" class="error">{{ error }}</div>
    <div v-else class="markdown-content" v-html="postContent"></div>
  </div>
</template>

<style scoped>
.post {
  max-width: 100%;
  margin: 0 auto;
}

.error {
  color: #ff4444;
  padding: 20px;
  text-align: center;
}

.markdown-content {
  line-height: 1.6;
}

.markdown-content :deep(h1) {
  font-size: 2em;
  margin-bottom: 1em;
  color: #2c3e50;
}

.markdown-content :deep(h2) {
  font-size: 1.5em;
  margin: 1em 0;
  color: #2c3e50;
}

.markdown-content :deep(p) {
  margin: 1em 0;
  color: #333;
}

.markdown-content :deep(code) {
  background-color: #f5f5f5;
  padding: 2px 4px;
  border-radius: 4px;
}

.markdown-content :deep(pre) {
  background-color: #f5f5f5;
  padding: 16px;
  border-radius: 4px;
  overflow-x: auto;
  margin: 1em 0;
}
</style>
