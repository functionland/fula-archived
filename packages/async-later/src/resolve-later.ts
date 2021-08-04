import { Resolve } from '.';

export function resolveLater<T>(): [Promise<T>, Resolve<T>] {
  let resolve;
  const promise = new Promise<T>(resolveCallback => {
    resolve = resolveCallback;
  });
  return [promise, resolve];
}
