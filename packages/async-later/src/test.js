import test from 'tape';
import { resolveLater, toAsyncIterable, callOnlyOnce } from '.';

test('resolveLater', async t => {
  const [promise, resolve] = resolveLater();
  resolve(42);
  t.equal(await promise, 42, 'Promise resolves');
});

test('toAsyncIterable', async t => {
  for await (const value of toAsyncIterable(42)) {
    t.equal(value, 42, 'T iterates');
  }
  for await (const value of toAsyncIterable(Promise.resolve(42))) {
    t.equal(value, 42, 'Promise<T> iterates');
  }
  for await (const value of toAsyncIterable([42])) {
    t.equal(value, 42, 'T[] with one element iterates');
  }
  for await (const value of toAsyncIterable([])) {
    t.fail('T[] with no element iterates');
  }
  let current = 1;
  for await (const value of toAsyncIterable([1, 2, 3])) {
    t.equal(value, current, 'T[] with multiple elements iterates');
    current++;
  }
  current = 1;
  for await (const value of toAsyncIterable([Promise.resolve(1), 2, Promise.resolve(3)])) {
    t.equal(value, current, '(Promise<T>| T)[] with multiple elements iterates');
    current++;
  }
});

test('callOnlyOnce', t => {
  let invokeTimes = 0;
  const fn = value => {
    invokeTimes++;
    return value;
  };
  const fnOnce = callOnlyOnce(fn);
  fnOnce(42);
  fnOnce(43);
  const value = fnOnce(44);
  t.equal(value, 43, 'Should return value of the first call');
  t.equal(invokeTimes, 1, 'Should be invoked only once despite multiple calls');
  t.end();
});
