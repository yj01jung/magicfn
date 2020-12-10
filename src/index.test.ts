import { native, custom, helper, revert } from './';
import * as util from 'util';

it('native works', () => {
  const fn = native(() => 1, 'hello');
  expect(fn.toString()).toBe(`function hello() { [native code] }`);
});

it('custom works', () => {
  const fn = custom(() => {}, "I'm not a function");
  expect(fn.toString()).toBe("I'm not a function");
});

it('helper works', () => {
  const fn = helper("I'm not a function");
  expect(fn.toString()).toBe("I'm not a function");
});

it('revert works', () => {
  const fn = revert(native(function hello() {}, 'hello'));
  expect(fn.toString()).toBe(`function hello() { }`);
});

it('other thing works', () => {
  expect(util.types.isProxy((() => 1).toString)).toBe(false);
  expect((() => 1).toString.toString()).toBe(
    `function toString() { [native code] }`
  );
  expect(native(() => 1, 'hello').toString).toStrictEqual(
    Function.prototype.toString.toString
  );
});
