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
import mermaid from "mermaid";

const route = useRoute();
const postContent = ref<string>("加载中...");
const error = ref<string | null>(null);
const fileMeta = ref<{createdAt?: string; updatedAt?: string}>({});

onUpdated(() => {
  Prism.highlightAll();
});
onMounted(() => {
  Prism.highlightAll();
  renderMermaid();
});
onUpdated(() => {
  Prism.highlightAll();
  renderMermaid();
});

function renderMermaid() {
  // 查找所有 mermaid 代码块
  const blocks = document.querySelectorAll("code.language-mermaid");
  blocks.forEach((block, idx) => {
    const parent = block.parentElement;
    if (!parent) return;
    // 防止重复渲染
    if (parent.classList.contains("mermaid-rendered")) return;
    const code = block.textContent || "";
    const mermaidDiv = document.createElement("div");
    mermaidDiv.className = "mermaid";
    mermaidDiv.id = `mermaid-${idx}-${Date.now()}`;
    mermaidDiv.textContent = code;
    parent.replaceWith(mermaidDiv);
    mermaid.init(undefined, mermaidDiv);
    mermaidDiv.classList.add("mermaid-rendered");
  });
}

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
  position: relative;
  box-sizing: border-box;
  width: 100%;
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
  max-width: 800px;
  margin: 0 auto;
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

.markdown-content :deep(pre) {
  position: relative;
  box-sizing: border-box;
  border-radius: 4px;
  margin: 1em 0;
  overflow-x: auto;
  white-space: pre;
  word-break: normal;
}

.markdown-content :deep(pre>code) {
  font-family: 'MapleMonoNL-Regular' !important;
  overflow-x: auto;
  white-space: pre;
  display: block;
}

.markdown-content :deep(p > code),
.markdown-content :deep(li > code),
.markdown-content :deep(td > code),
.markdown-content :deep(span > code) {
  margin: 0 0.2em;
  background: #fff3b0;
  color: #333;
  padding: 0.10em 0.4em;
  border-radius: 4px;
  font-size: 0.95em;
  line-height: 1.5;
  font-family: 'MapleMonoNL-Regular', 'Fira Mono', 'Consolas', monospace;
  word-break: break-all;
}
</style>
