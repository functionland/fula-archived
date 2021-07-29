import test from 'tape';
import { resolveLater } from '.';

test('resolve later', async t => {
  const [promise, resolve] = resolveLater();
  resolve(42);
  t.equal(await promise, 42);
  t.end();
});
