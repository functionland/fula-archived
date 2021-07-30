import test from 'tape';
import { resolveLater, toAsyncIterable, callOnlyOnce, concurrently, iterateLater } from '.';
import { pipeline, map, consume } from 'streaming-iterables';

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
    t.fail('T[] with no element should not iterate');
  }
  let current = 1;
  for await (const value of toAsyncIterable([1, 2, 3])) {
    t.equal(value, current, 'T[] with multiple elements iterates');
    current++;
  }
  current = 1;
  for await (const value of toAsyncIterable([Promise.resolve(1), 2, Promise.resolve(3)])) {
    t.equal(value, current++, '(Promise<T>| T)[] with multiple elements iterates');
  }
});

test('callOnlyOnce', async t => {
  let invokeTimes = 0;
  const fn = value => {
    invokeTimes++;
    return value;
  };
  const fnOnce = callOnlyOnce(fn);
  fnOnce(42);
  fnOnce(43);
  const value = fnOnce(44);
  t.equal(value, 42, 'Should return value of the first call');
  t.equal(invokeTimes, 1, 'Should have been invoked only once despite multiple calls');
});

test('iterateLater empty', async t => {
  const [iterable, _, complete] = iterateLater();
  complete();
  for await (const value of iterable) {
    t.fail('Empty iterable should not iterate');
  }
});

test('iterateLater single value', async t => {
  const [iterable, next, complete] = iterateLater();
  next(42);
  complete();
  for await (const value of iterable) {
    t.equal(value, 42);
  }
});

test('iterateLater simple', async t => {
  const [iterable, next, complete] = iterateLater();
  next(1);
  next(2);
  next(3);
  complete();
  let current = 1;
  for await (const value of iterable) {
    t.equal(value, current++);
  }
});

const delay = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));
const passOnValueWithDelay = milliseconds => async value => delay(milliseconds).then(() => value);

const testIterateLaterWith = (scenario, getInflowDelay, getOutflowDelay) =>
  test(`iterateLater ${scenario}`, async t => {
    const [iterable, next, complete] = iterateLater();
    const fill = async () => {
      await pipeline(
        () => toAsyncIterable([1, 2, 3, 4, 5]),
        map(passOnValueWithDelay(getInflowDelay())),
        map(next),
        consume
      );
      complete();
    };
    const use = async () => {
      let current = 0;
      for await (const value of iterable) {
        await delay(getOutflowDelay());
        t.equal(value, ++current, `Pass ${current}`);
      }
    };
    await concurrently(fill, use);
  });

const randomDuration = () => Math.round(Math.random() * 100);

[
  ['slow inflow', () => 100, () => 0],
  ['slow outflow', () => 0, () => 100],
  ['random inflow/outflow speed', randomDuration, randomDuration],
].map(args => testIterateLaterWith(...args));
