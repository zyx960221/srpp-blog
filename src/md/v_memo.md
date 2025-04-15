# 使用`v-memo`报错：`Uncaught (in promise) TypeError: Cannot read properties of undefined (reading 'memo')`

文档地址：[v-memo](https://cn.vuejs.org/api/built-in-directives#v-memo)

首先，这个错误是一个 Javascript 运行时错误，它表示用户正试图访问一个为定义（undifined）对象的属性。这通常是一个不存在的变量或对象的属性。

此时我正在封装`el-table`的表格组件，这个表格组件允许动态配置表头和行内容。因为动态表头需要用`v-for`循环渲染表头，所以需要使用`v-memo`指令来缓存表头，避免重复渲染。

但当我使用了`v-memo`指令时，出现了这个错误。表头代码如下：

```html
<!-- 动态表头部分 -->
<el-table-column
  v-for="column in props.columns"
  :key="column.prop || column.columnName"
  v-memo="[column]"
  :label="column.label"
  :prop="column.property || column.prop"
  ...some_other_props
></el-table-column>
```

遇到这个错误后百思不得其解，起初怀疑是 table 没有正确挂载导致的，检查了一遍 columns 的生成流程，并没有发现问题。

然后又尝试向`v-memo`传入空数组，也不生效。

并且出现这个错误后页面会卡死。

检查了一遍文档，发现`v-memo`的用法是正确的，确实放在了`v-for`的同一级标签上，并且`v-memo`的参数是正确的。

那么问题到底是什么？？？

文档中的示例里提到了一句话：

> “当组件的 selected 状态改变，默认会重新创建大量的 vnode，尽管绝大部分都跟之前是一模一样的。v-memo 用在这里本质上是在说“只有当该项的被选中状态改变时才需要更新”。这使得每个选中状态没有变的项能完全重用之前的 vnode 并跳过差异比较。<span style="color: #0969DA">注意这里 memo 依赖数组中并不需要包含 item.id，因为 Vue 也会根据 item 的 :key 进行判断。<span>”

我注意到 key 上使用了一个表达式，于是手动将表达式改成了一个准确的值，也就是：

```html
<!-- 动态表头部分 -->
<el-table-column
  v-for="column in props.columns"
  :key="column.prop"
  这里手动修改了key的值
  v-memo="[column]"
  :label="column.label"
  :prop="column.property || column.prop"
  ...some_other_props
></el-table-column>
```

改成单个 key 值后问题就修复了，好奇是什么问题导致的，于是 debug 了一番，以下是根本原因。

我的模板代码中，`:key` 部分使用了`:key="column.prop || column.columnName"`，这意味着 vue 生成的代码是`_cached && _cached.key === column.prop || column.columnName && _isMemoSame(_cached, _memo)`，简化前三步表达式为`false && true || true`所以为`true`，执行到 vue3 内部的`isMemoSame`这个函数，那么它获取到的 cached 值为`undefined`，所以导致在 cached 中访问 memo 会报错。

经验结论：不要在`v-for`+`v-memo`的组合使用中为 key 添加会导致生成表达式报错的表达式。
