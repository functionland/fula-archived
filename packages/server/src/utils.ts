export function resolveLater<T>(): [Promise<T>, (value?: T | PromiseLike<T>) => void] {
  let resolveCallback;
  const promise = new Promise<T>(resolve => {
    resolveCallback = resolve;
  });
  // eslint-disable-next-line
  // @ts-ignore
  return [promise, resolveCallback];
}
