import { Resolve, resolveLater } from '.';

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
