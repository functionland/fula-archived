import { iterateLater } from '.';

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
