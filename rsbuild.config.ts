import { defineConfig } from "@rsbuild/core";
import { pluginVue } from "@rsbuild/plugin-vue";
import MarkdownIt from "markdown-it";
import anchor from "markdown-it-anchor";
import toc from "markdown-it-toc-done-right";
import prism from "markdown-it-prism"; // https://www.npmjs.com/package/markdown-it-prism

// 创建 markdown-it 实例并配置插件
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: true,
})
  .use(anchor, {
    permalink: true,
    permalinkBefore: true,
    permalinkSymbol: "#",
  })
  .use(toc, {
    level: [1, 2, 3],
    listType: "ul",
  })
  .use(prism, {
    highlightInlineCode: true,
    plugins: ["line-numbers", "show-language"],
    languages: ["all"],
  });

export default defineConfig({
  plugins: [pluginVue()],
  source: {
    // 添加 .md 扩展名支持
    include: ["**/*.[jt]s", "**/*.[jt]sx", "**/*.vue", "**/*.md"],
  },
  tools: {
    bundlerChain: (chain) => {
      chain.module
        .rule("md")
        .test(/\.md$/)
        .type("javascript/auto")
        .use("html-loader")
        .loader("html-loader")
        .end()
        .use("markdown-loader")
        .loader("markdown-loader")
        .options({
          markdownIt: md,
          removeMarkdown: false,
          escapeHtml: false,
        });
    },
  },
});
