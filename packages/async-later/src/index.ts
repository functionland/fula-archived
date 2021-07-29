export type Resolve<T> = (value?: T | PromiseLike<T>) => void;

export function resolveLater<T>(): [Promise<T>, Resolve<T>] {
  let resolve;
  const promise = new Promise<T>(resolveCallback => {
    resolve = resolveCallback;
  });
  return [promise, resolve];
}

export function toAsyncIterable<T>(
  value: T | Promise<T> | T[] | (Promise<T> | T)[]
): AsyncIterable<T> {
  let iterate: () => AsyncIterable<T>;
  if (Array.isArray(value)) {
    iterate = async function* () {
      for (const element of value) {
        yield await element;
      }
    };
  } else {
    iterate = async function* () {
      yield await value;
    };
  }
  return iterate();
}

export function callOnlyOnce<V>(fn: (...args) => V) {
  let invoked = false;
  let result: V;
  return (...args) => {
    if (!invoked) {
      result = fn(...args);
      invoked = true;
    }
    return result;
  };
}

export function resolveLaterMutablePromiseLike<T>(): [PromiseLike<T>, Resolve<T>] {
  let value;
  const resolve: Resolve<T> = newValue => {
    value = newValue;
  };
  const promiseLike: PromiseLike<T> = {
    then: async callback => (callback ? callback(await value) : value),
  };
  return [promiseLike, resolve];
}

export function iterateLater<T>(): [AsyncIterable<T>, Resolve<T>, () => void] {
  const queue = [resolveLater<T>()];
  let resolveIndex = -1;
  const [nextAssigned, flagNextAssigned] = resolveLaterMutablePromiseLike<boolean>();
  const next: Resolve<T> = value => {
    const [[_, resolve]] = queue.slice(resolveIndex);
    resolve(value);
    queue.unshift(resolveLater<T>());
    flagNextAssigned(true);
  };
  const iterate = async function* () {
    while ((await nextAssigned) || queue.length > 0) {
      console.log(queue);
      const [nextValue] = queue.pop() as [Promise<T>, Resolve<T>];
      yield await nextValue;
      resolveIndex--;
    }
  };
  const complete = () => {
    queue.shift();
    flagNextAssigned(false);
  };
  return [iterate(), next, callOnlyOnce(complete)];
}

interface ObservableLike<T> {
  subscribe(next: (value?: T) => void, error: (error: any) => void, complete: () => void);
}

export function asyncIterableFromObservable<T>(observable: ObservableLike<T>) {
  const [iterable, next, complete] = iterateLater<T>();
  observable.subscribe(next, error => next(Promise.reject(error)), complete);
  return iterable;
}

export function partition<T>(
  index: number,
  iterable: AsyncIterable<T>
): [AsyncIterable<T>, AsyncIterable<T>] {
  let current = 0;
  const [partitionFirst, nextFirst, completeFirst] = iterateLater<T>();
  const [partitionSecond, nextSecond, completeSecond] = iterateLater<T>();
  const iterate = async () => {
    for await (const value of iterable) {
      if (current == index) {
        completeFirst();
      }
      if (current < index) {
        nextFirst(value);
      } else {
        nextSecond(value);
      }
      current++;
    }
    completeFirst();
    completeSecond();
  };
  iterate();
  return [partitionFirst, partitionSecond];
}
