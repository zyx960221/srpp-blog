# 响应式系统（2）

## computed

> computed的定义：接受一个 getter 函数，返回一个只读的响应式 ref 对象。该 ref 通过 .value 暴露 getter 函数的返回值。它也可以接受一个带有 get 和 set 函数的对象来创建一个可写的 ref 对象。

在setup的日常使用中，希望一个在需要更新时才计算值，可以使用 computed。如果让我们自己来设计，computed应该是什么样子？

computed方法可以添加 `getter`，用来返回一个值。这个值只有在getter中的值更新时才会更新。

首先上一节我们实现了基础的响应系统，现在可以在调度器中添加 lazy 选项，用以控制computed的执行时机。

基于此我们可以先创建一个computed方法。

```javascript
function computed(getter) {
  // 我们需要触发effect，并将当前的getter作为依赖放进去执行。
  const effectFn = effect(getter, {
    lazy: true, // 但是我们在使用时，并不需要立即执行，而是在值发生变更时进行，所以在options中支持传入一个值，用来控制是否立即执行。
  });
  const obj = {
    // 读取值时执行effectFn
    get value() {
      return effectFn();
    },
  };
  return obj;
}
```

设计它的关键点在于，传递给effect的函数，会被作为依赖收集起来。那么这个函数就可以是一个getter。我还没有看到ref的实现，所以暂时先不考虑computed所返回的ref。

## watch

## 过期的副作用
