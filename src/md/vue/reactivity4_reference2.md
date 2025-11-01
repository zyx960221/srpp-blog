# 非原始值的响应方案（2）

## reactive & shallowReactive

按照之前创建的`reactive`函数，因为我们并没有对响应的目标对象内嵌套的对象进行代理，所以是浅响应的。

```javascript
function reactive(obj) {
    return new Proxy(obj, {
        get(target, key) {
            if (key === 'raw') {
                return target
            }
            track(target, key)
            // 当获取属性时，直接返回属性值，而属性值如果是对象，当前是没有被代理的。
            return Reflect.get(target, key, receiver)
        }
    })
}

const obj = reactive({ foo: { bar: 1 } })

effect(() => {
    console.log(obj.foo.bar)
})

obj.foo.bar = 2 // 不会触发effect中的副作用函数
```

要解决它，只需要对Reflect.get()返回的对象进行`reactive`代理即可。然而并不是所有情况都需要深响应，所以vue提供了一个`shallowReactive`函数，只对对象的第一层属性进行代理。

```javascript
function reactive(obj) {
    return new Proxy(obj, {
        get(target, key, receiver) {
            if (key === 'raw') {
                return target
            }

            track(target, key)

            const res = Reflect.get(target, key, receiver)
            if (typeof res === 'object' && res !== null) {
                return reactive(res)
            }
            return res
        }
        // 省略其他拦截
    })
}

function createReactive(obj, isShallow = false) {
  return new Proxy(obj, {
    get(target, key, receiver) {
        if (key === 'raw') {
            return target
        }

        const res = Reflect.get(target, key, receiver)

        track(target, key)

        // 若为浅响应，则直接返回原始对象
        if (isShallow) {
            return res
        }

        // 若为深响应，则返回一个代理对象
        if (typeof res === 'object' && res !== null) {
            return reactive(res)
        }

        return res
    }
    // 省略其他拦截函数
  })
}

function reactive(obj) {
    return createReactive(obj, false)
}

function shallowReactive(obj) {
    return createReactive(obj, true)
}
```

## readonly & shallowReadonly

例如在props/inject的单向数据流场景下，不希望用户去修改值，同样也可以在以上的`shallowReactive`工厂函数的基础上进行扩展，再提供一个`isReadonly`函数，在`set`和`deleteProperty`这两种操作中，判断是否为只读对象，如果是则抛出警告并退出执行。

同样的，出于只读的原因，在副作用函数中读取只读属性时，只有`isReadonly`为false的对象才会被`track`函数跟踪副作用。

```javascript
// 深只读
const readOnly = (obj) => {
    // 会进到 if (typeof res === 'object' && res !== null) 部分
    return createReactive(obj, false, true)
}

// 浅只读
const shallowReadOnly = (obj) => {
    // 也就是直接返回了 Reflect.get(target, key)，没有进行递归
    return createReactive(obj, true/* shallow */, true)
}
```

浅只读和深只读的实现，根本区别在于是否对嵌套对象进行处理，也就是当isShallow为false时，代码执行到`createReactive`中的`if (typeof res === 'object' && res !== null)`部分进行处理。

```javascript
const createReactive = (obj, isShallow = false, isReadonly = false) => {
    /** 省略 */
    if (typeof res === 'object' && res !== null) {
        // isReadonly 为 true 时，返回深只读对象，这样就递归地使用了 readonly 函数
        return isReadonly ? readonly(res) : reactive(res)
    }
    /** 省略 */
}
```

# 代理数组
数组是一个对象，但数组这个对象的内部实现与普通对象不同，它是一种异质对象（异质对象相关定义可见上一篇），内部的\[\[DefineOwnProperty]]与Ordinary Object的相同内部方法实现不同。在对数组对象进行\[\[SET]]操作时，本质上是依赖于\[\[DefineOwnProperty]]方法，但\[\[DefineOwnProperty]]的实现形式和Ordinary Object不同。
[ECMA规范地址：10.4.2.1部分](https://262.ecma-international.org/12.0/index.html?_gl=1*1pwl27x*_ga*MTM0MDAyMDA1NS4xNzQ5MDUzNTc1*_ga_TDCK4DWEPP*czE3NDkwNTM1NzQkbzEkZzAkdDE3NDkwNTM1NzQkajYwJGwwJGgw#sec-ordinary-and-exotic-objects-behaviours)

**GET 数组所有的读取操作如下：**

1. 通过索引访问数组元素：`arr[0]`；
2. 访问数组长度属性：`arr.length`；
3. 将数组当成对象遍历：`for...in`；
4. 使用`for...of`遍历数组元素；
5. 数组的各类原型方法：不更改数组自身的方法。

**SET 对数组元素或属性的设置操作如下：**

1. 通过索引设置数组元素：`arr[0] = 1`；
2. 修改数组长度属性：`arr.length = 1`；
3. 数组的栈方法：`push`、`pop`、`shift`、`unshift`；
4. 修改原数组的原型方法：`sort`、`fill`、`splice`等。

在设置一个新的索引位置的数组元素时，数组的length属性将被隐性触发更新。这意味着在设计时需要考虑length相关的副作用更新，那么在set中设置“SET”或“ADD”操作时，需要考虑数组的length是否发生了变化，以确认是“SET”操作还是“ADD”操作。

```javascript
function createReactive(obj, isShallow = false, isReadonly = false) {
    return new Proxy(obj, {
        set(target, key, newVal, receiver) {
            if (isReadonly) {
                console.warn(`属性${key}是只读的`)
                return true
            }
            const oldVal = target[key]
            // 若属性不存在则为新增，否则为修改
            const type = Array.isArray(target) ? Number(key) < target.length ? 'SET' : 'ADD' : Object.prototype.hasOwnProperty.call(target, key) ? 'SET' : 'ADD'

            const result = Reflect.set(target, key, newVal, receiver)

            if (target === receiver.raw) {
                if (oldVal !== newVal && (oldVal === oldVal || newVal === newVal)) {
                    // 将新值也给过去，当修改 length 属性值时，只有那些索引值大于或等于新的 length 属性值的元素才需要触发响应。
                    trigger(target, key, type, newVal)
                    // 在下面的代码块补充 trigger 的相关副作用触发
                }
            }

            return result
        }
        /** 省略其他拦截函数 */
    })
}
```

相应的，在增加了参数的`trigger`函数中：

```javascript
// trigger 函数中也需要加上新值作为参数
function trigger(target, key, type, newVal) {
    const depsMap = bucket.get(target)
    if (!depsMap) return
    /** 省略其他逻辑 */

    // 当操作类型为ADD 且 target为数组时，需要触发 length 相关的副作用
    if (type === 'ADD' && Array.isArray(target)) {
        const lengthEffects = depsMap.get('length')
        // 将副作用函数添加到 effectsToRun 中待执行
        lengthEffects && lengthEffects.forEach(effectFn => {
            if (effectFn !== activeEffect) {
                effectsToRun.add(effectFn)
            }
        })
    }

    // 操作目标为数组，并且修改的是数组的length属性
    if (isArray(target) && key === 'length') {
        // 对于索引大于或等于新的 length 值的元素。
        // 需要把所有相关联的 effectFn 都取出并添加到 effectsToRun 执行
        depsMap.forEach((effects, depsMapKey) => {
            if (depsMapKey >= newVal) {
                effects.forEach(effectFn => {
                    if (effectFn !== activeEffect) {
                        effectsToRun.add(effectFn)
                    }
                })
            }
        })
    }

    effectToRun.forEach(effectFn => {
        if (effectFn.options.scheduler) {
            effectFn.options.scheduler(effectFn)
        } else {
            effectFn()
        }
    })

}
```
## 遍历数组

作者在这里提到了`for...in`的方式来遍历数组，而数组和普通对象的不同仅在于对内部方法[\[DefineOwnProperty]]的实现上，所以它和普通对象的`for...in`使用是一样的，即列举出所有可枚举的属性。它使用的是属性枚举而不是数组的迭代器，我认为严格来讲它不算遍历数组，而是说`for...in`会列举出数组中包含数组索引和在它原型链上所有可枚举的属性。并且根据ECMAScript规范，其并未定义`for...in`的数组列举顺序，所以不一定按照数组下标进行，这是有风险的。

但依然要为此种情况做拦截，因此同样可以用Proxy中的`ownKeys`拦截函数。

数组不是对象，在数组的情况下，作者提出这样的问题：当一个数组被`for...in`列举时，哪些操作会影响循环对数组的列举？
答案：更改了length属性，则会影响循环（次数）。

* 添加新元素：arr[n] = val
* 修改数组长度：arr.length = n


```javascript
function createReactive(obj, isShallow = false, isReadonly = false) {
    return new Proxy(target, {
        /* 省略其他拦截 */
        ownKeys(target) {
            // 如果操作目标对象是数组，则调用track函数追踪数组的长度属性，而非索引属性
            track(target, Array.isArray(target) ? 'length' : ITERATE_KEY)
            return Reflect.ownKeys(target)
        }
    })
}
```

接下来是`for...of`的情况，`for...of`的遍历对象是实现了@@iterator方法的可迭代对象（iterable object）。

@@[name] 标志在 ECMAScript 规范里用来代指 JavaScript 内建的 symbols 值，例如 @@iterator 指的就是 Symbol.iterator 这个值。如果一个对象实现了 Symbol.iterator 方法，那么这个对象就是可以迭代的。


```javascript
const obj = {
    val: 0,
    /* 说实话，实际工作中没有用过[Symbol.iterator]这种设置内部方法的手段 */
    [Symbol.iterator] () {
        return {
            next() {
                return {
                    value: obj.val++ + 2,
                    done: obj.val > 50 ? true : false
                }
            }
        }
    }
}

for (const i of obj) {
    console.log(i);
    // 从2开始依次递增
}
```