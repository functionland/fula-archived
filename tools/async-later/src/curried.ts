// Pending: https://stackoverflow.com/questions/68761267/capture-generic-type-of-passed-function-for-overloads-in-typescript
// TODO: refactor "./value.ts" with this when/if resolved

export function curried<TLeadingParameters extends any[], TLastParameter, TReturn>(
  fn: (...args: [...TLeadingParameters, TLastParameter]) => TReturn
) {
  return (...args: TLeadingParameters) =>
    (curried: TLastParameter) =>
      fn(...[...args, curried]);
}

type Leading<T extends any[]> = T extends [...infer I, infer _] ? I : never;
type Last<T extends any[]> = T extends [...infer _, infer I] ? I : never;

export function overloadWithCurried<F extends (...args) => any>(
  fn: F
): {
  (...args: Parameters<F>): ReturnType<F>;
  (...args: Leading<Parameters<F>>): (curried: Last<Parameters<F>>) => ReturnType<F>;
} {
  return (...args) =>
    args.length == fn.length - 1 ? curried => fn(...[...args, curried]) : fn(...args);
}

function a<T>(b: string, c: number, d: T[]) {
  return [b, c, ...d];
}

const b = curried(a)('hi', 42)([1, 2, 3]); // b: unknown[]
const c = curried(a)<number>('hi', 42)([1, 2, 3]);
// works, but needs the generic specified,
// these are to be used in pipeline:
// https://github.com/reconbot/streaming-iterables/blob/9199a03fcfd21c0c18a73f5f0d353f021465f31b/lib/pipeline.ts#L62
// so it's a hard sell to @reconbot
const d = overloadWithCurried(a)('hi', 42)([1, 2, 3]); // d: unknown[]
