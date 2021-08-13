// Pending: https://stackoverflow.com/questions/68761267/capture-generic-type-of-passed-function-for-overloads-in-typescript
// TODO: refactor "./value.ts" with this when resolved

type Leading<T extends any[]> = T extends [...infer I, infer _] ? I : never;
type Last<T extends any[]> = T extends [...infer _, infer I] ? I : never;

export function curried<F extends (...args) => any>(
  fn: F
): {
  (...args: Parameters<F>): ReturnType<F>;
  (...args: Leading<Parameters<F>>): (curried: Last<Parameters<F>>) => ReturnType<F>;
} {
  return (...args) =>
    args.length == fn.length - 1
      ? curried => fn(...[...args, curried]) 
      : fn(...args);
}

// function a<T>(b: string, c: number, d: T[]) {
//   return [b, c, ...d];
// }

// const f = curried(a);

// f('hi', 42, [1, 2, 3]) // d: unknown[]
// f('hi', 42) // curried: unknown[]