import test from 'tape';
import { resolveLater, toAsyncIterable, concurrently, iterateLater, partition } from '.';
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
  let current = 0;
  for await (const value of toAsyncIterable([0, 1, 2])) {
    t.equal(value, current++, 'T[] with multiple elements iterates');
  }
  current = 0;
  for await (const value of toAsyncIterable([Promise.resolve(0), 1, Promise.resolve(2)])) {
    t.equal(value, current++, '(Promise<T>| T)[] with multiple elements iterates');
  }
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
  next(0);
  next(1);
  next(2);
  complete();
  let current = 0;
  for await (const value of iterable) {
    t.equal(value, current++, `Pass ${current}`);
  }
});

const delay = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));
const passOnValueWithDelay = milliseconds => async value => delay(milliseconds).then(() => value);

const testIterateLaterWith = (scenario, getInflowDelay, getOutflowDelay, totalPasses) =>
  test(`iterateLater ${scenario}`, async t => {
    const [iterable, next, complete] = iterateLater();
    const fill = async () => {
      await pipeline(
        () => toAsyncIterable(Array.from(Array(totalPasses).keys())),
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
        t.equal(value, current++, `Pass ${current}`);
      }
    };
    await concurrently(fill, use);
  });

const randomDuration = () => Math.round(Math.random() * 40);

[
  ['slower inflow', () => 30, () => 10, 5],
  ['slower outflow', () => 10, () => 30, 15],
  ['random inflow/outflow speed', randomDuration, randomDuration, 50],
].map(args => testIterateLaterWith(...args));

// test('partition', async t => {
//   partition(42, toAsyncIterable([]))
// });
