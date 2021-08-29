async function _valueAt<T>(index: number, iterable: Iterable<T> | AsyncIterable<T>) {
  let current = 0;
  for await (const value of iterable) {
    if (current == index) return value;
    current++;
  }
  throw new ReferenceError(`Index ${index} not found in iterable`);
}

export function valueAt<T>(index: number): (iterable: Iterable<T> | AsyncIterable<T>) => T;
export function valueAt<T>(index: number, iterable: Iterable<T> | AsyncIterable<T>): Promise<T>;
export function valueAt<T>(index: number, iterable?: Iterable<T> | AsyncIterable<T>) {
  return iterable
    ? _valueAt(index, iterable)
    : (curriedIterable: Iterable<T> | AsyncIterable<T>) => _valueAt(index, curriedIterable);
}

export function firstValue<T>(): (iterable: Iterable<T> | AsyncIterable<T>) => Promise<T>;
export function firstValue<T>(iterable: Iterable<T> | AsyncIterable<T>): Promise<T>;
export function firstValue<T>(iterable?: Iterable<T> | AsyncIterable<T>) {
  return iterable ? valueAt(0, iterable) : valueAt(0);
}

async function _lastValue<T>(iterable: Iterable<T> | AsyncIterable<T>) {
  let value: T;
  let wasEmpty = true;
  for await (value of iterable) {
    wasEmpty = false;
  }
  if (!wasEmpty) {
    // @ts-ignore
    return value;
  }
  throw new ReferenceError('Cannot get last value of empty iterable');
}

export function lastValue<T>(): (iterable: Iterable<T> | AsyncIterable<T>) => Promise<T>;
export function lastValue<T>(iterable: Iterable<T> | AsyncIterable<T>): Promise<T>;
export function lastValue<T>(iterable?: Iterable<T> | AsyncIterable<T>) {
  return iterable
    ? _lastValue(iterable)
    : (curriedIterable: Iterable<T> | AsyncIterable<T>) => _lastValue(curriedIterable);
}
