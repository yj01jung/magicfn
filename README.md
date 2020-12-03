# magicfn - adds some magic to function

### Features

- make any function as native function
- customize stringified content of any function
- pure js and tiny

```js
const fn = () => 1;

native(fn, 'hello'); // as native function
'' + fn === 'function hello() { [native code] }';
fn.name === 'hello';

custom(fn, 'int main() { printf("Hello, World!"); }'); // any custom contents
fn() === 1; // function is original
String(fn) === 'int main() { printf("Hello, World!"); }'; // it works

// other thing works well
fn.toString.toString() === 'function toString() { [native code] }';
```

### Requires

- WeakMap
- Proxy
- no other dependencies

###

### Documents

```ts
/**
 * Make any function as native function
 *
 * @param fn any function to mock as native
 * @param name new name, optional
 *
 * @example
 * const fn = () => 1;
 * native(fn, 'hello');
 * fn() === 1
 * "" + fn === 'function hello() { [native code] }'
 * fn.name === 'hello'
 *
 * fn.toString.toString.toString......toString()
 * === 'function toString() { [native code] }'
 *
 * (fn.toString === Function.prototype.toString) === true
 */
export declare function native<T extends Fn>(fn: T, name?: string): T;

/**
 * Rename a function
 * @param fn function to rename
 * @param name new name
 *
 * @example
 * rename(() => 1, 'one').name === 'one'
 */
export declare function rename<T extends Fn>(fn: T, name: string): T;

/**
 * Defines a custom string for a function
 * @param fn function to customize stringified result
 * @param str string
 *
 * @example
 * const fn = custom(() => 1, 'hello world');
 * fn() === 1
 * "" + fn === 'hello world'
 * fn.toString.toString() === 'function toString() { [native code] }'
 *
 * // this is applied for any other library or even developer tools
 * import serialize from "serialize-javascript"
 * serialize(fn) === 'hello world' // but this cannot evaled
 *
 * import puppeteer from "puppeteer"
 * const browser = await puppeteer.launch()
 * const page = await browser.newPage()
 *
 * await page.evaluate(
 *   custom(() => {}, `
 *     function hello() {
 *       alert('mocked function');
 *     }`
 *   )
 * );
 */
export declare function custom<T extends Fn>(fn: T, str: string): void;

/**
 * Revert changes to function
 * @param fn function to revert
 */
export declare function revert<T extends Fn>(fn: T): T;
```

### Limitation

- Modifys Function.prototype.toString (but no slowdown because hardly used)

- In Node, detection is available with utils.types.isProxy (in v8::Value::isProxy) <br/>
  Defined in https://github.com/nodejs/node/blob/master/src/node_types.cc

```c++
// line 42
#define V(type) \
  static void Is##type(const FunctionCallbackInfo<Value>& args) {             \
    args.GetReturnValue().Set(args[0]->Is##type());                           \
  }

  VALUE_METHOD_MAP(V)
#undef V

// line 70
#define V(type) env->SetMethodNoSideEffect(target,     \
                                           "is" #type, \
                                           Is##type);
  VALUE_METHOD_MAP(V)
#undef V

```
