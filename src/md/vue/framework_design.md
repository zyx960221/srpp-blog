# 框架设计

## 目的

该系列开篇算是《Vue 的设计与实现》读书笔记，我本次阅读的目的有两个，一方面是通过阅读佳作理解 vue 的架构原理，另一方面是尝试站在作者视角整理阅读源码的一套方法论。

## 途径

按照作者的思路去探究，为什么某一个技术点是以 A 路径而不是以 B 路径实现？
以此能得到两种经验，第一种是框架设计中如何权衡，这涉及到读源码怎么读最有深刻印象的方法论；第二种是帮助自己更加 vue 的实现逻辑。

## 前言

该篇描述了 vue3 在设计中体现的权衡以及产品层面的用户思想，以及它作为框架是如何践行这些原则的。

---

## 权衡

### 命令式和声明式的差异

**结论：声明式代码的性能不优于命令式代码的性能**

命令式的性能消耗 = `A`<br/>
声明式的性能消耗 = `A` + `B`

命令式直接使用 api 进行修改，但无法体现结果，它更符合逻辑流程，重视达到效果的过程，这一部分的性能消耗称之为`A`。而声明式关注结果，这意味着要封装作为原始方式的命令式，并从结果倒推将过程弥补，中间处理的过程即为上述公式中的`B`。

既然如此，为什么还要设计一个基于声明式的前端框架，是因为它在设计之初做出假设：“开发者希望出一款维护性更好的框架”，vue 的声明式代码展示的便是结果，所以这个框架既要在结果上设计得足够直观可维护，又要在性能上尽可能的逼近命令式代码的性能。

### 虚拟 DOM 的性能：由命令式和声明式来看

作者在这里分了几个维度：用户理解难易（心智负担）、可维护性、性能

### 运行时+编译时

运行时：不需要编译直接运行的框架，比如说用户只需要写 `render函数`让渲染器进行渲染的框架<br/>
编译时：一旦这个框架需要通过被编译成 `render函数`或`对象`再被渲染，那么编译静态的内容，则为编译时。如果我设计了一个框架，不需要运行时，则只能通过纯编译的方式才能运行。

---

## 架构设计核心要素

### 提升用户（开发者）体验

vue 通过使用`__DEV__`判断警告部分是否构建

`initCustomFormatter`用来格式化打印信息

### Tree-Shaking（构建的奥卡姆剃刀）

vue 使用`rollup.js`来实现这一点。想做 Tree-Shaking，模块必须是 ESM，因为 Tree-Shaking 依赖于 ES6 模块的静态结构。正因为 Javascript 是一个动态语言，所以在静态分析 dead code 时，运行时的副作用很难解析。
这时开发者作为了解代码执行逻辑的角色，可以明确指定`/*#__PURE__*/`这样的注释，来告诉编译器，该函数或方法不会产生任何副作用，可以进行 Tree-Shaking。

### 输出什么

从需求来看：从 script 标签引入或通过 npm 等依赖管理工具引入

1. 用立即执行函数（IIFE：Immediately Invoked Function Expression）生成实例，挂载在全局变量上，然后通过 script 标签引入。
2. 在现代浏览器中引入 ESM 模块，`-bundler.js`的 ESM 资源是给 rollup 或 webpack 用的，`-browser.js`的 ESM 资源是给`<script type="module">`用的。其中`-bundler.js`是提供给打包工具的，那么它需要支持的是用户自定配置代码的环境，而`-browser.js`是提供给浏览器的，那么它需要支持的是浏览器环境，需要更高效简洁。

使用了`-browser.js`的：

```javascript
if (__DEV__) {
  /** some code **/
}
```

使用了`-bundler.js`的：

```javascript
if (process.env.NODE_ENV !== "production") {
  /** some code **/
}
```

3. 服务端渲染：支持在 node 环境下使用 require 语句导入 CommonJS 资源，在`rollup.js`中修改`rollup.config.js`配置`format: cjs`实现。

### 特性开关（预定义常量）

作用：减少打包体积、支持遗留的 API
使用：通过`rollup.js`进行配置

### 错误处理

这一段看的有点懵，其实当下工作中除了网络请求外，其他地方没用到多少 try catch，所以使用场景没怎么看懂。
我的理解是，当你要提供工具时，最好对工具中使用的回调函数做统一处理。比如说网络请求的统一错误处理，或者频繁文件读取的错误处理。
好处是错误被集中管理了，并且用它的人也可以手动指定额外的错误处理方式。

### typescript 支持

> “使用 TS 编写框架和框架对 TS 类型支持友好是两件完全不同的事”

提供类型支持需要花费很大的精力

---

## Vue3 设计思路

h 函数辅助创建虚拟 DOM，虚拟 DOM 是用 Javascript 对象来描述 DOM 结构的方式。

DOM 通过`渲染器`被转化为真实 DOM。
编写一个简易的`渲染器`：

```Javascript
// 有如下虚拟DOM
const vnode = {
  tag: 'div', // 描述标签
  props: { // 描述标签的属性 & 事件
    onClick: () => {
      alert('我被点开了')
    }
  },
  children: '点点我' // 子节点
}
```

```Javascript
// 如下为简易的渲染器
function renderer (vnode, container) {
  // 传入两个参数：vnode 和 container，其中container是一个挂载点，目标是真实DOM
  // 使用vnode.tag作为标签创建一个真实DOM
  const el = document.createElement(vnode.tag)
  // 遍历vnode.props，将属性添加到el上
  for (const key in vnode.props) {
    if (/^on/.test(key)) {
      // 监听事件
      el.addEventListener(key.slice(2).toLowerCase(), vnode.props[key])
    }

    if (typeof vnode.children === 'string') {
      // 若children是字符串，则将字符串作为文本节点添加到el上
      el.appendChild(document.createTextNode(vnode.children))
    } else if (Array.isArray(vnode.children)) {
      // 递归调用，并且用当前的dom作为container
      vnode.children.forEach(child => renderer(child, el))
    }

    // 将el挂载到container中
    container.appendChild(el)
  }
}
```

以上是使用虚拟 DOM 创建节点的过程，之后再研究更新节点。

### 组件的本质

**结论：组件是一组 DOM 元素的封装。**

组件可以是一个返回 dom 结构的渲染函数，作为 tag 放在 vnode 对象中，也可以是一个对象，包含 props 和 render 函数。

其中，Vue3 的有状态组件是使用对象来表达的，而无状态则是以函数表达。

最终组件依赖于`渲染器`进行转化为真实 DOM

### 模板（.vue）

vue 是一个声明式的框架，所以它注重结果表达，那么在写.vue 文件后，vue 将使用`编译器`将模板编译成渲染函数，然后挂载到组件上。

### 有机整体

站在框架设计的角度，将各个模块结合在一起看，才能懂为什么这么设计的原理。

> 这里作者举了一个例子：`编译器`和`渲染器`，`渲染器`的确是负责创建真实 DOM 并处理数据更新的，这意味着它需要从虚拟 DOM 中进行对比才能知道是否需要更新。那么从`编译器`的角度是否可以做到分析动态内容，在编译阶段就确定某些节点可能为动态，还是永久静态。
>
> `patchFlags: 1 // 使用枚举区分节点类型`

**`渲染器`和`编译器`的中间信息媒介是虚拟 DOM 对象。**

---

## 小结

1. 理解框架(产品)的核心目标，如性能、可维护性和开发者体验；
2. 分析框架的架构设计，如虚拟 DOM、渲染器和编译器的交互；
3. 关注框架的优化策略，如 Tree-Shaking 和特性开关，这本质上也是框架的核心目标之一；
4. 理解框架的错误处理和类型支持机制。通过这些角度，可以更系统地理解源码的设计和实现。
