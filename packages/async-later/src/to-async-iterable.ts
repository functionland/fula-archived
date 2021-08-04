import { ObservableLike, iterateLater } from '.';

export function asyncIterableFromObservable<T>(observable: ObservableLike<T>) {
  const [iterable, next, complete] = iterateLater<T>();
  observable.subscribe(next, error => next(Promise.reject(error)), complete);
  return iterable;
}

function _toAsyncIterable<T>(
  value: T | PromiseLike<T> | ObservableLike<T> | Iterable<PromiseLike<T> | T> | AsyncIterable<T>
): AsyncIterable<T> {
  if (typeof value[Symbol.asyncIterator] === 'function') return value as AsyncIterable<T>;

  if (typeof (value as ObservableLike<T>).subscribe === 'function')
    return asyncIterableFromObservable(value as ObservableLike<T>);

  let iterate: () => AsyncIterable<T>;
  if (typeof value[Symbol.iterator] === 'function') {
    iterate = async function* () {
      for (const element of value as Iterable<PromiseLike<T> | T>) {
        yield await element;
      }
    };
  } else {
    iterate = async function* () {
      yield (await value) as T | PromiseLike<T>;
    };
  }
  return iterate();
}

type ValueTypes<T> =
  | T
  | PromiseLike<T>
  | ObservableLike<T>
  | Iterable<PromiseLike<T> | T>
  | AsyncIterable<T>;

export function toAsyncIterable<T>(): (
  value: T | PromiseLike<T> | ObservableLike<T> | Iterable<PromiseLike<T> | T> | AsyncIterable<T>
) => AsyncIterable<T>;
export function toAsyncIterable<T>(): (
  value: T | PromiseLike<T> | ObservableLike<T> | Iterable<PromiseLike<T> | T> | AsyncIterable<T>
) => AsyncIterable<T>;
export function toAsyncIterable<T>(
  value?: ValueTypes<T>
): AsyncIterable<T> | ((value: ValueTypes<T>) => AsyncIterable<T>) {
  return typeof value === 'undefined'
    ? (curriedValue: ValueTypes<T>) => _toAsyncIterable(curriedValue)
    : _toAsyncIterable(value);
}
