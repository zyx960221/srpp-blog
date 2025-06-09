let activeEffect // 当前执行的副作用函数
const effectStack = [] // 待执行副作用函数栈的队列
const bucket = new WeakMap() // 用来收集副作用的桶

// 分支切换时，避免副作用产生遗留
function cleanup (fn) {
  for (let i = 0; i < fn.deps.length; i++) {
   const deps = fn.deps[i]
   deps.delete(fn)
  }
  fn.deps.length = 0
}

// 副作用执行容器函数(之前的)
function effect (fn, options = {}) {
  const effectFn = () => {
     cleanup(effectFn)
     activeEffect = effectFn
     effectStack.push(effectFn) // 压入栈
     fn() // 执行
     effectStack.pop() // 弹出栈
     activeEffect = effectStack[effectStack.length - 1] // 还原activeEffect
  }
  effectFn.options = options
  effectFn.deps = []
  effectFn()
}

// 副作用执行容器函数（计算属性使用）
function effectForComputedAndWatch (fn, options = {}) {
  const effectFn = () => {
     cleanup(effectFn)
     activeEffect = effectFn
     effectStack.push(effectFn) // 压入栈
     const res = fn() // 执行
     effectStack.pop() // 弹出栈
     activeEffect = effectStack[effectStack.length - 1] // 还原activeEffect
     // 新增
     return res
  }
  effectFn.options = options
  effectFn.deps = []
  // 新增
  if (!options.lazy) {
    effectFn()
  }
  // 新增
  return effectFn
}

// get 收集依赖
function track (target, key) {
  if (!activeEffect) return
  let depsMap = bucket.get(target)
  if (!depsMap) {
    bucket.set(target, (depsMap = new Map()))
  }
  let deps = depsMap.get(key)
  if (!deps) {
    depsMap.set(key, (deps = new Set()))
  }
  deps.add(activeEffect)
  activeEffect.deps.push(deps)
}

// set 触发副作用函数
function trigger (target, key) {
  const depsMap = bucket.get(target)
  if (!depsMap) return
  const effects = depsMap.get(key)
  const effectsToRun = new Set(effects) // 避免增删set元素导致的无限调用
  effects && effects.forEach(fn => {
    if (fn !== activeEffect) {
      effectsToRun.add(fn)
    }
  })
  effectsToRun.forEach(fn => {
    if (fn.options.scheduler) {
      fn.options.scheduler(fn)
    } else {
      fn()
    }
  })
}

// 使用
const data = { testVal: 1, testVal2: 2, testSchedulerVal: 3 }
const obj = new Proxy(data, {
  // 拦截读取
  get(target, key) {
    track(target, key)
    return target[key]
  },
  // 拦截设置
  set(target, key, newVal) {
    target[key] = newVal
    trigger(target, key)
  }
})

// effect增加了lazy选项
// 以上为基本方法，接下来实现computed和watch

// computed的实现
function computed (getter) {
  let value // 缓存(为了解决重复计算值的问题)
  let dirty = true // 缓存开关

  const effectFn = effectForComputedAndWatch(getter, {
    lazy: true,
    scheduler () {
      dirty = true // (为了解决dirty开关的问题)
      trigger(obj, 'value') // (为了解决obj没有触发依赖的问题)
    }
  })

  const obj = {
    get value () {
        if (dirty) {
          value = effectFn()
          dirty = false
        }
        track(obj, 'value') // (为了解决obj没有收集依赖的问题)
        return value
    }
  }

  return obj
}

// 使用computed
const computedVal = computed(() => obj.testVal + obj.testVal2)
effect(() => {
  console.log('effect computedVal.value', computedVal.value)
})
console.log('computedVal.value', computedVal.value)
obj.testVal = 100
console.log('computedVal.value', computedVal.value)



// watch的实现
// 读取对象的所有属性，代替硬编码（仅限Object）
function traverse (value, seen = new Set()) {
    // 不是原始值或者已经读取过了
    if (typeof value !== 'object' || value === null || seen.has(value)) {
      return value
    }
    seen.add(value)
    for (const k in value) {
      // 读取
      traverse(value[k], seen)
    }

    return value
}

function watch (source, cb, options = {}) {
    let getter
    if (typeof source === 'function') {
      // 如果是函数，直接执行
      getter = source
    } else {
      // 如果是对象，读取对象的所有属性
      getter = () => traverse(source)
    }

  let newValue, oldValue
  let cleanup

  function onInvalidate (cb) {
    cleanup = effectFn()
    cb()
  }

  const job = () => {
    newValue = effectFn()
    if (cleanup) {
      cleanup()
    }
    cb(newValue, oldValue, onInvalidate)
    oldValue = newValue
  }

  const effectFn = effectForComputedAndWatch(
  () => getter(),
  {
      lazy: true,
      scheduler: () => {
        if (options.flush === 'post') {
          const p = Promise.resolve()
          p.then(job)
        } else {
          job()
        }
      }
    }
  )

  if (options.immediate) {
    job(newValue, oldValue)
  } else {
    // 这里不直接 effectFn() 的原因是需要初始化 oldValue ，手动调用一次，拿到旧值并建立依赖关系。
    oldValue = effectFn() // 这里的oldValue实际上是 initialValue
  }
}

// 使用watch示例
watch(() => obj.testVal, (newVal, oldVal) => {
  console.log('watch', newVal, oldVal)
})
obj.testVal = 200