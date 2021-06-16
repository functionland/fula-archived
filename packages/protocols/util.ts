
export type Resolve<T> = (value?: T | PromiseLike<T>) => void;
type PromiseAndResolve<T> = [Promise<T>, Resolve<T>];

export function resolveLater<T = void>(): PromiseAndResolve<T> {
  let resolve;
  const promise = new Promise<T>(resolveCallback => {
    resolve = resolveCallback;
  });
  return [promise, resolve];
}

export function iterateLater<T>(): [
  AsyncIterable<T>,
  Resolve<T>,
  () => void
]  {
  const queue = [resolveLater<T>()];
  let resolveIndex = -1;
  let [nextAssigned, flagNextAssigned] = resolveLater<boolean>();
  const next: Resolve<T> = (value) => {
    const [[_, resolve]] = queue.slice(resolveIndex);
    resolve(value);
    queue.unshift(resolveLater<T>());
    flagNextAssigned(true);
    [nextAssigned, flagNextAssigned] = resolveLater<boolean>();
  };
  const iterate = async function * () {
    while (await nextAssigned || queue.length > 0) {
      const [nextValue] = queue.pop() as PromiseAndResolve<T>;
      yield await nextValue;
      resolveIndex--;
    }
  };
  const complete = () => {
    queue.shift();
    flagNextAssigned(false);
  };
  return [iterate(), next, complete];
}

interface ObservableLike<T> {
  subscribe(next: (value?: T) => void, error: (error: any) => void, complete: () => void)
}

export function asyncIterableFromObservable<T>(observable: ObservableLike<T>) {
  const [iterable, next, complete] = iterateLater<T>();
  observable.subscribe(next, (error) => next(Promise.reject(error)), complete);
  return iterable;
}
