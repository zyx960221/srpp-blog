<script setup lang="ts">
import { ref, watchEffect, onUpdated, onMounted } from "vue";
import { useRoute } from "vue-router";
import "prismjs/themes/prism-twilight.css";
import Prism from "prismjs";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-python";
import "prismjs/components/prism-java";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-json";
import "prismjs/components/prism-markdown";
import "prismjs/components/prism-css";

const route = useRoute();
const postContent = ref<string>("加载中...");
const error = ref<string | null>(null);
const fileMeta = ref<{createdAt?: string; updatedAt?: string}>({});

onUpdated(() => {
  Prism.highlightAll();
});
onMounted(() => {
  Prism.highlightAll();
});

watchEffect(async () => {
  if (!route.params.pathMatch) {
    error.value = "未找到文章ID";
    return;
  }

  try {
    // 这里可以根据 route.params.id 来加载对应的 markdown 文件
    // 示例：动态导入 markdown 文件
    const pathMatch: string[] = (route.params.pathMatch as string[]) ?? [];
    const md = await import(`../md/${pathMatch.join("/")}.md`);
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
  font-family: "MapleMonoNL-Medium", Courier, monospace;
  width: 100%;
  max-width: 100%;
  padding: 0 16px;
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

.markdown-content :deep(pre) {
  padding: 16px;
  border-radius: 4px;
  margin: 1em 0;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.file-meta {
  margin-top: 2em;
  padding: 1em 0;
  border-top: 1px solid #eee;
  color: #666;
  font-size: 0.9em;
}

.file-meta span {
  display: block;
  margin: 0.5em 0;
}

.markdown-content :deep(code) {
  padding: 2px 4px;
  border-radius: 4px;
  white-space: pre-wrap;
  font-family: 'MapleMonoNL-Regular' !important;
  overflow-x: auto;
}
</style>
