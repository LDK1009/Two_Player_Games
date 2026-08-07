import assert from 'node:assert/strict';
import test from 'node:test';

import { advanceCountdown } from './countdown';

test('카운트다운은 1씩 감소한다', () => {
  assert.equal(advanceCountdown(3), 2);
  assert.equal(advanceCountdown(1), 0);
});

test('카운트다운은 음수가 되지 않는다', () => {
  assert.equal(advanceCountdown(0), 0);
  assert.equal(advanceCountdown(-1), 0);
});
