export type Resolve<T> = (value?: T | PromiseLike<T>) => void;

export interface ObservableLike<T> {
  subscribe(next: (value?: T) => void, error: (error: any) => void, complete: () => void);
}

export * from './resolve-later';
export * from './iterate-later';
export * from './to-async-iterable';
export * from './partition';
export * from './value';
export * from './concurrently';
