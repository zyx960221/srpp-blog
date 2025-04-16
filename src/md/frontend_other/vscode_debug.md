# vscode 前端 vite 项目调试快速配置

相关文档地址：

[microsoft vscode 调试集成文档](https://learn.microsoft.com/zh-cn/microsoft-edge/visual-studio-code/microsoft-edge-devtools-extension/debugging-a-webpage)

[launch.json 字段配置](https://code.visualstudio.com/docs/debugtest/debugging-configuration)

[对 launch.json 了解再深入一点？](https://xie.infoq.cn/article/183b37b4d36785b3f18f7e5c1)

基础信息和原理就不谈了，入门可参考以上文档，这里主要分享一下如何快速配置 vite + vue3 项目的调试。

所有基于 vscode 分支的编辑器都可以配置 vscode 的调试功能。例如 windsurf，cursor，trae 等。

## 创建 launch.json 文件

首先在项目根目录下的 .vscode 文件夹下创建 launch.json 文件，内容如下：

```json
{
  "version": "0.2.0",
  "configurations": [
    // 配置项 01，此处配置的对象将在“运行和调试”侧边栏中的下拉框中展示
    {
      "name": "Launch Edge/Chrome", // 必填
      "type": "chrome", // 必填｜如果使用edge，需要在runtimeExecutable中提供应用路径，或使用edge的vscode插件
      "request": "launch",
      // 必填｜request为启动配置的请求类型，支持launch和attach，attach的作用是连接到已运行的节点，launch作用是启动一个新进程
      "url": "http://localhost:8090", // 启动访问地址
      "cwd": "${workspaceFolder}", // 当前工作目录，默认为当前工作空间
      "webRoot": "${workspaceFolder}", // 源码根目录，默认为当前工作目录
      "sourceMaps": true, // 是否开启源码映射，默认为false，建议打开
      "skipFiles": ["<node_internals>/**", "${webRoot}/node_modules/**/*.js"],
      // skipFiles：跳过的文件，默认为[]，建议添加node_modules和dist文件夹
      "port": 9222, // 监听变化的端口号，默认为9222
      "sourceMapPathOverrides": {
        "webpack:///./src/*": "${webRoot}/*",
        "webpack:///src/*": "${webRoot}/*",
        "/node_modules/.vite/*": "${webRoot}/node_modules/*"
      } // 源码映射路径重写，默认为{}，建议添加node_modules
    }
    {
      // ...其他调试配置项 02
    }
  ]
}
```

## 启动调试

使用 vscode 调试前端项目，需要先启动项目，再在 vscode 中打开调试，**注意打开调试时确保是一个不带任何浏览器插件的新窗口**，否则 vscode 无法监听浏览器变化进入断点，或出现断点错位的问题。

## 最后检查断点位置是否正常

因为项目中引入其他插件/依赖的原因会导致断点错位，表现的行为是打断点时始终打在其他的代码行上，所以称之为错位。要排查的话一般排查编译相关的配置，例如 vite 项目中可能使用到`vite-plugin-vue-setup-extend`这个插件，目前会导致断点错位，解决方式是不使用它或寻找替代插件，例如`vite-plugin-vue-setup-extend-plus`这个插件就能替换它。

## 调试替换 console 的习惯

在需要使用`console.log`的场景，只要开着调试模式，在相关语句的左侧点击并出现红色点即可，红色点亮起说明该行代码处在待调试的模式下。

空白点代表断点并没有生效，目前我总结有三种原因：一种是配置未生效需要检查 launch.json 文件；另一种是当前语句已经执行过了，需要重新刷新页面；还有一种是还在构建项目，需要等待构建完成。
