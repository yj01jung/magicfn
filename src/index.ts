const hooks = new WeakMap<Function, string>();

const orig = Function.prototype.toString;
const mock = new Proxy(orig, {
  apply(_, t) {
    return hooks.get(t) || (orig.call(t) as string);
  },
});
// Function.prototype.toString is not well used so it is not a problem
Object.defineProperty(Function.prototype, 'toString', {
  value: mock,
  configurable: true,
  writable: true,
});

hooks.set(mock, `function toString() { [native code] }`); // this is important

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
export function native<T extends Fn>(fn: T, name?: string) {
  if (name) {
    Object.defineProperty(fn, 'name', {
      value: name,
      configurable: true,
    });
  }
  const str = `function ${name || fn.name}() { [native code] }`;
  hooks.set(fn, str);
  return fn;
}

/**
 * Rename a function
 * @param fn function to rename
 * @param name new name
 *
 * @example
 * rename(() => 1, 'one').name === 'one'
 */
export function rename<T extends Fn>(fn: T, name: string) {
  Object.defineProperty(fn, 'name', {
    value: name,
    configurable: true,
  });
  return fn;
}

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
export function custom<T extends Fn>(fn: T, str: string) {
  hooks.set(fn, str);
}

/**
 * Revert changes to function
 * @param fn function to revert
 */
export function revert<T extends Fn>(fn: T) {
  hooks.delete(fn);
  return fn;
}

type Fn = (...args: any) => any;
