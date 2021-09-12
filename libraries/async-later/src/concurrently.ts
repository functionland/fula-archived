export async function concurrently<T>(...functions: (() => T | PromiseLike<T>)[]) {
  return Promise.all(functions.map(async fn => fn()));
}
