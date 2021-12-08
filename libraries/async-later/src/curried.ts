// Pending: https://stackoverflow.com/questions/68761267/capture-generic-type-of-passed-function-for-overloads-in-typescript
// TODO: refactor "./value.ts" with this when/if resolved

/* eslint-disable  @typescript-eslint/no-explicit-any */
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

