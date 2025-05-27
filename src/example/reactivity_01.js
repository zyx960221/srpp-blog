let activeEffect; // 当前执行的副作用函数
const effectStack = []; // 待执行副作用函数栈的队列
const bucket = new WeakMap(); // 用来收集副作用的桶

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
  const effectsToRun = new Set(effects); // 避免增删set元素导致的无限调用
  effects &&
    effects.forEach((fn) => {
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

// 使用
const data = { testVal: 1, testVal2: 2, testSchedulerVal: 3 };
const obj = new Proxy(data, {
  // 拦截读取
  get(target, key) {
    track(target, key);
    return target[key];
  },
  // 拦截设置
  set(target, key, newVal) {
    target[key] = newVal;
    trigger(target, key);
  },
});

function testEffect2() {
  console.log("testEffect2 执行了");
  tempVal3 = obj.testVal2;
}

function testEffect1() {
  console.log("testEffect1 执行了");
  effect(testEffect2);
  tempVal2 = obj.testVal;
}

effect(testEffect1);

// 测试scheduler
const queue = new Set();
const p = Promise.resolve();

let isPending = false;
function flushJob() {
  if (isPending) return;
  isPending = true;
  p.then(() => {
    queue.forEach((job) => job());
  }).finally(() => {
    isPending = false;
  });
}

effect(
  () => {
    console.log(obj.testSchedulerVal);
  },
  {
    scheduler(fn) {
      queue.add(fn);
      flushJob();
    },
  },
);

obj.testSchedulerVal++;
obj.testSchedulerVal++;
