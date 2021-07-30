export type Resolve<T> = (value?: T | PromiseLike<T>) => void;

export function resolveLater<T>(): [Promise<T>, Resolve<T>] {
  let resolve;
  const promise = new Promise<T>(resolveCallback => {
    resolve = resolveCallback;
  });
  return [promise, resolve];
}

export function toAsyncIterable<T>(value: T | Promise<T> | (Promise<T> | T)[]): AsyncIterable<T> {
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

export async function concurrently<T>(...functions: (() => T)[]) {
  return Promise.all(functions.map(async fn => fn()));
}

export function iterateLater<T>(): [AsyncIterable<T>, Resolve<T>, () => void] {
  let nextInLine = resolveLater<T>();
  const queue = [nextInLine];
  const completed: T = {} as T; // Marker
  const next: Resolve<T> = value => {
    const [_, resolve] = nextInLine;
    resolve(value);
    nextInLine = resolveLater<T>();
    queue.unshift(nextInLine);
  };
  const iterate = async function* () {
    while (queue.length > 0) {
      const [nextValue] = queue.pop() as [Promise<T>, Resolve<T>];
      if ((await nextValue) !== completed) yield nextValue;
      if (globalThis?.process?.env?.DEBUG) console.debug(`In queue: ${queue.length}`);
    }
  };
  const complete = () => {
    const [_, resolve] = nextInLine;
    resolve(completed);
  };
  return [iterate(), next, complete];
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
