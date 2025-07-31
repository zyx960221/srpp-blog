let activeEffect; // 当前执行的副作用函数
const effectStack = []; // 待执行副作用函数栈的队列
const bucket = new WeakMap(); // 用来收集副作用的桶
const ITERATE_KEY = Symbol() // 迭代内部KEY

// 分支切换时，避免副作用产生遗留
function cleanup(fn) {
  for (let i = 0; i < fn.deps.length; i++) {
    const deps = fn.deps[i];
    deps.delete(fn);
  }
  fn.deps.length = 0;
}

// 副作用执行容器函数
function effect(fn, options = {}) {
  const effectFn = () => {
    cleanup(effectFn);
    activeEffect = effectFn;
    effectStack.push(effectFn); // 压入栈
    fn(); // 执行
    effectStack.pop(); // 弹出栈
    activeEffect = effectStack[effectStack.length - 1]; // 还原activeEffect
  };
  effectFn.options = options;
  effectFn.deps = [];
  effectFn();
}

// get 收集依赖
function track(target, key) {
  if (!activeEffect) return;
  let depsMap = bucket.get(target);
  if (!depsMap) {
    bucket.set(target, (depsMap = new Map()));
  }
  let deps = depsMap.get(key);
  if (!deps) {
    depsMap.set(key, (deps = new Set()));
  }
  deps.add(activeEffect);
  activeEffect.deps.push(deps);
}

// set 触发副作用函数
function trigger(target, key) {
  const depsMap = bucket.get(target);
  if (!depsMap) return;
  const effects = depsMap.get(key);
  const iterateEffects = depsMap.get(ITERATE_KEY); // 添加对ITERATE_KEY的依赖
  const effectsToRun = new Set(); // 避免增删set元素导致的无限调用
  effects &&
    effects.forEach((fn) => {
      if (fn !== activeEffect) {
        effectsToRun.add(fn);
      }
    });
  // 触发iterateEffects
  iterateEffects &&
    iterateEffects.forEach((fn) => {
      if (fn !== activeEffect) {
        effectsToRun.add(fn);
      }
    });
  effectsToRun.forEach((fn) => {
    if (fn.options.scheduler) {
      fn.options.scheduler(fn);
    } else {
      fn();
    }
  });
}

const obj = { foo: 1 }
const objProxy = new Proxy(obj, {
  get(target, key, receiver) {
    track(target, key)
    return Reflect.get(target, key, receiver)
  },
  set(target, key, value, receiver) {
    const result = Reflect.set(target, key, value, receiver)
    trigger(target, key)
    return result
  },
  // 拦截 in
  has(target, key) {
    return Reflect.has(target, key)
  },
  // 拦截for in
  ownKeys(target) {
    // 把副作用和ITERATE_KEY关联
    track(target, ITERATE_KEY)
    // 查阅14.7.5.6 ForIn/OfHeadEvaluation 中 EnumerateObjectProperties
    // 查阅14.7.5.9 EnumerateObjectProperties的具体实现 https://262.ecma-international.org/12.0/index.html?_gl=1*1pwl27x*_ga*MTM0MDAyMDA1NS4xNzQ5MDUzNTc1*_ga_TDCK4DWEPP*czE3NDkwNTM1NzQkbzEkZzAkdDE3NDkwNTM1NzQkajYwJGwwJGgw#sec-ecmascript-language-statements-and-declarations
    return Reflect.ownKeys(target)
  }
})